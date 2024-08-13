/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-22 15:42:55
 * @LastEditTime: 2024-07-17 01:22:25
 * @Description:
 */
// 布局组件
import Layout from "@/layout/index.vue";

/**
 * 在主框架内显示
 */
const frameIn = [
  {
    path: "/",
    redirect: { name: "index" },
    component: Layout, // 首页的布局组件
    children: [
      // 首页
      {
        path: "/index",
        name: "index",
        meta: {
          title: "首页",
          auth: true,
        },
        component: () => import("@/views/system/index/index.vue"),
      },
      // 刷新页面 必须保留
      {
        path: "/refresh",
        name: "refresh",
        hidden: true,
        component: () => import("@/views/system/function/refresh"),
      },
      // 页面重定向 必须保留
      {
        path: "/redirect/:route*",
        name: "redirect",
        hidden: true,
        component: () => import("@/views/system/function/redirect"),
      },
    ],
  },
  {
    path: "/base",
    redirect: { name: "userManage" },
    component: Layout, // 首页的布局组件
    children: [
      {
        path: "/base/user-manage",
        name: "userManage",
        meta: {
          title: "用户管理",
          auth: true,
        },
        component: () => import("@/views/pages/base/user-manage/index.vue"),
      },
      {
        path: "/base/dict-manage",
        name: "dictManage",
        meta: {
          title: "字典管理",
          auth: true,
        },
        component: () => import("@/views/pages/base/dict-manage/index.vue"),
      },
    ],
  },
  {
    path: "/order",
    redirect: { name: "orderManage" },
    component: Layout, // 首页的布局组件
    children: [
      // 首页
      {
        path: "/order/order-manage",
        name: "orderManage",
        meta: {
          title: "订单管理",
          auth: true,
        },
        component: () => import("@/views/pages/order/order-manage/index.vue"),
      },
    ],
  },
  {
    path: "/map",
    redirect: { name: "baiduMap" },
    component: Layout, // 首页的布局组件
    children: [
      {
        path: "/map/baidu-map",
        name: "baiduMap",
        meta: {
          title: "百度地图",
          auth: true,
        },
        component: () => import("@/views/pages/map/baidu-map/index.vue"),
      },
    ],
  },
];

/**
 * 在主框架之外显示
 */
export const frameOut = [
  {
    path: "/login",
    name: "login",
    meta: {
      title: "登录",
    },
    component: () => import("@/views/system/login/index.vue"),
  },
];

/**
 * 错误页面
 */
export const errorPage = [
  {
    path: "*",
    name: "404",
    redirect: { name: "error" },
    component: Layout, // 首页的布局组件
    children: [
      {
        name: "notFound",
        path: "*",
        component: () => import("@/views/system/error/404/index.vue"),
      },
    ],
  },
];

// 导出需要显示菜单的
export const frameInRoutes = frameIn;

// 重新组织后导出
export default [...frameIn, ...frameOut, ...errorPage];
