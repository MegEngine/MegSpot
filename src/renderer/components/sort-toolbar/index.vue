<template>
  <div class="sort-toolbar-container">
    <el-tooltip
      :content="$t(this.allSelectd ? 'general.clearAll' : 'general.selectAll')"
      :open-delay="300"
    >
      <vxe-checkbox
        :value="allSelectd"
        :indeterminate="oneOrMoreSelected"
        @change="handleSelectAll"
      ></vxe-checkbox>
    </el-tooltip>
    <el-button
      v-show="generateVisible"
      v-tip="'Generate Sorting File'"
      @click="generateSortFile"
    >
      <!-- 生成排序文件 -->
      Generate
    </el-button>
    <el-button
      v-show="!generateVisible"
      v-tip="'Apply Sorting File'"
      @click="applySortFile"
    >
      <!-- 应用排序文件 -->
      Apply
    </el-button>
    <el-button
      v-show="!generateVisible"
      v-tip="'Edit Sorting File'"
      @click="editSortFile"
    >
      <!-- 编辑排序文件 -->
      Edit
    </el-button>
  </div>
</template>

<script>
import fse from 'fs-extra';
const { dialog } = require('electron').remote;
import { DELIMITER, SORTING_FILE_NAME } from '@/constants';
import chokidar from 'chokidar';

export default {
  props: {
    currentPath: String,
    allSelectd: {
      type: Boolean,
      default: false
    },
    oneOrMoreSelected: {
      type: Boolean,
      default: false,
      // 监听当前文件夹下排序文件的变化, 变化后改变按钮状态
      wacther: undefined
    }
  },
  data() {
    return {
      fse: null,
      generateVisible: false
    };
  },
  created() {
    this.fse = fse;
  },
  mounted() {
    console.log('fse', this.fse, this.fse.version);
  },
  beforeDestroy() {
    this.wacther && this.wacther.close();
    this.wacther = null;
  },
  methods: {
    handleSelectAll(...rest) {
      this.$emit('change', ...rest);
    },
    saveFile(file) {
      dialog
        .showOpenDialog({
          title: 'select folder',
          defaultPath: this.currentPath,
          filters: [{ name: 'Custom File Type', extensions: ['gif'] }]
        })
        .then(result => {
          fse.writeFileSync(result.filePath, dataBuffer);
          this.$message.success('success');
        });
    },
    getSortData() {
      console.log('emit');
      this.$emit('getSortData', {}, this.generateSortFile);
    },
    applySortFile() {},
    editSortFile() {},
    async generateSortFile(file = '', event) {
      const path = this.sortFilePath;
      let exstis = await fse.pathExists(path);
      if (exstis) {
        this.$confirm('排序文件已存在，是否覆盖', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消覆盖'
          });
        });
      }
      try {
        await fse.outputFile(path, file);
        this.$message({
          type: 'success',
          message: `The sorting file is successfully generated !<br /> and its path is <a style="color: blue;">${path}</a>`,
          dangerouslyUseHTMLString: true
        });
        this.generateVisible = false;
        const data = await fse.readFile(path, 'utf8');

        console.log(data);
      } catch (err) {
        console.error(err);
      }
    },
    async confirmBtnVisible() {
      const exists = await fse.pathExists(this.sortFilePath);
      this.generateVisible = !exists;
    }
  },
  computed: {
    sortFilePath() {
      return this.currentPath + DELIMITER + SORTING_FILE_NAME;
    }
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
            .on('all', async (event, path) => {
              console.log(event, path, this.sortFilePath);
              if (path === this.sortFilePath) {
                this.confirmBtnVisible();
              }
            });
          this.confirmBtnVisible();
        }
      },
      immediate: true
    }
  }
};
</script>

<style lang="scss" scoped>
.sort-toolbar-container {
  margin: 5px 0;
}
</style>
