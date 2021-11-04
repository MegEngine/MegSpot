<template>
  <div ref="container" id="container" flex='dir:top box:first' class="dashboard-container">
    <div flex="dir:left main:center box:mean" class="entry">
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
import VideoSwiper from './HelpVideo';
import { throttle } from '@/utils';

export default {
  name: 'dashboard',
  components: { EntryCard, VideoSwiper },
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
  },
  mounted() {
    this.videoSource = [
      {
        url:
          'http://r19airgf2.bkt.clouddn.com/MegSpot/helpVideo/image-compare.mp4',
        title: '图像对比使用介绍'
      },
      {
        url:
          'http://r19airgf2.bkt.clouddn.com/MegSpot/helpVideo/video-compare.mp4',
        title: '视频对比使用介绍'
      },
      {
        url:
          'http://r19airgf2.bkt.clouddn.com/MegSpot/helpVideo/drag-compare.mp4',
        title: '拖拽对比使用介绍'
      }
    ];
    window.addEventListener('resize', this.handleResize, true);
  },
  methods: {
    handleResize: throttle(50, function() {
      // this.$nextTick(() => {
      const container = this.$refs.container;
      this.size = {
        width: (container && ((container.offsetHeight - 240) * 5) / 3) ?? 500,
        height: (container && container.offsetHeight - 240) ?? 300
      };
      // });
    })
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 30px;
  .entry {
    margin-top: 10px;
    .entry-item {
      margin: 0 20px;
    }
  }
  .help {
  }
}
</style>
