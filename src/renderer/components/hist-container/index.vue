<template>
  <div class="container">
    <el-button id="hist-icon" type="text" @click="changeVisible(true)">
      <svg-icon icon-class="chart"></svg-icon>
    </el-button>
    <div class="hist-container">
      <canvas
        ref="hist"
        v-show="visible"
        id="hist"
        @click="changeVisible(false)"
      >
      </canvas>
      <el-button
        class="close-icon"
        icon="el-icon-circle-close"
        size="medium"
        type="text"
        @click="changeVisible(false)"
        v-show="visible"
      >
      </el-button>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('preferenceStore');
export default {
  name: 'HistContainer',
  data() {
    return {
      visible: false,
      hist: undefined
    };
  },
  created() {
    this.visible = this.preference.defaultShowHist;
  },
  mounted() {
    this.hist = this.$refs.hist;
  },
  methods: {
    ...mapActions(['setPreference']),
    // 供外部调用直接生成直方图
    // 由于mat数据较大通过属性传递 需要额外占用存储空间
    //不如通过方法调用 生成后直接释放
    generateHist(sourceMat) {
      const histMat = new cv.Mat();
      cv.cvtColor(sourceMat, histMat, cv.COLOR_RGBA2GRAY, 0);
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
      cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate);
      let result = cv.minMaxLoc(hist, mask);
      let max = result.maxVal;
      let dst = new cv.Mat.zeros(histMat.rows, histSize[0] * scale, cv.CV_8UC3);
      for (let i = 0; i < histSize[0]; i++) {
        let binVal = (hist.data32F[i] * histMat.rows) / max;
        let point1 = new cv.Point(i * scale, histMat.rows - 1);
        let point2 = new cv.Point((i + 1) * scale - 1, histMat.rows - binVal);
        cv.rectangle(dst, point1, point2, color, cv.FILLED);
      }

      cv.imshow(this.$refs.hist, dst);
      histMat.delete();
      srcVec.delete();
      hist.delete();
      mask.delete();
      dst.delete();
      return this.getHistCanvas();
    },
    getHistCanvas() {
      const copyCanvas = document.createElement('canvas');
      copyCanvas.style.width = this.hist.offsetWidth + 'px';
      copyCanvas.style.height = this.hist.offsetHeight + 'px';
      copyCanvas.width = this.hist.width;
      copyCanvas.height = this.hist.height;
      var context = copyCanvas.getContext('2d');
      context.drawImage(this.hist, 0, 0);

      return copyCanvas;
    },

    changeVisible(visible) {
      this.visible = visible;
      this.$emit('changeVisible', this.visible);
    },
    // 供外部直接调用
    setVisible(visible) {
      this.visible = visible;
    }
  },
  computed: {
    ...mapGetters(['preference'])
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.container {
  .hist-container {
    position: absolute;
    z-index: 1;
    left: 0px;
    top: 9px;
    #hist {
      width: 160px;
      height: 90px;
    }
    .close-icon {
      position: absolute;
      left: 161px;
      top: 63px;
    }
  }
  #hist-icon {
    font-size: 16px;
  }
}
</style>
