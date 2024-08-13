/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-30 10:03:22
 * @LastEditTime: 2023-06-30 11:34:27
 * @Description: 评论表
 */

const Mock = require("mockjs");

// 奖惩表假数据
exports.commentMockSeed = () => {
  return Mock.mock({
    "data|10-25": [
      {
        cName: "@name",
        "cState|1": [0, 1, 2],
        "cType|1": ["赞同", "反对"],
        cContent: "@paragraph(1)",
        cImgs: "@url",
        "cLikeCount|1-200": 200,
        "cIsLike|1": [0, 1],
        'bindPlanId|+1': 100,
        'bindTaskId|+1': 1,
        'bindNoteId|+1': 21,
        createBy: "@name",
        'createById|+1': 25,
        createdAt: "@datetime('y-MM-dd HH:mm:ss')",
        updatedAt: "@datetime('y-MM-dd HH:mm:ss')",
      },
    ],
  });
};
