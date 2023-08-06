<template>
  <div class="zoom-viewer" :style="style">
    <div v-show="showPos" class="pos-info">{{ mousePosInfo.x.toFixed(2) }},{{ mousePosInfo.y.toFixed(2) }}</div>
    <canvas ref="canvas" :width="r_width" :height="r_height"></canvas>
    <div class="color-tip">
      <div class="color-box" :style="boxStyle"></div>
      <span class="color-text">{{ colorText }}</span>
    </div>
  </div>
</template>

<script>
import { clamp, checkBoundary } from '@/utils'
import { i18nRender } from '@/lang'
import { createNamespacedHelpers } from 'vuex'

const { mapGetters } = createNamespacedHelpers('preferenceStore')

export default {
  name: 'zoom-viewer',
  props: {
    pixelNum: {
      type: Number,
      default: 9
    },
    width: {
      type: Number,
      default: 90
    },
    height: {
      type: Number,
      default: 90
    },
    parentWidth: {
      type: Number,
      default: 400
    },
    parentHeight: {
      type: Number,
      default: 300
    },
    smooth: {
      type: Boolean,
      default: false
    },
    mousePos: {
      type: Object,
      default: () => ({
        x: 0,
        y: 0
      })
    },
    mousePosInfo: {
      type: Object,
      default: () => ({
        x: 0,
        y: 0
      })
    },
    RGBAcolor: {
      type: Object,
      default: () => ({
        R: 0,
        G: 0,
        B: 0,
        A: 0
      })
    }
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      r_width: 90,
      r_height: 90,
      previousData: {
        imgSource: null,
        x: 0,
        y: 0
      }
    }
  },
  mounted() {
    this.r_width = this.width
    this.r_height = this.height
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext('2d')
    this.ctx.imageSmoothingEnabled = this.smooth
  },
  computed: {
    ...mapGetters(['preference']),
    pixelNumAvg() {
      return Math.floor(this.pixelNum / 2)
    },
    style() {
      const { x, y } = checkBoundary(
        this.mousePos.x,
        this.mousePos.y,
        this.r_width,
        this.r_height + 20,
        this.parentWidth,
        this.parentHeight,
        10,
        10
      )
      return this.mousePos?.x !== 0
        ? {
            left: `${x}px`,
            top: `${y}px`
          }
        : {
            top: 0,
            right: 0
          }
    },
    colorData: {
      get() {
        return this.RGBAcolor
      },
      set(val) {
        this.$emit('update:RGBAcolor', val)
      }
    },
    boxStyle() {
      const { R, G, B } = this.colorData
      return `background-color: rgb(${R}, ${G}, ${B});`
    },
    colorText() {
      switch (this.preference.colorPickerMode) {
        case 'hex':
          return this.hex()
          break
        case 'rgb':
        default:
          return this.rgb()
          break
      }
    },
    showPos() {
      return this.preference.colorPickerShowPos
    }
  },
  methods: {
    hex() {
      const { R, G, B, A } = this.colorData
      return ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)
    },
    rgb() {
      const { R, G, B, A } = this.colorData
      return `${R},${G},${B}`
    },
    // HTMLCanvasElement or OffscreenCanvas
    // TODO: now not supports HTMLVideoElement
    draw(imgSource, { x, y }) {
      if (!this.ctx) return

      Object.assign(this.previousData, { x, y, imgSource })

      const pixelNum = this.pixelNum
      const pixelNumAvg = this.pixelNumAvg
      const _x = clamp(Math.floor(x - pixelNumAvg), 0, imgSource.width ?? imgSource.videoWidth)
      const _y = clamp(Math.floor(y - pixelNumAvg), 0, imgSource.height ?? imgSource.videoHeight)

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.drawImage(imgSource, _x, _y, pixelNum, pixelNum, 0, 0, this.r_width, this.r_height)

      const rectX = (this.r_width * pixelNumAvg) / pixelNum
      const rectY = (this.r_height * pixelNumAvg) / pixelNum

      const isBright = this.pickColor(rectX + 1, rectY + 1)

      // invert padding color of the center pixel
      this.ctx.strokeStyle = isBright ? 'black' : 'white'
      this.ctx.strokeRect(rectX, rectY, this.r_width / pixelNum, this.r_height / pixelNum)
    },
    pickColor(x, y) {
      const pixel = this.ctx.getImageData(x, y, 1, 1)
      let [R, G, B, A] = pixel.data
      A = parseInt(A / 255)

      Object.assign(this.colorData, {
        R,
        G,
        B,
        A
      })

      return (0.299 * R + 0.587 * G + 0.114 * B) / 255 >= 0.8
    },
    // TODO: 支持改变大小 ctrl + 滚轮
    changeCanvas(size) {
      // const bitMap = createImageBitmap(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height))
      const _size = size ?? this.width
      this.r_width = _size
      this.r_height = _size

      if (this.previousData?.imgSource) {
        const { x, y, imgSource } = this.previousData
        this.draw(imgSource, { x, y })
      }
      // if (offsetStyle) {
      //   console.log('offset', offsetStyle)
      //   this.style = offsetStyle
      // }
      // this.canvas.style.width = '180px'
      // this.canvas.style.height = '180px'
      // this.canvas.style.transform = 'scale(2)'

      // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      // this.ctx.drawImage(bitMap, 0, 0, this.canvas.width, this.canvas.heigh)
    },
    copyColor() {
      navigator.clipboard?.writeText(this.colorText)?.then(() => {
        this.$message.success(`${i18nRender('imageCenter.copyColorTip')}: ${this.colorText}`)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.zoom-viewer {
  position: absolute;
  z-index: 2;

  canvas {
    border: 1px solid rgb(254, 254, 254, 0.7);
  }

  .pos-info {
    display: block;
    flex: 1;
    height: 20px;
    text-align: center;
    line-height: 20px;
    color: #fefefe;
    background-color: #22272e;
    border-radius: 3px;
  }
  .color-tip {
    width: 100%;
    height: 20xp;
    display: flex;
    align-items: center;
    gap: 3px;
    .color-box {
      width: 20px;
      height: 20px;
      border-radius: 3px;
      outline: 1px solid rgb(254, 254, 254, 0.7);
      background-color: rgba(0, 0, 0, 0);
    }

    .color-text {
      display: block;
      flex: 1;
      height: 20px;
      text-align: center;
      line-height: 20px;
      color: #fefefe;
      background-color: #22272e;
      border-radius: 3px;

      // max-width: calc(100% - 28px);
      // overflow: hidden;
      // text-overflow: ellipsis;
      // white-space: nowrap;
    }
  }
}
</style>
