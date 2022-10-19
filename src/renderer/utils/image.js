import fse from 'fs-extra'
import { readFileSync, formatFileSize, getFileStat, getFileSize } from './file'
import { NO_CACHE_FILE_PROTOCOL } from '@/constants'
import { decode, decodeImage, toRGBA8 } from 'utif2'

export const getImageUrlSync = (path) => {
  const uri = path.split(/[/\\]/)
  const name = uri.pop()
  return 'file://' + [...uri, encodeURIComponent(name)].join('/')
}
export const getImageUrlSyncNoCache = (path) => {
  return encodeURI(`${NO_CACHE_FILE_PROTOCOL}://${path}`)
}
export const getImageType = (str) => {
  var reg = /\.(png|jpg|gif|jpeg|webp)$/
  return str.match(reg)[1]
}
export const getImageContent = (path) => {
  const binary = readFileSync(path, 'binary')
  const buffer = new Buffer(binary, 'binary')
  const base64 = buffer.toString('base64')
  return 'data: image/' + getImageType(path) + ';base64,' + base64
}
// 获取图片信息
export const getImageInfo = async (path) => {
  const fileInfo = await getFileStat(path).catch((err) => {
    throw err
  })
  return fileInfo
}

// 获取图片基本信息
export const getImageBasicInfo = async (path) => {
  const fileInfo = await getImageInfo(path)
  const fileSize = await getFileSize(path)
  return {
    size: formatFileSize(fileInfo.size),
    height: fileSize.height,
    width: fileSize.width
  }
}

// 批量获取image信息  包括url 尺寸等
export const getImageInfoMulti = (paths) => {
  const res = []
  const index = 0
  return new Promise((resolve, reject) => {
    function getInfo(index) {
      const path = paths[index]
      getImageUrl(path, async (url) => {
        const image = await getImageBasicInfo(path).catch((err) => reject(err))
        image.url = url
        image.path = path
        res.push(image)
        index++
        if (index < paths.length) {
          getInfo(index)
        } else {
          resolve(res)
        }
      })
    }
    getInfo(index)
  })
}

export const loadTiffAsImageData = async (val) => {
  if (!val) return
  if (val instanceof String) {
    // val as path
    const file = await fse.readFile(val)
    const arraybuffer = file.buffer
    const ifds = decode(arraybuffer)
    const ifd = ifds[0]
    decodeImage(file, ifd)
    const imageData = toRGBA8(ifd)
    console.log('this.image.width', this.image.width, file, arraybuffer, ifds, ifd, imageData)
    this.cs.putImageData(
      new ImageData(new Uint8ClampedArray(imageData), ifd.width, ifd.height, { colorSpace: 'srgb' }),
      0,
      0
    )
  } else {
    console.log('obj', val)
  }
}
