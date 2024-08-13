/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-29 19:46:54
 * @LastEditTime: 2024-07-07 17:48:34
 * @Description: 登录接口封装
 */

const models = require("../models");
const moment = require("moment");
const { SuccessModel, ErrorModel } = require("@exceptions/index");
const { refreshToken } = require("@middlewares/jwt");
const { isEmpty } = require("lodash");
const {
  encryptedPassword,
  validatePasswordIsTrue,
} = require("@middlewares/bcrypt");

const { IC_ClASSIFY_LIST } = require("@lib/constants.js");
const { sendEmail } = require("@middlewares/nodemailer.js");

const {
  isUserName,
  isPhoneNumber,
  isMail,
  isPassword,
  isVerifyCode,
} = require("@lib/validate");

class LoginController {
  /**
   * 登录接口 , 两种方式登录，【密码用户名登录】以及【用户名和手机号登录】， 手机号登录优先级大于用户名和密码登录
   * @param ctx
   * @returns {Promise<void>}
   */
  static async login(ctx) {
    //接收客服端参数
    let bodyData = ctx.request.body;
    const { password, phoneNumber, email, verifyCode } = bodyData;

    if (password) {
      await LoginController.loginByPwd(ctx);
    } else if (phoneNumber && verifyCode) {
      // 如果存在手机号，则进入手机号验证
      await LoginController.loginByPhone(ctx);
    } else if (email && verifyCode) {
      await LoginController.loginByEMail(ctx);
    } else {
      ctx.body = new ErrorModel("请选择手机号和用户名密码其中一种方式登录");
    }
  }

  /**
   * @description: 用户密码登录
   * @param {*} ctx
   * @return {*}
   */
  static async loginByPwd(ctx) {
    let bodyData = ctx.request.body;
    const { userName, password, phoneNumber, email } = bodyData;

    const errLog = [];
    let queryData = {};

    if (userName || phoneNumber || email) {
      if (userName) {
        // 用户名校验
        const userNameVal = isUserName(userName);
        if (userNameVal !== true) {
          errLog.push(userNameVal);
        } else {
          queryData = {
            where: {
              userName,
            },
          };
        }
      }

      if (phoneNumber) {
        // 用户名校验
        const phoneNumberVal = isUserName(phoneNumber);
        if (phoneNumberVal !== true) {
          errLog.push(phoneNumberVal);
        } else {
          queryData = {
            where: {
              phoneNumber,
            },
          };
        }
      }

      if (email) {
        // 用户名校验
        const emailVal = isMail(email);
        if (emailVal !== true) {
          errLog.push(emailVal);
        } else {
          queryData = {
            where: {
              email,
            },
          };
        }
      }
    } else {
      errLog.push("账号/手机号/邮箱密码登录，其中至少有一个不能为空");
    }

    // 密码校验
    const passwordVal = isPassword(password);
    passwordVal !== true && errLog.push(passwordVal);

    if (!errLog.length && !isEmpty(queryData?.where)) {
      try {
        console.log("queryData=====>", queryData);

        // 如果存在手机号，则进入手机号验证
        let list = await models.user.findAll(queryData);

        if (list?.length === 1) {
          const currentUserData = list[0]?.dataValues;

          const isPasswordIsTrue = validatePasswordIsTrue(
            password,
            currentUserData.password
          );

          if (isPasswordIsTrue) {
            // 登录刷新当前用户token
            const newUserInfo = await refreshToken({
              userName: currentUserData.userName,
              phoneNumber: currentUserData.phoneNumber,
              id: currentUserData.id,
              type: "long",
            });

            console.log('newUserInfo=====>', newUserInfo)

            ctx.body = new SuccessModel({
              token: newUserInfo.token
            });
          } else {
            ctx.body = new ErrorModel("密码错误");
          }
        } else {
          ctx.body = new ErrorModel(list?.length > 0 ? "用户登录信息存在重复情况，请联系管理员" : "未获取到用户登录信息，请先注册")
        }
      } catch (err) {
        ctx.body = new ErrorModel("用户登录失败," + err);
      }
    } else {
      ctx.body = new ErrorModel(errLog[0] || "参数错误");
    }
  }

  /**
   * @description: 用手机号登录
   * @param {*} ctx
   * @return {*}
   */
  static async loginByPhone(ctx) {
    let bodyData = ctx.request.body;
    const { phoneNumber, verifyCode } = bodyData;

    const errLog = [];

    // 验证码校验
    const verifyCodeVal = isVerifyCode(verifyCode);
    verifyCodeVal !== true && errLog.push(verifyCodeVal);

    // 手机号校验
    const phoneNumberVal = isPhoneNumber(phoneNumber);
    phoneNumberVal !== true && errLog.push(phoneNumberVal);

    if (!errLog?.length) {
      ctx.body = new ErrorModel("手机号登录功能暂未开放");
    } else {
      ctx.body = new ErrorModel(errLog[0] || "参数错误");
    }
  }

