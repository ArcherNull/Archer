/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-03-28 20:41:52
 * @LastEditTime: 2024-07-22 21:49:43
 * @Description:
 *
 * 参考：https://blog.csdn.net/qq_34664239/article/details/129550035
 *
 */
const path = require("path");
// vue.config.js
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { defineConfig } = require("@vue/cli-service");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
function resolve(dir) {
  return path.join(__dirname, dir);
}

const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;
const domain = process.env.VUE_APP_DOMAIN;

module.exports = defineConfig({
  transpileDependencies: true,
  // publicPath: "", // publicPath属性适用于vue-cli 高于3.2.0的项目
  publicPath: process.env.VUE_APP_BUILD_PUBLIC_PATH, // publicPath属性适用于vue-cli 高于3.2.0的项目
  // 语法校验
  lintOnSave: false,
  
  devServer: {
    port: 8666,
    proxy: {
      [apiBaseUrl]: {
        target: domain,
        ws: false,
        changeOrigin: true,
      },
    },
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */
          "primary-color": "#DA8141",
          "link-color": "#DA8141",
          "border-radius-base": "4px",
        },
        javascriptEnabled: true,
        charset: false,
        // 每个样式文件中加入
        additionalData: `@import "./src/assets/styles/variable.less";`,
      },
    },
  },

  configureWebpack: {
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              // 生产环境自动删除console
              drop_console: true,
              // 删除debugger
              drop_debugger: true,
            },
          },
          extractComments: false, // 是否将注释提取到单独的文件中
        }),
      ],
    },

    // 由于在webpack5中移除了nodejs核心模块的polyfill自动引入，所以需要手动引入 npm install node-polyfill-webpack-plugin
    plugins: [
      new NodePolyfillPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: resolve("src/worker"),
            to: resolve("dist/worker"),
            toType: "dir",
          },
        ],
        options: {},
      }),
    ],
    // 解决 Module not found: Error: Can't resolve './cptable'
    externals: {
      "./cptable": "var cptable",
    },
    // 解决 Module not found: Error: Can't resolve 'fs'
    resolve: {
      fallback: {
        fs: false,
      },
      alias: {
        "@": resolve("src"),
        "@components": resolve("src/components"),
        "@assets": resolve("src/assets"),
        "@views": resolve("src/views"),
        "@store": resolve("src/store"),
        "@api": resolve("src/api"),
      },
    },


    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
        },
      ],
    },

    // webpack4的方式，不适用于当前环境
    // module: {
    //   rules: [
    //     {
    //       test: /\.worker.js$/,
    //       use: {
    //         loader: "worker-loader",
    //         // 允许将内联的 web worker 作为 BLOB
    //         options: { inline: "no-fallback" },
    //       },
    //     },
    //   ],
    // },
  },

  // chainWebpack: (config) => {
  //   console.log("执行chainWebpack");
  //   // set worker-loader
  //   config.module
  //     .rule("worker")
  //     .test(/\.worker\.js$/) // 如果需要.worker.js后缀
  //     .use("worker-loader")
  //     .loader("worker-loader")
  //     .options({
  //       // 可以查阅worker-loader文档，根据自己的需求进行配置
  //       inline: 'fallback'
  //     });
  //   // 解决：worker 热更新问题
  //   // config.module.rule("js").exclude.add(/\.worker\.js$/);
  //   // 解决：“window is undefined”报错，这个是因为worker线程中不存在window对象，因此不能直接使用，要用this代替
  //   config.output.globalObject("this");
  // },
});
