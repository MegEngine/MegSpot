<template>
  <div class="mask">
    <slot></slot>
    <canvas
      ref="canvas"
      class="mask-canvas"
      v-show="visible"
      :width="canvasStyle.width"
      :height="canvasStyle.height"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: 'CoverMask',
  props: {
    mask: {
      type: HTMLCanvasElement,
      required: false
    }
  },
  data() {
    return {
      visible: false,
      canvas: undefined,
      canvasStyle: {}
    }
  },
  watch: {
    mask() {
      this.canvas = this.$refs.canvas
      const ctx = this.canvas.getContext('2d')
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      if (this.mask) {
        this.canvasStyle = {
          width: this.mask.width,
          height: this.mask.height
        }
        this.visible = true
        this.$nextTick(() => {
          ctx.drawImage(this.mask, 0, 0)
        })
      } else {
        this.visible = false
      }
    }
  },

  methods: {}
}
</script>

<style lang="scss" scoped>
.mask {
  position: relative;
  float: left;
  .mask-canvas {
    position: absolute;
    left: 0;
    top: 9px !important; // 需要和hist-container样式保持一致，使得hist完全覆盖重叠
    z-index: 2;
    width: 160px;
    height: 90px;
  }
}
</style>
