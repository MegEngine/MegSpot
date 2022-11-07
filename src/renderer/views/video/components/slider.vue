<template>
  <div class="slider-container">
    <!-- <vue-slider v-if="frameRate > 0" v-model="sliderData" :marks="marks"></vue-slider> -->
    <vue-slider
      v-model="sliderData"
      :interval="interval"
      :duration="duration"
      :max="maxData"
      :tooltip="'hover'"
      :tooltip-formatter="formatTime"
      :tooltip-placement="`top`"
      :drag-on-click="dragOnClick"
      style="cursor: pointer"
    ></vue-slider>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import { debounce } from '@/utils'

export default {
  name: 'slider',
  components: {
    VueSlider
  },
  props: {
    value: {
      type: Number,
      required: true
    },
    interval: {
      type: Number,
      default: 0.01
    },
    // frameRate: {
    //   type: Number | String,
    //   default: 0
    // },
    duration: {
      type: Number,
      default: 0 // 0.5
    },
    dragOnClick: {
      type: Boolean,
      default: true
    },
    max: {
      type: Number,
      default: 60
    }
  },
  computed: {
    sliderData: {
      get() {
        return Number(this.value).toFixed(2)
      },
      set(val) {
        this._debounceSetValue(val)
      }
    },
    // marks() {
    //   const frameRate = Number(this.frameRate)
    //   const interval = !isNaN(frameRate) && frameRate > 0 ? 1 / frameRate : 0.04
    //   const cur = Number(this.value)
    //   const start = Math.min(0, cur)
    //   const end = Math.max(this.max, cur)
    //   const res = []
    //   let count = 0
    //   for (let i = cur; i > start , count < 5; i -= interval, count++) {
    //     res.push(i)
    //   }
    //   count = 0
    //   for (let i = cur; i < end, count < 5; i += interval, count++) {
    //     res.push(i)
    //   }
    //   return res
    // },
    maxData() {
      return parseFloat(this.max.toFixed(2))
    }
  },
  beforeCreate() {
    this._debounceSetValue = debounce(50, (val) => {
      this.setValue(val)
    })
  },
  methods: {
    setValue(value) {
      this.$emit('update', value)
    },
    formatTime(time) {
      if (!time) {
        return ''
      }
      let seconds = Number(time).toFixed(4)
      var hours = Math.floor(seconds / 3600)
      seconds = seconds - hours * 3600
      var minutes = Math.floor(seconds / 60)
      seconds = /\d+.\d{2}/.exec(seconds - minutes * 60)

      return `${hours > 0 ? hours + 'h' : ''}${minutes > 0 ? minutes + 'm' : ''}${seconds > 0 ? seconds + 's' : ''}`
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.slider-container {
  $themeColor: $primaryColor;
  min-width: 100px;
  width: 100%;
  height: 16px;
}
</style>
