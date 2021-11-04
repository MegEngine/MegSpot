<template>
  <div class="entry-card" style="cursor:pointer" @click="toDetail">
    <el-card>
      <div slot="header" class="header">
        <i :class="icon"></i>
        <strong> {{ $t(title) }}</strong>
      </div>
      <div class="body">
        <article>{{ desc }}</article>
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
  height: 100%;
  margin-left: 30px;
  margin-right: 30px;
  &:hover {
    .header {
      transition: color 0.4s;
      color: $primaryColor;
    }
  }
  .body {
    article {
      margin-left: 20px;
      color: $labelColor;
    }
  }
}
</style>
