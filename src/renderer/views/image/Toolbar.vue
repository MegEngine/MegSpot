<template>
  <div flex="main:justify cross:center" class="toolbar">
    <div class="left" flex="cross:center">
      <div class="router-back">
        <!-- v-tip.sure="`${$t('common.hotKey')}：esc`" -->
        <span @click="goBack" class="btn">
          <i class="el-icon-d-arrow-left"></i>
          {{ $t('nav.back') }}
        </span>
      </div>
      <SelectedBtn
        v-if="!snapshotMode"
        :selectedList="imageList"
        :focusListIndex="new Array(groupCount).fill(0).map((_, index) => index + startIndex)"
        @update="setImages"
        @remove="removeImages"
        @click="emptyImages"
      ></SelectedBtn>
      <el-input-number
        v-if="!snapshotMode"
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
        <el-radio-button :label="false">{{ $t('imageCenter.nearestInterpolation') }}</el-radio-button>
        <el-radio-button :label="true">{{ $t('imageCenter.bilinearInterpolation') }}</el-radio-button>
      </el-radio-group>
      <el-button
        v-if="snapshotMode"
        type="text"
        size="mini"
        @click="resetSnapshotPos"
        v-tip="$t('image.toolbar.resetPositionTip')"
        style="margin-left: 10px"
      >
        {{ $t('image.toolbar.resetPosition') }}
      </el-button>
      <el-button
        v-if="snapshotMode"
        type="text"
        size="mini"
        @click="exportImage"
        v-loading.fullscreen.lock="fullscreenLoading"
        v-tip.sure="$t('image.toolbar.exportTip')"
      >
        <span class="svg-container" v-tip="$t('image.toolbar.exportTip')">
          <svg-icon icon-class="export" />
        </span>
      </el-button>
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
            <svg-icon icon-class="direction-left" class="svg-container" style="transform: rotate(180deg)" />
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
            <svg-icon icon-class="direction-left" style="transform: rotate(-90deg)" />
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
            <svg-icon icon-class="direction-left" style="transform: rotate(90deg)" />
          </span>
        </el-button>
        <el-button type="text" size="mini" v-tip.sure="`choose images to generate GIF`" @click="$refs.gifDialog.show()">
          <span class="svg-container" v-tip="$t('imageCenter.generateGIF')">
            <svg-icon icon-class="gif" />
          </span>
        </el-button>
        <GifDialog ref="gifDialog" :selectList="imageList.slice(startIndex, startIndex + groupCount)"></GifDialog>
        <el-button type="text" size="mini" v-tip.sure="$t('general.shareAsProject')" @click="handleShare">
          <span class="svg-container" v-tip="$t('general.share')">
            <svg-icon icon-class="share" />
          </span>
        </el-button>
      </el-button-group>
    </div>
    <div class="right">
      <div class="tool-btns">
        <el-button-group class="gap">
          <el-button
            type="text"
            @click="pickColor"
            size="mini"
            v-tip="$t('imageCenter.colorPicker') + ' ' + $t('common.hotKey') + ':cmd/ctrl+p'"
          >
            <span class="svg-container" style="font-size: 20px">
              <svg-icon icon-class="pick-color" :clicked="traggerRGB" />
            </span>
          </el-button>
        </el-button-group>
        <el-divider direction="vertical"></el-divider>
        <el-button-group class="gap">
          <el-button type="text" @click="rotate(90)" size="mini" v-tip="$t('imageCenter.rotate')">
            <span class="svg-container">
              <svg-icon icon-class="rotate" />
            </span>
          </el-button>
          <el-button type="text" @click="reverse(1)" v-tip="$t('imageCenter.horizontalFlip')" size="mini">
            <span class="svg-container">
              <svg-icon icon-class="horizontal-flip" />
            </span>
          </el-button>
          <el-button type="text" size="mini" @click="reverse(-1)" v-tip="$t('imageCenter.verticalFlip')">
            <span class="svg-container">
              <svg-icon icon-class="vertical-flip" />
            </span>
          </el-button>
        </el-button-group>
        <el-divider direction="vertical"></el-divider>
        <el-button-group class="gap">
          <el-button type="text" size="mini" @click="align(false)" v-tip="$t('imageCenter.align')">
            <span class="svg-container">
              <svg-icon icon-class="align" />
            </span>
          </el-button>
          <el-button type="text" size="mini" @click="align(true)" v-tip="$t('imageCenter.align2')">
            <span class="svg-container">
              <svg-icon icon-class="align2" />
            </span>
          </el-button>
          <el-button type="text" size="mini" @click="resetCanvas(false)" v-tip="$t('imageCenter.adaptive')">
            <span class="svg-container">
              <svg-icon icon-class="adaptive" />
            </span>
          </el-button>
          <el-button type="text" size="mini" @click="resetCanvas(true)" v-tip="$t('imageCenter.fullsize')">
            <span class="svg-container">
              <svg-icon icon-class="fullsize" />
            </span>
          </el-button>
        </el-button-group>
        <el-select
          v-if="!snapshotMode"
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
            :disabled="imageList.length < parseInt(item[0]) * parseInt(item[2])"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
        <el-button-group class="gap">
          <ImageSetting></ImageSetting>
        </el-button-group>
      </div>
    </div>
  </div>
