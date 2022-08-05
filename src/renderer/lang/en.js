export default {
  common: {
    supportTypes: 'Support file types:',
    desc:
      'MegSpot is a cross-platform native application designed to provide users with convenient functions such as picture comparison, video comparison. \r\nYou can enter the QQ group(782365536) to learn more and get the latest information.',
    manual: 'manual',
    hotKey: 'hotKey',
    please: 'please',
    reset: 'Reset',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    showVideoTip: 'show help videos'
  },
  nav: {
    toHome: 'Home',
    back: 'Back',
    feedback: 'Feedback'
  },
  general: {
    success: 'success',
    failure: 'failure',
    canceled: 'canceled',
    layout: 'layout',
    aboutText: 'about',
    introduction:
      'MegSpot is a cross-platform local application designed to provide users with convenient functions such as local picture comparison, video comparison, and picture customization processing.\r\nEnter Dingding Group for details.',
    videoPlay: 'video play',
    videoCompare: 'image compare',
    compare: 'compare',
    selected: 'selected',
    language: 'Language',
    import: 'import',
    export: 'export',
    videoProcessBarStyle: 'Video Control Bar Position',
    fixed: 'fixed',
    float: 'floating ball',
    defaultFileListShowType: 'Default Show Type of File List',
    list: 'list',
    share: 'share',
    shareAsProject: 'Create snapshot file for sharing',
    show: 'show',
    hide: 'hide',
    histogram: 'histogram',
    thumbnail: 'thumbnail',
    fileName: 'file name',
    fileLoading: 'Loading files...',
    enableRegular: 'Enable/Disable Regular',
    groupNum: 'group number\nCtrl + ← page backword\nCtrl + → page forward',
    lastModifyTime: 'lastModifyTime',
    operate: 'operate',
    size: 'size',
    scale: 'scale',
    sortDialogTips: 'tips:drag to change order',
    selectAll: 'select all',
    clearAll: 'unselect all',
    delete: 'delete this item',
    showAll: 'show all',
    history: 'history log',
    dragDropCompare: 'drag&drop compare',
    imageBrowser: 'image browser',
    imageList: 'Image List',
    videoList: 'Video List',
    invalidFolderTip: 'Folder does not exist,please input valid path',
    imageFolderList: 'Image Folder List',
    videoFolderList: 'Video Folder List'
  },
  hotkey: {
    desc: 'description',
    key: 'shortcut keys',
    gotoCompare: 'Jump to the comparison page',
    emptyAll: 'Empty all selected images or videos',
    back: 'Go back to the file selection page',
    gallery: 'Open/close image gallery',
    previousGroup: 'Previous group',
    nextGroup: 'Next group',
    previousFrame: 'Previous Frame',
    nextFrame: 'Next frame',
    togglePlay: 'Play/Pause video',
    top: 'Overlay contrast up',
    left: 'Overlay contrast to the left',
    right: 'Overlay contrast to the right',
    bottom: 'Overlay down the contrast',
    pickColor: 'Turn on/off the color picker'
  },
  dashboard: {
    entries: {
      image: {
        title: 'IMAGE',
        desc: 'Image viewer,support to view and compare local pictures'
      },
      video: {
        title: 'VIDEO',
        desc: 'video viewer,support to view and compare local video'
      },
      viewer: {
        title: 'VIEWER',
        desc: 'create your viewer with custom image processing logic'
      }
    }
  },
  image: {
    toolbar: {
      openFolder: 'Open Folder',
      openFolderTip: 'Open the directory in the system file resource manager',
      addFolder: 'Add Folder',
      addCurrentDirectory: 'Add Current Directory',
      loadShareProject: 'Load Snapshot',
      snapshotGenerating: 'snapshot is generating',
      snapshotGenerated: 'The snapshot has been generated, please save it locally',
      resetPosition: 'reset snapshot',
      resetPositionTip: 'Reset to snapshot original position',
      export: 'Export',
      exportTip: 'Export the original image file of the snapshot',
      imageQueue: 'Image List',
      cleanImageQueue: 'clean list'
    },
    folder: {
      loadingText: 'loading resource...'
    }
  },
  imagePreview: {},
  imageCenter: {
    bilinearInterpolation: 'bilinar',
    shortSelectedMsg: 'selected',
    selectedMsg:
      'The picture has been selected and can be operated individually',
    colorPicker: 'color picker',
    region: 'size of color picker',
    nearestInterpolation: 'nearest',
    overlayLeft: 'overlay left',
    overlayRight: 'overlay right',
    overlayBottom: 'overlay bottom',
    overlayTop: 'overlay top',
    verticalFlip: 'vertical flip',
    frameStep: 'the interval of Frame Compare',
    frameSteps1: 'Compare video frame by frame\nplay forward: Cmd/Ctrl + b',
    frameSteps2: 'Compare video frame by frame\nplay backward: Cmd/Ctrl + n',
    horizontalFlip: 'horizontal flip',
    fullsize: 'fullsize',
    adaptive: 'adaptive',
    align: 'align(size not changes)',
    align2: 'align(same size)',
    helpText:
      'Double-click the picture to activate the target container to achieve a single operation, click the picture description to edit',
    rotate: 'rotate',
    generateGIF: 'generate GIF'
  },
  imageDragDropCompare: {
    hideLine: 'hide comparison line',
    displayLine: 'display comparison line',
    tip:
      'By default, the first two pictures that have been selected are compared. If you need to modify, please open the selected to switch.'
  },
  generateGIF: {
    title: 'title',
    image: 'image',
    description: 'description',
    operation: 'operation',
    tips: {
      wait: 'The generation time may take tens of seconds, please be patient',
      saved: 'gif file saved successfully',
      finished: 'gif generation successfully finished!',
      tooSmallNumber: 'The number of selected images is too small!'
    }
  },
  video: {
    speed: 'speed',
    loop: 'loop',
    play: 'play',
    pause: 'pause',
    reset: 'reset',
    muted: 'muted',
    fullscreen: 'fullscreen\nESC exit fullscreen',
    dynamicPickColor: 'dynamic color picker',
    minRenderInterval: 'min-interval of video rendering',
    processTip:
      'Left click to show/hide video progress bar, right click to show/hide precise control component of video progress'
  },
  sortFile: {
    apply: 'Apply',
    addFolder: 'add folder',
    afterAddFolder: 'and select one',
    edit: 'Custom file sorting configuration',
    generate: 'Generate',
    generateTip:
      'Click to generate the .MegSpotSort.ini sorting configuration file in the current directory',
    sortFile: ' Sorting File',
    useTableFileList: 'Apply current table sorting list',
    clearSortList: 'Clear SortList',
    useDefaultSort: 'Default Sort',
    defaultSortTip: 'sort files by name'
  },
  gallery: {
    clear: 'Clear',
    enableNameSort: 'Sort by name',
    enableNameSortTip: 'Whether to sort by name',
    smartSort: 'Smart Sort',
    smartSortTip:
      'files with the same name in different folders are sorted together for easy comparison'
  }
};
