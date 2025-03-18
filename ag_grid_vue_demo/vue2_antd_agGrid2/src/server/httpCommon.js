/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-03-28 21:06:13
 * @LastEditTime: 2024-05-10 23:13:56
 * @Description: 请求配置文件
 */

import { message } from "ant-design-vue";

// 当前配置
export const httpConfig = {
  isDevEnv: true, // 当前环境
  cancelRepeatRequest: true, // 接口中定义该项则开启取消重复请求功能
  retry: 3, // retry 请求重试次数
  retryDelay: 1000, // retryDelay 两次重试之间的时间间隔
  cache: true, // cache： true 开启当前接口缓存
  setExpireTime: 30000, // 当前接口缓存时限
  messageDuration: 3 * 1000, // 消息提示得显示时长
  timeout: 2 * 60 * 1000, // 请求超时时长
  baseURL: process.env.VUE_APP_API_BASE_URL, // 线上域名
  textBaseUrl: process.env.VUE_APP_API_BASE_URL, // 测试域名
};

/**
 * @description: 添加到错误日志
 * @param { Object } error 错误对象
 * @return {*}
 */
export function addErrorLog(error) {
  console.log("error", error);
}

/**
 * @description: 展示错误信息
 * @param { String } message 提示信息
 * @return {*}
 */
export function messageAlert(content = "系统错误") {
  console.log("提示", content);
  message.error(content);
}

/**
 * @description 记录和显示错误
 * @param {Error} error 错误对象
 */
export function handleError(error) {
  // 添加到日志
  addErrorLog(error);
  // 打印到控制台
  if (httpConfig.isDevEnv) {
    console.error(">>>>>> Error >>>>>>");
    console.log(error);
  }
  setTimeout(() => {
    // 显示提示
    messageAlert(error.message);
  });
}

/**
 * @description: 判断一个字符串是否为JSON字符串
 * @param {*} str 字符串
 * @return {*}
 */
export function isJsonStr(str) {
  if (typeof str === "string") {
    try {
      var obj = JSON.parse(str);
      if (typeof obj === "object" && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("error：" + str + "!!!" + e);
      return false;
    }
  }
}

/**
 * @param value
 * @returns {string}  强数据类型校验
 * 示例 isType(func) !== 'Function'
 */
export function isType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}
