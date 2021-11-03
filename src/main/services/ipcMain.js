import { ipcMain, dialog  } from 'electron';
import Server from '../server/index';

export default {
  Mainfunc(mainWindow, IsUseSysTitle) {
    ipcMain.handle('IsUseSysTitle', async () => {
      return IsUseSysTitle;
    });
    ipcMain.handle('windows-mini', () => {
      mainWindow.minimize();
    });
    ipcMain.handle('window-max', async () => {
      if (mainWindow.isMaximized()) {
        mainWindow.restore();
        return { status: false };
      } else {
        mainWindow.maximize();
        return { status: true };
      }
    });
    ipcMain.handle('window-close', () => {
      mainWindow.close();
    });
    ipcMain.handle('open-messagebox', async (event, arg) => {
      const res = await dialog.showMessageBox(mainWindow, {
        type: arg.type || 'info',
        title: arg.title || '',
        buttons: arg.buttons || [],
        message: arg.message || '',
        noLink: arg.noLink || true,
      });
      return res;
    });
    ipcMain.handle('open-errorbox', (event, arg) => {
      dialog.showErrorBox(arg.title, arg.message);
    });
    ipcMain.handle('statr-server', async () => {
      try {
        const serveStatus = await Server.StatrServer();
        console.log(serveStatus);
        return serveStatus;
      } catch (error) {
        dialog.showErrorBox('错误', error);
      }
    });
    ipcMain.handle('stop-server', async (event, arg) => {
      try {
        const serveStatus = await Server.StopServer();
        return serveStatus;
      } catch (error) {
        dialog.showErrorBox('错误', error);
      }
    });
  },
};
