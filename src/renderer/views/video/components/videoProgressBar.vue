<template>
  <el-slider
    :value="currentTime"
    :max="max"
    :marks="marks"
    :format-tooltip="formatter"
    @input="handleInput"
    class="process"
  ></el-slider>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('videoStore');
import * as CONSTANTS from '../video-constants';

const defaultMarks = {
  0: {
    style: {
      display: 'none'
    },
    label: '0'
  }
};

export default {
  name: 'VideoProgressBar',
  props: {
    time: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      value: 0,
      startTime: 0,
      lastValue: 0,
      max: 0,
      marks: defaultMarks
    };
  },
  mounted() {
    this.$bus.$emit('getMarks', null, this.handleVideoLoaded);
    this.$bus.$on('videoLoaded', this.handleVideoLoaded);
    this.$bus.$on(CONSTANTS.BUS_VIDEO_COMPARE_ACTION, this.executeAction);
  },
  beforeDestroy() {
    this.timer && clearTimeout(this.timer);
    this.$bus.$off('videoLoaded', this.handleVideoLoaded);
    this.$bus.$off(CONSTANTS.BUS_VIDEO_COMPARE_ACTION, this.executeAction);
  },
  methods: {
    ...mapActions(['setVideoConfig']),
    countDown(startTime = 0) {
      this.getTime(startTime);
    },
    getTime() {
      this.timer && clearTimeout(this.timer);
      if (this.max > 0 && this.currentTime >= this.max) {
        this.$bus.$emit('videoResetTime');
        this.setVideoConfig({ currentTime: 0 });
      }
      this.timer = setTimeout(() => {
        this.setVideoConfig({ currentTime: this.currentTime + 1 });
        this.getTime();
      }, 1000);
    },
    executeAction(action) {
      switch (action) {
        case CONSTANTS.VIDEO_STATUS_START:
          this.countDown(this.currentTime);
          break;
        case CONSTANTS.VIDEO_STATUS_PAUSE:
          this.stopVideoTime();
          break;
        case CONSTANTS.VIDEO_STATUS_RESET:
          this.countDown();
          break;
        default:
          console.error('unknown actions:' + action);
          break;
      }
    },
    stopVideoTime() {
      this.timer && clearTimeout(this.timer);
    },
    handleInput(value) {
      if (value !== this.lastValue) {
        this.$bus.$emit('videoChangeTime', value);
        this.lastValue = value;
        if (this.currentTime != value) {
          this.setVideoConfig({ currentTime: value });
          this.countDown(value);
        }
      }
    },
    formatter(seconds) {
      var hours = Math.floor(seconds / 3600);
      seconds = seconds - hours * 3600;
      var minutes = Math.floor(seconds / 60);
      seconds = seconds - minutes * 60;

      return (
        hours +
        ':' +
        ('0' + minutes).slice(-2) +
        ':' +
        ('0' + seconds).slice(-2)
      );
    },
    formatter2(seconds) {
      const minuteSec = 60;
      const hourSec = 3600;
      const daySec = 86400;

      const dd = Math.floor(seconds / daySec);
      const hh = Math.floor((seconds % daySec) / hourSec);
      const mm = Math.floor((seconds % hourSec) / minuteSec);
      const ss = seconds % minuteSec;
      if (dd > 0) {
        return dd + 'd' + hh + 'h' + mm + 'm' + ss + 's';
      } else if (hh > 0) {
        return hh + 'h' + mm + 'm' + ss + 's';
      } else if (mm > 0) {
        return mm + 'm' + ss + 's';
      } else {
        return ss + 's';
      }
    },
    handleVideoLoaded(marks) {
      if (Object.keys(this.marks).length <= 1) {
        this.generateMarks(marks);
      }
      if (this.timer == undefined) {
        this.countDown(this.currentTime);
      }
    },
    generateMarks(marksArr) {
      marksArr.forEach(res => {
        const [_num, label] = res;
        const num = Math.round(_num).toString();
        if (Number(num) > this.max) {
          this.max = Number(num);
        }
        if (num == 0) {
          return;
        } else if (Reflect.has(this.marks, num)) {
          const labels = this.marks[num].label.toString().split(',');
          labels.push(label);
          labels.sort((a, b) => a < b);
          this.marks = Object.assign({}, this.marks, {
            [num]: {
              label: labels.join(',').toString(),
              style: ''
            }
          });
        } else {
          this.marks = Object.assign({}, this.marks, {
            [num]: {
              label: label.toString(),
              style: ''
            }
          });
        }
      });
    }
  },
  computed: {
    ...mapGetters(['videoList', 'videoConfig']),
    currentTime() {
      return this.videoConfig.currentTime;
    }
  }
};
</script>

<style lang="scss" scoped>
.process {
  // position: absolute;
  display: inline-block;
  // margin: 0 20px;
  // width: 100%;
  width: 300px;

  ::v-deep {
    /** 进度条宽度 */
    .el-slider {
      width: 300px !important;
    }
    .el-slider__marks-text {
      text-align: center;
      transform: translateX(-16px) translateY(-10px);
    }
  }
}
</style>
