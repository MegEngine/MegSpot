import path from 'path';
import { DEF } from './consts.js';
import { readDir, getExtname, isDirectory, isFile } from '@/utils/file';

// 不去进一步解析的文件夹  node_modules->黑洞
const folderBlackList = ['node_modules'];

const getId = () => {
  return new Date().getTime();
};

const getFileIcon = (fileIcons, filePath) => {
  const ext = getExtname(filePath);
  if (fileIcons[ext] && fileIcons[ext].name && fileIcons[ext].color) {
    return fileIcons[ext];
  } else {
    return fileIcons['*'];
  }
};

/**
 * @function 递归地遍历文件目录，返回所有文件清单
 * @param {String} dir 文件目录
 * @param {Object} options 可选
 *                 - options.include: 只包含include中的文件 ['.xy', '.a', ... ]
 *                 - options.hiddenFiles: 隐藏.开头的文件
 *                 - options.onlyDir: boolean 默认false 是否你返回文件夹目录
 */
const listDir = async (dir, fileIcons, options = {}) => {
  if (!(options && typeof options === 'object')) {
    throw new Error('Invalid options');
  }
  if (!isDirectory(dir)) throw new Error(`Invalid directory: ${dir}`);

  const include =
    Array.isArray(options.include) && options.include.length > 0
      ? options.include
      : null;
  const hiddenFiles =
    typeof options.hiddenFiles === 'boolean' ? options.hiddenFiles : true;
  const onlyDir =
    typeof options.onlyDir === 'boolean' ? options.onlyDir : false;
  const dirData = {
    id: getId(),
    label: options.name || path.basename(dir),
    path: path.resolve(dir),
    type: DEF.TYPE_DIRECTORY,
    hovering: false,
    children: []
  };

  let files = await readDir(dir).catch(err => {
    throw err;
  });
  if (hiddenFiles) {
    files = files.filter(item => !item.startsWith('.'));
  }

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.resolve(dir, filename);
    if (isDirectory(filePath)) {
      if (!folderBlackList.includes(filename)) {
        dirData.children.push(filePath);
      }
    } else if (!onlyDir && isFile(filePath)) {
      if (include && !include.includes(getExtname(filePath))) continue;
      dirData.children = dirData.children || [];
      dirData.children.push({
        id: getId(),
        label: filename,
        path: filePath,
        type: DEF.TYPE_FILE,
        icon: getFileIcon(fileIcons, filePath)
      });
    }
  }
  if (!dirData.children.length) {
    dirData.isLeaf = true;
  }
  dirData.children.sort((a, b) => {
    return a.type - b.type;
  });
  return dirData;
};

export { listDir };
