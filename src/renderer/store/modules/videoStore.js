import * as GLOBAL_CONSTANT from '../../constants'
import { trimSep } from '@/utils/file'

export const useCurrentCollection = (state) => {
  let collection = state.collections.find((collection) => collection.name === state.collectionName)
  if (!collection) {
    collection = {
      name: state.collectionName,
      type: 'file',
      list: []
    }
    state.collections.push(collection)
  }
  return collection
}

const videoStore = {
  namespaced: true,
  state: {
    videoList: [],
    videoFolders: [],
    collections: [
      {
        name: GLOBAL_CONSTANT.DEFAULT_VIDEO_COLLECTION_NAME,
        type: 'file', // file / url / function
        list: []
      }
    ],
    collectionName: GLOBAL_CONSTANT.DEFAULT_VIDEO_COLLECTION_NAME,
    videoConfig: {
      smooth: true,
      speed: 1.0,
      currentTime: 0,
      dynamicPickColor: false,
      layout: GLOBAL_CONSTANT.LAYOUT_1x2,
      allVideoPaused: true, // 所有视频都为暂停状态
      enableSyncTime: true, // 启用视频进度同步
      minRenderInterval: 0.01, // 视频最小渲染间隔，
      // interval: 0.0833, // 视频逐帧对比间隔，默认为近似1/12秒
      muted: true, // 视频是否静音
      defaultSort: {
        order: 'asc',
        field: 'name'
      }
    },
    //当前文件夹路径
    currentPath: '',
    // 记忆文件树展开
    expandData: []
  },
  getters: {
    videoList: (state) => {
      const collection = useCurrentCollection(state)
      return collection.list
    },
    collection: (state) => {
      const collection = useCurrentCollection(state)
      return collection
    },
    collections: (state) => state.collections,
    currentTime: (state) => state.currentTime,
    videoFolders: (state) => state.videoFolders,
    getVideoFolders: (state) => () => state.videoFolders,
    videoConfig: (state) => state.videoConfig,
    currentPath: (state) => state.currentPath,
    expandData: (state) => state.expandData
  },
  mutations: {
    SET_VIDEO_CONFIG: (state, configOb) => {
      Object.assign(state.videoConfig, configOb)
    },
    SET_VIDEO_FOLDERS: (state, folders) => {
      state.videoFolders = folders.map(trimSep)
    },
    ADD_VIDEO_FOLDER: (state, folder) => {
      if (!state.videoFolders.includes(trimSep(folder))) {
        const tmp = [...state.videoFolders]
        tmp.push(folder)
        state.videoFolders = tmp
      }
    },
    REMOVE_VIDEO_FOLDER: (state, folder) => {
      if (state.videoFolders.includes(trimSep(folder))) {
        const tmp = [...state.videoFolders]
        tmp.splice(state.videoFolders.indexOf(folder), 1)
        state.videoFolders = tmp
      }
    },
    ADD_VIDEO: (state, video) => {
      const collection = useCurrentCollection(state)
      if (!collection.list.includes(video)) {
        collection.list = [...collection.list, video]
      }
    },
    ADD_VIDEOS: (state, videos) => {
      if (videos.length) {
        const collection = useCurrentCollection(state)
        collection.list = [...new Set(collection.list.concat(videos))]
      }
    },
    REMOVE_VIDEO: (state, video) => {
      const collection = useCurrentCollection(state)
      if (collection.list.includes(video)) {
        const tmp = [...collection.list]
        tmp.splice(collection.list.indexOf(video), 1)
        collection.list = tmp
      }
    },
    SET_VIDEOS: (state, newVideoList) => {
      const collection = useCurrentCollection(state)
      collection.list = [...newVideoList]
    },
    EMPTY_VIDEOS: (state) => {
      const collection = useCurrentCollection(state)
      collection.list = []
    },
    ADD_COLLECTION: (state, newCollection) => {
      const collection = state.collections.find((collection) => collection.name === newCollection.name)
      if (!collection) {
        state.collections = [...state.collections, newCollection]
      }
    },
    REMOVE_COLLECTION: (state, collectionName) => {
      const tmpList = [...state.collections]
      const collectionIndex = tmpList.findIndex((collection) => collection.name === collectionName)
      if (collectionIndex > -1) {
        tmpList.splice(collectionIndex, 1)
        state.collections = tmpList
      }
    },
    REMOVE_TMP_COLLECTION: (state) => {
      const collection = state.collections.find((collection) => collection.name === state.collectionName)
      if (collection && collection.isTmp) {
        state.collectionName = GLOBAL_CONSTANT.DEFAULT_VIDEO_COLLECTION_NAME
      }
      const tmpList = [...state.collections.filter((collection) => !collection.isTmp)]
      state.collections = tmpList
    },
    SET_COLLECTION_NAME: (state, newCollectionName) => {
      state.collectionName = newCollectionName
    },
    // 修改当前文件夹
    SET_CURRENT_FOLDER_PATH: (state, newFolderPath) => {
      state.currentPath = newFolderPath
    },
    // 记忆文件树展开情况
    ADD_VIDEO_EXPAND_DATA: (state, newOpenFolder) => {
      state.expandData.push(newOpenFolder)
    },
    REMOVE_VIDEO_EXPAND_DATA: (state, closeFolder) => {
      state.expandData = state.expandData.filter((item) => {
        return !item.startsWith(closeFolder)
      })
    }
  },
  actions: {
    setVideoConfig({ commit }, config) {
      commit('SET_VIDEO_CONFIG', config)
    },
    setVideoFolders({ commit }, folders) {
      commit('SET_VIDEO_FOLDERS', folders)
    },
    addVideoFolders({ commit }, folders) {
      if (!Array.isArray(folders)) {
        commit('ADD_VIDEO_FOLDER', folders)
      } else {
        folders.forEach((item) => commit('ADD_VIDEO_FOLDER', item))
      }
    },
    removeVideoFolders({ commit }, folders) {
      if (!Array.isArray(folders)) {
        commit('REMOVE_VIDEO_FOLDER', folders)
      } else {
        folders.forEach((item) => commit('REMOVE_VIDEO_FOLDER', item))
      }
    },
    addVideos({ commit }, videos) {
      if (!Array.isArray(videos)) {
        commit('ADD_VIDEO', videos)
      } else {
        commit('ADD_VIDEOS', videos)
      }
    },
    removeVideos({ commit }, video) {
      if (!Array.isArray(video)) {
        commit('REMOVE_VIDEO', video)
      } else {
        video.forEach((item) => commit('REMOVE_VIDEO', item))
      }
    },
    setVideos({ commit }, newVideoList) {
      commit('SET_VIDEOS', newVideoList)
    },
    emptyVideos({ commit }) {
      commit('EMPTY_VIDEOS')
    },
    addCollection({ commit }, _newCollection) {
      const newCollection = Object.assign(
        {
          name: '_newCollection',
          type: 'file',
          list: []
        },
        _newCollection
      )
      commit('ADD_COLLECTION', newCollection)
    },
    removeCollection({ commit }, collectionName) {
      if (collectionName === GLOBAL_CONSTANT.DEFAULT_VIDEO_COLLECTION_NAME) {
        console.log('cannot remove default image collection')
        return
      }
      commit('REMOVE_COLLECTION', collectionName)
    },
    removeTmpCollection({ commit }) {
      commit('REMOVE_TMP_COLLECTION')
    },
    setCollectionName({ commit }, newCollectionName) {
      commit('SET_COLLECTION_NAME', newCollectionName)
    },
    //修改当前文件夹路径
    setFolderPath({ commit }, newFolderPath) {
      commit('SET_CURRENT_FOLDER_PATH', newFolderPath)
    },
    // 记忆文件树展开
    addExpandData({ commit }, newFolder) {
      commit('ADD_VIDEO_EXPAND_DATA', newFolder)
    },
    removeExpandData({ commit }, newFolderArr) {
      commit('REMOVE_VIDEO_EXPAND_DATA', newFolderArr)
    }
  }
}

export default videoStore
