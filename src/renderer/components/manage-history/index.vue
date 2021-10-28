<template>
  <span class="manage-selected-container">
    <div @click="show">
      <slot />
    </div>
    <el-dialog
      :title="$t('general.history')"
      class="dialog"
      :visible.sync="visible"
      width="90%"
      :close-on-press-escape="false"
    >
      <div class="content">
        <div style="text-align:right">
          <el-button
            type="text"
            size="small"
            :disabled="!historyData.length"
            @click="handleClear"
          >
            {{ $t('general.clearAll') }}
          </el-button>
        </div>
        <div
          v-for="item in historyData"
          class="drag-item"
          :key="item"
          @click="$emit('select', item)"
        >
          <span :class="{ highlight: item === selected }">{{ item }}</span>
          <i
            style="float:right"
            class="el-icon-close"
            @click="handleRemove"
          ></i>
        </div>
      </div>
    </el-dialog>
  </span>
</template>
<script>
export default {
  name: 'ManageHistory',
  components: {},
  model: {
    prop: 'historyData',
    event: 'update',
  },
  props: {
    historyData: {
      type: Array,
      required: true,
      default: () => [],
    },
    selected: {
      type: String,
      required: false,
      default: '',
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  computed: {},
  methods: {
    // 提供给外部直接调用。
    show() {
      !this.disabled && (this.visible = true);
    },
    handleClear() {
      this.$emit('update', []);
    },
    handleRemove(item) {
      const tmp = [...this.historyData];
      tmp.splice(this.historyData.indexOf(item), 1);
      this.$emit('update', tmp);
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
    .highlight {
      color: $primaryColor;
    }
  }
}
</style>
