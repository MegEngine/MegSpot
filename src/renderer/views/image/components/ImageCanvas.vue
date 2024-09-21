<template>
  <div :class="['image-canvas', { selected: selected }]" @click.stop>
    <div ref="header" class="header" flex="cross:center">
      <CoverMask :mask="maskDom" class="cover-mask">
        <HistContainer ref="hist-container" :index="index" @changeVisible="handleHistVisible" />
      </CoverMask>
      <el-tooltip placement="bottom" :open-delay="800">
        <span
          class="compare-name"
          flex-box="1"
          v-html="isCovering ? coverTitle + ` (${$t('image.covered')})` : getTitle"
        ></span>
        <div slot="content">
          {{ path }}
          <br />
          <br />
          <span class="size">{{ bitMap && bitMap.width }} x {{ bitMap && bitMap.height }}</span>
        </div>
      </el-tooltip>
      <!-- <div v-show="!isCovering" class="mode-selector" @click="setMode()">{{ mode }}</div> -->
      <div v-show="isCovering" class="mode-selector">{{ coverMode }}</div>
      <EffectPreview ref="effect-settings" :mode="mode" @change="changeCanvasStyle" @set-mode="setMode" />
    </div>
    <div ref="container" class="canvas-container" id="canvas-container" :style="canvasStyle">
      <OperationContainer
        id="canvas-container"
        ref="canvas-container"
        @drag="handleDrag"
        @zoom="handleZoom"
        @scrollEnd="handleZoomEnd"
        @click="handleClick"
        @dbclick="handleDbclick"
        @mouseMove="handleMove"
      >
        <div
          v-loading="loading"
          element-loading-background="rgba(0, 0, 0, 0)"
          class="canvas-item"
          :style="`width: ${_width}px; height: ${_height}px;`"
          @contextmenu.prevent
        >
          <ScaleEditor
            v-if="preference.showScale"
            class="scale-editor"
            :scale="imgScale"
            :scaleEditorVisible.sync="scaleEditorVisible"
          />
          <ZoomViewer
            v-if="triggerRGB"
            ref="zoom-viewer"
            :RGBAcolor.sync="RGBAcolor"
            :mousePos="mousePos"
            :mousePosInfo="mousePosInfo"
            :parentWidth="_width"
            :parentHeight="_height"
          />
          <canvas
            v-show="(!isCovering && mode === 'canvas') || (isCovering && coverMode === 'canvas')"
            ref="canvas"
            :width="_width"
            :height="_height"
          ></canvas>
          <img
            v-show="!isCovering && mode === 'image'"
            :src="imgPath"
            :style="
              (imagePosition
                ? `position: absolute; left: ${imagePosition.x}px; top: ${imagePosition.y}px; width: ${imagePosition.width}px; height: ${imagePosition.height}px;`
                : '') + `transform: rotate(${rotateDegree}deg) scale(${reverseScaleX}, ${reverseScaleY});` + effectStyle
            "
          />
          <img
            v-show="isCovering && coverMode === 'image'"
            :src="coverPath"
            :style="
              (imagePosition
                ? `position: absolute; left: ${imagePosition.x}px; top: ${imagePosition.y}px; width: ${imagePosition.width}px; height: ${imagePosition.height}px;`
                : '') + `transform: rotate(${rotateDegree}deg) scale(${reverseScaleX}, ${reverseScaleY});` + effectStyle
            "
          />
          <div v-if="triggerRGB || preference.showDot" ref="feedback" id="feedback" :style="feedbackStyle"></div>
          <div v-if="preference.showMousePos" v-show="mousePosInfo.x" class="mouse-position">
            <span>x={{ mousePosInfo.x.toFixed(2) }},y={{ mousePosInfo.y.toFixed(2) }}</span>
          </div>
        </div>
      </OperationContainer>
    </div>
  </div>
</template>
<script>
import fse from 'fs-extra'
import OperationContainer from '@/components/operation-container'
import HistContainer from '@/components/hist-container'
import CoverMask from '@/components/cover-mask'
import ScaleEditor from '@/components/scale-editor'
import ZoomViewer from '@/components/zoom-viewer'
import EffectPreview from '@/components/effect-preview'
import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('imageStore')
const { mapGetters: preferenceMapGetters } = createNamespacedHelpers('preferenceStore')
import { getImageUrlSyncNoCache } from '@/utils/image'
import { getOverlapRect } from '@/utils/canvas'
import { throttle, debounce } from '@/utils'
import { SCALE_CONSTANTS, DRAG_CONSTANTS } from '@/constants'
import chokidar from 'chokidar'
import { getFileName } from '@/filter/get-file-name'
import { decode, decodeImage, toRGBA8 } from 'utif2'
import { useWorker } from '@/utils/worker'

