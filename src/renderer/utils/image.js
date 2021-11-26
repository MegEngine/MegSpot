import { readFileSync, formatFileSize, getFileStat, getFileSize } from './file';
import { NO_CACHE_FILE_PROTOCOL } from '@/constants';
export const getImageUrlSync = path => {
  return 'file://' + path;
};
export const getImageUrlSyncNoCache = path => {
  return `${NO_CACHE_FILE_PROTOCOL}://${path}`;
};
export const getImageType = str => {
  var reg = /\.(png|jpg|gif|jpeg|webp)$/;
  return str.match(reg)[1];
};
export const getImageContent = path => {
  const binary = readFileSync(path, 'binary');
  const buffer = new Buffer(binary, 'binary');
  const base64 = buffer.toString('base64');
  return 'data: image/' + getImageType(path) + ';base64,' + base64;
};
// 获取图片信息
export const getImageInfo = async path => {
  const fileInfo = await getFileStat(path).catch(err => {
    throw err;
  });
  return fileInfo;
};

// 获取图片基本信息
export const getImageBasicInfo = async path => {
  const fileInfo = await getImageInfo(path);
  const fileSize = await getFileSize(path);
  return {
    size: formatFileSize(fileInfo.size),
    height: fileSize.height,
    width: fileSize.width
  };
};

// 批量获取image信息  包括url 尺寸等
export const getImageInfoMulti = paths => {
  const res = [];
  const index = 0;
  return new Promise((resolve, reject) => {
    function getInfo(index) {
      const path = paths[index];
      getImageUrl(path, async url => {
        const image = await getImageBasicInfo(path).catch(err => reject(err));
        image.url = url;
        image.path = path;
        res.push(image);
        index++;
        if (index < paths.length) {
          getInfo(index);
        } else {
          resolve(res);
        }
      });
    }
    getInfo(index);
  });
};
