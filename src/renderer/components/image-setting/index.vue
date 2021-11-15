<template>
  <div flex="main:right">
    <el-popover
      effect="light"
      placement="bottom"
      trigger="click"
      popper-class="image-setting"
      @click.stop
    >
      <div flex="dir:top" class="setting-group">
        <div flex class="setting-item">
          <span>show image name：</span>
          <el-switch v-model="showTitle" style="margin-right: 20px;">
          </el-switch>
        </div>
        <div flex class="setting-item">
          <span>show histogram by default：</span>
          <el-switch v-model="defaultShowHist"> </el-switch>
        </div>
        <div flex class="setting-item">
          <span>background mode：</span>
          <el-select
            v-model="mode"
            placeholder="please select background color"
            style="width: 100px;"
            @change="handleModeChange"
          >
            <div>
              <el-option
                v-for="(item, index) in colorOptions"
                :key="index"
                :label="item.mode"
                :value="item.mode"
                flex="main:justify cross:center"
              >
                <div style="">{{ item.mode }}</div>
                <div flex="main:justify">
                  <span style="color: #8492a6; font-size: 13px"
                    >{{ item.color.slice(0, 7) }}&nbsp;&nbsp;</span
                  >
                  <div :style="baseStyle + item.style"></div>
                </div>
              </el-option>
            </div>
          </el-select>
          <el-color-picker
            v-show="false"
            v-model="bgColor"
            :predefine="predefineColors"
            show-alpha
          >
          </el-color-picker>
        </div>
        <div class="setting-item">
          <span>region：</span>
          <el-input-number
            v-model="radius"
            :min="1"
            :max="200"
            @change="handleRadiusChange"
          ></el-input-number>
        </div>
      </div>
      <el-button slot="reference" type="text">
        <svg-icon icon-class="settings" style="font-size: 22px;"></svg-icon>
      </el-button>
    </el-popover>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('preferenceStore');
export default {
  name: 'ImageSetting',
  data() {
    return {
      radius: 10,
      value: null,
      mode: 'white',
      bgColor: '#fff',
      baseStyle:
        'display: inline-block; margin-right: 5px; width: 24px; height: 24px; border:dashed gray 2px;',
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
    };
  },
  methods: {
    ...mapActions(['setPreference']),
    handleRadiusChange(newVal, oldVal) {
      this.$bus.$emit('radius', newVal);
    },
    handleModeChange(curMode) {
      const bg = this.colorOptions.find(item => item.mode === curMode);
      this.bgColor = bg.color;
      this.setPreference({ background: bg });
    }
  },
  computed: {
    ...mapGetters(['preference']),
    defaultShowHist: {
      get() {
        return this.preference.defaultShowHist; // true
      },
      set(newVal) {
        this.setPreference({ defaultShowHist: newVal });
      }
    },
    showTitle: {
      get() {
        return this.preference.showTitle; // true
      },
      set(newVal) {
        this.setPreference({ showTitle: newVal });
      }
    },
    backgroundStyle: {
      get() {
        return this.preference.background.style; // mix
      },
      set(newVal) {
        this.setPreference({ backgroundStyle: newVal });
      }
    },
    radiusData: {
      get() {
        return this.radius;
      },
      set(newVal) {
        console.log('radius', radius);
        this.$bus.$emit('radius', newVal);
      }
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.image-setting {
  font-size: 16px;
  .setting-group {
    :first-child {
      margin-top: 0 !important;
    }
    .setting-item {
      margin-top: 10px;
    }
  }
}
</style>
