<template>
  <div id="rgba-exhibit">
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
  </div>
</template>

<script>
export default {
  name: 'RGBAExhibit',
  props: {
    RGBAcolor: {
      type: Object,
      required: true
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
#rgba-exhibit {
  z-index: 1;
  width: 130px;
  float: right;
  // margin-left: 5px;
  #rgba-content {
    .text-style {
      // margin-right: 5px;
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
