<template>
  <div class="compare-container" flex="dir:top box:first">
    <div class="toolbar" flex="main:justify cross:center">
      <div class="left" flex="cross:center">
        <div
          class="router-back"
          v-tip.sure.left="`${$t('common.hotKey')}：esc`"
        >
          <span @click="goBack" class="btn"
            ><i class="el-icon-d-arrow-left"></i>{{ $t('nav.back') }}</span
          >
        </div>
        <Gallery
          :sortData="videoList"
          :focusListIndex="
            new Array(groupCount).fill(0).map((_, index) => index + startIndex)
          "
          @update="setVideos"
          @remove="removeVideos"
        >
          <template v-slot:headButton>
            <el-badge :value="videoList.length" class="item">
              <el-button
                type="text"
                :disabled="!videoList.length"
                v-tip.sure.right="
                  'cmd/ctrl+f show/hide selected file gallery. Click masking can hide gallery too.'
                "
              >
                {{ $t('general.selected') }}
              </el-button>
            </el-badge>
          </template>
          <template v-slot:dragItem="item">
            <video :src="item.src" controls />
          </template>
        </Gallery>
        <el-button
          type="text"
          icon="el-icon-circle-close"
          title="unselected all"
          style="margin-right:10px"
          :disabled="!videoList.length"
          @click="emptyVideos"
        />
        <el-input-number
          v-model="groupNum"
          @change="changeGroup"
          size="mini"
          :step="1"
          :min="1"
          :max="maxGroupNum"
          v-tip="$t('general.groupNum')"
          label="groupNum"
          class="group-number"
        ></el-input-number>
        <el-radio-group v-model="showCompare" class="gap">
          <el-radio-button :label="false">{{
            $t('general.videoPlay')
          }}</el-radio-button>
          <el-radio-button :label="true">{{
            $t('general.videoCompare')
          }}</el-radio-button>
        </el-radio-group>
        <el-radio-group
          v-if="showCompare"
          v-model="smooth"
          class="gap compare-group"
        >
          <el-radio-button :label="false">{{
            $t('imageCenter.nearestInterpolation')
          }}</el-radio-button>
          <el-radio-button :label="true">{{
            $t('imageCenter.bilinearInterpolation')
          }}</el-radio-button>
        </el-radio-group>
        <div class="select">
          <span v-if="showSelectedMsg" class="msg">
            {{ $t('imageCenter.selectedMsg') }}
          </span>
        </div>
      </div>
      <div class="middle">
        <span class="custom-container" v-if="showCompare === false">
          <el-button-group>
            <el-button
              type="text"
              v-tip="$t('video.play')"
              @click="changeStatus(CONSTANTS.VIDEO_STATUS_START)"
            >
              <span class="svg-container">
                <svg-icon icon-class="play" />
              </span>
            </el-button>
            <el-button
              type="text"
              @click="changeStatus(CONSTANTS.VIDEO_STATUS_PAUSE)"
              v-tip="$t('video.pause')"
            >
              <span class="svg-container">
                <svg-icon icon-class="pause" />
              </span>
            </el-button>
            <el-button
              type="text"
              @click="changeStatus(CONSTANTS.VIDEO_STATUS_RESET)"
              v-tip="$t('video.reset')"
            >
              <span class="svg-container">
                <svg-icon icon-class="restart" />
              </span>
            </el-button>
            <el-button
              type="text"
              @click="changeLoop"
              v-tip="$t('video.loop')"
              :class="{
                enabled: loop
              }"
            >
              <span class="svg-container" flex="cross:center">
                <svg-icon icon-class="loop" />
              </span>
            </el-button>
          </el-button-group>
        </span>
        <span class="custom-container" v-if="showCompare === true">
          <el-button-group style="margin-left:10px">
            <el-button
              type="text"
              :disabled="videoList.length <= 1"
              @mousedown.native="
                setOverLay(GLOBAL_CONSTANTS.DIRECTION_LEFT, true)
              "
              @mouseup.native="
                setOverLay(GLOBAL_CONSTANTS.DIRECTION_LEFT, false)
              "
              v-tip="$t('imageCenter.overlayLeft')"
            >
              <span class="svg-container">
                <svg-icon icon-class="direction-left" />
              </span>
            </el-button>
            <el-button
              type="text"
              :disabled="videoList.length <= 1"
              @mousedown.native="
                setOverLay(GLOBAL_CONSTANTS.DIRECTION_RIGHT, true)
              "
              @mouseup.native="
                setOverLay(GLOBAL_CONSTANTS.DIRECTION_RIGHT, false)
              "
              v-tip="$t('imageCenter.overlayRight')"
            >
              <span class="svg-container">
                <svg-icon
                  icon-class="direction-left"
                  style="transform:rotate(180deg);"
                />
              </span>
            </el-button>
            <el-button
              type="text"
              @mousedown.native="
                setOverLay(GLOBAL_CONSTANTS.DIRECTION_BOTTOM, true)
              "
              @mouseup.native="
                setOverLay(GLOBAL_CONSTANTS.DIRECTION_BOTTOM, false)
              "
              v-tip="$t('imageCenter.overlayBottom')"
            >
              <span class="svg-container">
                <svg-icon
                  icon-class="direction-left"
                  style="transform:rotate(-90deg);"
                />
              </span>
            </el-button>
            <el-button
              type="text"
              @mousedown.native="
                setOverLay(GLOBAL_CONSTANTS.DIRECTION_TOP, true)
              "
              @mouseup.native="
                setOverLay(GLOBAL_CONSTANTS.DIRECTION_TOP, false)
              "
              v-tip="$t('imageCenter.overlayTop')"
            >
              <span class="svg-container">
                <svg-icon
                  icon-class="direction-left"
                  style="transform:rotate(90deg);"
                />
              </span>
            </el-button>
            <el-button
              type="text"
              v-tip="$t('imageCenter.generateGIF')"
              v-tip.sure="`choose images to generate GIF`"
              @click="$refs.gifDialog.show()"
            >
              <span class="svg-container">
                <svg-icon icon-class="gif" />
              </span>
            </el-button>
            <GifDialog
              ref="gifDialog"
              :selectList="videoList.slice(startIndex, startIndex + groupCount)"
            ></GifDialog>
          </el-button-group>
        </span>
        <span v-if="showCompare === false" class="custom-container">
          <span>
            {{ $t('video.speed') }}
          </span>
          <el-select
            v-model="playbackRate"
            placeholder="rate"
            style="width:80px;margin-right:20px"
          >
            <el-option
              v-for="item in rateOptions"
              :key="item"
              :label="'x' + item"
              :value="item"
            >
            </el-option>
          </el-select>
        </span>
      </div>
      <div class="right">
        <el-button-group v-if="showCompare" class="gap">
          <el-button
            type="text"
            @click="pickColor"
            size="mini"
            v-tip="
              $t('imageCenter.colorPicker') +
                ' ' +
                $t('common.hotKey') +
                ':cmd/ctrl+p'
            "
          >
            <span
              class="svg-container"
              style="font-size: 20px"
              :class="{
                enabled: traggerRGB
              }"
            >
              <svg-icon icon-class="pick-color" />
            </span>
          </el-button>
        </el-button-group>
        <el-divider v-if="showCompare" direction="vertical"></el-divider>
        <el-button-group v-if="showCompare" class="gap">
          <el-button
            type="text"
            @click="rotate(90)"
            v-tip="$t('imageCenter.rotate')"
          >
            <span class="svg-container">
              <svg-icon icon-class="rotate" />
            </span>
          </el-button>
          <el-button
            type="text"
            @click="reverse(1)"
            v-tip="$t('imageCenter.horizontalFlip')"
          >
            <span class="svg-container">
              <svg-icon icon-class="horizontal-flip" />
            </span>
          </el-button>
          <el-button
            type="text"
            @click="reverse(-1)"
            v-tip="$t('imageCenter.verticalFlip')"
          >
            <span class="svg-container">
              <svg-icon icon-class="vertical-flip" />
            </span>
          </el-button>
        </el-button-group>
        <el-divider v-if="showCompare" direction="vertical"></el-divider>
        <el-button-group class="gap" v-if="showCompare">
          <el-button
            type="text"
            @click="align(false)"
            v-tip="$t('imageCenter.align')"
          >
            <span class="svg-container">
              <svg-icon icon-class="align" />
            </span>
          </el-button>
          <el-button
            type="text"
            @click="align(true)"
            v-tip="$t('imageCenter.align2')"
          >
            <span class="svg-container">
              <svg-icon icon-class="align2" />
            </span>
          </el-button>
          <el-button
            type="text"
            @click="resetCanvas(false)"
            v-tip="$t('imageCenter.adaptive')"
          >
            <span class="svg-container">
              <svg-icon icon-class="adaptive" />
            </span>
          </el-button>
          <el-button
            type="text"
            @click="resetCanvas(true)"
            v-tip="$t('imageCenter.fullsize')"
          >
            <span class="svg-container">
              <svg-icon icon-class="fullsize" />
            </span>
          </el-button>
        </el-button-group>
        <el-divider v-if="showCompare" direction="vertical"></el-divider>
        <el-select
          v-model="layout"
          placeholder="layout"
          style="width:80px"
          v-tip.left="$t('general.layout')"
        >
          <el-option
            v-for="item in [
              GLOBAL_CONSTANTS.LAYOUT_2X2,
              GLOBAL_CONSTANTS.LAYOUT_2X1,
              GLOBAL_CONSTANTS.LAYOUT_3X1,
              GLOBAL_CONSTANTS.LAYOUT_3X2,
              GLOBAL_CONSTANTS.LAYOUT_4X1,
              GLOBAL_CONSTANTS.LAYOUT_1X1
            ]"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="video-grid" :style="containerStyle">
      <div class="video-content" v-for="path in imageGroupList" :key="path">
        <VideoContainer
          ref="video-container"
          :path="path"
          :loop="loop"
          :playbackRate="playbackRate"
          :videoImageVisiable="showCompare"
        ></VideoContainer>
      </div>
    </div>
  </div>
