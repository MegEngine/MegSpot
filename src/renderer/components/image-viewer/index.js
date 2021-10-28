import directive from './image-viewer'
import Viewer from 'viewerjs'

export default {
  install(Vue, { name = 'viewer', debug = false, defaultOptions } = {}) {
    Viewer.setDefaults(defaultOptions)

    Vue.use(directive, { name, debug })
  },
  setDefaults(defaultOptions) {
    Viewer.setDefaults(defaultOptions)
  }
}
