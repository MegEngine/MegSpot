<template>
  <div flex="main:justify cross:center" class="toolbar">
    <div class="left" flex="cross:center">
      <div class="router-back" v-tip.sure="`${$t('common.hotKey')}：esc`">
        <span @click="goBack" class="btn"
          ><i class="el-icon-d-arrow-left"></i>{{ $t('nav.back') }}</span
        >
      </div>
      <Gallery
        :selectedList="videoList"
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
          <img :src="item.src" :alt="item.alt" />
        </template>
      </Gallery>
      <el-button
        type="text"
        size="large"
        icon="el-icon-circle-close"
        v-tip="$t('general.clearAll')"
        class="clear-images"
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
      <el-radio-group v-model="smooth" class="gap" size="mini">
        <el-radio-button :label="false">{{
          $t('imageCenter.nearestInterpolation')
        }}</el-radio-button>
        <el-radio-button :label="true">{{
          $t('imageCenter.bilinearInterpolation')
        }}</el-radio-button>
      </el-radio-group>
      <div class="select">
        <!-- 空间不足, 取消选中提示 -->
        <span v-show="false" class="msg">
          {{ $t('imageCenter.selectedMsg') }}
        </span>
      </div>
    </div>
    <div class="middle">
      <el-button-group class="gap">
        <el-button
          type="text"
          v-tip="$t('video.play')"
          @click="changeStatus(CONSTANTS.VIDEO_STATUS_START)"
        >
          <span class="svg-container">
            <svg-icon icon-class="play" :clicked="!videoPaused" />
          </span>
        </el-button>
        <el-button
          type="text"
          @click="changeStatus(CONSTANTS.VIDEO_STATUS_PAUSE)"
          v-tip="$t('video.pause')"
        >
          <span class="svg-container">
            <svg-icon icon-class="pause" :clicked="videoPaused" />
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
        <el-button type="text" @click="changeLoop" v-tip="$t('video.loop')">
          <span class="svg-container" flex="cross:center">
            <svg-icon icon-class="loop" :clicked="loop" />
          </span>
        </el-button>
        <VideoProgressBar v-if="isFixed" class="progress-bar" />
      </el-button-group>
    </div>
    <div class="right">
      <div class="tool-btns">
        <el-button-group class="gap">
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
            <svg-icon
              icon-class="pick-color"
              :clicked="traggerRGB"
              style="font-size: 20px; margin-right: 2px; transform: translateY(2px);"
            />
          </el-button>
          <el-button
            type="text"
            size="mini"
            v-tip.sure="`choose images to generate GIF`"
            @click="$refs.gifDialog.show()"
            v-show="videoPaused"
          >
            <span class="svg-container" v-tip="$t('imageCenter.generateGIF')">
              <svg-icon icon-class="gif" />
            </span>
          </el-button>
          <GifDialog
            ref="gifDialog"
            :selectList="videoList.slice(startIndex, startIndex + groupCount)"
          ></GifDialog>
        </el-button-group>
        <el-divider direction="vertical"></el-divider>
        <el-button-group class="gap" v-show="videoPaused">
          <el-button
            type="text"
            size="mini"
            @mousedown.native="overlay(GLOBAL_CONSTANTS.DIRECTION_LEFT)"
            @mouseup.native="cancelOverlay(GLOBAL_CONSTANTS.DIRECTION_LEFT)"
            v-tip="$t('imageCenter.overlayLeft')"
          >
            <span class="svg-container">
              <svg-icon icon-class="direction-left" />
            </span>
          </el-button>
          <el-button
            type="text"
            size="mini"
            @mousedown.native="overlay(GLOBAL_CONSTANTS.DIRECTION_RIGHT)"
            @mouseup.native="cancelOverlay(GLOBAL_CONSTANTS.DIRECTION_RIGHT)"
            v-tip="$t('imageCenter.overlayRight')"
          >
            <span class="svg-container">
              <svg-icon
                icon-class="direction-left"
                class="svg-container"
                style="transform:rotate(180deg);"
              />
            </span>
          </el-button>
          <el-button
            type="text"
            size="mini"
            @mousedown.native="overlay(GLOBAL_CONSTANTS.DIRECTION_BOTTOM)"
            @mouseup.native="cancelOverlay(GLOBAL_CONSTANTS.DIRECTION_BOTTOM)"
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
            size="mini"
            @mousedown.native="overlay(GLOBAL_CONSTANTS.DIRECTION_TOP)"
            @mouseup.native="cancelOverlay(GLOBAL_CONSTANTS.DIRECTION_TOP)"
            v-tip="$t('imageCenter.overlayTop')"
          >
            <span class="svg-container">
              <svg-icon
                icon-class="direction-left"
                style="transform:rotate(90deg);"
              />
            </span>
          </el-button>
        </el-button-group>
        <el-button-group class="gap">
          <el-button
            type="text"
            @click="rotate(90)"
            size="mini"
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
            size="mini"
          >
            <span class="svg-container">
              <svg-icon icon-class="horizontal-flip" />
            </span>
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="reverse(-1)"
            v-tip="$t('imageCenter.verticalFlip')"
          >
            <span class="svg-container">
              <svg-icon icon-class="vertical-flip" />
            </span>
          </el-button>
        </el-button-group>
        <el-divider direction="vertical"></el-divider>
        <el-button-group class="gap">
          <el-button
            type="text"
            size="mini"
            @click="align(false)"
            v-tip="$t('imageCenter.align')"
          >
            <span class="svg-container">
              <svg-icon icon-class="align" />
            </span>
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="align(true)"
            v-tip="$t('imageCenter.align2')"
          >
            <span class="svg-container">
              <svg-icon icon-class="align2" />
            </span>
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="resetCanvas(false)"
            v-tip="$t('imageCenter.adaptive')"
          >
            <span class="svg-container">
              <svg-icon icon-class="adaptive" />
            </span>
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="resetCanvas(true)"
            v-tip="$t('imageCenter.fullsize')"
          >
            <span class="svg-container">
              <svg-icon icon-class="fullsize" />
            </span>
          </el-button>
        </el-button-group>
        <el-select
          v-model="layout"
          placeholder="layout"
          class="layout-selector"
          size="mini"
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
        <el-button-group class="gap">
          <ImageSetting></ImageSetting>
        </el-button-group>
      </div>
    </div>
  </div>
