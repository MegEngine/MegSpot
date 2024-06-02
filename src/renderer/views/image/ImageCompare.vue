<template>
  <div class="image-center" flex="dir:top box:first">
    <Toolbar v-show="!showCompare" v-bind:snapshotMode="snapshotMode"></Toolbar>
    <Content v-show="!showCompare" v-bind:snapshotMode="snapshotMode" ref="content" class="content-container"></Content>
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
  name: 'image-compare',
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
  computed: {
    snapshotMode() {
      return Boolean(this.$route.query.snapshotMode) || false
    }
  },
  provide() {
    return {
      getSnapshotMode: () => this.snapshotMode
    }
  },
  mounted() {
    this.initFiltersMap()
  },
  beforeDestroy() {
    this.initFiltersMap()
  },
  methods: {
    async initFiltersMap() {
      await useWorker('all', 'initFiltersMap')
    },
  }
}
</script>
<style lang="scss" scoped>
.image-center {
  height: 100%;

  .content-container {
    background: #f4f4f5;
  }
}
</style>
