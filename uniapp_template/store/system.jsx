import {
	defineStore
} from 'pinia'
import { toRaw } from 'vue'
import CONFIG from '@/common/config/index.js'
import  themeObj from '@/common/theme/index.js'
console.log('themeObj123123', themeObj)
const { themeList, themeName, themeCode, themeColor, themeVariable, getFontSize, getThemeStyle, themeStyle } = themeObj

export const useThemeStore = defineStore('system', {
	state: () => {
		return {
			// 主题名称
			themeName,
			// 主题code
			themeCode,
			// 默认主题色
			themeColor: themeColor,
			// 主题变量样式
			themeStyle,
			// 语言  简体中文zh-CN ； 英文 en-US
			locale: CONFIG.APP_LANGUAGE,
			// 语言列表
			localeList: [],
			// 主题code列表
			themeCodeList: themeList.themeCodeList,
			// 主题选项列表
			themeOptions: themeList.themeOptions,
			// 主题变量
			themeVariable,
		}
	},
	actions: {
		// 设置主题
		setTheme(options){
			const tCList = themeList.themeCodeList
			const tCode = options.themeCode
			if(tCList.includes(tCode)){
				this.themeCode = tCode
				const newThemeStyle = getThemeStyle(options)
				console.log('newThemeStyle', newThemeStyle)
				this.themeVariable = newThemeStyle.themeVariable
			}
		},
		
		// 重置store
		reset() {
		    this.$reset();
		},
	},
	// 当前文件 状态 全部持久化配置	也可以写persist: true
	persist: true

})
