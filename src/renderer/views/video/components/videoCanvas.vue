<template>
  <div :class="['image-canvas', { selected: selected }]" @click.stop>
    <div ref="header" :class="['header', selected ? 'selected-item' : '']" flex="main:justify cross:center">
      <div class="header-left" flex="cross:center" flex-box="0">
        <CoverMask :mask="maskDom" class="cover-mask">
          <HistContainer ref="hist-container" :index="index" @changeVisible="handleHistVisible" />
        </CoverMask>
        <div class="icon-btn-group" flex="main:justify cross:center">
          <el-button slot="reference" type="text" size="mini" @click="handleVideoSliderVisible" class="svg-container"
            :title="$t('video.processTip')">
            <svg-icon icon-class="video-bar" :title="$t('video.processTip')" />
          </el-button>
          <!-- 默认使用视频同步，不再单独播放、暂停单个视频； 可采用offset调整 -->
          <!-- <span v-show="videoSliderVisible" class="svg-containe" @click="executeAction(1)">
            <svg-icon :clicked="!allVideoPaused && !paused" icon-class="play" />
          </span>
          <span v-show="videoSliderVisible" class="svg-containe" @click="executeAction(0)">
            <svg-icon :clicked="allVideoPaused || paused" icon-class="pause" />
          </span> -->
        </div>
      </div>

      <el-tooltip v-if="!videoSliderVisible" placement="bottom" :open-delay="800">
        <span class="compare-name" flex-box="1" v-html="getTitle"></span>
        <div slot="content">
          <div>
            {{ path }}
          </div>
          <br />
          <div>
            <div style="float: left">
              <span class="size">{{ bitMap && bitMap.width }} x {{ bitMap && bitMap.height }}</span>
              &nbsp;&nbsp;
              <span class="duration">{{ formatTime() }}</span>
            </div>
            &nbsp;&nbsp;
            <span style="float: right" class="frame" v-html="formatMediaInfo"></span>
          </div>
        </div>
      </el-tooltip>
      <div v-else flex="cross:center" flex-box="0">
        <el-button :disabled="!previousFrameAvailable" type="text" size="mini" class="svg-container"
          :title="$t('imageCenter.previousFrame')" @click="changeFrame(-1)">
          <svg-icon icon-class="frame" />
        </el-button>
        <el-button :disabled="!nextFrameAvailable" type="text" size="mini" class="svg-container"
          :title="$t('imageCenter.nextFrame')" @click="changeFrame(1)" style="margin-left: 0">
          <svg-icon icon-class="frame" style="transform: rotate(180deg)" />
        </el-button>
      </div>

      <div v-show="videoSliderVisible" class="progress-container" flex="main:center cross:center" flex-box="1">
        <video-slider :value="displayTimestamp" :max="duration / frameChangeRate"
          @update="changeVideoTime"></video-slider>
      </div>

      <div class="header-right" flex="main:right cross:center" flex-box="0">
        <div v-show="videoSliderVisible" class="video-tool" flex="cross:center">
          <input :value="displayTimestamp.toFixed(2)" @change="changeVideoTime" class="time-input" />
          <FrameSetting :path="path" :frameRate.sync="frameRate" :frameCount.sync="frameCount"
            :displayedFrames="displayedFrames" :displayedFramesInSecond="displayedFramesInSecond"
            @update="handleUpdateMediaInfo">
            <div class="frames" flex="main:center cross:center">
              <span class="frame-text ellipsis">{{ displayedFrames }}</span>
            </div>
          </FrameSetting>
        </div>
        <EffectPreview ref="effect-settings" @change="changeCanvasStyle" />
        <span class="svg-container" @click="fullScreen" :title="$t('video.fullscreen')" style="cursor: pointer">
          <svg-icon icon-class="fullscreen" />
        </span>
      </div>
    </div>
    <div ref="container" class="canvas-container" id="canvas-container" :style="canvasStyle">
      <OperationContainer id="canvas-container" ref="canvas-container" @drag="handleDrag" @zoom="handleZoom"
        @scrollEnd="handleZoomEnd" @click="handleClick" @dbclick="handleDbclick" @mouseMove="handleMove">
        <div v-loading="loading" element-loading-background="rgba(0, 0, 0, 0)" class="canvas-item" @contextmenu.prevent>
          <ScaleEditor v-if="preference.showScale" class="scale-editor" :scale="imgScale"
            :scaleEditorVisible.sync="scaleEditorVisible" />
          <ZoomViewer v-if="triggerRGB" ref="zoom-viewer" :RGBAcolor.sync="RGBAcolor" :mousePos="mousePos"
            :parentWidth="_width" :parentHeight="_height" />
          <canvas ref="canvas" :width="_width" :height="_height"></canvas>
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
import Vue from 'vue'
const cv = Vue.prototype.$cv
import OperationContainer from '@/components/operation-container'
import HistContainer from '@/components/hist-container'
import CoverMask from '@/components/cover-mask'
import VideoSlider from './slider.vue'
import ScaleEditor from '@/components/scale-editor'
import EffectPreview from '@/components/effect-preview'
import ZoomViewer from '@/components/zoom-viewer'
import FrameSetting from './frameSetting.vue'
import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('videoStore')
const { mapGetters: preferenceMapGetters } = createNamespacedHelpers('preferenceStore')
import { getImageUrlSyncNoCache } from '@/utils/image'
import { SCALE_CONSTANTS, DRAG_CONSTANTS } from '@/constants'
import chokidar from 'chokidar'
import * as CONSTANTS from '../video-constants'
import { getFileName } from '@/filter/get-file-name'
import { TimeManager } from '@/utils/video'
import { getOverlapRect } from '@/utils/canvas'
import { throttle, getUuidv4 } from '@/utils'
import { useWorker } from '@/utils/worker'

