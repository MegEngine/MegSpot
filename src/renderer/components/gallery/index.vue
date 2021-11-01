<template>
  <div class="gallery">
    <div @click="showModal">
      <slot name="headButton"></slot>
    </div>
    <div class="modal" @click.self="handleWrapperClick">
      <div class="container" @animationend="disappearModal">
        <vxe-list
          :data="sortList"
          class="list"
          :height="height"
          :scroll-y="{ gt: 0 }"
        >
          <template #default="{ items }">
            <draggable v-model="sortList" id="drag">
              <div
                v-for="(item, index) in items"
                :key="item"
                class="dragItem"
                @click="handleClick(item)"
              >
                <div
                  :title="item"
                  :class="[
                    (focusListIndex.length && focusListIndex.includes(index)) ||
                    focusList.includes(item)
                      ? 'focus-item'
                      : ''
                  ]"
                >
                  <div>
                    <span
                      @click="$emit('remove', item)"
                      title="close this item"
                      class="close-button"
                      :title="$t('general.delete')"
                    >
                      <svg-icon icon-class="bin" />
                    </span>
                  </div>
                  <div class="content" flex="main:center cross:center">
                    <slot
                      name="dragItem"
                      :src="getImageUrlSync(item)"
                      :alt="item | getFileName"
                    ></slot>
                  </div>
                  <div class="name">
                    <span id="fileName">{{ item | getFileName }}</span>
                  </div>
                </div>
              </div>
            </draggable>
          </template>
        </vxe-list>
      </div>
    </div>
  </div>
</template>
<script>
import { getImageUrlSync } from '@/utils/image';
import draggable from 'vuedraggable';

export default {
  name: 'gallery',
  components: { draggable },
  props: {
    sortData: {
      type: Array,
      required: true,
      default: () => []
    },
    closeOnClickModal: {
      type: Boolean,
      default: true
    },
    focusList: {
      type: Array,
      default: () => []
    },
    focusListIndex: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      modalItem: null,
      visible: false
    };
  },
  computed: {
    height() {
      return document.body.clientHeight;
    },
    sortList: {
      get() {
        return this.sortData;
      },
      set(newVal) {
        this.$emit('update', newVal);
      }
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleHotKey, true);
    this.modalItem = document.getElementsByClassName('modal')[0];
    this.dragList = document.getElementsByClassName('container')[0];
  },
  activated() {
    window.addEventListener('keydown', this.handleHotKey, true);
  },
  deactivated() {
    window.removeEventListener('keydown', this.handleHotKey, true);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleHotKey, true);
  },
  methods: {
    getImageUrlSync,
    handleHotKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.keyCode === 70) {
        if (this.visible) {
          this.hideModal();
        } else {
          this.showModal();
        }
      }
    },
    handleWrapperClick() {
      if (!this.closeOnClickModal) return;
      this.hideModal();
    },
    showModal() {
      this.modalItem.style.display = 'inline';
      this.modalItem.classList.remove('disappearModal');
      this.modalItem.classList.add('appearModal');
      this.dragList.classList.remove('disappearDragList');
      this.dragList.classList.add('appearDragList');
      this.visible = true;
    },
    hideModal(e) {
      this.modalItem.classList.remove('appearModal');
      this.modalItem.classList.add('disappearModal');
      this.dragList.classList.remove('appearDragList');
      this.dragList.classList.add('disappearDragList');
      this.visible = false;
    },
    disappearModal() {
      if (this.visible === false) {
        this.modalItem.style.display = 'none';
      }
    },
    handleClick(path) {
      this.$emit('click', path);
    }
  }
};
</script>
<style lang="scss" scoped>
@import '@/styles/variables.scss';
@keyframes appearOpacity {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes disappearOpacity {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes appear {
  from {
    left: -200px;
  }
  to {
    left: 0px;
  }
}
@keyframes disappear {
  from {
    left: 0;
  }
  to {
    left: -200px;
  }
}
.gallery {
  display: inline-block;
  .modal {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    opacity: 0;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: none;
    z-index: 1000;
    .container {
      background-color: #f1f0ed;
      position: absolute;
      width: 214px;
      height: 100%;
      left: -200px;
      .list {
        height: 100%;
        #drag {
          :first-child {
            margin-top: 0 !important;
          }
          float: left;
          height: 100%;
          margin: 5px;
          padding: 0;
          overflow: auto;
          .dragItem:hover {
            .close-button {
              display: initial;
            }
          }
          .dragItem {
            position: relative;
            margin-top: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
            border: 1px solid #dee1e5;
            .close-button {
              display: none;
              position: absolute;
              top: 10px;
              right: 10px;
              z-index: 1000;
              .svg-icon {
                color: $primaryColor;
              }
            }
            .close-button:hover {
              cursor: pointer;
              .svg-icon {
                color: red;
              }
            }
            .content {
              width: 200px;
              height: 130px;
              :first-child {
                max-width: 200px;
                max-height: 130px;
              }
            }
            .name {
              width: 200px;
              text-align: center;
              padding: 5px 3px;
              font-size: 12px;
              overflow: hidden;
              text-overflow: ellipsis;
              word-break: break-word;
            }
          }
        }
      }
    }
  }
}
.focus-item {
  border: 1px solid #1067d1;
}
.appearModal {
  animation-name: appearOpacity;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
}
.disappearModal {
  animation-name: disappearOpacity;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
}
.appearDragList {
  animation-name: appear;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
}
.disappearDragList {
  animation-name: disappear;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
}
#drag::-webkit-scrollbar {
  display: none;
}
</style>
