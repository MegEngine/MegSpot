<template>
  <div
    id="rgba-exhibit"
    flex="main:right"
    v-tip.sure.right="
      `left click start or stop get average RGBA value. \nChange region by hover setting button`
    "
  >
    <div id="rgba-content" flex="cross:center">
      <div
        id="rgba-block"
        :style="{
          backgroundColor: `rgba(
                ${RGBAcolor.R},
                ${RGBAcolor.G},
                ${RGBAcolor.B},
                ${RGBAcolor.A}
              )`
        }"
      ></div>
      <span class="text-style"
        >{{ `${RGBAcolor.R}, ${RGBAcolor.G}, ${RGBAcolor.B} ` }}
      </span>
    </div>
    <el-tooltip effect="light" placement="bottom">
      <div slot="content" id="rgba-region">
        <span class="text-style">region:</span>
        <el-input-number
          id="slider"
          v-model="radiusData"
          :min="1"
          :max="200"
        ></el-input-number>
      </div>
      <el-button type="text" size="medium">
        <svg-icon icon-class="settings"></svg-icon>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'RGBAExhibit',
  model: {
    prop: 'radius',
    event: 'update'
  },
  props: {
    RGBAcolor: {
      type: Object,
      required: true
    },
    radius: {
      type: Number,
      required: true
    }
  },
  computed: {
    radiusData: {
      get() {
        return this.radius;
      },
      set(newVal) {
        this.$emit('update', newVal);
      }
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
#rgba-exhibit {
  z-index: 1;
  width: 150px;
  margin-right: 5px;
  #rgba-content {
    .text-style {
      margin-right: 5px;
      white-space: nowrap;
    }
    #rgba-block {
      width: 20px;
      height: 20px;
      margin-right: 5px;
      display: inline-block;
    }
  }
}
</style>
