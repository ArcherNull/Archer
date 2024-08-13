/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-03 19:32:06
 * @LastEditTime: 2023-09-16 09:37:50
 * @Description:
 */
const moment = require("moment");
const nodemailer = require("nodemailer");
const { NODEMAILER_CONFIG, VERIFY_CODE_EXPIRES_TIME } = require("../config");
let nodeMail = nodemailer.createTransport(NODEMAILER_CONFIG.QQ);
const { randomWord, getSixRandomCode } = require("../lib/createPassword");
const models = require("../db/models/index");
const { encryptedPassword } = require("../middlewares/bcrypt");
const { isEmpty } = require("lodash");

let isMail = function (mail) {
  var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
  return reg.test(mail);
};


/**
 * @description: 发送邮件
 * @param {*} email
 * @param {*} type 发送邮箱类型 verifyCode 表示验证码 ， resetPwd 表示 重置密码
 * @param {*} userId 用户id 要表明是给谁发的验证码
 * @return {*}
 */
exports.sendEmail = (email, type = "preLoginVerifyCode", userId) => {
  return new Promise((resolve, reject) => {
    if (isMail(email)) {
      if (userId) {
        const code = type !== "resetPwd" ? getSixRandomCode() : randomWord();

        // 验证码 html 模板
        const verifyCodeHtml = `
        <p>您好！</p>
        <p>您的验证码是：<strong style="color:orangered;">${code}</strong></p>
        <p>此验证码在5分钟内有效</p>
        <p>如果不是您本人操作，请无视此邮件</p>
        `;

        // 重置密码 html 模板
        const resetPwdHtml = `
        <p>您好！</p>
        <p>您的新密码是：<strong style="color:orangered;">${code}</strong></p>
        <p>此验证码在5分钟内有效</p>
        <p>如果不是您本人操作，请无视此邮件</p>
        `;

        const subject = type !== "resetPwd" ? "验证码" : "重置密码";

        //发送邮件
        const mailOptions = {
          from: `"前端攻城狮"<${NODEMAILER_CONFIG.QQ.auth.user}>`, // 发件人
          subject, //邮箱主题
          to: email, //收件人，这里由post请求传递过来
          // 邮件内容，用html格式编写
          html: type !== "resetPwd" ? verifyCodeHtml : resetPwdHtml,
        };
        const icExpiresTime = moment().add(VERIFY_CODE_EXPIRES_TIME, "m")

        const queryOrDealInfo = () => {
          if (type === "resetPwd") {
            // 留下更改密码记录信息，可以做同一个用户一天内可以更改3次密码的限制
            return models.info_code
              .create({
                icClassify: "resetPwd",
                icType: "email",
                icContent: code,
                icExpiresTime,
                icReValJson: {
                  userId,
                  email,
                }
              })
              .then(() => {
                const encPassword = encryptedPassword(code);
                return models.user.update(
                  {
                    password: encPassword,
                  },
                  {
                    where: { id: userId },
                  }
                );
              });
          } else {
            // 发送验证码
            return models.info_code.create({
              icClassify: type,
              icType: "email",
              icContent: code,
              icExpiresTime,
              icReValJson: {
                userId,
                email,
              }
            });
          }
        };

        queryOrDealInfo()
          .then(() => {
            nodeMail.sendMail(mailOptions, (err, info) => {
              if (!err) {
                resolve(code);
              } else {
                reject(`${subject}发送失败，请稍后重试`);
              }
            });
          })
          .catch((err) => {
            console.log("err======>", err);
            reject(`${subject}发送失败，请稍后重试`);
          });
      } else {
        reject("未获取到用户信息，发送验证码失败");
      }
    } else {
      reject("请输入正确的邮箱");
    }
  });
};

/**
 * @description: 发送邮件提醒
 * @param {*} email
 * @param {*} userId 用户id 要表明是给谁发的验证码
 * @return {*}
 */
exports.sendRemindEmail = (email, content, userId) => {
  return new Promise((resolve, reject) => {
    if (isMail(email)) {
      if (!isEmpty(content)) {
        if (userId) {
          // 验证码 html 模板
          const emailRemindHtml = `
          <p>您好！</p>
          <p>本次提醒的内容是：<strong style="color:orangered;">${content}</strong></p>
          <p>有志者，事竟成</p>
          <p>祝你生活愉快，天天开心</p>
          `;

          const subject = "邮件提醒";

          //发送邮件
          const mailOptions = {
            from: `"前端攻城狮"<${NODEMAILER_CONFIG.QQ.auth.user}>`, // 发件人
            subject, //邮箱主题
            to: email, //收件人，这里由post请求传递过来
            // 邮件内容，用html格式编写
            html: emailRemindHtml,
          };

          // 数据库设置邮件提醒记录
          models.info_code
            .create({
              icClassify: "emailRemind",
              icType: "email",
              icContent: content,
              icExpiresTime: moment().add(1, "d"),
              icReValJson: {
                userId,
                email,
              }
            })
            .then(() => {
              nodeMail.sendMail(mailOptions, (err, info) => {
                if (!err) {
                  resolve(true);
                } else {
                  reject(`${subject}发送失败，请稍后重试`);
                }
              });
            })
            .catch((err) => {
              console.log("err======>", err);
              reject(`${subject}发送失败，请稍后重试`);
            });
        } else {
          reject("未获取到用户信息，发送验证码失败");
        }
      } else {
        reject("提醒内容不能为空");
      }
    } else {
      reject("请输入正确的邮箱");
    }
  });
};
