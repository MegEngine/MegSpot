<template>
  <el-dialog
    id="dialog"
    width="80%"
    :visible.sync="visible"
    title="Edit Sorting File"
    :before-close="clear"
  >
    <div class="toolbar" flex="dir:right">
      <el-button type="primary" class="right-btn" @click="saveSortFile"
        >设为默认排序文件</el-button
      >
      <el-button type="warning" @click="showTableFileList"
        >显示当前表格排序列表</el-button
      >
    </div>
    <div class="file-list">
      <vue-scroll>
        <draggable
          class="list-group"
          tag="ul"
          v-model="sortList"
          v-bind="dragOptions"
          @start="
            drag = true;
            changed = true;
          "
          @end="drag = false"
        >
          <transition-group
            type="transition"
            :name="!drag ? 'flip-list' : null"
          >
            <li
              class="list-group-item"
              v-for="element in sortList"
              :key="element"
              :style="{ textAlign: textAlign }"
            >
              <el-button>{{ element }}</el-button>
            </li>
          </transition-group>
        </draggable>
      </vue-scroll>
    </div>
  </el-dialog>
</template>

<script>
import fse from 'fs-extra';
import getFileName from '@/filter/get-file-name';
import draggable from 'vuedraggable';
import { EOF, DELIMITER, SORTING_FILE_NAME } from '@/constants';

export default {
  name: 'FileListDialog',
  components: { draggable },
  props: {
    currentPath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      sortList: [],
      fileList: [],
      changed: false,
      drag: false,
      textAlign: 'left'
    };
  },
  async mounted() {
    this.$bus.$on('showFileListDialog', () => {
      this.visible = true;
    });
    this.sortList = await this.getSortList();
  },
  methods: {
    handleFileChange(data) {
      if (this.changed) {
        this.$confirm('排序文件已更改，是否显示更改后的排序列表', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          'append-to-body': true
        }).then(() => {
          this.sortList = data;
          this.changed = false;
        });
      } else {
        this.sortList = data;
        this.changed = false;
      }
    },
    async saveSortFile(checked = false) {
      const path = this.sortFilePath;
      let exstis = await fse.pathExists(path);
      if (checked && exstis) {
        this.$confirm('排序文件已存在，是否覆盖', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          'append-to-body': true
        })
          .then(() => {
            fse.outputFile(path, this.sortList.join(EOF)).then(() => {
              this.$message.success('保存成功');
              this.changed = false;
            });
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消覆盖'
            });
          });
      } else {
        fse.outputFile(path, this.sortList.join(EOF)).then(() => {
          this.$message.success('保存成功');
          this.changed = false;
        });
      }
    },
    async getSortList() {
      const path = this.sortFilePath;
      const exist = await fse.pathExists(path);
      if (exist) {
        const data = await fse.readFile(path, 'utf8');
        const sortList = data.split(EOF);
        return sortList;
      } else return [];
    },
    async showTableFileList() {
      this.$emit('getSortData', null, data => {
        const sortList = data.map(item => getFileName(item.path, false));
        this.sortList = sortList;
        this.changed = false;
      });
    },
    // 外部直接调用
    show(config = {}) {
      this.visible = true;
      this.changed = false;
    },
    clear(done) {
      this.visible = false;
      if (this.changed) {
        this.$confirm('是否保存排序文件', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          'append-to-body': true
        }).then(() => {
          this.saveSortFile();
        });
      }
      this.changed = false;
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      };
    },
    sortFilePath() {
      return this.currentPath + DELIMITER + SORTING_FILE_NAME;
    }
  },
  watch: {}
};
</script>

<style lang="scss" scoped>
#dialog {
  .toolbar {
    .right-btn {
      margin-left: 10px;
    }
  }
  .file-list {
    li {
      list-style-type: none;
    }
    .flip-list-move {
      transition: transform 0.5s;
    }
    .no-move {
      transition: transform 0s;
    }
    .ghost {
      opacity: 0.5;
      background: #c8ebfb;
    }
    .list-group {
      min-height: 20px;
    }
    .list-group-item {
      cursor: move;
    }
    .list-group-item i {
      cursor: pointer;
    }
  }
}
</style>
