<template>
  <div class="dashboard-container">
    <el-row type="flex" justify="space-around">
      <el-col :span="7" v-for="item in tools" :key="item.title">
        <entry-card
          :title="item.title"
          :desc="item.desc"
          :icon="item.icon"
          :route="item.route"
        >
        </entry-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import EntryCard from './EntryCard';
export default {
  name: 'dashboard',
  components: { EntryCard },
  data() {
    return {
      tools: [
        {
          title: 'dashboard.entries.image.title',
          desc: 'dashboard.entries.image.desc',
          icon: 'el-icon-picture-outline',
          route: '/image/index'
        },
        {
          title: 'dashboard.entries.video.title',
          desc: 'dashboard.entries.video.desc',
          icon: 'el-icon-video-camera',
          route: '/video/index'
        }
      ]
    };
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    width: 100%;
    margin-top: 30px;
  }
}
</style>
