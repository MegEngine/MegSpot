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

const imageStore = {
  namespaced: true,
  state: {
    imageFolders: [],
    imageList: [],
    collections: [
      {
        name: GLOBAL_CONSTANT.DEFAULT_IMAGE_COLLECTION_NAME,
        type: 'file', // file / url / function
        list: []
      }
    ],
    collectionName: GLOBAL_CONSTANT.DEFAULT_IMAGE_COLLECTION_NAME,
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
    imageList: (state) => {
      const collection = useCurrentCollection(state)
      return collection.list
    },
    collection: (state) => {
      const collection = useCurrentCollection(state)
      return collection
    },
    collections: (state) => state.collections,
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
      const collection = useCurrentCollection(state)
      if (image && !collection.list.includes(image)) {
        collection.list = [...collection.list, image]
      }
    },
    ADD_IMAGES: (state, images) => {
      const collection = useCurrentCollection(state)
      if (images && images.length) {
        collection.list = [...new Set(collection.list.concat(images))]
      }
    },
    REMOVE_IMAGES: (state, images) => {
      const collection = useCurrentCollection(state)
      const tmp = [...collection.list]
      images.forEach((image) => {
        let index = tmp.indexOf(image)
        if (index > -1) {
          tmp.splice(index, 1)
        }
      })
      collection.list = tmp
    },
    SET_IMAGES: (state, newImageList) => {
      const collection = useCurrentCollection(state)
      collection.list = newImageList
    },
    EMPTY_IMAGE: (state) => {
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
        state.collectionName = GLOBAL_CONSTANT.DEFAULT_IMAGE_COLLECTION_NAME
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
      if (collectionName === GLOBAL_CONSTANT.DEFAULT_IMAGE_COLLECTION_NAME) {
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
      commit('ADD_IMAGE_EXPAND_DATA', newFolder)
    },
    removeExpandData({ commit }, newFolderArr) {
      commit('REMOVE_IMAGE_EXPAND_DATA', newFolderArr)
    }
  }
}

export default imageStore
