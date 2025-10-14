/*
 * @Author: Null
 * @Date: 2021-11-08 09:13:34
 * @Description: 封装axios请求对象得入口文件
 * 参考文档： https://juejin.cn/post/6968487137670856711#heading-2
 */
import Axios from 'axios'
import { get } from 'lodash-es'
import router from '@/router/index'

// 请求配置，错误日志记录
import { httpConfig, handleError, messageAlert } from './httpCommon'
// 配置项
const { isDevEnv, baseURL, textBaseUrl, timeout } = httpConfig

const http = Axios.create({
  timeout,
  // `withCredentials` 表示跨域请求时是否需要使用凭证storage
  withCredentials: false // default
})

if (isDevEnv) {
  http.defaults.baseURL = textBaseUrl
} else {
  http.defaults.baseURL = baseURL
}

// 设置请求前拦截器
http.interceptors.request.use(
  config => {
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 设置响应拦截器
http.interceptors.response.use(
  response => {
    // cacheResInterceptor(response)
    if (response.status === 200) {
      const resData = response.data

      console.log('resData=====>', resData)

      if (resData.code === 200) {
        return resData.data
      } else if (resData.code === 302) {
        router.push({
          path: '/login'
        })
        return resData.data
      } else {
        messageAlert(`${resData.message || '未知错误'}`)
        return Promise.reject(resData)
      }
    }
  },
  error => {
    console.log('error=====>', error)

    // 全局监听请求错误信息
    errorStatusMsg(error)

    return Promise.reject(error)
  }
)

/**
 * @description: 错误状态码转义文本
 * @param { object } error 错误对象
 * @return { }
 */
function errorStatusMsg (error) {
  const status = get(error, 'response.status')
  switch (status) {
    case 302:
      error.message = '接口重定向了'
      break
    case 400:
      error.message = '请求错误'
      break
    case 401:
      error.message = '您未登录，或者登录已经超时，请先登录'
      break
    case 403:
      error.message = '您没有权限,拒绝访问'
      break
    case 404:
      error.message = `请求地址出错: ${error.response.config.url}`
      break
    case 408:
      error.message = '请求超时'
      break
    case 409:
      error.message = '系统已存在相同数据！'
      break
    case 500:
      error.message = '服务器内部错误'
      break
    case 501:
      error.message = '服务未实现'
      break
    case 502:
      error.message = '网关错误'
      break
    case 503:
      error.message = '服务不可用'
      break
    case 504:
      error.message = '服务暂时无法访问，请稍后再试'
      break
    case 505:
      error.message = 'HTTP版本不受支持'
      break
    default:
      break
  }
  if (error.message.includes('timeout')) error.message = '网络请求超时'
  if (error.message.includes('Network')) {
    error.message = window.navigator.onLine ? '服务端异常' : '您断网了'
  }

  // 记录错误日志数据
  handleError(error)
}

export default http
