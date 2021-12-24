<template>
  <div class="process-container" ref="container">
    <el-slider
      v-model="value"
      :max="max"
      :marks="marks"
      :format-tooltip="formatter"
      @input="handleInput"
      @change="changed = true"
      show-input
      input-size="mini"
    ></el-slider>
  </div>
</template>

<script>
export default {
  name: 'VideoProgressBar',
  data() {
    return {
      value: 0,
      lastValue: 0,
      count: 1,
      changed: false,
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
    this.$bus.$on('updateVideoTime', this.updateVideoTime);
  },
  beforeDestroy() {
    this.$bus.$off('createMark', this.createMark);
    this.$bus.$off('updateVideoTime', this.updateVideoTime);
  },
  methods: {
    updateVideoTime(obj) {
      console.log('updateVideoTime', obj);
    },
    handleInput(value) {
      this.changed = value === this.lastValue;
      if (value !== this.lastValue) {
        this.lastValue = value;
        this.$bus.$emit('videoChangeTime', value);
      }
    },
    createMark({ index, num }) {
      if (Number(num) > this.max) {
        this.max = Number(num);
      }
      if (!Reflect.has(this.marks, num)) {
        this.marks[num] = {
          label: this.$createElement('strong', index)
        };
        this.count++;
      } else {
        const indexs = this.marks[num].label.children[0].text
          .toString()
          .split(',');
        indexs.push(index);
        this.marks[num] = {
          label: this.$createElement(
            'strong',
            [...new Set(indexs)].sort((a, b) => a < b).join(',')
          )
        };
      }
      // console.log(index, this.marks);
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
  watch: {
    changed(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$parent.$emit('changed', newVal);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.process-container {
  position: absolute;
  display: block;
  margin: 0 20px;
  width: 100%;

  ::v-deep {
    .el-slider {
      width: 500px;
    }
    .el-slider__marks-text {
      text-align: center;
    }
  }
}
</style>
