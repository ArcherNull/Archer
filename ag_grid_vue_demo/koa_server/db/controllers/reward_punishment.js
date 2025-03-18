/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-05 08:44:11
 * @LastEditTime: 2024-05-06 09:42:38
 * @Description: 奖惩表
 */
const models = require("../models");
const { SuccessModel, ErrorModel } = require("@exceptions/index");
const {
  isPositiveInteger,
  isValidatedName,
} = require("@lib/validate");
const { filterObjEmptyProperty } = require("@lib/common");
const { addCreateCommonField } = require("@middlewares/addCommonField");
const { PAGE_SIZE, CURRENT_PAGE } = require("@config");

class RewPunController {
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

      const queryNoEmptyObj = filterObjEmptyProperty(queryParams);
      if (queryNoEmptyObj) {
        queryData.where = queryNoEmptyObj
      }

      resolve(queryData);
    });
  }

  /**
   * 奖惩列表
   * @param ctx
   * @returns {Promise<void>}
   */
  static async list(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;
    const queryData = await RewPunController.getListQueryParams(bodyData).catch(
      (err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      }
    );

    if (queryData) {
      try {
        const rpList = await models.reward_punishment.findAll(queryData);
        ctx.body = new SuccessModel(rpList);
      } catch (err) {
        console.log("err=====>", err);
        ctx.body = new ErrorModel(err || "参数错误");
      }
    }
  }

  /**
   * @description: 创建奖惩参数筛选
   * @param {*} params
   * @return {*}
   */
  static getCreateQueryParams(params) {
    return new Promise(async (resolve, reject) => {
      const { rpName, bindTaskId, bindPlanId } = params;

      // 奖惩名校验
      const rpNameVal = isValidatedName(rpName);
      rpNameVal !== true && reject(rpNameVal);

      let findRewPun = await models.reward_punishment.findOne({
        where: { rpName },
      });
      findRewPun && reject(`该奖惩名称${rpName}已被注册`);

      // 奖惩类型校验 , 需根据字典表校验

      // 绑定计划id 和 绑定任务id 需要有一个
      if (!(bindTaskId || bindPlanId)) {
        reject("至少需要绑定一个计划id或任务id");
      }

      resolve(params);
    });
  }

  /**
   * 创建一个奖惩
   * @param ctx
   * @returns {Promise<void>}
   */
  static async create(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;

    const createRewPunData = await RewPunController.getCreateQueryParams(
      bodyData
    ).catch((err) => {
      ctx.body = new ErrorModel(err || "参数错误");
      return;
    });

    if (createRewPunData) {
      try {
        let rpInfo = await models.reward_punishment.create({
          ...addCreateCommonField(ctx),
          ...createRewPunData
        });
        ctx.body = new SuccessModel(rpInfo);
      } catch (err) {
        ctx.body = new ErrorModel("创建奖惩失败," + err);
      }
    }
  }

  /**
   * 获取一个奖惩详情
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async detail(ctx) {
    const { id } = ctx.params;
    if (id) {
      try {
        // 查询奖惩详情模型
        let rp = await models.reward_punishment.findOne({
          where: { id },
        });
        if (rp) {
          ctx.body = new SuccessModel(rp);
        } else {
          ctx.body = new ErrorModel(`未查询到奖惩id为【${id}】的奖惩详情`);
        }
      } catch (err) {
        ctx.body = new ErrorModel("查询奖惩详情失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("奖惩id是必传参数");
    }
  }

  /**
   * 编辑奖惩
   * @param ctx
   * @returns {Promise<void>}
   */
  static async edit(ctx) {
    //接收客服端参数
    const { id, ...bodyData } = ctx.request.body;
    if (id) {
      const editRewPunData = await RewPunController.getCreateQueryParams(
        bodyData
      ).catch((err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      });

      if (editRewPunData) {
        try {
          await models.reward_punishment.update(editRewPunData, {
            where: { id },
          });

          ctx.body = new SuccessModel("更新成功");
        } catch (err) {
          ctx.body = new ErrorModel("更新奖惩失败，" + err);
        }
      }
    } else {
      ctx.body = new ErrorModel("奖惩id是必传参数");
    }
  }

  /**
   * 删除奖惩
   * @param ctx
   * @returns {Promise<void>}
   */
  static async del(ctx) {
    //接收客服端参数
    let { id } = ctx.request.body;
    if (id) {
      try {
        await models.reward_punishment.destroy({
          where: {
            id,
          },
        });
        ctx.body = new SuccessModel("删除奖惩成功");
      } catch (err) {
        ctx.body = new ErrorModel("删除奖惩失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("奖惩id是必传参数");
    }
  }
}

module.exports = RewPunController;
