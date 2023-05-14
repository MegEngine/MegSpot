<template>
  <div class="sequence-selector" flex="main:justify cross:center">
    <span>{{ type === 'video' ? $t('video.sequence.label') : $t('image.sequence.label') }}</span>
    <el-tooltip :content="$t('image.sequence.createTip')">
      <el-select v-model="currentCollectionName" filterable allow-create default-first-option>
        <el-option
          v-for="(collection, index) in collections"
          :key="index"
          :label="collection.name"
          :value="collection.name"
        >
          <div class="collection-item" flex="main:justify cross:center">
            <span class="title">{{ collection.name }}</span>
            <div flex="main:justify cross:center" style="gap: 3px">
              <span class="file-num">{{ collection.list.length }}</span>
              <el-button
                type="text"
                size="mini"
                icon="el-icon-circle-close"
                class="delete-btn"
                :title="$t('image.sequence.deleteTip')"
                @click.capture.stop="handleRemoveCollection(collection.name)"
              />
            </div>
          </div>
        </el-option>
      </el-select>
    </el-tooltip>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { i18nRender } from '@/lang'
import * as GLOBAL_CONSTANT from '@/constants'
const { mapGetters, mapActions } = createNamespacedHelpers('preferenceStore')
const { mapGetters: imageMapGetters, mapActions: imageMapActions } = createNamespacedHelpers('imageStore')
const { mapGetters: videoMapGetters, mapActions: videoMapActions } = createNamespacedHelpers('videoStore')

export default {
  name: 'FileSequenceSelector',
  props: {
    type: {
      type: String,
      default: 'image'
    }
  },
  data() {
    return {}
  },
  computed: {
    ...imageMapGetters({
      imageCollection: 'collection',
      imageCollections: 'collections'
    }),
    ...videoMapGetters({
      videoCollection: 'collection',
      videoCollections: 'collections'
    }),

    collections() {
      switch (this.type) {
        case 'video':
          return this.videoCollections
        case 'image':
        default:
          return this.imageCollections
      }
    },
    currentCollection() {
      switch (this.type) {
        case 'video':
          return this.videoCollection
        case 'image':
        default:
          return this.imageCollection
      }
    },
    currentCollectionName: {
      get() {
        return this.currentCollection.name
      },
      set(newCollectionName) {
        switch (this.type) {
          case 'video':
            this.setVideoCollectionName(newCollectionName)
            break
          case 'image':
          default:
            this.setImageCollectionName(newCollectionName)
        }
      }
    },
    removeCollection() {
      switch (this.type) {
        case 'video':
          return this.removeVideoCollection
        case 'image':
        default:
          return this.removeImageCollection
      }
    },
    defaultCollectionName() {
      switch (this.type) {
        case 'video':
          return GLOBAL_CONSTANT.DEFAULT_VIDEO_COLLECTION_NAME
        case 'image':
        default:
          return GLOBAL_CONSTANT.DEFAULT_IMAGE_COLLECTION_NAME
      }
    }
  },
  methods: {
    ...imageMapActions({
      setImageCollectionName: 'setCollectionName',
      removeImageCollection: 'removeCollection'
    }),
    ...videoMapActions({
      setVideoCollectionName: 'setCollectionName',
      removeVideoCollection: 'removeCollection'
    }),
    handleRemoveCollection(collectionName) {
      const deleteTextTitle = `${i18nRender('general.delete')} ${i18nRender(
        this.type === 'video' ? 'video.sequence.title' : 'image.sequence.title'
      )}`
      this.$confirm(deleteTextTitle, `${deleteTextTitle}【${collectionName}】?`).then(() => {
        if (collectionName === this.defaultCollectionName) {
          this.$message.warning('cannot remove default image collection')
          return
        } else if (collectionName === this.currentCollectionName) {
          this.currentCollectionName = this.defaultCollectionName
        }
        this.removeCollection(collectionName)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.sequence-selector {
  gap: 8px;
}

::v-deep {
  .collection-item {
    .file-num {
      color: #8492a6;
      font-size: 13px;
    }
    .delete-btn {
      color: red;
    }
  }
}
</style>
