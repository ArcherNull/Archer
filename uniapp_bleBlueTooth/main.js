import App from './App'
import {
	createPinia
} from 'pinia';
import {
	createPersistedState
} from 'pinia-plugin-persistedstate'; // 引入插件
import CONFIG from '@/common/config/index.js'
import * as utils from '@/common/utils/index.js'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)

	const pinia = createPinia();
	pinia.use(createPersistedState({
		key: (storeKey) => `${CONFIG.APP_NAMESPACE}-${storeKey}`,
		storage: {
			getItem(key) {
				return uni.getStorageSync(key);
			},
			setItem(key, value) {
				uni.setStorageSync(key, value);
			},
		}
	})); // 使用持久化插件
	app.use(pinia);

	// 注册全局混入
	// app.mixin(mixins)
	// 加载全局方法
	app.config.globalProperties.$utils = utils;

	// 处理组件渲染方法和侦听器执行期间抛出的未捕获错误
	app.config.errorHandler = (err, vm, info) => {
		// 处理错误
		// `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
		console.info(err);
		console.log("errorHandler处理错误vm", vm);
		console.log("errorHandler处理错误info", info);
	};
	
	return {
		app
	}
}
// #endif