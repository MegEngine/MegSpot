import * as GLOBAL_CONSTANT from '../../constants'
import { trimSep } from '@/utils/file'

const imageStore = {
  namespaced: true,
  state: {
    imageFolders: [],
    imageList: [],
    imageConfig: {
      smooth: true,
      layout: GLOBAL_CONSTANT.LAYOUT_2X1,
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
    imageList: (state) => state.imageList,
    imageFolders: (state) => state.imageFolders,
    getImageFolders: (state) => () => state.imageFolders,
    imageConfig: (state) => state.imageConfig,
    currentPath: (state) => state.currentPath,
    expandData: (state) => state.expandData
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
    // 记忆文件树展开情况
    ADD_IMAGE_EXPAND_DATA: (state, newOpenFolder) => {
      state.expandData.push(newOpenFolder)
    },
    REMOVE_IMAGE_EXPAND_DATA: (state, closeFolder) => {
      state.expandData = state.expandData.filter((item) => {
        return !item.startsWith(closeFolder)
      })
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
    // 记忆文件树展开
    addExpandData({ commit }, newFolder) {
      commit('ADD_IMAGE_EXPAND_DATA', newFolder)
    },
    removeExpandData({ commit }, newFolderArr) {
      commit('REMOVE_IMAGE_EXPAND_DATA', newFolderArr)
    }
  }
}

export default imageStore
