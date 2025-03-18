/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-26 08:55:19
 * @LastEditTime: 2023-07-26 12:17:32
 * @Description:
 *
 * swagger参考文档：https://editor.swagger.io/
 *
 */
const router = require("koa-router")();
const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc"); //引入swagger-jsdoc
const { SWAGGER_CONFIG, VERSION , ENV_VERSION } = require("../config");

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: SWAGGER_CONFIG.TITLE, //文档标题
    version: VERSION, //版本号
    host: "localhost:3008", //服务器地址
    basePath: `/${ENV_VERSION}`, //访问地址，有些人喜欢在host:port/api/xxx这种格式，可以在此处配置为/api/.
  },
};
const options = {
  swaggerDefinition,
  //写有注解的router的存放地址, 最好使用path.join(),这里使用物理路径
  apis: [path.join(__dirname, '../routes/**/*.js')], 
};
const swaggerSpec = swaggerJSDoc(options);

// 通过路由获取生成的注解文件
router.get("/swagger.json", async function (ctx) {
  ctx.set("Content-Type", "application/json");

  ctx.body = swaggerSpec;
});

module.exports = router;
