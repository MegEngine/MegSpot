<template>
  <swiper
    ref="mySwiper"
    class="swiper"
    :options="swiperOption"
    @swiper="onSwiper"
    @slideChange="onSlideChange"
  >
    <swiper-slide
      v-for="(video, index) in videoSource"
      :key="video"
      class="video-container"
    >
      <span class="title">{{ video.title }}</span>
      <video
        ref="video"
        :src="video.url"
        preload
        :autoplay="index == realIndex"
        controls
        class="video"
        @ended="handleEnd"
      ></video>
    </swiper-slide>
    <div
      class="swiper-pagination swiper-pagination-black"
      slot="pagination"
    ></div>
    <div
      class="swiper-button-prev swiper-button-white"
      slot="button-prev"
    ></div>
    <div
      class="swiper-button-next swiper-button-white"
      slot="button-next"
    ></div>
  </swiper>
</template>

<script>
import {
  Swiper,
  Navigation,
  Pagination,
  EffectFade,
  AutoUpdate,
  SwiperSlide
} from 'vue-awesome-swiper';
import 'swiper/css/swiper.css';

export default {
  name: 'VideoCarousel',
  components: {
    Swiper,
    SwiperSlide
  },
  props: {
    videoSource: {
      type: Array,
      default: () => [
        {
          url: '',
          title: ''
        }
      ]
    }
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.$swiper;
    },
    swiperOption() {
      return {
        // spaceBetween: 30, // 自动翻页的间隔时间
        effect: 'fade',
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        modules: this.modules
      };
    }
  },
  watch: {},
  data() {
    return {
      justEnded: false,
      activeIndex: 0,
      prevIndex: 0,
      duration: 3000,
      modules: [Navigation, Pagination, EffectFade, AutoUpdate]
    };
  },
  methods: {
    onSwiper(swiper) {
      console.log('slide', swiper);
    },
    onSlideChange() {
      this.justEnded = false;
      this.$refs.video[this.swiper.realIndex].currentTime = 0;
      this.$refs.video[this.swiper.realIndex].play();
    },
    handleEnd(arg) {
      console.log('ended', this.videoSource, arg.path[0].src);
      this.justEnded = true;
      this.prevIndex = this.activeIndex;
      let activeIndex = (this.activeIndex + 1) % this.videoSource.length;
      this.activeIndex = activeIndex;
      this.swiper.slideToLoop(activeIndex, 0);
    }
  }
};
</script>

<style lang="scss" scoped>
.swiper {
  margin-left: 20px;
  margin-right: 20px;
  ::v-deep {
    .el-card__body {
      padding: 0 10px;
    }
  }
  .video-container {
    max-width: 100%;
    max-height: 100%;
    margin: 0;
    object-fit: contain;
    padding-top: 10px;
    .title {
      position: absolute;
      left: 50%;
      top: 30px;
      text-align: center;
      font-weight: bold;
      color: #707078;
      transform: translateX(-50%) translateY(-50%);
    }
    .video {
      padding-bottom: 20px;
    }
  }

  .swiper-pagination {
    position: absolute;
    bottom: 6px;
  }
}
</style>
