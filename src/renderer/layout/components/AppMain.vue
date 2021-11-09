<template>
  <section class="app-main">
    <transition name="fade" mode="out-in">
      <keep-alive include="VideoRoot,ImageRoot,ViewerRoot">
        <router-view />
      </keep-alive>
    </transition>
  </section>
</template>

<script>
import path from 'path';
var electron = require('electron');
var userData = electron.remote.app.getPath('userData');
console.log('userData', userData);
var documents = electron.remote.app.getPath('documents');
console.log('documents', documents);
var appPath = electron.remote.app.getAppPath();
console.log('appPath', appPath);
console.log(
  'electron.remote.app.getPath("temp")',
  electron.remote.app.getPath('temp')
);
import { createNamespacedHelpers } from 'vuex';
import { isDirectory, readDir, getFileStatSync, isExist } from '@/utils/file';
const IMAGE_MODE = 'imageMode';
const VIDEO_MODE = 'videoMode';
export default {
  name: 'AppMain',
  beforeCreate: async function() {
    // 尽在产品模式下运行 开发模式默认也会是通过命令运行，但是不是产品模式的命令 所以禁止处理
    if (process.env.NODE_ENV !== 'production') return;
    const cmd = await electron.ipcRenderer.sendSync('get_start_cmd_arg');
    // 命令处理规则 https://github.com/MegEngine/MegSpot/wiki/%E5%91%BD%E4%BB%A4%E8%A1%8C%E6%93%8D%E4%BD%9C
    console.log(`[command start app arg]: ${JSON.stringify(cmd)}`);
    const checkedPath = [];
    const unExistPath = [];
    cmd._.forEach(item => {
      if (!isExist(item)) {
        unExistPath.push(item);
      } else {
        checkedPath.push(path.resolve(item));
      }
    });
    // 非法路径校验
    if (unExistPath.length) {
      this.$message({
        type: 'warning',
        message: `Some path arg no exist and is ignored.${JSON.stringify(
          unExistPath
        )}`
      });
    }
    // 识别模式
    let mode;
    if (cmd.v) {
      mode = VIDEO_MODE;
      console.log('进入video');
    } else if (cmd.i) {
      // 指定image模式
      mode = IMAGE_MODE;
      console.log('进入image');
    } else if (checkedPath.length > 0) {
      // 仅设置path 默认进入image模式
      mode = IMAGE_MODE;
      console.log('进入image');
    } else {
      // 如果是dashboard模式则直接返回
      console.log('进入dashboad');
      return;
    }
    // 处理是否清空参数
    if (cmd.c) {
      mode === IMAGE_MODE && this.$store.dispatch('imageStore/emptyImages');
      mode === VIDEO_MODE && this.$store.dispatch('videoStore/emptyVideos');
    }
    // 设置模式但是没有设置路径参数的情况
    if (checkedPath.length === 0) {
      mode === IMAGE_MODE &&
        this.$router.push({
          path: '/image/index'
        });
      mode === VIDEO_MODE &&
        this.$router.push({
          path: '/video/index'
        });
    } else if (isDirectory(checkedPath[0])) {
      // 如果第一个参数是路径 则修改默认查找路径
      if (mode === IMAGE_MODE) {
        this.$store.dispatch('imageStore/setFolderPath', checkedPath[0]);
        this.$router.push({
          path: '/image/index'
        });
      }
      if (mode === VIDEO_MODE) {
        this.$store.dispatch('videoStore/setFolderPath', checkedPath[0]);
        this.$router.push({
          path: '/video/index'
        });
      }
      if (checkedPath.length > 1) {
        this.$message({
          type: 'warning',
          message: `Jump to file select page.other args is ignored:${JSON.stringify(
            checkedPath.slice(1)
          )}`
        });
      }
    } else {
      // 其他的作为对比文件增加到对比队列中
      if (mode === IMAGE_MODE) {
        // 避免已经被引入 所以先移除
        this.$store.dispatch('imageStore/removeImages', checkedPath);
        this.$store.dispatch('imageStore/addImages', checkedPath);
        this.$router.push({
          path: '/image/compare'
        });
      }
      if (mode === VIDEO_MODE) {
        this.$store.dispatch('videoStore/removeVideos', checkedPath);
        this.$store.dispatch('videoStore/addVideos', checkedPath);
        this.$router.push({
          path: '/video/compare'
        });
      }
    }
  },
  mounted() {
    electron.ipcRenderer.on('debugMessage', (event, text) => {
      console.log(`[debug message]: ${text}`);
    });
  }
};
</script>
<style lang="scss" scoped>
//main-container全局样式
.app-main {
  height: calc(100vh - 42px);
  -webkit-app-region: no-drag;
  background-color: white;
}
</style>
