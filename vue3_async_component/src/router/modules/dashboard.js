/*
 * @Author: Null
 * @Date: 2022-10-09 13:52:26
 * @Description:
 */
import Layout from '@/layout/index.vue'
// import { pageAsyncComponent } from '@/plugins/component/index'

/**
 * 在主框架内显示
 */
export const dashboard = [
  {
    path: '/dashboard',
    name: 'dashboard',
    redirect: {
      name: 'analysis'
    },
    meta: {
      title: '仪表板',
      icon: 'IconMenu'
    },
    component: Layout,
    children: [
      {
        path: '/dashboard/analysis',
        name: 'analysis',
        meta: {
          title: '分析页',
          cache: true // 是否缓存
        },
        component: () => import('@/views/pages/dashboard/analysis/index.vue')
      },
      {
        path: '/dashboard/workbench',
        name: 'workbench',
        meta: {
          title: '工作台'
        },
        component: () => import('@/views/pages/dashboard/workbench/index.vue')
      }
    ]
  }
]
