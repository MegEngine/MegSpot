<template>
  <el-dialog
    ref="aboutDialog"
    :visible.sync="visible"
    :title="$t('generateGIF.title')"
    width="80%"
    class="gifDialog"
    center
  >
    <div id="imageItems">
      <el-table :data="gifImageList">
        <el-table-column :label="$t('generateGIF.image')" prop="imageName" width="350px">
          <template slot-scope="scope">
            <el-select
              class="select"
              v-model="scope.row.imageName"
              placeholder="select image"
              @change="selectImage(scope.row.imageName, scope.$index)"
            >
              <div v-for="item in selectList" :key="item">
                <el-option :label="$options.filters.getFileName(item, false)" :value="item"></el-option>
              </div>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="$t('generateGIF.description')" prop="description">
          <template slot-scope="scope">
            <el-input size="mini" v-model="scope.row.description"></el-input>
          </template>
        </el-table-column>
        <el-table-column :label="$t('generateGIF.operation')" width="100" align="center">
          <template slot-scope="scope" v-if="scope.$index !== gifImageList.length - 1">
            <el-button type="text" size="small" @click="handleDelete(scope.$index)">delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-if="gifImageList[0].imageName" class="options">
      <hr />
      <div>
        <el-form :inline="true" :model="optionList">
          <el-form-item label="Image interval">
            <el-input-number
              v-model="optionList.delay"
              placeholder="Image interval"
              controls-position="right"
              :step="100"
            >
              <template slot="append">ms</template>
            </el-input-number>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="generateGifPreview">Generate GIF</el-button>
          </el-form-item>
          <el-form-item>
            <el-button @click="downloadGif" :disabled="downLoadDisable">DownLoad GIF</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="tip" :style="`color: ${fininshed ? 'green' : 'red'};`">
        {{ tip }}
      </div>
      <div class="gifPreview" v-loading="generateLoading">
        <div class="image">
          <img src="" alt="gif Preview" id="result" v-if="imgVisible" :style="imgStyle" />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
const { dialog } = require('@electron/remote')
const fs = require('fs')
import getFileName from '@/filter/get-file-name'
import GIF from '@dhdbstjr98/gif.js/dist/gif'

