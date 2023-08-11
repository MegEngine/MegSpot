import { clamp } from "./index"

export const DEFAULT_OVERLAP_RECT_OPTIONS = { padding: 0, round: false }
function getOverlapRect(rect1, rect2, options = {}) {
  const { padding, round } = Object.assign({}, DEFAULT_OVERLAP_RECT_OPTIONS, options)
  let x1 = Math.max(rect1.x, rect2.x)
  let y1 = Math.max(rect1.y, rect2.y)
  let x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width)
  let y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height)

  if (round) {
    x1 = Math.ceil(x1)
    y1 = Math.ceil(y1)
    x2 = Math.floor(x2)
    y2 = Math.floor(y2)
  }

  if (padding !== 0) {
    x1 -= padding
    y1 -= padding
    x2 += padding
    y2 += padding
  }

  // if (round || padding !== 0) {
  //   x1 = clamp(x1, Math.min())
  //   y1 = padding
  //   x2 = padding
  //   y2 = padding
  // }

  if (x2 > x1 && y2 > y1) {
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 }
  } else {
    return null
  }
}

export { getOverlapRect }
