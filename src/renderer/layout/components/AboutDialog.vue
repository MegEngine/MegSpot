<template>
  <el-dialog
    ref="aboutDialog"
    title="Preference"
    :visible.sync="visible"
    center
    width="80%"
  >
    <el-tabs
      value="introduction"
      tab-position="left"
      stretch
      style="height:600px"
    >
      <el-tab-pane label="introduction" name="introduction">
        <div style="text-align:left">
          <div class="introduction">
            {{
              `MegSpot is a cross-platform local application designed to provide users with convenient functions such as local picture comparison, video comparison, and picture customization processing.\r\nEnter Dingding Group for details.`
            }}
          </div>
          <div class="handbook" flex="main:left cross:center">
            <span>使用手册：</span>
            <span class="link" @click="imageDragDropCompare"
              >图片分割对比功能</span
            >
            <span class="link" @click="startCommand">Linux支持命令启动</span>
            <span class="link" @click="autoUpdates">自动更新功能说明</span>
          </div>
          <img
            style="width: 300px"
            src="../../assets/images/group-qrcode.png"
            alt=""
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="settings" name="settings">
        <el-form label-position="right">
          <el-form-item label="language">
            <el-select v-model="appLanguage">
              <el-option
                v-for="item in langOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="version" name="version">
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
      <el-tab-pane label="hotkey" name="hotkey">
        <el-table :data="keyData" style="width: 100%" :show-header="false">
          <el-table-column prop="cmd" label="Command" width="450">
          </el-table-column>
          <el-table-column prop="key" label="KeyBinding"> </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="log" name="log">
        <el-row>
          <el-col :span="3" style="line-height:32px">
            log path
          </el-col>
          <el-col :span="21">
            <ShowPath :path="logPath" />
          </el-col>
        </el-row>
        <el-row style="flex-grow:1;overflow:auto" class="log-container">
          <el-col :span="3" style="line-height:32px">
            log txt
          </el-col>
          <el-col :span="21">
            <span style=" white-space: break-spaces;">{{ logTxt }}</span>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
const { shell, ipcRenderer } = require('electron');
import ShowPath from '@/components/show-path';
const appVersion = require('@/../../package.json').version;
const {
  releaseNotes,
  releaseDate
} = require('@/../../package.json').build.releaseInfo;
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('preferenceStore');
export default {
  name: 'AboutDialog',
  components: { ShowPath },
  data() {
    return {
      visible: false,
      logPath: '',
      appVersion,
      releaseNotes,
      releaseDate,
      logTxt: '',
      keyData: [
        {
          cmd: 'jump to compare',
          key: 'cmd/ctrl+enter'
        },
        {
          cmd: 'back to file select',
          key: 'esc'
        },
        {
          cmd: 'show/hide select file gallery',
          key: 'cmd/ctrl+f'
        }
      ],
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
    appLanguage: {
      get() {
        return this.preference.appLanguage;
      },
      set(arg) {
        this.setPreference({
          appLanguage: arg
        });
      }
    }
  },
  watch: {
    appLanguage: {
      handler: function() {
        this.$i18n.locale = this.appLanguage;
      },
      immediate: true
    }
  },
  mounted() {
    ipcRenderer.on('aboutDialog', event => {
      this.visible = !this.visible;
      ipcRenderer.send(this.visible ? 'put-in-tray' : 'tray-removed');
    });
    this.logPath = this.$log.transports.file.findLogPath();
    try {
      const logs = this.$log.transports.file.readAllLogs();
      const lastLog = logs[0]?.lines.slice(-100);
      lastLog.forEach(logLine => {
        this.logTxt += logLine + '\r\n';
      });
    } catch (e) {
      console.error('get log txt error', e.messages);
    }
  },
  methods: {
    ...mapActions(['setPreference']),
    show() {
      this.visible = true;
    },
    checkUpdate() {},
    imageDragDropCompare() {
      shell.openExternal();
    },
    startCommand() {
      shell.openExternal(
        'https://github.com/MegEngine/MegSpot/wiki/%E5%91%BD%E4%BB%A4%E8%A1%8C%E6%93%8D%E4%BD%9C'
      );
    },
    autoUpdates() {
      shell.openExternal(
        'https://github.com/MegEngine/MegSpot/wiki/%E8%87%AA%E5%8A%A8%E6%9B%B4%E6%96%B0'
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.row-style {
  height: 25px;
}

::v-deep {
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
</style>
