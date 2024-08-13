/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-30 09:40:57
 * @LastEditTime: 2023-06-30 11:35:37
 * @Description: 任务表
 */

const Mock = require("mockjs");

// 计划表假数据
exports.taskMockSeed = () => {
  return Mock.mock({
    "data|10-25": [
      {
        taskName: "@ctitle",
        "taskState|1": [0, 1, 2, 3, 4],
        "taskType|1": ["紧急", "重要", "主要", "普通"],
        "taskTag|1": ["生活", "学习", "健康"],
        taskStartTime: "@datetime('y-MM-dd HH:mm:ss')",
        taskEndTime: "@datetime('y-MM-dd HH:mm:ss')",
        taskStartRealDoTime: "@datetime('y-MM-dd HH:mm:ss')",
        taskEndRealDoTime: "@datetime('y-MM-dd HH:mm:ss')",
        taskRemark: "@cparagraph(1)",
        'bindPlanId|+1': 862,
        createBy: "@name",
        'createById|+1': 25,
        createdAt: "@datetime('y-MM-dd HH:mm:ss')",
        updatedAt: "@datetime('y-MM-dd HH:mm:ss')",
      },
    ],
  });
};
