/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-05 09:01:30
 * @LastEditTime: 2024-07-22 23:25:00
 * @Description: 字典表
 */
const models = require("../models");
const { Op } = require("sequelize");
const { SuccessModel, ErrorModel } = require("@exceptions/index");
const {
  isPositiveInteger,
  isNoEmpty,
  isValidatedName,
} = require("@lib/validate");
const { filterObjEmptyProperty, parseSeqSqlIds } = require("@lib/common");
const { addCreateCommonField } = require("@middlewares/addCommonField");
const { PAGE_SIZE, CURRENT_PAGE } = require("@config");

class DictionaryController {
  /**
   * @description: 获取list的查询参数
   * @param {*} params
   * @return {*}
   */
  static getListQueryParams(params) {
    return new Promise(async (resolve, reject) => {
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

      const describeObj = await models.info_dict.describe();
      const attributes = Object.keys(describeObj)
      const queryNoEmptyObj = filterObjEmptyProperty(queryParams, attributes);
      if (queryNoEmptyObj) {
        queryData.where = queryNoEmptyObj
      }

      resolve(queryData);
    });
  }

  /**
   * 字典列表
   * @param ctx
   * @returns {Promise<void>}
   */
  static async list(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;
    const queryData = await DictionaryController.getListQueryParams(bodyData).catch(
      (err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      }
    );

    console.log("queryData=====>", queryData);

    if (queryData) {
      try {
        const dictList = await models.info_dict.findAll(queryData);
        ctx.body = new SuccessModel(dictList);
      } catch (err) {
        console.log("err=====>", err);
        ctx.body = new ErrorModel(err || "参数错误");
      }
    }
  }

  /**
   * @description: 创建字典参数筛选
   * @param {*} params
   * @return {*}
   */
  static getCreateQueryParams(params) {
    return new Promise(async (resolve, reject) => {
      const {
        dicLabel,
        dicValue,
      } = params;

      // 字典名校验
      !dicLabel && reject('字典名称是必填项');

      console.log('params', params)

      if (!params?.id && !params?.dicBindId) {
        let findDictionary = await models.info_dict.findOne({
          where: {
            dicLabel,
            dicBindId: params?.dicBindId ? params.dicBindId : null
          },
        });
        console.log('findDictionary123123', findDictionary)
        findDictionary && reject(`该一级字典名称${dicLabel}已被注册`);
      }

      // 字典value
      const dicValueVal = isNoEmpty(dicValue, "字典value");
      dicValueVal !== true && reject(dicValueVal);

      resolve(params);
    });
  }

  /**
   * 创建一个字典
   * @param ctx
   * @returns {Promise<void>}
   */
  static async create(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;
    const jwtData = addCreateCommonField(ctx)

    const createDictionaryData = await DictionaryController.getCreateQueryParams({
      ...bodyData,
      ...jwtData
    }).catch(
      (err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      }
    );

    if (createDictionaryData) {
      try {
        let dictInfo = await models.info_dict.create(createDictionaryData);
        ctx.body = new SuccessModel(dictInfo);
      } catch (err) {
        ctx.body = new ErrorModel("创建字典失败," + err);
      }
    }
  }

  /**
   * 获取一个字典详情
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async detail(ctx) {
    const { id } = ctx.params;
    if (id) {
      try {
        // 查询字典详情模型
        let dict = await models.info_dict.findOne({
          where: { id },
        });
        if (dict) {
          ctx.body = new SuccessModel(dict);
        } else {
          ctx.body = new ErrorModel(`未查询到字典id为【${id}】的字典详情`);
        }
      } catch (err) {
        ctx.body = new ErrorModel("查询字典详情失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("字典id是必传参数");
    }
  }

  /**
   * 编辑字典
   * @param ctx
   * @returns {Promise<void>}
   */
  static async edit(ctx) {
    //接收客服端参数
    console.log('接收客服端参数')
    const bodyData = ctx.request.body;
    const id = bodyData?.id
    if (id) {
      const editDictionaryData = await DictionaryController.getCreateQueryParams(
        bodyData
      ).catch((err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      });

      if (editDictionaryData) {
        try {
          await models.info_dict.update(editDictionaryData, {
            where: { id },
          });

          ctx.body = new SuccessModel("更新成功");
        } catch (err) {
          ctx.body = new ErrorModel("更新字典失败，" + err);
        }
      }
    } else {
      ctx.body = new ErrorModel("字典id是必传参数");
    }
  }

