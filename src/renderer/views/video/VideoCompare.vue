<template>
  <div class="video-center" flex="dir:top box:first">
    <Toolbar v-show="!showCompare"></Toolbar>
    <Content ref="content" v-show="!showCompare" class="content-container"></Content>
    <ImageDragDropCompare
      ref="imageDragCompareRef"
      v-show="showCompare"
      v-model="showCompare"
      :isExternal="true"
    ></ImageDragDropCompare>
  </div>
</template>

<script>
import Toolbar from './Toolbar'
import Content from './Content'
import ImageDragDropCompare from '../image/ImageDragDropCompare'
import { useWorker } from '@/utils/worker'

export default {
  name: 'video-compare',
  components: {
    Toolbar,
    Content,
    ImageDragDropCompare
  },
  data() {
    return {
      showCompare: false
    }
  },
  mounted() {
    // this.initFiltersMap()
  },
  beforeDestroy() {
    // this.initFiltersMap()
  },
  methods: {
    async initFiltersMap() {
      // await useWorker('all', 'initFiltersMap')
    }
  }
}
</script>
<style lang="scss" scoped>
.video-center {
  height: 100%;
  .content-container {
    background: #f4f4f5;
  }
}
</style>
