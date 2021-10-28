<template>
  <div class="entry-card" style="cursor:pointer" @click="toDetail">
    <el-card>
      <div slot="header">
        <strong> {{ $t(title) }}</strong>
      </div>
      <div class="body" flex="main:left">
        <i :class="icon"></i>
        <article flex-box="1">{{ $t(desc) }}</article>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'entry-card',
  props: {
    title: {
      type: String,
      default: 'title'
    },
    desc: {
      type: String,
      default: 'desc'
    },
    icon: {
      type: String,
      default: 'el-icon-picture-outline'
    },
    route: {
      type: String,
      default: '/image/index'
    }
  },
  methods: {
    toDetail() {
      this.$router.push({
        path: this.route
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.entry-card {
  &:hover {
    .body > i {
      color: $primaryColor;
    }
  }
  .body {
    i {
      cursor: pointer;
      line-height: 80px;
      font-size: 4em;
      transition: color 0.3s;
      color: #606266;
      &:hover {
        color: $primaryColor;
      }
    }
    article {
      margin-left: 20px;
      height: 100px;
      color: $labelColor;
    }
  }
}
</style>
