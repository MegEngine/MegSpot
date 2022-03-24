<template>
  <div :class="['image-canvas', { selected: selected }]" @click.stop>
    <div ref="header" class="header" flex="main:justify cross:center">
      <div flex="cross:center">
        <CoverMask :mask="maskDom" class="cover-mask">
          <HistContainer
            ref="hist-container"
            v-tip="$t('general.histogram')"
            @changeVisible="handleHistVisible"
          />
        </CoverMask>

        <el-popover
          v-model="videoProcessBarInputVisible"
          effect="light"
          placement="left"
          trigger="manual"
        >
          <div>
            <el-input-number
              v-if="videoProcessBarInputVisible"
              :value="currentTimeData"
              :precision="3"
              :min="0"
              :max="duration || 60"
              @change="val => changeVideoTime(val)"
            />
            <span class="svg-container" @click="executeAction(1)">
              <svg-icon icon-class="play" />
            </span>
            <span class="svg-container" @click="executeAction(0)">
              <svg-icon icon-class="pause" />
            </span>
          </div>
          <span
            slot="reference"
            @click="handleVideoSliderVisible"
            @contextmenu.stop="changeVideoProcessBarInputVisible"
            class="svg-container"
            v-tip.sure="$t('video.processTip')"
          >
            <svg-icon
              icon-class="video-bar"
              :class="[videoProcessBarInputVisible ? 'icon-hover' : '']"
            />
          </span>
        </el-popover>
      </div>
      <el-tooltip
        v-if="!videoSliderVisible"
        placement="bottom"
        :open-delay="800"
      >
        <span class="compare-name" flex-box="1" v-html="getTitle"></span>
        <div slot="content">
          {{ path }}
          <br /><br />
          <span class="size">
            {{ bitMap && bitMap.width }} x {{ bitMap && bitMap.height }}</span
          >
        </div>
      </el-tooltip>
      <videoSlider
        :time.sync="currentTimeData"
        :duration="duration"
        :show="videoSliderVisible"
        :style="[selected ? { fontWeight: 'bold', color: 'red' } : {}]"
      />
      <div flex="main:right cross:center">
        <RGBAExhibit :RGBAcolor="RGBAcolor"></RGBAExhibit>
        <EffectPreview @change="changeCanvasStyle" />
      </div>
    </div>
    <div
      ref="container"
      class="canvas-container"
      id="canvas-container"
      :style="canvasStyle"
    >
      <OperationContainer
        id="canvas-container"
        ref="canvas-container"
        @drag="handleDrag"
        @zoom="handleZoom"
        @scrollEnd="handleZoomEnd"
        @dbclick="handleDbclick"
        @mouseMove="handleMove"
      >
        <div class="canvas-item" @contextmenu.prevent>
          <ScaleEditor
            class="scale-editor"
            :scale="imgScale"
            :scaleEditorVisible.sync="scaleEditorVisible"
            @show="showScaleEditor"
            @reset="resetZoom"
            @update="setZoom"
          />
          <canvas ref="canvas" :width="_width" :height="_height"> </canvas>
          <div ref="feedback" id="feedback" v-show="traggerRGB"></div>
        </div>
      </OperationContainer>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
const cv = Vue.prototype.$cv;
import OperationContainer from '@/components/operation-container';
import HistContainer from '@/components/hist-container';
import CoverMask from '@/components/cover-mask';
import RGBAExhibit from '@/components/rgba-exhibit';
import ScaleEditor from '@/components/scale-editor';
import EffectPreview from '@/components/effect-preview';
import videoSlider from './videoSlider.vue';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('videoStore');
const { mapGetters: preferenceMapGetters } = createNamespacedHelpers(
  'preferenceStore'
);
import { getImageUrlSyncNoCache } from '@/utils/image';
import { throttle } from '@/utils';
import { SCALE_CONSTANTS, DRAG_CONSTANTS } from '@/constants';
import chokidar from 'chokidar';
import * as CONSTANTS from '../video-constants';

