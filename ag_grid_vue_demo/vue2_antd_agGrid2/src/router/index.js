/*
 * @Author: junsong Chen
 * @Date: 2024-03-29 22:00:28
 * @Email: 779217162@qq.com
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-04-29 10:46:05
 * @Description:
 */

import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";
import {
  notification as Notification,
  message as Message,
} from "ant-design-vue";
// 路由数据
import routes from "./routers";
import * as storage from "@/utils/storage";
import { errorPage } from "./routers";

// 白名单路径
const whitePathList = ["/login"];

// 解决点击相同路由的时候，路由报错的问题
const VueRouterPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return VueRouterPush.call(this, location).catch((err) => err);
};

const VueRouterReplace = VueRouter.prototype.replace;
VueRouter.prototype.replace = function replace(location) {
  return VueRouterReplace.call(this, location).catch((err) => err);
};

Vue.use(VueRouter);

const createRouter = () =>
  new VueRouter({
    mode: "hash",
    scrollBehavior: () => ({ y: 0 }),
    routes,
  });

// 导出路由 在 main.js 里使用
const router = createRouter();

// 导航前守卫
router.beforeEach(async (to, from, next) => {
  console.log("导航前守卫", to.path);
  try {
    if (whitePathList.includes(to.path)) {
      next();
    } else {
      const token = storage.getStorage("token");
      if (token) {
        const userInfo = store.getters.userInfo;

        console.log("userInfo======>", userInfo);
        if (userInfo) {
          next();
        } else {
          const uInfo = await store.dispatch("user/getUserInfo");
          console.log("uInfo======>", uInfo);
          // 如果路由对象存在name属性，则比对
          if (to?.path && uInfo?.token) {
            if (from.path === "/login") {
              next("/index");
            } else {
              next(errorPage);
            }
          } else {
            // 不存在则跳转404界面
            next(errorPage);
          }
        }
      } else {
        next({
          name: "login",
          query: {
            redirect: to.fullPath,
          },
        });
      }
    }
  } catch (err) {
    Message.error(err.message || "路由跳转出错");
    next({
      name: "login",
      query: {
        redirect: to.fullPath,
      },
    });
  }
});

router.afterEach(async (to, from) => {
  const token = storage.getStorage("token");
  if (from.path === "/login" && token) {
    Notification.open({
      message: "登录成功",
      description: `百里千川用户，欢迎您回来`,
      type: "success",
    });
  }
});

export default router;
