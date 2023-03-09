<template>
  <div class="container">
    <el-button id="hist-icon" type="text" @click="changeVisible()">
      <svg-icon icon-class="chart"></svg-icon>
    </el-button>
    <div :id="`hist-container-${index}`" class="hist-container">
      <canvas
        ref="hist"
        v-show="visible"
        id="hist"
        :title="$t('histogram.title')"
        @click="changeVisible(false)"
      ></canvas>
      <el-checkbox-group
        v-if="multi"
        v-show="visible"
        v-model="histTypes"
        class="mode-group"
        :title="$t('histogram.tip')"
      >
        <el-checkbox-button v-for="histType in histTypeOptions" size="mini" :label="histType" :key="histType">
          {{ histType }}
        </el-checkbox-button>
      </el-checkbox-group>
      <el-radio-group v-else v-show="visible" v-model="singleHistType" class="mode-group" :title="$t('histogram.tip')">
        <el-radio-button
          v-for="histType in histTypeOptions"
          size="mini"
          :label="histType"
          :key="histType"
          :value="histType"
        ></el-radio-button>
      </el-radio-group>
      <div class="setting-group" flex="dir:top main:left cross:center">
        <el-button
          class="close-icon"
          icon="el-icon-circle-close"
          size="medium"
          type="text"
          :title="$t('histogram.close')"
          @click="changeVisible(false)"
          v-show="visible"
        ></el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { histTypeOptions, get_default_histconfig, setHistConfig, isBright } from './config'
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
      mask: undefined,
      rgbaPlanes: undefined,
      grayHist: undefined,
      rgbHist: undefined,
      rHist: undefined,
      gHist: undefined,
      bHist: undefined,
      histTypeOptions
    }
  },
  computed: {
    ...mapGetters(['preference', 'histConfig']),
    containerId() {
      return `hist-container-${this.index}`
    },
    multi() {
      return this.histConfig.multi
    },
    histTypes: {
      get() {
        return this.histConfig.histTypes
      },
      set(histTypes) {
        this.applayHistTypes(histTypes)
      }
    },
    singleHistType: {
      get() {
        return this.histConfig.histTypes[0]
      },
      set(histType) {
        this.applayHistTypes([histType])
      }
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
    setHistConfig,
    ...mapActions(['setPreference']),
    restHistConfig() {
      this.setHistConfig(get_default_histconfig())
    },
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
    getLineColor(histType) {
      const { backgroundColor, colors } = this.histConfig
      if (['rgb', 'gray'].includes(histType)) {
        return isBright(...backgroundColor.slice(0, 3)) ? [0, 0, 0] : [255, 255, 255]
      }
      return colors[histType]
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
      // const loading = this.$loading({
      //   target: `#hist-container-${this.index}`,
      //   lock: false,
      //   text: 'Loading',
      //   spinner: 'el-icon-loading',
      //   background: 'rgba(0, 0, 0, 0.7)'
      // })
      const { histTypes, multi, drawType, lineWidth, scale, histSize, backgroundColor } = config ?? this.histConfig
      let histRows = sourceMat.rows
      let dst = new cv.Mat(histRows, histSize[0] * scale, cv.CV_8UC3, backgroundColor.slice(0, 4))
      const usedHistTypes = multi ? histTypes : [histTypes[0]]
      for (let histType of usedHistTypes) {
        const hist = this.getHist(sourceMat, histType)
        const color = new cv.Scalar(...this.getLineColor(histType))
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

      // loading?.close()
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
    applayHistTypes(histTypes) {
      if (histTypes.length > 0) {
        this.setHistConfig({
          histTypes
        })
        this.$bus.$emit('changeHistTypes')
      } else {
        this.$message.error('at least one histogram channel')
      }
    },
    // 供外部直接调用
    setVisible(visible) {
      this.visible = visible
    }
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
    .mode-group {
      position: absolute;
      left: 0;
      top: 91px;
      width: 800px;
    }
    .setting-group {
      position: absolute;
      left: 155px;
      top: 0px;
      width: 30px;
      height: 90px;
      gap: 8px;

      .setting-icon {
        &:hover {
          color: rgb(183, 0, 255);
        }
      }
      .close-icon {
        &:hover {
          color: red;
        }
      }
    }
    .mode-group,
    .setting-group {
      visibility: hidden;
      transition: visibility 0.8s ease-in;
    }
    &:hover {
      .mode-group,
      .setting-group {
        visibility: visible;
      }
    }
  }
  #hist-icon {
    font-size: 16px;
  }
}
::v-deep {
  .el-button + .el-button {
    margin-left: 0;
  }
  .el-button {
    padding: 0 0 0 0;
  }
}
</style>
