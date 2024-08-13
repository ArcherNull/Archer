/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-04 21:07:37
 * @LastEditTime: 2024-05-06 09:46:26
 * @Description: 计划表
 */
const { generateModulePrefix } = require("@lib/common");
const PlanController = require("@db/controllers/plan");
const getUrl = (url) => generateModulePrefix(url, "/plan");

module.exports = (router) => {
  /**
   * @swagger
   * /api/plan/list:
   *   post:
   *     description: 计划列表,带搜索
   *     summary: "计划列表"
   *     tags: [计划模块]
   *     parameters:
   *       - name: queryParams
   *         description: 搜索字段
   *         required: false
   *         in: query
   *         type: object
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
  router.post(getUrl("/list"), PlanController.list);

  /**
   * @swagger
   * /api/plan/create:
   *   post:
   *     description: 创建计划
   *     summary: "创建计划"
   *     tags: [计划模块]
   *     parameters:
   *       - name: planName
   *         description: 计划名称
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: planStartDoTime
   *         description: 计划开始时间
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: planEndDoTime
   *         description: 计划结束时间
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: createBy
   *         description: 创建人名称
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: createById
   *         description: 创建人id
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: planState
   *         description: 计划状态
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: planType
   *         description: 计划类型
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: planTag
   *         description: 计划标签
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/create"), PlanController.create);
  
  /**
   * @swagger
   * /api/plan/create:
   *   post:
   *     description: 编辑计划详情
   *     summary: "编辑计划详情"
   *     tags: [计划模块]
   *     parameters:
   *       - name: id
   *         description: 计划id
   *         required: true
   *         in: query
   *         type: number
   *
   *       - name: planName
   *         description: 计划名称
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: planStartDoTime
   *         description: 计划开始时间
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: planEndDoTime
   *         description: 计划结束时间
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: createBy
   *         description: 创建人名称
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: createById
   *         description: 创建人id
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: planState
   *         description: 计划状态
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: planType
   *         description: 计划类型
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: planTag
   *         description: 计划标签
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/edit"), PlanController.edit);

  /**
   * @swagger
   * /api/plan/create:
   *   post:
   *     description: 删除计划
   *     summary: "删除计划"
   *     tags: [计划模块]
   *     parameters:
   *       - name: id
   *         description: 计划id
   *         required: true
   *         in: query
   *         type: number
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/del"), PlanController.del);

  /**
   * @swagger
   * /api/plan/:id:
   *   get:
   *     description: 查看计划详情
   *     summary: "查看计划详情"
   *     tags: [计划模块]
   *     parameters:
   *       - name: id
   *         description: 计划id
   *         required: true
   *         in: query
   *         type: number
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.get(getUrl("/:id"), PlanController.detail);
};
