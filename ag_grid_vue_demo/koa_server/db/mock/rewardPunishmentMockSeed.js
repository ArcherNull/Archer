/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-30 09:59:13
 * @LastEditTime: 2023-06-30 11:35:12
 * @Description: 奖惩数据
 */

const Mock = require("mockjs");

// 奖惩表假数据
exports.rewardPunishmentMockSeed = () => {
  return Mock.mock({
    "data|10-25": [
      {
        rpName: "@cname",
        "rpState|1": [0, 1, 2, 3, 4],
        "rpType|1": ["奖励", "惩罚"],
        "rpTag|1": ["标签1", "标签2"],
        rpRemark: "@cparagraph(1)",
        'bindTaskId|+1': 362,
        'bindPlanId|+1': 35,
        createBy: '@name',
        'createById|+1': 25,
        createdAt: "@datetime('y-MM-dd HH:mm:ss')",
        updatedAt: "@datetime('y-MM-dd HH:mm:ss')",
      },
    ],
  });
};
