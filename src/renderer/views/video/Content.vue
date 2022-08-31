<template>
  <div id="image-container" ref="container" class="canvas-container" :style="containerStyle">
    <div v-for="(video, index) in videoGroupList" :key="index">
      <VideoCanvas
        ref="video_canvas"
        :index="index"
        :path="video"
        :_width="canvasWidth"
        :_height="canvasHeight"
        :subVideoControlMenu="subVideoControlMenu"
        @loaded="handleVideoLoaded"
        @fullScreen="handleFullscreen"
      ></VideoCanvas>
    </div>
    <Sticky
      v-if="isFloating"
      :contentDragDisabled="false"
      :disableDragFn="
        (event) => {
          return (
            event.target.className.toString().includes('el-slider__') || event.target.tagName.toLowerCase() === 'strong'
          )
        }
      "
    >
      <template v-slot:icon>
        <el-button type="text">
          <svg-icon icon-class="play" :clicked="true" class="svg-container" />
        </el-button>
      </template>
      <!-- <VideoProgressBar /> -->
    </Sticky>
  </div>
</template>

<script>
import VideoCanvas from './components/videoCanvas'
import Sticky from '@/components/sticky'
import VideoProgressBar from './components/videoProgressBar'
import { throttle } from '@/utils'
import * as GLOBAL_CONSTANTS from '@/constants'
import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('videoStore')
const { mapGetters: preferenceMapGetters } = createNamespacedHelpers('preferenceStore')

