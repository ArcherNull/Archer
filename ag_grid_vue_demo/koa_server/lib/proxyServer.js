/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-28 08:39:28
 * @LastEditTime: 2023-07-28 09:43:39
 * @Description: 服务器代理
 */

const proxy = require("koa2-proxy-middleware");

exports.proxyServer = (app) => {
  app.use(
    proxy({
      targets: {
        // (.*) means anything
        "/proxy/(.*)": {
          target: "http://localhost:6532", //后端服务器地址
          changeOrigin: true,
          pathRewrite: {
            "/proxy": "",
          },
        },
      },
    })
  );
};