export default {
  components: {
    OperationContainer,
    HistContainer,
    CoverMask,
    ScaleEditor,
    EffectPreview,
    ZoomViewer
  },
  props: {
    index: {
      type: Number,
      default: 0
    },
    _width: {
      type: Number,
      default: 500
    },
    _height: {
      type: Number,
      default: 500
    },
    path: {
      type: String,
      default: ''
    },
    // name: {
    //   type: String,
    //   default: ''
    // },
    // imageData: {
    //   type: [Object, Blob],
    //   default: () => {}
    // },
    snapInfo: {
      type: Object,
      default: () => {}
    }
  },
  inject: ['getSnapshotMode'],
  data() {
    return {
      // 监听图像文件的变化,变化后自动刷新图像
      wacther: undefined,
      loading: false,
      ready: false,
      header: null,
      canvas: null,
      maskDom: undefined,
      currentHist: undefined,
      histImage: null,
      cs: null,
      image: {
        width: 0,
        height: 0
      },
      bitMap: null,
      imgMat: null,
      imgMatRequestId: null,
      imagePosition: null,
      cachedPositionData: null,
      imgScale: 'N/A',
      scaleEditorVisible: false,
      afterFullSize: false,
      selectedId: null,
      // 原图的mat 缓存用于便捷获取
      syncCanvasActions: [
        {
          event: 'imageCenter_resetCanvas',
          action: 'reset'
        },
        {
          event: 'imageCenter_rotate',
          action: 'rotate'
        },
        {
          event: 'imageCenter_reverse',
          action: 'reverse'
        }
      ],
      // 广播调度事件
      scheduleCanvasActions: [
        {
          event: 'image_broadcast',
          action: 'handleBroadcast'
        },
        {
          event: 'image_handleSelect',
          action: 'handleSelect'
        },
        {
          event: 'imageCenter_getSelectedPosition',
          action: 'getSelectedPosition'
        },
        {
          event: 'imageCenter_align',
          action: 'align'
        },
        {
          event: 'radius',
          action: 'setRadius'
        },
        {
          event: 'adjustLevels',
          action: 'adjustLevels'
        },
        {
          event: 'adjustGamma',
          action: 'adjustGamma'
        },
        {
          event: 'changeHistTypes',
          action: 'handleChangeHistTypes'
        },
        {
          event: 'cacheScale',
          action: 'cacheScale'
        },
        {
          event: 'resetZoom',
          action: 'resetZoom'
        },
        {
          event: 'setZoom',
          action: 'setZoom'
        }
      ],
      histVisible: true,
      triggerRGB: false,
      updateZoomViewer: null,
      radius: 10,
      RGBAcolor: {
        R: 0,
        G: 0,
        B: 0,
        A: 0
      },
      // 鼠标相对canvas的坐标
      mousePos: {
        x: 0,
        y: 0
      },
      // 鼠标相对图像的坐标
      mousePosInfo: {
        x: 0,
        y: 0
      },
      mode: 'image', // 'canvas' | 'image'
      isCovering: false,
      coverPath: '',
      coverTitle: '',
      coverMode: 'image',
      effectStyle: '',
      rotateDegree: 0,
      reverseScaleX: 1,
      reverseScaleY: 1
    }
  },
  computed: {
    ...mapGetters(['imageConfig', 'imageList']),
    ...preferenceMapGetters(['preference', 'colorLevelSetting']),
    snapshotMode() {
      return this.getSnapshotMode() || false
    },
    selected() {
      return this.path === this.selectedId
    },
    getTitle() {
      return this.preference.showTitle
        ? (this.selected ? `<span style='color: red'>(✔)</span>` : ``) + this.getName()
        : ' '
    },
    canvasStyle() {
      return this.preference.background.style
    },
    gammaData() {
      return this.preference.gamma
    },
    feedbackStyle() {
      const x = this.mousePos.x
      const y = this.mousePos.y
      return {
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: 'red',
        opacity: 0.5
      }
    },
    inputLevels: {
      get() {
        return this.colorLevelSetting.inputs
      },
      set(newVal) {
        this.setColorLevel({
          inputs: newVal
        })
      }
    },
    inputMidtonesData: {
      get() {
        return this.colorLevelSetting.inputMidtones
      },
      set(newVal) {
        this.setColorLevel({
          inputMidtones: newVal
        })
      }
    },
    outputLevels: {
      get() {
        return this.colorLevelSetting.outputs
      },
      set(newVal) {
        this.setColorLevel({
          outputs: newVal
        })
      }
    },
    imgScaleNum() {
      return !isNaN(this.imgScale) ? Number(this.imgScale) : 0
    },
    imgPath() {
      return getImageUrlSyncNoCache(this.path)
    }
  },
  async mounted() {
    this.header = this.$refs.header
    this.canvas = this.$refs.canvas
    this.initCanvas()
    this.initImage()
    this.listenEvents()
  },
  beforeDestroy() {
    this.removeEvents()
    if (this.imgMat) {
      this.imgMat?.delete()
      this.imgMat = null
    }
    this.bitMap && this.bitMap?.close()
    this.initFilters()
  },
  watch: {
    path: {
      handler: function (newVal, oldVal) {
        if (oldVal) {
          this.wacther && this.wacther.close()
        }
        if (newVal) {
          this.wacther = chokidar
            .watch(newVal, {
              // 持续监听
              persistent: true,
              // 忽略初始化的目录检测
              ignoreInitial: true,
              // 等待写入完成
              awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
              }
            })
            .on('change', (path, details) => {
              console.log('image--change', path, details)
              this.initImage(false)
            })
            .on('unlink', (path, details) => {
              console.log('image--remove', path, details)
              this.removeImages(path)
            })
        }
      },
      immediate: true
    },
    'imageConfig.smooth': {
      handler(newVal, oldVal) {
        this.setSmooth()
      },
      immediate: true
    },
    'preference.showRGBText': {
      handler(newVal, oldVal) {
        this.drawImage()
      }
    }
  },
  methods: {
    ...mapActions(['removeImages']),
    // 检查边界， 保证图像至少部分在canvas内(显示大小至少为当前图像大小的DRAG_CONSTANTS)
    checkBorder(transX, transY, _width, _height) {
      const cw = this._width,
        ch = this._height,
        iw = _width ?? this.imagePosition.width,
        ih = _height ?? this.imagePosition.height
      const constantsW = DRAG_CONSTANTS * (cw < iw ? cw : iw),
        constantsH = DRAG_CONSTANTS * (ch < ih ? ch : ih)

      let isFullFilled = transX <= constantsW && transY <= constantsH && transX + iw >= cw && transY + ih >= ch // 判断图像是否占据整个canvas
      if (isFullFilled) return true

      let isTooLeft = transX + iw < constantsW // 图像是否过于偏左
      let isTooRight = transX > cw - constantsW // 图像是否过于偏右
      let isTooTop = transY + ih < constantsH // 图像是否过于偏上
      let isTooBottom = transY > ch - constantsH // 图像是否过于偏下
      return !(isTooLeft || isTooRight || isTooTop || isTooBottom)
    },
    // 约束缩放，保证图像的宽(或高)不小于canvas宽(或高)的SCALE_CONSTANTS
    checkSize(transW, transH) {
      let isTooSmall = transW < this.canvas.width * SCALE_CONSTANTS || transH < this.canvas.height * SCALE_CONSTANTS
      if (this.afterFullSize && !isTooSmall) {
        this.afterFullSize = false
      }
      return this.afterFullSize || !isTooSmall
    },
    setCanvasStyle({ style }) {
      this.effectStyle = `filter: ${style}`
      this.canvas.style.filter = style
    },
    setSmooth() {
      if (this.cs) {
        this.cs.imageSmoothingEnabled = this.imageConfig.smooth
        this.reDraw()
      }
    },
    getSnapshot() {
      // 叠加显示时候 生成快照
      return {
        snapShot: this.canvas,
        title: this.getTitle,
        path: this.imgPath,
        mode: this.mode,
        hist: this.currentHist
      }
    },
    getName(filter = true) {
      return this.snapshotMode
        ? this.snapInfo.name
        : filter
        ? this.$options.filters.getFileName(this.path)
        : getFileName(this.path)
    },
    listenEvents() {
      // 广播调度事件
      this.scheduleCanvasActions.forEach((item) => {
        this.$bus.$on(item.event, this[item.action])
      })
      // 分发事件 执行各个子组件的方法 同步状态
      this.syncCanvasActions.forEach((item) => {
        this.$bus.$on(item.event, ({ name, data }) => {
          this.dispatchCanvasAction({ name, data })
        })
      })
      // 鼠标点击时隐藏编辑scale的输入框
      this.$refs.container.addEventListener(
        'click',
        () => {
          this.scaleEditorVisible = false
        },
        false
      )

      // 至多30FPS的频率来更新取色器画面
      this.updateZoomViewer = throttle(1000 / 30, function () {
        this.$refs['zoom-viewer']?.draw(...arguments)
      })
    },
    removeEvents() {
      this.scheduleCanvasActions.forEach((item) => {
        this.$bus.$off(item.event, this[item.action])
      })
      // 分发事件 执行各个子组件的方法 同步状态
      this.syncCanvasActions.forEach((item) => {
        this.$bus.$off(item.event, this[item.action])
      })
    },
    dispatchCanvasAction({ name, data }) {
      if (!this.selectedId || this.selectedId === this.path) {
        this[name](data)
      }
    },
    handleBroadcast({ name, data = { id: '' } }) {
      if (this.selectedId) {
        if (data.id === this.path || this.selectedId === this.path) {
          this[name](data)
        }
      } else {
        this[name](data)
      }
    },
    initHist(reGenerate = true, config = null) {
      return new Promise((resolve, reject) => {
        let mat
        const cv = this.$cv
        if (this.imgMat) {
          mat = this.imgMat.clone()
        } else if (cv && this.image?.width) {
          mat = cv.imread(this.image)
        }
        if (mat) {
          this.currentHist = reGenerate
            ? this.$refs['hist-container'].reGenerateHist(mat, config)
            : this.$refs['hist-container'].generateHist(mat, config)
          resolve()
        }
        return reject()
      })
    },
    handleChangeHistTypes(config) {
      this.$cv?.Mat && this.initHist(false, config)
      this.$refs['hist-container'].setVisible(true)
    },
    async initImageMat() {
      const cv = this.$cv
      if (this.imgMatRequestId) {
        cancelAnimationFrame(this.imgMatRequestId)
        this.imgMatRequestId = 0
      }
      if (cv && this.image?.width) {
        if (this.imgMat) {
          this.imgMat?.delete()
          this.imgMat = null
        }
        this.imgMat = cv.imread(this.image)
      } else {
        this.imgMatRequestId = requestAnimationFrame(this.initImageMat)
      }
    },
    async initBitMap(_imageData) {
      return new Promise(async (resolve) => {
        if (this.bitMap) {
          this.bitMap?.close()
          this.bitMap = null
        }
        const imageData = _imageData
          ? new ImageData(new Uint8ClampedArray(_imageData), this.image.width, this.image.height, {
              colorSpace: 'srgb'
            })
          : this.getImageData()
        this.bitMap = await createImageBitmap(imageData)
        useWorker(this.getName(false), 'all', imageData, this.$refs['effect-settings'].generateFilterParams({})).then(
          (res) => {
            this.bitMap && this.bitMap?.close()
            this.bitMap = null
            this.bitMap = res
            this.drawImage()
          }
        )
        resolve(this.bitMap)
      })
    },
    applyFilters(type, params) {
      if (!this.ready) {
        return
      }
      const imageData = this.getImageData()
      useWorker(this.getName(false), type, imageData, params).then((res) => {
        this.bitMap && this.bitMap?.close()
        this.bitMap = res
        this.drawImage()
      })
    },
    async adjustGamma({ parentId, ...params }) {
      const { gamma } = params
      if (!this.image || !gamma) {
        return
      }
      const settingRef = this.$refs['effect-settings']
      settingRef.generateFilterParams({ gamma })
      this.applyFilters('gamma', params)
    },
    async adjustLevels({ parentId, ...params }) {
      if (!this.image) {
        return
      }
      const settingRef = this.$refs['effect-settings']
      settingRef.generateFilterParams(params)
      this.applyFilters('level', params)
      // const preParams = settingRef.getParams()
      // if (parentId !== this.path && Object.keys(preParams).some(key => preParams[key] !== params[key])) {

      // }
      return
    },
    resolvePath() {
      return new Promise((resolve) => {
        if (this.snapshotMode) {
          fetch(this.path)
            .then(() => {
              resolve(this.path)
            })
            .catch((err) => {
              // TODO: A: reload后imageData为空，（从vuex）取imageData
              // B: 或退回文件浏览器页
              console.log(err)

              // method A
              // const path = URL.createObjectURL(
              //   new Blob([this.snapInfo.imageData])
              // );
              // this.image.src = path;

              // method B
              this.$router.push({
                path: '/image/index'
              })
            })
        } else {
          resolve(this.imgPath) //        'C:/Demo/1-1%20-%20副本.jpg'
        }
      })
    },
    async initFilters() {
      await useWorker(this.getName(false), 'initFilters')
    },
    getImageData(_img) {
      const img = _img ?? this.image
      if (!img) {
        return null
      }
      const _canvas = document.createElement('canvas')
      _canvas.width = img.width
      _canvas.height = img.height
      const _ctx = _canvas.getContext('2d')
      _ctx.drawImage(img, 0, 0)
      return _ctx.getImageData(0, 0, _canvas.width, _canvas.height)
    },
    async initImage(initPosition = true) {
      this.ready = false
      this.loading = true
      return new Promise(async (resolve, reject) => {
        if (/tiff?$/.test(this.path)) {
          const file = await fse.readFile(this.path)
          const arraybuffer = file.buffer
          const ifds = decode(arraybuffer)
          const ifd = ifds[0]
          decodeImage(file, ifd)
          const imageData = toRGBA8(ifd)
          this.image = new Image(ifd.width, ifd.height)
          await this.initBitMap(imageData)
          this.initImageMat()
          this.loading = false
          this.ready = true
          this.reDraw(initPosition)
          resolve()
        } else {
          this.image = new Image()
          this.image.onload = async () => {
            await this.initBitMap()
            this.initImageMat()
            this.loading = false
            this.ready = true
            this.reDraw(initPosition)
            resolve()
          }
          this.image.src = await this.resolvePath()
        }
      })
    },
    initCanvas() {
      this.cs = this.canvas?.getContext('2d')
      this.$nextTick(() => {
        this.cs.imageSmoothingEnabled = this.imageConfig.smooth
      })
    },
    // 供外部直接调用 待测试
    reMount() {
      this.initCanvas()
      this.initImage()
    },
    pickCanvasColor(x, y) {
      if (!this.cs) {
        console.log('this.cs')
        return null
      }

      const pixel = this.cs.getImageData(x, y, 1, 1)
      let [R, G, B, A] = pixel.data
      A = parseInt(A / 255)
      return {
        R,
        G,
        B,
        A,
        isBright: (0.299 * R + 0.587 * G + 0.114 * B) / 255 >= 0.8
      }
    },
    setMode(newMode) {
      this.mode = newMode || (this.mode === 'canvas' ? 'image' : 'canvas')
    },
    async drawRGBText() {
      const cv = this.$cv
      if (
        this.preference.showRGBText &&
        cv &&
        this.imgMat &&
        this.imagePosition &&
        this.image &&
        this.cs &&
        this.imgScaleNum >= 42
      ) {
        if (this.drawRGBTextReqId) {
          cancelAnimationFrame(this.drawRGBTextReqId)
          this.drawRGBTextReqId = null
        }

        const that = this
        this.drawRGBTextReqId = requestAnimationFrame(() => {
          const imgScaleNum = that.imgScaleNum
          const { x, y } = that.imagePosition

          const viewerRect = { x: 0, y: 0, width: that._width, height: that._height }
          const overlapRect = getOverlapRect(that.imagePosition, viewerRect)
          if (!overlapRect) {
            return
          }
          Object.assign(overlapRect, {
            x: Math.max(0, Math.floor((overlapRect.x - x) / imgScaleNum) - 1),
            y: Math.max(0, Math.floor((overlapRect.y - y) / imgScaleNum) - 1),
            width: Math.min(that.imgMat.cols, Math.ceil(overlapRect.width / imgScaleNum) + 1),
            height: Math.min(that.imgMat.rows, Math.ceil(overlapRect.height / imgScaleNum) + 1)
          })

          const fontSize = Math.floor((imgScaleNum * 0.8) / 3)
          const gap = 2
          const padding = (imgScaleNum - fontSize * 3 - gap * 2) / 2

          that.cs.restore()
          that.cs.save()
          that.cs.font = `bold ${fontSize}px Arial`
          that.cs.fillStyle = 'black'
          that.cs.textAlign = 'center'

          const rect = new cv.Rect(overlapRect.x, overlapRect.y, overlapRect.width, overlapRect.height)
          const roi = that.imgMat.roi(rect)
          const channelCount = that.imgMat.channels()

          const drawOffset1 = padding + fontSize
          const drawOffset2 = drawOffset1 + fontSize + gap
          const drawOffset3 = drawOffset2 + fontSize + gap

          for (let row = 0; row < roi.rows; row++) {
            for (let col = 0; col < roi.cols; col++) {
              let pixelValue = []
              for (let ch = 0; ch < channelCount; ch++) {
                pixelValue.push(roi.ucharPtr(row, col)[ch])
              }
              const [R, G, B] = pixelValue
              const isBright = (0.299 * R + 0.587 * G + 0.114 * B) / 255 >= 0.8
              that.cs.fillStyle = isBright ? 'black' : 'white'
              const _x = x + imgScaleNum * (overlapRect.x + col + 0.5)
              const _y = y + imgScaleNum * (overlapRect.y + row)
              !isNaN(R) && that.cs.fillText(`R: ${R}`, _x, _y + drawOffset1)
              !isNaN(G) && that.cs.fillText(`G: ${G}`, _x, _y + drawOffset2)
              !isNaN(B) && that.cs.fillText(`B: ${B}`, _x, _y + drawOffset3)
            }
          }
          that.cs.restore()
        })
      }
    },
    async drawImage(img = null) {
      let { x, y, width, height } = this.imagePosition || this.getImageInitPos(this.canvas, this.image)
      this.cs.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.cs.drawImage(img ?? this.bitMap, x, y, width, height)
      this.drawRGBText()
    },
    handleClick() {
      this.triggerRGB && this.$refs['zoom-viewer']?.copyColor()
    },
    handleDbclick() {
      if (!this.selected) {
        this.$bus.$emit('image_handleSelect', this.path)
      } else {
        this.$bus.$emit('image_handleSelect', null)
      }
    },
    handleSelect(selectedId) {
      this.selectedId = selectedId
    },
    handleHistVisible(visible) {
      this.broadCast({
        name: 'doHistVisible',
        data: { visible }
      })
    },
    doHistVisible({ visible }) {
      if (!visible) {
        this.$refs['hist-container'].setVisible(visible)
        return
      }

      this.$cv?.Mat &&
        this.initHist().then(() => {
          this.$refs['hist-container'].setVisible(visible)
        })
    },
    changeZoom(data) {
      console.log('changeZoom', data)
    },
    pickColor({ status }) {
      this.$refs['zoom-viewer']?.changeCanvas()
      this.triggerRGB = status
    },
    changeCanvasStyle(newStyle) {
      // FIXME: 具体的值没有被广播
      this.broadCast({
        name: 'setCanvasStyle',
        data: { style: newStyle }
      })
    },
    setRadius(radius) {
      this.radius = radius
    },
    handleMove: throttle(40, function (mousePos) {
      this.broadCast({
        name: 'doHandleMove',
        data: { mousePos }
      })
    }),
    doHandleMove(e) {
      let mousePos = undefined
      if (!e?.mousePos) {
        mousePos = this.mousePos
      } else {
        mousePos = e.mousePos
        this.mousePos = mousePos
      }
      this.preference.showMousePos && this.changeMousePosInfo(mousePos)
      this.preference.showScale && this.changeRGBA()
    },
    changeRGBA() {
      if (!this.triggerRGB) return

      this.updateZoomViewer && this.updateZoomViewer(this.bitMap, this.mousePosInfo)
    },
    changeMousePosInfo(mousePos) {
      if (isNaN(this.imagePosition?.x) || isNaN(this.imagePosition?.width)) {
        this.mousePosInfo = {
          x: 0,
          y: 0
        }
        return
      }
      const { x, y } = mousePos
      const { x: imageX, y: imageY, width, height } = this.imagePosition
      const isOutside = x < imageX || y < imageY || x > imageX + width || y > imageY + height
      const originWidth = this.image.width
      const originHeight = this.image.height
      if (!isOutside && originWidth && originHeight) {
        const posX = ((x - imageX) * originWidth) / width
        const posY = ((y - imageY) * originHeight) / height
        this.mousePosInfo = {
          x: Number(posX),
          y: Number(posY)
        }
      } else {
        this.mousePosInfo = {
          x: 0,
          y: 0
        }
      }
    },
    // 外部直接调用
    setCoverStatus({ snapShot, hist, mode, path, title }, status) {
      this.isCovering = status
      this.coverPath = path
      this.coverTitle = title
      this.coverMode = mode
      if (status) {
        this.cs.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.cs.drawImage(snapShot, 0, 0)
        if (this.$refs['hist-container'].visible) {
          this.maskDom = hist
        }
      } else {
        this.maskDom = null
        this.drawImage()
      }
    },
    async reset(val) {
      // this.rotateDegree = 0
      if (val) {
        let x = 0,
          y = 0
        let width = this.image.width
        let height = this.image.height
        this.afterFullSize = true
        this.imagePosition = { x, y, width, height }
        this.doZoomEnd()
        this.drawImage()
      } else {
        if (this.bitMap) {
          this.imagePosition = this.getImageInitPos(this.canvas, this.bitMap)
          this.doZoomEnd()
          this.drawImage()
        } else {
          this.initImage()
        }
      }
    },

    reDraw(init = false) {
      window.requestAnimationFrame(async () => {
        if (init) {
          if (this.snapshotMode) {
            this.imagePosition = this.snapshotModeInitPos()
          } else if (this.bitMap) {
            this.imagePosition = this.getImageInitPos(this.canvas, this.bitMap)
          } else {
            this.initImage()
          }
        }
        this.drawImage()
        this.doZoomEnd()
        this.$refs['hist-container'].visible && this.$cv?.Mat && this.initHist()
      })
    },
    snapshotModeInitPos() {
      const positionInfo = {}
      const { _width: snap_width, _height: snap_height, imagePosition } = this.snapInfo
      const { x, y, width, height } = imagePosition
      const base = this._width / this._height <= snap_width / snap_height ? '_width' : '_height'
      const baseLength = this.snapInfo[base] // _width or _height
      positionInfo.x = Number(x / baseLength) * this[base]
      positionInfo.y = Number(y / baseLength) * this[base]
      positionInfo.width = Number(width / baseLength) * this[base]
      positionInfo.height = Number(height / baseLength) * this[base]
      // console.log('snapshotModeInitPos', positionInfo);
      return positionInfo
    },
    getImageInitPos(canvas, image) {
      const cw = canvas.width
      const ch = canvas.height

      const iw = image.width
      const ih = image.height

      const canvasRadio = cw / ch
      const imageRadio = iw / ih

      let x = 0
      let y = 0
      let height = ch
      let width = cw

      if (canvasRadio > imageRadio) {
        //比较高，所以高占100%,宽居中
        width = canvas.height * imageRadio
        x = (canvas.width - width) / 2
      } else {
        //比较宽，所以宽占100%,高居中
        height = canvas.width / imageRadio
        y = (canvas.height - height) / 2
      }
      if (this.mode === 'image' && Math.abs((this.rotateDegree / 90)) % 2 === 1) {
        return {
          x: y,
          y: x,
          width: height,
          height: width
        }
      }
      return {
        x,
        y,
        width,
        height
      }
    },
    doDrag(data) {
      if (this.imagePosition == null) return
      let offset = data.offset
      let transX = this.imagePosition.x + offset.x
      let transY = this.imagePosition.y + offset.y
      // console.log('offset', offset)
      if (this.checkBorder(transX, transY)) {
        // 判断是否只在指定范围内拖动
        this.imagePosition.x = transX
        this.imagePosition.y = transY
        this.drawImage()
      }
    },
    // 判断图像是否占据整个canvas
    isFullFilled() {
      const cw = this.canvas.width,
        ch = this.canvas.height,
        iw = this.imagePosition.width,
        ih = this.imagePosition.height
      const constantsW = DRAG_CONSTANTS * iw,
        constantsH = DRAG_CONSTANTS * ih
      const { x: transX, y: transY } = this.imagePosition
      return transX <= constantsW && transY <= constantsH && transX + iw >= cw && transY + ih >= ch
    },
    /******************ScaleEditor START******************/
    cacheScale() {
      this.cachedPositionData = {
        scale: this.imgScale,
        imagePosition: { ...this.imagePosition }
      }
    },
    resetZoom() {
      const { scale, imagePosition } = this.cachedPositionData
      this.imagePosition = imagePosition
      this.cachedPositionData = {
        scale: scale,
        imagePosition: { ...imagePosition }
      }
      this.imgScale = scale
      this.drawImage()
    },
    setZoom({ newScale }) {
      if (newScale == this.imgScale) {
        this.imgScale = newScale // 必需, 触发scaleEditor组件更新
        return
      }
      if (isNaN(this.imgScale)) {
        return
      }
      const oldScale = Number(this.imgScale)
      const scaleRatio = newScale / oldScale
      // 默认从画布中心放大
      const position = { x: this.canvas.width / 2, y: this.canvas.height / 2 }
      // 画像不占据整个画布时，从画像中心放大
      // const isFullFilled = this.isFullFilled();
      // const position = isFullFilled
      //   ? { x: this.canvas.width / 2, y: this.canvas.height / 2 }
      //   : {
      //       x: (this.imagePosition.x + this.imagePosition.width) / 2,
      //       y: (this.imagePosition.y + this.imagePosition.height) / 2
      //     };
      this.doZoom({
        rate: scaleRatio,
        mousePos: position
      })
      this.imgScale = newScale
    },
    /******************ScaleEditor END******************/
    doZoom(data) {
      const { e, rate, mousePos } = data
      if (e?.ctrlKey || e?.altKey) {
        this.$refs['zoom-viewer']?.changeCanvas(rate > 1 ? 180 : 40)
        return
      }
      if (this.imagePosition == null) return
      let x = mousePos.x - (mousePos.x - this.imagePosition.x) * rate
      let y = mousePos.y - (mousePos.y - this.imagePosition.y) * rate
      let height = this.imagePosition.height * rate
      let width = this.imagePosition.width * rate
      // 缩小时才检查显示图片是否过小
      if ((rate > 1 || this.checkSize(width, height)) && this.checkBorder(x, y, width, height)) {
        this.imagePosition = {
          x,
          y,
          height,
          width
        }
        this.imgScale = 'N/A'
        this.doZoomEnd()
        this.drawImage()
      }
    },
    doZoomEnd() {
      this.imgScale = Number(this.imagePosition.width / this.bitMap.width).toFixed(2)
    },
    handleDrag(offset) {
      this.broadCast({
        name: 'doDrag',
        data: { offset: offset, id: this.path }
      })
    },
    handleZoom(e, rate, mousePos) {
      this.broadCast({
        name: 'doZoom',
        data: { e, rate: rate, mousePos: mousePos, id: this.path }
      })
    },
    handleZoomEnd() {
      this.imagePosition &&
        this.broadCast({
          name: 'doZoomEnd',
          data: {}
        })
    },
    broadCast({ name, data }) {
      if (!this.selected) {
        throttle(16, () => {
          this.$bus.$emit('image_broadcast', {
            name: name,
            data: data
          })
        })()
      } else {
        this[name](data)
      }
    },
    rotate(degree) {
      this.rotateDegree += degree
      let offscreenWidth = this.bitMap.height
      let offscreenHight = this.bitMap.width
      let offsreen = new OffscreenCanvas(offscreenWidth, offscreenHight)
      let offCtx = offsreen.getContext('2d')
      if (degree < 0) {
        offCtx.translate(0, this.bitMap.width)
        offCtx.rotate((-90 * Math.PI) / 180)
        if (this.mode !== 'image') {
          [this.imagePosition.width, this.imagePosition.height] = [this.imagePosition.height, this.imagePosition.width]
        }
      } else if (degree > 0) {
        offCtx.translate(this.bitMap.height, 0)
        offCtx.rotate((90 * Math.PI) / 180)
        if (this.mode !== 'image') {
          [this.imagePosition.width, this.imagePosition.height] = [this.imagePosition.height, this.imagePosition.width]
        }
      }
      offCtx.drawImage(this.bitMap, 0, 0)
      this.bitMap?.close()
      this.bitMap = offsreen.transferToImageBitmap()
      this.drawImage()
    },
    reverse(direction) {
      console.log('reverse', direction)
      let offscreenWidth = this.bitMap.width
      let offscreenHight = this.bitMap.height
      let offsreen = new OffscreenCanvas(offscreenWidth, offscreenHight)
      let offCtx = offsreen.getContext('2d')
      if (direction > 0) {
        //左右翻转
        offCtx.translate(this.bitMap.width, 0)
        offCtx.scale(-1, 1)
        this.reverseScaleX = -this.reverseScaleX
      } else if (direction < 0) {
        //上下翻转
        offCtx.translate(0, this.bitMap.height)
        offCtx.scale(1, -1)
        this.reverseScaleY = -this.reverseScaleY
      }
      offCtx.drawImage(this.bitMap, 0, 0)
      this.bitMap?.close()
      this.bitMap = offsreen.transferToImageBitmap()
      this.drawImage()
    },
    align({ name, data }) {
      const { beSameSize, position } = data
      if (this.selectedId || (!this.selectedId && this.path !== this.imageList[0])) {
        if (beSameSize) {
          let { x, y, width, height } = position
          this.imagePosition = { x, y, width, height }
          this.afterFullSize = true
          this.doZoomEnd()
        } else {
          this.imagePosition.x = position.x
          this.imagePosition.y = position.y
        }
        this.drawImage()
      }
    },
    getSelectedPosition(data, callback) {
      if (this.selected || this.path === this.selectedId || (!this.selectedId && this.path === this.imageList[0])) {
        callback({
          id: this.path,
          position: this.imagePosition
        })
      }
    }
  }
}
</script>
<style scoped lang="scss">
@import '@/styles/variables.scss';

