/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-26 15:05:45
 * @LastEditTime: 2024-09-26 15:11:15
 * @Description:
 */

/**
 * @description: 校验手机格式
 * @param {any} rule
 * @param {any} value
 * @param {any} callback
 * @return {*}
 */
export function isPhoneNumber(rule: any, value: any, callback: any) {
  const regexp = /^(?:(?:\+|00)86)?1\d{10}$/;
  if (!value) callback('请输入手机号码');
  if (regexp.test(value)) {
    return callback();
  } else {
    callback(new Error('请输入正确的手机号码'));
  }
}

/**
 * @description: 校验输入框输入小数位数
 * @param {any} form
 * @param {string} fieldName
 * @param {number} decimal
 * @return {*}
 */
export const limitInputToDecimals = (
  form: any,
  fieldName: string,
  decimal: number,
) => {
  let value = form[fieldName];
  const regex = new RegExp(`[^-?\\d.](?!(\\.\\d{0,${decimal}}$))`, 'g');
  value = value.replace(regex, '');
  value = value.replaceAll(/^\./g, '0.');
  value = value.replaceAll(/\.{2,}/g, '.');
  form[fieldName] = value;
  return form;
};
