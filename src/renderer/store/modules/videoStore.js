import * as GLABEL_CONSTANT from '../../constants';
import { trimSep } from '@/utils/file';

const videoStore = {
  namespaced: true,
  state: {
    videoList: [],
    videoFolders: [],
    videoConfig: {
      smooth: true,
      layout: GLABEL_CONSTANT.LAYOUT_2X1,
      defaultSort: {}
    },
    //当前文件夹路径
    currentPath: '',
    // 记忆文件树展开
    expandData: []
  },
  getters: {
    videoList: state => state.videoList,
    videoFolders: state => state.videoFolders,
    getVideoFolders: state => () => state.videoFolders,
    videoConfig: state => state.videoConfig,
    currentPath: state => state.currentPath,
    expandData: state => state.expandData
  },
  mutations: {
    SET_VIDEO_CONFIG: (state, configOb) => {
      const newConfig = Object.assign({}, state.videoConfig, configOb);
      state.videoConfig = newConfig;
    },
    SET_VIDEO_FOLDERS: (state, folders) => {
      state.videoFolders = folders.map(trimSep);
    },
    ADD_VIDEO_FOLDER: (state, folder) => {
      if (!state.videoFolders.includes(trimSep(folder))) {
        const tmp = [...state.videoFolders];
        tmp.push(folder);
        state.videoFolders = tmp;
      }
    },
    REMOVE_VIDEO_FOLDER: (state, folder) => {
      if (state.videoFolders.includes(trimSep(folder))) {
        const tmp = [...state.videoFolders];
        tmp.splice(state.videoFolders.indexOf(folder), 1);
        state.videoFolders = tmp;
      }
    },
    ADD_VIDEO: (state, video) => {
      if (!state.videoList.includes(video)) {
        state.videoList = [...state.videoList, video];
      }
    },
    ADD_VIDEOS: (state, videos) => {
      if (videos.length) {
        state.videoList = [...new Set(state.videoList.concat(videos))];
      }
    },
    REMOVE_VIDEO: (state, video) => {
      if (state.videoList.includes(video)) {
        const tmp = [...state.videoList];
        tmp.splice(state.videoList.indexOf(video), 1);
        state.videoList = tmp;
      }
    },
    SET_VIDEOS: (state, newVideoList) => {
      state.videoList = newVideoList;
    },
    EMPTY_VIDEOS: state => {
      state.videoList = [];
    },
    // 修改当前文件夹
    SET_CURRENT_FOLDER_PATH: (state, newFolderPath) => {
      state.currentPath = newFolderPath;
    },
    // 记忆文件树展开情况
    ADD_VIDEO_EXPAND_DATA: (state, newOpenFolder) => {
      state.expandData.push(newOpenFolder);
    },
    REMOVE_VIDEO_EXPAND_DATA: (state, closeFolder) => {
      state.expandData = state.expandData.filter(item => {
        return !item.startsWith(closeFolder);
      });
    }
  },
  actions: {
    setVideoConfig({ commit }, config) {
      commit('SET_VIDEO_CONFIG', config);
    },
    setVideoFolders({ commit }, folders) {
      commit('SET_VIDEO_FOLDERS', folders);
    },
    addVideoFolders({ commit }, folders) {
      if (!Array.isArray(folders)) {
        commit('ADD_VIDEO_FOLDER', folders);
      } else {
        folders.forEach(item => commit('ADD_VIDEO_FOLDER', item));
      }
    },
    removeVideoFolders({ commit }, folders) {
      if (!Array.isArray(folders)) {
        commit('REMOVE_VIDEO_FOLDER', folders);
      } else {
        folders.forEach(item => commit('REMOVE_VIDEO_FOLDER', item));
      }
    },
    addVideos({ commit }, videos) {
      if (!Array.isArray(videos)) {
        commit('ADD_VIDEO', videos);
      } else {
        commit('ADD_VIDEOS', videos);
      }
    },
    removeVideos({ commit }, video) {
      if (!Array.isArray(video)) {
        commit('REMOVE_VIDEO', video);
      } else {
        video.forEach(item => commit('REMOVE_VIDEO', item));
      }
    },
    setVideos({ commit }, newVideoList) {
      commit('SET_VIDEOS', newVideoList);
    },
    emptyVideos({ commit }) {
      commit('EMPTY_VIDEOS');
    },
    //修改当前文件夹路径
    setFolderPath({ commit }, newFolderPath) {
      commit('SET_CURRENT_FOLDER_PATH', newFolderPath);
    },
    // 记忆文件树展开
    addExpandData({ commit }, newFolder) {
      commit('ADD_VIDEO_EXPAND_DATA', newFolder);
    },
    removeExpandData({ commit }, newFolderArr) {
      commit('REMOVE_VIDEO_EXPAND_DATA', newFolderArr);
    }
  }
};

export default videoStore;
