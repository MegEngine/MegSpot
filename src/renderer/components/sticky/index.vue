<template>
  <div class="sticky-container">
    <div
      :class="{
        'process-bar-container': innerOpen,
        'control-btn-container': !innerOpen,
        'more-tran-animate': !mouseDownState && innerOpen
      }"
      ref="actionMgr"
      :style="{ ...position, backgroundColor }"
      @mousedown.capture="handleMouseDown"
    >
      <div v-show="!innerOpen" @click="handleBtnClick" class="control-btn">
        <slot name="icon"></slot>
      </div>
      <div v-show="innerOpen" @contextmenu="handleClick">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sticky',
  props: {
    parentContainerName: {
      type: String,
      default: 'container'
    },
    contentDragDisabled: {
      type: Boolean,
      default: false
    },
    // 通过position来设置初始定位
    position: {
      type: Object,
      default: function() {
        return {
          right: '20px',
          bottom: '100px'
        };
      }
    },
    backgroundColor: {
      type: String,
      default: '#fff'
    }
  },
  data() {
    return {
      innerOpen: false, //  菜单展开状态
      mouseDownState: false, //  鼠标点击状态
      changed: false, // 进度条是否完成了拖动过程
      iX: 0,
      iY: 0,
      dX: 0,
      dY: 500, //  初始定位
      lastMoveIndex: 0, //  拖拽计数
      curMoveIndex: 0 //  历史计数
    };
  },
  mounted() {
    this.$on('changed', this.handleChanged);
    this.$nextTick(() => {
      this.parentContainer = this.$parent.$refs[this.parentContainerName];
      this.parentContainer.addEventListener('mouseup', this.handleMouseUp);
      this.parentContainer.addEventListener('mousemove', this.handleMouseMove);
    });
  },
  beforeDestroy() {
    this.$off('changed', this.handleChanged);
    this.parentContainer.removeEventListener('mouseup', this.handleMouseUp);
    this.parentContainer.removeEventListener('mousemove', this.handleMouseMove);
  },
  methods: {
    handleClick() {
      this.innerOpen = false;
      this.changed = true;
    },
    handleChanged(value) {
      this.changed = value;
    },
    //  鼠标按下
    handleMouseDown(event) {
      //  如果进度条为拖动状态，则不做响应
      if ((this.contentDragDisabled && this.innerOpen) || !this.changed) {
        this.mouseDownState = false;
        return;
      }
      /* 此处判断  pc 或 移动端 得到 event 事件 */
      var touch;
      if (event.touches) {
        touch = event.touches[0];
      } else {
        touch = event;
      }
      // 鼠标点击 面向页面 的 x坐标 y坐标
      let { clientX, clientY } = touch;
      // 鼠标x坐标 - 拖拽按钮x坐标  得到鼠标 距离 拖拽按钮 的间距
      this.iX = clientX - this.$refs.actionMgr.offsetLeft;
      // 鼠标y坐标 - 拖拽按钮y坐标  得到鼠标 距离 拖拽按钮 的间距
      this.iY = clientY - this.$refs.actionMgr.offsetTop;
      // 设置当前 状态为 鼠标按下
      this.mouseDownState = true;
    },
    //  鼠标拖拽
    handleMouseMove(event) {
      if ((this.contentDragDisabled && this.innerOpen) || !this.changed) {
        this.mouseDownState = false;
        return;
      }
      //鼠标按下 切移动中
      if (this.mouseDownState) {
        /* 此处判断  pc 或 移动端 得到 event 事件 */
        var touch;
        if (event.touches) {
          touch = event.touches[0];
        } else {
          touch = event;
        }
        // 鼠标移动时 面向页面 的 x坐标 y坐标
        let { clientX, clientY } = touch;
        //当前页面全局容器 dom 元素  获取容器 宽高
        let {
          clientHeight: pageDivY,
          clientWidth: pageDivX
        } = this.parentContainer;
        /* 鼠标坐标 - 鼠标与拖拽按钮的 间距坐标  得到 拖拽按钮的 左上角 x轴y轴坐标 */
        let [x, y] = [clientX - this.iX, clientY - this.iY];

        //拖拽按钮 dom 元素  获取 宽高 style 对象
        let {
          clientHeight: actionMgrY,
          clientWidth: actionMgrX,
          style: actionMgrStyle
        } = this.$refs.actionMgr;
        /* 此处判断 拖拽按钮 如果超出 屏幕宽高 或者 小于
         * 设置 屏幕最大 x=全局容器x y=全局容器y 否则 设置 为 x=0 y=0
         */
        if (x > pageDivX - actionMgrX) x = pageDivX - actionMgrX;
        else if (x < 0) x = 0;
        if (y > pageDivY - actionMgrY) y = pageDivY - actionMgrY;
        else if (y < 0) y = 0;
        this.dX = x;
        this.dY = y;
        // 计算后坐标  设置 按钮位置
        actionMgrStyle.left = `${x}px`;
        actionMgrStyle.top = `${y}px`;
        actionMgrStyle.bottom = 'auto';
        actionMgrStyle.right = 'auto';
        //  move Index
        this.lastMoveIndex++;
        //  当按下键滑动时， 阻止屏幕滑动事件
        event.preventDefault();
      }
    },
    // 鼠标抬起
    handleMouseUp() {
      if ((this.contentDragDisabled && this.innerOpen) || !this.changed) {
        this.mouseDownState = false;
        return;
      }
      this.mouseDownState = false;
    },
    // 单击事件
    handleBtnClick() {
      //  mouseup 后会激活click事件
      //  如果上一次down事件到下一次click事件中经历10次以下move，则视为纯点击事件
      if (this.lastMoveIndex - this.curMoveIndex <= 10) {
        //  点击事件
        this.innerOpen = !this.innerOpen;
        if (this.innerOpen) {
          let {
            clientHeight: windowHeight,
            clientWidth: windowWidth
          } = document.documentElement;

          //  拖拽按钮 dom 元素  获取 宽高 style 对象
          let { style: actionMgrStyle } = this.$refs.actionMgr;
          // 计算后坐标  设置 按钮位置
          this.innerOpen &&
            this.calcPosition(actionMgrStyle, windowWidth, windowHeight);
        }
      }
      this.curMoveIndex = this.lastMoveIndex;
    },
    calcPosition(actionMgrStyle, windowWidth, windowHeight) {
      if (this.dY > 0 && this.dY < windowHeight - 50) {
        //  不在顶部 且 不在底部
        if (this.dX <= windowWidth / 2) {
          //  left 小于等于屏幕一半
          actionMgrStyle.left = 0;
          actionMgrStyle.right = 'auto';
        } else {
          //  left 大于屏幕一半
          actionMgrStyle.left = 'auto';
          actionMgrStyle.right = 0;
        }
        if (this.dY >= windowHeight / 2) {
          //  宽度大于1/2时，是将top改为auto，调整bottom
          actionMgrStyle.top = 'auto';
          actionMgrStyle.bottom = windowHeight - this.dY - 50 + 'px';
        }
      } else {
        if (this.dY === 0) {
          //  在顶部
          actionMgrStyle.top = 0;
          actionMgrStyle.bottom = 'auto';
        } else if (this.dY === windowHeight - 50) {
          actionMgrStyle.bottom = 0;
          actionMgrStyle.top = 'auto';
        }
        if (this.dX >= windowWidth / 2) {
          //  右侧是将left改为auto，调整right
          actionMgrStyle.left = 'auto';
          actionMgrStyle.right = windowWidth - this.dX - 50 + 'px';
        }
      }
      return actionMgrStyle;
    }
  }
};
</script>

<style lang="scss" scoped>
.sticky-container {
  z-index: 9999;

  .more-tran-animate {
    transition: 0.5s;
  }
  .control-btn-container {
    &:hover {
      opacity: 1;
    }
    /* 如果碰到滑动问题, 注意z-index需比web大一级*/
    z-index: 9999;
    position: fixed;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.5);
    line-height: 40px;
    text-align: center;
    opacity: 0.6;

    .control-btn {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
  }

  .process-bar-container {
    position: fixed;
    z-index: 9999;
    width: 90vw;
    border-radius: 5px;
    background: #1a1a1a;
    color: #fff;
  }
}
</style>
