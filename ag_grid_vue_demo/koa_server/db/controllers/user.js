/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-02 10:08:34
 * @LastEditTime: 2024-07-08 01:01:06
 * @Description: 用户表
 */
const { Op } = require("sequelize");
const models = require("../models");
const {
  SuccessModel,
  ErrorModel,
  SuccessPageModel,
} = require("@exceptions/index");

const { filterObjEmptyProperty } = require("@lib/common");
const { refreshToken } = require("@middlewares/jwt");

const { encryptedPassword, validatePasswordIsTrue } = require("@middlewares/bcrypt");
const {
  isPositiveInteger,
  isPhoneNumber,
  isNoEmpty,
  isIDCard,
  isMail,
  isChineseName,
  isUserName,
  isSex,
  isDate,
} = require("@lib/validate");
const { PAGE_SIZE, CURRENT_PAGE, INIT_PASSWORD } = require("@config");
const { getFormatTime, parseSeqSqlIds } = require("@lib/common");

class UserController {
  /**
   * @description: 获取list的查询参数 , DESC , ASC
   * @param {*} params
   * @return {*}
   */
  static getListQueryParams(params) {
    return new Promise(async (resolve, reject) => {
      let queryData = {
        attributes: { exclude: ["password", "token"] },
        order: [["updatedAt", "desc"]],
      };
      let { queryParams, pageSize, pageNum } = params;

      if (isPositiveInteger(pageSize)) {
        queryData.limit = pageSize;
      } else {
        reject("pageSize需为正整数");
      }

      if (isPositiveInteger(pageNum)) {
        queryData.offset = (pageNum - 1) * pageSize;
      } else {
        reject("pageNum需为正整数");
      }

      // 默认取用户userState不为2的数据
      queryData.where = {
        userState: {
          [Op.ne]: 2,
        },
      };
      const describeObj = await models.user.describe();
      const attributes = Object.keys(describeObj)
      const queryNoEmptyObj = filterObjEmptyProperty(queryParams, attributes);
      if (queryNoEmptyObj) {
        queryData.where = queryNoEmptyObj;
      }

      resolve(queryData);
    });
  }

  /**
   * 用户列表
   * @param ctx
   * @returns {Promise<void>}
   */
  static async list(ctx) {
    //接收客服端参数
    const {
      queryParams,
      pageSize = PAGE_SIZE,
      pageNum = CURRENT_PAGE,
    } = ctx.request.body;

    const queryData = await UserController.getListQueryParams({
      queryParams,
      pageSize,
      pageNum,
    }).catch((err) => {
      ctx.body = new ErrorModel(err || "参数错误");
      return;
    });

    if (queryData) {
      console.log('queryData12313', queryData)
      try {
        const { count, rows } = await models.user.findAndCountAll(queryData);
        ctx.body = new SuccessPageModel({
          data: rows,
          total: count,
          pageSize,
          pageNum,
        });
      } catch (err) {
        console.log("err=====>", err);
        ctx.body = new ErrorModel(err || "参数错误");
      }
    }
  }

