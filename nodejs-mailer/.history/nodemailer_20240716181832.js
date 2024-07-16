/*
 * @Author: Null
 * @Date: 2022-06-08 09:50:05
 * @Description:
 */
const nodemailer = require('nodemailer')

let nodeMail = nodemailer.createTransport({
  service: "qq", //类型qq邮箱
  port: 465, //上文获取的port
  secure: true, //上文获取的secure
  auth: {
    user: "779217162@qq.com", // 发送方的邮箱，可以选择你自己的qq邮箱
    pass: "上文获取的stmp授权码", // 上文获取的stmp授权码
  },
});

module.exports = nodeMail
