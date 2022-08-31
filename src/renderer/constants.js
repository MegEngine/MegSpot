import path from 'path'
import os from 'os'

export const DELIMITER = path.sep // 分割符
export const EOF = os.EOL // 换行符
export const SORTING_FILE_NAME = '.MegSpotSort.ini'
export const DIRECTION_LEFT = 'direction_left'
export const DIRECTION_RIGHT = 'direction_right'
export const DIRECTION_BOTTOM = 'direction_bottom'
export const DIRECTION_TOP = 'direction_top'

export const LAYOUT_1X1 = '1x1'
export const LAYOUT_2X1 = '2x1'
export const LAYOUT_3X1 = '3x1'
export const LAYOUT_4X1 = '4x1'
export const LAYOUT_2X2 = '2x2'
export const LAYOUT_3X2 = '3x2'

export const SCALE_CONSTANTS = 1 / 6
export const DRAG_CONSTANTS = 1 / 4

export const VIEWER_DEFAULT_CMD_TEMPLATE = '/usr/local/bin/python3 ${viewer} ${config}'
export const VIEWER_DEFAULT_OUTPUT_PATH = '${viewerPath}'

export const NO_CACHE_FILE_PROTOCOL = 'no-cache-file'

export const SHARE_FILE_NAME = '.MegSpotShare.ini'
export const SHARE_ZIP_NAME = 'MegSpotShare.zip'

export const SHARE_PROJECT_DEFAULT_PROPS = () => ({
  name: '',
  snapPath: '',
  config: {
    imageStore: {
      imageConfig: {
        layout: LAYOUT_2X1,
        smooth: true
      }
    },
    videoStore: {
      videoConfig: {
        layout: LAYOUT_2X1,
        smooth: true
      }
    },
    preferenceStore: {
      // appLanguage: 'en',
      showTitle: true,
      background: {
        mode: 'default',
        style:
          'background: #e3e7e9; background-image: linear-gradient(45deg, #f6fafc 25%, transparent 0), linear-gradient(45deg, transparent 75%, #f6fafc 0), linear-gradient(45deg, #f6fafc 25%, transparent 0), linear-gradient(45deg, transparent 75%, #f6fafc 0); background-position: 0 0, 10px 10px, 10px 10px, 20px 20px; background-size: 20px 20px;'
      },
      scaleOptions: [4, 2, 1, 0.5, 0.25],
      // 是否默认显示直方图
      defaultShowHist: false
      // 列表显示模式 list(列表表格) / thumbnail(缩略图列表)
      // defaultFileListShowType: 'list'
    }
  },
  canvas: []
})

export const SHARE_CANVAS_DEFAULT_PROPS = () => ({
  // oldPath: '',
  name: '', // directory + "-" + filename
  // xOffsetRation: 0,
  // yOffsetRation: 0,
  // withRatio: 1,
  // heightRatio: 1,
  _width: 0,
  _height: 0,
  imagePosition: {},
  radius: 10,
  imgScale: '1'
})
