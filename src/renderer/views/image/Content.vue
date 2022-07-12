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
        :path="imgs"
        :_width="canvasWidth"
        :_height="canvasHeight"
        :share="shareConfigAble"
        :shareConfig="shareConfig"
      ></ImageCanvas>
    </div>
  </div>
</template>
<script>
import JSZip from 'jszip';
import ImageCanvas from './components/ImageCanvas';
import fse from 'fs-extra';
import _ from 'lodash';
import { saveAs } from 'file-saver';
import { throttle } from '@/utils';
const { dialog } = require('electron').remote;
import * as GLOBAL_CONSTANTS from '@/constants';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('imageStore');

export default {
  components: { ImageCanvas },
  data() {
    return {
      GLOBAL_CONSTANTS,
      dirPath: undefined,
      JSZip: null,
      shareConfig: null,
      shareConfigAble: false,
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
          event: 'share',
          action: 'share'
        }
      ]
    };
  },
  created() {
    // 使用智能布局 如果已选少 则自动优化布局 使用当前数量X1的布局
    if (this.imageList.length <= 4) {
      let smartLayout;
      switch (this.imageList.length) {
        case 1:
          smartLayout = GLOBAL_CONSTANTS.LAYOUT_1X1;
          break;
        case 2:
          smartLayout = GLOBAL_CONSTANTS.LAYOUT_2X1;
          break;
        case 3:
          smartLayout = GLOBAL_CONSTANTS.LAYOUT_3X1;
          break;
        case 4:
          smartLayout = GLOBAL_CONSTANTS.LAYOUT_2X2;
          break;
        default:
          smartLayout = this.imageConfig.layout;
      }
      this.setImageConfig({ layout: smartLayout });
    }
  },
  mounted() {
    this.calcCanvasSize();
    // 调度事件  使用当前组件的方法
    this.scheduleCanvasActions.forEach(item => {
      this.$bus.$on(item.event, this[item.action]);
    });
    // resize 后重新计算宽高并渲染
    window.addEventListener('resize', this.handleResize, true);
    this.updateShareConfigStatus();
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
      return this.imageList.length
        ? this.imageList.slice(
            this.groupStartIndex,
            this.groupStartIndex + this.groupCount
          )
        : [];
    },
    groupIsFromSameDir() {
      this.dirPath = this.imageGroupList[0]
        .split(GLOBAL_CONSTANTS.DELIMITER)
        .slice(0, -1)
        .join(GLOBAL_CONSTANTS.DELIMITER);
      return this.imageGroupList.every(
        item =>
          item
            .split(GLOBAL_CONSTANTS.DELIMITER)
            .slice(0, -1)
            .join(GLOBAL_CONSTANTS.DELIMITER) === this.dirPath
      );
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
      this.updateShareConfigStatus();
      this.$nextTick(() => {
        this.calcCanvasSize();
        this.updateAllCanvas();
      });
    },
    'imageConfig.layout'() {
      this.$nextTick(() => {
        this.calcCanvasSize();
        this.updateAllCanvas();
      });
    }
  },
  methods: {
    // 接收改变当前图片分组的开始序号
    changeGroup(groupStartIndex) {
      this.groupStartIndex = groupStartIndex;
    },
    ...mapActions(['setImageConfig']),
    handleResize: throttle(50, function() {
      this.calcCanvasSize();
      // 重新布局图片容器;
      this.updateAllCanvas();
    }),
    getCanvasSize(data, callback) {
      callback({
        width: this.canvasWidth,
        height: this.canvasHeight
      });
    },
    async updateShareConfigStatus() {
      const path =
        (this.dirPath ??
          this.imageGroupList[0]
            .split(GLOBAL_CONSTANTS.DELIMITER)
            .slice(0, -1)
            .join(GLOBAL_CONSTANTS.DELIMITER)) +
        GLOBAL_CONSTANTS.DELIMITER +
        GLOBAL_CONSTANTS.SHARE_FILE_NAME;
      const exists = await fse.pathExists(path);
      this.shareConfigAble = exists && this.groupIsFromSameDir;
      if (this.shareConfigAble) {
        this.shareConfig = JSON.parse(await fse.readFile(path));
        console.log('shareConfig', this.shareConfig);
      }
    },
    share() {
      // shareProject
      const configObj = _.cloneDeep(this.$store.state);
      delete configObj.videoStore;
      const shareProject = GLOBAL_CONSTANTS.SHARE_PROJECT_DEFAULT_PROPS();
      const modules = ['imageStore', 'preferenceStore'];
      modules.forEach(moduleKey => {
        const module = shareProject.config[moduleKey];
        Object.keys(module).forEach(key => {
          if (configObj[moduleKey][key] !== undefined) {
            module[key] = configObj[moduleKey][key];
          }
        });
        // module.enabled = true;
      });
      // shareCanvas
      const canvasViews = this.$refs['image_canvas'];
      let base = '_width'; // '_width' or '_height'
      shareProject.canvas = canvasViews.map(canvas => {
        const shareCanvas = GLOBAL_CONSTANTS.SHARE_CANVAS_DEFAULT_PROPS();
        Object.keys(shareCanvas).forEach(key => {
          if (canvas[key] !== undefined) {
            shareCanvas[key] = canvas[key];
          }
        });
        const { path, image, imagePosition } = canvas;
        shareCanvas.path = path;
        shareCanvas.name = path.split(GLOBAL_CONSTANTS.DELIMITER).pop();
        shareCanvas.image = image;
        if (
          ['x', 'y', 'width', 'height'].every(
            key => imagePosition[key] !== undefined
          )
        ) {
          const { x, y, width, height } = imagePosition;
          const baseLength = canvas[base]; // _width or _height
          shareCanvas.xOffsetRation = Number(x / baseLength).toFixed(2);
          shareCanvas.yOffsetRation = Number(y / baseLength).toFixed(2);
          shareCanvas.withRatio = Number(width / baseLength).toFixed(2);
          shareCanvas.heightRatio = Number(height / baseLength).toFixed(2);
        }
        return shareCanvas;
      });
      let depth = 2;
      while (
        _.unionBy(shareProject.canvas, 'name').length <
        shareProject.canvas.length
      ) {
        shareProject.canvas.forEach(canvas => {
          canvas.name = canvas.path
            .split(GLOBAL_CONSTANTS.DELIMITER)
            .slice(-depth)
            .join('-');
        });
        depth++;
      }
      // console.log('shareProject saving...', shareProject);
      // this.saveShareInfo(JSON.stringify(shareProject, null, 4));
      this.saveAsZip(shareProject);
    },
    async pathDirectoryPath() {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'select a save location',
        properties: ['openDirectory']
      });
      return !canceled && filePaths.length > 0 ? filePaths[0] : false;
    },
    // 存储当前组的图像信息至本地配置文件
    async saveShareInfo(data) {
      const pathPrefix = await this.pathDirectoryPath();
      if (!pathPrefix) {
        this.$message({
          type: 'info',
          message: 'cancel'
        });
        return;
      }
      const path =
        pathPrefix +
        GLOBAL_CONSTANTS.DELIMITER +
        GLOBAL_CONSTANTS.SHARE_FILE_NAME;
      let exist = await fse.pathExists(path);
      let cancel = false;
      if (exist) {
        await this.$confirm('分享配置文件已存在，是否覆盖', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(() => {
          cancel = true;
          this.$message({
            type: 'info',
            message: '已取消覆盖'
          });
        });
      }
      if (cancel) return;
      await fse.outputFile(path, data);
      this.$message.success('save success');
    },
    async saveAsZip(shareProject) {
      this.JSZip = new JSZip();
      // const directoryPath = await this.pathDirectoryPath();
      // if (!directoryPath) {
      //   this.$message({
      //     type: 'info',
      //     message: 'cancel'
      //   });
      //   return;
      // }
      // const zipPath =
      //   directoryPath +
      //   GLOBAL_CONSTANTS.DELIMITER +
      //   GLOBAL_CONSTANTS.SHARE_ZIP_NAME;
      shareProject.canvas.forEach(canvas => {
        const { name, image } = canvas;
        const offsreen = new OffscreenCanvas(image.width, image.height);
        const offCtx = offsreen.getContext('2d');
        offCtx.drawImage(image, 0, 0);
        const imageData = offsreen.convertToBlob();
        this.JSZip.file(name, imageData, { binary: true });
        delete canvas.path;
        delete canvas.image;
      });
      // config file
      this.JSZip.file(
        GLOBAL_CONSTANTS.SHARE_FILE_NAME,
        JSON.stringify(shareProject, null, 4)
      );
      this.JSZip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, GLOBAL_CONSTANTS.SHARE_ZIP_NAME, {
          type: 'application/zip'
        });
      });
    },
    calcCanvasSize() {
      this.canvasWidth = this.calcWidth();
      this.canvasHeight = this.calcHeight() - 18;
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
            item => imageNameList.findIndex(name => name === item.path) > -1
          )
          .map(item => {
            return {
              path: item.path,
              canvas: item.canvas
            };
          });
        callback(details);
      } catch (error) {
        console.log(error);
        this.$message.error(error.toString() || error.message);
      }
    },
    updateAllCanvas() {
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