</template>
<script>
import * as GLOBAL_CONSTANTS from '@/constants'
import SelectedBtn from '@/components/selected-btn'
import { createNamespacedHelpers } from 'vuex'
import GifDialog from '@/components/gif-dialog'
import ImageSetting from '@/components/image-setting'
const { mapGetters, mapActions } = createNamespacedHelpers('imageStore')
const { mapGetters: preferenceMapGetters } = createNamespacedHelpers('preferenceStore')
import { throttle } from '@/utils'
import { handleEvent } from '@/tools/hotkey'

export default {
  components: { SelectedBtn, GifDialog, ImageSetting },
  props: {
    snapshotMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      GLOBAL_CONSTANTS,
      fullscreenLoading: false,
      dialogVisible: false,
      traggerRGB: false,
      showSelectedMsg: false,
      groupNum: 0,
      startIndex: 0,
      offset: 0,
      hotkeyDownEvents: undefined,
      hotkeyUpEvents: undefined
    }
  },
  computed: {
    ...mapGetters(['imageList', 'imageConfig']),
    ...preferenceMapGetters(['preference']),
    maxGroupNum() {
      return Math.ceil(this.imageList.length / (this.layout[0] * this.layout[2]))
    },
    // 每组图片数量
    groupCount() {
      const str = this.imageConfig.layout,
        len = str.length
      return str[len - 3] * str[len - 1]
    },
    smooth: {
      get() {
        return this.imageConfig.smooth
      },
      set(newVal) {
        this.setImageConfig({ smooth: newVal })
      }
    },
    layout: {
      get() {
        return this.imageConfig.layout
      },
      set(val) {
        const preNum = this.groupCount * (this.groupNum - 1)
        this.setImageConfig({ layout: val })
        const afterNum = this.groupCount * (this.groupNum - 1)
        this.offset = preNum - afterNum
        this.startIndex = Math.max(0, (this.groupNum - 1) * this.groupCount + this.offset)
        this.$bus.$emit('changeGroup', this.startIndex)
        this.groupNum = Math.floor(this.startIndex / this.groupCount)
      }
    }
  },
  methods: {
    ...mapActions(['emptyImages', 'removeImages', 'setImageConfig', 'setImages']),
    initHotkeyEvents() {
      const hotkeyDownEvents = new Map()
      const hotkeyUpEvents = new Map()

      hotkeyDownEvents.set('back', () => {
        this.goBack()
      })
      hotkeyDownEvents.set('pickColor', () => {
        this.pickColor()
      })
      hotkeyDownEvents.set('top', () => {
        this.overlay(GLOBAL_CONSTANTS.DIRECTION_TOP)
      })
      hotkeyDownEvents.set('left', () => {
        this.overlay(GLOBAL_CONSTANTS.DIRECTION_LEFT)
      })
      hotkeyDownEvents.set('bottom', () => {
        this.overlay(GLOBAL_CONSTANTS.DIRECTION_BOTTOM)
      })
      hotkeyDownEvents.set('right', () => {
        this.overlay(GLOBAL_CONSTANTS.DIRECTION_RIGHT)
      })
      hotkeyDownEvents.set('moveDown', () => {
        this.broadCast({
          name: 'doDrag',
          data: { offset: { x: 0, y: this.preference.moveDistance } }
        })
      })
      hotkeyDownEvents.set('moveUp', () => {
        this.broadCast({
          name: 'doDrag',
          data: { offset: { x: 0, y: -this.preference.moveDistance } }
        })
      })
      hotkeyDownEvents.set('moveRight', () => {
        this.broadCast({
          name: 'doDrag',
          data: { offset: { x: this.preference.moveDistance, y: 0 } }
        })
      })
      hotkeyDownEvents.set('moveLeft', () => {
        this.broadCast({
          name: 'doDrag',
          data: { offset: { x: -this.preference.moveDistance, y: 0 } }
        })
      })
      hotkeyDownEvents.set('previousGroup', () => {
        if (this.groupNum > 1) {
          this.groupNum--
          this.changeGroup(this.groupNum, this.groupNum + 1)
        }
      })
      hotkeyDownEvents.set('nextGroup', () => {
        if (this.groupNum < this.maxGroupNum) {
          this.groupNum++
          this.changeGroup(this.groupNum, this.groupNum - 1)
        }
      })

      hotkeyUpEvents.set('top', () => {
        this.cancelOverlay(GLOBAL_CONSTANTS.DIRECTION_TOP)
      })
      hotkeyUpEvents.set('left', () => {
        this.cancelOverlay(GLOBAL_CONSTANTS.DIRECTION_LEFT)
      })
      hotkeyUpEvents.set('bottom', () => {
        this.cancelOverlay(GLOBAL_CONSTANTS.DIRECTION_BOTTOM)
      })
      hotkeyUpEvents.set('right', () => {
        this.cancelOverlay(GLOBAL_CONSTANTS.DIRECTION_RIGHT)
      })

      this.hotkeyDownEvents = hotkeyDownEvents
      this.hotkeyUpEvents = hotkeyUpEvents
    },
    handleHotKey(event) {
      handleEvent(event, this.hotkeyDownEvents)
    },
    handleHotKeyUp(event) {
      handleEvent(event, this.hotkeyUpEvents)
    },
    broadCast({ name, data }) {
      throttle(16, () => {
        this.$bus.$emit('image_broadcast', {
          name,
          data
        })
      })()
    },
    changeGroup(groupNum, oldGroupNum) {
      this.startIndex = Math.max(0, this.startIndex - this.groupCount * (oldGroupNum - groupNum))
      this.$refs.gifDialog.clear() // 清空gifDialog上次所选
      this.$bus.$emit('changeGroup', this.startIndex)
    },
    changeGroup(groupNum) {
      this.startIndex = Math.max(0, (groupNum - 1) * this.groupCount + this.offset)
      this.$bus.$emit('changeGroup', this.startIndex)
    },
    handleSelect(data) {
      this.showSelectedMsg = !!data
    },
    handleReset() {
      this.imgScale = 1
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        // 如果强制reload导致没有历史路由 唯一的历史就是当前页面 则回到默认的历史页面
        this.$router.push('/image/index')
      }
    },
    resetCanvas(data) {
      this.$bus.$emit('imageCenter_resetCanvas', { name: 'reset', data })
    },
    overlay(direction) {
      this.$bus.$emit('setOverLay', {
        direction,
        status: true
      })
    },
    cancelOverlay(direction) {
      this.$bus.$emit('setOverLay', {
        direction,
        status: false
      })
    },
    handleShare() {
      this.$bus.$emit('share')
    },
    pickColor() {
      this.traggerRGB = !this.traggerRGB
      this.$bus.$emit('image_broadcast', {
        name: 'pickColor',
        data: { status: this.traggerRGB }
      })
    },
    rotate(data) {
      this.$bus.$emit('imageCenter_rotate', { name: 'rotate', data })
    },
    reverse(data) {
      this.$bus.$emit('imageCenter_reverse', { name: 'reverse', data })
    },
    async align(beSameSize) {
      const data = await new Promise((resolve) => {
        this.$bus.$emit('imageCenter_getSelectedPosition', { name: 'getSelectedPosition', data: beSameSize }, (res) =>
          resolve(res)
        )
      })
      this.$bus.$emit('imageCenter_align', {
        name: 'align',
        data: { beSameSize, ...data }
      })
    },
    exportImage() {
      this.$bus.$emit(
        'imageCenter_exportImage',
        () => {
          this.fullscreenLoading = true
        },
        ({ directoryPath, results }) => {
          this.fullscreenLoading = false
          results.every((result) => result.status === 'fulfilled')
            ? this.$message.success(`导出成功,文件路径：${directoryPath}`)
            : this.$message.error('导出失败')
        }
      )
    },
    resetSnapshotPos() {
      this.$bus.$emit('imageCenter_resetSnapshotPos')
    }
  },
  mounted() {
    this.initHotkeyEvents()
    window.addEventListener('keydown', this.handleHotKey, true)
    window.addEventListener('keyup', this.handleHotKeyUp, true)
    this.$bus.$on('image_handleSelect', this.handleSelect)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleHotKey, true)
    window.removeEventListener('keyup', this.handleHotKeyUp, true)
    this.$bus.$off('image_handleSelect', this.handleSelect)
  }
}
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
