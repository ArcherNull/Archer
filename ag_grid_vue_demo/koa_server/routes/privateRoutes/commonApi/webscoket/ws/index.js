/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-08-01 15:50:10
 * @LastEditTime: 2023-08-01 17:11:11
 * @Description: ws的http接口
 */
const { SuccessModel, ErrorModel } = require("../../../../../exceptions/index");

/**
 * @description: ws 连接列表
 * @param {*} ctx
 * @return {*}
 */
exports.wslist = (ctx) => {
  ctx.body = new SuccessModel("聊天室连接列表");
};

/**
 * @description: ws连接
 * @param {*} ctx
 * @return {*}
 */
exports.wsConnect = (ctx) => {
  const bodyData = ctx.request.body;
  const { userId } = bodyData;

  ctx.body = new SuccessModel("清理错误日志定时任务已经开启");
};
