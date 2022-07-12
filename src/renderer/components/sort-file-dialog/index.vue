<template>
  <el-dialog
    id="dialog"
    width="80%"
    :visible.sync="visible"
    :before-close="clear"
  >
    <span slot="title">{{
      $t('sortFile.edit') + $t('sortFile.sortFile')
    }}</span>
    <div class="toolbar" flex="dir:right">
      <el-button type="warning" @click="showTableFileList" class="item">{{
        $t('sortFile.useTableFileList')
      }}</el-button>
      <el-tooltip>
        <template #content>
          {{ $t('sortFile.defaultSortTip') }}
        </template>
        <el-button type="success" @click="defaultSort" class="item">{{
          $t('sortFile.useDefaultSort')
        }}</el-button>
      </el-tooltip>

      <el-button type="info" @click="clearAll" class="item">{{
        $t('sortFile.clearSortList')
      }}</el-button>
    </div>
    <div class="file-list">
      <vue-scroll :ops="scrollBarOpts" ref="vuescroll">
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
import { arraySortByName } from '@/utils/file';
import draggable from 'vuedraggable';
import { EOF, DELIMITER, SORTING_FILE_NAME } from '@/constants';

export default {
  name: 'SortFileDialog',
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
      checked: false, // 关闭dialog是否询问保存
      textAlign: 'left',
      scrollBarOpts: {
        scrollPanel: {
          scrollingX: false
        },
        bar: {
          keepShow: true
        }
      },
      dragOptions: {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      }
    };
  },
  async mounted() {
    this.$bus.$on('showSortFileDialog', () => {
      this.visible = true;
    });
    this.$bus.$on('fileChanged', this.handleFileChange);
    this.$bus.$on('changeFile', this.changeFile);
    this.sortList = await this.getSortList();
  },
  beforeDestroy() {
    this.$bus.$off('showSortFileDialog');
    this.$bus.$off('fileChanged', this.handleFileChange);
    this.$bus.$off('changeFile', this.changeFile);
  },
  methods: {
    defaultSort() {
      this.$emit('getSortData', null, data => {
        if (this.sortList.length === 0) {
          const sortList = data
            .map(item => getFileName(item.path, false))
            .sort(arraySortByName);
          this.sortList = sortList;
        } else {
          this.sortList.sort(arraySortByName);
        }
        this.changed = true;
      });
    },
    clearAll() {
      this.$confirm(
        '是否确认清除排序文件内容(仅影响排序效果，不影响其他文件)',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          'append-to-body': true
        }
      ).then(() => {
        this.sortList = [];
        const path = this.sortFilePath;
        fse.outputFile(path, undefined).then(() => {
          this.$message.success('清除成功');
          this.changed = true;
        });
      });
    },
    async changeFile({ fileName, newFileName }) {
      const index = this.sortList.findIndex(item => item === fileName);
      if (index > -1) {
        if (newFileName != undefined) {
          this.sortList.splice(index, 1, newFileName);
        } else {
          this.sortList.splice(index, 1);
        }
        await fse
          .outputFile(this.sortFilePath, this.sortList.join(EOF))
          .then(async () => {
            await this.$parent.$refs.fileTable.refreshFileList();
          });
      }
    },
    async handleFileChange(init = true) {
      let data = [...this.sortList];
      if (init) {
        const exists = await fse.pathExists(this.sortFilePath);
        if (exists) {
          data = (await fse.readFile(this.sortFilePath, 'utf8')).split(EOF);
        }
      }
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
      let exist = await fse.pathExists(path);
      if (checked && exist) {
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
        this.changed = true;
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
        if (this.checked) {
          this.$confirm('是否保存排序文件', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            'append-to-body': true
          }).then(() => {
            this.saveSortFile();
          });
        } else {
          this.saveSortFile();
        }
      }
      this.changed = false;
    }
  },
  computed: {
    sortFilePath() {
      return this.currentPath + DELIMITER + SORTING_FILE_NAME;
    }
  },
  watch: {}
};
</script>

<style lang="scss" scoped>
#dialog {
  // margin-top: 9vh !important;
  // margin-bottom: 8vh !important;
  height: 100%;
  overflow: hidden;
  .toolbar {
    // .right-btn {
    //   margin-right: 10px;
    // }
    .item {
      margin-left: 10px;
    }
  }
  .file-list {
    margin: 20px 0;
    height: 70vh;
    overflow: auto;
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
