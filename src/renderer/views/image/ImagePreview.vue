<template>
  <div class="preview" ref="preview" flex="dir:top">
    <div class="toolbar" flex="dir:top">
      <div flex="cross:center">
        <file-path-input
          flex-box="1"
          ref="filePathInput_ref"
          class="file-path-input"
          :filePath.sync="currentPath"
        >
        </file-path-input>
        <el-tooltip
          v-if="imageFolders.includes(currentPath)"
          :content="$t('image.toolbar.openFolderTip')"
        >
          <el-button type="primary" @click="openFolder" class="addFolder">{{
            $t('image.toolbar.openFolder')
          }}</el-button>
        </el-tooltip>
        <el-button v-else type="primary" @click="addFolder" class="addFolder">{{
          $t('image.toolbar.addFolder')
        }}</el-button>
        <el-switch
          class="show-all-switch"
          v-model="showAll"
          active-color="#1067d1"
          :active-value="true"
          :inactive-value="false"
          :active-text="$t('general.showAll')"
        >
        </el-switch>
        <el-radio-group
          v-model="showType"
          size="mini"
          class="show-type-container"
        >
          <el-radio-button label="list">
            <svg-icon icon-class="file-table-list"></svg-icon>
          </el-radio-button>
          <el-radio-button label="thumbnail">
            <svg-icon icon-class="file-thumbnail"></svg-icon>
          </el-radio-button>
        </el-radio-group>
      </div>
      <SortToolBar
        :currentPath="currentPath"
        :btnDisabled="btnDisabled"
        :allSelectd.sync="allSelectd"
        :oneOrMoreSelected.sync="oneOrMoreSelected"
        @change="handleSelectAll"
        @getSortData="handleGetSortData"
        @showDialog="handleShowDialog"
      ></SortToolBar>
    </div>
    <div flex-box="1" class="preview-content" v-show="showType === 'list'">
      <FileTable
        ref="fileTable"
        :showAll="showAll"
        :fileList="imageList"
        :currentPath="currentPath"
        :checkItem="checkItem"
        :addVuexItem="addImages"
        :removeVuexItem="removeImages"
        :emptyVuexItems="emptyImages"
        :defaultSort="imageConfig.defaultSort"
        @canApply="handleCanApplyChange"
        @sort-change="handleSortChange"
        @addFolder="$emit('addFolder')"
      >
      </FileTable>
    </div>
    <div flex-box="1" class="preview-content" v-show="showType === 'thumbnail'">
      <div class="image-content">
        <Thumbnail
          v-for="item in thumbnailList"
          :key="item.path"
          :file="item"
          :fileList="imageList"
          :addVuexItem="addImages"
          :removeVuexItem="removeImages"
        >
          <template v-slot:default="slotProps">
            <img
              :src="slotProps.src"
              style="object-fit:contain;width:200px;height:170px"
            />
          </template>
        </Thumbnail>
      </div>
    </div>
    <SortFileDialog
      ref="sort_file_dialog"
      :currentPath="currentPath"
      @getSortData="handleGetSortData"
    />
  </div>
</template>

<script>
const { shell } = require('electron');
import { i18nRender } from '@/lang';
import { isDirectory, isExist } from '@/utils/file';
import { isImage } from '@/components/file-tree/lib/util';
import Thumbnail from '@/components/thumbnail/Thumbnail.vue';
import FileTable from '@/components/file-table';
import FilePathInput from '@/components/file-path-input';
import SortToolBar from '@/components/sort-toolbar';
import SortFileDialog from '@/components/sort-file-dialog';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('imageStore');
const { mapGetters: preferenceMapGetters } = createNamespacedHelpers(
  'preferenceStore'
);
export default {
  components: {
    Thumbnail,
    FileTable,
    FilePathInput,
    SortToolBar,
    SortFileDialog
  },
  data() {
    return {
      showType: 'list',
      showAll: false,
      btnDisabled: true,
      thumbnailList: []
    };
  },
  mounted() {
    this.showType = this.defaultFileListShowType;
  },
  computed: {
    ...preferenceMapGetters(['preference']),
    ...mapGetters(['imageList', 'imageFolders', 'imageConfig']),
    ...mapGetters({ currentPathFromVuex: 'currentPath' }),
    defaultFileListShowType() {
      return this.preference.defaultFileListShowType;
    },
    arr() {
      return this.imageList.filter(item => item.startsWith(this.currentPath));
    },
    allSelectd() {
      return this.thumbnailList.every(item => this.arr.indexOf(item.path) >= 0);
    },
    oneOrMoreSelected() {
      return this.thumbnailList.some(item => this.arr.indexOf(item.path) >= 0);
    },
    currentPath: {
      get() {
        return this.currentPathFromVuex;
      },
      set(newFolderPath) {
        if (!newFolderPath) {
          this.setFolderPath('');
        } else {
          this.setFolderPath(newFolderPath);
        }
      }
    }
  },
  methods: {
    ...mapActions([
      'addImages',
      'removeImages',
      'emptyImages',
      'setFolderPath',
      'setImageFolders',
      'setImageConfig'
    ]),
    handleGetSortData(data, callback) {
      callback(this.$refs.fileTable.getSortData());
    },
    handleShowDialog() {
      this.$refs['sort_file_dialog'].show();
    },
    checkItem(item) {
      return item.isFile && isImage(item.path);
    },
    handleSelectAll({ checked }) {
      if (this.allSelectd) {
        this.removeImages(
          this.thumbnailList.filter(item => item.isFile).map(item => item.path)
        );
      } else {
        this.addImages(
          this.thumbnailList.filter(item => item.isFile).map(item => item.path)
        );
      }
    },
    handleSortChange(sortChange) {
      const { order, property: field } = sortChange;
      this.setImageConfig({ defaultSort: { order, field } });
      // 获取新排序下的thunbnail顺序
      this.thumbnailList = this.$refs.fileTable.getSortData();
    },
    handleCanApplyChange(canApply) {
      this.btnDisabled = !canApply;
    },
    addFolder() {
      let folderPath = this.currentPath;
      if (folderPath.length && isExist(folderPath)) {
        if (isDirectory(folderPath)) {
          if (this.imageFolders.includes(folderPath)) {
            this.$message.info('The folder has been added.');
          } else {
            this.setImageFolders([...this.imageFolders, folderPath]);
            this.$nextTick(() => {
              this.$message.success('Folder added successfully');
            });
          }
        } else {
          this.$message.error('Can only add folders');
        }
      } else {
        this.$message.error(i18nRender('general.invalidFolderTip'));
      }
    },
    openFolder() {
      shell.openPath(this.currentPath);
    }
  },
  watch: {
    defaultFileListShowType(newVal) {
      this.showType = newVal;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.preview {
  height: 100%;
  background-color: #f0f3f6;
  padding: 10px;
  padding-bottom: 0px;
  .image-content {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: 10px;
    -ms-grid-column-align: 10px;
    overflow: auto;
  }
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
    overflow: auto;
    background-color: #f0f3f6;
  }
}
</style>
