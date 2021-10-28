import store from '../store';
import { Message } from 'element-ui';
import { isDirectory } from './file';
import { i18nRender } from '@/lang';

const {
  'imageStore/getImageFolders': getImageFolders,
  'videoStore/getVideoFolders': getVideoFolders
} = store.getters;
const [addImageFolders, addVideoFolders] = [
  'imageStore/addImageFolders',
  'videoStore/addVideoFolders'
];
const titles = ['imageFolderList', 'videoFolderList'];

/**
 * 给某一元素添加拖放文件目录的监听器
 * @param {HTMLDivElement} elementDom 将要添加监听器的元素
 * @param {boolean} isImageList 默认为true 即添加图片文件目录，主动设为false 则添加视频文件目录
 */
const addDragFolderListener = function(elementDom, isImageList = true) {
  let getFolderList = isImageList ? getImageFolders : getVideoFolders;
  let addToFolderList = isImageList ? addImageFolders : addVideoFolders;

  elementDom.addEventListener(
    'drop',
    e => {
      e.preventDefault();
      let fileList = getFolderList(); // 获取当前Vuex中的目录列表
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        // 被拖入目录的路径
        const paths = Array.from(files).map(item => item.path);
        // 已添加目录
        let repeatList = [];
        // 非文件夹列表
        let notFolderList = [];

        for (let i = paths.length - 1; i > -1; i--) {
          let item = paths[i];
          if (!isDirectory(item)) {
            // 从paths中剔除非目录的文件目录
            notFolderList.push(item);
            paths.splice(i, 1);
          } else if (fileList.includes(item)) {
            // 从paths中剔除已添加的文件目录
            repeatList.push(item);
            paths.splice(i, 1);
          }
        }

        let type = 'warning';
        // 添加情况 0：全部添加，1：部分添加，2：全部未添加
        const hadRepeatFile = repeatList.length > 0;
        const hadOtherTypeFile = notFolderList.length > 0;
        let theCase = !(hadRepeatFile || hadOtherTypeFile)
          ? 0
          : paths.length > 0
          ? 1
          : 2;
        let { message, type: _type } = i18nMsg(
          paths,
          repeatList,
          notFolderList,
          theCase,
          type
        );
        message =
          message.length > 0
            ? `<p style="font-size: 16px"><span style="color: black;">${i18nTitle(
                isImageList ? 0 : 1
              )}:</span><br />${message}</p>`
            : '';
        type = _type;
        store.dispatch(addToFolderList, paths).then(() => {
          console.log(
            '已添加：',
            paths,
            '未添加：',
            repeatList,
            '非文件目录',
            notFolderList
          );
          Message({
            dangerouslyUseHTMLString: true,
            type,
            message,
            duration: 4000
          });
        });
      }
    },
    true
  );
  elementDom.addEventListener('dragover', e => {
    e.preventDefault();
  });
};

function getS(len) {
  return len > 1 ? 's' : '';
}

function i18nTitle(index) {
  return i18nRender(`general.${titles[index]}`);
}

function i18nMsg(paths, repeatList, notFolderList, theCase, type) {
  const language = store.getters['preferenceStore/preference'].appLanguage;

  const hadRepeatFile = repeatList.length > 0;
  const hadOtherTypeFile = notFolderList.length > 0;

  const folderMsg = paths => `folder${getS(paths.length)}`;
  const folderBeenMsg = paths =>
    `${folderMsg(paths)} ${paths.length > 1 ? 'were' : 'was'}`;
  const successfulMsg =
    language === 'zh'
      ? `成功添加${paths.length}个文件目录`
      : `${paths.length} ${folderBeenMsg(paths)} successfully added`;
  const repeatMsg =
    language === 'zh'
      ? `${repeatList.length}个已添加过的文件目录未添加`
      : `${repeatList.length} ${folderMsg(
          repeatList
        )} that had been added ${getS(repeatList.length)} not added`;
  const otherFileMsg =
    language === 'zh'
      ? `${notFolderList.length}个非目录文件未添加`
      : `${notFolderList.length} non-${folderBeenMsg(notFolderList)} not added`;

  let message = '';
  switch (theCase) {
    case 0:
      message = successfulMsg;
      type = 'success';
      break;
    case 1:
      message =
        successfulMsg +
        (hadRepeatFile ? '<br />' + repeatMsg : ``) +
        (hadOtherTypeFile ? `<br />` + otherFileMsg : '');
      break;
    case 2:
      message =
        (hadRepeatFile ? repeatMsg : ``) +
        (hadOtherTypeFile ? '<br />' : '') +
        (hadOtherTypeFile ? otherFileMsg : '');
      break;
  }

  return { message, type };
}

export default addDragFolderListener;
