/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-05 08:54:18
 * @LastEditTime: 2024-06-12 09:36:44
 * @Description: 名言表
 */
const models = require("../models");
const { SuccessModel, ErrorModel } = require("@exceptions/index");
const { isPositiveInteger } = require("@lib/validate");
const { filterObjEmptyProperty } = require("@lib/common");
const { addCreateCommonField } = require("@middlewares/addCommonField");
const { PAGE_SIZE, CURRENT_PAGE } = require("@config");

class WksController {
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
   * 奖惩列表
   * @param ctx
   * @returns {Promise<void>}
   */
  static async list(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;
    const queryData = await WksController.getListQueryParams(bodyData).catch(
      (err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      }
    );

    console.log("queryData=====>", queryData);

    if (queryData) {
      try {
        const wksList = await models.well_konwn_saying.findAll(queryData);
        ctx.body = new SuccessModel(wksList);
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
      const { wksCNContent, wksENContent } = params;

      !wksCNContent &&
        !wksENContent &&
        reject("名言中文内容或名言英文内容，其中一个不能为空");

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
    const createWksData = await WksController.getCreateQueryParams(
      bodyData
    ).catch((err) => {
      ctx.body = new ErrorModel(err || "参数错误");
      return;
    });

    if (createWksData) {
      try {
        let wksInfo = await models.well_konwn_saying.create({
          ...addCreateCommonField(ctx),
          ...createWksData,
        });
        ctx.body = new SuccessModel(wksInfo);
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
        let wks = await models.well_konwn_saying.findOne({
          where: { id },
        });
        if (wks) {
          ctx.body = new SuccessModel(wks);
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
      const editWksData = await WksController.getCreateQueryParams(
        bodyData
      ).catch((err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      });

      if (editWksData) {
        try {
          await models.well_konwn_saying.update(editWksData, {
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
        await models.well_konwn_saying.destroy({
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

module.exports = WksController;
