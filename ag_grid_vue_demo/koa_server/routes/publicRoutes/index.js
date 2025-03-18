/*
 * @Author: Null
 * @Date: 2023-01-13 18:21:50
 * @Description: 开放路由
 */
const router = require("koa-router")();
const { NO_TOKEN_PREFIX, ENV_VERSION } = require("../../config");
const tableApi = require("./tableApi/index");
const commonApi = require("./commonApi/index");

// 公共接口前缀
router.prefix(`/${ENV_VERSION}${NO_TOKEN_PREFIX}`);

// 表api注册
tableApi(router);

// 公共api注册
commonApi(router);

module.exports = router;
