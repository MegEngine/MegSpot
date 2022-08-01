export default {
  common: {
    supportTypes: '対応ファイルタイプ:',
    desc:
      'MegSpotは、画像比較、ビデオ比較、画像カスタマイズ処理などの便利な機能をユーザーに提供するように設計されたクロスプラットフォームのネイティブアプリケーションです。 \r\nqqグループ（782365536）に参加して、詳細を確認し、最新情報を入手してください。',
    manual: 'マニュアル',
    hotKey: 'ホットキー',
    please: 'お願いします',
    reset: 'リセット',
    edit: '編集',
    save: '保存',
    cancel: 'キャンセル',
    showVideoTip: 'デモビデオを表示'
  },
  nav: {
    toHome: 'ホーム',
    back: '戻る',
    feedback: 'フィードバック'
  },
  general: {
    success: '成功',
    failure: '失敗',
    canceled: 'キャンセル',
    layout: 'レイアウト',
    aboutText: 'オン',
    introduction:
      'MegSpotは、画像比較、ビデオ比較、画像カスタマイズ処理などの便利な機能をユーザーに提供するように設計されたクロスプラットフォームのローカルアプリケーションです。\r\n詳細については、DingdingGroupを入力してください',
    videoPlay: '動画の再生',
    videoCompare: '画像比較',
    compare: '比較',
    selected: '選択ファイル',
    language: '言語',
    import: 'インポート',
    export: 'エクスポート',
    videoProcessBarStyle: 'ビデオコントロールバーの位置',
    fixed: '安定',
    float: 'フローティングボール',
    defaultFileListShowType: 'ファイルリストのデフォルトの表示タイプ',
    list: 'リスト',
    share: '共有',
    shareAsProject: '共有するスナップショットファイルを作成する',
    show: '見せる',
    hide: '隠れる',
    histogram: 'ヒストグラム',
    thumbnail: 'サムネイル画像',
    fileName: 'ファイル名',
    fileLoading: 'ファイルを読み込んでいます...',
    enableRegular: '通常の有効化/無効化',
    groupNum: 'グループ番号\nCtrl + ← 戻る \nCtrl + → 進む',
    lastModifyTime: '更新日付',
    operate: '操作する',
    size: 'ファイルサイズ',
    scale: '拡大倍率',
    sortDialogTips: 'ヒント：ファイル名をドラッグして表示順を変更できます',
    selectAll: 'すべて選択',
    clearAll: 'すべて選択解除',
    delete: 'このアイテムを削除',
    showAll: 'すべて表示',
    history: '履歴',
    dragDropCompare: 'ドラッグアンドドロップの比較',
    imageBrowser: '画像ブラウザ',
    imageList: '画像リスト',
    videoList: 'ビデオリスト',
    invalidFolderTip: 'フォルダが存在しません。有効なパスを入力してください',
    imageFolderList: '画像フォルダ一覧',
    videoFolderList: 'ビデオフォルダリスト'
  },
  hotkey: {
    desc: '説明',
    key: 'ショートカットキー',
    gotoCompare: '比較ページにジャンプします',
    emptyAll: '選択したすべての画像またはビデオを空にします',
    back: 'ファイル選択ページに戻る',
    gallery: 'ギャラリーを開く/閉じる',
    previousGroup: '前のグループ',
    nextGroup: '次のグループ',
    previousFrame: '前のフレーム',
    nextFrame: '次のフレーム',
    togglePlay: '再生/一時停止',
    top: '比較のために積み重ねる',
    left: '左にコントラストをオーバーレイ',
    right: '右にコントラストを重ねる',
    bottom: '比較のために積み重ねる',
    pickColor: 'カラーピッカーのオン/オフを切り替えます'
  },
  dashboard: {
    entries: {
      image: {
        title: '画像',
        desc: '画像ビューア。画像の表示、比較'
      },
      video: {
        title: '動画',
        desc: '動画プレイヤー。動画の再生、比較'
      },
      viewer: {
        title: 'カスタムビューア',
        desc: 'カスタム画像処理ロジックを使用したビューアを作成する'
      }
    }
  },
  image: {
    toolbar: {
      openFolder: 'フォルダを開く',
      addFolder: 'フォルダーを追加',
      openFolderTip:
        'システムファイルリソースマネージャーのディレクトリを開きます',
      loadShareProject: 'スナップショットのロード',
      resetPosition: 'リセット',
      resetPositionTip: 'スナップショットの元の位置にリセット',
      export: 'をエクスポート',
      exportTip: 'スナップショットの元の画像ファイルをエクスポートします',
      imageQueue: '画像リスト',
      compareImages: '画像を比較',
      cleanImageQueue: 'リストをクリア'
    },
    folder: {
      loadingText: 'データの読み込み...'
    }
  },
  imagePreview: {},
  imageCenter: {
    bilinearInterpolation: 'バイリニア補間',
    shortSelectedMsg: 'が選択されています',
    selectedMsg: 'この画像は選択されており、独立して操作できます',
    colorPicker: 'カラーピッカー',
    region: 'カラーピッカーのサイズ',
    nearestInterpolation: '最近傍補間',
    overlayLeft: '左側にオーバーレイ表示',
    overlayRight: '右側にオーバーレイ表示',
    overlayBottom: '下にオーバーレイ表示',
    overlayTop: '上にオーバーレイ表示',
    verticalFlip: '上下に反転',
    frameStep: 'フレーム比較の間隔',
    frameSteps1: '一つ一つ比較する\n逆さまに: Cmd/Ctrl + b',
    frameSteps2: '一つ一つ比較する\n再生を再開します: Cmd/Ctrl + n',
    horizontalFlip: '左右に反転',
    fullsize: 'フルサイズ',
    adaptive: '全体を見る',
    align: '整列（サイズは同じままです）',
    align2: '整列（同じサイズ）',
    helpText:
      '画像をダブルクリックして、その画像を個別に操作できます。ファイル名をクリックして、コメントが編集できます。',
    rotate: '回転',
    generateGIF: 'gifを生成する'
  },
  imageDragDropCompare: {
    hideLine: '比較ラインを隠す',
    displayLine: '比較ライン表示',
    tip:
      'デフォルトでは、選択された画像の最初の2つが比較されます。 変更する場合は、選択を開いて切り替えてください。'
  },
  generateGIF: {
    title: '比較働画GIFを生成',
    image: '比較図',
    description: '説明',
    operation: '操作する',
    tips: {
      wait: '生成しています、お待ちください',
      saved: 'GIFファイルを保存しました！',
      finished: 'GIFファイルを生成しました！',
      tooSmallNumber: '選択済み画像の数が少なすぎます！'
    }
  },
  video: {
    speed: '再生速度',
    loop: 'リピート',
    play: '再生',
    pause: '一時停止',
    reset: 'リセット',
    muted: 'ミュート',
    fullscreen: 'フルスクリーン\nESC終了フルスクリーン',
    dynamicPickColor: 'カラーピッカー調和',
    minRenderInterval: 'ビデオレンダリングの最小間隔',
    processTip:
      '左クリックしてビデオプログレスバーを表示/非表示にし、右クリックしてビデオプログレスの正確なコントロールコンポーネントを表示/非表示にします'
  },
  sortFile: {
    apply: '応用',
    addFolder: 'フォルダーを追加',
    afterAddFolder: '并从左侧目录树选择文件夹',
    edit: '次に、左側のディレクトリツリーからフォルダを選択します',
    generate: '生成',
    generateTip:
      'クリックして、現在のディレクトリに.MegSpotSort.iniソート構成ファイルを生成します',
    sortFile: 'ファイルを並べ替える',
    useTableFileList: '現在のテーブル並べ替えリストを適用する',
    clearSortList: 'ソート済みリストをクリア',
    useDefaultSort: 'デフォルトの並べ替え',
    defaultSortTip: '名前でファイルを並べ替える'
  },
  gallery: {
    clear: 'クリア',
    enableNameSort: '名前順',
    enableNameSortTip: '名前で並べ替えるかどうか',
    smartSort: 'スマートソーティング',
    smartSortTip:
      '異なるフォルダにある同じ名前のファイルは、簡単に比較できるように一緒に並べ替えられます'
  }
};
