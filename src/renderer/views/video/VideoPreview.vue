<template>
  <div class="preview" flex="dir:top">
    <div class="toolbar">
      <file-path-input
        ref="filePathInput_ref"
        class="file-path-input"
        flex-box="1"
        :filePath.sync="videoCurrentPath"
        placeholder="Please enter the file path"
      >
      </file-path-input>
      <el-button class="addFolder" type="primary" @click="addFolder">{{
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
    <div class="preview-content" flex-box="1">
      <FileTable
        v-show="showType === 'list'"
        ref="fileTable"
        :showAll="showAll"
        @sort-change="handleSortChange"
        @addFolder="$emit('addFolder')"
        @updateShowFile="updateShowFile"
        :fileList="videoList"
        :currentPath="videoCurrentPath"
        :checkItem="checkItem"
        :addVuexItem="addVideos"
        :removeVuexItem="removeVideos"
      >
      </FileTable>
      <div class="thumbnail-content" v-show="showType === 'thumbnail'">
        <Thumbnail
          v-for="item in thumbnailList"
          :key="item.path"
          :file="item"
          :defaultSort="defaultSort"
          :fileList="videoList"
          :addVuexItem="addVideos"
          :removeVuexItem="removeVideos"
        >
          <template v-slot:default="slotProps">
            <video
              controls
              style="object-fit:contain;width:200px;height:120px"
              :src="slotProps.src"
            ></video>
          </template>
        </Thumbnail>
      </div>
    </div>
  </div>
</template>

<script>
import { isDirectory, isExist } from '@/utils/file';
import { isVideo } from '@/components/file-tree/lib/util';
import SearchInput from '@/components/search-input/SearchInput';
import FileTable from '@/components/file-table';
import Thumbnail from '@/components/thumbnail/Thumbnail.vue';
import FilePathInput from '@/components/filepath-input/FilePathInput.vue';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('videoStore');

export default {
  components: { Thumbnail, SearchInput, FileTable, FilePathInput },
  data() {
    return {
      showType: 'list',
      showAll: false,
      showFile: [],
      defaultSort: {
        prop: 'lastModifyTime',
        order: 'descending'
      }
    };
  },
  computed: {
    ...mapGetters(['videoList', 'videoFolders']),
    ...mapGetters({ currentPathFromVuex: 'currentPath' }),
    videoCurrentPath: {
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
    },
    thumbnailList() {
      const { prop, order } = this.defaultSort;
      const list = this.showFile.filter(this.checkItem);
      if (!order) {
        return list;
      }
      const reverse = order === 'descending' ? -1 : 1;
      let sort = (a, b) => {
        let res;
        if (typeof a[prop] === 'number') {
          res = a[prop] - b[prop];
        } else if (typeof a[prop] === 'string') {
          const aStr = a[prop];
          const bStr = b[prop];
          for (let i = 0; i < aStr.length; i++) {
            const chartA = aStr.charCodeAt(i);
            const chartB = bStr.charCodeAt(i);
            if (chartA > chartB) {
              res = 1;
              break;
            } else if (chartA < chartB) {
              res = -1;
              break;
            }
          }
        }
        return res * reverse;
      };

      list.sort(sort);
      return list;
    }
  },
  methods: {
    ...mapActions([
      'addVideos',
      'removeVideos',
      'emptyVideos',
      'setVideoFolders',
      'setFolderPath'
    ]),
    checkItem(item) {
      return item.isFile && isVideo(item.path);
    },
    handleSortChange({ column, order, prop }) {
      this.defaultSort = {
        order,
        prop
      };
    },
    updateShowFile(newVal) {
      this.showFile = newVal;
    },
    addFolder() {
      let folderPath = this.videoCurrentPath;
      if (folderPath.length && isExist(folderPath)) {
        if (isDirectory(folderPath)) {
          if (this.videoFolders.includes(folderPath)) {
            this.$message.info('The folder has been added.');
          } else {
            this.setVideoFolders([...this.videoFolders, folderPath]);
            this.$nextTick(() => {
              this.$message.success('Successed to add folder');
            });
          }
        } else {
          this.$message.error('Can only add folders');
        }
      } else {
        this.$message.error('File or folder does not exist ');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.preview {
  height: 100%;
  background-color: #f0f3f6;
  padding: 10px;
  .toolbar {
    margin: 5px;
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
