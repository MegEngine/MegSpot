/**
 * The file enables `@/store/index.js` to import all vuex modules
 * in a one-shot manner. There should not be any reason to edit this file.
 */
/**
 * 如果没什么大问题的话，这里的js会默认将你的所有模块全部自动导出，
 * 没有什么意外无需更改这里的代码和外部的index代码，需要如果需要将值暴露给
 * getter的话，还请自行手动添加，它的弊端就是不能够再这里留空文件，不然就会出现Cannot read property 'getters' of undefined的控制台报错信息
 */
const files = require.context('.', false, /\.js$/)
const modules = {}

files.keys().forEach(key => {
  if (key === './index.js') return
  modules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default
})

export default modules
