import type { BasicUserInfo } from '@vben-core/typings';

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  /**
   * 用户描述
   */
  desc: string;
  /**
   * 首页地址
   */
  homePath: string;
  /**
   * accessToken
   */
  token: string;
}

interface UserInfoRes {
  permissions: string[];
  roles: string[];
  user: UserInfo | null;
}

export type { UserInfo, UserInfoRes };