  /**
   * 批量编辑字典状态, 将dicState字段设置为2
   * @param ctx
   * @returns {Promise<void>}
   */
  static async batchEditdDicState(ctx) {
    //接收客服端参数
    let { ids, dicState } = ctx.request.body;

    if (ids) {
      if ([0, 1].includes(dicState)) {
        try {
          const idArr = parseSeqSqlIds(ids);
          if (idArr?.length) {
            const [updateNum] = await models.info_dict.update(
              {
                dicState,
              },
              {
                where: {
                  [Op.or]: idArr,
                },
              }
            );
            console.log('updateNum=====>', updateNum)
            ctx.body = updateNum > 0 ? new SuccessModel(`编辑字典状态成功【${updateNum}】`) : new ErrorModel("编辑字典状态失败");
          } else {
            ctx.body = new ErrorModel("ids是必传参数");
          }
        } catch (err) {
          ctx.body = new ErrorModel("编辑字典状态失败，" + err);
        }
      } else {
        ctx.body = new ErrorModel("dicState参数不满足0-禁用;1-启用;");
      }
    } else {
      ctx.body = new ErrorModel("ids是必传参数");
    }
  }

  /**
   * 批量删除字典
   * @param ctx
   * @returns {Promise<void>}
   */
  static async batchDel(ctx) {
    //接收客服端参数
    let { ids } = ctx.request.body;
    if (ids) {
      try {
        const idArr = String(ids)?.split(',')
        if (idArr?.length) {
          const deleteNum = await models.info_dict.destroy(
            {
              where: {
                id: {
                  [Op.in]: idArr
                },
              },
            }
          );
          ctx.body = deleteNum > 0 ? new SuccessModel(`删除成功【${deleteNum}】`) : new ErrorModel("删除字典失败");
        } else {
          ctx.body = new ErrorModel("ids是必传参数");
        }
      } catch (err) {
        ctx.body = new ErrorModel("删除失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("ids是必传参数");
    }

  }

  /**
   * 删除字典
   * @param ctx
   * @returns {Promise<void>}
   */
  static async del(ctx) {
    //接收客服端参数
    let { id } = ctx.request.query;
    if (id) {
      try {
        await models.info_dict.destroy({
          where: {
            id,
          },
        });
        ctx.body = new SuccessModel("删除字典成功");
      } catch (err) {
        ctx.body = new ErrorModel("删除字典失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("字典id是必传参数");
    }
  }

  /**
   * 获取字典项列表
   * @param ctx
   * @returns {Promise<void>}
  */
  static async getMultiDictItemsByIds(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.query;
    const { ids } = bodyData

    if (ids) {
      const idArr = parseSeqSqlIds(ids, 'dicBindId');
      if (idArr.length) {
        const dictList = await models.info_dict.findAll({
          where: {
            [Op.or]: idArr,
            [Op.and]: {
              dicState: 1
            }
          }
        });
        ctx.body = new SuccessModel(dictList);
      } else {
        ctx.body = new ErrorModel("ids参数解析失败");
      }
    } else {
      ctx.body = new ErrorModel("参数ids是必传的");
    }
  }

  /**
   * 批量导入
   * @param ctx
   * @returns {Promise<void>}
   */
  static async bulkCreate(ctx) {
    //接收客服端参数
    try {
      let { list } = ctx.request.body;
      if (list?.length) {
        const jwtData = addCreateCommonField(ctx)
        const newList = list.map(ele => {
          return {
            ...ele,
            ...jwtData
          }
        })
        const res = await models.info_dict.bulkCreate(newList);
        console.log('res12312313', res)
        ctx.body = new SuccessModel("批量插入字典成功");
      } else {
        ctx.body = new ErrorModel("参数list,数组长度不能为空");
      }
    } catch (err) {
      ctx.body = new ErrorModel("批量插入字典失败，" + err);
    }
  }
}

module.exports = DictionaryController;
