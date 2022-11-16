import path from 'path'
const loadLib = function (cb) {
  const OPENCV_URL = path.join(__static, '/lib/opencv.js')
  const script = document.createElement('script')
  script.setAttribute('async', 'false')
  script.setAttribute('type', 'text/javascript')
  script.addEventListener('load', async () => {
    cv['onRuntimeInitialized'] = () => {
      //0.5s 左右的延时  https://stackoverflow.com/questions/56671436/cv-mat-is-not-a-constructor-opencv
      cb(cv)
    }
  })
  script.addEventListener('error', () => {
    console.error('Failed to load ' + OPENCV_URL)
  })
  script.src = 'file:///' + OPENCV_URL
  let node = document.getElementsByTagName('script')[0]
  node.parentNode.insertBefore(script, node)
}
export { loadLib }
