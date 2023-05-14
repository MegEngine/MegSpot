<template>
  <el-dialog
    :visible.sync="visible"
    :title="`${$t('general.select')} ${$t('image.sequence.compare')}`"
    width="80%"
    center
  >
    <el-form>
      <el-form-item :label="type === 'video' ? $t('video.sequence.selectTip') : $t('image.sequence.selectTip')">
        <el-select v-model="selectedCollectionNames" filterable multiple default-first-option>
          <el-option
            v-for="(collection, index) in collections"
            :key="index"
            :label="collection.name"
            :value="collection.name"
          >
            <div class="collection-item" flex="main:justify cross:center">
              <span class="title">{{ collection.name }}</span>
              <span class="file-num">{{ collection.list.length }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="hide">{{ $t('common.cancel') }}</el-button>
      <el-button
        type="primary"
        :disabled="!selectedCollectionNames || selectedCollectionNames.length < 2"
        @click="handleCompare"
      >
        {{ $t('image.sequence.compare') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { i18nRender } from '@/lang'
import { uuidv4 } from '@/utils/analyze'
import * as GLOBAL_CONSTANT from '@/constants'
const { mapGetters, mapActions } = createNamespacedHelpers('preferenceStore')
const { mapGetters: imageMapGetters, mapActions: imageMapActions } = createNamespacedHelpers('imageStore')
const { mapGetters: videoMapGetters, mapActions: videoMapActions } = createNamespacedHelpers('videoStore')

export default {
  name: 'FileSequenceCompareDialog',
  props: {
    type: {
      type: String,
      default: 'image'
    }
  },
  data() {
    return {
      visible: false,
      selectedCollectionNames: undefined
    }
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
    addCollection() {
      switch (this.type) {
        case 'video':
          return this.addVideoCollection
        case 'image':
        default:
          return this.addImageCollection
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
      removeImageCollection: 'removeCollection',
      addImageCollection: 'addCollection'
    }),
    ...videoMapActions({
      setVideoCollectionName: 'setCollectionName',
      removeVideoCollection: 'removeCollection',
      addVideoCollection: 'addCollection'
    }),
    initCollectionNames() {
      this.selectedCollectionNames = [this.currentCollectionName]
    },
    show() {
      this.initCollectionNames()
      this.visible = true
    },
    hide() {
      this.visible = false
    },
    handleCompare() {
      if (this.selectedCollectionNames.length >= 2) {
        const loadingMsg = this.$message.info('Loading...')
        const selectedCollections = this.selectedCollectionNames.map((collectionName) =>
          this.collections.find((collection) => collection.name === collectionName)
        )
        const newCollection = {
          name: `_tmpList_${uuidv4()}`,
          type: 'file',
          isTmp: true,
          groupSize: selectedCollections.length,
          list: []
        }
        const listLength = selectedCollections[0].list.length
        if (selectedCollections.some((collection) => collection.list.length !== listLength)) {
          this.$message.warning(i18nRender('image.sequence.differentSizeTip'))
        }
        this.addCollection(newCollection)
        this.currentCollectionName = newCollection.name
        this.$router
          .push(
            {
              path: this.type === 'video' ? '/video/compare' : '/image/compare',
              query: { groupSize: newCollection.groupSize }
            },
            () => {
              loadingMsg.close()
            }
          )
          .then(() => {
            for (let i = 0; i < listLength; i++) {
              for (const collection of selectedCollections) {
                newCollection.list.push(collection.list[i])
              }
            }
            this.hide()
          })
      } else {
        this.$message.warning('need two or more collections')
      }
    }
  },
  mounted() {
    this.initCollectionNames()
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
