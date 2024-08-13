/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-02 08:46:11
 * @LastEditTime: 2024-05-29 10:51:16
 * @Description: 订单表
 */
const { generateModulePrefix } = require("@lib/common");
const OrderController = require("@db/controllers/order");
const getUrl = (url) => generateModulePrefix(url, "/order");

module.exports = (router) => {
  /**
   * @swagger
   * /api/order/list:
   *   post:
   *     description: 订单列表,带搜索
   *     summary: "订单列表"
   *     tags: [订单模块]
   *     parameters:
   *       - name: pageSize
   *         description: 页数
   *         required: false
   *         in: query
   *         type: number
   *       - name: pageNum
   *         description: 当前页
   *         required: false
   *         in: query
   *         type: number
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/list"), OrderController.list);

  /**
   * @swagger
   * /api/order/batchDel:
   *   post:
   *     description: 批量物理删除订单
   *     summary: "批量物理删除订单"
   *     tags: [订单模块]
   *     parameters:
   *       - name: ids
   *         description: 订单id , 逗号分隔
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/batchDel"), OrderController.batchDel);
};