  /**
   * @description: 创建用户参数筛选
   * @param {*} params
   * @return {*}
   */
  static getCreateQueryParams(params) {
    return new Promise(async (resolve, reject) => {
      const {
        id,
        userName,
        userImg,
        sex,
        realName,
        birthday,
        idCardNo,
        phoneNumber,
        age,
        email,
      } = params;

      // 用户名校验
      const userNameVal = isUserName(userName);
      userNameVal !== true && reject(userNameVal);

      const getNewQueryData = (key, value) => {
        if (key) {
          const queryData = {
            where: {
              [key]: value,
            },
          };
          id && (queryData.where.id = { [Op.ne]: id });
          return queryData;
        } else {
          reject("getNewQueryData方法键值不能为空");
          return {};
        }
      };

      let findUser = await models.user.findOne(
        getNewQueryData("userName", userName)
      );
      findUser && reject(`该用户名称${userName}已被注册`);

      // 用户头像校验
      const userImgVal = isNoEmpty(userImg, "用户头像");
      userImgVal !== true && reject(userImgVal);

      // 用户性别校验
      const sexVal = isSex(sex);
      sexVal !== true && reject(sexVal);

      if (realName) {
        // 真实姓名校验
        const realNameVal = isChineseName(realName);
        realNameVal !== true && reject(realNameVal);
      }

      // 用户生日校验
      if (birthday) {
        const birthdayVal = isDate(birthday, "用户生日");
        birthdayVal !== true && reject(birthdayVal);
      }

      // 用户年龄校验
      if (age) {
        const ageVal = isNoEmpty(age, "用户年龄");
        ageVal !== true && reject(ageVal);
      }

      if (idCardNo) {
        // 身份证号校验
        const idCardNoVal = isIDCard(idCardNo);
        idCardNoVal !== true && reject(idCardNoVal);
      }

      // 手机号校验
      const phoneNumberVal = isPhoneNumber(phoneNumber);
      phoneNumberVal !== true && reject(phoneNumberVal);

      let findPhoneNumber = await models.user.findOne(
        getNewQueryData("phoneNumber", phoneNumber)
      );
      findPhoneNumber && reject(`该用户手机号${phoneNumber}已被注册`);

      // 邮箱校验
      const emailVal = isMail(email);
      emailVal !== true && reject(emailVal);
      let findEmail = await models.user.findOne(
        getNewQueryData("email", email)
      );
      findEmail && reject(`该用户手机号${email}已被注册`);

      resolve(params);
    });
  }

  /**
   * 创建一个用户
   * @param ctx
   * @returns {Promise<void>}
   */
  static async create(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;
    const createUserData = await UserController.getCreateQueryParams(
      bodyData
    ).catch((err) => {
      ctx.body = new ErrorModel(err || "参数错误");
    });

    if (createUserData) {
      try {
        const pwd = createUserData?.password || INIT_PASSWORD;
        const encPassword = encryptedPassword(pwd);
        let userInfo = await models.user.create({
          ...createUserData,
          password: encPassword,
        });
        ctx.body = new SuccessModel({
          data: userInfo,
          message: `创建用户数据成功，密码为：${pwd}`,
        });
      } catch (err) {
        ctx.body = new ErrorModel("创建用户失败," + err);
      }
    }
  }

  /**
   * 获取一个用户详情
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async detail(ctx) {
    const { id } = ctx.params;
    await UserController.getUserDetail(ctx, id);
  }

  /**
   * @description: 通过id查询用户详情
   * @param {*} ctx
   * @param {*} id
   * @return {*}
   */
  static async getUserDetail(ctx, id) {
    try {
      if (id) {
        if (isPositiveInteger(id) === true) {
          try {
            // 查询用户详情模型
            let user = await models.user.findOne({
              attributes: { exclude: ["password", "token"] },
              where: { id },
            });

            if (user) {
              ctx.body = new SuccessModel(user);
            } else {
              ctx.body = new ErrorModel(`未查询到用户id为【${id}】的用户详情`);
            }
          } catch (err) {
            ctx.body = new ErrorModel("查询用户详情失败，" + err);
          }
        } else {
          ctx.body = new ErrorModel(
            `用户id参数错误,id应为正整数，目前为【${id}】`
          );
        }
      } else {
        ctx.body = new ErrorModel("用户id是必传参数");
      }
    } catch (err) {
      ctx.body = new ErrorModel("查询用户详情失败，" + err);
    }
  }

