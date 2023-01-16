import { throttle as lodashThrottle, debounce as lodashDebounce } from 'lodash'
export function throttle(wait, fun, option = {}) {
  return lodashThrottle(fun, wait, option)
}

export function debounce(wait, fun, option = {}) {
  return lodashDebounce(fun, wait, option)
}
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

export function formatTime(time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
  }
}

export function getUuid(prefix = 'MegSpot') {
  return `${prefix}-${new Date().getTime()}-${Math.random()}`
}

export function getUuidv4() {
  try {
    return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    )
  } catch (err) {
    return getUuid()
  }
}

export const getType = (obj) => Object.prototype.toString.call(obj).slice(8, -1)

export const clamp = (num, min, max) => Math.max(min, Math.min(num, max))

export const checkBoundary = (x, y, width, height, parentWidth, parentHeight, offsetX = 0, offsetY = 0) => {
  const lx = x - width - offsetX
  const ly = y - height - offsetY
  const rx = x + offsetX
  const ry = y + offsetY
  const res = {}

  res.x = rx + width <= parentWidth ? rx : lx
  res.y = ry + height <= parentHeight ? ry : ly

  return res
}
