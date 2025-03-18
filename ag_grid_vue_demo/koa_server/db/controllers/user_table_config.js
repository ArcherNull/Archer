/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-05 09:30:51
 * @LastEditTime: 2024-05-06 09:42:50
 * @Description: 用户表格配置表
 */
const models = require("../models");
const {
  SuccessModel,
  ErrorModel,
  SuccessPageModel,
} = require("@exceptions/index");
const { isPositiveInteger, isNoEmpty } = require("@lib/validate");
const { filterObjEmptyProperty } = require("@lib/common");
const { addCreateCommonField } = require("@middlewares/addCommonField");

const { PAGE_SIZE, CURRENT_PAGE } = require("@config");

class UserTableConfigController {
  /**
   * @description: 获取list的查询参数
   * @param {*} params
   * @return {*}
   */
  static getListQueryParams(params) {
    return new Promise((resolve, reject) => {
      let queryData = {};
      let {
        queryParams,
        pageSize = PAGE_SIZE,
        pageNum = CURRENT_PAGE,
      } = params;

      const errLog = [];

      if (isPositiveInteger(pageSize) === true) {
        queryData.limit = pageSize;
      } else {
        errLog.push("pageSize需为正整数");
      }

      if (isPositiveInteger(pageNum) === true) {
        queryData.offset = (pageNum - 1) * pageSize;
      } else {
        errLog.push("pageNum需为正整数");
      }

      console.log("errLog=====>", errLog);
      if (!errLog.length) {
        const queryNoEmptyObj = filterObjEmptyProperty(queryParams);
        if (queryNoEmptyObj) {
          queryData.where = queryNoEmptyObj;
        }

        resolve({
          queryData,
          paramsObj: {
            queryParams,
            pageSize,
            pageNum,
          },
        });
      } else {
        reject(errLog.join(","));
      }
    });
  }

  /**
   * 用户表格配置列表
   * @param ctx
   * @returns {Promise<void>}
   */
  static async list(ctx) {
    try {
      //接收客服端参数
      const bodyData = ctx.request.body;
      console.log("bodyData====>", bodyData);

      const { queryData, paramsObj } =
        await UserTableConfigController.getListQueryParams(bodyData);

      console.log("queryData====>", queryData);
      console.log("paramsObj====>", paramsObj);
      if (queryData) {
        const { count, rows } = await models.user_table_config.findAndCountAll(
          queryData
        );
        ctx.body = new SuccessPageModel({
          data: rows,
          total: count,
          pageSize: paramsObj.pageSize,
          pageNum: paramsObj.pageNum,
        });
      }
    } catch (err) {
      console.log("err======>", err);
      ctx.body = new ErrorModel(err || "参数错误");
    }
  }

  /**
   * @description: 创建用户表格配置参数筛选
   * @param {*} params
   * @return {*}
   */
  static getCreateQueryParams(params) {
    return new Promise(async (resolve, reject) => {
      const { type, userId, menuName } = params;

      // 用户表格配置类型
      const typeVal = isNoEmpty(type, "用户表格配置类型");
      typeVal !== true && reject(typeVal);

      // 用户id
      const userIdVal = isNoEmpty(userId, "用户id");
      userIdVal !== true && reject(userIdVal);

      // 用户id
      const menuNameVal = isNoEmpty(menuName, "菜单路径");
      menuNameVal !== true && reject(menuNameVal);

      resolve(params);
    });
  }

  /**
   * 创建一个用户表格配置
   * @param ctx
   * @returns {Promise<void>}
   */
  static async create(ctx) {
    try {
      //接收客服端参数
      const bodyData = ctx.request.body;

      const createUserTableConfigData =
        await UserTableConfigController.getCreateQueryParams(bodyData);

      if (createUserTableConfigData) {
        let taskInfo = await models.user_table_config.create({
          ...addCreateCommonField(ctx),
          ...createUserTableConfigData,
        });
        ctx.body = new SuccessModel(taskInfo);
      } else {
        ctx.body = new ErrorModel("创建失败");
      }
    } catch (err) {
      ctx.body = new ErrorModel("创建用户表格配置失败," + err);
    }
  }

  /**
   * 获取一个用户表格配置详情
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async detail(ctx) {
    const { id } = ctx.params;
    if (id) {
      try {
        // 查询用户表格配置详情模型
        let task = await models.user_table_config.findOne({
          where: { id },
        });
        if (task) {
          ctx.body = new SuccessModel(task);
        } else {
          ctx.body = new ErrorModel(
            `未查询到用户表格配置id为【${id}】的用户表格配置详情`
          );
        }
      } catch (err) {
        ctx.body = new ErrorModel("查询用户表格配置详情失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("用户表格配置id是必传参数");
    }
  }

  /**
   * 编辑用户表格配置
   * @param ctx
   * @returns {Promise<void>}
   */
  static async edit(ctx) {
    //接收客服端参数
    const { id, ...bodyData } = ctx.request.body;
    if (id) {
      try {
        const editUserTableConfigData =
          await UserTableConfigController.getCreateQueryParams(bodyData);

        if (editUserTableConfigData) {
          const editResult = await models.user_table_config.update(
            editUserTableConfigData,
            {
              where: { id },
            }
          );
          console.log("editResult=====>", editResult);

          const editRes = editResult[0];
          if (editRes === 1) {
            ctx.body = new SuccessModel("更新成功");
          } else {
            ctx.body = new ErrorModel("更新失败");
          }
        } else {
          ctx.body = new ErrorModel("更新失败");
        }
      } catch (err) {
        ctx.body = new ErrorModel("更新用户表格配置失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("用户表格配置id是必传参数");
    }
  }

  /**
   * 删除用户表格配置12
   * @param ctx
   * @returns {Promise<void>}
   */
  static async del(ctx) {
    //接收客服端参数
    let { id } = ctx.request.query;
    if (id) {
      try {
        const delResult = await models.user_table_config.destroy({
          where: {
            id,
          },
        });
        if (delResult === 1) {
          ctx.body = new SuccessModel("删除用户表格配置成功");
        } else {
          ctx.body = new ErrorModel("删除用户表格配置失败");
        }
      } catch (err) {
        ctx.body = new ErrorModel("删除用户表格配置失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("用户表格配置id是必传参数");
    }
  }
}

module.exports = UserTableConfigController;
