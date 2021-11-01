<template>
  <div
    id="image-container"
    ref="container"
    class="canvas-container"
    :style="containerStyle"
  >
    <div v-for="imgs in imageGroupList" :key="imgs">
      <ImageCanvas
        ref="image_canvas"
        :imgSrc="imgs"
        :_width="canvasWidth"
        :_height="canvasHeight"
      ></ImageCanvas>
    </div>
  </div>
</template>
<script>
import ImageCanvas from './components/ImageCanvas';
import { throttle } from '@/utils';
import * as GLOBAL_CONSTANTS from '@/constants';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('imageStore');
export default {
  components: { ImageCanvas },
  data() {
    return {
      canvasWidth: 0,
      canvasHeight: 0,
      groupIndex: 0, // 当前组的序号
      scheduleCanvasActions: [
        {
          event: 'setOverLay',
          action: 'setOverLay'
        },
        {
          event: 'getImageDetails',
          action: 'getImageDetails'
        },
        {
          event: 'changeGroup',
          action: 'changeGroup'
        }
      ]
    };
  },
  mounted() {
    this.calcCanvasSize();
    // 调度事件  使用当前组件的方法
    this.scheduleCanvasActions.forEach(item => {
      this.$bus.$on(item.event, this[item.action]);
    });
    // resize 后重新计算宽高并渲染
    window.addEventListener('resize', this.handleResize, true);
  },
  beforeDestroy() {
    this.scheduleCanvasActions.forEach(item => {
      this.$bus.$off(item.event, this[item.action]);
    });
  },
  computed: {
    ...mapGetters(['imageList', 'imageConfig']),
    // 每组图片数量
    groupCount() {
      const str = this.imageConfig.layout,
        len = str.length;
      return str[len - 3] * str[len - 1];
    },
    // 当前组的图片列表
    imageGroupList() {
      return this.imageList
        ? this.imageList.slice(
            this.groupIndex,
            this.groupIndex + this.groupCount
          )
        : [];
    },
    containerStyle() {
      switch (this.imageConfig.layout) {
        case GLOBAL_CONSTANTS.LAYOUT_1X1:
          return {
            display: 'flex',
            flexDirection: 'column'
          };
        case GLOBAL_CONSTANTS.LAYOUT_2X1:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr'
          };
        case GLOBAL_CONSTANTS.LAYOUT_3X1:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr'
          };
        case GLOBAL_CONSTANTS.LAYOUT_4X1:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr'
          };
        case GLOBAL_CONSTANTS.LAYOUT_2X2:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '50% 50%'
          };
        case GLOBAL_CONSTANTS.LAYOUT_3X2:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '50% 50%'
          };
        default:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr'
          };
      }
    }
  },
  watch: {
    imageList() {
      this.$nextTick(() => {
        this.calcCanvasSize();
      });
    },
    imageGroupList() {
      this.$nextTick(() => {
        this.calcCanvasSize();
        this.udpateAllCanvas();
      });
    },
    'imageConfig.layout'() {
      this.$nextTick(() => {
        this.calcCanvasSize();
        this.udpateAllCanvas();
      });
    }
  },
  methods: {
    // 接收改变当前组序号
    changeGroup(groupStartIndex) {
      console.log('change group', groupStartIndex);
      this.groupIndex = groupStartIndex;
    },
    ...mapActions(['setCanvasSize']),
    handleResize: throttle(50, function() {
      this.calcCanvasSize();
      // 重新布局图片容器;
      this.udpateAllCanvas();
    }),
    calcCanvasSize() {
      this.canvasWidth = this.calcWidth();
      this.canvasHeight = this.calcHeight() - 18;
      this.setCanvasSize({
        width: this.canvasWidth,
        height: this.canvasHeight
      });
    },
    calcWidth() {
      const containerWidth = document.body.clientWidth;
      switch (this.imageConfig.layout) {
        case GLOBAL_CONSTANTS.LAYOUT_1X1:
          return containerWidth;
        case GLOBAL_CONSTANTS.LAYOUT_2X1:
        case GLOBAL_CONSTANTS.LAYOUT_2X2:
          return containerWidth / 2;
        case GLOBAL_CONSTANTS.LAYOUT_3X1:
        case GLOBAL_CONSTANTS.LAYOUT_3X2:
          return containerWidth / 3;
        case GLOBAL_CONSTANTS.LAYOUT_4X1:
          return containerWidth / 4;
      }
    },
    calcHeight() {
      const toolbarInfo = document
        .getElementsByClassName('toolbar')[0]
        .getBoundingClientRect();
      const headerInfo = document
        .getElementsByClassName('header')[0]
        .getBoundingClientRect();
      const containerHeight =
        document.body.clientHeight - toolbarInfo.height - headerInfo.height;
      switch (this.imageConfig.layout) {
        case GLOBAL_CONSTANTS.LAYOUT_1X1:
        case GLOBAL_CONSTANTS.LAYOUT_2X1:
        case GLOBAL_CONSTANTS.LAYOUT_3X1:
        case GLOBAL_CONSTANTS.LAYOUT_4X1:
          return containerHeight;
        case GLOBAL_CONSTANTS.LAYOUT_2X2:
        case GLOBAL_CONSTANTS.LAYOUT_3X2:
          return containerHeight / 2;
      }
    },
    setOverLay({ direction, status }) {
      const handlecover = this.handleCompareOptions(direction);
      this.snapAndCover(
        handlecover.snapShotArr,
        handlecover.coveredArr,
        status
      );
    },
    getImageDetails(imageNameList, callback) {
      let canvasViews = this.$refs['image_canvas'];
      try {
        let details = canvasViews
          .filter(
            item => imageNameList.findIndex(name => name === item.imgSrc) > -1
          )
          .map(item => {
            return {
              path: item.imgSrc,
              canvas: item.canvas
            };
          });
        callback(details);
      } catch (error) {
        console.log(error);
        this.$message.error(error.toString() || error.message);
      }
    },
    udpateAllCanvas() {
      this.$refs['image_canvas'].forEach(item => {
        // 重新设定宽高 然后重新绘制canvas
        item.height = Math.floor(this.canvasHeight);
        item.width = Math.floor(this.canvasWidth);
        item.reMount();
      });
    },
    handleCompareOptions(direction) {
      const columnLen = this.getColumnLine();
      const canvasViews = this.$refs['image_canvas'];
      let snapShotArr = [];
      let coveredArr = [];
      if (
        [
          GLOBAL_CONSTANTS.DIRECTION_LEFT,
          GLOBAL_CONSTANTS.DIRECTION_RIGHT
        ].includes(direction)
      ) {
        //左右对比,取整行进行比较
        if (columnLen === 3) {
          //不满一行则补全
          const compareLine = Math.ceil(canvasViews.length / 3);
          for (let i = 0; i < compareLine; i++) {
            const leftItem = canvasViews[i * 3];
            const middleItem = canvasViews[i * 3 + 1];
            const rightItem = canvasViews[i * 3 + 2];
            if (direction === GLOBAL_CONSTANTS.DIRECTION_LEFT) {
              if (middleItem) {
                snapShotArr.push(middleItem);
                coveredArr.push(leftItem);
              }
              if (rightItem) {
                snapShotArr.push(rightItem);
                coveredArr.push(middleItem);
              }
            } else if (direction === GLOBAL_CONSTANTS.DIRECTION_RIGHT) {
              if (rightItem) {
                snapShotArr.push(middleItem);
                coveredArr.push(rightItem);
              }
              if (middleItem) {
                snapShotArr.push(leftItem);
                coveredArr.push(middleItem);
              }
            }
          }
        } else if (columnLen === 2) {
          const compareLine = Math.floor(canvasViews.length / 2);
          for (let i = 0; i < compareLine; i++) {
            const leftItem = canvasViews[i * 2];
            const rightItem = canvasViews[i * 2 + 1];
            if (direction === GLOBAL_CONSTANTS.DIRECTION_LEFT) {
              snapShotArr.push(rightItem);
              coveredArr.push(leftItem);
            } else if (direction === GLOBAL_CONSTANTS.DIRECTION_RIGHT) {
              snapShotArr.push(leftItem);
              coveredArr.push(rightItem);
            }
          }
        } else if (columnLen === 4) {
          const compareLine = Math.floor(canvasViews.length / 4);
          for (let i = 0; i < compareLine; i++) {
            if (direction === GLOBAL_CONSTANTS.DIRECTION_LEFT) {
              snapShotArr.push(
                canvasViews[i * 4 + 1],
                canvasViews[i * 4 + 2],
                canvasViews[i * 4 + 3]
              );
              coveredArr.push(
                canvasViews[i * 4],
                canvasViews[i * 4 + 1],
                canvasViews[i * 4 + 2]
              );
            } else if (direction === GLOBAL_CONSTANTS.DIRECTION_RIGHT) {
              snapShotArr.push(
                canvasViews[i * 4 + 2],
                canvasViews[i * 4 + 1],
                canvasViews[i * 4]
              );
              coveredArr.push(
                canvasViews[i * 4 + 3],
                canvasViews[i * 4 + 2],
                canvasViews[i * 4 + 1]
              );
            }
          }
        }
      }

      if (
        [
          GLOBAL_CONSTANTS.DIRECTION_BOTTOM,
          GLOBAL_CONSTANTS.DIRECTION_TOP
        ].includes(direction)
      ) {
        //上下对比，取偶数行进行比较
        var lineLen = Math.ceil(canvasViews.length / columnLen);
        if (lineLen % 2 === 1) {
          lineLen = lineLen - 1;
        }
        const compareLine = lineLen;
        if (columnLen === 2 || columnLen === 3 || columnLen === 4) {
          for (let i = 0; i < compareLine; i = i + 2) {
            for (let j = 0; j < columnLen; j++) {
              const topItem = canvasViews[i * columnLen + j];
              const bottomItem = canvasViews[(i + 1) * columnLen + j];
              if (bottomItem) {
                if (direction === GLOBAL_CONSTANTS.DIRECTION_BOTTOM) {
                  snapShotArr.push(topItem);
                  coveredArr.push(bottomItem);
                } else if (direction === GLOBAL_CONSTANTS.DIRECTION_TOP) {
                  snapShotArr.push(bottomItem);
                  coveredArr.push(topItem);
                }
              }
            }
          }
        }
      }
      return {
        snapShotArr,
        coveredArr
      };
    },
    //执行覆盖
    snapAndCover(snapShotArr, coveredArr, status) {
      for (let i = 0; i < snapShotArr.length; i++) {
        const layImg = snapShotArr[i].getSnapshot();
        coveredArr[i].setCoverStatus(layImg, status);
      }
    },
    getColumnLine() {
      //获取列数
      if (
        [GLOBAL_CONSTANTS.LAYOUT_3X1, GLOBAL_CONSTANTS.LAYOUT_3X2].includes(
          this.imageConfig.layout
        )
      ) {
        return 3;
      }
      if (
        [GLOBAL_CONSTANTS.LAYOUT_2X2, GLOBAL_CONSTANTS.LAYOUT_2X1].includes(
          this.imageConfig.layout
        )
      ) {
        return 2;
      }
      if ([GLOBAL_CONSTANTS.LAYOUT_4X1].includes(this.imageConfig.layout)) {
        return 4;
      }
      if ([GLOBAL_CONSTANTS.LAYOUT_1X1].includes(this.imageConfig.layout)) {
        return 1;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
#image-container {
  overflow-x: hidden;
  gap: 2px;
  .canvas-item + .canvas-item {
    border-left: 1px solid red;
  }
}
#image-container::-webkit-scrollbar {
  display: block;
  -webkit-appearance: none;
  width: 7px;
}
#image-container::-webkit-scrollbar:vertical {
  width: 10px;
}
#image-container::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
}
</style>
