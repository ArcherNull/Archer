/*
 * @Author: Null
 * @Date: 2022-10-25 08:39:14
 * @Description:
 */
import setting from '@/setting'

const storage = {}
const setCookiesKey = (name, prefixName) => (prefixName ? `${prefixName}-${name}` : `${setting.prefixName}-${name}`)
/**
 * @description 存储 cookie 值
 * @param {String} name
 * @param {String} value cookie value
 * @param {Object} setting cookie setting
 */
storage.set = function (name = 'default', value = '', prefixName) {
  localStorage.setItem(setCookiesKey(name, prefixName), value)
}

/**
 * @description 拿到 cookie 值
 * @param {String} name
 */
storage.get = function (name = 'default', prefixName) {
  return localStorage.getItem(setCookiesKey(name, prefixName))
}

/**
 * @description 删除 cookie
 * @param {String} name
 */
storage.remove = function (name = 'default', prefixName) {
  return localStorage.removeItem(setCookiesKey(name, prefixName))
}

/**
 * @description 删除 cookie
 * @param {String} name
 */
storage.clear = function () {
  localStorage.clear()
}

export default storage
