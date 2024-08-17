/*
 * @Author: Null
 * @Date: 2022-06-16 16:34:16
 * @Description: 请求配置文件
 */
import { showMessage } from '@/common/index'
import log from '@/utils/log/index'

console.log('import.meta.env.NODE_ENV', import.meta.env.VITE_APP_API_VERSION)

// 当前配置
export const httpConfig = {
  isDevEnv: import.meta.env.VITE_APP_API_VERSION === 'v1', // 当前环境
  cancelRepeatRequest: true, // 接口中定义该项则开启取消重复请求功能
  retry: 3, // retry 请求重试次数
  retryDelay: 1000, // retryDelay 两次重试之间的时间间隔
  cache: true, // cache： true 开启当前接口缓存
  setExpireTime: 30000, // 当前接口缓存时限
  messageDuration: 3 * 1000, // 消息提示得显示时长
  timeout: 15000, // 请求超时时长
  baseURL: `/${import.meta.env.VITE_APP_API_VERSION}`, // 线上域名
  textBaseUrl: '/v1' // 测试域名
}

/**
 * @description: 田间到错误日志
 * @param { Object } error 错误对象
 * @return {*}
 */
export function addErrorLog (error) {
  console.log('error', error)
}

/**
 * @description: 展示错误信息
 * @param { String } message 提示信息
 * @return {*}
 */
export function messageAlert (message, type = 'error', duration = 3000) {
  showMessage({
    message,
    type,
    showClose: true,
    duration
  })
}

/**
 * @description 记录和显示错误
 * @param {Error} error 错误对象
 */
export function handleError (error) {
  // 添加到日志
  addErrorLog(error)
  // 打印到控制台
  if (httpConfig.isDevEnv) {
    log.danger('>>>>>> Error >>>>>>')
    console.log(error)
  }
  setTimeout(() => {
    // 显示提示
    messageAlert(error.message)
  })
}

/**
 * @description: 判断一个字符串是否为JSON字符串
 * @param {*} str 字符串
 * @return {*}
 */
export function isJsonStr (str) {
  if (typeof str === 'string') {
    try {
      var obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      console.log('error：' + str + '!!!' + e)
      return false
    }
  }
}

/**
 * @param value
 * @returns {string}  强数据类型校验
 * 示例 isType(func) !== 'Function'
 */
export function isType (value) {
  return Object.prototype.toString.call(value).slice(8, -1)
}

// 模块url
export const getVersionUrl = path => {
  return `/user-service/${import.meta.env.VITE_APP_VERSION}${path}`
}

