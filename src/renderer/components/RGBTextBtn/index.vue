<template>
  <div
    :class="['rgb-text-btn', showRGBText ? 'active' : '']"
    :title="$t('hotkey.rgbText') + `\n${$t('hotkey.key')}: 'c'`"
    @click="toggleShowRGBText"
  >
    RGB
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('preferenceStore')
export default {
  computed: {
    ...mapGetters(['preference']),
    showRGBText: {
      get() {
        return this.preference.showRGBText // false
      },
      set(newVal) {
        this.setPreference({ showRGBText: newVal })
      }
    }
  },
  methods: {
    ...mapActions(['setPreference']),
    toggleShowRGBText() {
      this.showRGBText = !this.showRGBText
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.rgb-text-btn {
  border: 1px solid #707078;
  border-radius: 5px;
  color: #707078;
  &:hover {
    cursor: pointer;
  }
}
.rgb-text-btn.active {
  border: 1px solid $primaryColor;
  color: $primaryColor;
}
</style>
