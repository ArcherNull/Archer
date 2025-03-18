/**
 * @description: 生成随机数
 * @param {*} num
 * @return {*}
 */
export function getRandom6DigitNumber(num = 6) {
  return Math.floor(Math.random() * 10 * num)
}

/**
 * @description: 转换为数字
 * @param {unknown} str
 * @return {*}
 */
export function convertNumber(str) {
  const val = Number(str)
  return isNaN(val) ? 0 : val
}

/**
 * @description: 转换为正整数字
 * @param {unknown} str
 * @return {*}
 */
export function convertPositiveInteger(str) {
  const val = convertNumber(str)
  return val >= 0 ? val : 1
}

/**
 * @description: 对对应精度的数字四舍五入
 * @param {number} num 数字
 * @param {number} accuracy 小数点精度
 * @param {'ceil' | 'floor' | 'round'} type 取舍方式
 * @return {number}
 */
export function NumberRoundUp(num, accuracy, type = 'round') {
  const numVal = convertNumber(num)
  if (numVal) {
    const accuracyVal = Math.pow(10, convertNumber(accuracy) || 3)
    const newVal = numVal * accuracyVal

    // 如果精度是3，则下方是对第四位小数进行操作的
    if (type === 'ceil') {
      return Math.ceil(newVal) / accuracyVal
    } else if (type === 'floor') {
      return Math.floor(newVal) / accuracyVal
    } else {
      return Math.round(newVal) / accuracyVal
    }
  } else {
    return 0
  }
}

/**
 * @description: 将数字转换为百分比
 * @param {string | number} str 字符串
 * @param {number} accuracy 小数点精度
 * @return {string} 百分比字符串
 */
export function convertNumToPercentage(str, accuracy = 2) {
  if (str) {
    if (/^(\\-|\\+)?\d+(\.\d+)?$/.test(String(str))) {
      const num = convertNumber(str)
      return `${NumberRoundUp(num * 100).toFixed(accuracy || 2)}%`
    } else {
      return `0%`
    }
  } else {
    return `0%`
  }
}

/**
 * @description: 将百分比转换为数字
 * @param {string} str 百分比字符串
 * @return {number} 数字
 */
export function convertPercentageToNum(str) {
  if (isPercentage(str)) {
    const num = convertNumber(str.replace('%', ''))
    return NumberRoundUp(num / 100)
  } else {
    return 0
  }
}

/**
 * @description: 检测字符串是否是含%的百分比字符串
 * @param {string} str 百分比字符串
 * @return {boolean} 布尔值
 */
export function isPercentage(str) {
  return /^(\\-|\\+)?\d+((\.\d+)|\d+)%$/.test(str)
}


/**
 * @description: 通过A标签下载文件流
 * @param {string} bolb 文件流
 * @return {} 
 */
export function downloadByATag(bolb) {
  // application/vnd.ms-excel  对应 .xls
  // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet   对应 .xlsx
  // text/csv  对应 .csv
  const nblob = new Blob([bolb], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) // 核心代码
  const url = window.URL.createObjectURL(nblob)
  const link = document.createElement('a')
  link.href = url
  document.body.appendChild(link)
  link.click()
  window.URL.revokeObjectURL(link.href)
  document.body.removeChild(link) // 清除残留的文档片段<a></a>
}