<template>
  <div>
    <div class="title">关于系统</div>
    <div class="items">
      <div v-for="[name, value] in aboutInfo" class="item" flex="cross:center">
        <div class="name">{{ name }}</div>
        <div class="value">{{ value }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      aboutInfo: [
        ['当前所在页面:', this.$route.path],
        ['当前页面名称:', this.$route.name],
        ['Vue.js版本:', require('vue/package.json').version],
        ['Electron版本:', process.versions.electron || '浏览器环境'],
        ['Node版本:', process.versions.node || '浏览器环境'],
        ['所运行的系统:', require('os').platform() + require('os').arch()]
      ]
    };
  },
  mounted() {
    console.log(this.$route);
  }
};
</script>

<style scoped>
.title {
  color: #888;
  font-size: 18px;
  font-weight: initial;
  letter-spacing: 0.25px;
  margin-top: 10px;
}

.items {
  margin-top: 8px;
}

.item {
  margin-bottom: 6px;
  line-height: 24px;
}

.item .name {
  color: #6a6a6a;
  margin-right: 6px;
}

.item .value {
  color: #35495e;
  font-weight: bold;
}
</style>
