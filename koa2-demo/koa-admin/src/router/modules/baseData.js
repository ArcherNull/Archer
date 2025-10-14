/*
 * @Author: Null
 * @Date: 2022-10-14 18:41:21
 * @Description: 基础数据
 */

import Layout from '@/layout/index.vue'
// import { pageAsyncComponent } from '@/plugins/component/index'

/**
 * 在主框架内显示
 */
export const baseData = [
  {
    path: '/base-data',
    name: 'baseData',
    redirect: {
      name: 'user'
    },
    meta: {
      title: '基础数据',
      icon: 'IconMenu'
    },
    component: Layout,
    children: [
      {
        path: '/base-data/user',
        name: 'user',
        meta: {
          title: '用户列表',
          cache: true // 是否缓存
        },
        component: () => import('@/views/pages/base-data/user/index.vue')
      }
    ]
  }
]
