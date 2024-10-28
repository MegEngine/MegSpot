<template>
  <div class="gallery">
    <el-button
      type="primary"
      size="mini"
      round
      @click="showModal"
      :disabled="!sortList.length"
      :title="$t('gallery.showTip')"
    >
      {{ $t('general.selected') }}
    </el-button>
    <div class="modal" @click="handleWrapperClick">
      <Split :gutterSize="4">
        <SplitArea :size="size" :minSize="minSize" :style="{ minWidth: minSize + 'px', maxWidth: maxSize + 'px' }">
          <div class="container" @animationend="disappearModal" @click.stop>
            <div class="toolbar" flex="cross:center">
              <el-tooltip :content="$t('gallery.smartSortTip')" placement="right-start">
                <el-button type="primary" class="btn" @click="smartSort">{{ $t('gallery.smartSort') }}</el-button>
              </el-tooltip>
              <el-tooltip :content="$t('gallery.enableNameSortTip')" placement="right-start">
                <el-checkbox v-model="enableNameSort" class="btn">{{ $t('gallery.enableNameSort') }}</el-checkbox>
              </el-tooltip>
              <div>
                <el-tooltip :content="$t('gallery.clear')" placement="right-start">
                  <span @click="handleClearAll" class="clear-btn">
                    <svg-icon icon-class="bin" style="color: red" />
                  </span>
                </el-tooltip>
              </div>
            </div>
            <vue-scroll>
              <draggable
                v-model="sortList"
                v-bind="dragOptions"
                @start="drag = true"
                @end="drag = false"
                class="sortList"
              >
                <transition-group id="drag" type="transition" name="flip-list">
                  <div v-for="(item, index) in sortList" :key="index" class="dragItem" @click="handleClick(item)">
                    <div
                      :class="[
                        (focusListIndex.length && focusListIndex.includes(index)) || focusList.includes(item)
                          ? 'focus-item'
                          : ''
                      ]"
                    >
                      <div>
                        <span @click.stop="$emit('remove', item)" class="close-button" :title="$t('general.delete')">
                          <svg-icon icon-class="bin" />
                        </span>
                      </div>
                      <div class="content" flex="main:center cross:center">
                        <img name="dragItem" loading="lazy" decoding="async" :src="getImageUrlSync(item)" v-if="isImage(item)" />
                        <video name="dragItem" loading="lazy" :src="getImageUrlSync(item)" v-if="isVideo(item)" />
                      </div>
                      <div class="name" :title="item">
                        <span v-html="$options.filters.getFileName(item)"></span>
                      </div>
                    </div>
                  </div>
                </transition-group>
              </draggable>
            </vue-scroll>
          </div>
        </SplitArea>
        <SplitArea :size="100 - size">
          <div class="blank"></div>
        </SplitArea>
      </Split>
    </div>
  </div>
</template>

<script>
import { getImageUrlSync } from '@/utils/image'
import { isImage, isVideo } from '@/components/file-tree/lib/util'
import draggable from 'vuedraggable'
import { arraySortByName } from '@/utils/file'
import { i18nRender } from '@/lang'
import { DELIMITER } from '@/constants'

