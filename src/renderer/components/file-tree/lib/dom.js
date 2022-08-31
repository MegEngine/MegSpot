export function on(element, event, handler) {
  if (element && event && handler) {
    if (typeof element.addEventListener === 'function' && typeof handler === 'function' && typeof event === 'string') {
      element.addEventListener(event, handler, false)
    }
  }
}

export function off(element, event, handler) {
  if (element && event && handler) {
    if (
      typeof element.removeEventListener === 'function' &&
      typeof handler === 'function' &&
      typeof event === 'string'
    ) {
      element.removeEventListener(event, handler, false)
    }
  }
}

export function stop(e) {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation()
  }
}

export function click(element) {
  if (element && typeof element.click === 'function') {
    element.click()
  }
}

export const isInViewport = (offsetTop, container) => {
  return new Promise((resolve, reject) => {
    if (!(typeof offsetTop === 'number' && container && typeof container.scrollTop === 'number')) {
      return reject(new Error('Invalid params'))
    }
    // The purpose of this delay is to prevent scrolling too fast
    setTimeout(() => {
      resolve(offsetTop >= container.scrollTop && offsetTop <= container.scrollTop + container.offsetHeight)
    }, 100)
  })
}
