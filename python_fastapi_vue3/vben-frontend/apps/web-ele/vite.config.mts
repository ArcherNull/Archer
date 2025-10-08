/*
 * @Author: dengwei 504723130@qq.com
 * @Date: 2025-05-16 08:49:29
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-05-30 17:59:16
 * @FilePath: \kps-saas-web\apps\web-ele\vite.config.mts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { CommonServerOptions, HttpProxy, ProxyOptions } from 'vite';

import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

type ObjectType = {
  [key: string]: any;
};

/**
 * @description: 代理公共方法
 * @return {*}
 */
function dealCommProxy(
  perfix: string,
  target: string,
): CommonServerOptions['proxy'] {
  const nObj: ObjectType = {};
  if (perfix && target) {
    const regStr = new RegExp(`(^/${perfix})/`);

    nObj[`/${perfix}`] = {
      changeOrigin: true,
      configure: (proxy: HttpProxy.Server, options: ProxyOptions) => {
        // 配置此项可在响应头中看到请求的真实地址
        proxy.on('proxyRes', (proxyRes, req) => {
          const target =
            typeof options?.target === 'string' ? options.target : '';
          proxyRes.headers['x-real-url'] =
            new URL(req.url || '', target)?.href || '';
        });
      },
      https: false,
      rewrite: (path: string) => path.replace(regStr, ''),
      target,
      ws: true,
    };
  }
  return nObj;
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      resolve: {
        alias: {
          '@web-ele': path.resolve(__dirname, './src'),
        },
      },
      server: {
        port: 6935,
        proxy: {
          ...dealCommProxy('dev-api', 'http://127.0.0.1:9099'),
        },
      },
    },
  };
}, 'application');
