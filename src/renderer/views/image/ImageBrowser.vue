<template>
  <div id="image-edit" flex="dir:top">
    <div id="toolbar" flex="main:justify cross:center">
      <div id="left-bar" flex="main:center cross:center">
        <el-badge class="tool-item">
          <Gallery
            :sortData="imageList"
            @update="setImages"
            @remove="removeImages"
          >
            <template v-slot:headButton>
              <el-button
                type="text"
                size="mini"
                :disabled="!imageList.length"
                v-tip.sure="
                  'cmd/ctrl+f show/hide selected file gallery. Click masking can hide gallery too.'
                "
              >
                {{ $t('general.selected') }}
              </el-button>
            </template>
            <template v-slot:dragItem="item">
              <img :src="item.src" :alt="item.alt" />
            </template>
          </Gallery>
        </el-badge>
        <el-button
          type="text"
          size="mini"
          icon="el-icon-circle-close"
          style="margin-right:10px"
          title="unselected all"
          :disabled="!imageList.length"
          @click="emptyImages"
        />
        <el-button-group>
          <el-button
            type="primary"
            icon="el-icon-caret-left"
            @click="changeImage(-1)"
            :disabled="imgIndex === 0"
            v-tip.sure.right="
              `switch to previous image.\r\n${$t('common.hotKey')}:cmd/ctrl+[`
            "
          >
          </el-button>
          <el-button
            type="primary"
            icon="el-icon-caret-right"
            @click="changeImage(1)"
            :disabled="imgIndex === imageList.length - 1"
            v-tip.sure.right="
              `switch to next image\r\n${$t('common.hotKey')}:cmd/ctrl+]`
            "
          >
          </el-button>
        </el-button-group>
        <el-button-group style="margin-left:10px">
          <el-button
            type="primary"
            @click="adapterShow"
            v-tip.sure.right="
              'Fill the display area with 100% height or 100% width'
            "
          >
            {{ $t('imageCenter.adaptive') }}
          </el-button>
          <el-button
            type="primary"
            @click="fullsize"
            v-tip.sure.right="'Show pictures in real picture size'"
          >
            {{ $t('imageCenter.fullsize') }}
          </el-button>
        </el-button-group>
        <span class="text-style">interpolation:</span>
        <el-select v-model="interVal">
          <el-option
            v-for="value in InterpolationFlags"
            :key="value"
            :label="value"
            :value="value"
          >
          </el-option>
        </el-select>

        <el-tooltip effect="light" placement="bottom">
          <div slot="content" id="image-style-container">
            <el-row :gutter="10">
              <el-col :span="6">
                <span class="text-style">brightness</span>
              </el-col>
              <el-col :span="18">
                <el-slider
                  :min="0"
                  :max="500"
                  v-model="brightness"
                  :format-tooltip="
                    val => {
                      return val + '%';
                    }
                  "
                ></el-slider
              ></el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="6">
                <span class="text-style">contrast</span>
              </el-col>
              <el-col :span="18">
                <el-slider
                  :min="0"
                  :max="500"
                  v-model="contrast"
                  :format-tooltip="
                    val => {
                      return val + '%';
                    }
                  "
                ></el-slider
              ></el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="6">
                <span class="text-style">saturate</span>
              </el-col>
              <el-col :span="18">
                <el-slider
                  :min="0"
                  :max="500"
                  v-model="saturate"
                  :format-tooltip="
                    val => {
                      return val + '%';
                    }
                  "
                ></el-slider
              ></el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="6">
                <span class="text-style">grayscale</span>
              </el-col>
              <el-col :span="18">
                <el-slider
                  :min="0"
                  :max="100"
                  v-model="grayscale"
                  :format-tooltip="
                    val => {
                      return val + '%';
                    }
                  "
                ></el-slider
              ></el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="6">
                <span class="text-style">opacity</span>
              </el-col>
              <el-col :span="18">
                <el-slider
                  :min="0"
                  :max="100"
                  v-model="opacity"
                  :format-tooltip="
                    val => {
                      return val + '%';
                    }
                  "
                ></el-slider
              ></el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="6"> <span class="text-style">blur</span></el-col>
              <el-col :span="18">
                <el-slider :min="0" :max="15" v-model="blur"></el-slider
              ></el-col>
            </el-row>
            <el-button @click="resetImageStyle" style="float:right">
              reset
            </el-button>
          </div>
          <el-button
            size="mini"
            type="primary"
            style="margin-left:5px"
            class="el-icon-view"
            v-tip.sure.right="
              'Only affect the display effect, not the image data, such as histogram and RGBA'
            "
          ></el-button>
        </el-tooltip>
        <div
          id="rgba-container"
          flex="main:center cross:center"
          v-tip.sure.right="
            `dbclick start or stop get average RGBA value. \nChange region by hover setting button`
          "
        >
          <el-tooltip effect="light" placement="bottom">
            <div
              slot="content"
              id="rgba-region"
              flex="main:center cross:center"
            >
              <span class="text-style">region:</span>
              <el-slider
                id="slider"
                v-model="radius"
                show-input
                :min="0"
                :max="200"
              ></el-slider>
            </div>
            <div
              id="rgba-block"
              :style="{
                backgroundColor: `rgba(
              ${RGBAcolor.R},
              ${RGBAcolor.G},
              ${RGBAcolor.B},
              ${RGBAcolor.A}
            )`
              }"
            ></div>
            <span class="text-style"
              >{{
                `rgba( ${RGBAcolor.R}, ${RGBAcolor.G}, ${RGBAcolor.B}, ${RGBAcolor.A}
          )`
              }}
            </span>
          </el-tooltip>
        </div>
      </div>
      <div class="router-back">
        <el-tooltip placement="left" :content="`${$t('common.hotKey')}：esc`">
          <span @click="goBack" class="btn"
            ><i class="el-icon-d-arrow-left"></i>{{ $t('nav.back') }}</span
          >
        </el-tooltip>
      </div>
    </div>
    <div id="main-content" flex-box="1">
      <div
        id="hist-container"
        v-tip.sure.right="
          `Show whole image Histogram by default.Show certain area Histogram by right mouse drag any region. click to fold histogram.`
        "
      >
        <canvas
          ref="hist"
          v-show="histVisible"
          id="hist"
          @click="histVisible = false"
        >
        </canvas>
        <i v-show="!histVisible" id="hist-icon" @click="histVisible = true"
          ><svg-icon icon-class="chart"></svg-icon>
        </i>
      </div>
      <div id="outline-container">
        <img
          v-show="outlineVisible"
          id="outline-img"
          @click="outlineVisible = false"
          :src="imgSrc"
        />
        <div
          id="outline-roi"
          v-show="outlineVisible"
          @click="outlineVisible = false"
        ></div>
        <i
          v-show="!outlineVisible"
          id="outline-icon"
          class="el-icon-picture"
          @click="outlineVisible = true"
        ></i>
      </div>
      <OperationContainer
        id="canvas-container"
        ref="canvas-container"
        :style="canvasStyle"
        @drag="handleDrag"
        @zoom="handleZoom"
        @dbclick="handleDbclick"
        @mouseMove="handleMove"
        @mouseDown="handleDown"
        @mouseUp="handleUp"
      >
        <canvas ref="canvasDom" id="canvasDom"></canvas>
        <div id="feedback" v-show="traggerRGB"></div>
        <div id="histArea" v-show="histPos"></div>
      </OperationContainer>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
