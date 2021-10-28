# MegSpot

<p align="center">
  <img width="150"  src="./src/renderer/assets/images/logo_256X256.png">
</p>

[English](README_EN.md) | 中文 

MegSpot是一款提供免费免登录、高效、专业、跨平台的图片&视频的对比的PC应用工具。

## 特点

- 支持叠加对比、拖拽对比、GIF结果呈现。
- 支持像素级图片查看、图片直方图、RGBA 查看。
- 支持调整亮度、对比度、饱和度、灰度等指标进行预览。
- 支持视频对比，并继承所有图片对比的功能。
- Mac，Linux，Window 跨平台支持&支持自动更新。
- 支持终端命令。
- 支持多语言：汉语、英语、日语。

---

## 下载安装

## 功能介绍

### 图片对比

### 视频对比

### 拖拽对比

### 便捷文件选择

### 终端命令

#### 支持传入文件夹或文件地址，支持相对和绝对路径

- `-h / --help`: 查看帮助
- `-i /--image`: image 比较 是默认选项
- `-v/ --video`: 视频比较
- `-c/ --clear`: 是否清空之前已选文件 默认不清空

#### 实例

- `MegSpot`进入主页
- `MegSpot -i` 进入图片对比
- `MegSpot -v` 进入视频对比
- `MegSpot path ` 进入图片对比选择文件页面（使用当前的path）
- `MegSpot path -v` 进入视频对比选择文件页面 (使用当前的 path）
- `MegSpot filePath1 filePath2 filePath3 ... `图片/视频比较已选文件 -v 比较视频 -c 清空之前已选文件 可以-v -c 也可以 -vc -cv

---
## 通过源码编译安装

```bash
# 安装依赖
npm install or yarn install

# 启动
npm run dev

# 全平台构建
npm run build:all

# 打包当前机器平台之外的平台

npm run build:mac

npm run build:win64

npm run build:win32

```

---
## 如何参与贡献

- MegSpot 依据 [贡献者公约（Contributor Covenant）](https://contributor-covenant.org)来管理开源社区。请阅读 [行为准则](CODE_OF_CONDUCT.md) 了解更多信息。
- 每一名贡献者都需要签署贡献者许可协议（Contributor License Agreement，CLA）来明确贡献内容相关的知识产权许可。更多细节请参考 [协议内容](CONTRIBUTOR_LICENSE_AGREEMENT.md)。
- 我们欢迎你通过以下方式来帮助 MegSpot 变得更好：
  - 贡献代码；
  - 完善[文档](https://github.com/MegSpot/Docs)；
  - 报告使用中的 [Bugs 和 Issues](https://github.com/MegEngine/MegSpot/issues)；
  - 审查 [Pull Requests](https://github.com/MegEngine/MegSpot/pulls)；
  - 给 MegSpot 点亮小星星；
  - 向你的好友推荐 MegSpot；
  - ...

---
## 联系我们

- 问题: [github.com/MegEngine/MegSpot/issues](https://github.com/MegEngine/MegSpot/issues)
- 邮箱: [megengine-support@megvii.com](mailto:megengine-support@megvii.com)
- QQ: 782365536

---
## 开源许可

MegSpot 使用 Apache License, Version 2.0

Copyright (c) 2014-2021 Megvii Inc. All rights reserved.
