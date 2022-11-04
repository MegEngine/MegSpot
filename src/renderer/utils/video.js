import { TimingObject } from 'timing-object'
import { setTimingsrc } from 'timingsrc'
import { getType, getUuidv4 } from '@/utils'
import store from '../store'

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
    this.maxDuration = 0

    this.timingObj.addEventListener('readystatechange', () => {
      if (this.timingObj.readyState === 'open') {
        this.checkStatus()
        // console.log('readystatechange', this.timingObj, this.callbackFns)
      }
    })
    // this.timingObj.addEventListener('change', () => {
    //   const { velocity } = this.timingObj.query()
    //   store.dispatch('videoStore/setVideoConfig', {
    //     allVideoPaused: velocity === 0
    //   })
    // })

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

  createVideo({ id = getUuidv4(), path, callback }) {
    if (!path) {
      console.error('invalid path', path)
      return
    }

    return new Promise((resolve) => {
      this.ready = false

      const video = document.createElement('video')
      const videoConfig = this.setTime({ id, video })

      video.crossOrigin = 'anonymous'
      video.muted = true
      video.autoplay = false
      video.loop = false
      // video.defaultPlaybackRate = this.speed
      // video.playbackRate = this.speed

      video.addEventListener('loadstart', () => {
        this.ready = false
      })
      video.addEventListener('loadedmetadata', () => {
        this.checkStatus()
        callback('loadedmetadata', video)
      })
      video.addEventListener('loadeddata', () => {
        this.checkStatus()
        callback('loadeddata', video)
      })

      video.src = path

      resolve(videoConfig)
    })
  }

  setTime({ id = getUuidv4(), video, timingFn }) {
    let deleteTimingsrc = setTimingsrc(video, this.timingObj, timingFn)

    const newVideoConfig = {
      id,
      video,
      timingFn: timingFn ?? DEFAULT_TIMING_FN,
      changeFn: (newTimingStateVectorFunction, nextFrameCallback) => {
        deleteTimingsrc && deleteTimingsrc()
        getType(nextFrameCallback) === 'Function' &&
          video.requestVideoFrameCallback((now, metadata) => {
            nextFrameCallback()
          })
        deleteTimingsrc = setTimingsrc(video, this.timingObj, newTimingStateVectorFunction)
      },
      deleteFn: () => {
        if (this.timeConfigs.has(id)) {
          deleteTimingsrc && deleteTimingsrc()
          this.timeConfigs.delete(id)
        }
      }
    }
    this.maxDuration = Math.max(this.maxDuration, video.duration)
    this.timeConfigs.set(id, newVideoConfig)
    return newVideoConfig
  }

  checkPosition() {
    const { position } = this.timingObj.query()
    if (position >= this.maxDuration) {
      this.timingObj.update({ position: this.maxDuration, velocity: 0 })
    }
  }

  play(options) {
    if (!this.ready) return
    // this.timeConfigs.forEach((videoObj) => videoObj.video?.play())
    const speed = store.getters?.['videoStore/videoConfig']?.speed || 1
    // const { position } = this.timingObj.query()
    this.timingObj.update(Object.assign(options ?? {}, { velocity: speed }))
    this.checkPosition()
  }

  pause() {
    if (!this.ready) return
    this.timingObj.update({ velocity: 0 })
  }

  reset(pause = false) {
    if (!this.ready) return
    const { velocity } = this.timingObj.query()
    this.timingObj.update({ position: 0, velocity: pause ? 0 : velocity })
  }

  skip(offset) {
    if (!this.ready || isNaN(offset)) return

    const { position } = this.timingObj.query()

    this.timingObj.update({ position: position + Number(offset) })
  }

  setVelocity(velocity) {
    if (!this.ready) return
    this.timingObj.update({ velocity })
    // console.log('velocity', velocity, this.timingObj.query())
  }

  checkStatus() {
    this.ready =
      this.timingObj.readyState === 'open' &&
      Array.from(this.timeConfigs.values()).every((item) => item.video.readyState >= 2)

    console.log(
      'video timer ready status',
      this.ready,
      Array.from(this.timeConfigs.values()).every((item) => item.video.readyState >= 2)
      // Array.from(this.timeConfigs.values()).map((item) => item.video.readyState)
    )
    return this.ready
  }

  cleartimeConfigs(validArr) {
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
