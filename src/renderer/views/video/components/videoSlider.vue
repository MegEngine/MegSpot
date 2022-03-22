<template>
  <div class="video-slider-bar-container" flex="cross:center">
    <!-- <vue-slider
      v-show="show"
      :value="currentTime"
      :max="duration"
      v-bind="options"
      :width="_width"
      @change="handleChange"
    ></vue-slider> -->
    <el-slider
      v-show="show"
      :value="currentTime"
      :max="duration"
      :step="0.01"
      :format-tooltip="formatter"
      @input="handleChange"
      class="process"
    ></el-slider>
    <span v-show="show && labelVisible" class="label">{{
      currentTime.toFixed(1)
    }}</span>
  </div>
</template>

<script>
// import VueSlider from 'vue-slider-component';
// import 'vue-slider-component/theme/default.css';

export default {
  name: 'VideoSlider',
  components: {
    // VueSlider
  },
  props: {
    time: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 60
    },
    _width: {
      type: Number,
      default: 100
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      value: 1,
      labelVisible: true,
      options: {
        dotSize: 14,
        // width: 'auto',
        height: 4,
        contained: false,
        direction: 'ltr',
        data: null,
        dataLabel: 'label',
        dataValue: 'value',
        min: 0,
        // max: 100,
        interval: 1,
        disabled: false,
        clickable: true,
        duration: 0.5,
        adsorb: false,
        lazy: false,
        tooltip: 'active',
        tooltipPlacement: 'top',
        tooltipFormatter: void 0,
        useKeyboard: false,
        keydownHook: null,
        dragOnClick: false,
        enableCross: true,
        fixed: false,
        minRange: void 0,
        maxRange: void 0,
        order: true,
        marks: false,
        dotOptions: void 0,
        dotAttrs: void 0,
        process: true,
        dotStyle: void 0,
        railStyle: void 0,
        processStyle: void 0,
        tooltipStyle: void 0,
        stepStyle: void 0,
        stepActiveStyle: void 0,
        labelStyle: void 0,
        labelActiveStyle: void 0
      }
    };
  },
  computed: {
    currentTime: {
      get() {
        return this.time;
      },
      set() {
        this.$emit('update:time', this.value);
      }
    }
  },
  methods: {
    handleChange(value) {
      // this.$emit('change', value);
      // console.log('change', value);
      this.$emit('update:time', value);
    },
    formatter(seconds) {
      var hours = Math.floor(seconds / 3600);
      seconds = seconds - hours * 3600;
      var minutes = Math.floor(seconds / 60);
      seconds = Math.floor(seconds - minutes * 60);

      return (
        hours +
        ':' +
        ('0' + minutes).slice(-2) +
        ':' +
        ('0' + seconds).slice(-2)
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.video-slider-bar-container {
  .svg-container {
    font-size: 20px;
  }
  .process {
    margin-left: 5px;
    min-width: 100px;
  }
  .label {
    margin-left: 8px;
  }
}
</style>
