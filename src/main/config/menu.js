// 这里是定义菜单的地方，详情请查看 https://electronjs.org/docs/api/menu
const { dialog, shell } = require('electron');
const os = require('os');
const { version, homepage } = require('../../../package.json');
import { mainWindow } from '../services/windowManager';
const menu = [
  {
    label: 'view',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      {
        label: 'Preference',
        accelerator: 'CmdOrCtrl+,',
        click: function() {
          mainWindow.webContents.send('aboutDialog');
        }
      },
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'window',
    role: 'windowMenu'
  },
  {
    label: 'help',
    submenu: [
      {
        label: 'about',
        click: function() {
          info();
        }
      }
    ]
  }
];

function info() {
  dialog
    .showMessageBox({
      title: 'about',
      type: 'info',
      message: 'MegSpot',
      detail: `版本信息：${version}\n引擎版本：${
        process.versions.v8
      }\n当前系统：${os.type()} ${os.arch()} ${os.release()}`,
      noLink: true,
      buttons: ['查看仓库地址', '确定']
    })
    .then(({ response, checkboxChecked }) => {
      if (response === 0) {
        shell.openExternal(homepage);
      }
    })
    .catch(err => {
      console.error(err);
      dialog.showMessageBox({
        title: 'Error',
        type: 'error',
        message: 'MegSpot',
        detail: err.toString()
      });
    });
}
export default menu;