export default {
  components: { VideoCanvas, Sticky, VideoProgressBar },
  data() {
    return {
      canvasWidth: 0,
      canvasHeight: 0,
      groupStartIndex: 0,
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
        },
        {
          event: 'getCanvasSize',
          action: 'getCanvasSize'
        },
        {
          event: 'getMarks',
          action: 'getMarks'
        },
        {
          event: 'share',
          action: 'share'
        }
      ],
      marks: [],
      containerWidth: 9999,
      subVideoControlMenu: false
    }
  },
  created() {
    this.marks = []
    this.setVideoConfig({ currentTime: 0 })
    // 使用智能布局 如果已选少 则自动优化布局 使用当前数量X1的布局
    if (this.videoList.length <= 4) {
      let smartLayout
      switch (this.videoList.length) {
        case 1:
          smartLayout = GLOBAL_CONSTANTS.LAYOUT_1X1
          break
        case 2:
          smartLayout = GLOBAL_CONSTANTS.LAYOUT_2X1
          break
        case 3:
          smartLayout = GLOBAL_CONSTANTS.LAYOUT_3X1
          break
        case 4:
          smartLayout = GLOBAL_CONSTANTS.LAYOUT_2X2
          break
        default:
          smartLayout = this.videoConfig.layout
      }
      this.setVideoConfig({ layout: smartLayout })
    }
  },
  mounted() {
    this.calcCanvasSize()
    // 调度事件  使用当前组件的方法
    this.scheduleCanvasActions.forEach((item) => {
      this.$bus.$on(item.event, this[item.action])
    })
    // resize 后重新计算宽高并渲染
    window.addEventListener('resize', this.handleResize, true)
  },
  beforeDestroy() {
    this.scheduleCanvasActions.forEach((item) => {
      this.$bus.$off(item.event, this[item.action])
    })
    window.removeEventListener('resize', this.handleResize, true)
  },
  computed: {
    ...mapGetters(['videoList', 'videoConfig']),
    ...preferenceMapGetters(['preference']),
    // 每组图片数量
    groupCount() {
      const str = this.videoConfig.layout,
        len = str.length
      return str[len - 3] * str[len - 1]
    },
    // 当前组的图片列表
    videoGroupList() {
      return this.videoList.length
        ? this.videoList.slice(this.groupStartIndex, this.groupStartIndex + this.groupCount)
        : []
    },
    containerStyle() {
      switch (this.videoConfig.layout) {
        case GLOBAL_CONSTANTS.LAYOUT_1X1:
          return {
            display: 'flex',
            flexDirection: 'column'
          }
        case GLOBAL_CONSTANTS.LAYOUT_2X1:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr'
          }
        case GLOBAL_CONSTANTS.LAYOUT_3X1:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr'
          }
        case GLOBAL_CONSTANTS.LAYOUT_4X1:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr'
          }
        case GLOBAL_CONSTANTS.LAYOUT_2X2:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '50% 50%'
          }
        case GLOBAL_CONSTANTS.LAYOUT_3X2:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '50% 50%'
          }
        default:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr'
          }
      }
    },
    isFloating() {
      //TODO: 暂时不使用悬浮组件
      // return this.preference.videoProcessBarStyle === 'float';
      return false
    },
    fullScreening() {
      return this.videoConfig.fullScreening
    }
  },
  watch: {
    videoList() {
      this.$nextTick(() => {
        this.calcCanvasSize()
      })
    },
    videoGroupList(newVal, oldVal) {
      if (newVal.length !== oldVal.length || newVal.join(',') !== oldVal.join(',')) {
        this.$nextTick(() => {
          this.calcCanvasSize()
          this.updateAllCanvas()
        })
      }
    },
    'videoConfig.layout'() {
      this.$nextTick(() => {
        this.calcCanvasSize()
        this.updateAllCanvas()
      })
    }
  },
  methods: {
    ...mapActions(['setVideoConfig']),
    // 接收改变当前图片分组的开始序号
    changeGroup(groupStartIndex) {
      this.groupStartIndex = groupStartIndex
    },
    handleResize: throttle(50, function () {
      this.calcCanvasSize()
      // 非全屏状态时重新布局图片容器;
      if (!this.fullScreening) {
        this.updateAllCanvas()
      }
    }),
    handleFullscreen(status) {
      this.setVideoConfig({
        fullScreening: status ?? !this.fullScreening
      })
    },
    getCanvasSize(data, callback) {
      callback({
        width: this.canvasWidth,
        height: this.canvasHeight
      })
    },
    calcCanvasSize() {
      this.canvasWidth = this.calcWidth()
      this.subVideoControlMenu = 512 * parseInt(this.videoConfig.layout[0]) <= this.containerWidth
      this.canvasHeight = this.calcHeight() - 18
    },
    calcWidth() {
      const containerWidth = document.body.clientWidth
      this.containerWidth = containerWidth
      switch (this.videoConfig.layout) {
        case GLOBAL_CONSTANTS.LAYOUT_1X1:
          return containerWidth
        case GLOBAL_CONSTANTS.LAYOUT_2X1:
        case GLOBAL_CONSTANTS.LAYOUT_2X2:
          return containerWidth / 2
        case GLOBAL_CONSTANTS.LAYOUT_3X1:
        case GLOBAL_CONSTANTS.LAYOUT_3X2:
          return containerWidth / 3
        case GLOBAL_CONSTANTS.LAYOUT_4X1:
          return containerWidth / 4
      }
    },
    calcHeight() {
      const toolbarInfo = document.getElementsByClassName('toolbar')[0].getBoundingClientRect()
      const headerInfo = document.getElementsByClassName('header')[0].getBoundingClientRect()
      const containerHeight = document.body.clientHeight - toolbarInfo.height - headerInfo.height
      this.containerHeight = containerHeight
      switch (this.videoConfig.layout) {
        case GLOBAL_CONSTANTS.LAYOUT_1X1:
        case GLOBAL_CONSTANTS.LAYOUT_2X1:
        case GLOBAL_CONSTANTS.LAYOUT_3X1:
        case GLOBAL_CONSTANTS.LAYOUT_4X1:
          return containerHeight
        case GLOBAL_CONSTANTS.LAYOUT_2X2:
        case GLOBAL_CONSTANTS.LAYOUT_3X2:
          return containerHeight / 2
      }
    },
    setOverLay({ direction, status }) {
      const handlecover = this.handleCompareOptions(direction)
      this.snapAndCover(handlecover.snapShotArr, handlecover.coveredArr, status)
    },
    getImageDetails(imageNameList, callback) {
      let canvasViews = this.$refs['video_canvas']
      try {
        let details = canvasViews
          .filter((item) => imageNameList.findIndex((name) => name === item.path) > -1)
          .map((item) => {
            return {
              path: item.path,
              canvas: item.canvas
            }
          })
        callback(details)
      } catch (error) {
        console.log(error)
        this.$message.error(error.toString() || error.message)
      }
    },
    updateAllCanvas() {
      this.$refs['video_canvas'].forEach((item) => {
        // 重新设定宽高 然后重新绘制canvas
        item.height = Math.floor(this.canvasHeight)
        item.width = Math.floor(this.canvasWidth)
        item.reMount()
      })
    },
    handleCompareOptions(direction) {
      const columnLen = this.getColumnLine()
      const canvasViews = this.$refs['video_canvas']
      let snapShotArr = []
      let coveredArr = []
      if ([GLOBAL_CONSTANTS.DIRECTION_LEFT, GLOBAL_CONSTANTS.DIRECTION_RIGHT].includes(direction)) {
        //左右对比,取整行进行比较
        if (columnLen === 3) {
          //不满一行则补全
          const compareLine = Math.ceil(canvasViews.length / 3)
          for (let i = 0; i < compareLine; i++) {
            const leftItem = canvasViews[i * 3]
            const middleItem = canvasViews[i * 3 + 1]
            const rightItem = canvasViews[i * 3 + 2]
            if (direction === GLOBAL_CONSTANTS.DIRECTION_LEFT) {
              if (middleItem) {
                snapShotArr.push(middleItem)
                coveredArr.push(leftItem)
              }
              if (rightItem) {
                snapShotArr.push(rightItem)
                coveredArr.push(middleItem)
              }
            } else if (direction === GLOBAL_CONSTANTS.DIRECTION_RIGHT) {
              if (rightItem) {
                snapShotArr.push(middleItem)
                coveredArr.push(rightItem)
              }
              if (middleItem) {
                snapShotArr.push(leftItem)
                coveredArr.push(middleItem)
              }
            }
          }
        } else if (columnLen === 2) {
          const compareLine = Math.floor(canvasViews.length / 2)
          for (let i = 0; i < compareLine; i++) {
            const leftItem = canvasViews[i * 2]
            const rightItem = canvasViews[i * 2 + 1]
            if (direction === GLOBAL_CONSTANTS.DIRECTION_LEFT) {
              snapShotArr.push(rightItem)
              coveredArr.push(leftItem)
            } else if (direction === GLOBAL_CONSTANTS.DIRECTION_RIGHT) {
              snapShotArr.push(leftItem)
              coveredArr.push(rightItem)
            }
          }
        } else if (columnLen === 4) {
          const compareLine = Math.floor(canvasViews.length / 4)
          for (let i = 0; i < compareLine; i++) {
            if (direction === GLOBAL_CONSTANTS.DIRECTION_LEFT) {
              snapShotArr.push(canvasViews[i * 4 + 1], canvasViews[i * 4 + 2], canvasViews[i * 4 + 3])
              coveredArr.push(canvasViews[i * 4], canvasViews[i * 4 + 1], canvasViews[i * 4 + 2])
            } else if (direction === GLOBAL_CONSTANTS.DIRECTION_RIGHT) {
              snapShotArr.push(canvasViews[i * 4 + 2], canvasViews[i * 4 + 1], canvasViews[i * 4])
              coveredArr.push(canvasViews[i * 4 + 3], canvasViews[i * 4 + 2], canvasViews[i * 4 + 1])
            }
          }
        }
      }

      if ([GLOBAL_CONSTANTS.DIRECTION_BOTTOM, GLOBAL_CONSTANTS.DIRECTION_TOP].includes(direction)) {
        //上下对比，取偶数行进行比较
        var lineLen = Math.ceil(canvasViews.length / columnLen)
        if (lineLen % 2 === 1) {
          lineLen = lineLen - 1
        }
        const compareLine = lineLen
        if (columnLen === 2 || columnLen === 3 || columnLen === 4) {
          for (let i = 0; i < compareLine; i = i + 2) {
            for (let j = 0; j < columnLen; j++) {
              const topItem = canvasViews[i * columnLen + j]
              const bottomItem = canvasViews[(i + 1) * columnLen + j]
              if (bottomItem) {
                if (direction === GLOBAL_CONSTANTS.DIRECTION_BOTTOM) {
                  snapShotArr.push(topItem)
                  coveredArr.push(bottomItem)
                } else if (direction === GLOBAL_CONSTANTS.DIRECTION_TOP) {
                  snapShotArr.push(bottomItem)
                  coveredArr.push(topItem)
                }
              }
            }
          }
        }
      }
      return {
        snapShotArr,
        coveredArr
      }
    },
    handleVideoLoaded() {
      // TODO: 下次重构时使用， 多合一视频进度控制(el原生组件不支持，需采用其他组件)
      // if (this.marks.length > 0) {
      //   return;
      // }
      // this.$refs['video_canvas'].forEach((item, index) => {
      //   console.log(`video-${index + 1}`, {
      //     duration: item.video.duration,
      //     currentTime: item.video.currentTime
      //   });
      //   this.marks.push([
      //     Math.round(parseFloat(item.video.duration) * 100) / 100,
      //     index + 1
      //   ]);
      // });
      // this.$bus.$emit('videoLoaded', this.marks);
    },
    getMarks(data, callback) {
      callback(this.marks)
      return this.marks
    },
    share() {
      console.log('share', this.$refs['video_canvas'])
    },
    //执行覆盖
    snapAndCover(snapShotArr, coveredArr, status) {
      for (let i = 0; i < snapShotArr.length; i++) {
        const layImg = snapShotArr[i].getSnapshot()
        coveredArr[i].setCoverStatus(layImg, status)
      }
    },
    getColumnLine() {
      //获取列数
      if ([GLOBAL_CONSTANTS.LAYOUT_3X1, GLOBAL_CONSTANTS.LAYOUT_3X2].includes(this.videoConfig.layout)) {
        return 3
      }
      if ([GLOBAL_CONSTANTS.LAYOUT_2X2, GLOBAL_CONSTANTS.LAYOUT_2X1].includes(this.videoConfig.layout)) {
        return 2
      }
      if ([GLOBAL_CONSTANTS.LAYOUT_4X1].includes(this.videoConfig.layout)) {
        return 4
      }
      if ([GLOBAL_CONSTANTS.LAYOUT_1X1].includes(this.videoConfig.layout)) {
        return 1
      }
    }
  }
}
</script>
<style lang="scss" scoped>
#image-container {
  overflow-x: hidden;
  gap: 2px;
  width: 100%;
  height: 100%;
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
.svg-container {
  font-size: 24px;
}
</style>
