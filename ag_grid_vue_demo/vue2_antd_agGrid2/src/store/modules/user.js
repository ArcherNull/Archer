/*
 * @Author: junsong Chen
 * @Date: 2024-03-29 23:05:55
 * @Email: 779217162@qq.com
 * @LastEditors: junsong Chen
 * @LastEditTime: 2024-07-07 17:03:54
 * @Description:
 */
import * as storage from "@/utils/storage";
import { login, getUserInfo, sendEMailCode } from "@/api/index";

const user = {
  namespaced: true,
  state: {
    userInfo: null,
    token: null,
  },

  mutations: {
    SET_USER_INFO: (state, userInfo) => {
      state.userInfo = userInfo;
    },

    SET_TOKEN: (state, token) => {
      state.token = token;
    },
  },

  actions: {
    // 注册
    register({ commit }) {
      commit("");
    },

    // 登录
    login({ commit }, loginForm) {
      return new Promise((resolve, reject) => {
        login(loginForm).then((res) => {
          const token = res?.data?.token
          console.log('登录获取token', token)
          if (token) {
            commit("SET_TOKEN", token);
            storage.setStorage("token", token);
            resolve(res);
          } else {
            reject(false);
          }
        });
      });
    },

    // 发送邮箱验证码
    sendEMailCodeFun({ }, data) {
      return new Promise((resolve) => {
        sendEMailCode(data).then((res) => {
          console.log('发送邮箱验证码=====>', res)
          resolve(res.message || '发送成功')
        });
      });
    },

    // 获取用户信息
    getUserInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then((res) => {
          const userInfo = res?.data
          if (userInfo) {
            console.log('获取用户信息', userInfo)
            commit("SET_USER_INFO", userInfo);
            storage.setStorage("userInfo", userInfo);
            resolve(userInfo);
          } else {
            reject(false)
          }
        });
      });
    },

    // 登出
    logout({ commit }) {
      return new Promise((resolve) => {
        commit("SET_USER_INFO", null);
        storage.clearStorage();
        resolve(true);
      });
    },
  },
};

export default user;
