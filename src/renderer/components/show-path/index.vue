<template>
  <el-button
    class="show-path"
    type="text"
    size="small"
    title="open folder"
    @click="handleOpen"
  >
    {{ path }}
  </el-button>
</template>

<script>
const { dialog } = require('electron').remote;
export default {
  name: 'show-path',
  props: ['path'],
  data() {
    return {};
  },
  mounted() {},
  methods: {
    handleOpen() {
      dialog.showOpenDialog({
        defaultPath: this.path,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.show-path {
  user-select: text;
}
</style>
