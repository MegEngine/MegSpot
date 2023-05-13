<template>
  <div class="selected-btn">
    <el-badge :value="selectedList.length" class="tool-item">
      <Gallery v-bind="$attrs" v-on="$listeners" :selectedList="selectedList"></Gallery>
    </el-badge>
    <el-button
      type="text"
      size="mini"
      icon="el-icon-circle-close"
      style="margin-right: 10px; color: red"
      :disabled="!selectedList.length"
      :title="`${$t('gallery.clear')}\n${$t('common.hotKey')}：cmd/ctrl+delete`"
      @click="clearAll"
    />
  </div>
</template>

<script>
import Gallery from '@/components/gallery'
import { i18nRender } from '@/lang'

export default {
  name: 'SelectedBtn',
  components: { Gallery },
  props: {
    selectedList: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  methods: {
    clearAll() {
      this.$confirm(i18nRender('gallery.clearTip') + '?', i18nRender('gallery.clear'), {
        confirmButtonText: `${i18nRender('common.confirm')} ${i18nRender('gallery.clear')}`,
        cancelButtonText: i18nRender('common.cancel'),
        type: 'warning',
        'append-to-body': true
      }).then(() => {
        this.$emit('clearAll')
      })
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
