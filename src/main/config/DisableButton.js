import { globalShortcut } from 'electron'
import config from '@config'

export default {
  Disablef12 () {
    if (process.env.NODE_ENV === 'production' && config.DisableF12) {
      globalShortcut.register('f12', () => {
        console.log('用户试图启动控制台')
      })
    }
  }
}
