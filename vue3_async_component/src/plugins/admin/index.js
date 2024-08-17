/*
 * @Author: Null
 * @Date: 2022-08-23 15:47:57
 * @Description: 主要插件
 */

// element-plus
import ElementPlus from 'element-plus'
// router
import Routers from '@/router/index'
// 公共方法
import common from '@/common'
// 引入api
// import api from '@/api/index.js'
// pinia 状态管理器
import { createPinia } from 'pinia'
// 持久化缓存
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// element-plus 样式
import 'element-plus/dist/index.css'
// flex 布局库
import 'flex.css'
// 浏览器样式兼容
import 'normalize.css'
// 全局样式
import '@/assets/styles/globalCss.scss'

// 注册全局组件
const compList = import.meta.globEager('@/components/**/*.vue')

export const Run = function (app) {
  return new Promise(function (resolve, reject) {
    try {
      console.log(`当前版本：${app.version}`)

      // 加载全局属性
      app.config.globalProperties.$commJs = common
      // 加载api
      // app.config.globalProperties.$api = api

      // 挂载element_ui组件
      app.use(ElementPlus)
      // 挂载element_ui组件
      app.use(Routers)
      // 使用状态管理器
      const pinia = createPinia()
      app.use(pinia)
      pinia.use(piniaPluginPersistedstate)

      Object.values(compList).forEach(component => {
        const componentName = component.default.name
        if (componentName) {
          app.component(componentName, component.default)
        } else {
          console.error('全局组件缺少必要属性name=====>', component)
        }
      })

      // 处理组件渲染方法和侦听器执行期间抛出的未捕获错误
      app.config.errorHandler = (err, vm, info) => {
        // 处理错误
        // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
        console.info(err)
        console.log('vm', vm)
        console.log('info', info)
      }
      resolve(true)
    } catch (err) {
      // catchCode - 捕获错误的代码块
      console.error(err)
      reject(false)
    }
  })
}
