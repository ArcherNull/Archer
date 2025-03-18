/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-24 15:25:38
 * @LastEditTime: 2024-06-11 10:13:17
 * @Description:
 */
const { Op } = require("sequelize");
const models = require("../models");
const {
  SuccessModel,
  ErrorModel,
  SuccessPageModel,
} = require("@exceptions/index");
const { PAGE_SIZE, CURRENT_PAGE } = require("@config");
const { isPositiveInteger } = require("@lib/validate");
const { filterObjEmptyProperty, parseSeqSqlIds } = require("@lib/common");

class OrderController {
  /**
   * @description: 获取list的查询参数 , DESC , ASC
   * @param {*} params
   * @return {*}
   */
  static getListQueryParams(params) {
    return new Promise((resolve, reject) => {
      let queryData = {
        order: [["id", "asc"]],
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

      // 默认取用户orderState不为2的数据
      queryData.where = {
        orderState: {
          [Op.ne]: "已作废",
        },
      };

      const queryNoEmptyObj = filterObjEmptyProperty(queryParams);
      if (queryNoEmptyObj) {
        queryData.where = queryNoEmptyObj;
      }

      resolve(queryData);
    });
  }

  /**
   * 订单列表
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

    const queryData = await OrderController.getListQueryParams({
      queryParams,
      pageSize,
      pageNum,
    }).catch((err) => {
      ctx.body = new ErrorModel(err || "参数错误");
      return;
    });

    if (queryData) {
      console.log("queryData12313", queryData);
      try {
        const { count, rows } = await models.order.findAndCountAll(queryData);
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
   * 获取一个订单详情
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async detail(ctx) {
    const { id } = ctx.params;
    await UserController.getOrderDetail(ctx, id);
  }

  /**
   * @description: 通过id查询订单详情
   * @param {*} ctx
   * @param {*} id
   * @return {*}
   */
  static async getOrderDetail(ctx, id) {
    try {
      if (id) {
        if (isPositiveInteger(id) === true) {
          try {
            // 查询订单详情模型
            let order = await models.order.findOne({
              where: { id },
            });

            if (order) {
              ctx.body = new SuccessModel(order);
            } else {
              ctx.body = new ErrorModel(`未查询到订单id为【${id}】的订单详情`);
            }
          } catch (err) {
            ctx.body = new ErrorModel("查询订单详情失败，" + err);
          }
        } else {
          ctx.body = new ErrorModel(
            `订单id参数错误,id应为正整数，目前为【${id}】`
          );
        }
      } else {
        ctx.body = new ErrorModel("订单id是必传参数");
      }
    } catch (err) {
      ctx.body = new ErrorModel("查询订单详情失败，" + err);
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
          await models.order.update(
            {
              orderState: "已作废",
            },
            {
              where: {
                [Op.or]: idArr,
              },
            }
          );
          ctx.body = new SuccessModel("删除订单成功");
        } else {
          ctx.body = new ErrorModel("ids是必传参数");
        }
      } catch (err) {
        ctx.body = new ErrorModel("删除订单失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("ids是必传参数");
    }
  }
}

module.exports = OrderController;
