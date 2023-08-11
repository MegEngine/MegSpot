import { getArrStr } from '@/tools/hotkey'
import { getType } from '@/utils'

const preferenceStore = {
  namespaced: true,
  state: {
    preference: {
      appLanguage: 'en',
      neverCheckLanguage: false, // 不再检查系统语言(设置为中文)
      showTitle: true,
      background: {
        mode: 'default',
        style:
          'background: #e3e7e9; background-image: linear-gradient(45deg, #f6fafc 25%, transparent 0), linear-gradient(45deg, transparent 75%, #f6fafc 0), linear-gradient(45deg, #f6fafc 25%, transparent 0), linear-gradient(45deg, transparent 75%, #f6fafc 0); background-position: 0 0, 10px 10px, 10px 10px, 20px 20px; background-size: 20px 20px;'
      },
      scaleOptions: [4, 2, 1, 0.5, 0.25],
      // 是否默认显示直方图
      defaultShowHist: false,
      // 列表显示模式 list(列表表格) / thumbnail(缩略图列表)
      defaultFileListShowType: 'list',
      // 取色器显示色值的格式
      colorPickerMode: 'rgb', // `rgb` / `hex`
      // 取色器中是否显示鼠标坐标
      colorPickerShowPos: true,
      showRGBText: false,
      // 每次手动按键时图像的移动距离, 默认为100像素
      moveDistance: 100,
      // 视频控制条位置 fixed(固定在toolbar) / float (悬浮球)
      videoProcessBarStyle: 'fixed',
      showScale: true,
      showMousePos: true,
      hotkeys: []
    },
    // gamma校正
    gamma: 1,
    colorLevelSetting: {
      inputMidtones: 1,
      inputs: [0, 255],
      outputs: [0, 255]
      // inputShadow: 0,
      // inputHighlight: 255,
      // outputShadow: 0,
      // outputHighlight: 255
    },
    histConfig: {
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
    },
    uuid: null,
    lastRouterPath: '/dashboard',
    hotkeysMap: null
  },
  getters: {
    uuid: (state) => state.uuid,
    gamma: (state) => state.gamma,
    preference: (state) => state.preference,
    histConfig: (state) => state.histConfig,
    hotkeysMap: (state) => state.hotkeysMap,
    lastRouterPath: (state) => state.lastRouterPath,
    colorLevelSetting: (state) => state.colorLevelSetting
  },
  mutations: {
    SET_PREFERENCE: (state, newPreOb) => {
      const newPreference = Object.assign({}, state.preference, newPreOb)
      state.preference = newPreference
      if (newPreOb.hotkeys?.length) {
        console.log('generate keysMap')
        state.hotkeysMap = new Map(
          newPreOb.hotkeys.map(({ name, keysArr }) => keysArr.map((keys) => [getArrStr(keys), name])).flat()
        )
      }
    },
    SET_HISTCONFIG: (state, newHistConfig) => {
      const _newHistConfig = Object.assign({}, state.histConfig, newHistConfig)
      state.histConfig = _newHistConfig
    },
    SET_UUID: (state, newUuid) => {
      state.uuid = newUuid
    },
    SET_GAMMA: (state, newGamma) => {
      state.gamma = newGamma
    },
    SET_COLOR_LEVEL: (state, newPreOb) => {
      const newPreference = Object.assign({}, state.colorLevelSetting, newPreOb)
      state.colorLevelSetting = newPreference
    },
    SET_LAST_ROUTER_PATH: (state, routerPath) => {
      state.lastRouterPath = routerPath
    },
    ENSURE_HOTKEYS_MAP: (state) => {
      if (getType(state.hotkeysMap) !== 'Map' || state.hotkeysMap.size === 0) {
        console.log('(ensure)generate keysMap')
        state.hotkeysMap = new Map(
          state.preference.hotkeys.map(({ name, keysArr }) => keysArr.map((keys) => [getArrStr(keys), name])).flat()
        )
      }
    },
    CLEAR_HOTKEYS_MAP: (state) => {
      state.hotkeysMap = null
      console.log('clear map', state.hotkeysMap)
    }
  },
  actions: {
    setPreference({ commit }, newPreOb) {
      commit('SET_PREFERENCE', newPreOb)
    },
    setHistConfig({ commit }, newHistConfig) {
      commit('SET_HISTCONFIG', newHistConfig)
    },
    setColorLevel({ commit }, newPreOb) {
      commit('SET_COLOR_LEVEL', newPreOb)
    },
    setUuid({ commit }, newUuid) {
      commit('SET_UUID', newUuid)
    },
    setGamma({ commit }, newGamma) {
      commit('SET_GAMMA', newGamma)
    },
    setLastRouterPath({ commit }, routerPath) {
      commit('SET_LAST_ROUTER_PATH', routerPath)
    },
    ensureHotkeysMap({ commit }) {
      commit('ENSURE_HOTKEYS_MAP')
    }
  }
}

export default preferenceStore
