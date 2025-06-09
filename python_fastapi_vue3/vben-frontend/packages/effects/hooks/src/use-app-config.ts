/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-05-27 19:18:18
 * @LastEditTime: 2025-05-30 14:37:52
 * @Description:
 */
import type {
  ApplicationConfig,
  VbenAdminProAppConfigRaw,
} from '@vben/types/global';

/**
 * 由 vite-inject-app-config 注入的全局配置
 */
export function useAppConfig(
  env: Record<string, any>,
  isProduction: boolean,
): ApplicationConfig {
  console.log(
    ' window._VBEN_ADMIN_PRO_APP_CONF_',
    window._VBEN_ADMIN_PRO_APP_CONF_,
  );
  // 生产环境下，直接使用 window._VBEN_ADMIN_PRO_APP_CONF_ 全局变量
  const config = isProduction
    ? window._VBEN_ADMIN_PRO_APP_CONF_
    : (env as VbenAdminProAppConfigRaw);

  const { VITE_GLOB_API_URL } = config;

  return {
    apiURL: VITE_GLOB_API_URL,
  };
}
