/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-30 10:03:22
 * @LastEditTime: 2023-06-30 11:34:22
 * @Description: 评论表
 */

const Mock = require("mockjs");

// 奖惩表假数据
exports.noteMockSeed = () => {
  return Mock.mock({
    "data|10-25": [
      {
        noteTitle: "@ctitle",
        "noteState|1": [0, 1, 2],
        "noteType|1": ["健康", "科学", "IT"],
        "noteTag|1": ["标签1", "标签2"],
        noteContent: "cparagraph(1)",
        noteImgs: "@url",
        "nLikeCount|1-200": 200,
        "nIsLike|1": [0, 1],
        "nCollectCount|1-100": 100,
        "nIsCollect|1": [0, 1],
        createBy: "@name",
        'createById|+1': 25,
        createdAt: "@datetime('y-MM-dd HH:mm:ss')",
        updatedAt: "@datetime('y-MM-dd HH:mm:ss')",
      },
    ],
  });
};
