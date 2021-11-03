<template>
  <div class="toolbar" flex="main:justify cross:center">
    <div class="left" flex="cross:center">
      <div class="router-back" v-tip.sure="`${$t('common.hotKey')}：esc`">
        <span @click="goBack" class="btn"
          ><i class="el-icon-d-arrow-left"></i>{{ $t('nav.back') }}</span
        >
      </div>
      <Gallery
        :sortData="imageList"
        :focusListIndex="
          new Array(groupCount).fill(0).map((_, index) => index + startIndex)
        "
        @update="setImages"
        @remove="removeImages"
      >
        <template v-slot:headButton>
          <el-badge :value="imageList.length" class="item">
            <el-button
              type="text"
              :disabled="!imageList.length"
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
        :disabled="!imageList.length"
        @click="emptyImages"
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
        <span v-show="showSelectedMsg" class="msg">
          {{ $t('imageCenter.selectedMsg') }}
        </span>
      </div>
    </div>
    <div class="middle">
      <el-button-group class="gap">
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
        <el-button
          type="text"
          size="mini"
          v-tip.sure="`choose images to generate GIF`"
          @click="$refs.gifDialog.show()"
        >
          <span class="svg-container" v-tip="$t('imageCenter.generateGIF')">
            <svg-icon icon-class="gif" />
          </span>
        </el-button>
        <GifDialog
          ref="gifDialog"
          :selectList="imageList.slice(startIndex, startIndex + groupCount)"
        ></GifDialog>
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
            <span class="svg-container" style="font-size: 20px">
              <svg-icon icon-class="pick-color" />
            </span>
          </el-button>
        </el-button-group>
        <el-divider direction="vertical"></el-divider>
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
      </div>
    </div>
  </div>
</template>
<script>
import * as GLOBAL_CONSTANTS from '@/constants';
import Gallery from '@/components/gallery';
import { createNamespacedHelpers } from 'vuex';
import GifDialog from '@/components/gif-dialog';
const { mapGetters, mapActions } = createNamespacedHelpers('imageStore');

export default {
  data() {
    return {
      GLOBAL_CONSTANTS,
      dialogVisible: false,
      traggerRGB: false,
      showSelectedMsg: false,
      groupNum: 0,
      startIndex: 0,
      offset: 0
    };
  },
  components: { Gallery, GifDialog },
  computed: {
    ...mapGetters(['imageList', 'imageConfig']),
    maxGroupNum() {
      return Math.ceil(
        this.imageList.length / (this.layout[0] * this.layout[2])
      );
    },
    // 每组图片数量
    groupCount() {
      const str = this.imageConfig.layout,
        len = str.length;
      return str[len - 3] * str[len - 1];
    },
    smooth: {
      get() {
        return this.imageConfig.smooth;
      },
      set(newVal) {
        this.setImageConfig({ smooth: newVal });
      }
    },
    layout: {
      get() {
        return this.imageConfig.layout;
      },
      set(val) {
        const preNum = this.groupCount * (this.groupNum - 1);
        this.setImageConfig({ layout: val });
        const afterNum = this.groupCount * (this.groupNum - 1);
        this.offset = preNum - afterNum;
        this.startIndex = Math.max(
          0,
          (this.groupNum - 1) * this.groupCount + this.offset
        );
        this.$bus.$emit('changeGroup', this.startIndex);
        this.groupNum = Math.floor(this.startIndex / this.groupCount);
      }
    }
  },
  methods: {
    ...mapActions([
      'emptyImages',
      'removeImages',
      'setImageConfig',
      'setImages'
    ]),
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
        this.changeGroup(this.groupNum);
      }
      // cmd/ctrl + → 向后切换一个分组
      if (
        (event.metaKey || event.ctrlKey) &&
        event.keyCode === 39 &&
        this.groupNum < this.maxGroupNum
      ) {
        this.groupNum++;
        this.changeGroup(this.groupNum);
      }
    },
    changeGroup(groupNum) {
      this.startIndex = Math.max(
        0,
        (groupNum - 1) * this.groupCount + this.offset
      );
      this.$refs.gifDialog.clear(); // 清空gifDialog上次所选
      this.$bus.$emit('changeGroup', this.startIndex);
    },
    changeZoom(newV, oldV) {
      if (newV >= GLOBAL_CONSTANTS.SCALE_CONSTANTS) {
        this.$bus.$emit(CONSTANTS.BUS_VIDEO_COMPARE_ACTION_SET_ZOOM, {
          imgScale: newV,
          currentZoom: oldV,
          lastX: this.lastX,
          lastY: this.lastY
        });
      }
    },
    handleSelect(data) {
      this.showSelectedMsg = !!data;
    },
    handleReset() {
      this.$bus.$emit(CONSTANTS.BUS_VIDEO_COMPARE_ACTION_RESET);
      this.imgScale = 1;
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        // 如果强制reload导致没有历史路由 唯一的历史就是当前页面 则回到默认的历史页面
        this.$router.push('/image/index');
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
  mounted() {
    window.addEventListener('keydown', this.handleHotKey, true);
    this.$bus.$on('image_handleSelect', this.handleSelect);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleHotKey, true);
    this.$bus.$off('image_handleSelect', this.handleSelect);
  }
};
</script>
<style lang="scss" scoped>
@import '@/styles/variables.scss';
.toolbar {
  height: 28px;
  padding: 0 10px;
  position: relative;
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
