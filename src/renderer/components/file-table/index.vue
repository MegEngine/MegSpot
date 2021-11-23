<template>
  <vxe-table
    ref="xTable"
    :data="showFile"
    auto-resize
    border
    align="center"
    highlight-hover-row
    highlight-current-row
    :scroll-y="{ gt: 0, rHeight: 40, oSize: 5 }"
    :checkbox-config="{
      trigger: 'cell',
      range: true,
      checkMethod: checkSelectable
    }"
    :tooltip-config="{ enterable: true }"
    class="table"
    header-cell-class-name="width_adaptive"
    :height="tableHeight"
    v-on="$listeners"
    @checkbox-all="selectAll"
    @checkbox-change="select"
    @checkbox-range-end="handleRangeSelect"
    @checkbox-range-change="handleRangingRender"
  >
    <template #empty>
      <span v-if="!currentPath"
        >please
        <el-button type="text" size="small" @click="$emit('addFolder')">
          add folder first
        </el-button>
        and select one.
      </span>
      <span v-else>There is no available files in current directory.</span>
    </template>
    <vxe-column type="checkbox" width="40"></vxe-column>
    <vxe-column
      align="left"
      show-overflow="tooltip"
      field="name"
      title="Name"
      sortable
    >
      <template #header>
        <div flex="cross:center">
          <el-tooltip
            :content="(regexpEnabled ? 'Disable' : 'Enable') + ' Regexp'"
          >
            <vxe-checkbox v-model="regexpEnabled"></vxe-checkbox>
          </el-tooltip>
          <search-input
            v-model="search"
            size="mini"
            placeholder="filter file name according to input"
            autofocus
            clearable
          >
            <span
              v-if="regexpEnabled"
              slot="prepend"
              style="font-size:16px; color: black"
              >/</span
            >
            <span v-if="regexpEnabled" slot="append" style="color: black"
              >/ig</span
            >
          </search-input>
        </div>
      </template>
    </vxe-column>
    <vxe-column
      sortable
      show-overflow
      field="lastModifyTime"
      :title="$t('general.lastModifyTime')"
      :formatter="formatter"
    >
    </vxe-column>
    <vxe-column
      sortable
      show-overflow
      :formatter="formatter"
      :title="$t('general.size')"
      field="size"
    >
    </vxe-column>
  </vxe-table>
</template>

<script>
import dayjs from 'dayjs';
import { throttle, debounce } from '@/utils';
import { formatFileSize } from '@/utils/file';
import SearchInput from '../search-input';
import { isDirectory, readDir, getFileStatSync } from '@/utils/file';
import { DELIMITER } from '@/constants';
import chokidar from 'chokidar';

