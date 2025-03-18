/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-12 14:03:44
 * @LastEditTime: 2024-05-06 09:43:17
 * @Description: 信息码
 */
const { isEmpty, isObject } = require("lodash");
const models = require("../models");
const { SuccessModel, ErrorModel } = require("@exceptions/index");
const { isPositiveInteger, isNoEmpty } = require("@lib/validate");
const {
  isVerifyCode,
} = require("@lib/validate");

const { IC_ClASSIFY_LIST, IC_TYPE_LIST } = require("@lib/constants");
const { addCreateCommonField } = require("@middlewares/addCommonField");
const { PAGE_SIZE, CURRENT_PAGE } = require("@config");

class InfoCodeController {
  /**
   * @description: 获取list的查询参数
   * @param {*} params
   * @return {*}
   */
  static getListQueryParams(ctx) {
    const params = ctx.request.body;
    let queryData = {};
    let {
      queryParams,
      pageSize = PAGE_SIZE,
      pageNum = CURRENT_PAGE,
    } = params;

    if (isPositiveInteger(pageSize)) {
      queryData.limit = pageSize;
    } else {
      ctx.body = new ErrorModel("pageSize需为正整数");
    }

    if (isPositiveInteger(pageNum)) {
      queryData.offset = (pageNum - 1) * pageSize;
    } else {
      ctx.body = new ErrorModel("pageNum需为正整数");
    }

    if (queryParams) {
      if (isObject(queryParams) && !isEmpty(queryParams)) {
        const { icClassify, icState, icType } = queryParams;
        queryData.where = {
          icClassify,
          icState,
          icType,
        };
      } else {
        ctx.body = new ErrorModel("queryParam为非必传条件，不要传入空对");
      }
    }

    return Promise.resolve(queryData);
  }

  /**
   * 信息码列表
   * @param ctx
   * @returns {Promise<void>}
   */
  static async list(ctx) {
    //接收客服端参数
    const queryData = await InfoCodeController.getListQueryParams(ctx);

    if (queryData) {
      try {
        const icList = await models.info_code.findAll(queryData);
        ctx.body = new SuccessModel(icList);
      } catch (err) {
        console.log("err=====>", err);
        ctx.body = new ErrorModel(err || "参数错误");
      }
    }
  }

  /**
   * @description: 创建信息码参数筛选
   * @param {*} params
   * @return {*}
   */
  static getCreateQueryParams(params) {
    return new Promise(async (resolve, reject) => {
      const { icClassify, icContent } = params;

      // 信息码分类校验
      const icClassifyVal = isNoEmpty(icClassify, "信息码分类");
      icClassifyVal !== true && reject(icClassifyVal);

      // 信息码内容校验
      const icContentVal = isNoEmpty(icContent, "信息码内容");
      icContentVal !== true && reject(icContentVal);

      let findInfoCode = await models.info_code.findOne({
        where: { icContent },
      });
      findInfoCode && reject(`该信息码内容【${icContent}】已被注册`);

      resolve(params);
    });
  }

  /**
   * 创建一个信息码
   * @param ctx
   *
   * icClassify信息码分类 preLogin-预登录校验，isLogin-正登录中，resetPwd-重置密码
   * icType 信息码类型 qrCode-二维码 ； email - 邮箱 ； phoneNumber - 手机号 ；token-正在登录的token记录
   * icContent 信息码内容
   * icExpiresTime 信息码失效时间
   * icReValJson 信息码再次校验JSON参数
   *
   * @returns {Promise<void>}
   */
  static async create(ctx) {
    //接收客服端参数
    const { icClassify, icType, icContent, icExpiresTime, icReValJson } =
      ctx.request.body;
    try {
      const icClassifyKeys = Object.keys(IC_ClASSIFY_LIST)
      if (!icClassifyKeys.includes(icClassify)) {
        ctx.body = new ErrorModel(`参数icClassify不满足【${icClassifyKeys.join('/')}】其中之一`);
        return;
      } 

      const icTypeKeys = Object.keys(IC_TYPE_LIST)
      if (!icTypeKeys.includes(icType)) {
        ctx.body = new ErrorModel(`参数icType不满足【${icTypeKeys.join('/')}】其中之一`);
        return;
      } 

      const isVerifyCodeVal = isVerifyCode(icContent)
      if (isVerifyCodeVal !== true) {
        ctx.body = new ErrorModel(isVerifyCodeVal || `参数icContent出错`);
        return;
      } 

      const icExpiresTimeVal = isVerifyCode(icExpiresTime)
      if (icExpiresTimeVal !== true) {
        ctx.body = new ErrorModel(icExpiresTimeVal || `参数icExpiresTime出错`);
        return;
      } 

      let infoCodeInfo = await models.info_code.create({
        icClassify,
        icType,
        icContent,
        icExpiresTime,
        icReValJson,
      });
      ctx.body = new SuccessModel({
        ...addCreateCommonField(ctx),
        ...infoCodeInfo
      });
    } catch (err) {
      ctx.body = new ErrorModel("创建信息码失败," + err);
    }
  }

  /**
   * 获取一个信息码详情
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async detail(ctx) {
    const { id } = ctx.params;
    if (id) {
      try {
        // 查询信息码详情模型
        let task = await models.info_code.findOne({
          where: { id },
        });
        if (task) {
          ctx.body = new SuccessModel(task);
        } else {
          ctx.body = new ErrorModel(`未查询到信息码id为【${id}】的信息码详情`);
        }
      } catch (err) {
        ctx.body = new ErrorModel("查询信息码详情失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("信息码id是必传参数");
    }
  }

  /**
   * 编辑信息码
   * @param ctx
   * @returns {Promise<void>}
   */
  static async edit(ctx) {
    //接收客服端参数
    const { id, ...bodyData } = ctx.request.query;
    if (id) {
      const editInfoCodeData = await InfoCodeController.getCreateQueryParams(
        bodyData
      ).catch((err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      });

      if (editInfoCodeData) {
        try {
          await models.info_code.update(editInfoCodeData, {
            where: { id },
          });

          ctx.body = new SuccessModel("更新成功");
        } catch (err) {
          ctx.body = new ErrorModel("更新信息码失败，" + err);
        }
      }
    } else {
      ctx.body = new ErrorModel("信息码id是必传参数");
    }
  }

  /**
   * 删除信息码
   * @param ctx
   * @returns {Promise<void>}
   */
  static async del(ctx) {
    //接收客服端参数
    let { id } = ctx.request.query;
    if (id) {
      try {
        await models.info_code.destroy({
          where: {
            id,
          },
        });
        ctx.body = new SuccessModel("删除信息码成功");
      } catch (err) {
        ctx.body = new ErrorModel("删除信息码失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("信息码id是必传参数");
    }
  }
}

module.exports = InfoCodeController;
