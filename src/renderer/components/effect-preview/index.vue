<template>
  <el-tooltip effect="light" placement="bottom" :open-delay="300">
    <div slot="content" class="image-style-container">
      <el-divider><span class="title-style">{{ $t("imagePreview.title") }}</span></el-divider>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t("imagePreview.brightness") }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider :min="0" :max="500" v-model="brightness" show-input :format-tooltip="
            (val) => {
              return val + '%'
            }
          "></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t("imagePreview.contrast") }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider :min="0" :max="500" v-model="contrast" show-input :format-tooltip="
            (val) => {
              return val + '%'
            }
          "></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t("imagePreview.saturate") }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider :min="0" :max="500" v-model="saturate" show-input :format-tooltip="
            (val) => {
              return val + '%'
            }
          "></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t("imagePreview.grayscale") }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider :min="0" :max="100" v-model="grayscale" show-input :format-tooltip="
            (val) => {
              return val + '%'
            }
          "></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t("imagePreview.invert") }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider :min="0" :max="100" v-model="invert" show-input :format-tooltip="
            (val) => {
              return val + '%'
            }
          "></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6">
          <span class="text-style">{{ $t("imagePreview.opacity") }}</span>
        </el-col>
        <el-col :span="18">
          <el-slider :min="0" :max="100" v-model="opacity" show-input :format-tooltip="
            (val) => {
              return val + '%'
            }
          "></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6"><span class="text-style">{{ $t("imagePreview.blur") }}</span></el-col>
        <el-col :span="18">
          <el-slider :min="0" :max="15" v-model="blur" show-input></el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6"><span class="text-style">{{ $t("imagePreview.gamma") }}</span></el-col>
        <el-col :span="18">
          <el-slider :min="0.01" :max="10" :step="0.01" v-model="gammaData" show-input @input="updateGama"></el-slider>
        </el-col>
      </el-row>
      <el-divider><span class="title-style">{{ $t("imagePreview.colorLevel.title") }}</span></el-divider>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6"><span class="text-style">{{ $t("imagePreview.colorLevel.input") }}</span></el-col>
        <el-col :span="18">
          <el-slider v-model="inputLevels" range :min="0" :max="255" :step="1" @input="updateInputLevels"> </el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6"><span class="text-style">{{ $t("imagePreview.colorLevel.inputMidtones") }}</span></el-col>
        <el-col :span="18">
          <el-slider v-model="inputMidtonesData" :min="0.01" :max="10" :step="0.01" show-input
            @input="updateInputMidtones"> </el-slider>
        </el-col>
      </el-row>
      <el-row :gutter="10" flex="cross:center">
        <el-col :span="6"><span class="text-style">{{ $t("imagePreview.colorLevel.output") }}</span></el-col>
        <el-col :span="18">
          <el-slider v-model="outputLevels" range :min="0" :max="255" :step="1" @input="updateOutputLevels">
          </el-slider>
        </el-col>
      </el-row>

      <div flex="main:justify">
        <el-switch v-model="enableXray" active-text="Xray"></el-switch>
        <el-button @click="resetImageStyle">{{ $t("imagePreview.resetAll") }}</el-button>
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
import { debounce } from '@/utils'
import { bus } from '@/utils/bus'

export default {
  name: 'EffectPreview',
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
      preLevels: "025510255",
      inputLevels: [0, 255],
      inputMidtonesData: 1,
      outputLevels: [0, 255],
    }
  },
  computed: {
    ...mapGetters(['preference']),
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
  },
  methods: {
    ...mapActions(['setPreference']),
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
          name: "adjustGamma",
          data: params
        })
      }
    }),
    updateInputLevels: debounce(200, function (inputLevels) {
      const paramsStr = this.inputLevels.concat([this.inputMidtonesData]).concat(this.outputLevels).join("");
      if (paramsStr === this.preLevels) {
        return
      }
      this.preLevels = paramsStr
      const params = this.generateFilterParams({
        inputShadow: inputLevels[0],
        inputHighlight: inputLevels[1],
      })
      this.updateLevels(params, false)
      bus.$emit('image_broadcast', {
        name: "adjustLevels",
        data: params
      })
    }),
    updateInputMidtones: debounce(200, function (inputMidtones) {
      const paramsStr = this.inputLevels.concat([this.inputMidtonesData]).concat(this.outputLevels).join("");
      if (paramsStr === this.preLevels) {
        return
      }
      this.preLevels = paramsStr
      const params = this.generateFilterParams({
        inputMidtones
      })
      this.updateLevels(params, false)
      bus.$emit('image_broadcast', {
        name: "adjustLevels",
        data: params
      })
    }),
    updateOutputLevels: debounce(200, function (outputLevels) {
      const paramsStr = this.inputLevels.concat([this.inputMidtonesData]).concat(this.outputLevels).join("");
      if (paramsStr === this.preLevels) {
        return
      }
      this.preLevels = paramsStr
      const params = this.generateFilterParams({
        outputShadow: outputLevels[0],
        outputHighlight: outputLevels[1],
      })
      this.updateLevels(params, false)
      bus.$emit('image_broadcast', {
        name: "adjustLevels",
        data: params
      })
    }),
    updateLevels({ inputShadow, inputHighlight, inputMidtones, outputShadow, outputHighlight }, check = true) {
      if (check) {
        const paramsStr = this.inputLevels.concat([this.inputMidtonesData]).concat(this.outputLevels).join("");
        if (paramsStr === this.preLevels) {
          return
        }
        this.preLevels = paramsStr
      }
      this.inputLevels = [inputShadow, inputHighlight]
      this.inputMidtonesData = inputMidtones
      this.outputLevels = [outputShadow, outputHighlight]
    },
    generateFilterParams(params) {
      const _params = {
        gamma: params.gamma ?? this.gammaData,
        inputShadow: params.inputShadow ?? this.inputLevels[0],
        inputHighlight: params.inputHighlight ?? this.inputLevels[1],
        inputMidtones: params.inputMidtones ?? this.inputMidtonesData,
        outputShadow: params.outputShadow ?? this.outputLevels[0],
        outputHighlight: params.outputHighlight ?? this.outputLevels[1],
      }
      const { gamma, inputShadow, inputHighlight, inputMidtones, outputShadow, outputHighlight } = _params
      if (gamma !== this.gammaData) {
        this.preGammaData = this.gammaData
        this.gammaData = gamma
      }
      [inputShadow, inputHighlight, inputMidtones, outputShadow, outputHighlight].every(num => !isNaN(num)) && this.updateLevels(_params)
      return _params
    }
  },
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
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

  :deep(.el-row) {
    display: flex;
    align-items: center;
  }
}
</style>
