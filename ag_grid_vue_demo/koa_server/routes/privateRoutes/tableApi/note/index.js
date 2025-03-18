/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-05 16:21:22
 * @LastEditTime: 2024-05-06 09:46:22
 * @Description:  笔记表
 */

const { generateModulePrefix } = require("@lib/common");
const NoteController = require("@db/controllers/note");
const getUrl = (url) => generateModulePrefix(url, "/note");

module.exports = (router) => {
  // 计划列表,带搜索
  router.post(getUrl("/list"), NoteController.list);
  // 创建计划
  router.post(getUrl("/create"), NoteController.create);
  // 编辑计划详情
  router.get(getUrl("/edit"), NoteController.edit);
  // 删除计划
  router.get(getUrl("/del"), NoteController.del);
  // 查看计划详情, 这个动态id只能放置于最后
  router.get(getUrl("/:id"), NoteController.detail);
};