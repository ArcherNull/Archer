import type { Recordable, UserInfo, UserInfoRes } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification, ElMessage } from 'element-plus';
import { defineStore } from 'pinia';

import { getUserInfoApi } from '#/api/core/user';
import { getCodeImg, loginApi, logoutApi } from '#/api/core/auth';

import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);
  const loginUuid = ref();
  const showRegister = ref(false);
  const showCaptcha = ref(false);
  const captchaImg = ref();

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { token: accessToken } = await loginApi({
        ...params,
        uuid: loginUuid.value,
      });

      // 如果成功获取到 accessToken
      if (accessToken) {
        // 将 accessToken 存储到 accessStore 中
        accessStore.setAccessToken(accessToken);

        // 获取用户信息并存储到 accessStore 中
        const uInfo = await fetchUserInfo();
        if (uInfo) {
          userInfo = uInfo;
          if (accessStore.loginExpired) {
            accessStore.setLoginExpired(false);
          } else {
            onSuccess
              ? await onSuccess?.()
              : await router.push(
                  uInfo.homePath || preferences.app.defaultHomePath,
                );
          }

          if (uInfo?.nickName) {
            ElNotification({
              message: `${$t('authentication.loginSuccessDesc')}:${uInfo?.nickName}`,
              title: $t('authentication.loginSuccess'),
              type: 'success',
            });
          }
        } else {
          ElMessage.error($t('authentication.fetchUserInfoFailed'));
        }
      }
    } catch {
      getCaptchaFun();
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      if (accessStore.accessToken) {
        await logoutApi();
      }
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  // 获取登录
  async function getCaptchaFun() {
    const res = await getCodeImg();
    const { captchaEnabled, registerEnabled, img, uuid } = res;
    showRegister.value = Boolean(registerEnabled);
    showCaptcha.value = Boolean(captchaEnabled);
    loginUuid.value = '';
    captchaImg.value = '';
    if (showCaptcha.value) {
      captchaImg.value = 'data:image/gif;base64,' + img;
      loginUuid.value = uuid;
    }
  }

  function dealUserInfoRes(res: UserInfoRes | null): null | UserInfo {
    const { permissions = [], roles = [], user = null } = res || {};
    if (user) {
      user.roles = roles;
    }
    userStore.setUserInfo(user);
    accessStore.setAccessCodes(permissions);
    return user;
  }

  async function fetchUserInfo(): Promise<null | UserInfo> {
    let userInfoRes: null | UserInfoRes = null;
    userInfoRes = await getUserInfoApi();
    const userinfo = dealUserInfoRes(userInfoRes);
    return userinfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    loginUuid,
    showRegister,
    showCaptcha,
    captchaImg,
    getCaptchaFun,
    logout,
  };
});
