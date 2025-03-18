/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-02-22 14:58:29
 * @LastEditTime: 2024-02-22 14:58:56
 * @Description:
 */
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
 * @param {*} num 数字
 * @param {*} accuracy 小数点精度
 * @param {*} type 取舍方式 'ceil' | 'floor' | 'round'
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
export function convertNumToPercentage(str, accuracy) {
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
