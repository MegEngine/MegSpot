<template>
  <div class="preview" flex="dir:top">
    <div class="toolbar" flex="dir:top">
      <div flex="cross:center">
        <file-path-input
          ref="filePathInput_ref"
          class="file-path-input"
          flex-box="1"
          :filePath.sync="videoCurrentPath"
        ></file-path-input>
        <el-tooltip v-if="videoFolders.includes(videoCurrentPath)" :content="$t('image.toolbar.openFolderTip')">
          <el-button type="primary" @click="openFolder" class="addFolder">
            {{ $t('image.toolbar.openFolder') }}
          </el-button>
        </el-tooltip>
        <el-button v-else-if="videoCurrentPath === ''" type="primary" @click="$emit('addFolder')" class="addFolder">
          {{ $t('image.toolbar.addFolder') }}
        </el-button>
        <el-button v-else type="primary" @click="addFolder" class="addFolder">
          {{ $t('image.toolbar.addCurrentDirectory') }}
        </el-button>
        <el-switch
          class="show-all-switch"
          v-model="showAll"
          active-color="#1067d1"
          :active-value="true"
          :inactive-value="false"
          :active-text="$t('general.showAll')"
        ></el-switch>
        <el-radio-group v-model="showType" size="mini" class="show-type-container">
          <el-radio-button label="list">
            <svg-icon icon-class="file-table-list"></svg-icon>
          </el-radio-button>
          <el-radio-button label="thumbnail">
            <svg-icon icon-class="file-thumbnail"></svg-icon>
          </el-radio-button>
        </el-radio-group>
      </div>
      <SortToolBar
        :currentPath="videoCurrentPath"
        :allSelectd.sync="allSelectd"
        :oneOrMoreSelected.sync="oneOrMoreSelected"
        @change="handleSelectAll"
        @getSortData="handleGetSortData"
        @showDialog="handleShowDialog"
      ></SortToolBar>
    </div>
    <div class="preview-content" flex-box="1">
      <FileTable
        v-show="showType === 'list'"
        ref="fileTable"
        :showAll="showAll"
        :fileList="videoList"
        :currentPath="videoCurrentPath"
        :checkItem="checkItem"
        :addVuexItem="addVideos"
        :removeVuexItem="removeVideos"
        :emptyVuexItems="emptyVideos"
        :defaultSort="videoConfig.defaultSort"
        @sort-change="handleSortChange"
        @addFolder="$emit('addFolder')"
      ></FileTable>
      <div class="thumbnail-content" v-show="showType === 'thumbnail'">
        <Thumbnail
          v-for="item in thumbnailList"
          :key="item.path"
          :file="item"
          :fileList="videoList"
          :addVuexItem="addVideos"
          :removeVuexItem="removeVideos"
        >
          <template v-slot:default="slotProps">
            <video :src="slotProps.src" controls style="object-fit: contain; width: 200px; height: 120px" loading="lazy"></video>
          </template>
        </Thumbnail>
      </div>
    </div>
    <SortFileDialog ref="sort_file_dialog" :currentPath="videoCurrentPath" @getSortData="handleGetSortData" />
  </div>
</template>

<script>
const { shell } = require('electron')
import { i18nRender } from '@/lang'
import { isDirectory, isExist } from '@/utils/file'
import { isVideo } from '@/components/file-tree/lib/util'
import SearchInput from '@/components/search-input'
import SortToolBar from '@/components/sort-toolbar'
import SortFileDialog from '@/components/sort-file-dialog'
import FileTable from '@/components/file-table'
import Thumbnail from '@/components/thumbnail/Thumbnail.vue'
import FilePathInput from '@/components/file-path-input'
import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('videoStore')

export default {
  components: {
    Thumbnail,
    SearchInput,
    FileTable,
    FilePathInput,
    SortToolBar,
    SortFileDialog
  },
  data() {
    return {
      showType: 'list',
      thumbnailList: [],
      showAll: false
    }
  },
  computed: {
    ...mapGetters(['videoList', 'videoFolders', 'videoConfig']),
    ...mapGetters({ currentPathFromVuex: 'currentPath' }),
    arr() {
      return this.videoList.filter((item) => item.startsWith(this.videoCurrentPath))
    },
    allSelectd() {
      return this.thumbnailList.every((item) => this.arr.indexOf(item.path) >= 0)
    },
    oneOrMoreSelected() {
      return this.thumbnailList.some((item) => this.arr.indexOf(item.path) >= 0)
    },
    videoCurrentPath: {
      get() {
        return this.currentPathFromVuex
      },
      set(newFolderPath) {
        if (!newFolderPath) {
          this.setFolderPath('')
        } else {
          this.setFolderPath(newFolderPath)
        }
      }
    }
  },
  methods: {
    ...mapActions(['addVideos', 'removeVideos', 'emptyVideos', 'setVideoFolders', 'setFolderPath', 'setVideoConfig']),
    checkItem(item) {
      return item.isFile && isVideo(item.path)
    },
    handleSelectAll({ checked }) {
      if (this.allSelectd) {
        this.removeVideos(this.thumbnailList.filter((item) => item.isFile).map((item) => item.path))
      } else {
        this.addVideos(this.thumbnailList.filter((item) => item.isFile).map((item) => item.path))
      }
    },
    handleGetSortData(data, callback) {
      callback(this.$refs.fileTable.getSortData())
    },
    handleShowDialog() {
      this.$refs['sort_file_dialog'].show()
    },
    handleSortChange(sortChange) {
      const { order, property: field } = sortChange
      this.setVideoConfig({ defaultSort: { order, field } })
      // 获取新排序下的thunbnail顺序
      this.thumbnailList = this.$refs.fileTable.getSortData()
    },
    addFolder() {
      let folderPath = this.videoCurrentPath
      if (folderPath.length && isExist(folderPath)) {
        if (isDirectory(folderPath)) {
          if (this.videoFolders.includes(folderPath)) {
            this.$message.info('The folder has been added.')
          } else {
            this.setVideoFolders([...this.videoFolders, folderPath])
            this.$nextTick(() => {
              this.$message.success('Successed to add folder')
            })
          }
        } else {
          this.$message.error('Can only add folders')
        }
      } else {
        this.$message.error(i18nRender('general.invalidFolderTip'))
      }
    },
    openFolder() {
      shell.openPath(this.videoCurrentPath)
    }
  }
}
</script>

<style lang="scss" scoped>
.preview {
  height: 100%;
  background-color: #f0f3f6;
  padding: 10px;

  .toolbar {
    .show-all-switch {
      margin-left: 18px;
    }

    .show-type-container {
      margin-left: 18px;
      display: inline-block;
    }

    .file-path-input {
      display: inline-block;
    }

    .addFolder {
      margin: 0 2px;
    }
  }

  .preview-content {
    height: 0;

    .thumbnail-content {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      grid-gap: 10px;
      -ms-grid-column-align: 10px;
      overflow: auto;
      padding-bottom: 9px;
    }
  }
}
</style>
