'use strict'
import path from 'path'
import { cmdArg } from './services/cmdParse'
const { app, protocol } = require('electron')
import PersistedState from 'vuex-electron-store'
import initWindow from './services/windowManager'
import DisableButton from './config/DisableButton'
const { session } = require('electron')
// import electronDevtoolsInstaller, {
//   VUEJS_DEVTOOLS
// } from 'electron-devtools-installer';
import { NO_CACHE_FILE_PROTOCOL } from '@/constants'

protocol.registerSchemesAsPrivileged([
  {
    scheme: NO_CACHE_FILE_PROTOCOL,
    privileges: { bypassCSP: true }
  }
])
// app.disableHardwareAcceleration(); // 禁用gpu加速  解决图片拖动卡顿问题
if (cmdArg.h) {
  console.log(`
MegSpot支持linux命令启动方便用户快捷访问。可以通过参数快捷进入图片视频的文件选取和比较页面。
Detail: https://github.com/MegEngine/MegSpot/wiki/%E5%91%BD%E4%BB%A4%E8%A1%8C%E6%93%8D%E4%BD%9C

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
  由于MegSpot支持自动更新导致  MegSpot-x.x.x.AppImage的文件名称会不断变化，建议创建个硬链接指向AppImage
  命令：sudo ln ./MegSpot-x.x.x.AppImage /usr/bin/MegSpot
  `)
  app.exit()
}
app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport') // 启用H.265解码
require('@electron/remote/main').initialize() // init @electron/remote
PersistedState.initRenderer() // init vuex-electron-store
console.log('cmdArg', cmdArg)
function onAppReady() {
  initWindow()
  DisableButton.Disablef12()
  if (process.env.NODE_ENV === 'development') {
    const { VUEJS_DEVTOOLS } = require('electron-devtools-vendor') // Vue2 Extension
    session.defaultSession
      .loadExtension(path.resolve(VUEJS_DEVTOOLS), {
        allowFileAccess: true
      })
      .then(() => {
        console.log('已安装: vue-devtools')
      })
      .catch((err) => {
        console.error('拓展安装失败', err)
      })
    // electronDevtoolsInstaller(VUEJS_DEVTOOLS)
    //   .then(name => console.log(`installed: ${name}`))
    //   .catch(err => console.log('Unable to install `vue-devtools`: \n', err));
  }
  const registerSucceed = protocol.registerFileProtocol(NO_CACHE_FILE_PROTOCOL, (request, callback) => {
    const url = decodeURI(request.url).substr(`${NO_CACHE_FILE_PROTOCOL}://`.length)
    callback({
      path: url,
      headers: {
        'cache-control': 'no-store'
      }
    })
  })
  if (!registerSucceed) console.error('Failed to register protocol')
  protocol.interceptFileProtocol('file', (request, callback) => {
    callback(request)
  })
}
// 禁止缓存
app.isReady() ? onAppReady() : app.on('ready', onAppReady)
// 解决9.x跨域异常问题
app.commandLine.appendArgument('no-sandbox')

app.on('window-all-closed', () => {
  // 所有平台均为所有窗口关闭就退出软件
  app.quit()
})
app.on('browser-window-created', () => {
  // console.log('window-created');
})
const MEGSPOT = 'megspot'
if (process.env.NODE_ENV === 'development' && process.platform === 'win32') {
  // 设置electron.exe 和 app的路径
  app.setAsDefaultProtocolClient(MEGSPOT, process.execPath, [path.resolve(process.argv[1])])
} else {
  app.setAsDefaultProtocolClient(MEGSPOT)
}
