<template>
  <div flex="dir:top">
    <div flex="main:center">
      <el-button
        type="text"
        size="medium"
        @click="videoVisible = true"
        v-show="videoVisible == false"
      >
        {{ $t('common.showVideoTip') }}
      </el-button>
      <el-button
        icon="el-icon-circle-close"
        size="medium"
        type="text"
        @click="videoVisible = false"
        v-show="videoVisible == true"
      >
      </el-button>
    </div>
    <div flex="main:center">
      <swiper
        ref="mySwiper"
        v-if="videoVisible"
        class="swiper"
        :style="'width:' + _width + 'px; height:' + _height + 'px'"
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
            :autoplay="index == realIndex"
            controls
            class="video"
            :width="_width"
            :height="_height"
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
    </div>
  </div>
</template>

<script>
import {
  Swiper,
  Navigation,
  Pagination,
  EffectFade,
  SwiperSlide
} from 'vue-awesome-swiper';

export default {
  name: 'HelpVideo',
  components: {
    Swiper,
    SwiperSlide
  },
  props: {
    _width: {
      type: String | Number,
      default: '500'
    },
    _height: {
      type: String | Number,
      default: '300'
    },
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
    realIndex() {
      return (
        (this.$refs.mySwiper && this.$refs.mySwiper.$swiper.realIndex) ?? 0
      );
    }
  },
  watch: {},
  data() {
    const modules = [Navigation, Pagination, EffectFade];
    return {
      justEnded: false,
      videoVisible: false,
      activeIndex: 0,
      prevIndex: 0,
      duration: 3000,
      modules,
      swiperOption: {
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
        modules
      }
    };
  },
  methods: {
    onSwiper(swiper) {},
    onSlideChange() {
      this.justEnded = false;
      this.$refs.video[this.swiper.realIndex].currentTime = 0;
      this.$refs.video[this.swiper.realIndex].play();
    },
    handleEnd(arg) {
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
@import 'swiper/swiper.scss';
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
