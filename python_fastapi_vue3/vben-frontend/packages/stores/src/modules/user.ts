/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-05-27 19:18:18
 * @LastEditTime: 2025-06-02 16:28:35
 * @Description:
 */
import { acceptHMRUpdate, defineStore } from 'pinia';
import type { UserInfo } from '@vben/types';

interface BasicUserInfo {
  [key: string]: any;
  /**
   * 头像
   */
  avatar: string;
  /**
   * 用户昵称
   */
  nickName: string;
  /**
   * 用户角色
   */
  roles?: string[];
  /**
   * 用户id
   */
  userId: string;
  /**
   * 邮箱
   */
  email: string;
  /**
   * 性别
   */
  sex: number;
  /**
   * 手机号码
   */
  phonenumber: number | string;
  /**
   * 账号
   */
  userName: string;
  /**
   * 备注
   */
  remark: null | string;
  /**
   * 用户类型
   */
  userType: string;
}

interface AccessState {
  /**
   * 用户信息
   */
  userInfo: BasicUserInfo | null;
  /**
   * 用户角色
   */
  userRoles: string[];
}

/**
 * @zh_CN 用户信息相关
 */
export const useUserStore = defineStore('core-user', {
  actions: {
    setUserInfo(userInfo: UserInfo | null) {
      // 设置用户信息
      this.userInfo = userInfo;
      // 设置角色信息
      const roles = userInfo?.roles ?? [];
      this.setUserRoles(roles);
    },
    setUserRoles(roles: string[]) {
      this.userRoles = roles;
    },
  },
  state: (): AccessState => ({
    userInfo: null,
    userRoles: [],
  }),
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useUserStore, hot));
}
