<template>
  <el-dialog :title="$t('image.layout.dialogTitle')" :visible.sync="dialogVisible" center width="600px">
    <div class="config-list">
      <div class="config-item">
        <b>{{ $t('image.layout.rowLabel') }}:</b>
        <el-input-number v-model.number="rows" :min="1" step="1" step-strictly></el-input-number>
      </div>
      <div class="config-item">
        <b>{{ $t('image.layout.columnLabel') }}:</b>
        <el-input-number v-model.number="columns" :min="1" step="1" step-strictly></el-input-number>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleCreateNewLayout">{{ $t('image.layout.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapGetters: imageMapGetters, mapActions: imageMapActions } = createNamespacedHelpers('imageStore')
const { mapGetters: videoMapGetters, mapActions: videoMapActions } = createNamespacedHelpers('videoStore')
const { mapGetters: preferenceMapGetters, mapActions: preferenceMapActions } =
  createNamespacedHelpers('preferenceStore')
import { i18nRender } from '@/lang'

export default {
  data() {
    return {
      dialogVisible: false,
      rows: 1,
      columns: 1
    }
  },
  computed: {
    ...preferenceMapGetters(['preference']),
    ...imageMapGetters(['imageList', 'imageConfig']),
    ...videoMapGetters(['videoList', 'videoConfig'])
  },
  methods: {
    ...preferenceMapActions(['setPreference']),
    ...imageMapActions(['setImageConfig']),
    ...videoMapActions(['setVideoConfig']),
    show() {
      this.dialogVisible = true
    },
    handleCreateNewLayout() {
      const newLayout = `${this.rows}x${this.columns}`
      if (this.preference.layouts.includes(newLayout)) {
        this.$message.info(i18nRender('image.layout.layoutExists'))
      } else {
        const newLayouts = [newLayout, ...this.preference.layouts]
        newLayouts.sort()
        this.setPreference({
          layouts: newLayouts
        })
        this.$message.success(i18nRender('image.layout.successAdded') + `：${newLayout}`)

        if (
          (this.$route.path.includes('image') &&
            this.imageConfig.layout !== newLayout &&
            this.imageList.length >= this.rows * this.columns) ||
          (this.$route.path.includes('video') &&
            this.videoConfig.layout !== newLayout &&
            this.videoList.length >= this.rows * this.columns)
        ) {
          this.$confirm(
            i18nRender('image.layout.confirmUseNewLayout') + '?',
            i18nRender('image.layout.confirmDialogTitle'),
            {
              confirmButtonText: i18nRender('image.layout.confirmUse'),
              cancelButtonText: i18nRender('common.cancel'),
              type: 'info',
              'append-to-body': true
            }
          ).then(() => {
            if (this.$route.path.includes('image')) {
              this.setImageConfig({ layout: newLayout })
            } else if (this.$route.path.includes('video')) {
              this.setVideoConfig({ layout: newLayout })
            }
          })
        }
      }
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.config-list {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .config-item {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }
}
</style>
