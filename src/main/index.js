'use strict';
import { cmdArg } from './services/cmdParse';
const { app, protocol } = require('electron');
import initWindow from './services/windowManager';
import DisableButton from './config/DisableButton';
import electronDevtoolsInstaller, {
  VUEJS_DEVTOOLS
} from 'electron-devtools-installer';
app.disableHardwareAcceleration(); // 禁用gpu加速  解决图片拖动卡顿问题
if (cmdArg.h) {
  console.log(`
MegSpot支持linux命令启动方便用户快捷访问。可以通过参数快捷进入图片视频的文件选取和比较页面。
Detail: [TODO:]

usage: 
./MegSpot-x.x.x.AppImage [folderPath]  [-ivch]  进入文件选取页面，并浏览folderPath文件夹地址
./MegSpot-x.x.x.AppImage [filePath ...]  [-ivch]  进入文件对比页面，可以同时添加多个

Options:
  path           支持绝对/相关的文件/文件夹地址，如果地址不存在则会被忽略
  -h, --help     进入帮助说明 
  -i, --image    进入图片相关页面 
  -v, --video    进入视频相关页面 
  -c, --clear    清空已选

advise:
  由于freeStone支持自动更新导致  MegSpot-x.x.x.AppImage的文件名称会不断变化，建议创建个硬链接指向AppImage
  命令：sudo ln ./MegSpot-x.x.x.AppImage /usr/bin/MegSpot      
  `);
  app.exit();
}
console.log('cmdArg', cmdArg);
function onAppReady() {
  initWindow();
  DisableButton.Disablef12();
  if (process.env.NODE_ENV === 'development') {
    electronDevtoolsInstaller(VUEJS_DEVTOOLS)
      .then(name => console.log(`installed: ${name}`))
      .catch(err => console.log('Unable to install `vue-devtools`: \n', err));
  }
  protocol.interceptFileProtocol('file', (request, callback) => {
    // 禁止缓存
    request.headers['Cache-Control'] = 'no-store';
    callback(request);
  });
}
// 禁止缓存
app.isReady() ? onAppReady() : app.on('ready', onAppReady);
// 解决9.x跨域异常问题
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.on('window-all-closed', () => {
  // 所有平台均为所有窗口关闭就退出软件
  app.quit();
});
app.on('browser-window-created', () => {
  console.log('window-created');
});

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.removeAsDefaultProtocolClient('MegSpot');
    console.log('有于框架特殊性开发环境下无法使用');
  }
} else {
  app.setAsDefaultProtocolClient('MegSpot');
}
