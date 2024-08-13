/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-08 10:56:32
 * @LastEditTime: 2023-07-08 10:57:18
 * @Description: 
 */

const login = require("./login/index");

module.exports = (router) => {
  // 上传接口
  login(router);
};
