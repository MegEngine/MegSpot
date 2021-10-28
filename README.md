# MegSpot

<p align="center">
  <img width="250"  src="./src/renderer/assets/images/logo.png">
</p>

[English](README.md) | 中文

MegSpot是一款提供免费免登录、高效、专业、跨平台的图片&视频的对比的PC应用工具。

## 特点

- 支持叠加对比、分割对比、GIF 结果呈现。
- 支持像素级图片查看、图片直方图、RGBA 查看。
- 及时调整亮度、对比度、饱和度、灰度等指标进行预览。
- Mac，Linux,Window 跨平台支持&支持自动更新。
- 支持命令快捷启动。
- 多语言支持：汉语、英语、日语

---

## 下载安装

## 功能介绍

### 图片对比

### 视频对比

### 拖拽对比

### 文件选择

### linux 命令启动

#### 支持传入文件夹或文件地址，支持相对和绝对路径

- -h / --help: 查看说明文档
- -i /--image: image 比较 是默认选项
- -v/ --video: 视频比较
- -c/ --clear: 是否清空之前已选文件 默认不清空

#### 实例

- ./MegSpot 进入主页
- ./MegSpot -i 进入图片对比
- ./MegSpot -v 进入视频对比
- ./MegSpot path 图片比较当前目录 进入选择文件页面 使用当前的 path
- ./MegSpot path -v 视频比较当前目录 进入选择文件页面 使用当前的 path
- ./MegSpot filePath1 filePath2 filePath3 ... 图片/视频比较已选文件 -v 比较视频 -c 清空之前已选文件 可以-v -c 也可以 -vc -cv

#### 补充建议：

1. 由于 MegSpot 支持自动更新导致 MegSpot-x.x.x.AppImage 的文件名称不断变化 建议创建个硬链接指向 AppImage
   创建命令：sudo ln ./MegSpot-x.x.x.AppImage /usr/bin/MegSpot
2. 并将硬链接添加到\$PATH 中 方便全局启动。

---
## 通过源码编译安装

```bash
# 安装依赖
npm install or yarn install

# 启动
npm run dev

# 查看package.json中的script字段，有相关构建脚本 默认打包当前机器环境安装包
npm run build

# 打包当前机器平台之外的平台

npm run build:mac

npm run build:win64

npm run build:win32

npm run build:all
```

---
## 如何参与贡献

- MegSpot 依据 [贡献者公约（Contributor Covenant）](https://contributor-covenant.org)来管理开源社区。请阅读 [行为准则](CODE_OF_CONDUCT.md) 了解更多信息。
- 每一名贡献者都需要签署贡献者许可协议（Contributor License Agreement，CLA）来明确贡献内容相关的知识产权许可。更多细节请参考 [协议内容](CONTRIBUTOR_LICENSE_AGREEMENT.md)。
- 我们欢迎你通过以下方式来帮助 MegSpot 变得更好：
  - 贡献代码；
  - 完善[文档](https://github.com/MegSpot/Docs)；
  - 在 [MegSpot 论坛](https://discuss.megengine.org.cn) 和 Stack Overflow 回答问题；
  - 报告使用中的 [Bugs 和 Issues](https://github.com/MegSpot/MegSpot/issues)；
  - 审查 [Pull Requests](https://github.com/MegSpot/MegSpot/pulls)；
  - 给 MegSpot 点亮小星星；
  - 在你的论文和文章中引用 MegEngine；
  - 向你的好友推荐 MegEngine；
  - ...

---
## 联系我们

- 问题: [github.com/MegSpot/MegSpot/issues](https://github.com/MegSpot/MegSpot/issues)
- 邮箱: [megengine-support@megvii.com](mailto:megengine-support@megvii.com)
- 论坛: [discuss.megengine.org.cn](https://discuss.megengine.org.cn)
- QQ: 1029741705
- OPENI: [openi.org.cn/MegSpot](https://www.openi.org.cn/html/2020/Framework_0325/18.html)

---
## 开源许可

MegSpot 使用 Apache License, Version 2.0

Copyright (c) 2014-2021 Megvii Inc. All rights reserved.