  /**
   * 通过token,获取用户详情
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getUserInfoByToken(ctx) {
    const { id } = ctx.jwtData;
    await UserController.getUserDetail(ctx, id);
  }

  /**
   * 编辑用户
   * @param ctx
   * @returns {Promise<void>}
   */
  static async edit(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;
    const id = bodyData?.id;
    if (id) {
      if (isPositiveInteger(id) === true) {
        const editUserData = await UserController.getCreateQueryParams(
          bodyData
        ).catch((err) => {
          ctx.body = new ErrorModel(err || "参数错误");
          return;
        });

        if (editUserData) {
          try {
            await models.user.update(editUserData, {
              where: { id },
            });

            ctx.body = new SuccessModel("更新成功");
          } catch (err) {
            ctx.body = new ErrorModel("更新用户失败，" + err);
          }
        }
      } else {
        ctx.body = new ErrorModel("用户id应为正整数，格式不正确");
      }
    } else {
      ctx.body = new ErrorModel("用户id是必传参数");
    }
  }

  /**
   * 批量编辑用户状态, 将userState字段设置为2
   * @param ctx
   * @returns {Promise<void>}
   */
  static async batchEditUserState(ctx) {
    //接收客服端参数
    let { ids, userState } = ctx.request.body;
    console.log('userState', userState)
    console.log('ids', ids)

    if (ids) {
      if ([0, 1, 2].includes(userState)) {
        try {
          const idArr = parseSeqSqlIds(ids);
          if (idArr?.length) {
            console.log('idArr123123', idArr)
            const [updateNum] = await models.user.update(
              {
                userState,
              },
              {
                where: {
                  [Op.or]: idArr,
                },
              }
            );
            console.log('updateNum=====>', updateNum)
            ctx.body = updateNum > 0 ? new SuccessModel(`编辑用户状态成功【${updateNum}】`) : new ErrorModel("编辑用户状态失败");
          } else {
            ctx.body = new ErrorModel("ids是必传参数");
          }
        } catch (err) {
          ctx.body = new ErrorModel("编辑用户状态失败，" + err);
        }
      } else {
        ctx.body = new ErrorModel("userState参数不满足0-禁用；1-启用；2-注销");
      }
    } else {
      ctx.body = new ErrorModel("ids是必传参数");
    }
  }

  /**
   * 重置密码
   * @param ctx
   * @returns {Promise<void>}
   */
  static async resetUserPwd(ctx) {
    //接收客服端参数
    let { oldPwd, newPwd } = ctx.request.body;
    if (oldPwd && newPwd) {
      if (newPwd !== oldPwd) {
        try {
          const { id } = ctx.jwtData;
          // 查询用户详情模型
          let user = await models.user.findOne({
            where: { id },
            raw: true
          });
          if (user) {
            const isPasswordIsTrue = validatePasswordIsTrue(
              oldPwd,
              user.password
            );
            if (isPasswordIsTrue) {
              const encPassword = encryptedPassword(newPwd);
              const [bool] = await models.user.update(
                {
                  password: encPassword,
                },
                {
                  where: { id },
                }
              );
              ctx.body = bool ? new SuccessModel("设置密码成功") : new ErrorModel(`设置密码失败`);
            } else {
              ctx.body = new ErrorModel(`原密码不正确，修改密码失败`);
            }
          } else {
            ctx.body = new ErrorModel(`未查询到用户id为【${id}】的用户详情`);
          }


        } catch (err) {
          ctx.body = new ErrorModel("删除用户失败，" + err);
        }
      } else {
        ctx.body = new ErrorModel("设置的新密码不能跟旧密码一样");
      }
    } else {
      ctx.body = new ErrorModel("新密码和旧密码是必传参数");
    }
  }

