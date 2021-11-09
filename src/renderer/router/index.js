import Vue from 'vue';
import Router from 'vue-router';
import Performance from '@/tools/performance';
// 引入路由表
import routes from './routes';
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};
Vue.use(Router);
const router = new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: routes
});

var end = null;
router.beforeEach((to, from, next) => {
  end = Performance.startExecute(`${from.path} => ${to.path} 路由耗时`); // 路由性能监控
  next();
  setTimeout(() => {
    end();
  }, 0);
});

router.afterEach((to,from) => {
  console.log('to', to);
});
export default router;
