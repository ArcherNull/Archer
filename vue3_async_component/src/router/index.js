/*
 * @Author: Null
 * @Date: 2022-08-23 15:47:07
 * @Description: vue-router路由入口文件
 */
import { createRouter, createWebHashHistory } from 'vue-router'
// 路由配置数据数据
import routes from './routers.js'
import { showMessage, showNotification } from '@/common/index'
import storage from '@/utils/storage/index'
import setting from '@/setting'
import { userUserInfoStore } from '@/store/system/user'

// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  showSpinner: false // 不显示加载圆圈
})

// 挂载路由
const router = createRouter({
  history: createWebHashHistory(), // 哈希模式
  routes: routes
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (to.path === '/login') {
    next()
  } else {
    const token = storage.get('token')
    const { userInfo } = userUserInfoStore()
    if (token && userInfo) {
      next()
    } else {
      showMessage({
        message: '未获取到登录信息或登录信息已失效，将跳转登录页',
        type: 'error'
      })

      setTimeout(() => {
        next({
          name: 'login',
          query: {
            redirect: to.fullPath
          }
        })
        NProgress.done()
      }, 500)
    }
  }
})

router.afterEach((to, from) => {
  const { userInfo } = userUserInfoStore()
  if (from.path === '/login' && userInfo) {
    showNotification({
      title: '登录成功',
      message: `${userInfo?.userName || setting.name}，欢迎您回来`,
      type: 'success'
    })
  }
  NProgress.done()
})

export default router
