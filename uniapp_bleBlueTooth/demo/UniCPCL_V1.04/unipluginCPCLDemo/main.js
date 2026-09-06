import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

import '@/common/bluetooth.js';
//全局数据状态管理 vuex
import store from '@/store/index.js';
Vue.prototype.$store = store;

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