  /**
   * @description: 用邮箱登录
   * @param {*} ctx
   * @return {*}
   */
  static async loginByEMail(ctx) {
    try {
      let bodyData = ctx.request.body;
      const { email, verifyCode } = bodyData;

      const errLog = [];

      // 邮箱校验
      const emailVal = isMail(email);
      emailVal !== true && errLog.push(emailVal);

      // 验证码校验
      const verifyCodeVal = isVerifyCode(verifyCode);
      verifyCodeVal !== true && errLog.push(verifyCodeVal);

      if (!errLog?.length) {
        // 先去找数据库中的验证数据
        let findInfoCode = await models.info_code.findOne({
          where: { icContent: verifyCode },
        });
        const infoCode = findInfoCode?.dataValues;
        if (infoCode) {
          const { icReValJson, icExpiresTime } = infoCode;

          if (moment(icExpiresTime).valueOf() >= moment().valueOf()) {
            if (icReValJson) {
              const { userId } = icReValJson
              if (userId) {
                let findUser = await models.user.findOne({
                  where: { id: userId },
                });
                const userInfo = findUser?.dataValues;
                if (userInfo) {
                  await models.info_code.destroy({
                    where: {
                      id: infoCode.id,
                    },
                  });

                  const newUserInfo = await refreshToken(userInfo);
                  ctx.body = new SuccessModel(newUserInfo);
                } else {
                  ctx.body = new ErrorModel("校验参数userId缺失");
                }
              } else {
                ctx.body = new ErrorModel("校验参数缺失");
              }
            } else {
              ctx.body = new ErrorModel("验证码已失效");
            }
          } else {
            ctx.body = new ErrorModel("验证码已过期");
          }
        } else {
          ctx.body = new ErrorModel("未获取到验证码");
        }
      } else {
        ctx.body = new ErrorModel(errLog[0] || "参数错误");
      }
    } catch (err) {
      ctx.body = new ErrorModel(err || "系统异常，请联系管理员");
    }
  }

  /**
   * @description: 用二维码登录
   * @param {*} ctx
   * @return {*}
   */
  static async loginByQrCode(ctx) {
    let bodyData = ctx.request.body;
    const { email, verifyCode } = bodyData;
  }

  /**
   * 登出接口
   * @param ctx
   * @returns {Promise<void>}
   */
  static async logOut(ctx) {
    //接收客服端参数
    let { id } = ctx.request.body;

    try {
      if (id) {
      } else {
        ctx.body = new ErrorModel("缺少用户id，登出失败");
      }
    } catch (err) {
      console.log("err", err);
      ctx.body = new ErrorModel("用户登出失败," + err);
    }
  }

  /**
   * @description: 参数校验
   * @param {*} params
   * @param {*} type 参数校验类型，
   * @return {*}
   */
  static validateRegQueryParams(params) {
    const errLog = [];
    let { userName, password, phoneNumber } = params;

    // 用户名校验
    const userNameVal = isUserName(userName);
    userNameVal !== true && errLog.push(userNameVal);

    // 手机号校验
    const phoneNumberVal = isPhoneNumber(phoneNumber);
    phoneNumberVal !== true && errLog.push(phoneNumberVal);

    // 密码校验
    const isPasswordVal = isPassword(password);
    isPasswordVal !== true && errLog.push(isPasswordVal);

    return errLog;
  }

