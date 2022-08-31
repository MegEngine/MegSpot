<template>
  <el-dialog
    id="update-dialog"
    ref="dialog"
    :title="canUpdate ? 'update now' : 'check update'"
    :visible.sync="visible"
    center
    width="60%"
  >
    <div v-if="canUpdate" style="height: 500px; user-select: text">
      <el-row :gutter="20">
        <el-col :offset="5" :span="4" class="text-style">version</el-col>
        <el-col :span="12" class="text-style">
          {{ info.version }}
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :offset="5" :span="4" class="text-style">release date</el-col>
        <el-col :span="12" class="text-style">{{ info.releaseDate }}</el-col>
      </el-row>
      <el-row :gutter="20" class="text-style">
        <el-col :offset="5" :span="4">release notes</el-col>
        <el-col :span="12" class="text-style">
          <p style="white-space: break-spaces">{{ info.releaseNotes }}</p>
        </el-col>
      </el-row>
    </div>
    <p v-else style="height: 300px; white-space: break-spaces; text-align: center">
      {{ checkUpdateMsg }}
    </p>
    <span slot="footer" v-if="canUpdate" class="dialog-footer">
      <el-button @click="close">later(Update at next startup)</el-button>
      <el-button type="primary" @click="updateNow">update now</el-button>
    </span>
  </el-dialog>
</template>

<script>
const { ipcRenderer } = require('electron')
export default {
  name: 'UpdateDialog',
  data() {
    return {
      visible: false,
      canUpdate: true,
      checkUpdateMsg: '',
      info: {}
    }
  },
  mounted() {
    ipcRenderer.on('autoUpdateMessage', (event, text) => {
      console.log(`[update message]: ${text}`)
      this.checkUpdateMsg += `${text}\r\n`
    })

    ipcRenderer.on('askForUpdateNow', (event, data) => {
      this.canUpdate = true
      const { version, releaseNotes, releaseDate } = data
      this.info = {
        version,
        releaseNotes,
        releaseDate
      }
      this.canUpdate = true
      this.visible = true
    })
  },
  methods: {
    // 供外部直接调用
    show() {
      this.canUpdate = false
      this.visible = true
      try {
        // 前端主动触发更新检测
        ipcRenderer.send('checkForUpdate')
      } catch (e) {
        console.log('e', e)
      }
    },
    close() {
      this.visible = false
    },
    updateNow() {
      ipcRenderer.send('updateNow')
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
#update-dialog {
  .text-style {
    line-height: 30px;
  }
}
</style>
