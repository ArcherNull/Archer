/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-27 16:33:12
 * @LastEditTime: 2023-08-02 10:30:17
 * @Description:
 */
const { generateModulePrefix } = require("../../../../lib/common");
const {
  clearErrorLog,
  emailRemind,
  findAllIntervalTask,
  deleteAllIntervalTask,
  clearVerifyCode
} = require("./scheduleList/index.js");
const getUrl = (url) => generateModulePrefix(url, "/intervalTask");

module.exports = (router) => {
  /**
   * @swagger
   * /intervalTask/list:
   *   post:
   *     description: 定时任务列表
   *     summary: "定时任务"
   *     tags: [定时任务]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/list"), findAllIntervalTask);

  /**
   * @swagger
   * /intervalTask/emailRemind:
   *   post:
   *     description: 邮件提醒定时任务
   *     summary: "定时任务"
   *     tags: [定时任务]
   *     parameters:
   *       - name: email
   *         description: 收件者邮箱
   *         required: true
   *         in: query
   *         type: string
   *       - name: content
   *         description: 邮箱提醒内容
   *         required: true
   *         in: query
   *         type: string
   *       - name: userId
   *         description: 发送者用户id
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/emailRemind"), emailRemind);

  /**
   * @swagger
   * /intervalTask/clearErrorLog:
   *   post:
   *     description: 清理日志定时任务
   *     summary: "定时任务"
   *     tags: [定时任务]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/clearErrorLog"), clearErrorLog);

  /**
   * @swagger
   * /intervalTask/deleteAllIntervalTask:
   *   post:
   *     description: 清空所有定时任务
   *     summary: "定时任务"
   *     tags: [定时任务]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/deleteAllIntervalTask"), deleteAllIntervalTask);

  /**
   * @swagger
   * /intervalTask/clearVerifyCode:
   *   post:
   *     description: 清除过期的信息码定时任务
   *     summary: "定时任务"
   *     tags: [定时任务]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/clearVerifyCode"), clearVerifyCode);
};
