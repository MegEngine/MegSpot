<template>
  <el-dialog ref="aboutDialog" :visible.sync="visible" title="Preference" center width="80%">
    <div ref="container" style="height: 100%">
      <el-tabs v-model="activeTab" tab-position="left" stretch style="height:600px">
        <el-tab-pane name="introduction" label="introduction">
          <div style="text-align:left">
            <div class="introduction">
              {{ $t('common.desc') }}
            </div>
            <div class="handbook" flex="main:left cross:center">
              <span class="link" @click="clickManual">{{
                  $t('common.manual')
              }}</span>
            </div>
            <img src="../../assets/images/group-qrcode.png" alt style="width: 300px" />
          </div>
        </el-tab-pane>
        <el-tab-pane name="settings" label="settings">
          <el-form label-position="right">
            <el-form-item :label="$t('general.language')">
              <el-select v-model="appLanguage">
                <el-option v-for="item in langOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('general.defaultFileListShowType')">
              <el-select v-model="defaultFileListShowType">
                <el-option :label="$t('general.list')" value="list">
                </el-option>
                <el-option :label="$t('general.thumbnail')" value="thumbnail">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="'导入/导出配置'">
              <el-button @click="settingsImport" type="primary">{{
                  $t('general.import')
              }}</el-button>
              <el-button @click="settingsExport" type="primary">{{
                  $t('general.export')
              }}</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane name="version" label="version">
          <el-row class="row-style">
            <el-col :span="5">
              version
            </el-col>
            <el-col :span="15">
              {{ appVersion }}
            </el-col>
          </el-row>
          <el-row class="row-style">
            <el-col :span="5">
              releaseDate
            </el-col>
            <el-col :span="15">
              {{ releaseDate }}
            </el-col>
          </el-row>
          <el-row class="row-style">
            <el-col :span="5">
              releaseNotes
            </el-col>
            <el-col :span="17" style="white-space: break-spaces;">{{
                releaseNotes
            }}</el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane name="hotkey" label="hotkey">
          <vxe-table ref="xTable" :data="hotkeys" :edit-config="{ trigger: 'manual', mode: 'row' }" :expand-config="{
            accordion: true,
            visibleMethod: expandVisibleMethod
          }" :height="maxHeight" :loading="loading" class="hotkey-table-scrollbar" keep-source>
            <!-- <vxe-column field="name" title="Name">
              <template #default="{row}">
                <span>{{ row.name }}</span>
              </template>
            </vxe-column> -->
            <vxe-column type="expand" width="80">
              <template #content="{ row, rowIndex }">
                <el-card v-for="(_, index) in temporaryKeysArrProxy" :key="index" flex="cross:center"
                  style="width: 100%">
                  <div flex="cross:center">
                    <el-input :id="generateRowId(rowIndex, index)" :disabled="activeRowId !== generateRowId(rowIndex)"
                      v-model="temporaryKeysArrProxy[index]">
                    </el-input>
                    <el-tooltip :content="$t('gallery.clear')" placement="top">
                      <el-button icon="el-icon-close" circle @click="
                        clearKeys(index, generateRowId(rowIndex, index))
                      " style="margin-left: 10px"></el-button>
                      <!-- TODO:检测重复；支持单独重置 -->
                      <!-- <span v-if="
                        [...temporaryKeysArr[index]].sort().toString() !==
                        getOriginStr(row, index) &&
                        hotkeyStrArr.includes(
                          [...temporaryKeysArr[index]].sort().toString()
                        )
                      ">已存在相同快捷键</span> -->
                    </el-tooltip>
                  </div>
                </el-card>
              </template>
            </vxe-column>
            <vxe-column :title="$t('hotkey.desc')" field="desc" align="left">
              <template #default="{ row }">
                {{ $t(`hotkey.${row.name}`) || row.desc }}
              </template>
            </vxe-column>
            <vxe-column :title="$t('hotkey.key')" field="keysArr" width="250">
              <template #default="{ row }">
                <div v-for="(keys, index) in row.keysArr" :key="index" flex="cross:center" style="width: 100%">
                  <span v-for="(key, _index) in keys" :key="_index">
                    <kbd class="hotkey">{{ getLabel(key) }}</kbd><span
                      v-if="_index < keys.length - 1">&nbsp;+&nbsp;</span>
                  </span>
                </div>
              </template>
            </vxe-column>
            <vxe-column title="操作" width="180">
              <template #header>
                <span>{{ $t('generateGIF.operation') }}</span>
                <el-button type="danger" @click="ResetHotkeys" style="margin-left: 8px;">{{ $t('common.reset') }}
                </el-button>
              </template>
              <template #default="{ row, rowIndex }">
                <template v-if="activeRowId === generateRowId(rowIndex)">
                  <vxe-button @click="handleSaveHotkey(row)">{{ $t('common.save') }}</vxe-button>
                  <vxe-button @click="handleCancelSaveHotkey(row)">{{ $t('common.cancel') }}</vxe-button>
                </template>
                <template v-else>
                  <vxe-button @click="handleEditHotkey(row, rowIndex)">{{ $t('common.edit') }}</vxe-button>
                </template>
              </template>
            </vxe-column>
          </vxe-table>
        </el-tab-pane>
        <el-tab-pane name="log" label="log">
          <el-row>
            <el-col :span="3" style="line-height:32px">
              log path
            </el-col>
            <el-col :span="21">
              <ShowPath :path="logPath"> </ShowPath>
            </el-col>
          </el-row>
          <el-row class="log-container" style="flex-grow:1;overflow:auto">
            <el-col :span="3" style="line-height:32px">
              log txt
            </el-col>
            <el-col :span="21">
              <span style=" white-space: break-spaces;">{{ logTxt }}</span>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script>
