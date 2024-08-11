import path from 'path'

const workerPath = 'file:///' + path.join(__static, '/sw.js')

export const useWorker = (id, type, imageData, params) => {
  return new Promise(async (resolve, reject) => {
    const worker = new Worker(workerPath)
    worker.onmessage = (e) => {
      worker.terminate()
      resolve(e.data)
    }
    worker.onerror = (e) => {
      console.error('worker error', e)
      worker.terminate()
      reject(e)
    }
    worker.postMessage({
      id,
      type,
      imageData,
      params
    })
  })
}
