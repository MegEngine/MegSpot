<template>
  <div class="image-center" flex="dir:top box:first">
    <Toolbar v-bind:snapshotMode="snapshotMode"></Toolbar>
    <Content
      v-bind:snapshotMode="snapshotMode"
      ref="content"
      class="content-container"
    ></Content>
  </div>
</template>

<script>
import Toolbar from './Toolbar';
import Content from './Content';

export default {
  name: 'image-compare',
  components: {
    Toolbar,
    Content
  },
  computed: {
    snapshotMode() {
      return Boolean(this.$route.query.snapshotMode) || false;
    }
  },
  provide() {
    return {
      getSnapshotMode: () => this.snapshotMode
    };
  }
};
</script>
<style lang="scss" scoped>
.image-center {
  height: 100%;
  .content-container {
    background: #f4f4f5;
  }
}
</style>