export default {
  name: 'gallery',
  components: { draggable },
  props: {
    selectedList: {
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
      visible: false,
      enableNameSort: true,
      size: 70,
      itemSize: {
        width: 212,
        height: 168,
        padding: 2,
        margin: 10
      },
      dragOptions: {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost',
        scrollPanel: {
          scrollingX: false
        },
        bar: {
          minSize: 0
        }
      },
      drag: false
    }
  },
  computed: {
    maxColumnLength() {
      return Math.floor(document.body.clientWidth / this.itemSize.width)
    },
    columnItemNum() {
      return Math.max(1, Math.floor(document.body.clientHeight / this.itemSize.height))
    },
    minSize() {
      return this.itemSize.width + 24
    },
    maxSize() {
      return Math.min(
        Math.ceil(this.selectedList.length / this.columnItemNum) * this.itemSize.width,
        (document.body.clientWidth * 4) / 5
      )
    },
    sortList: {
      get() {
        return this.selectedList
      },
      set(newVal) {
        this.$emit('update', newVal)
      }
    }
  },
  watch: {},
  mounted() {
    window.addEventListener('keydown', this.handleHotKey, true)
    this.modalItem = document.getElementsByClassName('modal')[0]
    this.dragList = document.getElementsByClassName('container')[0]
  },
  activated() {
    window.addEventListener('keydown', this.handleHotKey, true)
  },
  deactivated() {
    window.removeEventListener('keydown', this.handleHotKey, true)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleHotKey, true)
  },
  methods: {
    isImage,
    isVideo,
    getImageUrlSync,
    handleHotKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.keyCode === 70) {
        if (this.visible) {
          this.hideModal()
        } else {
          this.showModal()
        }
      }
    },
    handleWrapperClick() {
      if (!this.closeOnClickModal) return
      this.hideModal()
    },
    showModal() {
      this.modalItem.style.display = 'inline'
      this.modalItem.classList.remove('disappearModal')
      this.modalItem.classList.add('appearModal')
      this.dragList.classList.remove('disappearDragList')
      this.dragList.classList.add('appearDragList')
      this.visible = true
    },
    hideModal(e) {
      this.modalItem.classList.remove('appearModal')
      this.modalItem.classList.add('disappearModal')
      this.dragList.classList.remove('appearDragList')
      this.dragList.classList.add('disappearDragList')
      this.visible = false
    },
    disappearModal() {
      if (this.visible === false) {
        this.modalItem.style.display = 'none'
      }
    },
    handleClick(path) {
      this.$emit('click', path)
    },
    handleClearAll() {
      this.$confirm(i18nRender('gallery.clearTip') + '?', i18nRender('gallery.clear'), {
        confirmButtonText: `${i18nRender('common.confirm')} ${i18nRender('gallery.clear')}`,
        cancelButtonText: i18nRender('common.cancel'),
        type: 'warning',
        'append-to-body': true
      }).then(() => {
        this.sortList = []
        this.hideModal()
      })
    },
    smartSort() {
      if (!this.sortList.length) return
      const getName = (filePath) => this.$options.filters.getFileName(filePath, false)
      const nameMap = new Map()
      let iterator = nameMap
      const multiple = []
      const single = []
      this.sortList.forEach((path) => {
        const name = getName(path)
        if (nameMap.has(name)) {
          nameMap.get(name).push(path)
        } else {
          nameMap.set(name, [path])
        }
      })
      if (this.enableNameSort) {
        iterator = Array.from(nameMap.entries()).sort(([nameA], [nameB]) => arraySortByName(nameA, nameB))
      }
      for (const [name, pathArr] of iterator) {
        if (pathArr.length === 1) {
          single.push(pathArr[0])
        } else {
          multiple.push(...pathArr)
        }
      }
      this.sortList = [...multiple, ...single]
      // console.log('smartSort', this.sortList);
    }
  }
}
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

    .split {
      overflow-y: hidden;

      .container {
        position: relative;
        background-color: #f1f0ed;
        width: 100%;
        height: 100%;
        left: -200px;
        overflow-y: hidden;

        .toolbar {
          height: 28px;
          margin-top: 5px;

          .btn {
            margin-left: 10px;
          }

          .clear-btn {
            position: absolute;
            top: 10px;
            right: 10px;

            // margin-left: 20px;
            &:hover {
              cursor: pointer;
            }
          }
        }

        .sortList {
          padding-right: 10px;
          padding-bottom: 33px;

          ::v-deep {
            .el-button--mini {
              padding: 1px 5px;
            }
          }

          .setting-btn {
            float: right;

            .svg-icon {
              font-size: 18px;
            }
          }

          #drag {
            :first-child {
              // margin-top: 0 !important;
            }

            width: 100%;
            display: flex;
            flex-wrap: wrap;

            .dragItem:hover {
              .close-button {
                display: initial;
              }
            }

            .dragItem {
              position: relative;
              margin: 10px 0 0 10px;
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

    .blank {
      width: 100%;
      height: 100%;
    }
  }
}

.focus-item {
  border: 1px solid #1067d1;
}

.appearModal {
  animation-name: appearOpacity;
  animation-duration: 0.2s;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
}

.disappearModal {
  animation-name: disappearOpacity;
  animation-duration: 0.2s;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
}

.appearDragList {
  animation-name: appear;
  animation-duration: 0.2s;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
}

.disappearDragList {
  animation-name: disappear;
  animation-duration: 0.2s;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
}

#drag::-webkit-scrollbar {
  display: none;
}
</style>
