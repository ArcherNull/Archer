/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-08 10:55:58
 * @LastEditTime: 2024-07-26 01:16:53
 * @Description:
 */

const download = require("./download/index");

const sendSMS = require("./sendSMS/index");

const captcha = require("./captcha/index");

module.exports = (router) => {
  // 上传接口
  download(router);

  // 发送短信验证码接口
  sendSMS(router);

  // 图形验证码
  captcha(router);
};
