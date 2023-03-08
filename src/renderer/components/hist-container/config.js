import store from '@/store'

export const histTypeOptions = ['rgb', 'gray', 'red', 'green', 'blue']

export const get_default_histconfig = () => ({
  histTypes: ['rgb'], // 'gray', 'rgb', 'red', 'green', 'blue'
  scale: 1.0,
  lineWidth: 1,
  drawType: 'rect', // "line"/"rect"
  backgroundColor: [0, 0, 0, 255],
  colors: {
    gray: [0, 0, 0],
    red: [255, 0, 0],
    green: [0, 255, 0],
    blue: [0, 0, 255],
    rgb: [0, 0, 0]
  },
  accumulate: true,
  histSize: [256],
  ranges: [0, 256],
  // ui config
  multi: false
})

export const setHistConfig = (newHistConfig) => store.dispatch('preferenceStore/setHistConfig', newHistConfig)

export const isBright = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= 0.8
