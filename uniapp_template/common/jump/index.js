// 自定义跳转类
export class CusJump {
	// 最大页面栈
	_max_page_stack = 20
	// 页面栈
	_page_stack_list = []
	// 

	constructor() {
		this.init()
	}

	// 实例初始化
	init() {
		const that = this
		const funArr = Object.keys(that.operationProxy)
		funArr.forEach(funName => {
			this[funName] = (args) => {
				return this.operation(funName, args)
			}
		})
	}

	get operationProxy() {
		const proxy = {
			'navigateTo': uni.navigateTo,
			'redirectTo': uni.redirectTo,
			'reLaunch': uni.reLaunch,
			'switchTab': uni.switchTab,
			'navigateBack': uni.navigateBack,
		}
		return proxy
	}

	// 操作方法
	operation(type, options = {}) {
		const operaFun = this.operationProxy[type]
		if (typeof operaFun === 'function') {
			console.log('操作路由跳转，记录路由截取options中的参数，但是不要修改参数')
			return operaFun(options)
		} else {
			throw new Error('跳转方法错误')
		}
	}
}

export const cusJump = new CusJump()