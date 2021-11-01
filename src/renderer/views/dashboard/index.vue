<template>
  <div ref="container" flex class="dashboard-container">
    <div flex="dir:top main:center" class="entry">
      <entry-card
        v-for="item in tools"
        :key="item.title"
        :title="item.title"
        :desc="item.desc"
        :icon="item.icon"
        :route="item.route"
        class="entry-item"
      >
      </entry-card>
    </div>
    <div class="help">
      <VideoSwiper
        :videoSource="videoSource"
        :_width="size.width"
        :_height="size.height"
      ></VideoSwiper>
    </div>
  </div>
</template>

<script>
import EntryCard from './EntryCard';
import VideoSwiper from '../help/VideoSwiper';
export default {
  name: 'dashboard',
  components: { EntryCard, VideoSwiper },
  mounted() {
    this.videoSource = [
      {
        url:
          'https://cloud.video.taobao.com/play/u/2780279213/p/1/e/6/t/1/d/ld/36255062.mp4',
        title: '视频对比使用方法'
      },
      {
        url:
          'https://cloud.video.taobao.com/play/u/2780279213/p/1/e/6/t/1/d/ld/36255062.mp4',
        title: '图像对比使用方法'
      },
      {
        url:
          'https://cloud.video.taobao.com/play/u/2780279213/p/1/e/6/t/1/d/ld/36255062.mp4',
        title: '工具栏说明'
      },
      {
        url:
          'https://cloud.video.taobao.com/play/u/2780279213/p/1/e/6/t/1/d/ld/36255062.mp4',
        title: '线性对比使用方法'
      }
    ];
    this.$nextTick(() => {
      const container = this.$refs.container;
      this.size = {
        width: (container && (container.offsetWidth / 4) * 3) ?? 400,
        height: (container && (container.offsetWidth * 9) / 16) ?? 300
      };
    });
  },
  data() {
    return {
      videoSource: [
        {
          url: '',
          title: ''
        }
      ],
      size: {
        width: 400,
        height: 300
      },
      tools: [
        {
          title: 'dashboard.entries.image.title',
          desc: 'dashboard.entries.image.desc',
          icon: 'el-icon-picture-outline',
          route: '/image/index'
        },
        {
          title: 'dashboard.entries.video.title',
          desc: 'dashboard.entries.video.desc',
          icon: 'el-icon-video-camera',
          route: '/video/index'
        }
      ]
    };
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-container {
  .entry {
    margin: 10px;
    transform: translateY(-100px);
    .entry-item {
      margin-top: 100px;
    }
  }
  .help {
    width: 80vw;
  }
}
</style>