export default {
  name: 'FileTable',
  components: { SearchInput },
  props: {
    defaultSort: {
      required: true,
      type: Object
    },
    showAll: {
      type: Boolean,
      default: false
    },
    fileList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    currentPath: {
      type: String,
      default: ''
    },
    checkItem: {
      type: Function,
      default: () => {}
    },
    addVuexItem: {
      type: Function,
      default: () => {}
    },
    removeVuexItem: {
      type: Function,
      default: () => {}
    },
    emptyVuexItems: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      tableHeight: 1000,
      searchString: '',
      regexpEnabled: false, // 采用正则表达式方法搜索
      fileInfoList: [],
      origin: -1,
      pin: false, // 按下shift
      // 监听当前文件夹的变化,变化后手动刷新目录
      wacther: undefined
    };
  },
  computed: {
    search: {
      get() {
        return this.searchString;
      },
      set: debounce(100, function(newVal) {
        this.searchString = newVal;
      })
    },
    showFile: function() {
      return this.fileInfoList
        .filter(item => {
          if (this.showAll) {
            return true;
          } else if (!this.showAll && this.checkItem(item)) {
            return true;
          }
          return false;
        })
        .filter(item => {
          let result;
          try {
            result =
              !this.search ||
              (this.regexpEnabled
                ? new RegExp(this.search, 'ig').test(item.name)
                : item.name
                    .toString()
                    .toLowerCase()
                    .indexOf(this.search.toLowerCase()) > -1);
          } catch {
            result =
              item.name
                .toString()
                .toLowerCase()
                .indexOf(this.search.toLowerCase()) > -1;
          }
          return result;
        });
    }
  },
  async mounted() {
    window.addEventListener('resize', throttle(300, this.updateTableHeight));
    window.addEventListener('keydown', code => {
      // 开启多选
      if (code.keyCode === 16 && code.shiftKey) {
        this.pin = true;
      }
    });
    window.addEventListener('keyup', code => {
      // 关闭多选
      if (code.keyCode === 16) {
        this.pin = false;
      }
    });

    this.$nextTick(() => {
      this.updateTableHeight();
    });
  },
  updated() {
    // 打开同步选中
    this.fileList.forEach(path => {
      const item = this.showFile.find(item => item.path === path);
      if (item) {
        this.$refs.xTable.setCheckboxRow(item, true);
      }
    });
  },
  beforeDestroy() {
    this.wacther && this.wacther.close();
    this.wacther = null;
  },
  watch: {
    currentPath: {
      handler: function(newVal, oldVal) {
        if (oldVal) {
          this.wacther.close();
        }
        if (newVal) {
          this.wacther = chokidar
            .watch(newVal, {
              // 持续监听
              persistent: true,
              // 忽略初始化的目录检测（即：认为监听时目录是从空变为当前目录的过程 会触发很多的addDir,add file回调）
              ignoreInitial: true,
              // 等待写入完成
              awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
              }
            })
            .on('all', () => {
              this.refreshFileList();
            });
        }
        this.refreshFileList();
      },
      immediate: true
    },
    fileList(newVal, oldVal) {
      oldVal.forEach(path => {
        // 同步删除
        if (!newVal.includes(path)) {
          const item = this.showFile.find(item => item.path === path);
          if (item) {
            this.$refs.xTable.setCheckboxRow(item, false);
          }
        }
      });
      newVal.forEach(path => {
        // 同步新增
        if (!oldVal.includes(path)) {
          const item = this.showFile.find(item => item.path === path);
          if (item) {
            this.$refs.xTable.setCheckboxRow(item, true);
          }
        }
      });
    }
  },
  methods: {
    checkSelectable({ row }) {
      return this.checkItem(row);
    },
    formatter({ cellValue, column }) {
      let formatVal = cellValue;
      switch (column.property) {
        case 'lastModifyTime':
          formatVal = dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss');
          break;
        case 'size':
          formatVal = formatFileSize(cellValue);
          break;
        case 'duration':
          formatVal = cellValue.toFixed(2) + 's';
          break;
        default:
      }
      return formatVal;
    },
    updateTableHeight() {
      this.tableHeight =
        this.$refs.xTable.$el.parentElement.clientHeight || this.tableHeight;
    },
    // 由于vxe-table 在range选择过程中 会清空已选，所以需要在选择过程中不断更新已选中。
    handleRangingRender() {
      this.fileList.forEach(path => {
        const item = this.showFile.find(item => item.path === path);
        if (item) {
          this.$refs.xTable.setCheckboxRow(item, true);
        }
      });
    },
    handleRangeSelect({ records }) {
      this.addVuexItem(records.map(item => item.path));
    },
    commonSelect(row) {
      const sortData = this.getSortData(); // 获取最终渲染的table数据
      const origin = this.origin; // 起点行
      const currentRowIndex = sortData.indexOf(row); // 当前点击行
      let flag = sortData[origin]
        ? this.fileList.includes(sortData[origin].path)
        : false;
      if (this.pin && flag) {
        // 选中 起点行 -- 到当前点击行
        let minIndex = Math.min(origin, currentRowIndex);
        let maxIndex = Math.max(origin, currentRowIndex);
        this.addVuexItem(
          sortData.slice(minIndex, maxIndex + 1).map(item => item.path)
        );
      } else {
        // 未按住shift 或无起点 只增删该行并初始化起点
        this.origin = sortData.indexOf(row);
        if (this.fileList.includes(row.path)) {
          // 已选 则删
          this.removeVuexItem(row.path);
        } else {
          // 选中
          this.addVuexItem(row.path);
        }
      }
    },
    select({ row }) {
      if (this.checkItem(row)) {
        this.commonSelect(row);
      }
    },
    selectAll({ records: items }) {
      if (items.length) {
        this.addVuexItem(items.map(item => item.path));
      } else {
        this.emptyVuexItems();
      }
    },
    // 可外部直接调用触发逻辑
    async refreshFileList() {
      if (this.currentPath && isDirectory(this.currentPath)) {
        const files = await readDir(this.currentPath).catch(err => {
          throw err;
        });
        this.fileInfoList = files.map(item => {
          const path = this.currentPath + DELIMITER + item;
          const status = getFileStatSync(path);
          return {
            path,
            name: item,
            isFile: status.isFile(),
            lastModifyTime: status.mtime.getTime(),
            size: status.size
          };
        });
      } else {
        this.fileInfoList = [];
      }
      // 重新触发排序
      this.$nextTick(() => {
        this.$refs.xTable
          .sort(this.defaultSort.field, this.defaultSort.order)
          .then(() => {
            // 向父级反馈 最新的顺序
            this.$emit('sort-change', this.$refs.xTable.getSortColumns()[0]);
          });
      });
    },
    // 供外部直接调研获取 通过排序处理后的tableData
    getSortData() {
      return this.$refs.xTable.getTableData().visibleData;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.table {
  width: 100%;
  background-color: #f0f3f6;

  ::v-deep {
    .el-input-group__prepend,
    .el-input-group__append {
      padding: 0;
    }
    .width_adaptive {
      /*表头与单元格统一高度*/
      padding: 0 !important;
      height: 37px !important;
      .vxe-cell {
        display: flex;
        justify-content: center;
      }
    }
    th {
      background-color: #f6f6f6 !important;
    }
  }
}
</style>
