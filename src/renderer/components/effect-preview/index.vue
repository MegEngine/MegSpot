<template>
  <el-tooltip effect="light" placement="bottom">
    <div slot="content" class="image-style-container">
      <el-divider>
        <span class="title-style">{{ $t('imagePreview.mode.title') }}</span>
      </el-divider>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.mode.name') }}</span>
        </el-col>
        <el-col :span="18">
          <div style="display: flex; justify-content: flex-end;">
            <el-radio v-model="theMode" label="canvas" border>{{ $t('imagePreview.mode.canvas') }}</el-radio>
            <el-radio v-model="theMode" label="image" border>{{ $t('imagePreview.mode.image') }}</el-radio>
          </div>
        </el-col>
      </el-row>
      <el-divider>
        <span class="title-style">{{ $t('imagePreview.title') }}</span>
      </el-divider>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.brightness') }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            :min="0"
            :max="500"
            v-model="brightness"
            show-input
            :format-tooltip="
              (val) => {
                return val + '%'
              }
            "
          ></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.contrast') }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            :min="0"
            :max="500"
            v-model="contrast"
            show-input
            :format-tooltip="
              (val) => {
                return val + '%'
              }
            "
          ></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.saturate') }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            :min="0"
            :max="500"
            v-model="saturate"
            show-input
            :format-tooltip="
              (val) => {
                return val + '%'
              }
            "
          ></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.grayscale') }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            :min="0"
            :max="100"
            v-model="grayscale"
            show-input
            :format-tooltip="
              (val) => {
                return val + '%'
              }
            "
          ></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.invert') }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            :min="0"
            :max="100"
            v-model="invert"
            show-input
            :format-tooltip="
              (val) => {
                return val + '%'
              }
            "
          ></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.opacity') }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            :min="0"
            :max="100"
            v-model="opacity"
            show-input
            :format-tooltip="
              (val) => {
                return val + '%'
              }
            "
          ></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.blur') }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider :min="0" :max="15" v-model="blur" show-input></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.gamma') }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider :min="0.01" :max="10" :step="0.01" v-model="gammaData" show-input @input="updateGama"></el-slider>
        </el-col>
      </el-row>
      <el-divider>
        <span class="title-style">{{ $t('imagePreview.colorLevel.title') }}</span>
      </el-divider>
      <el-row :gutter="2" flex="cross:center">
        <el-col :span="4">
          <span class="text-style">{{ $t('imagePreview.channel') }}</span>
        </el-col>
        <el-col :span="20">
          <el-radio-group
            v-model="singleHistType"
            :title="$t('imagePreview.colorLevel.histogramTip')"
            flex="dir:left main:justify"
            style="padding-left: 40px"
          >
            <el-radio v-for="{ label, value } in histTypeOptions" size="mini" :label="value" :key="value">
              {{ label }}
            </el-radio>
          </el-radio-group>
        </el-col>
      </el-row>
      <el-row :gutter="2" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.colorLevel.input') }}</span>
        </el-col>
        <el-col :span="18">
          <div flex="dir:left main:justify cross:center">
            <input
              v-model="inputShadow"
              @keydown.right="inputShadow++"
              @keydown.up="inputShadow++"
              @keydown.down="inputShadow--"
              @keydown.left="inputShadow--"
              class="number-input"
            />
            <el-slider v-model="inputLevels" range :min="0" :max="255" :step="1" style="width: 190px"></el-slider>
            <input
              v-model="inputHighlight"
              @keydown.right="inputHighlight++"
              @keydown.up="inputHighlight++"
              @keydown.down="inputHighlight--"
              @keydown.left="inputHighlight--"
              class="number-input"
            />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.colorLevel.inputMidtones') }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            v-model="inputMidtonesData"
            :min="0.01"
            :max="10"
            :step="0.01"
            show-input
            @input="updateInputMidtones"
          ></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="2" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t('imagePreview.colorLevel.input') }}</span>
        </el-col>
        <el-col :span="18">
          <div flex="dir:left main:justify cross:center">
            <input
              v-model="outputShadow"
              @keydown.right="outputShadow++"
              @keydown.up="outputShadow++"
              @keydown.down="outputShadow--"
              @keydown.left="outputShadow--"
              class="number-input"
            />
            <el-slider v-model="outputLevels" range :min="0" :max="255" :step="1" style="width: 190px"></el-slider>
            <input
              v-model="outputHighlight"
              @keydown.right="outputHighlight++"
              @keydown.up="outputHighlight++"
              @keydown.down="outputHighlight--"
              @keydown.left="outputHighlight--"
              class="number-input"
            />
          </div>
        </el-col>
      </el-row>
      <div flex="main:justify">
        <el-switch v-model="enableXray" active-text="Xray"></el-switch>
        <el-button @click="resetImageStyle">{{ $t('imagePreview.resetAll') }}</el-button>
      </div>
    </div>
    <el-button type="text" size="medium" id="preview" :title="$t('imagePreview.title')">
      <svg-icon icon-class="eye-open"></svg-icon>
    </el-button>
  </el-tooltip>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('preferenceStore')
