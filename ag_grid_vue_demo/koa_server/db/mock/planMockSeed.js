/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-30 09:40:57
 * @LastEditTime: 2023-06-30 11:33:08
 * @Description: 计划表
 */

const Mock = require("mockjs");

// 计划表假数据
exports.planMockSeed = () => {
  return Mock.mock({
    "data|10-25": [
      {
        planName: '@ctitle',
        "planState|1": [0, 1, 2],
        'planType|1': ['日计划','周计划','月计划','季度计划','年计划'], 
        'planTag|1': ['生活','学习','健康'],
        planStartDoTime: "@datetime('y-MM-dd HH:mm:ss')",
        planEndDoTime: "@datetime('y-MM-dd HH:mm:ss')",
        planStartRealDoTime: "@datetime('y-MM-dd HH:mm:ss')",
        planEndRealDoTime: "@datetime('y-MM-dd HH:mm:ss')",
        planRemark: '@cparagraph(1)',
        "planParentId|+1": 20,
        createBy: '@name',
        'createById|+1': 25,
        createdAt: "@datetime('y-MM-dd HH:mm:ss')",
        updatedAt: "@datetime('y-MM-dd HH:mm:ss')"
      },
    ],
  });
};