const { dialog } = require('electron').remote;
const { shell, ipcRenderer } = require('electron');
import fse from 'fs-extra';
import _ from 'lodash';
import ShowPath from '@/components/show-path';
const appVersion = require('@/../../package.json').version;
const {
  releaseNotes,
  releaseDate
} = require('@/../../package.json').build.releaseInfo;
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('preferenceStore');
import { i18nRender } from '@/lang';
import {
  ATTRS_KEYS,
  SPECIAL_KEYS,
  PRESET_KEYS_MAP,
  DEFAULT_HOTKEYS
} from '@/tools/hotkey';

export default {
  name: 'AboutDialog',
  components: { ShowPath },
  data() {
    return {
      activeTab: 'introduction',
      activeRowId: '',
      temporaryKeysEleMap: new Map(),
      temporaryKeysArr: [],
      temporaryKeysArrProxy: {},
      visible: false,
      loading: false,
      logPath: '',
      appVersion,
      releaseNotes,
      releaseDate,
      maxHeight: '0',
      logTxt: '',
      langOptions: [
        {
          label: '中文',
          value: 'zh'
        },
        {
          label: 'English',
          value: 'en'
        },
        {
          label: '日本語',
          value: 'ja'
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['preference']),
    hotkeys: {
      get() {
        return [...this.preference.hotkeys].sort((a, b) => a.index - b.index);
      },
      set(arg) {
        this.setPreference({
          hotkeys: arg
        });
      }
    },
    hotkeyStrArr() {
      return this.preference.hotkeys
        .map(keyConf =>
          keyConf.keysArr.map(keys => [...keys].sort().toString())
        )
        .flat(2);
    },
    appLanguage: {
      get() {
        return this.preference.appLanguage;
      },
      set(arg) {
        this.setPreference({
          appLanguage: arg
        });
      }
    },
    defaultFileListShowType: {
      get() {
        return this.preference.defaultFileListShowType;
      },
      set(arg) {
        this.setPreference({
          defaultFileListShowType: arg
        });
      }
    }
  },
  watch: {
    appLanguage: {
      handler: function () {
        this.$i18n.locale = this.appLanguage;
      },
      immediate: true
    },
    activeTab: {
      handler: function () {
        if (this.activeTab === 'hotkey') {
          this.$nextTick(() => {
            this.maxHeight = this.$refs.container.offsetHeight;
          });
        }
      }
    }
  },
  mounted() {
    ipcRenderer.on('aboutDialog', event => {
      this.visible = !this.visible;
      ipcRenderer.send(this.visible ? 'put-in-tray' : 'tray-removed');
    });
    this.logPath = this.$log.transports.file.getFile().path;
    try {
      const logs = this.$log.transports.file.readAllLogs();
      const lastLog = logs[0]?.lines.slice(-100);
      lastLog.forEach(logLine => {
        this.logTxt += logLine + '\r\n';
      });
    } catch (e) {
      console.error('get log txt error', e.messages);
    }
    // check hotkeys
    if (this.hotkeys.length === 0) {
      this.hotkeys = JSON.parse(JSON.stringify(DEFAULT_HOTKEYS));
    }
  },
  methods: {
    ...mapActions(['setPreference', 'setHotkey']),
    getLabel(key) {
      return PRESET_KEYS_MAP.has(key) ? PRESET_KEYS_MAP.get(key).label : key;
    },
    show() {
      this.visible = true;
    },
    clickManual() {
      shell.openExternal('https://github.com/MegEngine/MegSpot/wiki');
    },
    settingsImport() {
      dialog
        .showOpenDialog({
          title: 'import settings',
          filters: [
            {
              name: 'json',
              extensions: ['json']
            }
          ]
        })
        .then(async ({ canceled, filePaths }) => {
          if (canceled) {
            this.$message.info(i18nRender('general.canceled'));
            return;
          }
          if (filePaths && filePaths.length) {
            const filePath = filePaths[0];
            try {
              await fse.readJson(filePath).then(json => {
                this.$store.replaceState(json);
              });
              this.$message.success(
                i18nRender('general.import') +
                ' ' +
                i18nRender('general.success')
              );
            } catch (err) {
              console.error(err);
              this.$message.error(err);
            }
          }
        });
    },
    settingsExport() {
      const obj = _.cloneDeep(this.$store.state);
      this.saveFile(obj);
    },
    generateRowId(rowIndex, index = '') {
      return `hotkey-${rowIndex}-${index}`;
    },
    getOriginStr(row, index) {
      return [
        ...this.hotkeys.find(keyConf => keyConf.name === row.name).keysArr[
        index
        ]
      ]
        .sort()
        .toString();
    },
    expandVisibleMethod({ rowIndex }) {
      return this.activeRowId === this.generateRowId(rowIndex);
    },
    closeRow(row) {
      this.activeRowId = '';
      this.$refs.xTable.clearActived();
      row && this.$refs.xTable.setRowExpand(row, false);
    },
    ResetHotkeys() {
      this.closeRow();
      this.$confirm('是否重置快捷键配置为默认配置', '重置快捷键', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        'append-to-body': true
      }).then(() => {
        this.hotkeys = DEFAULT_HOTKEYS;
      });
    },
    clearKeys(index, id) {
      this.temporaryKeysArr[index] = [];
      this.temporaryKeysEleMap.get(id).value = '';
    },
    handleKeydown(event) {
      if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }
      const { index } = this.parseRowId(event.target.id);
      const attrsKeys = ATTRS_KEYS.map(item => item.name);
      const specialKeys = SPECIAL_KEYS.map(item => item.key);
      // 转换ctrlKey、altKey等按键信号
      const attrsKeyIndex = attrsKeys.findIndex(key => event[key]);
      const isCommon = key =>
        (key.length === 1 && /\w/.test(key)) || !specialKeys.includes(key);
      let eventKey = event.key;
      if (attrsKeyIndex > -1 && !isCommon(eventKey)) {
        eventKey = ATTRS_KEYS.find(
          keyConf => keyConf.name === attrsKeys[attrsKeyIndex]
        ).key;
      }
      // 已出现则不响应
      if (this.temporaryKeysArr[index].includes(eventKey)) {
        event.preventDefault();
        return;
      }
      // 最多出现一个常规字符，否则覆盖已有
      const hasCommonKey = this.temporaryKeysArr[index].some(isCommon);
      if (hasCommonKey) {
        this.temporaryKeysArr[index] = [];
      }
      const keys = [eventKey];
      this.temporaryKeysArr[index].push(eventKey);
      if (attrsKeyIndex > 0 && !specialKeys.includes(event.key)) {
        this.temporaryKeysArr[index].push(event.key);
      }
      event.target.value = this.temporaryKeysArrProxy[index];
      event.preventDefault();
    },
    parseRowId(rowId) {
      return /^hotkey-(?<rowIndex>\d+)-(?<index>\d+)$/.exec(rowId).groups;
    },
    handleEditHotkey(row, rowIndex) {
      this.temporaryKeysArr = JSON.parse(JSON.stringify(row.keysArr));
      this.temporaryKeysArrProxy = new Proxy(this.temporaryKeysArr, {
        get: (target, key) => {
          if (!isNaN(key) && target[key].map) {
            return target[key].map(key => this.getLabel(key)).join('+');
          }
          return target[key];
        },
        set: (target, key, value) => {
          // console.log('set', target, key, value);
          target[key] = value;
          return true;
        }
      });
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.temporaryKeysEleMap.clear();
          for (let i = 0; i < row.keysArr.length; i++) {
            const id = this.generateRowId(rowIndex, i);
            const ele = document.getElementById(id);
            this.temporaryKeysEleMap.set(id, ele);
            ele && ele.addEventListener('keydown', this.handleKeydown, true);
          }
        });
      });
      this.$refs.xTable.setActiveRow(row);
      this.$refs.xTable.setRowExpand(row, true);
      this.activeRowId = this.generateRowId(rowIndex);
    },
    handleSaveHotkey(row) {
      this.closeRow(row);
      const { name, keysArr } = row;
      const temporaryKeysArr = JSON.parse(
        JSON.stringify(this.temporaryKeysArr)
      );
      const temporaryKeysStr = temporaryKeysArr.sort().toString();
      if (
        JSON.parse(JSON.stringify(keysArr))
          .sort()
          .toString() === temporaryKeysStr
      ) {
        this.$message.info('无更改');
      } else {
        if (
          temporaryKeysArr.some(keys =>
            this.hotkeyStrArr.includes([...keys].sort().toString())
          )
        ) {
          this.$message.info('已存在相同快捷键');
          return;
        }
        if (
          temporaryKeysArr.some(keys =>
            keys.length === 0)
        ) {
          this.$message.info('快捷键不可为空');
          return;
        }
        this.hotkeys = JSON.parse(
          JSON.stringify([
            ...this.hotkeys.filter(keyConf => keyConf.name !== name),
            Object.assign({}, row, {
              keysArr: temporaryKeysArr
            })
          ])
        );
        //  this.setHotkey({ name, keysArr: temporaryKeysArr });
        this.$message.success('保存成功');
      }
    },
    handleCancelSaveHotkey(row) {
      this.closeRow(row);
      const $table = this.$refs.xTable;
      $table.clearActived().then(() => {
        // 还原行数据
        // $table.revertData(row);
      });
    },
    saveFile(data) {
      dialog
        .showSaveDialog({
          title: 'select folder',
          filters: [{ name: 'json', extensions: ['json'] }]
        })
        .then(async ({ canceled, filePath }) => {
          if (canceled) {
            this.$message.info(i18nRender('general.canceled'));
            return;
          }
          if (filePath) {
            try {
              await fse.outputFile(filePath, JSON.stringify(data, null, 2));
              this.$message({
                message: `${i18nRender('general.export')} ${i18nRender(
                  'general.success'
                )}:  <a style="color: blue;">${filePath}</a>`,
                type: 'success',
                dangerouslyUseHTMLString: true
              });
            } catch (err) {
              console.error(err);
              this.$message.error(err);
            }
          }
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.row-style {
  height: 25px;
}

::v-deep {
  .el-dialog__body {
    z-index: 10000;
  }

  #pane-log {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

.introduction {
  padding: 10px;
  text-align: left;
  word-break: break-word;
}

.handbook {
  padding: 10px;
  height: 40px;
  font-size: 14px;

  .link {
    margin: 4px;
    color: #409eff;
  }
}

.hotkey {
  background-color: rgba(100, 100, 250, 0.2);
  border-radius: 4px;
  padding: 4px;
  box-shadow: inset 0 0 0 1px #B9B9B9;
}


/*滚动条整体部分*/
.hotkey-table-scrollbar ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

/*滚动条的轨道*/
.hotkey-table-scrollbar ::-webkit-scrollbar-track {
  background-color: #ffffff;
}

/*滚动条里面的小方块，能向上向下移动*/
.hotkey-table-scrollbar ::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 5px;
  border: 1px solid #f1f1f1;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

.hotkey-table-scrollbar ::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}

.hotkey-table-scrollbar ::-webkit-scrollbar-thumb:active {
  background-color: #787878;
}

/*边角，即两个滚动条的交汇处*/
.hotkey-table-scrollbar ::-webkit-scrollbar-corner {
  background-color: #ffffff;
}
</style>
