import fs from 'fs';
import path from 'path';
var sizeof = require('image-size');

export const trimSep = pathStr => {
  let trimPath = pathStr;
  if (pathStr.endsWith(path.sep)) {
    trimPath = pathStr.substring(0, pathStr.length - path.sep.length);
  }
  return trimPath;
};

// 格式化文件大小  根据范围转化单位
export const formatFileSize = fileSize => {
  if (fileSize < 1024) {
    return fileSize + 'B';
  } else if (fileSize < 1024 * 1024) {
    return (fileSize / 1024).toFixed(2) + 'KB';
  } else if (fileSize < 1024 * 1024 * 1024) {
    return (fileSize / (1024 * 1024)).toFixed(2) + 'MB';
  } else {
    return (fileSize / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
  }
};

// 获取文件尺寸
export const getFileSize = path => {
  try {
    return sizeof(path);
  } catch (e) {
    console.error(e.message);
    return {
      width: 'N/A',
      height: 'N/A'
    };
  }
};

// 获取格式化后的文件尺寸信息
export const getFormatFileSize = path => {
  return formatFileSize(getFileSize(path));
};

// 获取文件信息
export const getFileStat = filepath => {
  return new Promise((resolve, reject) => {
    fs.stat(filepath, (err, stats) => {
      if (err) return reject(err);
      return resolve(stats);
    });
  });
};
// 同步 获取文件信息
export const getFileStatSync = filepath => {
  return fs.statSync(filepath);
};

// 同步 读取文件内容
export const readFileSync = (filepath, arg = { encoding: 'utf-8' }) => {
  return fs.readFileSync(filepath, arg);
};

// 同步 写文件内容
export const writeFileSync = (filepath, data) => {
  return fs.writeFileSync(filepath, data, { encoding: 'utf-8' });
};

// 读取文件内容
export const readFile = filepath => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, buffer) => {
      if (err) return reject(err);
      return resolve(buffer);
    });
  });
};

// [异步] 读文件夹内文件列表（第一级目录下）
export const readDir = dir => {
  return new Promise((resolve, reject) => {
    try {
      fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK);
      fs.readdir(path.resolve(dir), (err, files) => {
        if (err) return reject(err);
        files = files || [];
        return resolve(files);
      });
    } catch (err) {
      console.error(`no access permissions! ${dir}`);
      return resolve([]);
    }
  });
};

// [同步] 检查是否为文件
export const isFile = file => {
  if (!isExist(file)) return false;
  const stat = fs.statSync(path.resolve(file));
  return stat.isFile();
};

// [同步] 检查是否为目录
export const isDirectory = dir => {
  if (!isExist(dir)) return false;
  const stat = fs.statSync(path.resolve(dir));
  return stat.isDirectory();
};

// [同步] 检查文件/目录是否存在
export const isExist = filePath => {
  return fs.existsSync(path.resolve(filePath.toString()));
};

// 路径后缀名
export const getExtname = (filepath, filterDot = false) => {
  const ext = path.extname(filepath).toLocaleLowerCase();
  if (filterDot && ext.length >= 2 && ext[0] === '.') {
    return ext.slice(1);
  }
  return ext;
};

export const watchFile = filePath => {
  return fs.watch(filePath);
};

/**
 *
 * @param {String} name
 * @returns Array
 */
const processName = name => {
  const processedName = [];
  let str = name;
  for (let i = 0; i < str.length; i++) {
    let isNum = Number.isInteger(Number(str[i]));
    let j;
    for (j = i + 1; j < str.length; j++) {
      if (Number.isInteger(Number(str[j])) != isNum) {
        break;
      }
    }
    processedName.push(isNum ? Number(str.slice(i, j)) : str.slice(i, j));
    i = j - 1;
  }
  // console.log(processedName);
  return processedName;
};

// 文件名排序
export const fileNameSort = (_a, _b) => {
  const a = processName(_a);
  const b = processName(_b);
  let len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] != b[i]) {
      let isNumA = Number.isInteger(a[i]);
      let isNumB = Number.isInteger(b[i]);
      if (isNumA && isNumB) {
        return a[i] - b[i];
      } else if (isNumA) {
        return -1;
      } else if (isNumB) {
        return 1;
      } else {
        return a[i] < b[i] ? -1 : 1;
      }
    }
  }
  // in case of one string being a prefix of the other
  return a.length - b.length;
};

// 文件名排序，优先级顺序为 数字 > 字母 > 中文
export const arraySortByName = (a, b) => {
  // 去除.jpg,.jpeg,.gif,.png等后缀名
  const reg = /\.(png|jpe?g|gif|webp|mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/;
  let strA = a.replace(reg, '');
  let strB = b.replace(reg, '');
  // 非法值排序优先级高
  if (
    strA === undefined ||
    strA === null ||
    strA === '' ||
    strA === ' ' ||
    strA === '　'
  ) {
    return -1;
  }
  if (
    strB === undefined ||
    strB === null ||
    strB === '' ||
    strB === ' ' ||
    strB === '　'
  ) {
    return 1;
  }
  let mB = strB.match(/\d+/g);
  let mA = strA.match(/\d+/g);
  // 全部都有数字
  if (mB && mA) {
    return parseInt(mB[mB.length - 1]) > parseInt(mA[mA.length - 1]) ? -1 : 1;
  }
  // 有一个有数字
  else if (mB || mA) {
    if (mB) {
      return 1;
    } else if (mA) {
      return -1;
    }
  }
  // 全都无数字
  else {
    // 如果a和b中全部都是汉字，或者全部都非汉字
    if (
      (strA.split('').every(char => notChinese(char)) &&
        strB.split('').every(char => notChinese(char))) ||
      (strA.split('').every(char => !notChinese(char)) &&
        strB.split('').every(char => !notChinese(char)))
    ) {
      return strA.localeCompare(strB);
    } else {
      const charAry = strA.split('');
      for (const i in charAry) {
        if (charCompare(strA[i], strB[i]) !== 0) {
          return charCompare(strA[i], strB[i]);
        }
      }
      // 如果通过上面的循环对比还比不出来，就无解了，直接返回-1
      return -1;
    }
  }
};

function charCompare(charA, charB) {
  // 非法值排序优先级高
  if (
    charA === undefined ||
    charA === null ||
    charA === '' ||
    charA === ' ' ||
    charA === '　'
  ) {
    return -1;
  }
  if (
    charB === undefined ||
    charB === null ||
    charB === '' ||
    charB === ' ' ||
    charB === '　'
  ) {
    return 1;
  }
  // 如果都为英文或者都为汉字则直接对比
  if (
    (notChinese(charA) && notChinese(charB)) ||
    (!notChinese(charA) && !notChinese(charB))
  ) {
    return charA.localeCompare(charB);
  } else {
    // 如果不都为英文或者汉字，就肯定有一个是英文，如果a是英文，返回-1，a在前，否则就是b是英文，b在前
    if (notChinese(charA)) {
      return -1;
    } else {
      return 1;
    }
  }
}

function notChinese(char) {
  const charCode = char.charCodeAt(0);
  return charCode >= 0 && charCode <= 128;
}
