import * as dev from './dev.config.js'
import * as pro from './pro.config.js'

// 环境
const APP_ENV = process.env.NODE_ENV

// 是否是测试环境
const APP_IS_DEV = APP_ENV === 'development'

// 获取对应的环境配置
const config = APP_IS_DEV ? dev : pro

const systemInfo = uni.getSystemInfoSync()

// APP ID
const APP_ID = systemInfo.appId

// APP 名称
const APP_NAME = systemInfo.appName

// APP 版本
const APP_VERSION = systemInfo.appVersion

// APP 描述
const APP_DESCRIPTION = systemInfo.appDescription

// APP 语言  简体中文 zh-CN ； 英文 en-US
const APP_LANGUAGE = systemInfo.language || systemInfo.hostLanguage

// APP 平台
const APP_PLATFORM = systemInfo.platform

// APP 	uni平台
const APP_UNI_PLATFORM = systemInfo.uniPlatform

// APP 主题
const APP_THEME = systemInfo.hostTheme

// APP 主题色
const APP_THEME_COLOR = '#F6AD02'

// APP 根元素字体大小 ，单位为px
const APP_ROOT_FONT_SIZE = '16px'

// APP 百度AK
const APP_BAIDU_AK = 'APP_BAIDU_AK'

// APP 百度租户id
const APP_BAIDU_CLIENT_ID = 'APP_BAIDU_CLIENT_ID'

// APP 百度租户密钥
const APP_BAIDU_CLIENT_SECRET = 'APP_BAIDU_CLIENT_SECRET'

export default {
	APP_ENV,
	APP_IS_DEV,
	APP_ID,
	APP_NAME,
	APP_VERSION,
	APP_DESCRIPTION,
	APP_LANGUAGE,
	APP_PLATFORM,
	APP_UNI_PLATFORM,
	APP_THEME,
	APP_THEME_COLOR,
	APP_ROOT_FONT_SIZE,
	APP_BAIDU_AK,
	APP_BAIDU_CLIENT_ID,
	APP_BAIDU_CLIENT_SECRET,
	...config
}