import Vue from 'vue'
import getFileName from './get-file-name'
const install = function (Vue) {
  Vue.filter('getFileName', getFileName)
}
Vue.use(install)
