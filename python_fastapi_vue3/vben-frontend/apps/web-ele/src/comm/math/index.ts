/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-08-25 11:30:57
 * @LastEditTime: 2024-11-27 17:46:11
 * @Description:
 */

/**
 * @description: 转换成数字
 * @param {*} num
 * @return {*}
 */
export function convertNumber(num: any): number {
  const val = Number(num);
  return Number.isNaN(val) ? 0 : val;
}

/**
 * @description: 对对应精度的数字四舍五入
 * @param {number} num 数字
 * @param {number} accuracy 小数点精度
 * @return {*}
 */
export function numberRoundUp(num: number, accuracy?: number): number {
  const numVal = convertNumber(num);
  if (numVal) {
    const accuracyVal = 10 ** (convertNumber(accuracy) || 3);
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
export function convertNumToPercentage(str: any, number: number = 2): string {
  if (str) {
    // eslint-disable-next-line regexp/no-unused-capturing-group
    if (/^(\\-|\\+)?\d+(\.\d+)?$/.test(String(str))) {
      const num = convertNumber(str);
      return `${numberRoundUp(num * 100).toFixed(number)}%`;
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
export function convertPercentageToNum(str: any) {
  if (isPercentage(str)) {
    const num = convertNumber(str.replace('%', ''));
    return numberRoundUp(num / 100);
  } else {
    return 0;
  }
}

/**
 * @description: 检测字符串是否是含%的百分比字符串
 * @param {*} str
 * @return {*}
 */
export function isPercentage(str: any) {
  // eslint-disable-next-line regexp/no-unused-capturing-group, regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation, regexp/no-misleading-capturing-group
  return /^(\\-|\\+)?\d+((\.\d+)|\d+)%$/.test(str);
}
