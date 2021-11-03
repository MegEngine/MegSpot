<template>
  <div class="filepath-input">
    <el-input
      :placeholder="placeholder"
      prefix-icon="el-icon-search"
      :value="filePath"
      :disabled="disabled"
      :clearable="true"
      @input="updateFilePath"
      ref="filePathInput"
      size="mini"
    >
    </el-input>
  </div>
</template>

<script>
import path from 'path';
export default {
  name: 'file-path-input',
  props: {
    filePath: {
      type: String,
      default: ''
    },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  },
  methods: {
    updateFilePath(value) {
      this.$emit('update:filePath', value);
    }
  }
};
</script>

<style scoped>
.filepath-input {
  color: rgba(0, 0, 0, 0.55) !important;
  border-radius: 2px !important;
  height: 26px !important;
  line-height: 26px !important;
  margin-right: 5px;
}
</style>