import VueSlider from 'vue-slider-component'
import { debounce } from '@/utils'
import { bus } from '@/utils/bus'
import { histTypeOptions } from '@/components/hist-container/config'
import { type } from 'os'

export default {
  name: 'EffectPreview',
  components: {
    VueSlider
  },
  props: {
    mode: {
      type: String,
      default: 'canvas'
    }
  },
  data() {
    return {
      // 预览处理效果
      brightness: 100,
      contrast: 100,
      saturate: 100,
      grayscale: 0,
      invert: 0,
      opacity: 100,
      blur: 0,
      enableXray: false,
      preGammaData: 1,
      gammaData: 1,
      preLevels: '025510255rgb',
      inputLevels: [0, 255],
      inputMidtonesData: 1,
      outputLevels: [0, 255],
      singleHistType: 'rgb',
      histTypeOptions: histTypeOptions
        .filter((type) => type !== 'gray')
        .map((type) => ({
          label: type !== 'rgb' ? type : 'all',
          value: type
        }))
    }
  },
  computed: {
    ...mapGetters(['preference', 'histConfig']),
    canvasStyle() {
      let filter = ''
      ;['brightness', 'contrast', 'saturate', 'grayscale', 'opacity', 'invert'].forEach((item) => {
        filter += `${item}(${this[item]}%) `
      })
      ;['blur'].forEach((item) => {
        filter += `${item}(${this[item]}px) `
      })
      return filter
    },
    inputShadow: {
      get() {
        return this.inputLevels[0]
      },
      set(val) {
        if (val >= 0 && val <= 255 && val < this.inputHighlight) {
          this.inputLevels = [val, this.inputLevels[1]]
        }
      }
    },
    inputHighlight: {
      get() {
        return this.inputLevels[1]
      },
      set(val) {
        if (val >= 0 && val <= 255 && val > this.inputShadow) {
          this.inputLevels = [this.inputLevels[0], val]
        }
      }
    },
    outputShadow: {
      get() {
        return this.outputLevels[0]
      },
      set(val) {
        if (val >= 0 && val <= 255 && val < this.outputHighlight) {
          this.outputLevels = [val, this.outputLevels[1]]
        }
      }
    },
    outputHighlight: {
      get() {
        return this.outputLevels[1]
      },
      set(val) {
        if (val >= 0 && val <= 255 && val > this.outputShadow) {
          this.outputLevels = [this.outputLevels[0], val]
        }
      }
    },
    theMode: {
      get() {
        return this.mode
      },
      set(val) {
        this.setMode(val)
      }
    }
  },
  watch: {
    canvasStyle() {
      this.$emit('change', this.canvasStyle)
    },
    // 黑白二值化
    enableXray(enable) {
      this.grayscale = enable ? 100 : 0
      this.invert = enable ? 100 : 0
    },
    singleHistType: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          // 渲染单通道直方图 filled
          this.renderHistogram()
          // 对所选通道应用色阶配置
          bus.$emit('image_broadcast', {
            name: 'adjustLevels',
            data: this.generateFilterParams()
          })
        }
      },
      immediate: false
    },
    inputLevels: {
      handler(newVal, oldVal) {
        if (newVal[0] !== oldVal[0] || oldVal[1] !== oldVal[1]) {
          this.updateInputLevels(newVal)
        }
      },
      immediate: false
    },
    outputLevels: {
      handler(newVal, oldVal) {
        if (newVal[0] !== oldVal[0] || oldVal[1] !== oldVal[1]) {
          this.updateOutputLevels(newVal)
        }
      },
      immediate: false
    },
  },
  methods: {
    ...mapActions(['setPreference']),
    setMode(newMode) {
      this.$emit('set-mode', newMode)
    },
    resetImageStyle() {
      // 预览处理效果
      this.brightness = 100
      this.contrast = 100
      this.saturate = 100
      this.grayscale = 0
      this.invert = 0
      this.opacity = 100
      this.blur = 0

      // gamma
      this.gammaData = 1

      // color level
      this.inputLevels = [0, 255]
      this.inputMidtonesData = 1
      this.outputLevels = [0, 255]
    },
    updateGama: debounce(200, function (newGama) {
      if (newGama) {
        this.preGammaData = this.gammaData
        this.gammaData = newGama
        const params = this.generateFilterParams({
          gamma: newGama
        })
        bus.$emit('image_broadcast', {
          name: 'adjustGamma',
          data: params
        })
      }
    }),
    updateInputLevels: debounce(200, function (inputLevels) {
      const paramsStr = this.inputLevels
        .concat([this.inputMidtonesData])
        .concat(this.outputLevels)
        .concat([this.singleHistType])
        .join('')
      if (paramsStr === this.preLevels) {
        return
      }
      this.preLevels = paramsStr
      const params = this.generateFilterParams({
        inputShadow: inputLevels[0],
        inputHighlight: inputLevels[1]
      })
      this.updateLevels(params, false)
      bus.$emit('image_broadcast', {
        name: 'adjustLevels',
        data: params
      })
      this.renderHistogram()
    }),
    updateInputMidtones: debounce(200, function (inputMidtones) {
      const paramsStr = this.inputLevels.concat([this.inputMidtonesData]).concat(this.outputLevels).join('')
      if (paramsStr === this.preLevels) {
        return
      }
      this.preLevels = paramsStr
      const params = this.generateFilterParams({
        inputMidtones
      })
      this.updateLevels(params, false)
      bus.$emit('image_broadcast', {
        name: 'adjustLevels',
        data: params
      })
      this.renderHistogram()
    }),
    updateOutputLevels: debounce(200, function (outputLevels) {
      const paramsStr = this.inputLevels.concat([this.inputMidtonesData]).concat(this.outputLevels).join('')
      if (paramsStr === this.preLevels) {
        return
      }
      this.preLevels = paramsStr
      const params = this.generateFilterParams({
        outputShadow: outputLevels[0],
        outputHighlight: outputLevels[1]
      })
      this.updateLevels(params, false)
      bus.$emit('image_broadcast', {
        name: 'adjustLevels',
        data: params
      })
      this.renderHistogram()
    }),
    updateLevels({ inputShadow, inputHighlight, inputMidtones, outputShadow, outputHighlight }, check = true) {
      const paramsStr = this.inputLevels
        .concat([this.inputMidtonesData])
        .concat(this.outputLevels)
        .concat([this.singleHistType])
        .join('')
      if (check) {
        if (paramsStr === this.preLevels) {
          return
        }
      }
      this.preLevels = paramsStr
      this.inputLevels = [inputShadow, inputHighlight]
      this.inputMidtonesData = inputMidtones
      this.outputLevels = [outputShadow, outputHighlight]
    },
    generateFilterParams(params) {
      const _params = {
        gamma: params?.gamma ?? this.gammaData,
        inputShadow: params?.inputShadow ?? this.inputLevels[0],
        inputHighlight: params?.inputHighlight ?? this.inputLevels[1],
        inputMidtones: params?.inputMidtones ?? this.inputMidtonesData,
        outputShadow: params?.outputShadow ?? this.outputLevels[0],
        outputHighlight: params?.outputHighlight ?? this.outputLevels[1],
        channel: params?.singleHistType ?? this.singleHistType
      }
      const { channel, gamma, inputShadow, inputHighlight, inputMidtones, outputShadow, outputHighlight } = _params
      if (channel !== this.singleHistType) {
        this.singleHistType = channel
      }
      if (gamma !== this.gammaData) {
        this.preGammaData = this.gammaData
        this.gammaData = gamma
      }
      ;[inputShadow, inputHighlight, inputMidtones, outputShadow, outputHighlight].every((num) => !isNaN(num)) &&
        this.updateLevels(_params)
      return _params
    },
    renderHistogram() {
      const histConfig = Object.assign({}, this.histConfig, {
        histTypes: [this.singleHistType],
        multi: false,
        drawType: 'rect'
      })
      this.$bus.$emit('changeHistTypes', histConfig)
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import '@/styles/variables.scss';

.image-style-container {
  width: 400px;

  // padding-right: 5px;
  #preview {
    position: absolute;
    top: 0;
    z-index: 1;
    padding: 0;
  }

  .title-style {
    color: #37383b;
    font-size: 16px;
    font-weight: bold;
  }

  .text-style {
    color: #82848a;
    font-size: 14px;
    margin-left: 3px;
  }
  .number-input {
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
  :deep(.el-row) {
    display: flex;
    align-items: center;
  }
}
</style>