  /**
   * 注册创建一个用户
   * @param ctx
   * @returns {Promise<void>}
   */
  static async register(ctx) {
    //接收客服端参数
    let bodyData = ctx.request.body;

    const errLog = LoginController.validateRegQueryParams(bodyData);

    if (!errLog?.length) {
      try {
        const { userName, phoneNumber, password } = bodyData;
        let findUser = await models.user.findOne({
          where: { userName },
        });
        if (!findUser) {
          let findPhone = await models.user.findOne({
            where: { phoneNumber },
          });

          if (!findPhone) {
            const encPassword = encryptedPassword(password);
            if (encPassword) {
              let user = await models.user.create({
                userName,
                phoneNumber,
                password: encPassword,
              });
              console.log("user=====>", user);
              ctx.body = new SuccessModel(user);
            } else {
              ctx.body = new ErrorModel("获取密码密文失败");
            }
          } else {
            ctx.body = new ErrorModel(`该用户手机号【${phoneNumber}】已被注册`);
          }
        } else {
          ctx.body = new ErrorModel(`该用户名称【${userName}】已被注册`);
        }
      } catch (err) {
        ctx.body = new ErrorModel("创建用户失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel(errLog[0] || "参数错误");
    }
  }

  /**
   * 注销用户，软删除 ，将userState字段设置为2
   * @param ctx
   * @returns {Promise<void>}
   */
  static async logOff(ctx) {
    //接收客服端参数
    let { id } = ctx.request.query;
    if (id) {
      try {
        await models.user.destroy({
          where: {
            id,
          },
        });
        ctx.body = new SuccessModel("删除用户成功");
      } catch (err) {
        ctx.body = new ErrorModel("删除用户失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("用户id是必传参数");
    }
  }

  /**
   * @description: 发送邮箱验证码
   * "email": "991584844@qq.com"
   * @param {*} ctx
   * @return {*}
   */
  static async sendEMailCode(ctx) {
    const { email, codeType } = ctx.request.body;
    const icClassiffyListArr = Object.keys(IC_ClASSIFY_LIST);
    if (codeType && icClassiffyListArr.includes(codeType)) {
      if (email) {
        const errLog = [];
        const queryData = {
          where: {},
        };

        const emailVal = isMail(email);
        if (emailVal !== true) {
          errLog.push(emailVal);
        } else {
          queryData.where.email = email;
        }

        if (!errLog.length) {
          let list = await models.user.findAll(queryData);

          console.log("list=====>", list);

          if (list?.length === 1) {
            const currentUserData = list[0]?.dataValues;
            const userId = currentUserData?.id;
            if (userId) {
              const sendEmailCode = await sendEmail(
                email,
                codeType !== "resetPwd" ? codeType : "resetPwd",
                userId
              );
              if (sendEmailCode) {
                ctx.body = new SuccessModel(
                  `邮箱为【${email}】发送${codeType !== "resetPwd" ? "邮箱验证码" : "重置密码"
                  }成功`
                );
              } else {
                ctx.body = new ErrorModel("发送邮箱验证码失败");
              }
            } else {
              ctx.body = new ErrorModel("用户信息获取失败,请联系管理员");
            }
          } else {
            ctx.body = new ErrorModel(`未获取到邮箱为【${email}】的用户数据`);
          }
        } else {
          ctx.body = new ErrorModel(errLog[0] || "参数错误");
        }
      } else {
        ctx.body = new ErrorModel("发送邮箱验证码，邮箱不能为空");
      }
    } else {
      ctx.body = new ErrorModel(
        `参数codeType不满足【${icClassiffyListArr.join("/")}】其中之一`
      );
    }
  }

  /**
   * @description: 重置密码，如果忘记了密码，需要找回密码，则可以通过邮箱，找到唯一用户，然后再使用邮箱重置密码
   * @param {*} ctx
   * @return {*}
   */
  static async resetPwdByEmail(ctx) {
    const { email, verifyCode } = ctx.request.body;

    if (email) {
      const errLog = [];
      const queryData = {
        where: {},
      };

      const emailVal = isMail(email);
      if (emailVal !== true) {
        errLog.push(emailVal);
      } else {
        queryData.where.email = email;
      }

      // 验证码校验
      const verifyCodeVal = isVerifyCode(verifyCode);
      verifyCodeVal !== true && errLog.push(verifyCodeVal);

      if (!errLog.length) {
        // 先去找数据库中的验证数据
        let findInfoCode = await models.info_code.findOne({
          where: { icContent: verifyCode },
        });
        const infoCode = findInfoCode?.dataValues;
        if (infoCode) {
          const { icReValJson, icExpiresTime } = infoCode;
          if (moment(icExpiresTime).valueOf() >= moment().valueOf()) {
            if (icReValJson) {
              const { userId } = icReValJson
              console.log('userId123123', userId)
              if (userId) {
                let findUser = await models.user.findOne({
                  where: { id: userId },
                });
                const userInfo = findUser?.dataValues;
                if (userInfo) {
                      const sendEmailCode = await sendEmail(
                        email,
                        "resetPwd",
                        userId
                      );
                      if (sendEmailCode) {
                        ctx.body = new SuccessModel(
                          `邮箱为【${email}】发送邮箱重置密码成功`
                        );
                      } else {
                        ctx.body = new ErrorModel("发送邮箱验证码失败");
                      }
                } else {
                  ctx.body = new ErrorModel("校验参数userId缺失");
                }
              } else {
                ctx.body = new ErrorModel("校验参数缺失");
              }
            } else {
              ctx.body = new ErrorModel("验证码已失效");
            }
          } else {
            ctx.body = new ErrorModel("验证码不正确");
          }
        } else {
          ctx.body = new ErrorModel("验证码不正确");
        }
      } else {
        ctx.body = new ErrorModel(errLog[0] || "参数错误");
      }
    } else {
      ctx.body = new ErrorModel("邮箱不能为空");
    }
  }
}

module.exports = LoginController;
