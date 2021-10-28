import store from '../store';
import { Message } from 'element-ui';
import { isImage, isVideo } from '@/components/file-tree/lib/util';
import { i18nRender } from '@/lang';
const addToFileListFns = ['imageStore/addImages', 'videoStore/addVideos'];
const titles = ['imageList', 'videoList'];

/**
 * 给某一元素添加拖放文件(图片或视频)的监听器
 * @param {HTMLDivElement} elementDom 将要添加监听器的元素
 */
const addDragFileListener = function(elementDom) {
  elementDom.addEventListener('drop', e => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // 获取当前Vuex中的文件列表
      let fileLists = [
        store.getters['imageStore/imageList'],
        store.getters['videoStore/videoList']
      ];
      // 所有拖入文件的路径
      const allPath = Array.from(files).map(item => item.path);
      // 分别存储图片文件及视频文件的列表
      const allPaths = [[], []];
      // 非指定类型的文件列表
      const notImageList = [];
      let type = 'warning';
      // 筛选出图片、视频及其他文件
      for (let path of allPath) {
        if (isImage(path)) {
          allPaths[0].push(path);
        } else if (isVideo(path)) {
          allPaths[1].push(path);
        } else {
          // 从allPath中剔除非指定类型的文件
          notImageList.push(path);
        }
      }

      // 如果全为非图片及非视频的文件， 直接返回
      if (!allPaths[0].length && !allPaths[1].length) {
        return;
      }

      // 对两个列表分别先剔除已添加的路径，再添加到vuex中的列表中
      Promise.all(
        fileLists.map(
          (fileList, index) =>
            new Promise((resolve, reject) => {
              const addToFileListFn = addToFileListFns[index];
              const paths = allPaths[index];

              // 重复文件列表
              let repeatList = [];

              for (let i = paths.length - 1; i > -1; i--) {
                let item = paths[i];
                if (fileList.includes(item)) {
                  // 从paths中剔除已添加的文件
                  repeatList.push(item);
                  paths.splice(i, 1);
                }
              }

              // 添加情况 0：全部添加，1：部分添加，2：全部未添加
              const hadRepeatFile = repeatList.length > 0;
              let theCase = paths.length > 0 ? (!hadRepeatFile ? 0 : 1) : 2;
              let { message, type: _type } = i18nMsg(
                paths,
                repeatList,
                theCase,
                type
              );
              type = _type;
              // 添加到vuex中的列表中
              store.dispatch(addToFileListFn, paths).then(() => {
                console.log(
                  index === 0 ? 'imageList' : 'videoList',
                  'Added files:',
                  paths,
                  'Duplicate files not added:',
                  repeatList
                );
                resolve(message);
              });
            })
        )
      ).then(res => {
        console.log('Non-picture, non-video files', notImageList, res);
        const notImageCount = notImageList.length;
        const messages = res
          .map((message, index) =>
            message.length > 0
              ? `<span style="color: black;font-size: 16px">${i18nTitle(
                  index
                )}:</span><br />` + message
              : ''
          )
          .join(res[0].length && res[1].length ? '<br /><br />' : '')
          .trim();
        const otherFileMsg = i18nOtherFileMsg(notImageCount);
        const message = `<p style="font-size: 16px">${otherFileMsg}${
          otherFileMsg.length > 0 ? '<br />' : ''
        }${messages}</p>`;

        // 显示最终结果信息
        Message({
          dangerouslyUseHTMLString: true,
          type,
          message,
          duration: 4000
        });
      });
    }
  });
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

function i18nMsg(paths, repeatList, theCase, type) {
  const language = store.getters['preferenceStore/preference'].appLanguage;
  const hadRepeatFile = repeatList.length > 0;

  const fileMsg = paths => `file${getS(paths.length)}`;
  const fileBeenMsg = paths =>
    `${fileMsg(paths)} ${paths.length > 1 ? 'were' : 'was'}`;
  const successfulMsg =
    language === 'zh'
      ? `成功添加个${paths.length}文件`
      : `${paths.length} ${fileBeenMsg(paths)} successfully added`;
  const repeatMsg =
    language === 'zh'
      ? `${repeatList.length}个已添加过的文件未添加`
      : `${repeatList.length} ${fileMsg(repeatList)} that had been added ${getS(
          repeatList.length
        )} not added`;

  let message = '';
  switch (theCase) {
    case 0:
      type = 'success';
      message = paths.length > 0 ? successfulMsg : '';
      break;
    case 1:
      message =
        paths.length > 0
          ? successfulMsg + (hadRepeatFile ? `<br />` + repeatMsg : ``)
          : '';
      break;
    case 2:
      message = hadRepeatFile ? repeatMsg : ``;
  }

  return { message, type };
}

function i18nOtherFileMsg(notImageCount) {
  const language = store.getters['preferenceStore/preference'].appLanguage;
  if (language === 'zh') {
    return notImageCount > 0
      ? `${notImageCount}个非图片、视频文件未添加<br />`
      : '';
  }
  return notImageCount > 0
    ? `${notImageCount} non-picture or non-video file ${
        notImageCount > 1 ? 's are' : 'is'
      } not added<br />`
    : '';
}

export default addDragFileListener;
