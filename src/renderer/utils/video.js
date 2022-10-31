import { TimingObject } from 'timing-object'
import { setTimingsrc } from 'timingsrc'
import { getUuidv4 } from '@/utils'

export const DEFAULT_TIMING_FN = ({ acceleration, position, timestamp, velocity }) => {
  return {
    acceleration,
    position,
    timestamp,
    velocity
  }
}

export class Timer {
  constructor() {
    this.timingObj = new TimingObject()
    this.timeConfigs = new Map()
    this.ready = false

    this.timingObj.addEventListener('readystatechange', () => {
      if (this.timingObj.readyState === 'open') {
        this.ready = true
        console.log('readystatechange', this.timingObj, this.callbackFns)
      }
    })
    // if (videos.length) {
    //   return new Promise((resolve) => {
    //     this.timingObj.addEventListener('readystatechange', () => {
    //       if (this.timingObj.readyState === 'open') {
    //         this.ready = true
    //         for (let i = 0; i < videos.length; i++) {
    //           this.setTime(videos[i])
    //         }
    //         resolve(this)
    //       }
    //     })
    //   })
    // }
  }

  setTime({ id = getUuidv4(), video, timingFn = DEFAULT_TIMING_FN }) {
    const deleteTimingsrc = setTimingsrc(video, this.timingObj, timingFn)
    const newVideoConfig = {
      id,
      video,
      timingFn,
      changeFn: (newTimingStateVectorFunction) => {
        deleteTimingsrc && deleteTimingsrc()
        this.setTime(video, newTimingStateVectorFunction)
      },
      deleteFn: () => {
        if (this.timeConfigs.has(id)) {
          deleteTimingsrc && deleteTimingsrc()
          this.timeConfigs.delete(id)
        }
      }
    }
    this.timeConfigs.set(id, newVideoConfig)
    return newVideoConfig
  }

  play(options) {
    if (!this.checkStatus()) return
    this.timeConfigs.forEach((videoObj) => videoObj.video?.play())

    if (options) {
      this.timingObj.update(options)
    } else {
      const { position, velocity } = this.timingObj.query()

      if (position === 100 && velocity === 0) {
        this.timingObj.update({ position: 0, velocity: 1 })
      } else {
        this.timingObj.update({ velocity: 1 })
      }
    }
  }

  pause() {
    if (!this.checkStatus()) return
    this.timingObj.update({ velocity: 0 })
  }

  reset() {
    if (!this.checkStatus()) return
    this.timingObj.update({ position: 0 })
  }

  skip(offset) {
    if (!this.checkStatus() || isNaN(offset)) return

    const { position } = this.timingObj.query()

    this.timingObj.update({ position: position + Number(offset) })
  }

  checkStatus() {
    const reallyReady = this.ready && Array.from(this.timeConfigs.values()).every((item) => item.video.readyState === 4)
    !reallyReady &&
      console.log(
        'video timer not ready',
        this.ready,
        Array.from(this.timeConfigs.values()).every((item) => item.video.readyState === 4),
        Array.from(this.timeConfigs.values()).map((item) => item.video.readyState)
      )
    return reallyReady
  }

  cleartimeConfigs() {
    console.log('cleartimeConfigs')
    this.timeConfigs = null
    this.timeConfigs = new Map()
  }

  getStatus() {
    return this.ready
  }

  getTimingObj() {
    return this.timingObj
  }

  gettimeConfigs() {
    return this.timeConfigs
  }
}

export const TimeManager = new Timer()
