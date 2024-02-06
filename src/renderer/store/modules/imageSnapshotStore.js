import * as GLOBAL_CONSTANT from '../../constants'
import { trimSep } from '@/utils/file'

const imageSnapshotStore = {
  namespaced: true,
  state: {
    imageFolders: [],
    imageList: [],
    imageConfig: {
      smooth: true,
      layout: GLOBAL_CONSTANT.LAYOUT_1x2,
      defaultSort: {
        order: 'asc',
        field: 'name'
      }
    },
    //当前文件夹路径
    currentPath: '',
    preference: {
      // appLanguage: 'en',
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
      defaultFileListShowType: 'list'
      // // 视频控制条位置 fixed(固定在toolbar) / float (悬浮球)
      // videoProcessBarStyle: 'fixed'
    },
    snapshotConfig: {},
    files: []
  },
  getters: {
    imageList: (state) => state.imageList,
    imageFolders: (state) => state.imageFolders,
    getImageFolders: (state) => () => state.imageFolders,
    imageConfig: (state) => state.imageConfig,
    currentPath: (state) => state.currentPath,
    preference: (state) => state.preference,
    snapshotConfig: (state) => state.snapshotConfig,
    files: (state) => state.files
  },
  mutations: {
    SET_IMAGE_CONFIG: (state, configOb) => {
      const newConfig = Object.assign({}, state.imageConfig, configOb)
      state.imageConfig = newConfig
    },
    SET_IMAGE_FOLDERS: (state, folders) => {
      state.imageFolders = folders.map(trimSep)
    },
    ADD_IMAGE_FOLDER: (state, folder) => {
      if (!state.imageFolders.includes(trimSep(folder))) {
        const tmp = [...state.imageFolders]
        tmp.push(folder)
        state.imageFolders = tmp
      }
    },
    REMOVE_IMAGE_FOLDER: (state, folder) => {
      if (state.imageFolders.includes(trimSep(folder))) {
        const tmp = [...state.imageFolders]
        tmp.splice(state.imageFolders.indexOf(folder), 1)
        state.imageFolders = tmp
      }
    },
    ADD_IMAGE: (state, image) => {
      if (image && !state.imageList.includes(image)) {
        state.imageList = [...state.imageList, image]
      }
    },
    ADD_IMAGES: (state, images) => {
      if (images && images.length) {
        state.imageList = [...new Set(state.imageList.concat(images))]
      }
    },
    REMOVE_IMAGES: (state, images) => {
      const tmp = [...state.imageList]
      images.forEach((image) => {
        let index = tmp.indexOf(image)
        if (index > -1) {
          tmp.splice(index, 1)
        }
      })
      state.imageList = tmp
    },
    SET_IMAGES: (state, newImageList) => {
      state.imageList = newImageList
    },
    EMPTY_IMAGE: (state) => {
      state.imageList = []
    },
    // 修改当前文件夹
    SET_CURRENT_FOLDER_PATH: (state, newFolderPath) => {
      state.currentPath = newFolderPath
    },
    SET_PREFERENCE: (state, newPreOb) => {
      const newPreference = Object.assign({}, state.preference, newPreOb)
      state.preference = newPreference
    },
    SET_SNAPSHOT_CONFIG: (state, newConfig) => {
      const newConfigObj = Object.assign({}, state.snapshotConfig, newConfig)
      state.snapshotConfig = newConfigObj
    },
    SET_FILES: (state, newFiles) => {
      state.files = newFiles
    }
  },
  actions: {
    setImageConfig({ commit }, config) {
      commit('SET_IMAGE_CONFIG', config)
    },
    setImageFolders({ commit }, folders) {
      commit('SET_IMAGE_FOLDERS', folders)
    },
    addImageFolders({ commit }, folders) {
      if (!Array.isArray(folders)) {
        commit('ADD_IMAGE_FOLDER', folders)
      } else {
        folders.forEach((item) => commit('ADD_IMAGE_FOLDER', item))
      }
    },
    removeImageFolders({ commit }, folders) {
      if (!Array.isArray(folders)) {
        commit('REMOVE_IMAGE_FOLDER', folders)
      } else {
        folders.forEach((item) => commit('REMOVE_IMAGE_FOLDER', item))
      }
    },
    addImages({ commit }, images) {
      if (!Array.isArray(images)) {
        commit('ADD_IMAGE', images)
      } else {
        commit('ADD_IMAGES', images)
      }
    },
    removeImages({ commit }, images) {
      commit('REMOVE_IMAGES', Array.isArray(images) ? images : [images])
    },
    setImages({ commit }, newImageList) {
      commit('SET_IMAGES', newImageList)
    },
    emptyImages({ commit }) {
      commit('EMPTY_IMAGE')
    },
    //修改当前文件夹路径
    setFolderPath({ commit }, newFolderPath) {
      commit('SET_CURRENT_FOLDER_PATH', newFolderPath)
    },
    setPreference({ commit }, newPreOb) {
      commit('SET_PREFERENCE', newPreOb)
    },
    setSnapshotConfig({ commit }, newConfig) {
      commit('SET_SNAPSHOT_CONFIG', newConfig)
    },
    setFiles({ commit }, newFiles) {
      commit('SET_FILES', newFiles)
    }
  }
}

export default imageSnapshotStore
