import uni_request from './common/uni_request.js'
import CONFIG from '@/common/config/index.js'

const request = uni_request({
	baseURL: CONFIG.APP_DOMAIN_PROXY,
	timeout: 20000,
	header: {
		'content-type': 'application/json'
	},
	statusCode: [200, 401]
});


// 请求前拦截器
request.interceptors.request.use(async (config, ...args) => {
	config.header.Authorization = getApp().globalData.token;
	return config
})

// 请求后拦截器
request.interceptors.response.use((response, ...args) => { // 响应拦截器（可以设置多个, 同时可以也可以使用异步方法）
	const {
		data: res
	} = response
	if (res.code === 200) {

	}
	if (res.msg == '未获取到登录用户信息,可能登录超时或者已被踢下线' && res.code == '500') {
		uni.showToast({
			title: '登录已失效,请重新登录',
			icon: 'none',
			duration: 1000
		})
		setTimeout(function() {
			uni.reLaunch({
				url: '/pages/login/login',
			})
		}, 1500)
	}
	return response
})

export default request;