/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-03-13 16:59:04
 * @LastEditTime: 2025-03-13 17:50:47
 * @Description:
 */
import { toRaw } from 'vue';

import { useUserStore } from '@vben/stores';

export function getPowerPath(power?: string) {
  if (power) {
    const { hash } = window.location;
    const pName = hash.replace('#', '');
    let powerKey = '';
    if (pName) {
      powerKey = `${pName}|${power}`;
    }
    return powerKey;
  }
}

export function hasPermission(power?: string) {
  const userStore = useUserStore();
  const userInfo = toRaw(userStore.userInfo);
  const authButtonList = toRaw(userStore?.authButtonList);
  if (userInfo) {
    if (userInfo.realName === '超级管理员' && userInfo.userName === 'admin') {
      return true;
    } else {
      if (power) {
        const { hash } = window.location;
        const pName = hash.replace('#', '');
        if (pName) {
          const powerKey = `${pName}|${power}`;
          console.log('powerKey123123123', powerKey);
          return authButtonList.includes(powerKey);
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
  } else {
    return false;
  }
}
