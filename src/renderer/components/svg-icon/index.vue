<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script>
export default {
  name: 'svg-icon',
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String
    }
  },
  computed: {
    iconName() {
      return `#icon-${this.iconClass}`;
    },
    svgClass() {
      if (this.className) {
        return 'svg-icon ' + this.className;
      } else {
        return 'svg-icon';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  color: $svgColor;
  overflow: hidden;
  &:hover {
    color: $primaryColor;
  }
}
// 如果 svg-icon 用在el-button 中 应该由el-button设置颜色  所以这里设置为继承
.el-radio-button__inner .svg-icon {
  color: inherit;
}
</style>
