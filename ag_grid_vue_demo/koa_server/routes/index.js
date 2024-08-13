/*
 * @Author: Null
 * @Date: 2023-01-13 14:18:05
 * @Description: 公共文件，路由注册
 */
const publicRoutes = require("./publicRoutes/index");
const privateRoutes = require("./privateRoutes/index");
const { parseJwt } = require("../middlewares/jwt");
const { ErrorModel } = require("../exceptions/index");

const {
  NO_TOKEN_PREFIX,
  TOKEN_PREFIX,
  ENV_VERSION,
  ASSETS_ROOT_PATH,
} = require("../config");

/**
 * @description: 路由注册
 * @param {*} app
 * @return {*}
 */
exports.generateRoutesMap = function (app) {
  // 请求路径判断
  app.use(async function (ctx, next) {
    const url = ctx.url;

    console.log('url123123',url)

    const regStr = new RegExp(
      "(^/" +
        ENV_VERSION +
        "(" +
        NO_TOKEN_PREFIX +
        "|" +
        TOKEN_PREFIX +
        ")/)|(^" +
        ASSETS_ROOT_PATH +
        ")/"
    );

    if (regStr.test(url)) {
      await next();
    } else {
      ctx.status = 404;
      ctx.body = new ErrorModel(null, 404);
      return;
    }
  });

  // 注册公共路由
  app.use(publicRoutes.routes(), publicRoutes.allowedMethods());

  // 解析jwt字符串， 鉴权路由可在全局ctx.jwtData 获取token里的信息
  app.use(parseJwt);

  // 注册私有路由
  app.use(privateRoutes.routes(), privateRoutes.allowedMethods());
};
