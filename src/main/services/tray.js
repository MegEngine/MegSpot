const { name, version } = require('../../../package.json')
const path = require('path')
const { ipcMain, app, Menu, Tray } = require('electron')

let appIcon = null

const iconName = process.platform === 'darwin' ? 'logo_icon_dark.png' : 'logo_icon.png'
const _iconPath = path.join(__dirname, '../../renderer/assets/images/' + iconName)
const _name = name[0].toUpperCase() + name.slice(1)

function setTray(mainWindow, iconPath = _iconPath) {
  appIcon = new Tray(iconPath)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: function () {
        return mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
      }
    },
    {
      label: 'Quit',
      click: function () {
        app.quit()
      }
    }
  ])

  appIcon.setToolTip(`${_name} ${version}`)
  appIcon.setContextMenu(contextMenu)
}

ipcMain.on('put-in-tray', (path) => {
  setTray(path || _iconPath)
})

ipcMain.on('remove-tray', () => {
  if (appIcon) {
    appIcon.destroy()
  }
})

app.on('window-all-closed', () => {
  if (appIcon) appIcon.destroy()
})

export default setTray
