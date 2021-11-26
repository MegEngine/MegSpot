<template>
  <div
    id="thumbnail-root"
    :class="['thumbnail', fileList.includes(file.path) ? 'in-image-list' : '']"
    flex="main:justify"
    @click="updateImageQueue"
  >
    <el-checkbox v-model="checked"></el-checkbox>
    <div class="container" flex="main:center cross:center">
      <slot :src="src"></slot>
    </div>
    <div class="name">
      {{ file.name }}
    </div>
  </div>
</template>

<script>
import { formatFileSize } from '@/utils/file';
import { getImageUrlSync } from '@/utils/image';
export default {
  name: 'imageThumbnail',
  props: {
    previewType: {
      type: String,
      default: ''
    },
    file: {
      type: Object,
      default: () => {}
    },
    fileList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    addVuexItem: {
      type: Function,
      default: () => {}
    },
    removeVuexItem: {
      type: Function,
      default: () => {}
    }
  },
  computed: {
    path() {
      return this.file.path;
    },
    src() {
      return getImageUrlSync(this.path).replace(/#/g, '%23');
    }
  },
  data() {
    return {
      checked: false
    };
  },
  watch: {
    fileList(val) {
      let newList = val;
      this.checked = newList.includes(this.file.path) ? true : false;
    }
  },
  mounted() {
    this.checked = this.fileList.includes(this.file.path) ? true : false;
  },
  methods: {
    formatFileSize,
    updateImageQueue(event) {
      event.preventDefault();
      if (this.fileList.includes(this.file.path)) {
        this.removeVuexItem(this.file.path);
      } else {
        this.addVuexItem(this.file.path);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.thumbnail {
  flex-direction: column;
  height: 220px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #dee1e5;
  position: relative;
  border-radius: 2px;
  &:hover {
    cursor: pointer;
  }
  .name {
    text-align: center;
    padding: 2px 0 10px 0;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .container {
    flex-grow: 1;
    flex-basis: 22px;
    width: 100%;
    overflow: hidden;
  }
  .el-checkbox {
    position: absolute;
    right: 11px;
    top: 5px;
  }
}
.in-image-list {
  border: 1px solid #1067d1;
}
</style>
