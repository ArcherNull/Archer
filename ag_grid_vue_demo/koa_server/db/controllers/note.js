/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-05 09:30:51
 * @LastEditTime: 2024-05-06 09:42:24
 * @Description: 笔记表
 */
const models = require("../models");
const { SuccessModel, ErrorModel } = require("@exceptions/index");
const {
  isPositiveInteger,
  isNoEmpty,
} = require("@lib/validate");
const { filterObjEmptyProperty } = require("@lib/common");
const { addCreateCommonField } = require("@middlewares/addCommonField");

const { PAGE_SIZE, CURRENT_PAGE } = require("@config");

class NoteController {
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
   * 笔记列表
   * @param ctx
   * @returns {Promise<void>}
   */
  static async list(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;
    const queryData = await NoteController.getListQueryParams(bodyData).catch(
      (err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      }
    );

    if (queryData) {
      try {
        const taskList = await models.note.findAll(queryData);
        ctx.body = new SuccessModel(taskList);
      } catch (err) {
        console.log("err=====>", err);
        ctx.body = new ErrorModel(err || "参数错误");
      }
    }
  }

  /**
   * @description: 创建笔记参数筛选
   * @param {*} params
   * @return {*}
   */
  static getCreateQueryParams(params) {
    return new Promise(async (resolve, reject) => {
      const { noteTitle, noteContent } = params;

      // 笔记名校验
      const noteTitleVal = isNoEmpty(noteTitle, "笔记名称");
      noteTitleVal !== true && reject(noteTitleVal);

      // 笔记内容
      const noteContentVal = isNoEmpty(noteContent, "笔记内容");
      noteContentVal !== true && reject(noteContentVal);

      let findNote = await models.note.findOne({
        where: { noteTitle },
      });
      findNote && reject(`该笔记名称${noteTitle}已被注册`);

      resolve(params);
    });
  }

  /**
   * 创建一个笔记
   * @param ctx
   * @returns {Promise<void>}
   */
  static async create(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;

    const createNoteData = await NoteController.getCreateQueryParams(
      bodyData
    ).catch((err) => {
      ctx.body = new ErrorModel(err || "参数错误");
      return;
    });

    if (createNoteData) {
      try {
        let taskInfo = await models.note.create({
          ...addCreateCommonField(ctx),
          ...createNoteData,
        });
        ctx.body = new SuccessModel(taskInfo);
      } catch (err) {
        ctx.body = new ErrorModel("创建笔记失败," + err);
      }
    }
  }

  /**
   * 获取一个笔记详情
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async detail(ctx) {
    const { id } = ctx.params;
    if (id) {
      try {
        // 查询笔记详情模型
        let task = await models.note.findOne({
          where: { id },
        });
        if (task) {
          ctx.body = new SuccessModel(task);
        } else {
          ctx.body = new ErrorModel(`未查询到笔记id为【${id}】的笔记详情`);
        }
      } catch (err) {
        ctx.body = new ErrorModel("查询笔记详情失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("笔记id是必传参数");
    }
  }

  /**
   * 编辑笔记
   * @param ctx
   * @returns {Promise<void>}
   */
  static async edit(ctx) {
    //接收客服端参数
    const { id, ...bodyData } = ctx.request.query;
    if (id) {
      const editNoteData = await NoteController.getCreateQueryParams(
        bodyData
      ).catch((err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      });

      if (editNoteData) {
        try {
          await models.note.update(editNoteData, {
            where: { id },
          });

          ctx.body = new SuccessModel("更新成功");
        } catch (err) {
          ctx.body = new ErrorModel("更新笔记失败，" + err);
        }
      }
    } else {
      ctx.body = new ErrorModel("笔记id是必传参数");
    }
  }

  /**
   * 删除笔记
   * @param ctx
   * @returns {Promise<void>}
   */
  static async del(ctx) {
    //接收客服端参数
    let { id } = ctx.request.query;
    if (id) {
      try {
        await models.note.destroy({
          where: {
            id,
          },
        });
        ctx.body = new SuccessModel("删除笔记成功");
      } catch (err) {
        ctx.body = new ErrorModel("删除笔记失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("笔记id是必传参数");
    }
  }
}

module.exports = NoteController;