export default {
  components: {
    OperationContainer,
    HistContainer,
    CoverMask,
    ScaleEditor,
    EffectPreview,
    VideoSlider,
    FrameSetting,
    ZoomViewer
  },
  props: {
    index: {
      type: Number,
      default: 0
    },
    path: {
      type: String,
      default: ''
    },
    _width: {
      type: Number,
      default: 500
    },
    _height: {
      type: Number,
      default: 500
    },
    subVideoControlMenu: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 监听图像文件的变化,变化后自动刷新图像
      wacther: undefined,
      loading: false,
      ready: false,
      mediaInfo: {
        // FrameRate: 25,
        // frameCount: 1000
      },
      frameRate: 30,
      frameCount: 300,
      frameChangeRate: 1,
      header: null,
      canvas: null,
      video: null,
      timeConfig: null,
      requestId: undefined,
      duration: 60,
      currentTime: 0,
      videoSliderVisible: false,
      paused: true,
      maskDom: undefined,
      currentHist: undefined,
      snapShot: null,
      histImage: null,
      cs: null,
      image: {
        width: 0,
        height: 0
      },
      bitMap: null,
      imgMat: null,
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
          event: 'imageCenter_frameSteps',
          action: 'handleFrameSteps'
        },
        {
          event: 'radius',
          action: 'setRadius'
        },
        {
          event: CONSTANTS.BUS_VIDEO_COMPARE_ACTION,
          action: 'executeAction'
        },
        {
          event: 'changeLoop',
          action: 'changeLoop'
        },
        {
          event: 'videoResetTime',
          action: 'handleVideoResetTime'
        },
        {
          event: 'changeVideoSliderVisible',
          action: 'changeVideoSliderVisible'
        },
        {
          event: 'syncVideoTime',
          action: 'syncVideoTime'
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
        }
      ],
      histVisible: true,
      triggerRGB: false,
      radius: 10,
      offset: 0,
      RGBAcolor: {
        R: 0,
        G: 0,
        B: 0,
        A: 0
      },
      updateZoomViewer: null,
      // 鼠标相对canvas的坐标
      mousePos: {
        x: 0,
        y: 0
      },
      // 鼠标相对图像的坐标
      mousePosInfo: {
        x: 0,
        y: 0
      }
    }
  },
  computed: {
    ...mapGetters(['videoConfig', 'videoList']),
    ...preferenceMapGetters(['preference']),
    selected() {
      return this.path === this.selectedId
    },
    getTitle() {
      return this.preference.showTitle
        ? (this.selected ? `<span style='color: red'>(✔)</span>` : ``) + this.getName()
        : ' '
    },
    frameFrequency() {
      return 1 / this.frameRate
    },
    displayTimestamp() {
      return this.currentTime / this.frameChangeRate
    },
    millisecond() {
      return this.currentTime - Math.floor(this.currentTime)
    },
    displayedFrames() {
      return this.frameRate
        ? Math.min(Math.floor((this.currentTime / this.duration) * this.frameCount) + 1, this.frameCount)
        : 0
    },
    displayedFramesInSecond() {
      return this.frameRate
        ? this.displayedFrames - Math.floor((Math.floor(this.currentTime) / this.duration) * this.frameCount)
        : 0
    },
    previousFrameAvailable() {
      return this.paused && this.currentTime > 0
    },
    nextFrameAvailable() {
      return this.paused && this.currentTime < this.duration
    },
    canvasStyle() {
      return this.preference.background.style
    },
    // 是否所有视频都为暂停状态
    allVideoPaused() {
      return this.videoConfig.allVideoPaused
    },
    dynamicPickColor() {
      return this.videoConfig.dynamicPickColor
    },
    // 视频最小渲染间隔(默认为 0.01s)
    minRenderInterval() {
      return this.videoConfig.minRenderInterval
    },
    enableSyncTime() {
      return this.videoConfig.enableSyncTime
    },
    // 视频是否静音
    muted() {
      return this.videoConfig.muted
    },
    // 视频播放速度
    speed() {
      return this.videoConfig.speed
    },
    formatMediaInfo() {
      return `<span>${this.mediaInfo?.FrameRate ? this.frameRate + ' FPS' : '' || ''}</span>&nbsp;&nbsp;<span>${this.mediaInfo?.FrameCount ? this.frameCount + ' Frame' : ''
        }</span>`
    },
    feedbackStyle() {
      const x = this.mousePos.x
      const y = this.mousePos.y
      return {
        left: `${x}px`,
        top: `${y}px`,
        // backgroundColor: '#1067d1',
        backgroundColor: 'red',
        opacity: 0.5
      }
    },
    imgScaleNum() {
      return !isNaN(this.imgScale) ? Number(this.imgScale) : 0
    }
  },
  async mounted() {
    this.header = this.$refs.header
    this.canvas = this.$refs.canvas
    this.degree = 0
    this.initCanvas()
    this.listenEvents()
    await this.initVideo()
    this.startAnimation()
  },
  beforeDestroy() {
    this.removeEvents()
    this.stopAnimation()
    if (this.video) {
      if (this.video?.readyState >= 2 && !this.video.paused) {
        try {
          this.video.pause()
        } catch (e) {
          console.log(e)
        }
      }
      this.video.remove()
      this.video = null
    }
    if (this.imgMat) {
      this.imgMat?.delete()
      this.imgMat = null
    }
    this.bitMap && this.bitMap.close()
    // this.initFilters()
  },
  watch: {
    path: {
      handler: function (newVal, oldVal) {
        if (oldVal && newVal && oldVal !== newVal) {
          this.initVideo()
        }
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
              console.log('video--change', path, details)
              // this.initbitMap();
              // this.initImageMat()
              this.initVideo()
            })
            .on('unlink', (path, details) => {
              console.log('video--remove', path, details)
              this.removeVideos(path)
            })
        }
      },
      immediate: true
    },
    muted: {
      handler: function (newVal, oldVal) {
        if (newVal !== oldVal && this.video) {
          this.video.muted = newVal
        }
      }
    },
    speed: {
      handler: function (newVal, oldVal) {
        if (newVal !== oldVal && this.video) {
          this.video.defaultPlaybackRate = newVal
          this.video.playbackRate = newVal
        }
      }
    },
    'videoConfig.smooth': {
      handler(newVal, oldVal) {
        this.setSmooth()
      },
      immediate: true
    },
    frameRate(newRate) {
      if (!this.mediaInfo?.FrameRate) {
        return
      }
      const originFrameRate = Number(this.mediaInfo?.FrameRate)
      if (originFrameRate && newRate) {
        this.frameChangeRate = newRate / originFrameRate
        this.changeFrameUpdateFN()
      }

      // 至多(1000/newRate) FPS的频率来更新取色器画面
      this.updateZoomViewer = throttle(1000 / newRate, function () {
        this.$refs['zoom-viewer']?.draw(...arguments)
      })
    },
    'preference.showRGBText': {
      handler(newVal, oldVal) {
        this.drawImage()
      }
    }
  },
  methods: {
    changeFrame(step = 0) {
      const subTime = step * this.frameFrequency
      const nextTime = Math.min(Math.max(0, this.currentTime / this.frameChangeRate + subTime), this.duration)
      if (isNaN(nextTime)) {
        console.log('invalid nextFrame')
        return
      }
      // else if (nextTime === this.currentTime) {
      //   console.log('this is nextFrame', nextTime, this.currentTime)
      //   return
      // }
      if (this.paused) {
        this.changeVideoTime(nextTime)
      }
    },
    changeFrameUpdateFN(newCurrentTime) {
      this.timeConfig &&
        this.timeConfig.changeFn(({ position, ...rest }) => {
          const nextPosition = position * this.frameChangeRate + this.offset
          const vector = {
            ...rest,
            position: nextPosition
          }
          return vector
        })
    },
    handleUpdateFrame(newCurrentTime = null) {
      if (newCurrentTime) {
        this.currentTime = newCurrentTime
      } else if (this.video?.currentTime) {
        this.currentTime = this.video.currentTime
      }
      if (this.paused && this.video?.videoWidth) {
        this.initbitMap()
        this.initImageMat()
      } else {
        this.drawImage()
      }
    },
    handleUpdateMediaInfo(mediaInfo) {
      this.mediaInfo = mediaInfo
    },
    formatTime(time) {
      if (!time) {
        time = this.video?.duration || this.video?.currentTime
      }
      let seconds = Number(time).toFixed(4)
      var hours = Math.floor(seconds / 3600)
      seconds = seconds - hours * 3600
      var minutes = Math.floor(seconds / 60)
      seconds = /\d+.\d{2}/.exec(seconds - minutes * 60)

      return `${hours > 0 ? hours + 'h' : ''}${minutes > 0 ? minutes + 'm' : ''}${seconds > 0 ? seconds + 's' : ''}`
    },
    getName(filter = true) {
      return filter ? this.$options.filters.getFileName(this.path) : getFileName(this.path)
    },
    fullscreenHandler() {
      const fullscreenElement = document.fullscreenElement
      if (!fullscreenElement) {
        document.body.removeChild(this.video)
        document.removeEventListener('fullscreenchange', this.fullscreenHandler)
      }
    },
    fullScreen() {
      this.$emit('fullScreen')
      if (this.video.requestFullscreen) {
        document.body.appendChild(this.video)
        this.video.requestFullscreen()
        document.addEventListener('fullscreenchange', this.fullscreenHandler)
      }
    },
    ...mapActions(['removeVideos']),
    // 检查边界， 保证图像至少部分在canvas内(显示大小至少为当前图像大小的DRAG_CONSTANTS)
    checkBorder(transX, transY, _width, _height) {
      const cw = this._width,
        ch = this._height,
        iw = _width ?? this.imagePosition.width,
        ih = _height ?? this.imagePosition.height
      const constantsW = DRAG_CONSTANTS * (cw > iw ? cw : iw),
        constantsH = DRAG_CONSTANTS * (ch > ih ? ch : ih)

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
      let isTooSmall = transW < this.canvas.width * SCALE_CONSTANTS && transH < this.canvas.height * SCALE_CONSTANTS
      if (this.afterFullSize && !isTooSmall) {
        this.afterFullSize = false
      }
      return this.afterFullSize || !isTooSmall
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
    executeAction(action) {
      switch (action) {
        case 1:
        case CONSTANTS.VIDEO_STATUS_START:
          this.cs.restore()
          this.paused = false
          if (this.requestId == undefined) {
            this.startAnimation()
          }
          this.changeVideoSliderVisible({ value: true })
          break
        case 0:
        case CONSTANTS.VIDEO_STATUS_PAUSE:
          this.handleVideoPaused()
          break
        case -1:
        case CONSTANTS.VIDEO_STATUS_RESET:
          this.cs.restore()
          this.offset = 0
          this.currentTime = 0
          this.changeVideoTime(0)
          break
        default:
          console.error('unknown actions:' + action)
          break
      }
    },
    changeLoop(loop) {
      this.video.loop = loop
    },
    setCanvasStyle({ style }) {
      this.canvas.style.filter = style
    },
    setSmooth() {
      if (this.cs) {
        this.cs.imageSmoothingEnabled = this.videoConfig.smooth
        this.reDraw()
      }
    },
    getSnapshot() {
      // 叠加显示时候 生成快照
      return {
        snapShot: this.canvas,
        hist: this.currentHist
      }
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
      //TODO *.addEventListener('resize', this.handleResize, true);
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
    handleVideoPaused() {
      this.paused = true
      if (this.paused) {
        this.initbitMap()
        this.initImageMat()
      }
    },
    handleVideoResetTime() {
      // this.video.currentTime = 0
      // if (this.video.readyState >= 2 && this.video.paused) {
      //   this.video.play().catch((e) => {
      //     // console.log('error', e);
      //   })
      // }
    },
    syncVideoTime({ index, currentTime }) {
      this.index !== index && this.changeVideoTime(currentTime, true)
    },
    changeVideoTime(event, noEffect = false) {
      const currentTime = Number(event?.target?.value ?? event) * this.frameChangeRate
      this.enableSyncTime && !noEffect && this.$bus.$emit('syncVideoTime', {
        index: this.index,
        currentTime
      })
      if (!this.video || isNaN(currentTime)) return

      const timingObj = TimeManager.getTimingObj()
      const { position } = timingObj.query()

      // console.log(currentTime, this.video.currentTime, position)
      // 设置时间节点是否在视频时长范围之内
      if (currentTime < this.duration) {
        this.offset = currentTime - position
        // 比较当前时间和设置的时间差值 是否大于 视频最小渲染间隔(默认为0.01s)
        // if (Math.abs(this.video.currentTime - currentTime) >= this.minRenderInterval) {
        // this.video.currentTime = Number(currentTime).toFixed(5)
        // if (this.video.readyState  >= 2 ) {
        //   this.video
        //     .play()
        //     .then(() => {
        //       if (paused) {
        //         this.video.pause()
        //         this.handleVideoPaused()
        //       }
        //     })
        //     .catch((e) => {
        //       console.log('error', e)
        //     })
        // }
        // }
      } else {
        this.offset = this.duration - position
      }
      // console.log('offset', this.offset)
      this.changeFrameUpdateFN(currentTime)
      // this.initbitMap()
      // this.initImageMat()
    },
    handleBroadcast({ name, data = { id: null } }) {
      if (this.selectedId) {
        if (data.id === this.path || this.selectedId === this.path) {
          this[name](data)
        }
      } else {
        this[name](data)
      }
    },
    // 初始化bitMap
    async initbitMap(draw = true) {
      if (this.paused && this.video?.videoWidth) {
        this.ready = false
        let offscreen = new OffscreenCanvas(this.video.videoWidth, this.video.videoHeight)
        let offCtx = offscreen.getContext('2d')
        offCtx.drawImage(this.video, 0, 0)
        this.bitMap = offscreen.transferToImageBitmap()
        this.ready = true
        draw && this.drawImage(this.bitMap)
        this.$refs['hist-container'].visible && window.cv && this.generateHist()
        const imageData = this.getImageData()
        // console.log('imageDate initbitmap', imageData)
        // useWorker(this.getName(false), 'all', imageData, this.$refs['effect-settings'].generateFilterParams({})).then(
        //   (res) => {
        //     this.bitMap && this.bitMap?.close()
        //     this.bitMap = null
        //     this.bitMap = res
        //     this.drawImage()
        //   }
        // )
      }
    },
    initImage() {
      if (this.paused && this.video.videoWidth) {
        let offscreen = new OffscreenCanvas(this.video.videoWidth, this.video.videoHeight)
        let offCtx = offscreen.getContext('2d')
        offCtx.drawImage(this.video, 0, 0)
        const blob = offscreen.convertToBlob({ quality: 1 })
        return blob
      } else {
        console.error('【Video-initImage】 only enable when paused')
      }
    },
    getImageData(_img) {
      const img = _img ?? this.video
      if (!img) {
        return null
      }
      const _canvas = document.createElement('canvas')
      _canvas.width = img?.width || img?.videoWidth
      _canvas.height = img?.height || img?.videoHeight
      const _ctx = _canvas.getContext('2d')
      _ctx.drawImage(img, 0, 0)
      return _ctx.getImageData(0, 0, _canvas.width, _canvas.height)
    },
    async initFilters() {
      // await useWorker(this.getName(false), 'initFilters')
    },
    applyFilters(type, params) {
      if (this.paused && this.ready) {
        // const imageData = this.getImageData()
        // useWorker(this.getName(false), type, imageData, params).then((res) => {
        //   this.bitMap && this.bitMap?.close()
        //   this.bitMap = res
        //   this.drawImage()
        // })
      }
    },
    async adjustGamma({ parentId, ...params }) {
      const { gamma } = params
      if (!this.video || !gamma) {
        return
      }
      const settingRef = this.$refs['effect-settings']
      settingRef.generateFilterParams({ gamma })
      this.applyFilters('gamma', params)
    },
    async adjustLevels({ parentId, ...params }) {
      if (!this.video) {
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
    getVideoImageData() {
      const histCanvas = document.createElement('canvas')
      histCanvas.width = this.video.videoWidth
      histCanvas.height = this.video.videoHeight
      const histCanvasCtx = histCanvas.getContext('2d')
      histCanvasCtx.drawImage(this.video, 0, 0)
      const imgData = histCanvasCtx.getImageData(0, 0, histCanvas.width, histCanvas.height)
      return imgData
    },
    generateHist(reGenerate = true, config = null) {
      return new Promise((resolve, reject) => {
        try {
          let mat
          const cv = this.$cv
          if (this.imgMat) {
            mat = this.imgMat.clone()
          } else if (cv) {
            const imgData = this.getVideoImageData()
            mat = cv.matFromImageData(imgData)
          }
          if (mat) {
            this.currentHist = reGenerate
              ? this.$refs['hist-container'].reGenerateHist(mat, config)
              : this.$refs['hist-container'].generateHist(mat, config)
            resolve()
          }
        } catch (err) {
          console.log('err', err)
        }
      })
    },
    handleChangeHistTypes(config = null) {
      if (window.cv) {
        this.generateHist(false, config)
        this.$refs['hist-container'].setVisible(true)
      }
    },
    initCanvas() {
      this.cs = this.canvas.getContext('2d')
      this.cs.save()
      this.$nextTick(() => {
        this.cs.imageSmoothingEnabled = this.videoConfig.smooth
      })
    },
    initVideo() {
      return new Promise((resolve, reject) => {
        try {
          this.loading = true
          this.ready = false
          if (this.video) {
            // console.log(this.video)
            this.video.pause()
            this.video = null
          }
          this.video = document.createElement('video')

          this.video.addEventListener('ended', () => {
            this.currentTime = this.video.currentTime
            this.initbitMap()
            this.initImageMat()
            this.$emit('ended')
          })

          this.video.addEventListener('loadeddata', async () => {
            this.$emit('loaded')
            if (this.timeConfig) {
              this.timeConfig?.deleteFn()
              this.timeConfig = null
            }
            this.offset = 0
            this.timeConfig = TimeManager.setTime({
              id: `${this.path}?uid=${getUuidv4()}`,
              video: this.video,
              timingFn: ({ position, ...rest }) => {
                const nextPosition = position * this.frameChangeRate + this.offset
                const vector = {
                  ...rest,
                  position: nextPosition
                }
                return vector
              }
            })

            const render = (now, metadata) => {
              this.handleUpdateFrame()
              this.video.requestVideoFrameCallback(render)
            }
            this.video.requestVideoFrameCallback(render)
            // console.log('timeConfig ', this.timeConfig, TimeManager.gettimeConfigs())

            this.duration = isNaN(this.video.duration) ? 60 : Number(Number(this.video.duration).toFixed(5))

            if (this.imagePosition == undefined || isNaN(this.imagePosition?.height)) {
              this.imagePosition = this.getImageInitPos(this.canvas, this.video)
            }
            this.doZoomEnd()
            this.loading = false
            await this.initbitMap()
            this.initImageMat()
            this.reset()
            resolve()
          })
          // const updateTime = (now, metadata) => {
          //   if (!this.paused) {
          //     this.currentTime = metadata?.mediaTime || this.video.currentTime
          //   }
          //   this.video.requestVideoFrameCallback(updateTime)
          // }
          // this.video.requestVideoFrameCallback(updateTime)

          // this.video.addEventListener('timeupdate', () => {
          //   if (this.paused || !this.video) return
          //   this.currentTime = this.video.currentTime
          //   // console.log('currentTime', this.video.currentTime, this.currentTime);
          // })

          this.video.src = getImageUrlSyncNoCache(this.path)
          this.video.autoplay = true
          // 默认开启视频循环
          this.video.loop = false
          // 视频是否静音
          this.video.muted = this.muted
          // 视频播放速度
          this.video.defaultPlaybackRate = this.speed
          this.video.playbackRate = this.speed
        } catch (error) {
          console.error('init video error:', error)
          reject(error)
        }
      })
    },
    startAnimation(play = true) {
      this.stopAnimation()

      // const updateCanvas = (now, metadata) => {
      //   this.drawImage()
      //   this.video.requestVideoFrameCallback(updateCanvas)
      // }
      // this.video.requestVideoFrameCallback(updateCanvas)

      // const render = () => {
      //   if (!this.paused) {
      //     this.currentTime = this.video.currentTime
      //     // console.log('update time', this.currentTime)
      //   }

      //   this.drawImage()
      //   if (this.paused) {
      //     this.stopAnimation()
      //     return
      //   }
      //   this.requestId = window.requestAnimationFrame(render)
      // }
      // this.requestId = window.requestAnimationFrame(render)
    },
    stopAnimation() {
      if (this.requestId) {
        window.cancelAnimationFrame(this.requestId)
        this.requestId = null
      }
    },
    // 供外部直接调用 待测试
    async reMount() {
      console.log('reMount')
      this.initCanvas()
      await this.initbitMap()
      this.initImageMat()
      this.reset()
    },
    clearCanvas() {
      const maxLen = this.canvas.width * this.canvas.height * 4
      this.cs.clearRect(-maxLen, -maxLen, 2 * maxLen, 2 * maxLen)
    },
    async initImageMat() {
      const cv = this.$cv
      if (this.imgMatRequestId) {
        cancelAnimationFrame(this.imgMatRequestId)
        this.imgMatRequestId = 0
      }
      if (cv && this.video?.videoWidth) {
        if (this.imgMat) {
          this.imgMat?.delete()
          this.imgMat = null
        }
        const imgData = this.getVideoImageData()
        this.imgMat = cv.matFromImageData(imgData)
      } else {
        this.imgMatRequestId = requestAnimationFrame(this.initImageMat)
      }
    },
    async drawRGBText() {
      const cv = this.$cv
      if (
        this.paused &&
        this.preference.showRGBText &&
        cv &&
        this.imgMat &&
        this.imagePosition &&
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
    drawImage(img) {
      if (!this.imagePosition) return
      let { x, y, width, height } = this.imagePosition
      this.clearCanvas()
      this.cs.save()
      this.cs.translate(x + width / 2, y + height / 2)
      this.cs.rotate((this.degree * Math.PI) / 180)
      this.cs.translate(-x - width / 2, -y - height / 2)
      if (this.snapShot) {
        this.cs.drawImage(this.snapShot, 0, 0)
      } else {
        this.cs.drawImage(img ?? this.paused ? this.bitMap : this.video, x, y, width, height)
      }

      this.cs.restore()
      if (this.dynamicPickColor && this.triggerRGB) {
        this.doHandleMove()
      }

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
    handleVideoSliderVisible(status) {
      this.$bus.$emit('changeVideoSliderVisible', status ?? !this.videoSliderVisible)
    },
    changeVideoSliderVisible({ value }) {
      this.videoSliderVisible = value ?? !this.videoSliderVisible
    },
    doHistVisible({ visible }) {
      if (!visible) {
        this.$refs['hist-container'].setVisible(visible)
        return
      }
      window.cv &&
        this.generateHist().then(() => {
          this.$refs['hist-container'].setVisible(visible)
        })
    },
    changeZoom(data) {
      console.log('changeZoom', data)
    },
    // toolbar广播触发， 改变取色器显示状态
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
      this.changeRGBA()
      // console.log(`${this.path-changeMousePosInfo`, mousePos, {
      //   ...this.mousePosInfo
      // });
    },
    async changeRGBA() {
      if (!this.triggerRGB || !this.video?.videoWidth) return

      let { x, y } = this.mousePosInfo
      if (!isNaN(x) && !isNaN(y) && this.paused) {
        this.updateZoomViewer && this.updateZoomViewer(this.bitMap, { x, y })
      } else if (this.dynamicPickColor) {
        // !this.paused or canvas mode
        this.updateZoomViewer && this.updateZoomViewer(this.canvas, mousePos)
      }
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
      const originWidth = this.video.videoWidth
      const originHeight = this.video.videoHeight
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
    setCoverStatus({ snapShot, hist }, status) {
      if (status) {
        this.snapShot = snapShot
        this.clearCanvas()
        this.cs.drawImage(snapShot, 0, 0)
        if (this.$refs['hist-container'].visible) {
          this.maskDom = hist
        }
      } else {
        this.snapShot = null
        this.maskDom = null
        // this.startAnimation(false)
        this.drawImage()
      }
    },
    reset(val) {
      this.degree = 0
      this.cs.setTransform(1, 0, 0, 1, 0, 0)
      if (val) {
        let x = 0,
          y = 0
        let width = this.video.videoWidth
        let height = this.video.videoHeight
        this.afterFullSize = true
        this.imagePosition = { x, y, width, height }
      } else {
        this.imagePosition = this.getImageInitPos(this.canvas, this.video)
      }
      this.doZoomEnd()
      this.drawWhenPaused()
    },
    reDraw() {
      // 待测试
      window.requestAnimationFrame(this.initVideo)
    },
    drawWhenPaused() {
      if (this.paused) {
        this.drawImage()
      }
    },
    getImageInitPos(canvas, video) {
      const cw = canvas.width
      const ch = canvas.height

      const iw = video.videoWidth
      const ih = video.videoHeight

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
      let transX = this.imagePosition.x + (this.cs.getTransform().a || 1) * offset.x
      let transY = this.imagePosition.y + (this.cs.getTransform().d || 1) * offset.y
      if (this.checkBorder(transX, transY)) {
        // 判断是否只在指定范围内拖动
        this.imagePosition.x = transX
        this.imagePosition.y = transY
        if (this.paused) {
          this.drawImage()
        }
      }
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
      if (this.paused) {
        this.drawImage()
      }
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
      }
      this.doZoomEnd()
      this.drawImage()
    },
    doZoomEnd() {
      this.imgScale = this.video ? Number(this.imagePosition.width / this.video.videoWidth).toFixed(2) : 'N/A'
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
        data: { e, rate, mousePos, id: this.path }
      })
    },
    handleZoomEnd(e) {
      this.imagePosition &&
        this.broadCast({
          name: 'doZoomEnd',
          data: { e }
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
      this.degree = (this.degree + degree) % 360
      this.drawWhenPaused()
    },
    reverse(direction) {
      const { x, y, width, height } = this.imagePosition
      if (direction > 0) {
        const dx = x + width / 2
        //左右翻转
        this.cs.translate(dx, 0)
        this.cs.scale(-1, 1)
        this.cs.translate(-dx, 0)
      } else if (direction < 0) {
        const dy = y + height / 2
        //上下翻转
        this.cs.translate(0, dy)
        this.cs.scale(1, -1)
        this.cs.translate(0, -dy)
      }
      this.drawWhenPaused()
    },
    align({ name, data }) {
      const { beSameSize, position } = data
      if (this.selectedId || (!this.selectedId && this.path !== this.videoList[0])) {
        if (beSameSize) {
          let { x, y, width, height } = position
          this.imagePosition = { x, y, width, height }
          this.afterFullSize = true
          this.doZoomEnd()
        } else {
          this.imagePosition.x = position.x
          this.imagePosition.y = position.y
        }
        if (this.paused) {
          this.drawImage()
        }
      }
    },
    // 逐帧对比
    handleFrameSteps({ name, data }) {
      !this.videoSliderVisible && this.changeVideoSliderVisible({ value: true })
      // // 存在选中使只使选中视频进行逐帧操作
      if (this.selectedId && this.selectedId !== this.path) return
      this.changeFrame(data)
    },
    getSelectedPosition(data, callback) {
      if (this.selected || this.path === this.selectedId || (!this.selectedId && this.path === this.videoList[0])) {
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

    // padding-right: 10px;
    .svg-container {
      // cursor: pointer;
      // margin-right: 5px;
      font-size: 16px;
      // .icon-hover {
      //   color: $primaryColor;
      // }
    }

    .progress-container {
      width: 100%;
      height: 16px;
      padding: 0 8px;

      progress {
        appearance: none;
        display: block;
        width: 100%;
        height: 14px;

        &::-webkit-progress-bar {
          background-color: rgba(255, 255, 255, 0.938);
          border-radius: 3px;
          border: 1px solid #707078;
        }

        &::-webkit-progress-value {
          background-color: $primaryColor;
        }
      }
    }

    .header-left {
      .svg-container+.svg-container {
        margin-right: 3px;
      }

      ::v-deep {
        .el-button {
          &+& {
            margin-left: 0;
          }
        }
      }

      .icon-btn-group {
        .svg-container+.svg-container {
          margin: 0 0 0 3px;
        }
      }
    }

    .header-right {
      .svg-container {
        font-size: 20px;
      }

      .video-tool {
        .time-input {
          max-width: 40px;
          height: 16px;
          text-align: center;
          border: 1px solid #707078;
          border-radius: 4px;

          &:focus {
            border: unset;
            outline: 1px solid $primaryColor;
          }
        }

        .frames {
          margin-left: 3px;
          min-width: 60px;
          max-width: 70px;
          font-size: 14px;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
          user-select: none;
        }
      }

      .frame-text {
        font-weight: bold;
      }
    }
  }

  .canvas-container {
    .canvas-item {
      position: relative;
      width: 100%;
      height: 100%;

      img {
        object-fit: contain;
        vertical-align: middle;
      }

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

      .mouse-position {
        position: absolute;
        bottom: 4px;
        right: 5px;
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }

  .selected-item {
    outline: 1px dashed red;
    outline-offset: -2px;
  }
}

::v-deep {
  .el-input-number--small {
    width: 100px;
  }

  .el-input-number {
    line-height: 30px;

    .el-input--small {
      width: 100px;
      height: 18px;
      line-height: 18px;

      .el-input__inner {
        padding: 5px;
        height: 18px;
        color: black;
      }
    }

    .el-input-number__increase,
    .el-input-number__decrease {
      width: 14px;
      height: 16px;
      line-height: 16px;
    }
  }

  .el-button {
    padding: 2.5px 6px;
  }
}

.primary-color {
  color: $primaryColor;
}
</style>
