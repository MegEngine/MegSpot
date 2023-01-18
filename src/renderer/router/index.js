import Vue from 'vue'
import Router from 'vue-router'
import Performance from '@/tools/performance'
import store from '../store'
// 引入路由表
import routes from './routes'
import { trackEvent } from '@/utils/analyze'

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}
Vue.use(Router)
const router = new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: routes
})

var end = null
router.beforeEach((to, from, next) => {
  end = Performance.startExecute(`${from.path} => ${to.path} 路由耗时`) // 路由性能监控
  setTimeout(() => {
    end()
  }, 0)
  next()
})

router.afterEach((to, from) => {
  // 储存路由目标跳转
  store.dispatch('preferenceStore/setLastRouterPath', to.path).then(() => {
    trackEvent('page_view', {
      category: 'change-view',
      view: to.path,
      from: from.path
    })
  })
})
export default router
