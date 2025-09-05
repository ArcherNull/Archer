/**
 * @description: 日期格式化
 * @param {Date} dateTimeStr 日期
 * @return {*}
 */
export function formatDate(dateTimeStr) {
	if (dateTimeStr) {
		const date = new Date(dateTimeStr)
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		let day = date.getDate();
		month = month > 9 ? month : '0' + month;
		day = day > 9 ? day : '0' + day;
		return `${year}-${month}-${day}`;
	} else {
		return ''
	}
}

/**
 * @description: 获取当前日期 , 负数表示以前,正数标示未来
 * @param {number} offset 偏移量
 * @return {*}
 */
export function getCurrentDate(offset = 0) {
	const dayTimeStr = offset * (60 * 1000 * 60 * 24)
	const dateTimeStr = new Date().getTime() + dayTimeStr
	console.log('dateTimeStr', dateTimeStr)
	const date = new Date(dateTimeStr)
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();
	month = month > 9 ? month : '0' + month;
	day = day > 9 ? day : '0' + day;
	return `${year}-${month}-${day}`;
}