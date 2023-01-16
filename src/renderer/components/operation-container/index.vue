<template>
  <div class="operation-container" ref="container">
    <slot></slot>
  </div>
</template>
<script>
/**
 * 用于统一处理拖动缩放悬浮等操作 外暴露处理后的事件
 */
export default {
  name: 'Operationcontainer',
  data() {
    return {
      scaleFactor: 1.1,
      contentPos: { ix: 0, iy: 0, iw: 800, ih: 800 },
      mousePos: { mx: 0, my: 0 },
      isMouseDown: false,
      isMove: false,
      scrollEnd: undefined,
      current: Date.now()
    }
  },

  mounted() {
    this.addEvents()
  },
  beforeDestroy() {
    this.removeEvents()
  },
  methods: {
    addEvents() {
      this.containerDom = this.$refs.container
      this.containerDom.addEventListener('mousedown', this.doMouseDown, false)
      this.containerDom.addEventListener('mousemove', this.doMouseMove, false)
      this.containerDom.addEventListener('mouseleave', this.doMouseLeave, false)
      this.containerDom.addEventListener('mouseup', this.doMouseUp, false)
      this.containerDom.addEventListener('mousewheel', this.doMouseScroll, false)
      this.containerDom.addEventListener('click', this.doClick, false)
      this.containerDom.addEventListener('dblclick', this.doDbclick, false)
    },
    removeEvents() {
      this.containerDom.removeEventListener('mousedown', this.doMouseDown, false)
      this.containerDom.removeEventListener('mousemove', this.doMouseMove, false)
      this.containerDom.removeEventListener('mouseleave', this.doMouseLeave, false)
      this.containerDom.removeEventListener('mouseup', this.doMouseUp, false)
      this.containerDom.removeEventListener('mousewheel', this.doMouseScroll, false)
      this.containerDom.removeEventListener('click', this.doClick, false)
      this.containerDom.removeEventListener('dblclick', this.doDbclick, false)
    },
    doClick(e) {
      // 避免mouseup触发click
      if (this.isMove) return
      const mousePos = this.transformLocationToParent(this.containerDom, e.clientX, e.clientY)
      this.$emit('click', mousePos)
      if (e.button === 0) {
        this.$emit('leftClick', this.mousePos, e)
      } else if (e.button === 2) {
        this.$emit('rightClick', this.mousePos, e)
      }
    },
    doDbclick(e) {
      const mousePos = this.transformLocationToParent(this.containerDom, e.clientX, e.clientY)
      this.$emit('dbclick', mousePos)
    },
    doMouseDown(e) {
      this.isMouseDown = true
      this.isMove = false
      // 获取初始化位置
      this.mousePos = this.transformLocationToParent(this.containerDom, e.clientX, e.clientY)
      this.$emit('mouseDown', this.mousePos, e)
    },
    doMouseUp(e) {
      this.isMouseDown = false
      if (this.isMove) {
        setTimeout(() => {
          this.isMove = false
        })
      }
      this.containerDom.style.cursor = 'default'
      // 获取初始化位置
      this.mousePos = this.transformLocationToParent(this.containerDom, e.clientX, e.clientY)
      this.$emit('mouseUp', this.mousePos, e)
    },
    doMouseMove: function (e) {
      const mousePos = this.transformLocationToParent(this.containerDom, e.clientX, e.clientY)
      if (!this.isMouseDown) {
        this.containerDom.style.cursor = 'default'
        this.$emit('mouseMove', mousePos)
        return
      }
      this.isMove = true
      this.containerDom.style.cursor = 'move'
      // 获取偏移 更新初始位置
      const offset = this.getOffset(this.mousePos, mousePos)
      this.mousePos = mousePos
      this.$emit('drag', offset, e)
      return e.preventDefault() && false
    },
    doMouseLeave() {
      this.isMouseDown = false
    },
    doMouseScroll: function (e) {
      const delta = (e.wheelDelta / 80).toFixed(2)
      if (delta > 0) {
        this.containerDom.style.cursor = 'zoom-in'
      } else {
        this.containerDom.style.cursor = 'zoom-out'
      }
      const mousePos = this.transformLocationToParent(this.containerDom, e.clientX, e.clientY)
      // let rate = 1 + 0.1 * delta
      // // 避免极值
      // if (rate < 0.5) {
      //   rate = 0.5
      // }
      let rate = Math.pow(this.scaleFactor, delta)
      this.$emit('zoom',e, rate, mousePos)
      clearTimeout(this.scrollEnd)
      this.scrollEnd = setTimeout(() => {
        this.$emit('scrollEnd',e)
      }, 200)
      return e.preventDefault() && false
    },
    transformLocationToParent(parent, x, y) {
      var { left, top } = parent.getBoundingClientRect() //getBoundingClientRect获取元素相对于视窗的位置集合
      return {
        x: Number((x - left).toFixed(0)),
        y: Number((y - top).toFixed(0))
      }
    },
    getOffset(oldPos, newPos) {
      return {
        x: newPos.x - oldPos.x,
        y: newPos.y - oldPos.y
      }
    },
    // 供外部直接调用
    getContainerDom() {
      return this.$refs.container
    }
  }
}
</script>

<style scoped>
.operation-container {
  position: relative;
  overflow: hidden;
}
</style>