const cv = Vue.prototype.$cv;
import OperationContainer from '@/components/operation-container';
import Gallery from '@/components/gallery';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('imageStore');
import { getImageUrlSync } from '@/utils/image';
import { throttle } from '@/utils';
export default {
  name: 'image-browser',
  components: { Gallery, OperationContainer },
  data() {
    return {
      imgSrc: undefined,
      imgIndex: 0,
      container: undefined,
      // 原图的mat 缓存用于便捷获取
      sourceMat: undefined,
      // canvas 展现内容位置
      canvasPos: {},
      // 记录roi的位置 用于用户持续连续操作计算
      roiPos: {},
      // current mat 缓存当前显示对应的mat 避免过多创建 仅拖动和缩放会更改roi区域同时会更新curMet;
      currentMat: undefined,
      // 像素选取半径
      // 是否启动获取rgb开关
      traggerRGB: false,
      // 获取局部hist
      traggerHist: false,
      histPos: undefined,
      radius: 10,
      histVisible: true,
      outlineVisible: true,
      RGBAcolor: {
        R: 0,
        G: 0,
        B: 0,
        A: 0
      },
      interVal: 'INTER_NEAREST',
      InterpolationFlags: [
        'INTER_NEAREST',
        'INTER_LINEAR',
        'INTER_CUBIC',
        'INTER_AREA',
        'INTER_LANCZOS4',
        'INTER_LINEAR_EXACT',
        'INTER_NEAREST_EXACT'
      ],
      // 预览处理效果
      brightness: 100,
      contrast: 100,
      saturate: 100,
      grayscale: 0,
      opacity: 100,
      blur: 0
    };
  },
  computed: {
    ...mapGetters(['imageList']),
    canvasStyle() {
      let filter = '';
      ['brightness', 'contrast', 'saturate', 'grayscale', 'opacity'].forEach(
        item => {
          filter += `${item}(${this[item]}%) `;
        }
      );
      ['blur'].forEach(item => {
        filter += `${item}(${this[item]}px) `;
      });
      return {
        filter
      };
    }
  },
  watch: {
    roiPos() {
      this.updateRoiRect();
    },
    interVal() {
      this.redraw();
    }
  },
  mounted() {
    this.container = this.$refs['canvas-container'];
    const { clientWidth, clientHeight } = this.container.getContainerDom();
    // 根据图像比例自适应
    this.canvasPos = this.objToFixed({
      cw: clientWidth,
      ch: clientHeight
    });
    if (!this.imageList.length) return;
    const img = new Image();
    img.onload = () => {
      this.sourceMat = cv.imread(img);
      this.calcHist();
      this.adapterShow();
    };
    img.src = getImageUrlSync(this.imageList[this.imgIndex]);
    this.imgSrc = getImageUrlSync(this.imageList[this.imgIndex]);
    window.addEventListener('keydown', this.handleHotKey, true);
    window.addEventListener('resize', this.handleResize, true);
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.handleHotKey, true);
    window.removeEventListener('resize', this.handleResize, true);
  },
  methods: {
    ...mapActions(['removeImages', 'emptyImages', 'setImages']),
    redraw() {
      const roiMat = this.sourceMat.roi(
        new cv.Rect(
          this.roiPos.rx,
          this.roiPos.ry,
          this.roiPos.rw,
          this.roiPos.rh
        )
      );
      this.currentMat && this.currentMat.delete();
      this.currentMat = this.changeSize(
        roiMat,
        this.canvasPos.cw,
        this.canvasPos.ch
      );
      this.draw(this.currentMat);
      roiMat.delete();
    },
    draw(mat) {
      cv.imshow(this.$refs.canvasDom, mat);
    },
    changeROIPos() {
      if (
        this.roiPos.rx + this.roiPos.rw > this.sourceMat.cols ||
        this.roiPos.ry + this.roiPos.rh > this.sourceMat.rows
      ) {
        this.$message({
          type: 'warning',
          message: `new Image size is too small to show current roi pos. Show new Image with adapter layout`
        });
        this.roiPos = this.getFullROI(this.canvasPos, this.sourceMat);
      }
    },
    changeImage(offset) {
      const newIndex = this.imgIndex + offset;
      if (newIndex < 0 || newIndex > this.imageList.length - 1) {
        return;
      }
      this.imgIndex = newIndex;
      const img = new Image();
      img.onload = () => {
        this.sourceMat && this.sourceMat.delete();
        this.sourceMat = cv.imread(img);
        if (
          this.roiPos.rx + this.roiPos.rw > this.sourceMat.cols ||
          this.roiPos.ry + this.roiPos.rh > this.sourceMat.rows
        ) {
          this.$message({
            type: 'warning',
            message: `new Image size is too small to show current roi pos. Show new Image with adapter layout`
          });
          this.roiPos = this.getFullROI(this.canvasPos, this.sourceMat);
        }
        this.redraw();
        this.updateRoiRect();
        this.calcHist();
      };
      img.src = getImageUrlSync(this.imageList[this.imgIndex]);
      this.imgSrc = getImageUrlSync(this.imageList[this.imgIndex]);
    },
    resetImageStyle() {
      // 预览处理效果
      this.brightness = 100;
      this.contrast = 100;
      this.saturate = 100;
      this.grayscale = 0;
      this.opacity = 100;
      this.blur = 0;
    },
    updateRoiRect() {
      const outlineRoi = document.getElementById('outline-roi');
      const outlineImg = document.getElementById('outline-img');
      const { clientWidth, clientHeight } = outlineImg;
      const scale = clientWidth / this.sourceMat.cols;
      const outlineRoiPos = this.objToFixed({
        ox: this.roiPos.rx * scale,
        oy: this.roiPos.ry * scale,
        ow: this.roiPos.rw * scale,
        oh: this.roiPos.rh * scale
      });
      outlineRoi.style.left = outlineRoiPos.ox + 'px';
      outlineRoi.style.top = outlineRoiPos.oy + 'px';
      outlineRoi.style.width = outlineRoiPos.ow + 'px';
      outlineRoi.style.height = outlineRoiPos.oh + 'px';
    },
    changeSize(mat, width, height) {
      try {
        let dst = new cv.Mat();
        let dsize = new cv.Size(width, height);
        cv.resize(mat, dst, dsize, 0, 0, cv[this.interVal]);
        return dst;
      } catch (e) {
        console.log('e', e);
      }
    },
    adapterShow() {
      // 取水平，或者竖直填充
      this.roiPos = this.getFullROI(this.canvasPos, this.sourceMat);
      this.redraw();
      this.calcHist();
    },
    fullsize() {
      this.roiPos = {
        rx: 0,
        ry: 0,
        rw: this.canvasPos.cw,
        rh: this.canvasPos.ch
      };
      // 原图比canvas要小 无法完全展现通过自适应方式展现
      if (
        this.roiPos.rw > this.sourceMat.cols ||
        this.roiPos.rh > this.sourceMat.rows
      ) {
        this.$message({
          type: 'warning',
          message: `Image size is small than canvas.Show image with adapter layout`
        });
        this.adapterShow();
        return;
      }
      const roiMat = this.sourceMat.roi(
        new cv.Rect(
          this.roiPos.rx,
          this.roiPos.ry,
          this.roiPos.rw,
          this.roiPos.rh
        )
      );
      this.currentMat && this.currentMat.delete();
      this.currentMat = roiMat;
      this.draw(this.currentMat);
      this.calcHist();
    },
    handleDown(mousePos, e) {
      // 右键获取区域生成直方图
      if (e.button === 2) {
        const { x, y } = mousePos;
        this.histPos = {
          hx: x,
          hy: y,
          hw: 0,
          hh: 0
        };
      }
    },
    handleUp(mousePos, e) {
      // reset
      if (e.button === 2) {
        const { x, y } = mousePos;
        const formatHistArea = this.getFormatHistArea();
        this.calcHist(formatHistArea);
        this.histPos = undefined;
        histArea.style.left = '0px';
        histArea.style.top = '0px';
        histArea.style.width = '0px';
        histArea.style.height = '0px';
      }
    },
    handleDrag(offset, e) {
      if (offset.x === 0 && offset.y === 0) return;
      if (!this.histPos) {
        this.handleLeftDrag(offset);
      } else {
        this.handleRightDrag(offset);
      }
    },
    handleLeftDrag(offset) {
      // 边界校验  不能为负数
      const scale = this.roiPos.rw / this.canvasPos.cw;
      let rx_new = this.roiPos.rx - offset.x * scale;
      const rx_rw_sum = rx_new + this.roiPos.rw;
      let ry_new = this.roiPos.ry - offset.y * scale;
      const ry_rh_sum = ry_new + this.roiPos.rh;
      if (rx_rw_sum > this.sourceMat.cols || ry_rh_sum > this.sourceMat.rows) {
        return;
      }
      // 修正边界值
      rx_new = rx_new < 0 ? 0 : rx_new;
      ry_new = ry_new < 0 ? 0 : ry_new;
      // 通过校验使用新位置
      this.roiPos = this.objToFixed({
        rx: rx_new,
        ry: ry_new,
        rw: this.roiPos.rw,
        rh: this.roiPos.rh
      });
      this.redraw();
    },
    handleRightDrag(offset) {
      this.histPos.hw += offset.x;
      this.histPos.hh += offset.y;
      const histArea = document.getElementById('histArea');
      const { x, y, w, h } = this.getFormatHistArea();
      histArea.style.left = `${x}px`;
      histArea.style.top = `${y}px`;
      histArea.style.width = `${w}px`;
      histArea.style.height = `${h}px`;
    },
    // 因为存在从右下向左上拖动的情况，即：hw，hh为负值 会导致x,y变化所以统一处理
    getFormatHistArea() {
      return {
        x:
          this.histPos.hw > 0
            ? this.histPos.hx
            : this.histPos.hx + this.histPos.hw,
        y:
          this.histPos.hh > 0
            ? this.histPos.hy
            : this.histPos.hy + this.histPos.hh,
        w: Math.abs(this.histPos.hw),
        h: Math.abs(this.histPos.hh)
      };
    },
    handleDbclick(mousePos) {
      this.traggerRGB = !this.traggerRGB;
    },

    handleMove(mousePos) {
      if (!this.traggerRGB) return;
      this.getRGBA(mousePos);
      const feedback = document.getElementById('feedback');
      feedback.style.left = mousePos.x - this.radius + 'px';
      feedback.style.top = mousePos.y - this.radius + 'px';
      feedback.style.width = this.radius * 2 + 'px';
      feedback.style.height = this.radius * 2 + 'px';
    },
    getRGBA(mousePos) {
      const { x, y } = mousePos;
      if (this.radius > 0) {
        const offset = this.radius;
        const x_min = x - offset >= 0 ? x - offset : 0;
        const x_max =
          x + offset <= this.currentMat.cols
            ? x + offset
            : this.currentMat.cols;
        const y_min = y - offset >= 0 ? y - offset : 0;
        const y_max =
          y + offset <= this.currentMat.rows
            ? y + offset
            : this.currentMat.rows;
        const matData = this.currentMat
          .colRange(x_min, x_max)
          .rowRange(y_min, y_max).data;
        const count = matData.length / 4;
        let R = 0,
          G = 0,
          B = 0,
          A = 0;
        for (let i = 0; i < matData.length; i += 4) {
          R += matData[i];
          G += matData[i + 1];
          B += matData[i + 2];
          A += matData[i + 3];
        }
        this.RGBAcolor = this.objToFixed({
          R: R / count,
          G: G / count,
          B: B / count,
          A: A / count
        });
      } else {
        const matData = this.currentMat.col(x).row(y).data;
        this.RGBAcolor = {
          R: matData[0],
          G: matData[1],
          B: matData[2],
          A: matData[3]
        };
      }
    },
    handleZoom: throttle(50, function(rate, mousePos) {
      const { x: roix, y: roiy } = this.transformPosToROI(
        mousePos,
        this.roiPos
      );
      const x_center = this.roiPos.rx + roix;
      const y_center = this.roiPos.ry + roiy;
      let rx_new = this.roiPos.rx + (roix / rate) * (rate - 1);
      let ry_new = this.roiPos.ry + (roiy / rate) * (rate - 1);
      let rw_new = this.roiPos.rw / rate;
      let rh_new = (rw_new / this.canvasPos.cw) * this.canvasPos.ch;

      // 修正
      if (rw_new > this.sourceMat.cols || rh_new > this.sourceMat.rows) {
        const { rw, rh } = this.getFullROI(this.canvasPos, this.sourceMat);
        rw_new = rw;
        rh_new = rh;
        rx_new = rx_new < 0 ? 0 : rx_new;
        ry_new = ry_new < 0 ? 0 : ry_new;
      }
      rx_new = rx_new < 0 ? 0 : rx_new;
      ry_new = ry_new < 0 ? 0 : ry_new;
      rw_new = rw_new < 1 ? 1 : rw_new;
      rh_new = rh_new < 1 ? 1 : rh_new;

      if (rx_new + rw_new > this.sourceMat.cols) {
        rw_new = this.sourceMat.cols - rx_new;
      }
      if (ry_new + rh_new > this.sourceMat.rows) {
        rh_new = this.sourceMat.rows - ry_new;
      }
      this.roiPos = this.objToFixed({
        rx: rx_new,
        ry: ry_new,
        rw: rw_new,
        rh: rh_new
      });
      this.redraw();
    }),
    handleResize() {
      const { clientWidth, clientHeight } = this.container.getContainerDom();
      // 根据图像比例自适应
      this.canvasPos = this.objToFixed({
        cw: clientWidth,
        ch: clientHeight
      });
      this.adapterShow();
    },
    // histPos 不设置则使用显示全图直方图，否则显示histPos区域的直方图
    calcHist(histPos) {
      return Promise.resolve().then(() => {
        const histMat = new cv.Mat();
        if (histPos) {
          const roiMat = this.sourceMat.roi(
            new cv.Rect(histPos.x, histPos.y, histPos.w, histPos.h)
          );
          cv.cvtColor(roiMat, histMat, cv.COLOR_RGBA2GRAY, 0);
          roiMat.delete();
        } else {
          cv.cvtColor(this.sourceMat, histMat, cv.COLOR_RGBA2GRAY, 0);
        }
        let srcVec = new cv.MatVector();
        srcVec.push_back(histMat);
        let accumulate = true;
        let channels = [0];
        let histSize = [256];
        let ranges = [0, 255];
        let hist = new cv.Mat();
        let mask = new cv.Mat();
        let color = new cv.Scalar(255, 255, 255);
        let scale = 1;
        // You can try more different parameters
        cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate);
        let result = cv.minMaxLoc(hist, mask);
        let max = result.maxVal;
        let dst = new cv.Mat.zeros(
          histMat.rows,
          histSize[0] * scale,
          cv.CV_8UC3
        );
        // draw hist
        for (let i = 0; i < histSize[0]; i++) {
          let binVal = (hist.data32F[i] * histMat.rows) / max;
          let point1 = new cv.Point(i * scale, histMat.rows - 1);
          let point2 = new cv.Point((i + 1) * scale - 1, histMat.rows - binVal);
          cv.rectangle(dst, point1, point2, color, cv.FILLED);
        }
        cv.imshow('hist', dst);
        histMat.delete();
        srcVec.delete();
        hist.delete();
        mask.delete();
        dst.delete();
      });
    },
    transformPosToROI(mousePos, roiPos) {
      const scale = roiPos.rw / this.canvasPos.cw;
      return this.objToFixed({
        x: mousePos.x * scale,
        y: mousePos.y * scale
      });
    },
    // 以width:100% 或 height 100% 填充 canvas
    getFullROI(canvasPos, mat) {
      const { cw, ch } = canvasPos;
      const { cols, rows } = mat;
      const widthScal = cw / cols;
      const heightScal = ch / rows;
      const roiPos = {
        rx: 0,
        ry: 0
      };
      if (widthScal > heightScal) {
        // width100%显示 height溢出 获取可显示的高度
        roiPos.rw = cols;
        roiPos.rh = ch / widthScal;
      } else if (widthScal <= heightScal) {
        // height100%显示 width溢出 获取可显示的宽度
        roiPos.rw = cw / heightScal;
        roiPos.rh = rows;
      }
      return this.objToFixed(roiPos);
    },
    objToFixed(obj) {
      const newObj = Object.assign({}, obj);
      for (const key in obj) {
        if (!isNaN(obj[key])) {
          newObj[key] = Math.round(obj[key]);
        }
      }
      return newObj;
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        // 如果强制reload导致没有历史路由 唯一的历史就是当前页面 则回到默认的历史页面
        this.$router.push('/image/index');
      }
    },
    handleHotKey(event) {
      // esc
      if (event.keyCode === 27) {
        this.goBack();
      }
      // cmd + ]
      if ((event.metaKey || event.ctrlKey) && event.keyCode === 221) {
        this.changeImage(1);
      }
      // cmd +[
      if ((event.metaKey || event.ctrlKey) && event.keyCode === 219) {
        this.changeImage(-1);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import '@/styles/variables.scss';
#image-edit {
  height: 100%;
  #toolbar {
    position: relative;
    font-size: 14px;
    .text-style {
      color: #82848a;
      font-size: 14px;
      margin-left: 10px;
    }
    #left-bar {
      .tool-item {
        margin-left: 10px;
      }
      #rgba-container {
        margin-left: 10px;
        user-select: text;
        #rgba-block {
          width: 20px;
          height: 20px;
          display: inline-block;
        }
        .tip {
          color: red;
        }
      }
    }
    .router-back {
      .btn {
        float: right;
        cursor: pointer;
        margin-right: 10px;
        color: $labelColor;
        &:hover {
          color: #303133;
        }
      }
    }
  }
  #main-content {
    position: relative;
    #hist-container {
      position: absolute;
      z-index: 1;
      left: 0px;
      top: 0px;
      #hist {
        width: 240px;
        height: 150px;
      }
      #hist-icon {
        margin-left: 5px;
        margin-top: 5px;
        color: $primaryColor;
        font-size: 20px;
      }
    }
    #outline-container {
      position: absolute;
      z-index: 1;
      right: 0px;
      top: 0px;
      #outline-img {
        max-width: 200px;
        max-height: 200px;
      }
      #outline-roi {
        position: absolute;
        border: 1px solid red;
      }
      #outline-icon {
        margin-right: 5px;
        margin-top: 5px;
        color: $primaryColor;
        font-size: 20px;
      }
    }
    #canvas-container {
      height: 100%;
      #feedback {
        position: absolute;
        border: 1px solid red;
      }
      #histArea {
        position: absolute;
        border: 1px solid $primaryColor;
      }
    }
  }
}
#rgba-region {
  #slider {
    display: inline-block;
    margin-left: 10px;
    width: 300px;
  }
}
#image-style-container {
  width: 300px;
  padding-right: 5px;
  .text-style {
    color: #82848a;
    font-size: 12px;
  }
  ::v-deep {
    .el-row {
      display: flex;
      align-items: center;
    }
  }
}
</style>
