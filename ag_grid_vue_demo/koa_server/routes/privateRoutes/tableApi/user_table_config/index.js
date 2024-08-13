/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-05 16:21:22
 * @LastEditTime: 2024-05-05 09:13:35
 * @Description:  笔记表
 */

const { generateModulePrefix } = require("@lib/common");
const UserTableConfigController = require("@db/controllers/user_table_config");
const getUrl = (url) => generateModulePrefix(url, "/userTableConfig");

module.exports = (router) => {
  // 用户配置表列表,带搜索
  router.post(getUrl("/list"), UserTableConfigController.list);
  // 创建用户配置表
  router.post(getUrl("/create"), UserTableConfigController.create);
  // 编辑用户配置表详情
  router.post(getUrl("/edit"), UserTableConfigController.edit);
  // 删除用户配置表
  router.get(getUrl("/del"), UserTableConfigController.del);
  // 查看用户配置表详情, 这个动态id只能放置于最后
  router.get(getUrl("/:id"), UserTableConfigController.detail);
};