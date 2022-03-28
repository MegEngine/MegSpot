<template>
  <div ref="folder" class="folder">
    <vue-scroll :ops="scrollBarOpts" ref="vuescroll">
      <div class="folder-head" flex="cross:center">
        <el-tooltip
          placement="right"
          effect="light"
          :content="tipReloadAll"
          :open-delay="tipDelay"
          :disabled="isDraging"
          popper-class="folder-tooltip"
        >
          <span
            class="folder-refresh folder-refresh-all"
            flex="cross:center"
            v-if="enableReloadAll"
            @click.stop="onRefreshAllFolder"
          >
            <svg-icon icon-class="reload"></svg-icon>
          </span>
        </el-tooltip>
        <div class="folder-head-search" flex-box="1">
          <search-input
            v-model="searchValue"
            placeholder="filter file name according to input"
          ></search-input>
        </div>
      </div>
      <span class="loading" v-if="showloading"
        ><i class="el-icon-loading"></i>
        {{ $t('image.folder.loadingText') }}
      </span>
      <el-tree
        ref="elTree"
        class="el-tree"
        empty-text=""
        highlight-current
        :load="loadNode"
        lazy
        node-key="path"
        :data="treeData"
        :props="defaultProps"
        :default-expanded-keys="defaultExpand"
        :expand-on-click-node="true"
        :current-node-key="currentKey"
        :filter-node-method="filterNode"
        @node-click="onClick"
        @node-expand="({ path }) => $emit('addExpand', path)"
        @node-collapse="({ path }) => $emit('removeExpand', path)"
      >
        <span
          slot-scope="{ node, data }"
          class="folder-outer"
          flex-box="1"
          @mouseenter="onMousEenter(node, data)"
          @mouseleave="onMouseleave(node, data)"
        >
          <span flex="main:justify cross:center">
            <span class="folder-item-left" flex="cross:center">
              <span class="folder-item-icon" flex-box="1">
                <svg-icon
                  v-if="!data.isLeaf"
                  icon-class="folder-open-fill"
                ></svg-icon>
                <svg-icon v-else icon-class="folder-fill"></svg-icon>
              </span>
              <el-tooltip
                placement="top"
                effect="light"
                :content="data.path"
                :open-delay="tipDelay"
                :disabled="isDraging"
                popper-class="folder-tooltip"
              >
                <span class="folder-item-label">{{
                  truncateName(data.label)
                }}</span>
              </el-tooltip>
            </span>
            <span class="folder-item-right" flex="cross:center">
              <el-tooltip
                placement="bottom"
                effect="light"
                :content="tipReload"
                :open-delay="tipDelay"
                :disabled="isDraging"
                popper-class="folder-tooltip"
              >
                <span
                  class="folder-refresh"
                  flex="cross:center"
                  v-show="enableReload && data.hovering"
                  @click.stop="handleRefresh(node, data)"
                >
                  <svg-icon icon-class="reload"></svg-icon>
                </span>
              </el-tooltip>
              <el-tooltip
                placement="bottom"
                effect="light"
                :content="tipClose"
                :open-delay="tipDelay"
                :disabled="isDraging"
                popper-class="folder-tooltip"
              >
                <span
                  class="folder-close"
                  flex="cross:center"
                  v-show="enableReload && node.level === 1 && data.hovering"
                  @click.stop="onCloseFolder(node, data)"
                >
                  <svg-icon icon-class="close" style="color: red"></svg-icon>
                </span>
              </el-tooltip>
            </span>
          </span>
        </span>
      </el-tree>
    </vue-scroll>
  </div>
</template>

<script>
import SearchInput from '@/components/search-input';
import ContextMenu from '@/components/context-menu';
import { generateFileInfo, listDir } from './lib/file.js';
import { defaultIcon } from './lib/consts.js';
import { DELIMITER, SORTING_FILE_NAME } from '@/constants';
import { throttle } from '@/utils';
import chokidar from 'chokidar';

