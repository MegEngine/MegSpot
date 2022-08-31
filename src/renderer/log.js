// 全局设置log日志
import log from 'electron-log'
const appVersion = require('@/../../package.json').version
if (process.env.NODE_ENV !== 'development') {
  Object.assign(console, log.functions)
}
log.info(`-------------welcome using MegSpot! (${appVersion})----------------`)
export default log
