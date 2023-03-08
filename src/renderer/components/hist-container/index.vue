<template>
  <div class="container">
    <el-button id="hist-icon" type="text" @click="changeVisible()">
      <svg-icon icon-class="chart"></svg-icon>
    </el-button>
    <div :id="`hist-container-${index}`" class="hist-container">
      <canvas v-loading="loading" ref="hist" v-show="visible" id="hist" @click="changeVisible(false)"></canvas>
      <el-button
        class="close-icon"
        icon="el-icon-circle-close"
        size="medium"
        type="text"
        @click="changeVisible(false)"
        v-show="visible"
      ></el-button>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('preferenceStore')
export default {
  name: 'HistContainer',
  props: {
    index: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      visible: false,
      hist: undefined,
      loading: false,
      mask: undefined,
      rgbaPlanes: undefined,
      grayHist: undefined,
      rgbHist: undefined,
      rHist: undefined,
      gHist: undefined,
      bHist: undefined,
      histConfig: {
        histTypes: ['rgb'], // 'gray', 'rgb', 'red', 'green', 'blue'
        scale: 1.0,
        lineWidth: 1,
        drawType: 'line', // "line"/"rect"
        backgroundColor: [255, 255, 255, 255],
        colors: new Map([
          ['gray', [0, 0, 0]],
          ['red', [255, 0, 0]],
          ['green', [0, 255, 0]],
          ['blue', [0, 0, 255]],
          ['rgb', [0, 0, 0]]
        ]),
        accumulate: true,
        histSize: [256],
        ranges: [0, 256]
      }
    }
  },
  computed: {
    containerId() {
      return `hist-container-${this.index}`
    }
  },
  created() {
    this.resetHists()
    this.visible = this.preference.defaultShowHist
  },
  mounted() {
    this.hist = this.$refs.hist
  },
  beforeDestroy() {
    this.resetHists()
  },
  methods: {
    ...mapActions(['setPreference']),
    resetHists() {
      this.rgbaPlanes?.delete()
      this.grayHist?.delete()
      this.rgbHist?.delete()
      this.rHist?.delete()
      this.gHist?.delete()
      this.bHist?.delete()
      this.mask?.delete()
      this.rgbaPlanes = undefined
      this.grayHist = undefined
      this.rgbHist = undefined
      this.rHist = undefined
      this.gHist = undefined
      this.bHist = undefined
      this.mask = undefined
    },
    getMask() {
      if (!this.mask) {
        this.mask = new cv.Mat()
      }
      return this.mask
    },
    getHist(sourceMat, histType) {
      const { accumulate, histSize, ranges } = this.histConfig
      const calcHist = (channelIndex, histName) => {
        this[histName] = new cv.Mat()
        const mask = this.getMask()
        cv.calcHist(this.getRgbaPlanes(sourceMat), [channelIndex], mask, this[histName], histSize, ranges, accumulate)
      }
      switch (histType) {
        case 'gray':
          if (!this.grayHist) {
            const srcVec = new cv.MatVector()
            const mask = this.getMask()
            const grayImg = new cv.Mat()
            this.grayHist = new cv.Mat()

            cv.cvtColor(sourceMat, grayImg, cv.COLOR_RGBA2GRAY, 0)
            srcVec.push_back(grayImg)
            cv.calcHist(srcVec, [0], mask, this.grayHist, histSize, ranges, accumulate)
            srcVec.delete()
          }
          return this.grayHist
        case 'red':
          !this.gHist && calcHist(0, 'rHist')
          return this.rHist
        case 'green':
          !this.gHist && calcHist(1, 'gHist')
          return this.gHist
        case 'blue':
          !this.bHist && calcHist(2, 'bHist')
          return this.bHist
        case 'rgb':
          if (!this.rgbHist) {
            this.rgbHist = new cv.Mat()
            const mask = this.getMask()
            const rHist = this.getHist(sourceMat, 'red')
            const gHist = this.getHist(sourceMat, 'green')
            const bHist = this.getHist(sourceMat, 'blue')
            cv.add(rHist, gHist, this.rgbHist, mask, rHist?.type())
            cv.add(bHist, this.rgbHist, this.rgbHist, mask, bHist?.type())
          }
          return this.rgbHist
      }
    },
    getRgbaPlanes(sourceMat) {
      if (!this.rgbaPlanes) {
        this.rgbaPlanes = new cv.MatVector()
        cv.split(sourceMat, this.rgbaPlanes)
      }
      return this.rgbaPlanes
    },
    reGenerateHist(sourceMat, config = null) {
      this.resetHists()
      return this.generateHist(sourceMat, config)
    },
    // 供外部调用直接生成直方图
    // 由于mat数据较大通过属性传递 需要额外占用存储空间
    // 不如通过方法调用 生成后直接释放
    /**
     * @param {array} config 直方图通道类型 // "gray"/"red"/"green"/"blue"
     */
    generateHist(sourceMat, config = null) {
      this.loading = this.$loading({
        target: `#hist-container-${this.index}`,
        lock: false,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const { histTypes, drawType, lineWidth, scale, colors, histSize, backgroundColor } = config ?? this.histConfig
      let histRows = sourceMat.rows
      let dst = new cv.Mat(histRows, histSize[0] * scale, cv.CV_8UC3, backgroundColor) // black background
      for (let histType of histTypes) {
        const hist = this.getHist(sourceMat, histType)
        const color = new cv.Scalar(...colors.get(histType))
        const mask = this.getMask()
        let result = cv.minMaxLoc(hist, mask)
        let max = result.maxVal
        if (drawType === 'line') {
          for (let i = 1; i < histSize[0]; i++) {
            let binVal = (hist.data32F[i - 1] * histRows) / max
            let binVal2 = (hist.data32F[i] * histRows) / max
            let point1 = new cv.Point((i - 1) * scale, histRows - binVal)
            let point2 = new cv.Point(i * scale, histRows - binVal2)
            cv.line(dst, point1, point2, color, lineWidth)
          }
        } else {
          for (let i = 0; i < histSize[0]; i++) {
            let binVal = (hist.data32F[i] * histRows) / max
            let point1 = new cv.Point(i * scale, histRows - 1)
            let point2 = new cv.Point((i + 1) * scale - 1, histRows - binVal)
            cv.rectangle(dst, point1, point2, color, cv.FILLED)
          }
        }
      }

      this.loading?.close()
      cv.imshow(this.$refs.hist, dst)
      dst.delete()
      sourceMat.delete()
      return this.getHistCanvas()
    },
    getHistCanvas() {
      const copyCanvas = document.createElement('canvas')
      copyCanvas.style.width = this.hist.offsetWidth + 'px'
      copyCanvas.style.height = this.hist.offsetHeight + 'px'
      copyCanvas.width = this.hist.width
      copyCanvas.height = this.hist.height
      var context = copyCanvas.getContext('2d')
      context.drawImage(this.hist, 0, 0)
      return copyCanvas
    },
    changeVisible(visible) {
      this.visible = visible ?? !this.visible
      this.$emit('changeVisible', this.visible)
    },
    // 供外部直接调用
    setVisible(visible) {
      this.visible = visible
    }
  },
  computed: {
    ...mapGetters(['preference'])
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.container {
  .hist-container {
    position: absolute;
    z-index: 1;
    left: 0px;
    top: 20px;
    #hist {
      width: 160px;
      height: 90px;
    }
    .close-icon {
      position: absolute;
      left: 158px;
      top: 74px;
      &:hover {
        color: red;
      }
    }
  }
  #hist-icon {
    font-size: 16px;
  }
}
</style>
