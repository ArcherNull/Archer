/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-04 20:28:46
 * @LastEditTime: 2024-05-06 09:42:33
 * @Description: 计划表
 */
const models = require("../models");
const { SuccessModel, ErrorModel } = require("@exceptions/index");
const {
  isPositiveInteger,
  isNoEmpty,
  isDate,
  isValidatedName,
} = require("@lib/validate");
const { filterObjEmptyProperty } = require("@lib/common");
const { addCreateCommonField } = require("@middlewares/addCommonField");
const { PAGE_SIZE, CURRENT_PAGE } = require("@config");

class PlanController {
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
        queryData.where = queryNoEmptyObj;
      }

      resolve(queryData);
    });
  }

  /**
   * 计划列表
   * @param ctx
   * @returns {Promise<void>}
   */
  static async list(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;
    const queryData = await PlanController.getListQueryParams(bodyData).catch(
      (err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      }
    );

    if (queryData) {
      try {
        const planList = await models.plan.findAll(queryData);
        ctx.body = new SuccessModel(planList);
      } catch (err) {
        ctx.body = new ErrorModel(err || "参数错误");
      }
    }
  }

  /**
   * @description: 创建计划参数筛选
   * @param {*} params
   * @return {*}
   */
  static getCreateQueryParams(params) {
    return new Promise(async (resolve, reject) => {
      const { planName, planStartDoTime, planEndDoTime } =
        params;

      // 计划名校验
      const planNameVal = isValidatedName(planName);
      planNameVal !== true && reject(planNameVal);

      let findPlan = await models.plan.findOne({
        where: { planName },
      });
      findPlan && reject(`该计划名称${planName}已被注册`);

      // 计划类型校验 , 需根据字典表校验

      // 计划开始执行时间
      const planStartDoTimeVal = isDate(planStartDoTime, "计划开始执行时间");
      planStartDoTimeVal !== true && reject(planStartDoTimeVal);

      // 计划结束执行时间
      const planEndDoTimeVal = isDate(planEndDoTime, "计划结束执行时间");
      planEndDoTimeVal !== true && reject(planEndDoTimeVal);

      resolve(params);
    });
  }

  /**
   * 创建一个计划
   * @param ctx
   * @returns {Promise<void>}
   */
  static async create(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;

    const createPlanData = await PlanController.getCreateQueryParams(
      bodyData
    ).catch((err) => {
      ctx.body = new ErrorModel(err || "参数错误");
      return;
    });

    if (createPlanData) {
      try {
        let planInfo = await models.plan.create({
          ...addCreateCommonField(ctx),
          ...createPlanData,
        });
        ctx.body = new SuccessModel(planInfo);
      } catch (err) {
        ctx.body = new ErrorModel("创建计划失败," + err);
      }
    }
  }

  /**
   * 获取一个计划详情
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async detail(ctx) {
    const { id } = ctx.params;
    if (id) {
      try {
        // 查询计划详情模型
        let plan = await models.plan.findOne({
          where: { id },
        });
        if (plan) {
          ctx.body = new SuccessModel(plan);
        } else {
          ctx.body = new ErrorModel(`未查询到计划id为【${id}】的计划详情`);
        }
      } catch (err) {
        ctx.body = new ErrorModel("查询计划详情失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("计划id是必传参数");
    }
  }

  /**
   * 编辑计划
   * @param ctx
   * @returns {Promise<void>}
   */
  static async edit(ctx) {
    //接收客服端参数
    const { id, ...bodyData } = ctx.request.body;
    if (id) {
      const editPlanData = await PlanController.getCreateQueryParams(
        bodyData
      ).catch((err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      });

      if (editPlanData) {
        try {
          await models.plan.update(editPlanData, {
            where: { id },
          });

          ctx.body = new SuccessModel("更新成功");
        } catch (err) {
          ctx.body = new ErrorModel("更新计划失败，" + err);
        }
      }
    } else {
      ctx.body = new ErrorModel("计划id是必传参数");
    }
  }

  /**
   * 删除计划
   * @param ctx
   * @returns {Promise<void>}
   */
  static async del(ctx) {
    //接收客服端参数
    let { id } = ctx.request.body;
    if (id) {
      try {
        await models.plan.destroy({
          where: {
            id,
          },
        });
        ctx.body = new SuccessModel("删除计划成功");
      } catch (err) {
        ctx.body = new ErrorModel("删除计划失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("计划id是必传参数");
    }
  }
}

module.exports = PlanController;
