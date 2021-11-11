<template>
  <div id="image-drag-drop-compare">
    <div class="buttons" flex="main:justify cross:center">
      <div class="changeButton">
        <div class="router-back" v-tip.left="`${$t('common.hotKey')}：esc`">
          <span @click="goBack" class="btn"
            ><i class="el-icon-d-arrow-left"></i>{{ $t('nav.back') }}</span
          >
        </div>
        <el-badge class="tool-item">
          <Gallery
            :selectedList="imageList"
            :focusList="this.selectedList"
            @update="setImages"
            @remove="removeImages"
            @click="handleClick"
          >
            <template v-slot:headButton>
              <el-badge :value="imageList.length" class="item">
                <el-button
                  type="text"
                  size="mini"
                  :disabled="!imageList.length"
                  v-tip.sure.right="
                    'cmd/ctrl+f show/hide selected file gallery. Click masking can hide gallery too.'
                  "
                >
                  {{ $t('general.selected') }}
                </el-button>
              </el-badge>
            </template>
            <template v-slot:dragItem="item">
              <img :src="item.src" :alt="item.alt" />
            </template>
          </Gallery>
        </el-badge>
        <el-button
          type="text"
          size="mini"
          icon="el-icon-circle-close"
          style="margin-right:10px"
          title="unselected all"
          :disabled="!imageList.length"
          @click="emptyImages"
        />
        <el-radio-group
          v-model="direction"
          size="mini"
          class="show-type-container"
          @change="changeDirection"
        >
          <el-radio-button label="true">
            <svg-icon icon-class="jiantou"></svg-icon>
          </el-radio-button>
          <el-radio-button label="false">
            <svg-icon
              icon-class="jiantou"
              style="transform:rotate(90deg); display:block"
            ></svg-icon>
          </el-radio-button>
        </el-radio-group>
        <el-button
          size="mini"
          @click="changeStatus"
          :title="
            $t(
              status
                ? 'imageDragDropCompare.hideLine'
                : 'imageDragDropCompare.displayLine'
            )
          "
        >
          <svg-icon
            id="icon"
            :icon-class="status ? 'eye-open' : 'eye'"
            style=" font-size: 12px "
          ></svg-icon>
        </el-button>
        <span class="tip">
          {{ $t('imageDragDropCompare.tip') }}
        </span>
      </div>
    </div>
    <div class="canvas">
      <canvas id="canvas"></canvas>
      <div id="line1-hover">
        <div id="line1"></div>
      </div>
      <div id="line2-hover">
        <div id="line2"></div>
      </div>
    </div>
  </div>
</template>
<script>
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions } = createNamespacedHelpers('imageStore');
import { throttle } from '@/utils';
import { getImageUrlSync } from '@/utils/image';
import Gallery from '@/components/gallery';

