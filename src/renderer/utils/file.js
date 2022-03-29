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
