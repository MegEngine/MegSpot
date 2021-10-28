<template>
  <div class="app-wrapper">
    <el-container class="main-container">
      <AppHeader></AppHeader>
      <app-main></app-main>
    </el-container>
  </div>
</template>
<script>
import AppMain from './components/AppMain';
import AppHeader from './components/AppHeader';

export default {
  name: 'layout',
  components: {
    AppHeader,
    AppMain
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.app-wrapper {
  position: relative;
  .main-container {
    height: 100vh;
    flex-direction: column;
    background: #181725;
  }
}
</style>
