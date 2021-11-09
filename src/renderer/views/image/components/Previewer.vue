<template>
  <el-row
    v-viewer="options"
    v-if="showViewer"
    style="position:absolute;display:none"
    ref="viewer"
  >
    <!-- img不写src属性的话  全部加载所有图片资源 -->
    <img
      v-for="({ source, thumbnail }, index) in orginGroupAImages"
      :key="source"
      :src="thumbnail"
      :data-source="source"
      class="image"
      ref="viewimg"
      :alt="
        `第${index + 1}\/${orginGroupAImages.length}张：${
          source
            .split('atomid=')
            .pop()
            .split('&')[0]
        }`
      "
    />
  </el-row>
</template>
<script>
import ImgViewer from '@/components/image-viewer/index';
import 'viewerjs/dist/viewer.css';
import { getImageUrlSync } from '@/utils/image';
import Vue from 'vue';
Vue.use(ImgViewer, {
  debug: true,
  defaultOptions: {
    zIndex: 9999
  }
});
export default {
  props: ['picPaths', 'activeIndex'],
  data() {
    return {
      options: {
        navbar: false,
        transition: false,
        url: 'data-source'
      },
      showViewer: false,
      viewer: null,
      orginGroupAImages: []
    };
  },
  methods: {
    show() {
      this.$nextTick(() => {
        this.viewer = this.$refs.viewer.$el.$viewer;
        this.viewer.view(this.activeIndex);
      });
    },
    prepareImages() {
      this.orginGroupAImages = this.picPaths.map((item, index) => {
        return {
          thumbnail: require('@/assets/images/placeholder.png'),
          source: getImageUrlSync(item)
        };
      });
      this.showViewer = true;
    }
  }
};
</script>