.image-canvas {
  .header {
    height: 18px;
    line-height: 16px;
    background-color: #f6f6f6;
    padding-right: 10px;

    .mode-selector {
      width: 41px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 4px;
      padding: 0 2px;
      border: 1px solid gray;
      border-radius: 5px;
      font-size: 11px;
      color: gray;
      cursor: pointer;
    }
  }

  .canvas-container {
    .canvas-item {
      position: relative;
      width: 100%;
      height: 100%;

      // img {
      //   object-fit: contain;
      //   vertical-align: middle;
      // }

      ::v-deep {
        input,
        .el-input-group__append {
          border-radius: 0;
        }

        .el-input-group__append,
        .el-input-group__prepend {
          padding: 0 6px;

          &:hover {
            color: green;
          }
        }

        .el-input__inner {
          padding: 0 2px;
        }
      }

      .canvas {
        vertical-align: middle;
        font-size: 0;
      }

      /** default canvas background */
      // .canvas-style {
      //   background: #e3e7e9;
      //   background-image: linear-gradient(45deg, #f6fafc 25%, transparent 0),
      //     linear-gradient(45deg, transparent 75%, #f6fafc 0),
      //     linear-gradient(45deg, #f6fafc 25%, transparent 0),
      //     linear-gradient(45deg, transparent 75%, #f6fafc 0);
      //   background-position: 0 0, 10px 10px, 10px 10px, 20px 20px;
      //   background-size: 20px 20px;
      // }

      #feedback {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        z-index: 2;
        pointer-events: none;
        background-color: red;
        transform: translate(-50%, -50%);
      }

      .mouse-position {
        position: absolute;
        bottom: 4px;
        right: 5px;
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }
}
</style>
