<template>
  <div class="manage-selected-container">
    <div @click="show">
      <slot />
    </div>
    <el-dialog
      :title="$t('general.selected')"
      class="dialog"
      :visible.sync="visible"
      width="90%"
      :close-on-press-escape="false"
    >
      <div class="content">
        <div style="text-align:right">
          <span>{{ $t('general.sortDialogTips') }}</span>
          <el-button
            type="text"
            size="small"
            :disabled="!dragData.length"
            @click="$emit('clearAll')"
          >
            {{ $t('general.clearAll') }}
          </el-button>
        </div>
        <draggable v-model="dragData">
          <div v-for="item in dragData" class="drag-item" :key="item">
            <span>{{ item }}</span>
            <i
              style="float:right"
              class="el-icon-close"
              @click="$emit('remove', item)"
            ></i>
          </div>
        </draggable>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: 'ManageSelectedBtn',
  components: { draggable },
  props: {
    sortData: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  computed: {
    dragData: {
      get() {
        return this.sortData;
      },
      set(val) {
        this.$emit('update', val);
      },
    },
  },
  methods: {
    // 提供给外部直接调用。
    show() {
      this.visible = true;
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/variables.scss';
.manage-selected-container {
  display: inline-block;
  .dialog {
    .content {
      max-height: 700px;
      overflow: scroll;
    }
    .drag-item {
      position: relative;
      display: block;
      padding: 0.75rem 1.25rem;
      background-color: #fff;
      border: 1px solid rgba(0, 0, 0, 0.125);
      span {
        font-size: 14px;
      }
    }
  }
}
</style>
