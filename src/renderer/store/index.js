import Vue from 'vue';
import Vuex from 'vuex';
import { isExist } from '../utils/file';

// 注释这个的原因是因为会导致vuex操作失败
import { createPersistedState } from 'vuex-electron';
import modules from './modules';

import { DEFAULT_HOTKEYS } from '@/tools/hotkey';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules,
  // 如果使用插件 vuex 无法使用console.log debugger 进行调试
  plugins: [createPersistedState()],
  strict: process.env.NODE_ENV !== 'production'
});
const checkStore = function(pathList = [], removeFnName = '') {
  let removeList = [];
  pathList.forEach(item => {
    if (!item || !isExist(item)) {
      removeList.push(item);
    }
  });
  store.dispatch(removeFnName, removeList);
};
// 校验文件/文件夹存在性 移除不存在的  todo:改成单次不展示
const { imageStore = {}, videoStore = {}, preferenceStore } = store.state;
const { imageFolders = [], imageList = [] } = imageStore;
const { videoFolders = [], videoList = [] } = videoStore;
checkStore(imageFolders, 'imageStore/removeImageFolders');
checkStore(imageList, 'imageStore/removeImages');
checkStore(videoFolders, 'videoStore/removeVideoFolders');
checkStore(videoList, 'videoStore/removeVideos');
if (!preferenceStore.preference && preferenceStore.preference.hotkeys.length === 0) {
  store.dispatch('preferenceStore/setPreference', {
    hotkeys: DEFAULT_HOTKEYS
  });
}
export default store;
