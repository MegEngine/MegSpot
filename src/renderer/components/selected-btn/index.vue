<template>
  <div class="selected-btn">
    <el-badge :value="selectedList.length" class="tool-item">
      <Gallery v-bind="$attrs" v-on="$listeners" :selectedList="selectedList"></Gallery>
    </el-badge>
    <el-button
      type="text"
      size="mini"
      icon="el-icon-circle-close"
      style="margin-right: 10px"
      :disabled="!selectedList.length"
      :title="`${$t('common.hotKey')}：cmd/ctrl+delete`"
      @click="$emit('click')"
    />
  </div>
</template>

<script>
import Gallery from '@/components/gallery'
export default {
  name: 'SelectedBtn',
  components: { Gallery },
  props: {
    selectedList: {
      required: true,
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped lang="scss">
.selected-btn {
  display: inline-block;
  position: relative;
}
</style>
