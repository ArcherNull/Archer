/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-08-25 11:30:57
 * @LastEditTime: 2023-08-26 18:09:00
 * @Description:
 */

/**
 * @description: 转换成数字
 * @param {*} num
 * @return {*}
 */
function convertNumber(num) {
  const val = Number(num);
  return isNaN(val) ? 0 : val;
}

/**
 * @description: 对对应精度的数字四舍五入
 * @param {*} num 数字
 * @param {*} accuracy 小数点精度
 * @return {*}
 */
function NumberRoundUp(num, accuracy) {
  const numVal = convertNumber(num);
  if (numVal) {
    const accuracyVal = Math.pow(10, convertNumber(accuracy) || 3);
    return Math.round(numVal * accuracyVal) / accuracyVal;
  } else {
    return 0;
  }
}

/**
 * @description: 将数字转换为百分比
 * @param {*} str
 * @param {*} number
 * @return {*}
 */
function convertNumToPercentage(str, number = 2) {
  if (str) {
    if (/^(\-|\+)?\d+(\.\d+)?$/.test(String(str))) {
      const num = convertNumber(str);
      return `${NumberRoundUp(num * 100).toFixed(number)}%`;
    } else {
      return `0%`;
    }
  } else {
    return `0%`;
  }
}

/**
 * @description: 将百分比转换为数字
 * @param {*} str
 * @return {*}
 */
function convertPercentageToNum(str) {
  if (isPercentage(str)) {
    const num = convertNumber(str.replace("%", ""));
    return NumberRoundUp(num / 100);
  } else {
    return 0;
  }
}


/**
 * @description: 检测字符串是否是含%的百分比字符串
 * @param {*} str
 * @return {*}
 */
function isPercentage(str) {
  return /^(\-|\+)?\d+((\.\d+)|\d+)%$/.test(str);
}

module.exports = {
    convertNumber,
    convertNumber,
    convertNumToPercentage,
    convertPercentageToNum,
    isPercentage
}