export default {
  name: 'FileTree',
  components: { SearchInput, ContextMenu },
  data() {
    return {
      scrollBarOpts: {
        scrollPanel: {
          scrollingX: false
        },
        bar: {
          background: '#DFDFDF',
          opacity: 0.8
        }
      },
      // 监听文件夹列表中每个文件夹的变化,变化后自动刷新目录
      watcher: undefined,
      onlyDir: true,
      currentKey: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'label',
        isLeaf: 'leaf'
      },
      tipDelay: 400,
      isDraging: false,
      searchValue: '',
      showloading: false,
      treeOffsetTop: 0
    };
  },
  props: {
    openedFolders: {
      type: Array,
      default: () => []
    },
    defaultExpand: {
      type: Array,
      default: () => []
    },
    includes: {
      type: Array,
      default: () => []
    },
    icons: {
      type: Object,
      default: () => {
        return {
          '.xlsx': { name: 'iconfile-excel-fill', color: '#56B158' },
          '.docx': { name: 'iconfile-word-fill', color: '#0A84F1' },
          '.pptx': { name: 'iconfile-ppt-fill', color: '#F12E0B' },
          '.zip': { name: 'iconfile-zip-fill', color: '#C8C800' },
          '.7z': { name: 'iconfile-zip-fill', color: '#C8C800' },
          '.pdf': { name: 'iconfile-pdf-fill', color: '#EA4DCF' },
          '.png': { name: 'iconfile-image-fill', color: '#E6880E' },
          '.jpg': { name: 'iconfile-image-fill', color: '#E6880E' },
          '.md': { name: 'iconfile-markdown-fill', color: '#844DEA' }
        };
      }
    },
    enableReload: {
      type: Boolean,
      default: true
    },
    enableReloadAll: {
      type: Boolean,
      default: true
    },
    currentPath: String,
    tipClose: {
      type: String,
      default: 'Close Folder'
    },
    tipReload: {
      type: String,
      default: 'Reload Folder'
    },
    tipReloadAll: {
      type: String,
      default: 'Reload All Folders'
    },
    multiSelection: {
      type: Boolean,
      default: true
    },
    multiSelectionBlacklist: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    fileIcons() {
      if (this.icons && Object.keys(this.icons).length > 0) {
        return { ...defaultIcon, ...this.icons };
      } else {
        return defaultIcon;
      }
    },
    sortFilePath() {
      return this.currentPath + DELIMITER + SORTING_FILE_NAME;
    }
  },
  watch: {
    treeData(newVal, oldVal) {
      if (oldVal) {
        this.watcher && this.watcher.close();
      }
      if (newVal) {
        this.watcher = chokidar
          .watch(
            newVal.map(item => item.path),
            {
              // 持续监听
              persistent: true,
              // 忽略初始化的目录检测
              ignoreInitial: true,
              // 等待写入完成
              awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
              }
            }
          )
          .on('all', async (event, path) => {
            if (path !== this.sortFilePath) {
              this.treeData = await this.loadMultiDir(this.openedFolders);
            }
          });
      }
    },
    openedFolders: {
      handler: async function(newVal, oldVal) {
        this.treeData = await this.loadMultiDir(this.openedFolders);
      },
      immediate: true
    },
    currentKey(id) {
      // Tree 内部使用了 Node 类型的对象来包装用户传入的数据，用来保存目前节点的状态。可以用 $refs 获取 Tree 实例
      if (id.toString()) {
        this.$refs.elTree.setCurrentKey(id);
      } else {
        this.$refs.elTree.setCurrentKey(null);
      }
    },
    searchValue(v) {
      if (this.$refs && this.$refs.elTree) {
        this.$refs.elTree.filter(v);
      }
    }
  },
  created() {
    this.dblclick = throttle(200, (...args) => {
      this.$emit('dblclick', ...args);
    });
    this.closeFolder = throttle(200, (...args) => {
      this.$emit('close', ...args);
      this.$emit('removeExpand', args[0].path);
    });
  },
  beforeDestroy() {
    this.dblclick = null;
    this.closeFolder = null;
    this.watcher && this.watcher.close();
    this.watcher = null;
  },
  methods: {
    async loadNode(node, resolve) {
      // 过滤根节点 由于el-tree在不同的地方使用id是逐个增加的 所以不能通过 node.id === 0 判断是否为根
      if (node.data === undefined || node.data.path === undefined) return;
      const nodeData = await listDir(node.data.path, this.fileIcons, {
        include: this.includes,
        onlyDir: this.onlyDir
      });

      // 取消递归第二层目录，直接返回包装过后的一层目录文件信息
      // const result = await this.loadMultiDir(nodeData.children);
      // resolve(result);
      resolve(nodeData.children.map(generateFileInfo));
    },
    async handleRefresh(node, data) {
      node.loaded = false;
      node.expand();
    },
    async loadMultiDir(dirs) {
      const result = [];
      for (let i = 0; i < dirs.length; i++) {
        try {
          const f = dirs[i];
          const res = await listDir(f, this.fileIcons, {
            include: this.includes,
            onlyDir: this.onlyDir
          }).catch(err => {
            throw err;
          });
          // 多目录展开时 避免加载过多 引起错误
          delete res.children;
          result.push(res);
        } catch (e) {
          console.error('读取文件内容异常. path:' + f);
          console.error(e);
        }
      }
      return result;
    },
    onMousEenter(node, data) {
      data.hovering = true;
    },
    onMouseleave(node, data) {
      data.hovering = false;
    },
    onClick(data, node, e) {
      this.treeOffsetTop = e.$el.offsetTop;
      if (!node.checked) {
        this.$emit('select', data);
      }
    },
    onCloseFolder(node, data) {
      this.closeFolder(data);
    },
    async onRefreshAllFolder() {
      this.treeData = await this.loadMultiDir(this.openedFolders);
    },
    truncateName(src) {
      // 使用css方式解决
      return src;
      // return truncateText(src, 32)
    },
    filterNode(value, data) {
      if (!value) return true;
      return (
        data.label.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1
      );
    }
  },
  async mounted() {
    if (this.openedFolders.length) {
      await this.onRefreshAllFolder();
    }
  },
  deactivated() {
    window.sessionStorage.setItem('treeOffsetTop', this.treeOffsetTop);
  },
  activated() {
    this.treeOffsetTop = window.sessionStorage.getItem('treeOffsetTop');
    this.$refs.vuescroll.scrollTo(
      {
        y: this.treeOffsetTop
      },
      0
    );
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.folder {
  padding: 8px 0px;
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  font-size: 13px;
  box-sizing: border-box;
  height: 100%;
  font-family: Helvetica, Arial, 'Microsoft YaHei';

  .folder-head {
    padding: 4px 0;
    .folder-refresh-all {
      margin-left: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
    }
    .folder-head-search {
      box-sizing: border-box;
      margin: 0px 6px;
    }
  }

  .loading {
    margin-left: 20px;
  }

  .el-tree {
    background-color: transparent;
    .folder-outer {
      overflow: hidden;
      cursor: pointer;
      &:hover {
        color: #409eff;
        .svg-icon {
          color: $primaryColor; /*文件夹图标一同变色*/
        }
      }

      .folder-item-left {
        .folder-item-icon {
          margin-right: 4px;
          color: rgba(189, 157, 34, 0.95);
        }
      }

      .folder-item-right {
        .folder-close {
          font-size: 14px;
          font-weight: 600;
          color: #ff0000;
        }
        .folder-item-label {
          outline: 0;
          overflow: hidden;
          word-break: keep-all;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .el-tree-node__content {
    cursor: auto !important;
  }

  .folder-refresh,
  .folder-close {
    padding: 0 4px;
  }

  .folder-refresh {
    font-size: 14px;
    font-weight: 600;
    color: #606266;
  }

  .el-tree-node.is-checked > .el-tree-node__content {
    background-color: #e9eaee !important;
  }

  .folder-tooltip.el-tooltip__popper {
    border-radius: 0px;
    line-height: 1;
    padding: 4px;
  }
}
</style>