export default {
  components: {},
  props: {
    selectList: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      gifImageList: [{ path: '', imageName: '', description: '' }],
      imageNameList: new Set(),
      updateKey: 1,
      optionList: {
        delay: 1000
      },
      imgVisible: false,
      fileContent: null,
      canvasSize: {
        width: 400,
        height: 300
      },
      gifCanvasList: [],
      downLoadDisable: true,
      generateLoading: false,
      imageDetails: [],
      fininshed: false,
      tip: ''
    }
  },
  computed: {
    imgStyle() {
      return `width:  ${(50 / this.canvasSize.height) * this.canvasSize.width}vh; height:50vh;padding-top: 5px`
    }
  },
  methods: {
    show(canvasSize) {
      if (canvasSize && canvasSize.width > 0) {
        this.canvasSize = canvasSize
      }
      this.visible = true
    },
    selectImage(imageName, index) {
      this.imageNameList.add(imageName)
      const data = { imageNameList: this.imageNameList }
      this.$bus.$emit('getCanvasSize', data, (res) => {
        this.canvasSize = res
      })
      this.gifImageList[index].imageName = getFileName(imageName, false)
      this.gifImageList[index].path = imageName
      if (this.gifImageList.length === index + 1 && this.gifImageList[index].imageName) {
        this.gifImageList.push({
          path: '',
          imageName: '',
          description: ''
        })
      }
    },
    handleDelete(index) {
      if (this.gifImageList[index].imageName) {
        this.gifImageList.splice(index, 1)
      }
    },
    clear() {
      if (this.gifImageList.length > 1) {
        this.downLoadDisable = true
        this.fininshed = false
        this.tip = ''
        this.imgVisible = false
        this.gifImageList = [{ path: '', imageName: '', description: '' }]
      }
    },
    generateGifPreview() {
      if (this.gifImageList.length - 1 < 2) {
        this.$message.info(this.$t('generateGIF.tips.tooSmallNumber'))
        this.fininshed = false
        this.tip = this.$t('generateGIF.tips.tooSmallNumber')
        return
      }

      this.$bus.$emit('getImageDetails', [...this.imageNameList], (details) => {
        this.imageDetails = details.map((item) => ({
          path: item.path,
          imageName: getFileName(item.path, false),
          canvas: item.canvas
        }))
      })
      this.downLoadDisable = true
      this.generateLoading = true
      this.fininshed = false
      this.tip = ''
      Promise.all(
        this.gifImageList
          .slice(0, -1) // 最后一个一直为空值
          .map(
            (item) =>
              new Promise((resolve, reject) => {
                try {
                  let imageName = getFileName(item.imageName, false)
                  let description = imageName
                  if (item.description) {
                    description = item.description
                  }
                  let gifItem = {
                    path: item.path,
                    imageName,
                    description
                  }
                  this.gifCanvasList.push(gifItem)
                  resolve(gifItem)
                } catch (error) {
                  reject(error)
                }
              })
          )
      )
        .then((values) => {
          this.generateGif()
        })
        .catch((error) => {
          console.log('error: ' + error)
        })
    },
    generateGif() {
      this.current = Date.now()
      let delay = this.optionList.delay
      let canvas = document.createElement('canvas')
      canvas.width = this.canvasSize.width
      canvas.height = this.canvasSize.height
      const fontSize = canvas.height / 25
      canvas.height += fontSize * 2

      let cs = canvas.getContext('2d')
      let gif = new GIF({
        workers: 8,
        workerScript: '/gif.worker.js',
        quality: 1,
        repeat: 0,
        dither: 'FloydSteinberg'
      })

      this.gifCanvasList.forEach((element) => {
        let index = this.imageDetails.findIndex((item) => item.imageName === element.imageName)
        cs.drawImage(this.imageDetails[index].canvas, 0, 0, this.canvasSize.width, this.canvasSize.height)
        cs.font = `${fontSize}px Arial`
        cs.textAlign = 'center'
        cs.fillText(element.description, canvas.width / 2, canvas.height - (fontSize * 2) / 3)
        gif.addFrame(canvas, { copy: true, delay: delay })
        cs.clearRect(0, 0, canvas.width, canvas.height)
      })

      gif.on('finished', (blob) => {
        //根据内容生成gif文件，展示在result中
        this.fininshed = true
        this.tip = this.$t('generateGIF.tips.finished')
        let file = new FileReader()
        this.imgVisible = true
        file.readAsDataURL(blob)
        file.onload = () => {
          document.getElementById('result').setAttribute('src', file.result)
          this.fileContent = file.result
          this.downLoadDisable = false
          this.generateLoading = false
        }
        this.gifCanvasList = []
        gif.freeWorkers.forEach((w) => w.terminate())
      })
      gif.render()
    },
    downloadGif() {
      let fileContent = this.fileContent
      let dataBuffer = Buffer.from(fileContent.split('base64,')[1], 'base64')
      dialog
        .showSaveDialog({
          title: 'select folder',
          filters: [{ name: 'Custom File Type', extensions: ['gif'] }]
        })
        .then((result) => {
          fs.writeFileSync(result.filePath, dataBuffer)
          this.$message.success(this.$t('generateGIF.tips.saved'))
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.gifDialog {
  ::v-deep {
    .el-dialog .el-dialog__body {
      margin-top: 10px;
    }
  }
  .el-select {
    width: 100%;
  }
  hr {
    color: #c6c0c0;
    opacity: 0.4;
  }
  .options {
    margin-top: 10px;
  }
  .tip {
    font-size: 12px;
    color: red;
    margin-bottom: 5px;
  }
  .gifPreview {
    height: 50vh;
    border: 1px solid gray;
    text-align: center;
    overflow: hidden;
    .image {
      text-align: center;
      img {
        object-fit: contain;
      }
    }
  }
}
</style>
