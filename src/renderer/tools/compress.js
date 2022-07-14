import OSpath from 'path';
import JSZip from 'jszip';
import fse from 'fs-extra';
import { saveAs } from 'file-saver';
import { getFilePath } from '@/utils/file';
import { isImage } from '@/components/file-tree/lib/util';

export const SHARE_FILE_NAME = '.MegSpotShare.ini';
export const SHARE_ZIP_EXT = 'megspot';
export const SHARE_ZIP_NAME = 'MegSpotShare.' + SHARE_ZIP_EXT;
export const TEMP_PATH = '/tmp/megspot';

export class SnapshotHelper {
  zipInstance;
  validator;
  constructor() {}
  // 保存为MegSpot快照文件
  async save(config, files) {
    if (!this.zipInstance) {
      this.zipInstance = new JSZip();
    }
    this.zipInstance.file(SHARE_FILE_NAME, JSON.stringify(config, null, 4));
    // console.log('save', { config, files });
    files.forEach(({ name, fileData }) => {
      this.zipInstance.file(name, fileData, { binary: true });
    });
    this.zipInstance.generateAsync({ type: 'blob' }).then(content => {
      // console.log(content, content.type);
      saveAs(content, SHARE_ZIP_NAME);
    });
  }
  // 读取MegSpot工程文件[,并解压]
  async load(path) {
    if (!this.validator) {
      this.validator = new JSZip();
    }
    if (!path) {
      path = await getFilePath();
    }
    if (!path) {
      console.error('invalid path', path);
      return false;
    }
    const files = await this.validate(path);
    if (!files) {
      console.error('invalid MegSpot project file!', files);
      return false;
    }
    try {
      await fse.ensureDir(TEMP_PATH);
      return await this.decompress(path, files, 'binary');
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  // 验证文件是否为MegSpot工程文件
  async validate(path) {
    const data = await fse.readFile(path);
    const zipPackage = await this.validator.loadAsync(data);
    const { files } = zipPackage;
    const keys = Object.keys(files);
    // .map(key => files[key].unsafeOriginalName || files[key].name);
    const configFileIndex = keys.findIndex(name => name === SHARE_FILE_NAME);
    if (configFileIndex === -1 || keys.length < 2) {
      console.error('invalid MegSpot project file!');
      return false;
    }
    return files;
  }
  // 解压缩快照文件
  async decompress(snapPath, files, encoding = 'utf8') {
    try {
      const keys = Object.keys(files);
      const res = { config: {}, files: [] };
      const configKey = keys.find(key => files[key].name === SHARE_FILE_NAME);
      if (configKey) {
        const arraybuffer = await files[configKey].async('arraybuffer');
        const buffer = Buffer.from(arraybuffer);
        res.config = JSON.parse(buffer.toString('utf8'));
        res.config.snapPath = snapPath;
        keys.splice(configKey, 1);
      }
      let posConfigs = res.config?.canvas;
      for (const key of keys) {
        const file = files[key];
        if (file.dir) {
          fse.ensureDir(file.name);
        } else if (isImage(file.name)) {
          // const path = OSpath.resolve(TEMP_PATH, file.name);
          // console.log('path', path);
          // await fse.writeFile(path, buffer, encoding);
          // res.files.push(path);
          // if (file.name === SHARE_FILE_NAME) {
          //   console.log(SHARE_FILE_NAME, JSON.parse(buffer.toString('utf8')));
          // }
          const { blob, objectURL } = await this.getImageData(file);
          // console.log('imageData(blob)', objectURL, blob);
          const fileObj = {
            name: file.name,
            path: objectURL,
            imageData: blob
          };
          const posConfig = posConfigs?.find(
            config => config.name === file.name
          );
          if (posConfig) {
            Object.assign(fileObj, posConfig);
          }
          res.files.push(fileObj);
        }
      }
      // delete img position info in config
      if (res.config.canvas) delete res.config.canvas;
      console.log('decompress success! path:', OSpath.resolve(TEMP_PATH));
      return res;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  // BufferArray转换为ImageData, bufferArray -> blob -> objectURL -> canvas -> imgData
  async getImageData(file) {
    return new Promise(async (resolve, reject) => {
      try {
        const buffer = Buffer.from(await file.async('arraybuffer'));
        const blob = new Blob([buffer]);
        const objectURL = URL.createObjectURL(blob);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          // console.log('img', img, img.width, img.height);
          // document.getElementById('image-container').appendChild(img);
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          // console.log('imageData', imageData);
          resolve({
            buffer,
            blob,
            objectURL,
            canvas,
            imageData
          });
        };
        img.src = objectURL;
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  }
}
