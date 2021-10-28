import router from './router'
import Performance from '@/tools/performance'

var end = null
router.beforeEach((to, from, next) => {
  end = Performance.startExecute(`${from.path} => ${to.path} 路由耗时`) // 路由性能监控
  next()
  setTimeout(() => {
    end()
  }, 0)
})

router.afterEach(() => {})
