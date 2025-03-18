/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-09-15 16:03:27
 * @LastEditTime: 2023-09-21 16:46:10
 * @Description: 发送验证码
 * 
 * 参考文档：
 * 
 */
const { ErrorModel, SuccessModel } = require("../exceptions/index");
const { Op } = require("sequelize");

const moment = require("moment");
const models = require("../db/models/index");
const { getSixRandomCode } = require("../lib/createPassword");
const { isPhoneNumber, isVerifyCode } = require("../lib/validate");
const { VERIFY_CODE_EXPIRES_TIME } = require("../config");

// 发送验证码
const sendSMS = async (ctx, next) => {
  try {
    const { phoneNumber } = ctx.request.body;
    const phoneNumberVal = isPhoneNumber(phoneNumber);
    if (phoneNumberVal === true) {
      const result = await models.sequelize.transaction(async (t) => {
        const code = getSixRandomCode();
        const icExpiresTime = moment().add(VERIFY_CODE_EXPIRES_TIME, "m");
        const infoCode = await models.info_code.create(
          {
            icClassify: "preLogin",
            icType: "phoneNumberVerifyCode",
            icContent: code,
            icState: 1,
            icExpiresTime,
            icReValJson: { phoneNumber },
          },
          {
            transaction: t,
          }
        );

        // 调用腾讯云发送验证码



        if (infoCode) {
          return `已经成功发送验证码`;
        } else {
          throw new Error("发送验证码失败");
        }
      });

      ctx.body = new SuccessModel(result);
    } else {
      console.log("err======>");
      ctx.body = new ErrorModel(phoneNumberVal || "发送验证码失败");
    }
  } catch (err) {
    ctx.body = new ErrorModel(err || "发送验证码失败");
  }
};

// 对比发送的验证码
const validateSMS = async (ctx, next) => {
  try {
    const { phoneNumber, verifyCode } = ctx.request.body;
    const phoneNumberVal = isPhoneNumber(phoneNumber);
    if (phoneNumberVal === true) {
      const verifyCodeVal = isVerifyCode(verifyCode);
      if (verifyCodeVal === true) {
        const findInfoCode = await models.info_code.findOne({
          where: {
            icContent: verifyCode,
            icExpiresTime: {
              [Op.gte]: moment(),
            },

            icState: 1,

            // 可行方案一
            icReValJson: {
              phoneNumber: phoneNumber,
            },

            // 可行方案二
            // "icReValJson.phoneNumber": phoneNumber,

            // 可行方案三
            // icReValJson: { [Op.like]: literal(`'%${phoneNumber}%'`) },
          },
          attributes: {
            exclude: ["icReValJson", "icType", "icClassify", "icState"],
          },
        });

        if (findInfoCode) {
          // ctx.body = new SuccessModel(findInfoCode);
          // 获取到了验证码进行下一步
          await next()
        } else {
          ctx.body = new ErrorModel("未查询到信息码");
        }
      } else {
        ctx.body = new ErrorModel(verifyCodeVal);
      }
    } else {
      ctx.body = new ErrorModel(phoneNumberVal);
    }
  } catch (err) {}
};

exports.sendSMS = sendSMS;
exports.validateSMS = validateSMS;