</template>

<script>
import * as GLOBAL_CONSTANTS from '@/constants';
import * as CONSTANTS from './video-constants';
import Gallery from '@/components/gallery';
import VideoProgressBar from './components/videoProgressBar';
import { createNamespacedHelpers } from 'vuex';
import GifDialog from '@/components/gif-dialog';
import ImageSetting from '@/components/image-setting';
const { mapGetters, mapActions } = createNamespacedHelpers('videoStore');
const { mapGetters: preferenceMapGetters } = createNamespacedHelpers(
  'preferenceStore'
);

export default {
  data() {
    return {
      CONSTANTS,
      GLOBAL_CONSTANTS,
      dialogVisible: false,
      traggerRGB: false,
      showSelectedMsg: false,
      groupNum: 0,
      startIndex: 0,
      offset: 0,
      loop: true,
      videoPaused: true
    };
  },
  components: { Gallery, GifDialog, ImageSetting, VideoProgressBar },
  mounted() {
    window.addEventListener('keydown', this.handleHotKey, true);
    this.$bus.$on('image_handleSelect', this.handleSelect);
    this.$bus.$on('changeVideoPaused', this.handleChangeVideoPaused);
    this.$bus.$on('videoChangeTime', this.handleVideoChangeTime);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleHotKey, true);
    this.$bus.$off('image_handleSelect', this.handleSelect);
    this.$bus.$off('changeVideoPaused', this.handleChangeVideoPaused);
    this.$bus.$off('videoChangeTime', this.handleVideoChangeTime);
  },
  methods: {
    ...mapActions([
      'emptyVideos',
      'removeVideos',
      'setVideoConfig',
      'setVideos'
    ]),
    handleVideoChangeTime() {
      this.videoPaused = false;
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
    changeStatus(status) {
      this.$bus.$emit(CONSTANTS.BUS_VIDEO_COMPARE_ACTION, status);
    },
    changeLoop() {
      this.loop = !this.loop;
      this.$bus.$emit('changeLoop', this.loop);
    },
    changeGroup(groupNum, oldGroupNum) {
      this.startIndex = Math.max(
        0,
        this.startIndex - this.groupCount * (oldGroupNum - groupNum)
      );
      this.$refs.gifDialog.clear(); // 清空gifDialog上次所选
      this.$bus.$emit('changeGroup', this.startIndex);
    },
    changeGroup(groupNum) {
      this.startIndex = Math.max(
        0,
        (groupNum - 1) * this.groupCount + this.offset
      );
      this.$bus.$emit('changeGroup', this.startIndex);
    },
    handleSelect(data) {
      this.showSelectedMsg = !!data;
    },
    handleReset() {
      this.$bus.$emit(CONSTANTS.BUS_VIDEO_COMPARE_ACTION_RESET);
      this.imgScale = 1;
    },
    handleChangeVideoPaused(videoPaused) {
      this.videoPaused = videoPaused;
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        // 如果强制reload导致没有历史路由 唯一的历史就是当前页面 则回到默认的历史页面
        this.$router.push('/video/index');
      }
    },
    resetCanvas(data) {
      this.$bus.$emit('imageCenter_resetCanvas', { name: 'reset', data });
    },
    overlay(direction) {
      this.$bus.$emit('setOverLay', {
        direction,
        status: true
      });
    },
    cancelOverlay(direction) {
      this.$bus.$emit('setOverLay', {
        direction,
        status: false
      });
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
          'imageCenter_getSelectedPosition',
          { name: 'getSelectedPosition', data: beSameSize },
          res => {
            resolve(res);
          }
        );
      }).then(data => {
        this.$bus.$emit('imageCenter_align', {
          name: 'align',
          data: { beSameSize, ...data }
        });
      });
    }
  },
  computed: {
    ...mapGetters(['videoList', 'videoConfig']),
    ...preferenceMapGetters(['preference']),
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
    smooth: {
      get() {
        return this.videoConfig.smooth;
      },
      set(newVal) {
        this.setVideoConfig({ smooth: newVal });
      }
    },
    layout: {
      get() {
        return this.videoConfig.layout;
      },
      set(val) {
        const preNum = this.groupCount * (this.groupNum - 1);
        this.setVideoConfig({ layout: val });
        const afterNum = this.groupCount * (this.groupNum - 1);
        this.offset = preNum - afterNum;
        this.startIndex = Math.max(
          0,
          (this.groupNum - 1) * this.groupCount + this.offset
        );
        this.$bus.$emit('changeGroup', this.startIndex);
        this.groupNum = Math.floor(this.startIndex / this.groupCount);
      }
    },
    isFixed() {
      return this.preference.videoProcessBarStyle === 'fixed';
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.toolbar {
  height: 28px !important;
  position: relative;
  padding: 0 5px;
  .gap + .gap {
    margin-left: 10px;
  }
  .help-info {
    color: #409eff;
    line-height: 28px;
    margin-left: 5px;
  }
  .svg-container {
    font-size: 24px;
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
      .svg-container {
        margin-left: 0.3rem;
      }
      .progress-bar {
        margin-left: 20px;
      }
    }
  }
  .right {
    .layout-selector {
      width: 80px;
      margin-left: 20px;
    }
  }
}
</style>
