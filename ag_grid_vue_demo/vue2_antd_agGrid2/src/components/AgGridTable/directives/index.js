/*
 * @Author: Null
 * @Date: 2022-05-07 08:48:54
 * @Description: 全局指令注册
 */
import myLoading from './myLoading'

export default {
  install (Vue) {
    // 自定义loading指令
    Vue.directive('myLoading', myLoading)
  }
}
