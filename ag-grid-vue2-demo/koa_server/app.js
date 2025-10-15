/*
 *                        _oo0oo_
 *                       o8888888o
 *                       88" . "88
 *                       (| -_- |)
 *                       0\  =  /0
 *                     ___/`---'\___
 *                   .' \\|     |// '.
 *                  / \\|||  :  |||// \
 *                 / _||||| -:- |||||- \
 *                |   | \\\  - /// |   |
 *                | \_|  ''\---/''  |_/ |
 *                \  .-\__  '-'  ___/-. /
 *              ___'. .'  /--.--\  `. .'___
 *           ."" '<  `.___\_<|>_/___.' >' "".
 *          | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *          \  \ `_.   \_ __\ /__ _/   .-` /  /
 *      =====`-.____`.___ \_____/___.-`___.-'=====
 *                        `=---='
 *
 *
 *      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 *            佛祖保佑     永不宕机     永无BUG
 */

/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-04-14 11:22:43
 * @LastEditTime: 2023-09-05 10:33:42
 * @Description: 入口文件
 */

const Koa = require("koa");
const app = new Koa();
require('module-alias/register');
const { koaBody } = require("koa-body");
const views = require("koa-views");
const json = require("koa-json");
const koaStatic = require("koa-static");
const koaMount = require("koa-mount");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
// const logger = require("koa-logger");
const cors = require("koa2-cors");
const dotenv = require("dotenv");
const { koaSwagger } = require("koa2-swagger-ui");
const swagger = require("./swagger/index");
const { generateRoutesMap } = require("./routes/index");
const { loggerProxy, httpLoggerMiddleware } = require("./logs/index");
const { proxyServer } = require("./lib/proxyServer");
const { ErrorModel } = require("./exceptions/index");
// const { createWsServer } = require("./webscoket/index");

const {
  BODY_PARSER_CONFIG,
  KOA2_CORS_CONFIG,
  KOA_BODY_CONFIG,
  ASSETS_ROOT_PATH,
  WS_CONFIG,
} = require("./config");

try {
  // 启用环境变量
  dotenv.config();

  // error handler
  onerror(app);

  // 创建WsServer
  // createWsServer(WS_CONFIG.PORT);

  // Cors
  app.use(cors(KOA2_CORS_CONFIG));

  // 文件格式上传类请求, 因为koa-bodyparser不支持 form-data 类的文件上传方式，但是支持 raw  json数据流的形式接受，这个必须放在koa-bodyparser前面，不然会报错
  app.use(koaBody(KOA_BODY_CONFIG));

  // middlewares , 不支持文件格式的请求解析
  app.use(bodyparser(BODY_PARSER_CONFIG));

  // response实现json输出
  app.use(json());

  // 请求打印日志
  // app.use(logger());

  // 静态资源
  app.use(koaMount(ASSETS_ROOT_PATH, koaStatic(__dirname + ASSETS_ROOT_PATH)));

  // 模板引擎
  app.use(
    views(__dirname + "/views", {
      extension: "ejs",
    })
  );

  // 请求耗时打印logger
  app.use(httpLoggerMiddleware);

  // swagger-ui文档注册配置
  app.use(swagger.routes(), swagger.allowedMethods());
  app.use(
    koaSwagger({
      routePrefix: "/swagger",
      swaggerOptions: {
        url: "/swagger.json",
      },
    })
  );

  // 服务器代理
  proxyServer(app);

  // 接口路由注册
  generateRoutesMap(app);

  // error-handling
  app.on("error", (err, ctx) => {
    console.error("系统错误", err, ctx);
    loggerProxy.error(String(err));
    ctx.status = 500;
    ctx.body = new ErrorModel(`系统出错,请联系管理员：${err}`);
  });
} catch (err) {
  console.log("系统捕获错误:", err);
  app.use((ctx) => {
    loggerProxy.error(`系统出错,请联系管理员：${String(err)}`);
    loggerProxy.info("ctx", ctx.status);
    ctx.status = 500;
    ctx.body = new ErrorModel(`系统出错,请联系管理员：${err}`, 500);
  });
}

module.exports = app;
