/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-04 21:02:41
 * @LastEditTime: 2024-05-06 09:42:42
 * @Description: 任务表
 */
const models = require("../models");
const { SuccessModel, ErrorModel } = require("@exceptions/index");
const {
  isPositiveInteger,
  isDate,
  isValidatedName,
} = require("@lib/validate");
const { filterObjEmptyProperty } = require("@lib/common");
const { addCreateCommonField } = require("@middlewares/addCommonField");
const { PAGE_SIZE, CURRENT_PAGE } = require("@config");

class TaskController {
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
   * 任务列表
   * @param ctx
   * @returns {Promise<void>}
   */
  static async list(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;
    const queryData = await TaskController.getListQueryParams(bodyData).catch(
      (err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      }
    );

    console.log("queryData=====>", queryData);

    if (queryData) {
      try {
        const taskList = await models.task.findAll(queryData);
        ctx.body = new SuccessModel(taskList);
      } catch (err) {
        console.log("err=====>", err);
        ctx.body = new ErrorModel(err || "参数错误");
      }
    }
  }

  /**
   * @description: 创建任务参数筛选
   * @param {*} params
   * @return {*}
   */
  static getCreateQueryParams(params) {
    return new Promise(async (resolve, reject) => {
      const {
        taskName,
        taskStartTime,
        taskEndTime
      } = params;

      // 任务名校验
      const taskNameVal = isValidatedName(taskName);
      taskNameVal !== true && reject(taskNameVal);

      let findTask = await models.task.findOne({
        where: { taskName },
      });
      findTask && reject(`该任务名称${taskName}已被注册`);

      // 任务类型校验 , 需根据字典表校验
      

      // 任务开始执行时间
      const taskStartTimeVal = isDate(taskStartTime, "任务开始执行时间");
      taskStartTimeVal !== true && reject(taskStartTimeVal);

      // 任务结束执行时间
      const taskEndTimeVal = isDate(taskEndTime, "任务结束执行时间");
      taskEndTimeVal !== true && reject(taskEndTimeVal);

      resolve(params);
    });
  }

  /**
   * 创建一个任务
   * @param ctx
   * @returns {Promise<void>}
   */
  static async create(ctx) {
    //接收客服端参数
    const bodyData = ctx.request.body;

    const createTaskData = await TaskController.getCreateQueryParams(bodyData).catch(
      (err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      }
    );

    if (createTaskData) {
      try {
        let taskInfo = await models.task.create({
          ...addCreateCommonField(ctx),
          ...createTaskData
        });
        ctx.body = new SuccessModel(taskInfo);
      } catch (err) {
        ctx.body = new ErrorModel("创建任务失败," + err);
      }
    }
  }

  /**
   * 获取一个任务详情
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async detail(ctx) {
    const { id } = ctx.params;
    if (id) {
      try {
        // 查询任务详情模型
        let task = await models.task.findOne({
          where: { id },
        });
        if (task) {
          ctx.body = new SuccessModel(task);
        } else {
          ctx.body = new ErrorModel(`未查询到任务id为【${id}】的任务详情`);
        }
      } catch (err) {
        ctx.body = new ErrorModel("查询任务详情失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("任务id是必传参数");
    }
  }

  /**
   * 编辑任务
   * @param ctx
   * @returns {Promise<void>}
   */
  static async edit(ctx) {
    //接收客服端参数
    const { id, ...bodyData } = ctx.request.body;
    if (id) {
      const editTaskData = await TaskController.getCreateQueryParams(
        bodyData
      ).catch((err) => {
        ctx.body = new ErrorModel(err || "参数错误");
        return;
      });

      if (editTaskData) {
        try {
          await models.task.update(editTaskData, {
            where: { id },
          });

          ctx.body = new SuccessModel("更新成功");
        } catch (err) {
          ctx.body = new ErrorModel("更新任务失败，" + err);
        }
      }
    } else {
      ctx.body = new ErrorModel("任务id是必传参数");
    }
  }

  /**
   * 删除任务
   * @param ctx
   * @returns {Promise<void>}
   */
  static async del(ctx) {
    //接收客服端参数
    let { id } = ctx.request.body;
    if (id) {
      try {
        await models.task.destroy({
          where: {
            id,
          },
        });
        ctx.body = new SuccessModel("删除任务成功");
      } catch (err) {
        ctx.body = new ErrorModel("删除任务失败，" + err);
      }
    } else {
      ctx.body = new ErrorModel("任务id是必传参数");
    }
  }
}

module.exports = TaskController;
