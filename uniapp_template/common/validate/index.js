/**
 * @description: 校验当前用户需大于18岁
 * @param {string} 	birthDate  日期
 */
export function validateOver18Years(birthDate) {
	if (birthDate) {
		const eightTeenDateStr = (18 * 365 * 24 * 60 * 60 * 1000)
		const nowTime = new Date().getTime()
		const birthDateStr = Date.parse(birthDate)

		return (nowTime - birthDateStr) > eightTeenDateStr
	} else {
		return false
	}
}

/**
 * @description: 是否是正确的手机号格式
 * @param {string} 	phoneNumber  手机号码
 */
export function isMobile(phoneNumber) {
	const reg = /^[1][0-9]{10}$/
	return reg.test(phoneNumber)
}

/**
 * @description: 检测中文姓名
 * @param {string} value  手机号码
 */
export function validateChineseName(value) {
	if (value) {
		console.log('// 检测中文姓名value', value)
		//是否包含特殊字符
		const specReg = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im
		const specReg1 = /[！#￥（——）：；“”‘、，|《。》？、……【】[\]]/im;
		const regEn = /[a-zA-z0-9]/im
		const regSpace = /\s+/g
		if (specReg.test(value) || specReg1.test(value)) {
			return '请不要输入特殊字符';
		} else if (regEn.test(value)) {
			return '请不要输入英文或数字'
		} else if (regSpace.test(value)) {
			return '请不要输入空格'
		} else {
			return
		}
	} else {
		return '请输入中文'
	}
}

/**
 * @description: 校验用户名或密码
 * @param {string} value 用户名或密码
 */
export function validateAccAndPwd(value) {
	var patrn = /^(\w){4,20}$/;

	if (!patrn.exec(value)) {
		return '用户名和密码只能输入4-20个字母、数字、下划线'
	}
}

/**
 * @description: 银行卡验证
 * @param {string} value 用户名或密码
 */
export function validateBankCard(value) {
	let reg = /^([1-9]{1})(\d{14}|\d{15}|\d{16}|\d{18})$/;

	if (!reg.test(value)) {
		return '请输入正确的银行卡号'
	}

}

/**
 * @description: 身份证验证
 * @param {string} value 身份证号
 */
export function validateIdCard(value) {
	let reg = /^\d{15}|\d{18}$/;

	if (!reg.test(value)) {
		return '身份证必须是15或18位数字'
	}
}

/**
 * @description: 验证码验证
 * @param {string} value 验证码号
 */
export function validateCode(value) {
	if (value.length !== 6) {
		return '验证码必须是6位数字';
	}
}

/**
 * @description: 密码验证
 * @param {string} value 密码
 */
export function validatePwd(value) {
	if (value.length < 6) {
		return '密码必须大于6位'
	}
}

/**
 * @description: 邮箱验证
 * @param {string} value 邮箱
 */
export function checkEmail(value) {
	let reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
	if (!reg.test(value)) {
		return '邮箱格式不正确'
	}
}