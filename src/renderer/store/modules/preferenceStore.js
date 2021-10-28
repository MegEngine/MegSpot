import * as GLABEL_CONSTANT from '../../constants';
const preferenceStore = {
  namespaced: true,
  state: {
    preference: {
      appLanguage: 'en'
    }
  },
  getters: {
    preference: state => state.preference
  },
  mutations: {
    SET_PREFERENCE: (state, newPreOb) => {
      const newPreference = Object.assign({}, state.preference, newPreOb);
      state.preference = newPreference;
    }
  },
  actions: {
    setPreference({ commit }, newPreOb) {
      commit('SET_PREFERENCE', newPreOb);
    }
  }
};

export default preferenceStore;