  /**
   * 删除用户, 软删除 ，将userState字段设置为2
   * @param ctx
   * @returns {Promise<void>}
   */
  static async softDel(ctx) {
    //接收客服端参数
    let { id } = ctx.request.body;
    if (id) {
      try {
        await models.user.update(
          {
            userState: 2,
          },
          {
            where: {
              id,
            },
          }
        );
        ctx.body = new SuccessModel("删除用户成功");
      } catch (err) {
        ctx.body = new ErrorModel("删除用户失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("用户id是必传参数");
    }
  }

  /**
   * 批量删除，物理删除
   * @param ctx
   * @returns {Promise<void>}
   */
  static async batchDel(ctx) {
    //接收客服端参数
    let { ids } = ctx.request.body;
    if (ids) {
      try {
        const idArr = parseSeqSqlIds(ids);
        if (idArr?.length) {
          const [updateNum] = await models.user.update(
            {
              userState: 2,
            },
            {
              where: {
                [Op.or]: idArr,
              },
            }
          );
          ctx.body = updateNum > 0 ? new SuccessModel(`删除用户成功【${updateNum}】`) : new ErrorModel("删除用户失败");
        } else {
          ctx.body = new ErrorModel("ids是必传参数");
        }
      } catch (err) {
        ctx.body = new ErrorModel("删除用户失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("ids是必传参数");
    }
  }

  /**
   * 删除用户, 物理删除
   * @param ctx
   * @returns {Promise<void>}
   */
  static async del(ctx) {
    //接收客服端参数
    let { id } = ctx.params;
    if (id) {
      if (isPositiveInteger(id) === true) {
        try {
          await models.user.destroy({
            where: {
              id,
            },
          });
          ctx.body = new SuccessModel("物理删除用户成功");
        } catch (err) {
          ctx.body = new ErrorModel("物理删除用户失败，" + err);
        }
      } else {
        ctx.body = new ErrorModel(
          `用户id参数错误, id应为正整数，目前为【${id}】`
        );
      }
    } else {
      ctx.body = new ErrorModel("物理删除，用户id是必传参数");
    }
  }

  /**
   * @description: 刷新用户长token
   * @param {*} ctx
   * @return {*}
   */
  static async refreshLongToken(ctx) {
    await UserController.refreshToken(ctx, "long");
  }

  /**
   * @description: 刷新用户短token
   * @param {*} ctx
   * @return {*}
   */
  static async refreshShortToken(ctx) {
    await UserController.refreshToken(ctx, "short");
  }

  /**
   * @description: 刷新用户token
   * @param {*} ctx
   * @return {*}
   */
  static async refreshToken(ctx, type = "long") {
    try {
      const { userName, phoneNumber, id } = ctx.jwtData;
      const userInfo = await refreshToken({
        userName,
        phoneNumber,
        id,
        type,
      }).catch((err) => {
        throw new Error(err || "刷新token失败");
      });

      if (userInfo) {
        console.log("userInfo======>", userInfo);
        ctx.body = new SuccessModel(userInfo);
      } else {
        throw new Error("未查询到用户信息，刷新token失败");
      }
    } catch (err) {
      ctx.body = new ErrorModel("刷新token失败");
    }
  }

  /**
   * @description: 用户事务测试
   * @param {*} ctx
   * @return {*}
   */
  static async transaction(ctx) {
    try {
      const { userName, password, phoneNumber } = ctx.request.body;
      const result = await models.sequelize.transaction(async (t) => {
        const encPassword = encryptedPassword(password || INIT_PASSWORD);

        const user = await models.user.findOrCreate({
          where: {
            userName,
            phoneNumber,
          },
          defaults: {
            userTags: "分配任务",
            password: encPassword,
          },
          attributes: { exclude: ["password", "token"] },
          transaction: t,
        });

        console.log("user======>", user[0]);

        await models.task.create(
          {
            taskName: "计划任务",
            taskStartTime: getFormatTime(),
            taskEndTime: getFormatTime(7),
            createBy: userName,
            createById: user[0].id,
          },
          { transaction: t }
        );

        return user;
      });

      console.log("result=====>", result);
      ctx.body = new SuccessModel(result);

      // 如果执行到此行,则表示事务已成功提交,`result`是事务返回的结果
      // `result` 就是从事务回调中返回的结果(在这种情况下为 `user`)
    } catch (error) {
      // 如果执行到此,则发生错误.该事务已由 Sequelize 自动回滚！
      ctx.body = new ErrorModel("创建用户失败,给用户分配默认配置失败," + error);
    }
  }
}

module.exports = UserController;
