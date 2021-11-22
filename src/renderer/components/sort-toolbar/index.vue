<template>
  <div class="sort-toolbar-container">
    <el-tooltip
      :content="$t(this.allSelectd ? 'general.clearAll' : 'general.selectAll')"
      :open-delay="300"
    >
      <vxe-checkbox
        :value="allSelectd"
        :indeterminate="oneOrMoreSelected"
        @change="handleSelectAll"
      ></vxe-checkbox>
    </el-tooltip>
    <el-button>
      Save
    </el-button>
    <el-button>
      Import
    </el-button>
    <el-button>
      Export
    </el-button>
  </div>
</template>

<script>
export default {
  props: {
    allSelectd: {
      type: Boolean,
      default: false
    },
    oneOrMoreSelected: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleSelectAll(...rest) {
      this.$emit('change', ...rest);
    }
  }
};
</script>

<style lang="scss" scoped>
.sort-toolbar-container {
  margin: 5px 0;
}
</style>
