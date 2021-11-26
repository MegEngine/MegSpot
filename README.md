# MegSpot

<p align="center">
  <img width="550"  src="./src/renderer/assets/images/big_logo_dark.png">
</p>

[English](README_EN.md) | 中文

**MegSpot**是一款提供免费免登录、高效、专业、跨平台的图片&视频的对比的 PC 应用工具。

## 特点

- 支持叠加对比、分割对比、GIF 结果呈现。
- 支持像素级图片查看、图片直方图、RGBA 查看。
- 及时调整亮度、对比度、饱和度、灰度等指标进行预览。
- Mac, Linux, Windows 跨平台支持&支持自动更新。
- 支持针对多视频任意画面的对比。
- 支持命令快捷启动。
- 多语言支持：汉语、英语、日语。

---

## 功能介绍

- 图片对比
  - [选中操作(推荐了解)](https://github.com/MegEngine/MegSpot/wiki/选中)
  - [普通对比](https://github.com/MegEngine/MegSpot/wiki/图片对比)
  - [拖拽对比](https://github.com/MegEngine/MegSpot/wiki/拖拽对比)
  - [图片查看器](https://github.com/MegEngine/MegSpot/wiki/图片查看器)
- [视频对比](https://github.com/MegEngine/MegSpot/wiki/视频对比)
  - [视频预览](https://github.com/MegEngine/MegSpot/wiki/%E8%A7%86%E9%A2%91%E5%AF%B9%E6%AF%94#%E8%A7%86%E9%A2%91%E9%A2%84%E8%A7%88)
  - [视频截屏对比](https://github.com/MegEngine/MegSpot/wiki/%E8%A7%86%E9%A2%91%E5%AF%B9%E6%AF%94#%E8%A7%86%E9%A2%91%E6%88%AA%E5%B1%8F%E5%AF%B9%E6%AF%94)
- [文件选择](https://github.com/MegEngine/MegSpot/wiki/文件选择)
  - [文件列表](https://github.com/MegEngine/MegSpot/wiki/文件列表)
  - [文件长廊](https://github.com/MegEngine/MegSpot/wiki/文件长廊)
- [命令行操作](https://github.com/MegEngine/MegSpot/wiki/命令行操作)
- [多语言支持](https://github.com/MegEngine/MegSpot/wiki/语言支持)
- [帮助视频](https://github.com/MegEngine/MegSpot/wiki/帮助视频)
- [自动更新](https://github.com/MegEngine/MegSpot/wiki/自动更新)

---

## 选中

**选中**是**MegSpot**中非常具有特色、也非常有用的操作特性，它能让某些如翻转、缩放等操作只在**指定**的一或两个图像中**生效**。

使用场景： [**图片对比**](https://github.com/MegEngine/MegSpot/wiki/图片对比)、 [**视频对比中的图片对比**](https://github.com/MegEngine/MegSpot/wiki/视频截屏对比)

[查看手册](https://github.com/MegEngine/MegSpot/wiki/选中)

---

## 图片对比

**图片对比**是 MegSpot 的核心功能，它不仅可以按你所想要的条件(**指定亮度、模糊度、透明度等**)来修改原图像，也能对图像进行**翻转、缩放、拖拽、镜像等操作**来辅助查看，另外也有**RGB 取色器**、**缩放比例设置栏**方便快捷的工具帮助你获得更好的图片查看体验

[查看手册](https://github.com/MegEngine/MegSpot/wiki/图片对比)

---

## 拖拽对比

从用户已选中的图片中，分割对比文件长廊中选中的两张图片

[查看手册](https://github.com/MegEngine/MegSpot/wiki/拖拽对比)

---

## 图片查看器

通过[文件选择页面](https://github.com/MegEngine/MegSpot/wiki/文件选择)进入。基于 OpenCV 完成图片查看功能，包括：缩放，拖拽，直方图，RGBA 值获取等。

[查看手册](https://github.com/MegEngine/MegSpot/wiki/图片查看器)

---

## 视频对比

**视频对比**区别于**图片对比**的地方在于，视频对比多了一个**视频预览**的页面，需要在**视频预览页**确定各个视频想要进行对比的截屏画面，然后点击 **"图片对比"**，即可进入[视频截屏对比](https://github.com/MegEngine/MegSpot/wiki/%E8%A7%86%E9%A2%91%E5%AF%B9%E6%AF%94#%E8%A7%86%E9%A2%91%E6%88%AA%E5%B1%8F%E5%AF%B9%E6%AF%94)模式

[查看手册](https://github.com/MegEngine/MegSpot/wiki/视频对比)

---

## 文件选择

**MegSpot** 在本地会存储两个**文件路径列表**，便于下次打开应用依然保留上次的文件列表。
同样的， **MegSpot** 还会在本地存储两个**文件夹路径列表**
[查看手册](https://github.com/MegEngine/MegSpot/wiki/文件选择)

#### 文件列表

从首页点击“**图片对比**”或“**视频对比**”后，都会先进入各自的“**文件选择页面**”，主要包含左侧的**文件夹列**表及右侧的**文件列表**
[查看手册](https://github.com/MegEngine/MegSpot/wiki/文件列表)

### 文件长廊

集中展示用户已选取的所有文件，并支持拖动调整顺序。通过点击 按钮“**已选**”即可打开“**文件长廊**”。

[查看手册](https://github.com/MegEngine/MegSpot/wiki/文件长廊)

---

## 命令行操作

Linux 环境下支持通过命令行进行启动、对比等操作。

[查看手册](https://github.com/MegEngine/MegSpot/wiki/命令行操作)

---

## 多语言支持

**MegSpot**默认支持多语言，应用内当前已支持汉语、英语、日语。欢迎[贡献](https://github.com/MegEngine/MegSpot/wiki/%E8%AF%AD%E8%A8%80%E6%94%AF%E6%8C%81#%E6%AC%A2%E8%BF%8E%E8%B4%A1%E7%8C%AE%E5%85%B6%E4%BB%96%E8%AF%AD%E8%A8%80%E7%BF%BB%E8%AF%91)其他语言翻译。

[查看手册](https://github.com/MegEngine/MegSpot/wiki/语言支持)

---

## 帮助视频

首页有滚动循环播放的帮助视频的轮播图，这些帮助视频简单介绍了各个功能的使用方法及要点。

[查看手册](https://github.com/MegEngine/MegSpot/wiki/帮助视频)

---

## 自动更新

为了省去用户每次手动下载的麻烦，**MegSpot**针对**Windows**、**Linux**、**Mac**三个系统都支持了**自动更新**功能。

[查看手册](https://github.com/MegEngine/MegSpot/wiki/自动更新)

---

## 下载安装

1. 使用已安装 **MegSpot** 应用的[自动更新](https://github.com/MegEngine/MegSpot/wiki/%E8%87%AA%E5%8A%A8%E6%9B%B4%E6%96%B0)功能。
2. 直接下载

   在 [Github Releases](https://github.com/MegEngine/MegSpot/releases) 中下载对应系统的安装包进行安装。

3. [通过源码编译安装](https://github.com/MegEngine/MegSpot/wiki/%E4%B8%8B%E8%BD%BD%E5%AE%89%E8%A3%85#3-%E9%80%9A%E8%BF%87%E6%BA%90%E7%A0%81%E7%BC%96%E8%AF%91%E5%AE%89%E8%A3%85)

[查看手册](https://github.com/MegEngine/MegSpot/wiki/下载安装)

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
  - 在你的论文和文章中引用 MegSpot；
  - 向你的好友推荐 MegSpot；
  - ...

---

## 联系我们

- 问题: [github.com/MegSpot/MegSpot/issues](https://github.com/MegSpot/MegSpot/issues)
- 邮箱: [megengine-support@megvii.com](mailto:megengine-support@megvii.com)
- 论坛: [discuss.megengine.org.cn](https://discuss.megengine.org.cn)
- QQ: 782365536
- OPENI: [openi.org.cn/MegSpot](https://www.openi.org.cn/html/2020/Framework_0325/18.html)

---

## 开源许可

MegSpot 使用 Apache License, Version 2.0

## 引文

如果您在出版物中使用 MegSpot，请使用以下 BibTeX 条目引用它。

```
@Misc{MegSpot,
  institution = {megvii},
  title =  {MegSpot:An efficient, professional, cross-platform image & video comparison application.},
  howpublished = {\url{https://github.com/MegEngine/MegSpot}},
  year = {2021}
}
```

Copyright (c) 2014-2021 Megvii Inc. All rights reserved.
