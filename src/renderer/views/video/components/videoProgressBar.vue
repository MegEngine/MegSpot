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

export default {
  name: 'VideoProgressBar',
  data() {
    return {
      value: 0,
      startTime: 0,
      lastValue: 0,
      max: 0,
      marks: {
        0: {
          style: {
            display: 'none'
          },
          label: '0'
        }
      }
    };
  },
  mounted() {
    this.$bus.$on('createMark', this.createMark);
    this.$bus.$on(CONSTANTS.BUS_VIDEO_COMPARE_ACTION, this.executeAction);
    this.$bus.$emit('initProcess', null, ({ currentTime, duration }) => {
      const _currentTime = Math.round(currentTime);
      this.value = _currentTime;
      this.lastValue = _currentTime;
      this.startTime = _currentTime;
      this.max = Math.max(Math.ceil(duration), this.max);
      this.countDown(this.startTime || 0);
    });
  },
  beforeDestroy() {
    this.$bus.$off('createMark', this.createMark);
    this.$bus.$off(CONSTANTS.BUS_VIDEO_COMPARE_ACTION, this.executeAction);
  },
  methods: {
    ...mapActions(['setVideoConfig']),
    countDown(startTime = 0) {
      this.getTime(startTime);
    },
    getTime(currentTime) {
      this.timer && clearTimeout(this.timer);
      if (this.max > 0 && currentTime >= this.max) {
        this.$bus.$emit('videoResetTime');
        this.countDown();
        return;
      }
      this.timer = setTimeout(() => {
        this.setVideoConfig({ currentTime: currentTime + 1 });
        this.getTime(currentTime + 1);
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
        this.lastValue = value;
        if (this.currentTime != value) {
          this.setVideoConfig({ currentTime: value });
          this.countDown(value);
        }
        this.$bus.$emit('videoChangeTime', value);
      }
    },
    createMark({ index, num }) {
      if (Number(num) > this.max) {
        this.max = Number(num);
      }
      if (!Reflect.has(this.marks, num)) {
        this.marks = Object.assign({}, this.marks, {
          [num]: {
            label: this.$createElement('strong', index)
          }
        });
      } else {
        const indexs = this.marks[num].label.children[0].text
          .toString()
          .split(',');
        if (indexs.includes(index)) return;
        indexs.push(index);
        this.marks = Object.assign({}, this.marks, {
          [num]: {
            label: this.$createElement(
              'strong',
              [...new Set(indexs)].sort((a, b) => a < b).join(',')
            )
          }
        });
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
