<template>
  <el-tooltip effect="light" placement="bottom">
    <div slot="content" class="image-style-container">
      <el-row :gutter="10">
        <el-col :span="6">
          <span class="text-style">brightness</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            :min="0"
            :max="500"
            v-model="brightness"
            :format-tooltip="
              val => {
                return val + '%';
              }
            "
          ></el-slider
        ></el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6">
          <span class="text-style">contrast</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            :min="0"
            :max="500"
            v-model="contrast"
            :format-tooltip="
              val => {
                return val + '%';
              }
            "
          ></el-slider
        ></el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6">
          <span class="text-style">saturate</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            :min="0"
            :max="500"
            v-model="saturate"
            :format-tooltip="
              val => {
                return val + '%';
              }
            "
          ></el-slider
        ></el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6">
          <span class="text-style">grayscale</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            :min="0"
            :max="100"
            v-model="grayscale"
            :format-tooltip="
              val => {
                return val + '%';
              }
            "
          ></el-slider
        ></el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6">
          <span class="text-style">opacity</span>
        </el-col>
        <el-col :span="18">
          <el-slider
            :min="0"
            :max="100"
            v-model="opacity"
            :format-tooltip="
              val => {
                return val + '%';
              }
            "
          ></el-slider
        ></el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6"> <span class="text-style">blur</span></el-col>
        <el-col :span="18">
          <el-slider :min="0" :max="15" v-model="blur"></el-slider
        ></el-col>
      </el-row>
      <el-button @click="resetImageStyle" style="float:right">
        reset
      </el-button>
    </div>
    <el-button type="text" size="medium" id="preview">
      <svg-icon icon-class="eye-open"></svg-icon>
    </el-button>
  </el-tooltip>
</template>

<script>
export default {
  name: 'EffectPreview',
  data() {
    return {
      // 预览处理效果
      brightness: 100,
      contrast: 100,
      saturate: 100,
      grayscale: 0,
      opacity: 100,
      blur: 0
    };
  },
  computed: {
    canvasStyle() {
      let filter = '';
      ['brightness', 'contrast', 'saturate', 'grayscale', 'opacity'].forEach(
        item => {
          filter += `${item}(${this[item]}%) `;
        }
      );
      ['blur'].forEach(item => {
        filter += `${item}(${this[item]}px) `;
      });
      return filter;
    }
  },
  watch: {
    canvasStyle() {
      this.$emit('change', this.canvasStyle);
    }
  },
  methods: {
    resetImageStyle() {
      // 预览处理效果
      this.brightness = 100;
      this.contrast = 100;
      this.saturate = 100;
      this.grayscale = 0;
      this.opacity = 100;
      this.blur = 0;
    }
  }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.image-style-container {
  width: 300px;
  padding-right: 5px;
  #preview {
    position: absolute;
    top: 0;
    right: 14px;
    z-index: 1;
    padding: 0;
  }

  .text-style {
    color: #82848a;
    font-size: 14px;
    margin-left: 3px;
  }
  ::v-deep {
    .el-row {
      display: flex;
      align-items: center;
    }
  }
}
</style>
