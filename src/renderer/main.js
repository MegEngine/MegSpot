import Vue from 'vue';
import App from './App';
import store from './store';
import router from './router';
// 引用element
import ElementUI from 'element-ui';
// 日志
import log from '@/log';
import './error';
import './icons';
import '@/styles/index.scss';
import '../../node_modules/flex.css/dist/flex.css';
// 国际化
import i18n from './lang'; // internationalization
import './directive';
import './filter';
import { loadLib } from './lib';
// 表格
import 'xe-utils';
import VXETable from 'vxe-table';
import 'vxe-table/lib/style.css';
import VueSplit from 'vue-split-panel';
import VueScroll from 'vuescroll';

Vue.use(VXETable);
Vue.use(VueSplit);
Vue.use(VueScroll);
Vue.config.productionTip = false;

Vue.use(ElementUI, {
  size: 'mini', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
});
/**
 * 添加事件总线
 * @param {*} Vue
 */
var EventBus = new Vue();
Object.defineProperties(Vue.prototype, {
  $bus: {
    get: function() {
      return EventBus;
    }
  },
  $log: {
    get: function() {
      return log;
    }
  }
});
// 由于加载lib是异步的 所以通过callback调用Vue初始化 保证lib初始化完成
loadLib(cv => {
  console.info(`-----------opencv loaded-----------`);
  Vue.prototype.$cv = cv;
  new Vue({
    components: { App },
    router,
    i18n,
    store,
    template: '<App/>'
  }).$mount('#app');
});
export default Vue;
