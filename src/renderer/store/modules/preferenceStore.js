const preferenceStore = {
  namespaced: true,
  state: {
    preference: {
      appLanguage: 'en',
      showTitle: true,
      background: {
        mode: 'white',
        style: 'background: #fafafa;'
      },
      scaleOptions: [4, 2, 1, 0.5, 0.25],
      // 是否默认显示直方图
      defaultShowHist: false,
      // 列表显示模式 list(列表表格) / thumbnail(缩略图列表)
      defaultFileListShowType: 'list'
    },
    lastRouterPath: '/dashboard'
  },
  getters: {
    preference: state => state.preference,
    lastRouterPath: state => state.lastRouterPath
  },
  mutations: {
    SET_PREFERENCE: (state, newPreOb) => {
      const newPreference = Object.assign({}, state.preference, newPreOb);
      state.preference = newPreference;
    },
    SET_LAST_ROUTER_PATH: (state, routerPath) => {
      state.lastRouterPath = routerPath;
    }
  },
  actions: {
    setPreference({ commit }, newPreOb) {
      commit('SET_PREFERENCE', newPreOb);
    },
    setLastRouterPath({ commit }, routerPath) {
      commit('SET_LAST_ROUTER_PATH', routerPath);
    }
  }
};

export default preferenceStore;
