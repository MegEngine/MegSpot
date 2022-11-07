<template>
  <el-tooltip effect="light" placement="bottom-end" :open-delay="300">
    <div slot="content" class="frame-setting-container">
      <slot name="description"></slot>
      <div class="setting-item" flex="main:right cross:center">
        <span class="text-style" flex-box="1">displayed frames</span>
        <span class="text-style" flex-box="1" style="font-weight: bold">{{ displayedFrames }}</span>
      </div>
      <div class="setting-item" flex="main:right cross:center">
        <span class="text-style" flex-box="8">total frames</span>
        <input v-model.number="frameCountData" flex-box="16" class="number-input" />
      </div>
      <div class="setting-item" flex="main:right cross:center">
        <span class="text-style" flex-box="8">frame rate (FPS)</span>
        <input v-model.number="frameRateData" flex-box="16" class="number-input" />
      </div>
      <div class="setting-footer" flex="main:right">
        <el-button title="show video info" :disabled="loading" @click="showInfo">
          <svg-icon icon-class="eye-open"></svg-icon>
        </el-button>
        <el-button v-loading="loading" title="analyze video info" type="primary" size="mini" @click="analyzeVideo">
          reAnalyze
        </el-button>
        <el-button type="primary" size="mini" :disabled="loading" @click="setFromMediaInfo">reset</el-button>
      </div>
      <el-dialog :visible.sync="visible" title="Video Info" width="80%" center append-to-body>
        <el-input :value="mediaInfoInJson" type="textarea" :autosize="{ minRows }" :validate-event="false"></el-input>
      </el-dialog>
    </div>
    <slot></slot>
  </el-tooltip>
</template>

<script>
import { analyzeFile } from '@/utils/file'
import { EOF } from '@/constants'

export default {
  name: 'FrameSetting',
  props: {
    path: {
      type: String,
      required: true,
      default: ''
    },
    frameRate: {
      type: Number,
      required: true
    },
    frameCount: {
      type: Number,
      required: true
    },
    displayedFrames: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      mediaInfo: null,
      loading: false,
      visible: false
    }
  },
  computed: {
    frameFrequency() {
      return this.frameRate !== 0 ? 1 / this.frameRate : 0.03
    },
    frameRateData: {
      get() {
        return this.frameRate
      },
      set(value) {
        this.$emit('update:frameRate', value)
      }
    },
    frameCountData: {
      get() {
        return this.frameCount
      },
      set(value) {
        this.$emit('update:frameCount', value)
      }
    },
    mediaInfoInJson() {
      return this.mediaInfo?.FrameRate ? JSON.stringify(this.mediaInfo, null, 2) : ''
    },
    minRows() {
      return this.mediaInfoInJson.toString().split(EOF).length
    }
  },
  watch: {
    path() {
      this.analyzeVideo()
    }
  },
  created() {
    this.analyzeVideo()
  },
  methods: {
    analyzeVideo() {
      if (!this.path) {
        console.error('empty path', this.path)
        return
      }
      this.loading = true
      analyzeFile(this.path)
        .then((res) => {
          const result = JSON.parse(res)
          // console.log('analyzeFile', result)
          this.mediaInfo = result?.media?.track?.find((item) => item?.['@type']?.toLowerCase() === 'video')
          this.setFromMediaInfo()
          this.$emit('update', this.mediaInfo)
        })
        .catch((err) => {
          console.error('analyze video error', err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    setFromMediaInfo() {
      if (this.mediaInfo?.FrameRate) {
        this.frameRateData = Number(this.mediaInfo.FrameRate)
      }
      if (this.mediaInfo?.FrameCount) {
        this.frameCountData = Number(this.mediaInfo.FrameCount)
      }
    },
    showInfo() {
      if (this.mediaInfo?.FrameRate) {
        this.visible = true
      } else {
        this.$message.error('invalid video info')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/variables.scss';
.frame-setting-container {
  width: 200px;

  .text-style {
    display: inline-block;
    // color: #82848a;
    font-size: 14px;
    margin-left: 3px;
  }

  .setting-item {
    gap: 8px;
    .number-input {
      max-width: 60px;
      height: 16px;
      text-align: center;
      border: 1px solid #707078;
      border-radius: 4px;
      &:focus {
        border: unset;
        outline: 1px solid $primaryColor;
      }
    }
  }

  .setting-item + .setting-item,
  .setting-footer {
    margin-top: 10px;
  }
}
</style>
