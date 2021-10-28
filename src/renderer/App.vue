<template>
  <div id="app">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
import addDragFileListener from '@/utils/dragFile';
export default {
  mounted() {
    addDragFileListener(window);
  }
};
</script>
