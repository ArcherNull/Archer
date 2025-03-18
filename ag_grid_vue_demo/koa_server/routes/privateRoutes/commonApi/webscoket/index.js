/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-08-01 15:46:32
 * @LastEditTime: 2023-08-01 16:25:13
 * @Description: https链接ws
 */
const { generateModulePrefix } = require("../../../../lib/common");
const {
  wslist,
  wsConnect,
} = require("./ws/index.js");
const getUrl = (url) => generateModulePrefix(url, "/ws");

module.exports = (router) => {

  /**
   * @swagger
   * /admin/list:
   *   post:
   *     description: 定时任务列表
   *     summary: "定时任务"
   *     tags: [用户模块]
   *     parameters:
   *       - name: userName
   *         description: 账号
   *         required: false
   *         in: query
   *         type: string
   *       - name: phoneNumber
   *         description: 手机号
   *         required: false
   *         in: query
   *         type: string
   *       - name: email
   *         description: 邮箱
   *         required: false
   *         in: query
   *         type: string
   *       - name: verifyCode
   *         description: 验证码
   *         required: false
   *         in: query
   *         type: string
   *       - name: password
   *       - name: password
   *         description: 密码
   *         in: query
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/list"), wslist);
  // 发起连接 webscoket
  router.post(getUrl("/connect"), wsConnect);
};
