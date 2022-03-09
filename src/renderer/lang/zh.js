export default {
  common: {
    supportTypes: '支持多种文件类型:',
    desc:
      'MegSpot是一款跨平台的本地应用，旨在为用户提供本地图片对比、视频对比、图片定制处理等便捷功能。\r\n可进入QQ交流群(782365536)了解详情、获取最新资讯。',
    manual: '使用手册',
    hotKey: '快捷键',
    showVideoTip: '查看演示'
  },
  nav: {
    toHome: '主菜单',
    back: '返回',
    feedback: '问题反馈'
  },
  general: {
    success: '成功',
    failure: '失败',
    canceled: '取消',
    layout: '布局',
    aboutText: '关于',
    introduction: `MegSpot是一款跨平台本地应用，旨在为用户提供本地图片比较，视频比较，图片定制化处理等便捷功能。\r\n进入钉钉群了解详情。`,
    videoPlay: '视频播放',
    videoCompare: '图片对比',
    compare: '对比',
    selected: '已选',
    language: '语言',
    import: '导入',
    export: '导出',
    videoProcessBarStyle: '视频控制条位置',
    fixed: '固定',
    float: '悬浮球',
    defaultFileListShowType: '文件列表的默认显示类型',
    list: '列表',
    thumbnail: '缩略图',
    fileName: '文件名',
    fileLoading: '加载文件中...',
    enableRegular: '启用/禁用正则',
    groupNum: '分组序号\nCtrl + ← 向前翻页\nCtrl + → 向后翻页',
    lastModifyTime: '最后修改时间',
    operate: '操作',
    size: '大小',
    scale: '缩放比例',
    sortDialogTips: 'tips:上下拖动可调整顺序',
    selectAll: '全部选择',
    clearAll: '全部清空',
    delete: '删除此项',
    showAll: '显示全部',
    history: '历史记录',
    dragDropCompare: '拖拽对比',
    imageBrowser: '图片查看器',
    imageList: '图片列表',
    videoList: '视频列表',
    imageFolderList: '图片目录列表',
    videoFolderList: '视频目录列表'
  },
  dashboard: {
    entries: {
      image: {
        title: '图片对比',
        desc:
          '图片查看对比器，可查看本地图片，支持缩放、移动、叠加显示等多种交互'
      },
      video: {
        title: '视频对比',
        desc: '视频查看，本地多条视频对比'
      },
      viewer: {
        title: '定制viewer',
        desc: '定制图片处理逻辑'
      }
    }
  },
  image: {
    toolbar: {
      openFolder: '打开文件夹',
      addFolder: '添加文件夹',
      imageQueue: '相册',
      cleanImageQueue: '清空相册'
    },
    folder: {
      loadingText: '文件夹资源获取中...'
    }
  },
  imagePreview: {},
  imageCenter: {
    bilinearInterpolation: '双线性',
    selectedMsg: '图片已选中，可单独操作',
    colorPicker: '取色器',
    nearestInterpolation: '最邻近',
    overlayLeft: '向左叠加显示',
    overlayRight: '向右叠加显示',
    overlayBottom: '向下叠加显示',
    overlayTop: '向上叠加显示',
    verticalFlip: '纵向翻转',
    horizontalFlip: '水平翻转翻转',
    fullsize: '原图',
    adaptive: '自适应',
    align: '对齐(大小不变)',
    align2: '对齐(大小相同)',
    helpText:
      '双击图片可激活目标容器实现单独缩放旋转等操作，单击图片描述信息可编辑',
    rotate: '旋转',
    generateGIF: '生成gif'
  },
  imageDragDropCompare: {
    hideLine: '隐藏比较线',
    displayLine: '显示比较线',
    tip: '默认情况下，比较已选的前两张图片。如需修改请打开已选进行切换。'
  },
  generateGIF: {
    title: '生成对比动态图GIF',
    image: '对比图',
    description: '描述',
    operation: '操作',
    tips: {
      wait: '生成时间可能较长，请耐心等待',
      saved: 'GIF文件保存成功！',
      finished: 'GIF生成成功！',
      tooSmallNumber: '已选择图片的数量过少！'
    }
  },
  video: {
    speed: '播放速度',
    loop: '循环播放',
    play: '播放',
    pause: '暂停',
    reset: '复位'
  },
  sortFile: {
    apply: '应用',
    edit: '编辑',
    generate: '生成',
    generateTip: '点击即可在当前目录下生成.MegSpotSort.ini排序配置文件',
    sortFile: '排序文件',
    useTableFileList: '应用当前表格排序'
  }
};
