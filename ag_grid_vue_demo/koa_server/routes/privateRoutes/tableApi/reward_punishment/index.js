/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-05 16:22:06
 * @LastEditTime: 2024-05-06 09:46:30
 * @Description: 奖惩表
 */

const { generateModulePrefix } = require("@lib/common");
const RewPunController = require("@db/controllers/reward_punishment");
const getUrl = (url) => generateModulePrefix(url, "/rewPun");

module.exports = (router) => {
  // 计划列表,带搜索
  router.post(getUrl("/list"), RewPunController.list);
  // 创建计划
  router.post(getUrl("/create"), RewPunController.create);
  // 编辑计划详情
  router.post(getUrl("/edit"), RewPunController.edit);
  // 删除计划
  router.post(getUrl("/del"), RewPunController.del);
  // 查看计划详情, 这个动态id只能放置于最后
  router.get(getUrl("/:id"), RewPunController.detail);
};