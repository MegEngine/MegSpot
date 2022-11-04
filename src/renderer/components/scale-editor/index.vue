<template>
  <div class="scale-editor" @click.stop>
    <span
      v-show="!scaleEditorVisible"
      class="scale-number"
      :style="{ color: textColor }"
      @dblclick="handleScaleDbClick"
    >
      {{ scaleData }}
    </span>
    <div v-show="scaleEditorVisible" class="scale-input">
      <el-tooltip :disabled="preference.scaleOptions.length === 0" effect="light" popper-class="select-content">
        <el-input-number
          v-model="scaleData"
          size="small"
          :precision="2"
          :step="0.1"
          :min="0"
          @change="handleChange"
        ></el-input-number>
        <div slot="content" flex="dir:top">
          <span v-for="item in preference.scaleOptions" :key="item" class="select-item" @click="setNewScale(item)">
            {{ item }}
          </span>
        </div>
      </el-tooltip>
      <el-button type="primary" size="mini" @click="handleScaleReset">reset</el-button>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import SearchInput from '@/components/search-input'
const { mapGetters } = createNamespacedHelpers('preferenceStore')
export default {
  name: 'ScaleEditor',
  components: { SearchInput },
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
    setNewScale(newScalse) {
      this.$emit('update', Number(newScalse))
    },
    handleScaleDbClick() {
      this.$emit('show')
    },
    handleScaleReset() {
      this.$emit('reset')
    },
    handleChange(scale, oldScale) {
      this.scaleData = scale
    }
  },
  computed: {
    ...mapGetters(['preference']),
    scaleData: {
      get() {
        return this.scale
      },
      set(newVal) {
        if (newVal.toString() !== this.scale.toString()) {
          this.setNewScale(newVal)
        }
      }
    },
    textColor() {
      return this.preference.background.mode.toLowerCase().includes('dark') ? '#fff' : 'black'
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.scale-editor {
  position: absolute;
  bottom: 4px;
  left: 4px;
  .scale-number {
    user-select: none;
  }
  ::v-deep {
    .el-input-number {
      width: 100px;
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
<style rel="stylesheet/scss" lang="scss">
.select-content {
  padding: 1px 0;
  .select-item {
    padding: 0 2px;
    min-width: 24px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #606266;
    &:hover {
      cursor: pointer;
      background-color: #81b0f7;
    }
  }
}
</style>