export default {
  name: 'ImageDragDropCompare',
  components: { Gallery },
  data() {
    return {
      status: true,
      direction: 'false',
      newLineX: 0,
      leftDis: 0,
      topDis: 0,
      imagePosition: {},
      isMouseDown: false,
      imgScale: 1,
      canvas: null,
      cs: null,
      line: null, //实际在移动的线
      line1: null, //竖线
      line2: null, //横线
      image1: null,
      image2: null,
      selectedList: [],
      imageBitMap1: undefined,
      imageBitMap2: undefined,
      canvasPosition: {}, //canvas的位置,因为canvas可能距离左上角的距离不是0
      mouseLocation: {}, //鼠标位置
      flag: false, //判断是竖线对比还是横线对比，竖线为false
      initWidth: 0, //经过自适应之后的图片宽度
      initHeight: 0,
      hoverLine1: null, //横线悬浮范围
      hoverLine2: null, //竖线悬浮范围
      hoverLine: null, //实际在移动的线的悬浮范围
      hoverHight: 0, //横线悬浮范围的高度
      hoverWidth: 0, //竖线悬浮范围的宽度
      content: null //canvas和线的父亲
    };
  },
  computed: {
    ...mapGetters(['imageList'])
  },
  watch: {
    imageList(newVal, oldVal = []) {
      this.imageLengthCheck();
    }
  },
  mounted() {
    window.addEventListener('resize', this.resize, true);
    window.addEventListener('keydown', this.handleHotKey, true);
    this.content = document.getElementsByClassName('canvas')[0];
    this.line1 = document.getElementById('line1');
    this.line2 = document.getElementById('line2');
    this.hoverLine1 = document.getElementById('line1-hover');
    this.hoverLine2 = document.getElementById('line2-hover');
    this.hoverLine = this.hoverLine1;
    this.line = this.line1;
    this.init();
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleHotKey, true);
    window.removeEventListener('resize', this.resize, true);
  },

  methods: {
    ...mapActions(['removeImages', 'emptyImages', 'setImages']),
    resize: throttle(100, function() {
      this.imgScale = 1;
      this.initCanvas();
      this.initLine();
      this.imagePosition = this.getImageInitPos(this.canvas, this.image1); //resize只重新绘图，不重新获取bitMap
      this.drawImage();
    }),
    init() {
      this.imgScale = 1;
      this.canvas = document.getElementById('canvas');
      this.cs = this.canvas.getContext('2d');
      this.imageLengthCheck();
      this.addEvents();
    },
    setParams() {
      this.initCanvas();
      this.initLine();
      this.initImage();
    },
    initCanvas() {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
      this.canvasPosition = this.canvas.getBoundingClientRect(); //canvas可能距离左上角的距离不是0
    },
    //获取图片初次加载时自适应后的值
    getImageInitPos(canvas, image) {
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = image.width;
      const ih = image.height;
      const canvasRadio = cw / ch;
      const imageRadio = iw / ih;
      let x = 0;
      let y = 0;
      let height = ch;
      let width = cw;
      let widthScaleRatio = iw / cw;
      let heightScaleRatio = ih / ch;
      if (canvasRadio > imageRadio) {
        //比较高，所以高占100%,宽居中
        width = canvas.height * imageRadio;
        x = (canvas.width - width) / 2;
        this.initHeight = ih / heightScaleRatio;
        this.initWidth = width;
      } else {
        //比较宽，所以宽占100%,高居中
        height = canvas.width / imageRadio;
        y = (canvas.height - height) / 2;
        this.initWidth = iw / widthScaleRatio;
        this.initHeight = height;
      }
      return {
        x,
        y,
        width,
        height
      };
    },
    //判断列表中是否有两张及以上的图
    imageLengthCheck() {
      if (this.imageList.length >= 2) {
        this.setParams();
      } else {
        const h = this.$createElement;
        this.$msgbox({
          title: 'warning',
          message: 'Please choose two images to compare',
          showCancelButton: false,
          confirmButtonText: 'back to file select',
          type: 'warning'
        }).then(action => {
          this.goBack();
        });
      }
    },
    //初始化线的属性, 使得线的初始位置居中
    initLine() {
      this.hoverWidth = Number(
        window.getComputedStyle(this.hoverLine1).width.slice(0, -2)
      );

      this.hoverLine1.style.height = this.canvas.height + 'px';
      this.hoverLine1.style.left =
        this.canvas.width / 2 +
        this.canvasPosition.left -
        this.hoverWidth / 2 +
        'px';
      this.line1.style.height = this.canvas.height + 'px';
      this.line2.style.width = this.canvas.width + 'px';
      this.leftDis = this.canvas.width / 2;
      this.line1.style.left = this.hoverWidth / 2 + 'px';

      this.hoverHight = Number(
        window.getComputedStyle(this.hoverLine2).height.slice(0, -2)
      );
      this.hoverLine2.style.width = this.canvas.width + 'px';
      this.hoverLine2.style.top =
        this.canvas.height / 2 +
        this.canvasPosition.top -
        this.hoverHight / 2 +
        'px';
      this.topDis = this.canvas.height / 2 + this.canvasPosition.top;
      this.line2.style.top = this.hoverHight / 2 + 'px';
    },
    //初始化图片
    initImage() {
      this.imgScale = 1;
      this.image1 = new Image();
      this.image2 = new Image();
      if (this.selectedList.length === 0) {
        this.selectedList.push(this.imageList[0]);
        this.selectedList.push(this.imageList[1]);
      }
      let imgSrc1 = getImageUrlSync(this.selectedList[0]); //默认只取列表中前两个进行比较
      let imgSrc2 = getImageUrlSync(this.selectedList[1]);
      this.image1.onload = async () => {
        this.imagePosition = this.getImageInitPos(this.canvas, this.image1);
        this.imageBitMap1 = await createImageBitmap(this.image1);
        this.image2.src = imgSrc2; //等待第一张图加载完毕再加载第二张图，然后一起绘制
      };
      this.image1.src = imgSrc1;
      this.image2.onload = async () => {
        this.imageBitMap2 = await createImageBitmap(this.image2);
        this.drawImage();
      };
    },
    //添加事件
    addEvents() {
      this.hoverLine.addEventListener('mousedown', this.handleLineDown, false);
      //鼠标滚动
      this.content.addEventListener(
        'mousewheel',
        evt => {
          this.handleScroll(evt); //鼠标滚动触发
        },
        false
      );
      this.canvas.addEventListener(
        'mousedown',
        this.handleMouseDown, //鼠标按下
        true
      );
      this.content.addEventListener('mouseup', this.handleMouseUp, true);
      this.canvas.addEventListener(
        'mousemove',
        evt => {
          this.handleMouseMove(evt);
        },
        true
      );
    },
    //鼠标按下事件
    handleMouseDown(evt) {
      this.mouseLocation = this.windowToCanvas(
        this.canvas,
        evt.clientX,
        evt.clientY
      );
      this.isMouseDown = true;
      this.canvas.style.cursor = 'move';
      // 禁用hoverLine对鼠标事件的监听
      this.hoverLine.style['pointer-events'] = 'none';
    },
    // 鼠标弹起
    handleMouseUp() {
      this.canvas.style.cursor = 'default';
      // 开启hoverLine对鼠标事件的监听
      this.hoverLine.style['pointer-events'] = 'auto';
      this.isMouseDown = false;
    },
    //鼠标移动
    handleMouseMove: throttle(30, function(event) {
      if (this.isMouseDown) {
        let mouseLocation = this.windowToCanvas(
          this.canvas,
          event.clientX,
          event.clientY
        );
        if (this.isDivArea({ x: event.clientX, y: event.clientY })) {
          let dx = mouseLocation.x - this.mouseLocation.x; //鼠标最新在的位置-鼠标按下时的位置
          let dy = mouseLocation.y - this.mouseLocation.y;
          this.mouseLocation = mouseLocation; //把最新的位置赋值给鼠标按下时的位置
          this.imagePosition.x += dx;
          this.imagePosition.y += dy;
        } else {
          //鼠标移动至画布范围外，置鼠标弹起
          this.canvas.style.cursor = 'default';
          this.isMouseDown = false;
        }
        this.drawImage();
      }
    }),
    //竖线移动事件
    handleLineDown(evt) {
      let oldLinePosition;
      let newLinePosition;

      if (this.flag) {
        oldLinePosition = Number(this.hoverLine.style.top.slice(0, -2));
      } else {
        oldLinePosition = Number(this.hoverLine.style.left.slice(0, -2));
      }
      let mouseX = evt.clientX;
      let mouseY = evt.clientY;
      this.content.onmousemove = evt => {
        let changeX = evt.clientX - mouseX;
        let changeY = evt.clientY - mouseY;
        if (this.flag) {
          newLinePosition = this.getUpdateLinePosition(
            oldLinePosition + changeY
          );
          this.topDis = newLinePosition + this.hoverHight / 2;
          this.hoverLine.style.top = newLinePosition + 'px';
        } else {
          newLinePosition = this.getUpdateLinePosition(
            oldLinePosition + changeX
          );
          this.leftDis = newLinePosition + this.hoverWidth / 2;
          this.hoverLine.style.left = newLinePosition + 'px';
        }
        this.drawImage();
      };
      this.content.onmouseup = evt => {
        this.content.onmousemove = null;
        this.content.onmouseup = null;
      };
    },
    //滚轮缩放事件
    handleScroll(evt) {
      if (this.isInImage({ x: evt.clientX, y: evt.clientY })) {
        let newMouseLocation = this.windowToCanvas(
          this.canvas,
          evt.clientX,
          evt.clientY
        );
        let mousex = newMouseLocation.x;
        let mousey = newMouseLocation.y;
        let delta = evt.wheelDelta / 360;
        this.imagePosition = this.zoom(mousex, mousey, delta);
        this.drawImage();
      }
    },
    //缩放
    zoom(mousex, mousey, delta) {
      if (this.flag) {
        mousey = this.topDis - this.canvasPosition.top;
      } else {
        mousex = this.leftDis - this.canvasPosition.left;
      }

      let factor = 1 + 0.1 * delta;
      let x = mousex - (mousex - this.imagePosition.x) * factor;
      let y = mousey - (mousey - this.imagePosition.y) * factor;
      let height = this.imagePosition.height * factor;
      let width = this.imagePosition.width * factor;
      this.imgScale *= factor;

      return {
        x,
        y,
        height,
        width
      };
    },
    //限制线的出界范围
    limitLine() {
      //计算canvas的范围
      let canvasLeft = this.canvasPosition.left;
      let canvaseRight = this.canvasPosition.left + this.canvasPosition.width;
      let canvasTop = this.canvasPosition.top;
      let canvasBottom = this.canvasPosition.top + this.canvasPosition.height;
      //计算hover层的范围
      let hoverLeft = canvasLeft - this.hoverWidth / 2;
      let hoverRight = canvaseRight + this.hoverWidth / 2;
      let hoverTop = canvasTop - this.hoverHight / 2;
      let hoverBottom = canvasBottom + this.hoverHight / 2;
      //计算线的范围
      let left =
        this.imagePosition.x + this.canvasPosition.left - this.hoverWidth / 2;
      let right =
        this.imagePosition.x +
        this.canvasPosition.left +
        this.initWidth * this.imgScale -
        this.hoverWidth / 2;
      let top =
        this.imagePosition.y + this.canvasPosition.top - this.hoverHight / 2;
      let bottom =
        this.imagePosition.y +
        this.canvasPosition.top +
        this.initHeight * this.imgScale -
        this.hoverHight / 2;

      //限制线在canvas的范围内
      if (top < hoverTop) {
        top = hoverTop;
      }
      if (bottom > hoverBottom) {
        bottom = hoverBottom;
      }
      if (left < hoverLeft) {
        left = hoverLeft;
      }
      if (right > hoverRight) {
        right = hoverRight;
      }
      //如果是横线对比则返回上下范围，竖线对比则返回左右范围
      let min, max;
      if (this.flag) {
        min = top;
        max = bottom;
      } else {
        min = left;
        max = right;
      }
      return { min, max };
    },
    //根据限制返回线的最新位置
    getUpdateLinePosition(newLinePosition) {
      let limit = this.limitLine();
      if (newLinePosition < limit.min) {
        newLinePosition = limit.min;
      }
      if (newLinePosition > limit.max) {
        newLinePosition = limit.max;
      }
      return newLinePosition;
    },

    //判断是否在图片范围内
    isInImage(point) {
      let left = this.imagePosition.x + this.canvasPosition.left;
      let right =
        this.imagePosition.x +
        this.canvasPosition.left +
        this.initWidth * this.imgScale;
      let top = this.imagePosition.y + this.canvasPosition.top;
      let bottom =
        this.imagePosition.y +
        this.canvasPosition.top +
        this.initHeight * this.imgScale;
      if (
        point.x > right ||
        point.x < left ||
        point.y < top ||
        point.y > bottom
      ) {
        return false;
      } else {
        return true;
      }
    },
    // 判断是否在画布范围内
    isDivArea(point) {
      if (
        point.x < 0 ||
        point.x > this.canvas.width ||
        point.y < 0 ||
        point.y > this.canvas.height
      ) {
        return false;
      }
      return true;
    },
    //windowToCanvas此方法用于鼠标所在点的坐标切换到画布上的坐标
    windowToCanvas(canvas, x, y) {
      return {
        x: x - this.canvasPosition.left,
        y: y - this.canvasPosition.top
      };
    },

    drawImage: throttle(50, function() {
      let { x, y, width, height } = this.imagePosition;
      let { cutLeft, cutHeight, useLeft, useHeight } = this.getImageParams();
      //清空画布再重新画图
      this.cs.clearRect(0, 0, canvas.width, canvas.height); //在给定的矩形内清除指定的像素
      this.cs.drawImage(
        this.imageBitMap1,
        x, //x
        y, //y
        width, //width
        height //height
      );
      this.cs.drawImage(
        this.imageBitMap2,
        0, //sx开始裁剪的位置
        0, //sy
        cutLeft, //swidth裁剪的宽度
        cutHeight, //sheight裁剪的高度
        x, //x画布上的x坐标
        y, //Y
        useLeft, //width要使用的图像宽度
        useHeight //height要使用的图像高度
      );
    }),
    //获取第二张图额外的信息，比如裁多少，用多少
    getImageParams() {
      let cutLeft = this.image2.width;
      let useLeft = this.imagePosition.width;

      let cutHeight = this.image2.height;
      let useHeight = this.imagePosition.height;

      if (this.flag) {
        //计算当前分割线相对于image的比例，并计算出相对于画布的高度。
        let scale =
          (this.topDis - this.imagePosition.y - this.canvasPosition.top) /
          (this.initHeight * this.imgScale);
        cutHeight = scale * this.image2.height;
        useHeight = scale * this.initHeight * this.imgScale;
      } else {
        //计算当前分割线相对于image的比例，并计算出相对于画布的宽度。
        let scale =
          (this.leftDis - this.imagePosition.x - this.canvasPosition.left) /
          (this.initWidth * this.imgScale);
        cutLeft = scale * this.image2.width;
        useLeft = scale * this.initWidth * this.imgScale;
      }
      return {
        cutLeft,
        cutHeight,
        useLeft,
        useHeight
      };
    },
    //切换对比方向
    changeDirection() {
      this.hoverLine.removeEventListener(
        'mousedown',
        this.handleLineDown,
        false
      );
      this.imgScale = 1;
      this.flag = !this.flag;
      if (this.flag) {
        this.hoverLine = this.hoverLine2;
        this.hoverLine1.style.display = 'none';
        this.hoverLine2.style.display = 'inline';
        this.line1.style.display = 'none';
        this.line2.style.display = 'inline';
        this.line = this.line2;
      } else {
        this.hoverLine = this.hoverLine1;
        this.hoverLine1.style.display = 'inline';
        this.hoverLine2.style.display = 'none';
        this.line1.style.display = 'inline';
        this.line2.style.display = 'none';
        this.line = this.line1;
      }
      this.setParams();
      this.hoverLine.addEventListener('mousedown', this.handleLineDown, false);
    },
    changeStatus() {
      this.line.style.display = this.status ? 'none' : 'inline';
      this.status = !this.status;
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        // 如果强制reload导致没有历史路由 唯一的历史就是当前页面 则回到默认的历史页面
        this.$router.push('/image/index');
      }
    },
    handleHotKey(event) {
      // esc
      if (event.keyCode === 27) {
        this.goBack();
      }
    },
    // 将其替换掉已选图片中较早选择的图片，即始终保持已选择图片为最后选择的两张
    handleClick(path) {
      if (!this.selectedList.includes(path)) {
        this.selectedList.shift();
        this.selectedList.push(path);
        this.initImage();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import '@/styles/variables.scss';
#image-drag-drop-compare {
  .changeButton {
    .tool-item {
      margin-left: 10px;
    }
    .tip {
      text-align: center;
      font-size: 12px;
      color: red;
    }
  }
  .router-back {
    display: inline-block;
    .btn {
      cursor: pointer;
      margin-right: 10px;
      color: $labelColor;
      &:hover {
        color: #303133;
      }
    }
  }

  .canvas {
    #canvas {
      position: absolute;
      left: 0px;
      background-color: white;
    }
    #line1-hover {
      position: absolute;
      background-color: transparent;
      width: 52px;
      height: 600px;
      #line1 {
        position: absolute;
        background-color: rgb(204, 193, 193);
        left: 0px;
        width: 2px;
        height: 600px;
      }
      &:hover {
        cursor: col-resize;
        #line1 {
          background-color: red;
        }
      }
    }

    #line2-hover {
      position: absolute;
      display: none;
      background-color: transparent;
      width: 1000px;
      height: 52px;
      #line2 {
        position: absolute;
        background-color: rgb(204, 193, 193);
        left: 0px;
        width: 1000px;
        height: 2px;
      }
      &:hover {
        cursor: row-resize;
        #line2 {
          background-color: red;
        }
      }
    }
  }
}
</style>
