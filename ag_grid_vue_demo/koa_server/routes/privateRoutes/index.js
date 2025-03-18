/*
 * @Author: Null
 * @Date: 2023-01-13 18:22:04
 * @Description: 鉴权路由
 */
const router = require("koa-router")();
const { jwtMiddleware } = require("../../middlewares/jwt");
const { TOKEN_PREFIX, ENV_VERSION } = require("../../config");
const tableApi = require("./tableApi/index");
const commonApi = require("./commonApi/index");

// jwt接口校验前缀
router.prefix(`/${ENV_VERSION}${TOKEN_PREFIX}`);

// jwt中间件
router.use(jwtMiddleware);

// 表api注册
tableApi(router);

// 公共api注册
commonApi(router);

module.exports = router;
