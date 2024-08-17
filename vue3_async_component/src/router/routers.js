/*
 * @Author: Null
 * @Date: 2022-08-23 15:47:07
 * @Description: 路由配置
 */
import Layout from '@/layout/index.vue'
// 页面重定向
import redirect from '@/views/system/function/redirect/index'
// 页面刷新
import refresh from '@/views/system/function/refresh/index'
// 登录
import login from '@/views/system/login/index.vue'
// 404
import error from '@/views/system/404/index.vue'

import { dashboard } from './modules/dashboard.js'
import { baseData } from './modules/baseData.js'

/**
 * 在主框架内显示
 */
const frameIn = [
  {
    path: '/',
    redirect: {
      name: 'index'
    },
    component: Layout,
    children: [
      {
        path: '/index',
        name: 'index',
        meta: {
          title: '首页',
          cache: true // 是否缓存
        },
        component: () => import('@/views/system/index/index.vue')
      },
      // 页面重定向 必须保留
      {
        path: 'redirect/:route',
        name: 'redirect',
        hidden: true,
        component: redirect
      },
      // 页面刷新
      {
        path: 'refresh/:route',
        name: 'refresh',
        hidden: true,
        component: refresh
      }

    ]
  },
  //  工作台
  ...dashboard,
  // 基础数据
  ...baseData
]

/**
 * 在主框架之外显示
 */
const frameOut = [
  // 登录
  {
    path: '/login',
    name: 'login',
    component: login
  }
]

/**
 * 错误页面
 */
const errorPage = [
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: error
  }
]

// 导出需要显示菜单的
export const frameInRoutes = frameIn

// 重新组织后导出
export default [...frameIn, ...frameOut, ...errorPage]
