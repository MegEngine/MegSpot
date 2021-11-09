export default {
  common: {
    supportTypes: '複数のファイルタイプをサポート:',
    desc:
      'MegSpotは、ローカル画像比較、ビデオ比較、画像カスタマイズ処理などの便利な機能をユーザーに提供するように設計されたクロスプラットフォームのローカルアプリケーションです。 \r\n交換グループに参加して、詳細を確認し、最新情報を入手できます。',
    manual: 'マニュアル',
    hotKey: 'ホットキー',
    showVideoTip: 'デモビデオを表示'
  },
  nav: {
    toHome: 'ホーム',
    back: '戻る',
    feedback: 'フィードバック'
  },
  general: {
    layout: 'レイアウト',
    aboutText: 'オン',
    introduction:
      'MegSpotは、ローカル画像比較、ビデオ比較、画像カスタマイズ処理などの便利な機能をユーザーに提供するように設計されたクロスプラットフォームのローカルアプリケーションです。\r\n詳細については、DingdingGroupを入力してください',
    videoPlay: '動画の再生',
    videoCompare: '静止画の対照',
    compare: '対照',
    selected: '選択されている',
    list: 'リスト',
    thumbnail: 'サムネイル画像',
    fileName: 'ファイル名',
    fileLoading: 'ファイルを読み込んでいます...',
    groupNum: 'グループ番号\nCtrl + ← ページ前方 nCtrl + → ページ後方',
    lastModifyTime: '最終変更時刻',
    size: 'ファイルサイズ',
    scale: '拡大倍率',
    sortDialogTips: 'ヒント：ファイル名をドラッグして表示順を変更できます',
    clearAll: 'すべて選択解除',
    delete: 'このアイテムを削除する',
    showAll: 'すべて表示する',
    history: '歴史記録',
    dragDropCompare: 'ドラッグアンドドロップの比較',
    imageBrowser: '画像ブラウザ',
    imageList: '画像リスト',
    videoList: 'ビデオリスト',
    imageFolderList: '画像フォルダ一覧',
    videoFolderList: 'ビデオフォルダリスト'
  },
  dashboard: {
    entries: {
      image: {
        title: '画像',
        desc: 'ローカルの画像を対照する'
      },
      video: {
        title: '動画',
        desc: 'ローカルの動画を対照する'
      },
      viewer: {
        title: 'カスタムビューア',
        desc: 'カスタム画像処理ロジックを使用してビューアを作成する'
      }
    }
  },
  image: {
    toolbar: {
      openFolder: 'フォルダを開く',
      addFolder: 'フォルダーを追加',
      imageQueue: '画像のリスト',
      compareImages: '画像を比較する',
      cleanImageQueue: 'リストをクリア'
    },
    folder: {
      loadingText: 'データの読み込み...'
    }
  },
  imagePreview: {},
  imageCenter: {
    bilinearInterpolation: 'バイリニア補間',
    selectedMsg: '画像が選択されており、独立して操作できます',
    colorPicker: 'カラーピッカー',
    nearestInterpolation: '最近傍補間',
    overlayLeft: '左側にオーバーレイ表示',
    overlayRight: '右側にオーバーレイ表示',
    overlayBottom: '下にオーバーレイ表示',
    overlayTop: '上にオーバーレイ表示',
    verticalFlip: '上下に反転',
    horizontalFlip: '左右に反転',
    fullsize: 'フルサイズ',
    adaptive: '全体を見る',
    align: '整列（サイズは同じままです）',
    align2: 'align（同じサイズ）',
    helpText:
      '画像をダブルクリックとして、その画像が個別に操作できます。ファイルネイムにクリックして、コメントが編集できます。',
    rotate: 'スピン',
    generateGIF: 'gifを生成する'
  },
  imageDragDropCompare: {
    hideLine: 'コントラストラインを隠す',
    displayLine: 'コントラストラインを表示',
    tip:
      'デフォルトでは、選択された最初の2つの画像が比較されます。 変更する必要がある場合は、選択したものを開いて切り替えてください。'
  },
  generateGIF: {
    title: '比較働画GIFを生成',
    image: '比較図',
    description: '説明する',
    operation: '操作する',
    tips: {
      wait: '生成に時間がかかるかもしれませんが、お待ちください',
      saved: 'GIFファイル保存成功！',
      finished: 'GIF生成に成功しました！',
      tooSmallNumber: '選択済み画像の数が少なすぎる！'
    }
  },
  video: {
    speed: '再生速度',
    loop: 'リピート',
    play: '再生',
    pause: '一時停止',
    reset: 'リセット'
  }
};
