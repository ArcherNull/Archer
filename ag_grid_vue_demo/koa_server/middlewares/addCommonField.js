/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-10-06 16:15:52
 * @LastEditTime: 2024-07-22 19:42:13
 * @Description: 添加公共字段
 */

/**
 * @description: 添加新增公共字符
 * @param {*} ctx
 * @return {*}
 */
exports.addCreateCommonField = function (ctx) {
  const jwtData = ctx.jwtData;
  return {
    createBy: jwtData.userName,
    createById: jwtData.id,
  };
};

/**
 * @description: 添加新增公共字符
 * @param {*} ctx
 * @return {*}
 */
exports.addUpdateCommonField = function (ctx) {
  const jwtData = ctx.jwtData;
  return {
    updateBy: jwtData.userName,
    updateById: jwtData.id,
  };
};
