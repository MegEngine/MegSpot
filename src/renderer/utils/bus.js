import Vue from 'vue'
// 日志
import log from '@/log'

/**
 * 添加事件总线
 * @param {*} Vue
 */
export const bus = new Vue()
export const initEventBus = () => {
  Object.defineProperties(Vue.prototype, {
    $bus: {
      get: function () {
        return bus
      }
    },
    $log: {
      get: function () {
        return log
      }
    }
  })
}

export default bus
