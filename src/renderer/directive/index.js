import Vue from 'vue'

const files = require.context('./', true, /^\.\/(\w*\/)+index\.js$/)

files.keys().forEach((item) => {
  Vue.directive(item.split('/')[1], files(item).default)
})
