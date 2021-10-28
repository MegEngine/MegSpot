<template>
  <div class="home" flex="dir:top">
    <div class="tool" flex="main:justify cross:center">
      <div class="tool-items">
        <el-button
          @click="addFolder"
          type="text"
          class="tool-item add-folder"
          title="add folder to root"
          size="small"
        >
          {{ $t('image.toolbar.addFolder') }}
        </el-button>
        <el-badge :value="videoList.length" class="tool-item">
          <Gallery
            :sortData="videoList"
            @update="setVideos"
            @remove="removeVideos"
          >
            <template v-slot:headButton>
              <el-button
                type="text"
                size="mini"
                :disabled="!videoList.length"
                v-tip.bottom="
                  'cmd/ctrl+f show/hide selected file gallery. Click masking can hide gallery too.'
                "
              >
                {{ $t('general.selected') }}
              </el-button>
            </template>
            <template v-slot:dragItem="item">
              <video :src="item.src" controls />
            </template>
          </Gallery>
        </el-badge>
        <el-button
          type="text"
          size="mini"
          icon="el-icon-circle-close"
          title="unselected all"
          style="margin-right:10px"
          :disabled="!videoList.length"
          @click="emptyVideos"
        />
          <el-button
            type="text"
            size="small"
            class="tool-item"
            :disabled="!videoList.length"
            @click="compare"
            v-on:keyup.meta.enter="compare"
            v-on:keydown.tab="compare"
            v-tip="`${$t('common.hotKey')}：cmd/ctrl+enter`"
          >
            {{ $t('general.compare') }}
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <div class="content" flex-box="1">
      <Split :style="{ height: splitHeight }" :gutterSize="4">
        <SplitArea :size="23" :maxSize="1000" :minSize="200">
          <FileTree
            ref="folderTree"
            id="folderTree"
            :openedFolders="videoFolders"
            :checkedFiles="checkedFiles"
            @close="onClose"
            @select="onSelect"
            @addFolder="addFolder"
            :defaultExpand="expandData"
            :defaultCurrentPath="videoCurrentPath"
            @refresh="refresh"
            @addExpand="addExpandData"
            @removeExpand="removeExpandData"
          >
          </FileTree>
        </SplitArea>
        <SplitArea :size="77">
          <VideoPreview
            ref="videoPreview"
            @addFolder="addFolder"
          ></VideoPreview>
        </SplitArea>
      </Split>
    </div>
  </div>
</template>
<script>
const { dialog } = require('electron').remote;
import Vue from 'vue';
import FileTree from '@/components/file-tree/FileTree.vue';
import ShowPath from '@/components/show-path';
import VueSplit from 'vue-split-panel';
import VideoPreview from './VideoPreview';
import { throttle } from '@/utils';
import { createNamespacedHelpers } from 'vuex';
import Gallery from '@/components/gallery';
const { mapGetters, mapActions } = createNamespacedHelpers('videoStore');
import addDragFolderListener from '@/utils/dragFolder.js';

Vue.use(VueSplit);
export default {
  name: 'VideoRoot',
  components: { FileTree, VideoPreview, Gallery, ShowPath },
  data() {
    return {
      isDraging: false,
      checkedFiles: [],
      dragFiles: [],
      splitHeight: '200px'
    };
  },
  computed: {
    ...mapGetters(['videoList', 'videoFolders', 'expandData']),
    ...mapGetters({ currentPathFromVuex: 'currentPath' }),
    videoCurrentPath: {
      get() {
        return this.currentPathFromVuex;
      },
      set(newFolderPath) {
        this.setFolderPath(newFolderPath);
      }
    }
  },
  mounted() {
    this.calcSplitHeight();
    window.addEventListener('resize', this.handleResize, true);
    addDragFolderListener(document.getElementById('folderTree'), false)
    if (!this.videoFolders || this.videoFolders.length === 0) {
      this.addFolder();
    }
  },
  activated() {
    window.addEventListener('keydown', this.handleHotKey, true);
  },
  deactivated() {
    window.removeEventListener('keydown', this.handleHotKey, true);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize, true);
  },
  methods: {
    ...mapActions([
      'removeVideos',
      'emptyVideos',
      'setVideoFolders',
      'setVideos',
      'setFolderPath',
      'addExpandData',
      'removeExpandData'
    ]),
    handleResize: throttle(50, function() {
      this.calcSplitHeight();
    }),
    handleHotKey(event) {
      // cmd+enter
      if ((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
        this.compare();
      }
    },
    calcSplitHeight() {
      this.splitHeight = window.document.body.clientHeight - 56 - 40 + 'px';
    },
    compare() {
      this.$router.push('/video/compare');
    },
    addFolder() {
      dialog
        .showOpenDialog({
          title: 'add folder',
          properties: ['openDirectory']
        })
        .then(({ canceled, filePaths }) => {
          if (!filePaths || !(filePaths.length > 0)) {
            this.$message.info('Cancelled to add folder');
          } else if (this.videoFolders.includes(filePaths[0])) {
            this.$message.info('The folder has been added.');
          } else {
            this.setVideoFolders([...this.videoFolders, filePaths[0]]);
            this.$nextTick(() => {
              this.$message.success('Successed to add folder');
            });
          }
        });
    },
    onClose(data) {
      const index = this.videoFolders.findIndex(item => {
        return item === data.path;
      });
      if (index >= 0) {
        const temp = [...this.videoFolders];
        temp.splice(index, 1);
        this.setVideoFolders(temp);
      }
      const removeList = [];
      this.videoList.forEach(item => {
        if (item.startsWith(data.path)) {
          removeList.push(item);
        }
      });
      this.removeVideos(removeList);
      this.videoCurrentPath = '';
    },
    onSelect(data) {
      console.log('onSelect', data);
      // 如果选中了文件夹 更新当前激活的文件夹
      if (data.type === 0) {
        this.$nextTick(() => {
          // 等左侧导航树先渲染
          this.videoCurrentPath = data.path;
        });
      }
    },
    refresh() {
      this.$refs.videoPreview.$refs.fileTable.refreshFileList()
    }
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';
.home {
  color: $labelColor;
  height: 100%;
  width: 100%;
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
  position: relative;
  .tool {
    padding: 0 10px;
    border-bottom: 1px solid #eee;
    .tool-item + .tool-item {
      margin-left: 10px;
    }
  }

  .content {
    overflow: auto;
  }
}
</style>
