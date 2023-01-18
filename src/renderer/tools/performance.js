/**
 * 性能工具
 * 1. 计算方法执行时间
 * @returns {void}
 */
import Timer from './timer'

class Performance {
  /**
   * 计算情况
   * @returns {Function}  执行返回值获取时间信息
   */
  startExecute(name = '') {
    const timer = Timer.start()
    const usedJSHeapSize = this.getMemoryInfo().usedJSHeapSize
    return (name2 = '') => {
      const executeTime = timer.stop()
      const endMemoryInfo = this.getMemoryInfo()
      console.log(
        '%cPerformance%c \n1. 执行方法：%c%s%c\n2. 执行耗时： %c%sms%c \n3. 内存波动：%sB \n4. 已分配内存： %sMB \n5. 已使用内存：%sMB \n6. 剩余内存： %sMB',
        'padding: 2px 4px 2px 4px; background-color: #4caf50; color: #fff; border-radius: 4px;',
        '',
        'color: #ff6f00',
        `${name} ${name2}`,
        '',
        'color: #ff6f00',
        executeTime,
        '',
        endMemoryInfo.usedJSHeapSize - usedJSHeapSize,
        this.toMBSize(endMemoryInfo.jsHeapSizeLimit),
        this.toMBSize(endMemoryInfo.usedJSHeapSize),
        this.toMBSize(endMemoryInfo.totalJSHeapSize)
      )
    }
  }

  /**
   * 获取内存信息
   * @returns {void}
   */
  getMemoryInfo() {
    let memoryInfo = {}
    if (window.performance && window.performance.memory) {
      memoryInfo = window.performance.memory
    }
    return memoryInfo
  }

  /**
   * 转化为MB
   * @returns {void}
   */
  toMBSize(byteSize) {
    return (byteSize / (1024 * 1024)).toFixed(1)
  }
}

export function toMBSize(byteSize) {
  return byteSize / (1024 * 1024)
}

export const getPerformance = (toMB = true) => {
  const { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = performance.memory
  const data = JSON.parse(JSON.stringify(performance))
  data.memory = {
    jsHeapSizeLimit: toMB ? Math.ceil(toMBSize(jsHeapSizeLimit)) : jsHeapSizeLimit,
    totalJSHeapSize: toMB ? Math.ceil(toMBSize(totalJSHeapSize)) : totalJSHeapSize,
    usedJSHeapSize: toMB ? Math.ceil(toMBSize(usedJSHeapSize)) : usedJSHeapSize
  }
  return data
}

export default new Performance()
