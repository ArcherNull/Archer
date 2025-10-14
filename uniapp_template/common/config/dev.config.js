// APP 名称
const APP_NAME = uni.getSystemInfoSync().appName

// APP 域名代理
export const APP_DOMAIN_PROXY = {
	'/api': 'https://etmsuat.dekuncn.com',
	'/user': 'https://etms.dekuncn.com',
	'/public': 'https://dkwl-uat.dekuncn.com',
	'/': 'https://test.dekuncn.com'
}

// 命名空间
export const APP_NAMESPACE = `${APP_NAME}-dev`