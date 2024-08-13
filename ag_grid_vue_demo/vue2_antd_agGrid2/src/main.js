/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-03-28 20:41:52
 * @LastEditTime: 2024-04-04 18:12:00
 * @Description: 入口文件
 */

import Vue from "vue";
import App from "./App.vue";
import Antd from 'ant-design-vue'
import store from '@/store/index'
import router from './router/index';
import 'ant-design-vue/dist/antd.less';
import gComponents from './gComponents'

Vue.config.productionTip = false;
Vue.use(Antd)
// 注册全局组件
Vue.use(gComponents)

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount("#app");
