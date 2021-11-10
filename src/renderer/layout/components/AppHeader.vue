<template>
  <el-header class="header" flex="cross:center" height="42px">
    <div class="nav-container" flex="main:justify cross:center" flex-box="1">
      <div class="left-menu">
        <el-breadcrumb class="nav" separator="|">
          <el-breadcrumb-item :to="{ path: '/dashboard' }">
            <img
              src="../../assets/images/big_logo_white.png"
              style="vertical-align: middle; height:40px"
            />
          </el-breadcrumb-item>
          <el-breadcrumb-item v-if="subNav">{{ subNav }}</el-breadcrumb-item>
          <el-breadcrumb-item v-else>{{ $t('nav.toHome') }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="right-menu">
        <i class="el-icon-s-tools" @click="$refs.aboutDialog.show()"></i>
        <!-- 先隐藏自动更新主动触发按钮  <i
          <svg-icon icon-class="update"></svg-icon> -->
      </div>
    </div>
    <AboutDialog ref="aboutDialog" />
    <UpdateDialog ref="updateDialog" />
  </el-header>
</template>
<script>
import AboutDialog from './AboutDialog';
import UpdateDialog from './UpdateDialog';
export default {
  name: 'AppHeader',
  components: { AboutDialog, UpdateDialog },
  data() {
    return {
      subNav: ''
    };
  },
  watch: {
    '$route.name': {
      immediate: true,
      handler: function(name) {
        switch (name) {
          case 'dashboard':
            this.subNav = '';
            break;
          case 'image-root':
          case 'image-compare':
          case 'image-drag-drop-compare':
          case 'image-browser':
            this.subNav = this.$t('dashboard.entries.image.title');
            break;
          case 'video-root':
          case 'video-compare':
            this.subNav = this.$t('dashboard.entries.video.title');
            break;
          default:
            console.error('未知的路由名称请修改AppHeader.vue:' + name);
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import '@/styles/variables.scss';
.header {
  background: #132f51;
  box-shadow: 0px 3px 7px 0px rgba(36, 46, 66, 0.15);
  color: #ffffff;
  padding-left: 0px;
  padding-right: 15px;
  .nav-container {
    .right-menu {
      color: $labelColor;
      margin-left: auto;
      .about {
        vertical-align: bottom;
      }
    }
    .left-menu {
      .nav {
        display: inline-block;
        vertical-align: bottom;
        ::v-deep {
        }
      }
      .logo-style {
        font-size: 23px;
        width: 100px;
        vertical-align: middle;
      }
    }
  }

  ::v-deep {
    .el-breadcrumb__item {
      line-height: inherit;
      float: none;
    }
    .el-breadcrumb__separator {
      color: rgba(255, 255, 255, 0.2);
      margin-left: 9px;
      margin-right: 9px;
    }
    .el-breadcrumb__item:last-child .el-breadcrumb__inner {
      font-size: 14px;
      font-weight: 600;
      color: white;
    }
    .el-menu--horizontal .el-menu-item:not(.is-disabled):focus,
    .el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
      color: #181725;
    }
    .el-menu::after {
      display: inline-block;
    }
    .el-tabs__content {
      height: 100%;
    }
  }
}
</style>
