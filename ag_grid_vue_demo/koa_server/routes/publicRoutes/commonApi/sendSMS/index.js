/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-09-15 15:59:53
 * @LastEditTime: 2024-05-06 09:46:56
 * @Description:
 */
const { sendSMS, validateSMS } = require("@middlewares/sendSMS");

module.exports = (router) => {
  // 发送短信验证码接口
  router.post("/sendSMS", sendSMS);

  // 发送短信验证码接口
  router.post("/validateSMS", validateSMS);
};
