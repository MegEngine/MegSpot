<template>
  <div class="home" flex="dir:top">
    <div class="tool" flex="main:justify cross:center">
      <div class="tool-items">
        <el-button
          @click="addFolder"
          type="primary"
          round
          class="tool-item add-folder"
          title="add folder to root"
          size="mini"
        >
          {{ $t('image.toolbar.addFolder') }}
        </el-button>
        <SelectedBtn :selectedList="videoList" @update="setVideos" @remove="removeVideos" @clearAll="emptyVideos" />
        <el-button
          type="primary"
          round
          class="tool-item"
          :disabled="!videoList.length"
          @click="compare"
          v-on:keyup.meta.enter="compare"
          v-on:keydown.tab="compare"
          :title="`${$t('common.hotKey')}：cmd/ctrl+enter`"
        >
          {{ $t('general.compare') }}
        </el-button>
      </div>
    </div>
    <div class="content" flex-box="1">
      <Split :style="{ height: splitHeight }" :gutterSize="4">
        <SplitArea :size="23" :maxSize="1000" :minSize="200">
          <FileTree
            ref="folderTree"
            id="folderTree"
            :currentPath="currentPath"
            :openedFolders="videoFolders"
            :checkedFiles="checkedFiles"
            @close="onClose"
            @select="onSelect"
            @addFolder="addFolder"
            :defaultExpand="expandData"
            @addExpand="addExpandData"
            @removeExpand="removeExpandData"
          ></FileTree>
        </SplitArea>
        <SplitArea :size="77">
          <VideoPreview ref="videoPreview" @addFolder="addFolder"></VideoPreview>
        </SplitArea>
      </Split>
    </div>
  </div>
</template>
<script>
const { dialog } = require('@electron/remote')
import Vue from 'vue'
import FileTree from '@/components/file-tree/FileTree.vue'
import ShowPath from '@/components/show-path'
import VueSplit from 'vue-split-panel'
import VideoPreview from './VideoPreview'
import { debounce } from '@/utils'
import { createNamespacedHelpers } from 'vuex'
import SelectedBtn from '@/components/selected-btn'
const { mapGetters, mapActions } = createNamespacedHelpers('videoStore')
import addDragFolderListener from '@/utils/dragFolder.js'
import { handleEvent } from '@/tools/hotkey'

Vue.use(VueSplit)
export default {
  name: 'VideoRoot',
  components: { FileTree, VideoPreview, SelectedBtn, ShowPath },
  data() {
    return {
      isDraging: false,
      checkedFiles: [],
      dragFiles: [],
      splitHeight: '200px',
      hotkeyEvents: undefined
    }
  },
  computed: {
    ...mapGetters(['videoList', 'videoFolders', 'expandData', 'currentPath'])
  },
  mounted() {
    this.initHotkeyEvents()
    this.calcSplitHeight()
    window.addEventListener('resize', this.handleResize, true)
    addDragFolderListener(document.getElementById('folderTree'), false)
  },
  activated() {
    window.addEventListener('keydown', this.handleHotKey, true)
  },
  deactivated() {
    window.removeEventListener('keydown', this.handleHotKey, true)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize, true)
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
    handleResize: debounce(300, function () {
      this.calcSplitHeight()
    }),
    initHotkeyEvents() {
      this.hotkeyEvents = new Map([
        [
          'gotoCompare',
          () => {
            this.compare()
          }
        ],
        [
          'emptyAll',
          () => {
            this.emptyVideos()
          }
        ]
      ])
    },
    handleHotKey(event) {
      handleEvent(event, this.hotkeyEvents)
    },
    calcSplitHeight() {
      this.splitHeight = window.document.body.clientHeight - 56 - 40 + 'px'
    },
    compare() {
      this.$router.push('/video/compare')
    },
    addFolder() {
      dialog
        .showOpenDialog({
          title: 'add folder',
          properties: ['openDirectory']
        })
        .then(({ canceled, filePaths }) => {
          if (!filePaths || !(filePaths.length > 0)) {
            this.$message.info('Cancelled to add folder')
          } else if (this.videoFolders.includes(filePaths[0])) {
            this.$message.info('The folder has been added.')
          } else {
            this.setVideoFolders([...this.videoFolders, filePaths[0]])
            this.$nextTick(() => {
              this.$message.success('Successed to add folder')
            })
          }
        })
    },
    onClose(data) {
      const index = this.videoFolders.findIndex((item) => {
        return item === data.path
      })
      if (index >= 0) {
        const temp = [...this.videoFolders]
        temp.splice(index, 1)
        this.setVideoFolders(temp)
      }
      const removeList = []
      this.videoList.forEach((item) => {
        if (item.startsWith(data.path)) {
          removeList.push(item)
        }
      })
      this.removeVideos(removeList)
      this.setFolderPath('')
    },
    onSelect(data) {
      console.log('onSelect', data)
      // 如果选中了文件夹 更新当前激活的文件夹
      if (data.type === 0) {
        this.$nextTick(() => {
          // 等左侧导航树先渲染
          this.setFolderPath(data.path)
        })
      }
    }
  }
}
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
