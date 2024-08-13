/*
 * @Author: Null
 * @Date: 2023-01-13 18:23:57
 * @Description: jwt公共方法
 * 参考文档：https://www.css3er.com/p/304.html
 */

"use strict";
const { isObject, isEmpty } = require("lodash");
const moment = require('moment')
const koaJwt = require("koa-jwt");
const jwt = require("jsonwebtoken");
const {
  TOKEN_SECRET_KEY,
  TOKEN_EXPRESS_JWT_ALGORITHM,
  LONG_TOKEN_DEAD_TIME,
  SHORT_TOKEN_DEAD_TIME,
  ASSETS_ROOT_PATH,
  NO_TOKEN_PREFIX,
} = require("../config");
const models = require("../db/models/index");
const { ErrorModel } = require("../exceptions/index");

const regStr = new RegExp("^\\" + NO_TOKEN_PREFIX + "|\\" + ASSETS_ROOT_PATH);

/**
 * @description: 注册jwt中间件
 * @return {*}
 */
const jwtMiddleware = koaJwt({
  secret: TOKEN_SECRET_KEY,
  debug: true, // 开启debug可以看到准确的错误信息
  algorithms: TOKEN_EXPRESS_JWT_ALGORITHM,
}).unless({ path: [regStr] });

/**
 * @description: 生成jwt字符串
 * @param {*} data 对象数据    "Bearer " +
 * @param {*} type 类型 long 表示长token , short 表示短token
 * @return {*}
 */
const jwtFun = function (data, type = "long") {
  return new Promise((resolve, reject) => {
    if (isObject(data) && !isEmpty(data)) {
      const { userName, phoneNumber, id } = data;
      if (userName && phoneNumber && id) {
        const tokenStr = jwt.sign(data, TOKEN_SECRET_KEY, {
          expiresIn:
            type === "long" ? LONG_TOKEN_DEAD_TIME : SHORT_TOKEN_DEAD_TIME,
        });
        console.log("tokenStr=====>", tokenStr);
        resolve(tokenStr);
      } else {
        reject("用户名/用户手机号/用户id缺失，生成token失败");
      }
    } else {
      console.log("生成token需要传入不为空的data对象");
      reject("生成token需要传入不为空的data对象");
    }
  });
};

/**
 * @description: 解析jwt字符串
 * @param {*} ctx
 * @param {*} next
 * @return {*}
 */
const parseJwt = async function (ctx, next) {
  // 将 token 中的数据解密后存到 ctx 中
  try {
    const authorization = ctx.request.headers?.authorization || undefined;
    if (typeof authorization === "string" && authorization) {
      const [Bearer, token] = authorization.split(" ");
      if (Bearer !== "Bearer") {
        ctx.body = new ErrorModel(
          "header请求头部参数【Authorization】，请以【Bearer + 空格 + 值】格式传参",
          401
        );
        return;
      }

      if (token) {
        const jwtData = jwt.verify(token, TOKEN_SECRET_KEY);
        // 这里的 exp 和 lat 可以实现后端动态刷新token
        const userInfo = await models.user.findByPk(jwtData.id);
        if (userInfo) {
          ctx.jwtData = jwtData;
          await next();
        } else {
          ctx.body = new ErrorModel("用户信息缺失，token失效", 401);
        }
      }
    } else {
      ctx.body = new ErrorModel(null, 401);
      return;
    }
  } catch (err) {
    console.log("解析出错", err);
    ctx.body = new ErrorModel(err.message, 401);
    return;
  }
};

/**
 * @description: 刷新token，记录当前系统用户登录
 * @param {*} data
 * @return {*}
 */
const refreshToken = function (data) {
  return new Promise((resolve, reject) => {
    let { userName, phoneNumber, id, type } = data;
    const jType = ["long", "short"].includes(type) ? type : "long";
    jwtFun({ userName, phoneNumber, id }, jType)
      .then((token) => {
        return models.user.update(
          {
            token,
          },
          {
            where: { id },
          },
        );
      })
      .then(() => {
        return models.user.findOne({
          attributes: { exclude: ["password"] },
          where: { id },
          raw: true
        });
      })
      .then((findUser) => {
        resolve(findUser);
      })
      .catch((err) => {
        reject(err || "刷新token失败");
      });
  });
};

exports.jwtMiddleware = jwtMiddleware;
exports.jwt = jwtFun;
exports.parseJwt = parseJwt;
exports.refreshToken = refreshToken;
