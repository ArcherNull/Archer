/*
 * @Author: Null
 * @Date: 2022-08-24 10:56:19
 * @Description:  vite.config.js 配置文件
 */
'use strict'

import {
  defineConfig,
  loadEnv
} from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'

const adminName = require('./package.json').name
// 拼接绝对路径的方法
const resolve = (dir) => {
  return path.join(__dirname, dir)
}
// 打包体积可视化插件
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ command, mode }) => {
  console.log('mode=====>', mode)
  const envObj = loadEnv(mode, process.cwd())
  console.log('envObj=====>', envObj)
  // 拿取到baseurl
  const baseUrl = loadEnv(mode, process.cwd()).VITE_APP_BASE_URL
  console.log('baseUr=====>', baseUrl)

  // 环境配置
  const dev_config = {}
  if (command === 'serve') {
    // dev 独有配置  dev_config
  } else {
    // build 独有配置  dev_config
  }
  return {
    name: adminName,
    base: '', // 生产环境下的公共路径

    ...dev_config,
    lintOnSave: process.env.NODE_ENV === 'development', // nodeJs中自带process模块，我们直接可以通过该变量来判断环境是否关闭语法校验

    resolve: {
      alias: {
        '@': resolve('src'),
        '@components': resolve('src/components'),
        '@assets': resolve('src/assets'),
        '@views': resolve('src/views'),
        '@common': resolve('src/common'),
        '@store': resolve('src/store'),
        '@server': resolve('src/server'),
        '@plugins': resolve('src/plugins'),
        '@api': resolve('src/api')
      }
    },

    define: {
      // 定义可以通过 process.env 的方式访问环境变量
      'process.env': import.meta.env
    },

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/element/index.scss" as *;`
        }
      }
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // 配置运行时编译器的选项
            // 将所有包含短横线的标签作为【自定义元素】处理 任何 'vue-' 开头的元素都会被识别为自定义元素
            isCustomElement: tag => tag.startsWith('vue-')
            // 将这个选项设置为 true 可以强制 Vue 在生产环境下保留注释。而在开发环境下注释是始终被保留的。
            // comments:true
          }
        }
      }),

      visualizer({ // 生成的分析图文件名，默认stats.html
        file: 'stats.html',
        open: true // 打包后自动打开分析图
      }),

      legacy({
        targets: ['defaults', 'not IE 11']
      })
    ],
    server: {
      hostname: '0.0.0.0', // 默认是 localhost
      port: 8635, // 默认是 3000 端口
      open: false, // 浏览器自动打开
      https: false, // 是否开启 https
      ssr: false, // 服务端渲染
      inline: true, // 开启热更新
      // outDir: 'dist', // 打包构建输出路径，默认 dist ，若是路径存在，构建以前会被删除
      // 代理
      proxy: {
        '/v1': {
          target: baseUrl, // 测试域名
          changOrigin: true,
          secure: false,
          pathRewrite: {
            '^/v1': '/v1'
          }
        }
      }
    }
    // 3.0.3版本此变量失效， 4.0.1版本有效
    // envPrefix: 'VITE_'
  }
})
