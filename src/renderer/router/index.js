import Vue from 'vue';
import Router from 'vue-router';
// 引入路由表
import routes from './routes';
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};
Vue.use(Router);
const router = new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: routes
});
router.beforeEach(async (to, from, next) => {
  // ...
  if (from.name == 'viewer-root') {
    const activeMatch = from.matched.find(
      (item) => item.name === 'viewer-root'
    );
    if (activeMatch?.instances?.default?.dirty || false) {
      await activeMatch?.instances?.default.saveCheck();
    }
  }
  next();
});
export default router;
