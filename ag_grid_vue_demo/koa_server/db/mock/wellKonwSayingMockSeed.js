/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-30 10:03:22
 * @LastEditTime: 2023-06-30 11:36:03
 * @Description: 名言表
 */

const Mock = require("mockjs");

// 奖惩表假数据
exports.wellKonwSayingMockSeed = () => {
  return Mock.mock({
    "data|10-25": [
      {
        wksTitle: "@ctitle",
        "wksState|1": [0, 1, 2],
        "wksType|1": ["国内", "国外"],
        "wksTag|1": ["励志", "智慧", "感悟"],
        wksCNContent: "@cparagraph(1)",
        wksENContent: "@paragraph(1)",
        wksAuthor: "@name",
        wksRemark: "@paragraph(1)",
        "wksLikeCount|1-100": 100,
        'wksIsLike|+1': 10,
        createBy: "@name",
        'createById|+1': 25,
        createdAt: "@datetime('y-MM-dd HH:mm:ss')",
        updatedAt: "@datetime('y-MM-dd HH:mm:ss')",
      },
    ],
  });
};
