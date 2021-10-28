<template>
  <vxe-table
    ref="table"
    :data="showFile"
    auto-resize
    border
    align="center"
    highlight-hover-row
    highlight-current-row
    :scroll-y="{ gt: 0, rHeight: 40, oSize: 5 }"
    :sort-config="sortConfig"
    :checkbox-config="{ trigger: 'row', checkMethod: checkSelectable }"
    :tooltip-config="{ enterable: true }"
    class="table"
    header-cell-class-name="width_adaptive"
    :height="tableHeight"
    v-on="$listeners"
    @checkbox-all="selectAll"
    @checkbox-change="select"
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
        <search-input
          v-model="search"
          size="mini"
          placeholder="filter file name according to input"
          autofocus
          clearable
        ></search-input>
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
import { throttle } from '@/utils';
import { formatFileSize } from '@/utils/file';
import SearchInput from '../search-input/SearchInput.vue';
import { isDirectory, readDir, getFileStatSync } from '@/utils/file';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters: preMapGetters } = createNamespacedHelpers(
  'preferenceStore'
);
import { DELIMITER } from '@/constants';

export default {
  name: 'FileTable',
  components: { SearchInput },
  props: {
    defaultSort: {
      type: Object,
      default: () => ({
        field: 'lastModifyTime',
        order: 'descending'
      })
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
    }
  },
  data() {
    return {
      tableHeight: 1000,
      search: '',
      fileInfoList: [],
      origin: -1,
      pin: false, // 按下shift
      sortConfig: {
        defaultSort: {
          field: 'lastModifyTime',
          order: 'desc'
        }
      }
    };
  },
  computed: {
    // ...preMapGetters(['preference']),
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
        .filter(
          item =>
            !this.search ||
            item.name.toLowerCase().includes(this.search.toLowerCase())
        );
    }
  },
  mounted() {
    this.$emit('updateShowFile', this.showFile);
    this.$nextTick(() => {
      this.updateTableHeight();
    });
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
  },
  updated() {
    // 打开同步选中
    this.fileList.forEach(path => {
      // 同步删除
      const item = this.showFile.find(item => item.path === path);
      if (item) {
        this.$refs.table.setCheckboxRow(item, true);
      }
    });
  },
  watch: {
    showFile(newVal, oldVal) {
      this.$emit('updateShowFile', newVal);
    },
    async currentPath() {
      await this.refreshFileList();
    },
    fileList(newVal, oldVal) {
      oldVal.forEach(path => {
        // 同步删除
        if (!newVal.includes(path)) {
          const item = this.showFile.find(item => item.path === path);
          if (item) {
            this.$refs.table.setCheckboxRow(item, false);
          }
        }
      });
      newVal.forEach(path => {
        // 同步新增
        if (!oldVal.includes(path)) {
          const item = this.showFile.find(item => item.path === path);
          if (item) {
            this.$refs.table.setCheckboxRow(item, true);
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
        this.$refs.table.$el.parentElement.clientHeight || this.tableHeight;
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
        for (let i = 0; i < sortData.length; i++) {
          if (i >= minIndex && i <= maxIndex) {
            this.addVuexItem(sortData[i].path);
          }
        }
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
        this.removeVuexItem(this.showFile.map(item => item.path));
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
    },
    // 供外部直接调研获取 通过排序处理后的tableData
    getSortData() {
      return this.$refs.table.tableData;
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
