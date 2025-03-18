/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-04 21:07:37
 * @LastEditTime: 2024-07-08 14:30:17
 * @Description: 表api入口文件
 */

const user = require("./user/index");
const plan = require("./plan/index");
const task = require("./task/index");
const dictionary = require("./dictionary/index");
const note = require("./note/index");
const reward_punishment = require("./reward_punishment/index");
const well_konwn_saying = require("./well_konwn_saying/index");
const user_table_config = require("./user_table_config/index");
const order = require("./order/index");
const electronic_fence = require("./electronic_fence/index");

module.exports = (router) => {
  // 注册用户模块
  user(router);

  // 注册计划模块
  plan(router);

  // 注册任务模块
  task(router);

  // 注册字典模块
  dictionary(router);

  // 注册笔记模块
  note(router);

  // 注册奖惩模块
  reward_punishment(router);

  // 注册名言模块
  well_konwn_saying(router);

  // 注册表格配置模块
  user_table_config(router);

  // 订单数据模块
  order(router);

  // 电子围栏数据模块
  electronic_fence(router);
};
