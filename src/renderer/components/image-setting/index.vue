<template>
  <div flex="main:right">
    <el-popover
      v-model="visible"
      effect="light"
      placement="bottom"
      trigger="manual"
      popper-class="image-setting"
      @click.stop
    >
      <div class="header">
        <div class="title">{{ $t('imageSetting.title') }}</div>
        <el-button type="text" class="close-btn" @click="visible = false" :title="'close'">
          <svg-icon icon-class="close" class="icon"></svg-icon>
        </el-button>
      </div>
      <el-collapse v-model="currentCollapseName" accordion style="min-width: 328px">
        <el-collapse-item name="common">
          <template slot="title">
            <span class="collapse-title">{{ $t('general.common') }}</span>
          </template>
          <div flex="dir:top" class="setting-group">
            <div flex="main:justify" class="setting-item">
              <span>{{ $t('imageSetting.showImageName') }}：</span>
              <el-switch v-model="showTitle"></el-switch>
            </div>
            <div flex="main:justify" class="setting-item">
              <span>{{ $t('imageSetting.showScale') }}：</span>
              <el-switch v-model="showScale"></el-switch>
            </div>
            <div flex="main:justify" class="setting-item">
              <span>{{ $t('imageSetting.showMousePos') }}：</span>
              <el-switch v-model="showMousePos"></el-switch>
            </div>
            <div v-if="$route.path.includes('video')" flex="main:justify" class="setting-item">
              <span>{{ $t('video.dynamicPickColor') }}:</span>
              <el-switch v-model="dynamicPickColor"></el-switch>
            </div>
            <div v-if="$route.path.includes('video')" flex="main:justify" class="setting-item">
              <span>{{ $t('video.muted') }}:</span>
              <el-switch v-model="videoMuted"></el-switch>
            </div>
            <div flex="main:justify" class="setting-item">
              <span>{{ $t('imageSetting.backgroundMode') }}：</span>
              <el-select
                v-model="mode"
                placeholder="please select background color"
                style="width: 100px"
                @change="handleModeChange"
              >
                <div>
                  <el-option
                    v-for="(item, index) in colorOptions"
                    :key="index"
                    :label="item.mode"
                    :value="item.mode"
                    style="padding: 0 10px 0 5px"
                  >
                    <div flex="main:justify cross:center">
                      <div :style="baseStyle + item.style"></div>
                      <span>{{ item.mode }}</span>
                    </div>
                  </el-option>
                </div>
              </el-select>
            </div>
            <!-- <div
          v-if="$route.path.includes('video')"
          flex="main:justify"
          class="setting-item"
        >
          <span>{{ $t('general.videoProcessBarStyle') }}:</span>
          <el-select v-model="videoProcessBarStyle">
            <el-option :label="$t('general.fixed')" value="fixed"> </el-option>
            <el-option :label="$t('general.float')" value="float"> </el-option>
          </el-select>
        </div> -->
            <div flex="main:justify" class="setting-item">
              <span>{{ $t('imageSetting.scaleOpt') }}：</span>
              <el-select
                v-model="scaleOptions"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="setting default scale options"
              >
                <el-option
                  v-for="(item, index) in preference.scaleOptions"
                  :key="index"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </div>
            <div v-if="$route.path.includes('video')" flex="main:justify" class="setting-item">
              <span>{{ $t('video.enableSyncTime') }}：</span>
              <el-switch v-model="enableSyncTime"></el-switch>
            </div>
            <div v-if="$route.path.includes('video')" flex="main:justify" class="setting-item">
              <span>{{ $t('imageCenter.frameStep') }}(s):</span>
              <el-input-number
                v-model="frameCompareInterval"
                :step="0.01"
                :min="0.001"
                :precision="4"
                controls-position="right"
              ></el-input-number>
            </div>
            <div v-if="$route.path.includes('video')" flex="main:justify" class="setting-item">
              <span>{{ $t('video.minRenderInterval') }}(s):</span>
              <el-input-number
                v-model="renderInterval"
                :step="0.01"
                :min="0.001"
                :precision="4"
                controls-position="right"
              ></el-input-number>
            </div>
            <div flex="main:justify" class="setting-item">
              <span>{{ $t('imageCenter.region') }}(px)：</span>
              <el-input-number
                v-model="radius"
                :min="1"
                :max="200"
                controls-position="right"
                @change="handleRadiusChange"
              ></el-input-number>
            </div>
            <div flex="main:justify" class="setting-item">
              <span>{{ $t('general.move') }}(px)：</span>
              <el-input-number v-model="moveDistance" :min="1"></el-input-number>
            </div>
          </div>
        </el-collapse-item>
        <el-collapse-item name="histogram">
          <template slot="title">
            <span class="collapse-title">{{ $t('histogram.title') }}</span>
          </template>
          <div flex="dir:top" class="setting-group">
            <div flex="main:justify" class="setting-item">
              <span>{{ $t('imageSetting.defaultShowHistogram') }}：</span>
              <el-switch v-model="defaultShowHist"></el-switch>
            </div>
            <div flex="main:justify" class="setting-item">
              <span>{{ $t('histogram.backgroundColor') }}：</span>
              <el-color-picker v-model="histogramBackgroundColor" color-format="rgb"></el-color-picker>
            </div>
            <div flex="main:justify" class="setting-item">
              <span>{{ $t('histogram.multi') }}：</span>
              <el-radio-group v-model="histogramMultiMode">
                <el-radio :label="true" size="mini" border>{{ $t('histogram.multiType') }}</el-radio>
                <el-radio :label="false" size="mini" border>{{ $t('histogram.singleType') }}</el-radio>
              </el-radio-group>
            </div>
            <div flex="main:justify" class="setting-item">
              <span>{{ $t('histogram.drawType') }}：</span>
              <el-radio-group v-model="histogramDrawType">
                <el-radio label="line" size="mini" border>{{ $t('histogram.line') }}</el-radio>
                <el-radio label="rect" size="mini" border>{{ $t('histogram.rect') }}</el-radio>
              </el-radio-group>
            </div>
            <div v-if="histogramDrawType === 'line'" flex="main:justify" class="setting-item">
              <span>{{ $t('histogram.lineWidth') }}(px)：</span>
              <el-input-number v-model="histogramLineWidth" :min="1" :max="100"></el-input-number>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
      <el-button slot="reference" type="text" @click="visible = !visible">
        <svg-icon :clicked="visible" icon-class="settings" style="font-size: 22px"></svg-icon>
      </el-button>
    </el-popover>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('preferenceStore')
