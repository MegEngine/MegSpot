// import { nanoid } from 'nanoid'

export const MIME_TYPES = {
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  binary: 'application/octet-stream'
}

export const ALLOWED_IMAGE_MIME_TYPES = [
  MIME_TYPES.png,
  MIME_TYPES.jpg,
  MIME_TYPES.svg,
  MIME_TYPES.gif,
  MIME_TYPES.webp,
  MIME_TYPES.bmp,
  MIME_TYPES.ico
]

export const isSupportedImageFile = (blob) => {
  const { type } = blob || {}
  return !!type && ALLOWED_IMAGE_MIME_TYPES.includes(type)
}

export const getDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataURL = reader.result
      resolve(dataURL)
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(blob)
  })
}

export const dataURLToFile = (dataURL, filename = '') => {
  const dataIndexStart = dataURL.indexOf(',')
  const byteString = atob(dataURL.slice(dataIndexStart + 1))
  const mimeType = dataURL.slice(0, dataIndexStart).split(':')[1].split(';')[0]

  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new File([ab], filename, { type: mimeType })
}

/**
 * blobToArrayBuffer
 * @param {*} blob Blob
 * @return Promise<ArrayBuffer>
 */
export const blobToArrayBuffer = (blob) => {
  if ('arrayBuffer' in blob) {
    return blob.arrayBuffer()
  }
  // Safari
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Couldn't convert blob to ArrayBuffer"))
      }
      resolve(event.target.result)
    }
    reader.readAsArrayBuffer(blob)
  })
}

/**
 * generates SHA-1 digest from supplied file (if not supported, falls back to a 40-char base64 random id)
 * @param {*} file
 * @return Promise<FileId>
 */
export const generateIdFromFile = async (file) => {
  try {
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', await blobToArrayBuffer(file))
    return bytesToHexString(new Uint8Array(hashBuffer))
  } catch (error) {
    console.error(error)
    // length 40 to align with the HEX length of SHA-1 (which is 160 bit)
    // return nanoid(40)
    return ''
  }
}

export const getMimeType = (blob) => {
  let name
  if (typeof blob === 'string') {
    name = blob
  } else {
    if (blob.type) {
      return blob.type
    }
    name = blob.name || ''
  }
  if (/\.json$/.test(name)) {
    return MIME_TYPES.json
  } else if (/\.png$/.test(name)) {
    return MIME_TYPES.png
  } else if (/\.jpe?g$/.test(name)) {
    return MIME_TYPES.jpg
  } else if (/\.svg$/.test(name)) {
    return MIME_TYPES.svg
  }
  return ''
}
