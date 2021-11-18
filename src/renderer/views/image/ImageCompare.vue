<template>
  <div class="image-center" flex="dir:top box:first">
    <Toolbar></Toolbar>
    <Content ref="content" class="content-container"></Content>
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