const { mapGetters: videoMapGetters, mapActions: videoMapActions } = createNamespacedHelpers('videoStore')

export default {
  name: 'ImageSetting',
  data() {
    return {
      visible: false,
      currentCollapseName: 'common',
      radius: 10,
      baseStyle: 'display: inline-block; margin-right: 5px; width: 24px; height: 24px; border:solid gray 2px;',
      predefineColors: ['#e3e7e900', '#2f2f2f', '#fafafa'],
      colorOptions: [
        {
          mode: 'default',
          color: '#e3e7e900',
          style:
            'background: #e3e7e9; background-image: linear-gradient(45deg, #f6fafc 25%, transparent 0), linear-gradient(45deg, transparent 75%, #f6fafc 0), linear-gradient(45deg, #f6fafc 25%, transparent 0), linear-gradient(45deg, transparent 75%, #f6fafc 0); background-position: 0 0, 10px 10px, 10px 10px, 20px 20px; background-size: 20px 20px;'
        },
        {
          mode: 'dark',
          color: '#2f2f2f',
          style: 'background: #2f2f2f; background-blend-mode: darken;'
        },
        {
          mode: 'white',
          color: '#fafafa',
          style: 'background: #fafafa;'
        }
      ]
    }
  },
  methods: {
    ...mapActions(['setPreference', 'setHistConfig']),
    ...videoMapActions(['setVideoConfig']),
    handleRadiusChange(newVal, oldVal) {
      this.$bus.$emit('radius', newVal)
    },
    handleModeChange(curMode) {
      const bg = this.colorOptions.find((item) => item.mode === curMode)
      this.setPreference({ background: bg })
    }
  },
  computed: {
    ...mapGetters(['preference', 'histConfig']),
    ...videoMapGetters(['videoConfig']),
    scaleOptions: {
      get() {
        return [...this.preference.scaleOptions].sort((a, b) => a - b)
      },
      set(newVal) {
        this.setPreference({
          scaleOptions: [...new Set(newVal.filter((item) => !isNaN(item)).map((item) => Number(item)))]
        })
      }
    },
    videoProcessBarStyle: {
      get() {
        return this.preference.videoProcessBarStyle
      },
      set(arg) {
        this.setPreference({
          videoProcessBarStyle: arg
        })
      }
    },
    dynamicPickColor: {
      get() {
        return this.videoConfig.dynamicPickColor
      },
      set(arg) {
        this.setVideoConfig({
          dynamicPickColor: arg
        })
      }
    },
    videoMuted: {
      get() {
        return this.videoConfig.muted
      },
      set(arg) {
        this.setVideoConfig({
          muted: arg
        })
      }
    },
    enableSyncTime: {
      get() {
        return this.videoConfig.enableSyncTime
      },
      set(arg) {
        this.setVideoConfig({
          enableSyncTime: arg
        })
      }
    },
    frameCompareInterval: {
      get() {
        return this.videoConfig.interval
      },
      set(arg) {
        this.setVideoConfig({
          interval: arg
        })
      }
    },
    renderInterval: {
      get() {
        return this.videoConfig.minRenderInterval
      },
      set(arg) {
        this.setVideoConfig({
          minRenderInterval: arg
        })
      }
    },
    defaultShowHist: {
      get() {
        return this.preference.defaultShowHist // false
      },
      set(newVal) {
        this.setPreference({ defaultShowHist: newVal })
      }
    },
    showTitle: {
      get() {
        return this.preference.showTitle // true
      },
      set(newVal) {
        this.setPreference({ showTitle: newVal })
      }
    },
    showMousePos: {
      get() {
        return this.preference.showMousePos // true
      },
      set(newVal) {
        this.setPreference({ showMousePos: newVal })
      }
    },
    showScale: {
      get() {
        return this.preference.showScale // true
      },
      set(newVal) {
        this.setPreference({ showScale: newVal })
      }
    },
    backgroundStyle: {
      get() {
        return this.preference.background.style // mix
      },
      set(newVal) {
        this.setPreference({ backgroundStyle: newVal })
      }
    },
    mode: {
      get() {
        return this.preference.background.mode // mix
      },
      set(newVal) {
        this.setPreference({ mode: newVal })
      }
    },
    radiusData: {
      get() {
        return this.radius
      },
      set(newVal) {
        console.log('radius', radius)
        this.$bus.$emit('radius', newVal)
      }
    },
    moveDistance: {
      get() {
        return this.preference.moveDistance
      },
      set(arg) {
        this.setPreference({
          moveDistance: arg
        })
      }
    },
    histogramLineWidth: {
      get() {
        return this.histConfig.lineWidth
      },
      set(arg) {
        this.setHistConfig({
          lineWidth: arg
        })
        this.$bus.$emit('changeHistTypes')
      }
    },
    histogramMultiMode: {
      get() {
        return this.histConfig.multi
      },
      set(multi) {
        this.setHistConfig({
          multi,
          histTypes: multi ? this.histConfig.histTypes : [this.histConfig.histTypes[0]]
        })
        this.$bus.$emit('changeHistTypes')
      }
    },
    histogramDrawType: {
      get() {
        return this.histConfig.drawType
      },
      set(type) {
        this.setHistConfig({
          drawType: type
        })
        this.$bus.$emit('changeHistTypes')
      }
    },
    histogramBackgroundColor: {
      get() {
        return `rgba(${this.histConfig.backgroundColor.join(',')})`
      },
      set(color) {
        const reg = /rgb\((?<r>\d*),\D*(?<g>\d*),\D*(?<b>\d*)\)/gm
        const res = reg.exec(color)
        if (Object.keys(res?.groups).every((key) => !isNaN(res?.groups?.[key]))) {
          const { r, g, b } = res.groups
          this.setHistConfig({
            backgroundColor: [Number(r), Number(g), Number(b), 255]
          })
          this.$bus.$emit('changeHistTypes')
        }
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
@import '@/styles/variables.scss';

.image-setting {
  position: relative;
  font-size: 16px;

  .header {
    .title {
      font-weight: bold;
      text-align: center;
    }

    .close-btn {
      position: absolute;
      top: 5px;
      right: 10px;

      .icon {
        &:hover {
          color: red;
        }

        font-size: 18px;
      }
    }
  }

  .setting-group {
    .setting-item {
      margin-top: 10px;
    }
  }

  .collapse-title {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
