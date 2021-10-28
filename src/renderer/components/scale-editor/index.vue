<template>
  <div class="scale-editor" @click.stop>
    <span
      v-show="!scaleEditorVisible"
      class="scale-number"
      @dblclick="handleScaleDbClick"
    >
      {{ scaleData }}
    </span>
    <div v-show="scaleEditorVisible" class="scale-input">
      <el-input-number
        v-model="scaleData"
        size="small"
        :precision="2"
        :step="0.1"
        :min="0"
        @change="handleChange"
      ></el-input-number>
      <el-button type="primary" size="mini" @click="handleScaleReset"
        >reset
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScaleEditor',
  props: {
    scaleEditorVisible: {
      type: Boolean,
      required: true
    },
    scale: {
      type: String | Number,
      required: true
    }
  },
  methods: {
    handleScaleDbClick() {
      this.$emit('show');
    },
    handleScaleReset() {
      this.$emit('reset');
    },
    handleChange(scale, oldScale) {
      this.scaleData = scale;
    }
  },
  computed: {
    scaleData: {
      get() {
        return this.scale;
      },
      set(newVal) {
        if (newVal !== this.scale) this.$emit('update', newVal);
      }
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.scale-editor {
  position: absolute;
  bottom: 2px;
  left: 2px;
  ::v-deep {
    .el-input-number {
      width: 80px;
      line-height: 30px;
      .el-input--small {
        height: 20px;
        line-height: 20px;
        .el-input__inner {
          height: 20px;
          color: black;
        }
      }
      .el-input-number__increase,
      .el-input-number__decrease {
        width: 20px;
        height: 18px;
        line-height: 18px;
      }
    }
    .el-button {
      padding: 2.5px 6px;
    }
  }
}
</style>
