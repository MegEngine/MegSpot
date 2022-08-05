import { getArrStr } from '@/tools/hotkey';
import {getType} from '@/utils'

const preferenceStore = {
  namespaced: true,
  state: {
    preference: {
      appLanguage: 'en',
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
      // 视频控制条位置 fixed(固定在toolbar) / float (悬浮球)
      videoProcessBarStyle: 'fixed',
      hotkeys: []
    },
    lastRouterPath: '/dashboard',
    hotkeysMap: null
  },
  getters: {
    preference: state => state.preference,
    lastRouterPath: state => state.lastRouterPath,
    hotkeysMap: state => state.hotkeysMap
  },
  mutations: {
    SET_PREFERENCE: (state, newPreOb) => {
      const newPreference = Object.assign({}, state.preference, newPreOb);
      state.preference = newPreference;
      if (newPreOb.hotkeys?.length) {
        console.log('generate keysMap')
        state.hotkeysMap = new Map(newPreOb.hotkeys.map(({ name, keysArr }) => keysArr.map(keys => [getArrStr(keys), name])).flat());
      }
    },
    SET_LAST_ROUTER_PATH: (state, routerPath) => {
      state.lastRouterPath = routerPath;
    },
    ENSURE_HOTKEYS_MAP: (state) => {
      if (getType(state.hotkeysMap) !== 'Map' || state.hotkeysMap.size === 0) {
        console.log('(ensure)generate keysMap')
        state.hotkeysMap = new Map(state.preference.hotkeys.map(({ name, keysArr }) => keysArr.map(keys => [getArrStr(keys), name])).flat());
      }
    },
    CLEAR_HOTKEYS_MAP: (state) => {
      state.hotkeysMap = null;
      console.log('clear map', state.hotkeysMap);
    }
  },
  actions: {
    setPreference({ commit }, newPreOb) {
      commit('SET_PREFERENCE', newPreOb);
    },
    setLastRouterPath({ commit }, routerPath) {
      commit('SET_LAST_ROUTER_PATH', routerPath);
    },
    ensureHotkeysMap({ commit }) {
      commit('ENSURE_HOTKEYS_MAP')
    }
  }
};

export default preferenceStore;
