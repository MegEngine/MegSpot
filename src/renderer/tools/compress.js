import JSZip from 'jszip';

export const SHARE_FILE_NAME = '.MegSpotShare.ini';
export const SHARE_ZIP_NAME = 'MegSpotShare.zip';

export const SHARE_PROJECT_DEFAULT_PROPS = () => ({
  name: '',
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
});

export const SHARE_CANVAS_DEFAULT_PROPS = () => ({
  // oldPath: '',
  name: '', // directory + "-" + filename
  xOffsetRation: 0,
  yOffsetRation: 0,
  withRatio: 1,
  heightRatio: 1,
  radius: 10,
  imgScale: '1'
});

export class MegSpotProject {
  zip;
  content;
  constructor(content) {
    this.zip = new JSZip();
    this.content = content;
  }
  compress() {}
  decompress() {}
  validate() {}
}
