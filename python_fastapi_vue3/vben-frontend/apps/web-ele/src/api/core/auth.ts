/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-05-27 19:18:18
 * @LastEditTime: 2025-06-02 11:53:00
 * @Description:
 */
import { requestClient } from '#/api/request';
import type { ResType } from '#/api/request';
import type { RouteRecordStringComponent } from '@vben/types';
export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
    code?: string;
    uuid?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.request<ResType.ResResult<AuthApi.LoginResult>>(
    `/login`,
    {
      method: 'post',
      data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      paramsSerializer: 'repeat',
    },
  );
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return requestClient.post<AuthApi.RefreshTokenResult>('/refresh', {
    withCredentials: true,
  });
}

/**
 * 注册方法
 */
export async function register() {
  return requestClient.post<ResType.ResResult<any>>('/register', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.post<ResType.ResResult<any>>('/logout', {
    withCredentials: true,
  });
}

/**
 * 获取验证码
 */
export async function getCodeImg() {
  return requestClient.get<ResType.ResResult<any>>('/captchaImage', {
    withCredentials: true,
  });
}

/**
 * 修改密码
 */
export async function resetPwd(data: FormData) {
  return requestClient.post<any>('/user/SysUser/updatePassword', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 获取菜单路由
 */
export async function getMenuRouters() {
  return requestClient.get<ResType.ResResult<RouteRecordStringComponent[]>>(
    '/getRouters',
    {
      withCredentials: true,
    },
  );
}