export default {
  components: {
    OperationContainer,
    HistContainer,
    CoverMask,
    RGBAExhibit,
    ScaleEditor,
    EffectPreview,
    videoSlider
  },
  props: {
    index: {
      type: Number,
      default: 0
    },
    path: {
      type: String,
      default: ''
    },
    _width: {
      type: Number,
      default: 500
    },
    _height: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      // 监听图像文件的变化,变化后自动刷新图像
      wacther: undefined,
      header: null,
      canvas: null,
      video: null,
      duration: 60,
      currentTime: 1,
      videoSliderVisible: false,
      videoProcessBarInputVisible: false,
      paused: true,
      maskDom: undefined,
      currentHist: undefined,
      histImage: null,
      cs: null,
      image: {
        width: 0,
        height: 0
      },
      bitMap: null,
      imagePosition: null,
      cachedPositionData: null,
      imgScale: 'N/A',
      scaleEditorVisible: false,
      afterFullSize: false,
      selectedId: null,
      // 原图的mat 缓存用于便捷获取
      syncCanvasActions: [
        {
          event: 'imageCenter_resetCanvas',
          action: 'reset'
        },
        {
          event: 'imageCenter_rotate',
          action: 'rotate'
        },
        {
          event: 'imageCenter_reverse',
          action: 'reverse'
        }
      ],
      // 广播调度事件
      scheduleCanvasActions: [
        {
          event: 'image_broadcast',
          action: 'handleBroadcast'
        },
        {
          event: 'image_handleSelect',
          action: 'handleSelect'
        },
        {
          event: 'imageCenter_getSelectedPosition',
          action: 'getSelectedPosition'
        },
        {
          event: 'imageCenter_align',
          action: 'align'
        },
        {
          event: 'radius',
          action: 'setRadius'
        },
        {
          event: CONSTANTS.BUS_VIDEO_COMPARE_ACTION,
          action: 'executeAction'
        },
        {
          event: 'changeLoop',
          action: 'changeLoop'
        },
        {
          event: 'videoChangeTime',
          action: 'handleVideoChangeTime'
        },
        {
          event: 'videoResetTime',
          action: 'handleVideoResetTime'
        },
        {
          event: 'changeVideoSliderVisible',
          action: 'changeVideoSliderVisible'
        }
      ],
      histVisible: true,
      traggerRGB: false,
      radius: 10,
      RGBAcolor: {
        R: 0,
        G: 0,
        B: 0,
        A: 0
      }
    };
  },
  computed: {
    ...mapGetters(['videoConfig', 'videoList']),
    ...preferenceMapGetters(['preference']),
    selected() {
      return this.path === this.selectedId;
    },
    getTitle() {
      return this.preference.showTitle
        ? (this.selected ? `<span style='color: red'>(✔)</span>` : ``) +
            this.$options.filters.getFileName(this.path)
        : ' ';
    },
    canvasStyle() {
      return this.preference.background.style;
    },
    dynamicPickColor() {
      return this.videoConfig.dynamicPickColor;
    },
    currentTimeData: {
      get() {
        return this.currentTime;
      },
      set(value) {
        this.changeVideoTime(value);
      }
    }
  },
  mounted() {
    this.header = this.$refs.header;
    this.canvas = this.$refs.canvas;
    this.degree = 0;

    this.initCanvas();
    this.initVideo();
    this.listenEvents();
  },
  beforeDestroy() {
    this.removeEvents();
    this.video && (this.video = null);
    this.bitMap && this.bitMap.close();
  },
  watch: {
    path: {
      handler: function(newVal, oldVal) {
        if (oldVal) {
          this.wacther && this.wacther.close();
        }
        if (newVal) {
          this.wacther = chokidar
            .watch(newVal, {
              // 持续监听
              persistent: true,
              // 忽略初始化的目录检测
              ignoreInitial: true,
              // 等待写入完成
              awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
              }
            })
            .on('change', (path, details) => {
              console.log('video--change', path, details);
              // this.initImage();
              this.initVideo();
            })
            .on('unlink', (path, details) => {
              console.log('video--remove', path, details);
              this.removeVideos(path);
            });
        }
      },
      immediate: true
    },
    'videoConfig.smooth': {
      handler(newVal, oldVal) {
        this.setSmooth();
      },
      immediate: true
    }
  },
  methods: {
    changeVideoProcessBarInputVisible() {
      this.videoProcessBarInputVisible = !this.videoProcessBarInputVisible;
    },
    ...mapActions(['removeVideos']),
    // 检查边界， 保证图像至少部分在canvas内(显示大小至少为当前图像大小的DRAG_CONSTANTS)
    checkBorder(transX, transY, _width, _height) {
      const cw = this._width,
        ch = this._height,
        iw = _width ?? this.imagePosition.width,
        ih = _height ?? this.imagePosition.height;
      const constantsW = DRAG_CONSTANTS * (cw > iw ? cw : iw),
        constantsH = DRAG_CONSTANTS * (ch > ih ? ch : ih);

      let isFullFilled =
        transX <= constantsW &&
        transY <= constantsH &&
        transX + iw >= cw &&
        transY + ih >= ch; // 判断图像是否占据整个canvas
      if (isFullFilled) return true;

      let isTooLeft = transX + iw < constantsW; // 图像是否过于偏左
      let isTooRight = transX > cw - constantsW; // 图像是否过于偏右
      let isTooTop = transY + ih < constantsH; // 图像是否过于偏上
      let isTooBottom = transY > ch - constantsH; // 图像是否过于偏下
      return !(isTooLeft || isTooRight || isTooTop || isTooBottom);
    },
    // 约束缩放，保证图像的宽(或高)不小于canvas宽(或高)的SCALE_CONSTANTS
    checkSize(transW, transH) {
      let isTooSmall =
        transW < this.canvas.width * SCALE_CONSTANTS ||
        transH < this.canvas.height * SCALE_CONSTANTS;
      if (this.afterFullSize && !isTooSmall) {
        this.afterFullSize = false;
      }
      return this.afterFullSize || !isTooSmall;
    },
    // 判断图像是否占据整个canvas
    isFullFilled() {
      const cw = this.canvas.width,
        ch = this.canvas.height,
        iw = this.imagePosition.width,
        ih = this.imagePosition.height;
      const constantsW = DRAG_CONSTANTS * iw,
        constantsH = DRAG_CONSTANTS * ih;
      const { x: transX, y: transY } = this.imagePosition;
      return (
        transX <= constantsW &&
        transY <= constantsH &&
        transX + iw >= cw &&
        transY + ih >= ch
      );
    },
    executeAction(action) {
      switch (action) {
        case 1:
        case CONSTANTS.VIDEO_STATUS_START:
          this.cs.restore();
          if (this.requestId == undefined) {
            this.startAnimation();
          } else if (this.video.readyState > 0 && this.video.paused) {
            this.video.play().catch(e => {
              // console.log('error', e);
            });
          }
          this.handleVideoPaused(false);
          break;
        case 0:
        case CONSTANTS.VIDEO_STATUS_PAUSE:
          this.handleVideoPaused();
          this.initImage();
          this.requestGenerateHist();
          break;
        case -1:
        case CONSTANTS.VIDEO_STATUS_RESET:
          this.cs.restore();
          // this.video.currentTime = 0;
          this.currentTimeData = 0;
          break;
        default:
          console.error('unknown actions:' + action);
          break;
      }
    },
    changeLoop(loop) {
      this.video.loop = loop;
    },
    setCanvasStyle({ style }) {
      this.canvas.style.filter = style;
    },
    setSmooth() {
      if (this.cs) {
        this.cs.imageSmoothingEnabled = this.videoConfig.smooth;
        this.reDraw();
      }
    },
    getSnapshot() {
      // 叠加显示时候 生成快照
      return {
        snapShot: this.canvas,
        hist: this.currentHist
      };
    },
    listenEvents() {
      // 广播调度事件
      this.scheduleCanvasActions.forEach(item => {
        this.$bus.$on(item.event, this[item.action]);
      });
      // 分发事件 执行各个子组件的方法 同步状态
      this.syncCanvasActions.forEach(item => {
        this.$bus.$on(item.event, ({ name, data }) => {
          this.dispatchCanvasAction({ name, data });
        });
      });
      // 鼠标点击时隐藏编辑scale的输入框
      this.$refs.container.addEventListener(
        'click',
        () => {
          this.scaleEditorVisible = false;
        },
        false
      );
    },
    removeEvents() {
      this.scheduleCanvasActions.forEach(item => {
        this.$bus.$off(item.event, this[item.action]);
      });
      // 分发事件 执行各个子组件的方法 同步状态
      this.syncCanvasActions.forEach(item => {
        this.$bus.$off(item.event, this[item.action]);
      });
    },
    dispatchCanvasAction({ name, data }) {
      if (!this.selectedId || this.selectedId === this.path) {
        this[name](data);
      }
    },
    handleVideoPaused(state = true) {
      this.paused = state;
      this.$bus.$emit('changeVideoPaused', state);
      if (state) {
        this.video.pause();
        // console.log('paused', this.video.readyState, this.video.paused);
      } else {
      }
    },
    handleVideoResetTime() {
      this.video.currentTime = 0;
      if (this.video.readyState > 0 && this.video.paused) {
        this.video.play().catch(e => {
          // console.log('error', e);
        });
      }
    },
    handleVideoChangeTime(currentTime) {
      if (this.requestId == undefined) {
        this.startAnimation();
      }
      if (this.duration >= currentTime) {
        if (Math.abs(this.video.currentTime - currentTime) > 1) {
          this.video.currentTime = Number(currentTime).toFixed(2);
          if (this.video.readyState > 0 && this.video.paused) {
            this.video.play().catch(e => {
              // console.log('error', e);
            });
          }
        }
      } else {
        this.video.currentTime = this.duration;
        if (this.video.readyState > 0 && !this.video.paused) {
          try {
            this.video.pause();
          } catch (e) {
            console.log(this.video.readyState, this.video.paused, e);
          }
        }
      }
    },
    changeVideoTime(currentTime) {
      const paused = this.video.paused;
      if (!this.video) return;

      this.handleVideoPaused(false);
      if (this.requestId == undefined) {
        this.startAnimation();
      }

      // 设置时间节点是否在视频时长范围之内
      if (currentTime <= this.duration) {
        if (Math.abs(this.video.currentTime - currentTime) > 0.1) {
          this.video.currentTime = Number(currentTime).toFixed(2);

          if (this.video.readyState > 0) {
            this.video
              .play()
              .then(() => {
                if (paused) {
                  this.video.pause();
                }
              })
              .catch(e => {
                console.log('error', e);
              });
          }
        }
      } else {
        this.video.currentTime = this.duration;
        if (this.video.readyState > 0 && !this.video.paused) {
          try {
            this.video.pause();
          } catch (e) {
            console.log(this.video.readyState, this.video.paused, e);
          }
        }
      }
    },
    handleBroadcast({ name, data }) {
      if (this.selectedId) {
        if (data.id === this.path || this.selectedId === this.path) {
          this[name](data);
        }
      } else {
        this[name](data);
      }
    },
    // 初始化bitMap， 重新生成直方图hist
    async initImage() {
      if (this.paused) {
        let offsreen = new OffscreenCanvas(
          this.video.videoWidth,
          this.video.videoHeight
        );
        let offCtx = offsreen.getContext('2d');
        offCtx.drawImage(this.video, 0, 0);
        this.bitMap = await offsreen.transferToImageBitmap();
        // console.log('initImage', this.bitMap);
      }
      this.requestGenerateHist();
    },
    requestGenerateHist() {
      window.requestAnimationFrame(this.generateHist);
    },
    generateHist() {
      try {
        const histCanvas = document.createElement('canvas');
        histCanvas.width = this.video.videoWidth;
        histCanvas.height = this.video.videoHeight;
        let histCanvasCtx = histCanvas.getContext('2d');
        histCanvasCtx.drawImage(this.video, 0, 0);
        this.currentHist = this.$refs['hist-container'].generateHist(
          cv.imread(histCanvas)
        );
      } catch (err) {
        console.log('err', err);
      }
    },
    initCanvas() {
      this.cs = this.canvas.getContext('2d');
      this.cs.save();
      this.$nextTick(() => {
        this.cs.imageSmoothingEnabled = this.videoConfig.smooth;
      });
    },
    initVideo() {
      this.video = document.createElement('video');
      this.video.addEventListener('loadeddata', () => {
        this.$emit('loaded');
        this.duration = isNaN(this.video.duration)
          ? 60
          : Number(Number(this.video.duration).toFixed(2));
        this.handleVideoPaused(false);
        if (
          (this.imagePosition = undefined || isNaN(this.imagePosition?.height))
        ) {
          console.log('initVideo');
          this.imagePosition = this.getImageInitPos(this.canvas, this.video);
        }
        this.doZoomEnd();
      });
      this.video.addEventListener('timeupdate', () => {
        if (this.paused) return;
        this.currentTime = this.video.currentTime;
        // console.log('currentTime', this.video.currentTime, this.currentTime);
      });
      this.video.addEventListener('pause', () => {
        this.$bus.$emit('changeVideoPaused', true);
      });

      this.video.src = this.path;
      this.video.autoplay = true;
      // 默认开启视频循环
      this.video.loop = true;
    },
    startAnimation() {
      this.stopAnimation();
      const render = () => {
        if (this.video !== null) {
          this.drawImage();
        }
        if (this.paused) {
          // this.initImage()
          this.stopAnimation();
          return;
        }
        this.requestId = window.requestAnimationFrame(render);
      };
      render();
      if (this.video.readyState > 0 && this.video.paused) {
        this.video.play();
      }
    },
    stopAnimation() {
      if (this.requestId) {
        window.cancelAnimationFrame(this.requestId);
        this.requestId = null;
      }
    },
    // 供外部直接调用 待测试
    reMount() {
      this.initCanvas();
      this.image.onload = () => {
        console.log('reMount');
        this.imagePosition = this.getImageInitPos(this.canvas, this.video);
        this.drawImage();
      };
      this.image.src = getImageUrlSyncNoCache(this.path);
    },
    clearCanvas() {
      const maxLen = this.canvas.width * this.canvas.height * 4;
      this.cs.clearRect(-maxLen, -maxLen, 2 * maxLen, 2 * maxLen);
    },
    drawImage(img) {
      if (!this.imagePosition) return;
      let { x, y, width, height } = this.imagePosition;
      this.clearCanvas();
      this.cs.save();
      this.cs.translate(x + width / 2, y + height / 2);
      this.cs.rotate((this.degree * Math.PI) / 180);
      this.cs.translate(-x - width / 2, -y - height / 2);
      this.cs.drawImage(
        img ?? this.paused ? this.bitMap : this.video,
        x,
        y,
        width,
        height
      );
      this.cs.restore();
      if (this.dynamicPickColor && this.traggerRGB) {
        this.doHandleMove();
      }
    },
    handleDbclick() {
      if (!this.selected) {
        this.$bus.$emit('image_handleSelect', this.path);
      } else {
        this.$bus.$emit('image_handleSelect', null);
      }
    },
    handleSelect(selectedId) {
      this.selectedId = selectedId;
    },
    handleHistVisible(visible) {
      this.broadCast({
        name: 'doHistVisible',
        data: { visible }
      });
    },
    handleVideoSliderVisible() {
      this.$bus.$emit('changeVideoSliderVisible', !this.videoSliderVisible);
    },
    changeVideoSliderVisible(value) {
      this.videoSliderVisible = value ?? !this.videoSliderVisible;
    },
    doHistVisible({ visible }) {
      this.$refs['hist-container'].setVisible(visible);
    },
    handleScaleDbClick(data) {
      console.log('handleScaleDbClick', Object.values(arguments));
      this.scaleEditorVisible = !this.scaleEditorVisible;
    },
    handleScaleReset() {
      console.log('handleScaleReset');
    },
    changeZoom(data) {
      console.log('changeZoom', data);
    },
    // toolbar广播触发， 改变取色器显示状态
    pickColor({ status }) {
      this.traggerRGB = status;
    },
    changeCanvasStyle(newStyle) {
      // FIXME: 具体的值没有被广播
      this.broadCast({
        name: 'setCanvasStyle',
        data: { style: newStyle }
      });
    },
    setRadius(radius) {
      this.radius = radius;
    },
    handleMove: throttle(40, function(mousePos) {
      this.broadCast({
        name: 'doHandleMove',
        data: { mousePos }
      });
    }),
    async doHandleMove(e) {
      if (!this.traggerRGB) return;
      let mousePos = undefined;
      if (!e?.mousePos) {
        mousePos = this.mousePos;
      } else {
        mousePos = e.mousePos;
        this.mousePos = mousePos;
      }
      const { x, y } = mousePos;
      const feedback = this.$refs.feedback;
      feedback.style.left = x - this.radius + 'px';
      feedback.style.top = y - this.radius + 'px';
      feedback.style.width = this.radius * 2 + 'px';
      feedback.style.height = this.radius * 2 + 'px';
      await Promise.resolve().then(() => {
        const data = this.cs.getImageData(x, y, this.radius, this.radius).data;
        const count = data.length / 4;
        let r = 0,
          g = 0,
          b = 0,
          a = 0;
        for (var i = 0; i < count; i++) {
          r += data[i * 4];
          g += data[i * 4 + 1];
          b += data[i * 4 + 2];
          a += data[i * 4 + 3];
        }
        this.RGBAcolor = {
          R: parseInt(r / count),
          G: parseInt(g / count),
          B: parseInt(b / count),
          A: parseInt(a / count)
        };
      });
    },
    // 外部直接调用
    setCoverStatus({ snapShot, hist }, status) {
      if (status) {
        this.clearCanvas();
        this.cs.drawImage(snapShot, 0, 0);
        if (this.$refs['hist-container'].visible) {
          this.maskDom = hist;
        }
      } else {
        this.maskDom = null;
        this.startAnimation();
      }
    },
    reset(val) {
      this.degree = 0;
      this.cs.setTransform(1, 0, 0, 1, 0, 0);
      if (val) {
        let x = 0,
          y = 0;
        let width = this.video.videoWidth;
        let height = this.video.videoHeight;
        this.afterFullSize = true;
        this.imagePosition = { x, y, width, height };
        this.doZoomEnd();
      } else {
        this.imagePosition = this.getImageInitPos(this.canvas, this.video);
      }
      this.drawWhenPaused();
    },
    reDraw() {
      // 待测试
      window.requestAnimationFrame(this.initVideo);
    },
    drawWhenPaused() {
      if (this.paused) {
        this.drawImage();
      }
    },
    getImageInitPos(canvas, video) {
      const cw = canvas.width;
      const ch = canvas.height;

      const iw = video.videoWidth;
      const ih = video.videoHeight;

      const canvasRadio = cw / ch;
      const imageRadio = iw / ih;

      let x = 0;
      let y = 0;
      let height = ch;
      let width = cw;

      if (canvasRadio > imageRadio) {
        //比较高，所以高占100%,宽居中
        width = canvas.height * imageRadio;
        x = (canvas.width - width) / 2;
      } else {
        //比较宽，所以宽占100%,高居中
        height = canvas.width / imageRadio;
        y = (canvas.height - height) / 2;
      }
      return {
        x,
        y,
        width,
        height
      };
    },
    doDrag(data) {
      if (this.imagePosition == null) return;
      let offset = data.offset;
      let transX =
        this.imagePosition.x + (this.cs.getTransform().a || 1) * offset.x;
      let transY =
        this.imagePosition.y + (this.cs.getTransform().d || 1) * offset.y;
      if (this.checkBorder(transX, transY)) {
        // 判断是否只在指定范围内拖动
        this.imagePosition.x = transX;
        this.imagePosition.y = transY;
        if (this.paused) {
          this.drawImage();
        }
      }
    },
    /******************ScaleEditor START******************/
    showScaleEditor() {
      this.scaleEditorVisible = true;
      this.cachedPositionData = {
        scale: this.imgScale,
        imagePosition: { ...this.imagePosition }
      };
    },
    resetZoom() {
      const { scale, imagePosition } = this.cachedPositionData;
      this.imagePosition = imagePosition;
      this.cachedPositionData = {
        scale: scale,
        imagePosition: { ...imagePosition }
      };
      this.imgScale = scale;
      if (this.paused) {
        this.drawImage();
      }
    },
    setZoom(scale) {
      if (scale == this.imgScale) {
        this.imgScale = scale; // 必需, 触发scaleEditor组件更新
        return;
      }
      const oldScale = this.imgScale ?? scale;
      const scaleRatio = scale / oldScale;
      // 默认从画布中心放大
      const position = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
      // 画像不占据整个画布时，从画像中心放大
      // const isFullFilled = this.isFullFilled();
      // const position = isFullFilled
      //   ? { x: this.canvas.width / 2, y: this.canvas.height / 2 }
      //   : {
      //       x: (this.imagePosition.x + this.imagePosition.width) / 2,
      //       y: (this.imagePosition.y + this.imagePosition.height) / 2
      //     };
      this.doZoom({
        rate: scaleRatio,
        mousePos: position
      });
      this.imgScale = scale;
    },
    /******************ScaleEditor END******************/
    doZoom(data) {
      if (this.imagePosition == null) return;
      let mousePos = data.mousePos;
      let rate = data.rate;
      let x = mousePos.x - (mousePos.x - this.imagePosition.x) * rate;
      let y = mousePos.y - (mousePos.y - this.imagePosition.y) * rate;
      let height = this.imagePosition.height * rate;
      let width = this.imagePosition.width * rate;
      // 缩小时才检查显示图片是否过小
      if (
        (rate > 1 || this.checkSize(width, height)) &&
        this.checkBorder(x, y, width, height)
      ) {
        this.imagePosition = {
          x,
          y,
          height,
          width
        };
        this.imgScale = 'N/A';
      }
      this.drawImage();
    },
    doZoomEnd() {
      this.imgScale = this.video
        ? Number(this.imagePosition.width / this.video.videoWidth).toFixed(2)
        : 'N/A';
    },
    handleDrag(offset) {
      this.broadCast({
        name: 'doDrag',
        data: { offset: offset, id: this.path }
      });
    },
    handleZoom(rate, mousePos) {
      this.broadCast({
        name: 'doZoom',
        data: { rate: rate, mousePos: mousePos, id: this.path }
      });
    },
    handleZoomEnd() {
      this.imagePosition &&
        this.broadCast({
          name: 'doZoomEnd',
          data: {}
        });
    },
    broadCast({ name, data }) {
      if (!this.selected) {
        throttle(16, () => {
          this.$bus.$emit('image_broadcast', {
            name: name,
            data: data
          });
        })();
      } else {
        this[name](data);
      }
    },
    rotate(degree) {
      this.degree = (this.degree + degree) % 360;
      this.drawWhenPaused();
    },
    reverse(direction) {
      const { x, y, width, height } = this.imagePosition;
      if (direction > 0) {
        const dx = x + width / 2;
        //左右翻转
        this.cs.translate(dx, 0);
        this.cs.scale(-1, 1);
        this.cs.translate(-dx, 0);
      } else if (direction < 0) {
        const dy = y + height / 2;
        //上下翻转
        this.cs.translate(0, dy);
        this.cs.scale(1, -1);
        this.cs.translate(0, -dy);
      }
      this.drawWhenPaused();
    },
    align({ name, data }) {
      const { beSameSize, position } = data;
      if (
        this.selectedId ||
        (!this.selectedId && this.path !== this.videoList[0])
      ) {
        if (beSameSize) {
          let { x, y, width, height } = position;
          this.imagePosition = { x, y, width, height };
          this.afterFullSize = true;
          this.doZoomEnd();
        } else {
          this.imagePosition.x = position.x;
          this.imagePosition.y = position.y;
        }
        if (this.paused) {
          this.drawImage();
        }
      }
    },
    getSelectedPosition(data, callback) {
      if (
        this.selected ||
        this.path === this.selectedId ||
        (!this.selectedId && this.path === this.videoList[0])
      ) {
        callback({
          id: this.path,
          position: this.imagePosition
        });
      }
    }
  }
};
</script>
<style scoped lang="scss">
@import '@/styles/variables.scss';
.image-canvas {
  .header {
    height: 18px;
    line-height: 16px;
    background-color: #f6f6f6;
    padding-right: 10px;

    .svg-container {
      margin: 0 5px;
      font-size: 16px;
      .icon-hover {
        color: $primaryColor;
      }
    }

    .progress-bar {
      display: inline-block;
      // margin-left: 20px;
    }
  }
  .canvas-container {
    .canvas-item {
      position: relative;
      width: 100%;
      height: 100%;
      img {
        object-fit: contain;
        vertical-align: middle;
      }
      ::v-deep {
        input,
        .el-input-group__append {
          border-radius: 0;
        }
        .el-input-group__append,
        .el-input-group__prepend {
          padding: 0 6px;
          &:hover {
            color: green;
          }
        }
        .el-input__inner {
          padding: 0 2px;
        }
      }

      .canvas {
        vertical-align: middle;
        font-size: 0;
      }

      /** default canvas background */
      // .canvas-style {
      //   background: #e3e7e9;
      //   background-image: linear-gradient(45deg, #f6fafc 25%, transparent 0),
      //     linear-gradient(45deg, transparent 75%, #f6fafc 0),
      //     linear-gradient(45deg, #f6fafc 25%, transparent 0),
      //     linear-gradient(45deg, transparent 75%, #f6fafc 0);
      //   background-position: 0 0, 10px 10px, 10px 10px, 20px 20px;
      //   background-size: 20px 20px;
      // }

      #feedback {
        position: absolute;
        border: 1px solid red;
      }
    }
  }
}
</style>