</template>
<script>
import GifDialog from '@/components/gif-dialog';
import Gallery from '@/components/gallery';
import VideoContainer from './VideoContainer';
import * as CONSTANTS from './video-constants';
import * as GLOBAL_CONSTANTS from '@/constants';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('videoStore');

export default {
  components: { VideoContainer, Gallery, GifDialog },
  data() {
    return {
      CONSTANTS,
      GLOBAL_CONSTANTS,
      videoScale: 1,
      lastX: 0,
      lastY: 0,
      showCompare: false,
      traggerRGB: false,
      showSelectedMsg: false,
      groupNum: 0,
      startIndex: 0,
      playbackRate: 1,
      rateOptions: [0.3, 0.5, 1, 1.25, 1.5, 2, 3],
      loop: true
    };
  },
  computed: {
    ...mapGetters(['videoList', 'videoConfig']),
    maxGroupNum() {
      return Math.ceil(
        this.videoList.length / (this.layout[0] * this.layout[2])
      );
    },
    // 每组图片数量
    groupCount() {
      const str = this.videoConfig.layout,
        len = str.length;
      return str[len - 3] * str[len - 1];
    },
    // 当前组的图片列表
    imageGroupList() {
      return this.videoList
        ? this.videoList.slice(
            this.startIndex,
            this.startIndex + this.groupCount
          )
        : [];
    },
    smooth: {
      get() {
        return this.videoConfig.smooth;
      },
      set(newVal) {
        const preNum = this.groupCount * (this.groupNum - 1);
        this.setVideoConfig({ smooth: newVal });
        const afterNum = this.groupCount * (this.groupNum - 1);
        this.offset = preNum - afterNum;
        this.startIndex = Math.max(
          0,
          (groupNum - 1) * this.groupCount + this.offset
        );
        this.groupNum = Math.floor(this.startIndex / this.groupCount);
      }
    },
    layout: {
      get() {
        return this.videoConfig.layout;
      },
      set(val) {
        const preNum = this.groupCount * (this.groupNum - 1);
        //切换布局则切回视频
        this.showCompare = false;
        this.setVideoConfig({ layout: val });
        const afterNum = this.groupCount * (this.groupNum - 1);
        const offset = preNum - afterNum;
        this.startIndex = Math.max(
          0,
          (this.groupNum - 1) * this.groupCount + offset
        );
        this.groupNum = Math.ceil(this.startIndex / this.groupCount) + 1;
      }
    },
    containerStyle() {
      switch (this.layout) {
        case this.GLOBAL_CONSTANTS.LAYOUT_1X1:
          return {
            display: 'flex',
            flexDirection: 'column'
          };
        case this.GLOBAL_CONSTANTS.LAYOUT_2X1:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr'
          };
        case this.GLOBAL_CONSTANTS.LAYOUT_3X1:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr'
          };
        case this.GLOBAL_CONSTANTS.LAYOUT_4X1:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr'
          };
        case this.GLOBAL_CONSTANTS.LAYOUT_2X2:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '50% 50%',
            gridAutoRows: '50%'
          };
        case this.GLOBAL_CONSTANTS.LAYOUT_3X2:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '50% 50%',
            gridAutoRows: '50%'
          };
        default:
          return {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr'
            // gridTemplateRows: '50% 50%',
          };
      }
    }
  },
  watch: {
    startIndex() {
      this.showCompare = false;
    },
    showCompare() {
      if (this.showCompare) {
        this.changeStatus(CONSTANTS.VIDEO_STATUS_PAUSE);
      }
    },
    videoList() {
      this.showCompare = false;
    }
  },
  methods: {
    ...mapActions([
      'removeVideos',
      'emptyVideos',
      'setVideoConfig',
      'setVideos'
    ]),
    changeGroup(groupNum, oldGroupNum) {
      this.startIndex = Math.max(
        0,
        this.startIndex - this.groupCount * (oldGroupNum - groupNum)
      );
      this.$refs.gifDialog && this.$refs.gifDialog.clear(); // 清空gifDialog上次所选
    },
    changeStatus(status) {
      this.$bus.$emit(CONSTANTS.BUS_VIDEO_COMPARE_ACTION, status);
    },
    setOverLay(direction, status) {
      const handlecover = this.handleCompareOptions(direction);
      this.snapAndCover(
        handlecover.snapShotArr,
        handlecover.coveredArr,
        status
      );
    },
    resetCanvas(data) {
      this.$bus.$emit('imageCenter_resetCanvas', { name: 'reset', data });
    },
    handleSelect(data) {
      this.showSelectedMsg = !!data;
    },
    pickColor() {
      this.traggerRGB = !this.traggerRGB;
      this.$bus.$emit('image_broadcast', {
        name: 'pickColor',
        data: { status: this.traggerRGB }
      });
    },
    rotate(data) {
      this.$bus.$emit('imageCenter_rotate', { name: 'rotate', data });
    },
    reverse(data) {
      this.$bus.$emit('imageCenter_reverse', { name: 'reverse', data });
    },
    align(beSameSize) {
      new Promise(resolve => {
        this.$bus.$emit(
          'videoCenter_getSelectedPosition',
          { name: 'getSelectedPosition', data: beSameSize },
          res => {
            resolve(res);
          }
        );
      }).then(data => {
        this.$bus.$emit('videoCenter_align', {
          name: 'align',
          data: { beSameSize, ...data }
        });
      });
    },
    handleCompareOptions(direction) {
      const columnLen = this.getColumnLine();
      const canvasViews = this.$refs['video-container'].map(item =>
        item.getVideoCanvas()
      );
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
        } else if (columnLen === 2 || columnLen === 4) {
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
        }
      }

      if (
        [
          GLOBAL_CONSTANTS.DIRECTION_BOTTOM,
          GLOBAL_CONSTANTS.DIRECTION_TOP
        ].includes(direction)
      ) {
        //上下对比，取偶数行进行比较
        // debugger
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
          this.layout
        )
      ) {
        return 3;
      }
      if (
        [GLOBAL_CONSTANTS.LAYOUT_2X2, GLOBAL_CONSTANTS.LAYOUT_2X1].includes(
          this.layout
        )
      ) {
        return 2;
      }
      if ([GLOBAL_CONSTANTS.LAYOUT_4X1].includes(this.layout)) {
        return 4;
      }
      if ([GLOBAL_CONSTANTS.LAYOUT_1X1].includes(this.layout)) {
        return 1;
      }
    },
    changeLoop() {
      this.loop = !this.loop;
    },
    handleHotKey(event) {
      // esc
      if (event.keyCode === 27) {
        this.goBack();
      }
      // cmd/ctrl+p
      if ((event.metaKey || event.ctrlKey) && event.keyCode === 80) {
        this.pickColor();
      }
      // cmd/ctrl + ← 向前切换一个分组
      if (
        (event.metaKey || event.ctrlKey) &&
        event.keyCode === 37 &&
        this.groupNum > 1
      ) {
        this.groupNum--;
        this.changeGroup(this.groupNum, this.groupNum + 1);
      }
      // cmd/ctrl + → 向后切换一个分组
      if (
        (event.metaKey || event.ctrlKey) &&
        event.keyCode === 39 &&
        this.groupNum < this.maxGroupNum
      ) {
        this.groupNum++;
        this.changeGroup(this.groupNum, this.groupNum - 1);
      }
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        // 如果强制reload导致没有历史路由 唯一的历史就是当前页面 则回到默认的历史页面
        this.$router.push('/video/index');
      }
    },
    changeZoom(newV, oldV) {
      if (newV >= GLOBAL_CONSTANTS.SCALE_CONSTANTS) {
        this.$bus.$emit(CONSTANTS.BUS_VIDEO_COMPARE_ACTION_SET_ZOOM, {
          videoScale: newV,
          currentZoom: oldV,
          lastX: this.lastX,
          lastY: this.lastY
        });
      }
    },
    handleReset() {
      this.$bus.$emit(CONSTANTS.BUS_VIDEO_COMPARE_ACTION_RESET);
      this.videoScale = 1;
    },
    getVidePath(path) {
      // FIXME: 
      return path.replace('file://', '');
    },
    getImageDetails(imageNameList, callback) {
      const canvasViews = this.$refs['video-container'].map(item =>
        item.getVideoCanvas()
      );
      try {
        let details = canvasViews
          .filter(
            item =>
              imageNameList.findIndex(
                name => name === this.getVidePath(item.videoSrc)
              ) > -1
          )
          .map(item => {
            return {
              path: this.getVidePath(item.videoSrc),
              canvas: item.canvas
            };
          });
        callback(details);
      } catch (error) {
        console.log(error);
        this.$message.error(error.toString() || error.message);
      }
    }
  },
  mounted() {
    window.addEventListener('keyup', this.handleHotKey, true);
    this.$bus.$on(
      CONSTANTS.BUS_VIDEO_COMPARE_ACTION_HANDLE_ZOOM,
      (data, callback) => {
        const { factor, lastX, lastY } = data;
        this.lastX = lastX;
        this.lastY = lastY;
        this.videoScale *= factor;
        callback(this.videoScale);
      }
    );
    this.$bus.$on('getImageDetails', this.getImageDetails);
    this.$bus.$on('image_handleSelect', this.handleSelect);
    // resize 后重新计算宽高并渲染
    window.addEventListener('resize', () => {
      this.showCompare = false;
    });
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.handleHotKey, true);
    this.$bus.$off(CONSTANTS.BUS_VIDEO_COMPARE_ACTION_HANDLE_ZOOM);
    this.$bus.$off('image_handleSelect', this.handleSelect);
    this.$bus.$off('getImageDetails');
  }
};
</script>
<style lang="scss" scoped>
@import '@/styles/variables.scss';
.compare-container {
  height: 100%;
  .toolbar {
    position: relative;
    padding: 0 10px;
    height: 28px;
    .svg-container {
      font-size: 24px;
      &.restart {
        font-size: 20px;
      }
      &.loop {
        font-size: 22px;
      }
    }
    .custom-container {
      margin-left: 20px;
    }
    .left {
      position: relative;
      .router-back {
        .btn {
          cursor: pointer;
          margin-right: 10px;
          color: $labelColor;
          &:hover {
            color: #303133;
          }
        }
      }
      .clear-images {
        margin-right: 10px;
        &:hover {
          color: #e93b3b;
        }
      }
      .compare-group {
        margin-left: 10px;
      }
    }

    .group-number {
      margin-right: 10px;
    }

    .select {
      position: relative;
      height: 22px;
      .msg {
        font-size: 12px;
        color: red;
      }
    }

    .middle {
      .el-button-group {
        .enabled {
          .svg-icon {
            color: $primaryColor;
          }
        }
        .svg-container {
          margin-left: 0.3rem;
        }
      }
    }
    .right {
      .enabled {
        .svg-icon {
          color: $primaryColor;
        }
      }
      .layout-selector {
        width: 80px;
        margin-left: 20px;
      }
    }
  }
  .video-grid {
    overflow-y: auto;
    gap: 2px;
    .video-content {
      height: 100%;
    }
  }
  .video-grid::-webkit-scrollbar {
    display: block;
    -webkit-appearance: none;
    width: 7px;
  }
  .video-grid::-webkit-scrollbar:vertical {
    width: 10px;
  }
  .video-grid::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
  }
}
</style>
