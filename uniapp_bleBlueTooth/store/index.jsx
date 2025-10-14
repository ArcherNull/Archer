import {
	defineStore
} from 'pinia'

export const useThemeStore = defineStore('test', {
	state: () => {
		return {
			count: 0,
		}
	},
	actions: {
		changeThemeColor(num) {
			this.count += 1
		},
		
		// 重置store
		reset() {
		    this.$reset();
		},
	},
	// 当前文件 状态 全部持久化配置	也可以写persist: true
	persist: true

})
