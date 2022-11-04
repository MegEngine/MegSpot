<template>
  <div class="file-input">
    <el-tooltip :content="filePath" placement="top" effect="light" :open-delay="300">
      <span class="viewer-name">{{ filePath | getFileName }}</span>
    </el-tooltip>
    <el-button size="mini" type="text" class="el-icon-circle-plus" @click="getFile"></el-button>
    <ManageHistory
      v-model="fileHistory"
      :selected="filePath"
      :disabled="!fileHistory.length"
      @select="selectHistoryItem"
    >
      <el-button size="mini" type="text" :disabled="!fileHistory.length">
        <svg-icon icon-class="history"></svg-icon>
      </el-button>
    </ManageHistory>
  </div>
</template>

<script>
const { dialog } = require('@electron/remote')
import ManageHistory from '@/components/manage-history'
export default {
  name: 'file-input',
  components: { ManageHistory },
  model: {
    prop: 'filePath',
    event: 'update'
  },
  props: {
    filePath: {
      type: String,
      required: true,
      default: ''
    },
    fileHistory: {
      type: Array,
      required: true,
      default: () => []
    },
    ext: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {
    getFile() {
      const filters = this.ext ? [{ name: 'filter', extensions: this.ext }] : []
      dialog
        .showOpenDialog({
          title: 'add file',
          properties: ['openFile'],
          filters: filters
        })
        .then(({ canceled, filePaths }) => {
          if (canceled || !filePaths || !(filePaths.length > 0)) {
            return
          }
          const filePath = filePaths[0]
          this.$emit('update', filePath)
          this.$emit('addHistory', filePath)
        })
    },
    selectHistoryItem(item) {
      this.$emit('update', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.file-input {
  display: inline-block;
  width: 100%;
}
</style>
