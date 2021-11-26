<template>
  <div class="search-input">
    <el-input
      size="mini"
      maxlength="80"
      suffix-icon="el-icon-search"
      :value="value"
      clearable
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
      ref="searchInput"
    >
      <template v-for="item in slots" :slot="item"
        ><slot :name="item"></slot
      ></template>
    </el-input>
  </div>
</template>

<script>
export default {
  name: 'SearchInput',
  props: {
    value: [String, Number],
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      slots: ['prefix', 'suffix', 'prepend', 'append']
    };
  },
  methods: {
    onInput(value) {
      this.$emit('input', value);
    },
    onChange(value) {
      this.$emit('change', value);
    },
    onFocus(event) {
      this.$emit('focus', event);
    },
    onBlur(event) {
      this.$emit('blur', event);
    },
    focus() {
      if (this.$refs && this.$refs.searchInput) {
        this.$refs.searchInput.focus();
      }
    },
    blur() {
      if (this.$refs && this.$refs.searchInput) {
        this.$refs.searchInput.blur();
      }
    }
  }
};
</script>

<style scoped></style>

<style>
.search-input .el-input__inner {
  color: rgba(0, 0, 0, 0.55) !important;
  border-radius: 2px !important;
  height: 26px !important;
  line-height: 26px !important;
  padding-left: 5px;
}
.search-input .el-input__icon {
  font-size: 14px;
}
</style>
