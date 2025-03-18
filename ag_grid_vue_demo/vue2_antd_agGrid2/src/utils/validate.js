/*
 * @Author: junsong Chen
 * @Date: 2024-04-04 12:17:03
 * @Email: 779217162@qq.com
 * @LastEditors: junsong Chen
 * @LastEditTime: 2024-07-08 00:23:53
 * @Description: 
 */

/**
 * @description: 检测是否满足邮箱格式
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 * @return {*}
 */
export function isEmail(rule, value, callback) {
  const regStr =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (regStr.test(value)) {
    callback();
  } else {
    callback("不满足邮箱格式");
  }
}

/**
 * @description: 校验手机号格式
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 * @return {*}
 */
export function isPhoneNumber(rule, value, callback) {
  const regStr = /^(?:(?:\+|00)86)?1\d{10}$/;
  if (regStr.test(value)) {
    callback();
  } else {
    callback("不满足手机号格式");
  }
}

/**
 * @description: 校验用户名
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 * @return {*}
 */
export function isUserName(rule, value, callback) {
  const regStr = /^[a-zA-Z0-9!@#$%^&*?_-]{6,16}$/;
  if (regStr.test(value)) {
    callback();
  } else {
    callback("请输入6位到16位，由大小写英文，数字，或特殊字符!@#$%^&*?_-组成");
  }
}

/**
 * @description: 是否是中文
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 * @return {*}
 */
export function isChinese(rule, value, callback) {
  const regStr = /^[\u4e00-\u9fa5]+$/gi.test(value)
  if (regStr.test(value)) {
    callback();
  } else {
    callback("请输入2-4位的中文");
  }
}


/**
 * @description: 校验是否是数字验证码
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 * @return {*}
 */
export function isNumberverifyCode(rule, value, callback) {
  const regStr = /^[0-9]{6}$/;
  if (regStr.test(value)) {
    callback();
  } else {
    callback("请输入6位数字组成的验证码");
  }
}

/**
 * @description: 校验是否是6位验证码
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 * @return {*}
 */
export function isSixVifyCode(rule, value, callback) {
  const regStr = /^[0-9A-Za-z]{6}$/;
  if (regStr.test(value)) {
    callback();
  } else {
    callback("请输入6位数字/字符串的验证码");
  }
}

/**
 * @description: 校验是否满足身份证格式
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 * @return {*}
 */
export function isIDCard(rule, value, callback) {
  const regStr = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (regStr.test(value)) {
    callback();
  } else {
    callback("请输入正确的身份证号码");
  }
}


/**
 * @description: 校验密码强度
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 * @return {*}
 */
export function isPassword(rule, value, callback) {
  const regStr = /[a-zA-Z0-9!@#$%^&*?]{6,16}$/;
  if (regStr.test(value)) {
    callback();
  } else {
    callback("请输入6位到16位之间的密码");
  }
}
