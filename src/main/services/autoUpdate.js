import { ipcMain } from 'electron';
// 注意这个autoUpdater不是electron中的autoUpdater
import { autoUpdater } from 'electron-updater';

autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = "info"
// 更新服务器地址，比如"http://**.**.**.**:3002/download/"

// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
function updateHandle(mainWindow) {
  // 通过main进程发送事件给renderer进程，提示更新信息
  function sendUpdateMessage(text) {
    console.log('[update message]:', text);
    mainWindow.webContents.send('autoUpdateMessage', text);
  }
  let message = {
    error: 'check update error',
    checking: 'checking update……',
    updateAva: 'New version detected, downloading',
    updateNotAva: 'Now you are using the latest version, no need to update'
  };

  autoUpdater.setFeedURL({
    provider: 'github',
    private: false,
    repo: 'MegSpot',
    owner: 'MegEngine',
    releaseType: 'release',
  });

  autoUpdater.on('error', function(info) {
    console.log('info', info);
    sendUpdateMessage(message.error);
  });
  autoUpdater.on('checking-for-update', function(info) {
    console.log('info', info);
    sendUpdateMessage(message.checking);
  });
  autoUpdater.on('update-available', function(info) {
    console.log('info', info);
    sendUpdateMessage(message.updateAva);
  });
  autoUpdater.on('update-not-available', function(info) {
    console.log('info', info);
    sendUpdateMessage(message.updateNotAva);
  });

  autoUpdater.on('update-downloaded', function(info) {
    mainWindow.webContents.send('askForUpdateNow', info);
  });
  // 响应立即更新
  ipcMain.on('updateNow', () => {
    autoUpdater.quitAndInstall();
  });
  // 响应前端手动触发更新
  // if (process.env.NODE_ENV === 'production') {
  ipcMain.on('checkForUpdate', event => {
    //执行自动更新检查
    autoUpdater
      .checkForUpdates()
      .then(data => {
        /**
         *  data 实例结构
         *     versionInfo: {
         *           version: '1.1.1',
         *           files: [ [Object] ],
         *           path: 'MegSpot-1.1.1.AppImage',
         *           sha512: '+Y17LmjW3XYLkh03/zH49EASeEQ+wKWF3oD1k/kbHCyaoRCaa4ktpJgCJqt9knvAH/3k92FgMsH0euMiXjmnxA==',
         *           releaseNotes: '1.支持自动更新\n2.文件夹导航支持懒加载\n',
         *           releaseDate: '2021-06-28T10:05:46.086Z'
         *         },
         *         updateInfo: {
         *           version: '1.1.1',
         *           files: [ [Object] ],
         *           path: 'MegSpot-1.1.1.AppImage',
         *           sha512: '+Y17LmjW3XYLkh03/zH49EASeEQ+wKWF3oD1k/kbHCyaoRCaa4ktpJgCJqt9knvAH/3k92FgMsH0euMiXjmnxA==',
         *           releaseNotes: '1.支持自动更新\n2.文件夹导航支持懒加载\n',
         *           releaseDate: '2021-06-28T10:05:46.086Z'
         *         }
         *  }
         *
         *  */
        event.returnValue = data;
      })
      .catch(reason => {
        sendUpdateMessage(reason.message);
      });
  });
  // 后端主动检查版本更新
  // if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdates();
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 60 * 60 * 1000);
  // }
}
// }

export default updateHandle;
