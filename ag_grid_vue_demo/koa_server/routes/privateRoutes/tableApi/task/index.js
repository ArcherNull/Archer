/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-04 21:07:37
 * @LastEditTime: 2024-06-03 17:34:36
 * @Description: 任务表
 */
const { generateModulePrefix } = require("@lib/common");
const TaskController = require("@db/controllers/task");
const getUrl = (url) => generateModulePrefix(url, "/task");

module.exports = (router) => {
  /**
   * @swagger
   * /api/task/list:
   *   post:
   *     description: 任务列表,带搜索
   *     summary: "任务列表"
   *     tags: [任务模块]
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
  router.post(getUrl("/list"), TaskController.list);

  /**
   * @swagger
   * /api/task/create:
   *   post:
   *     description: 创建任务
   *     summary: "创建任务"
   *     tags: [任务模块]
   *     parameters:
   *       - name: taskName
   *         description: 任务名称
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: taskStartTime
   *         description: 任务开始时间
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: taskEndTime
   *         description: 任务结束时间
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
   *       - name: taskType
   *         description: 任务类型
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: taskTag
   *         description: 任务标签
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/create"), TaskController.create);
  // 编辑任务详情

  /**
   * @swagger
   * /api/task/create:
   *   post:
   *     description: 编辑任务详情
   *     summary: "编辑任务详情"
   *     tags: [任务模块]
   *     parameters:
   *       - name: id
   *         description: 任务id
   *         required: true
   *         in: query
   *         type: string
   *       - name: taskName
   *         description: 任务名称
   *         required: true
   *         in: query
   *         type: string
   *       - name: taskStartTime
   *         description: 任务开始时间
   *         required: true
   *         in: query
   *         type: string
   *       - name: taskEndTime
   *         description: 任务结束时间
   *         required: true
   *         in: query
   *         type: string
   *       - name: createBy
   *         description: 创建人名称
   *         required: true
   *         in: query
   *         type: string
   *       - name: createById
   *         description: 创建人id
   *         required: true
   *         in: query
   *         type: string
   *       - name: taskType
   *         description: 任务类型
   *         required: true
   *         in: query
   *         type: string
   *       - name: taskTag
   *         description: 任务标签
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/edit"), TaskController.edit);

  /**
   * @swagger
   * /api/task/del:
   *   post:
   *     description: 删除任务
   *     summary: "任务列表"
   *     tags: [任务模块]
   *     parameters:
   *       - name: id
   *         description: 任务id
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/del"), TaskController.del);

  /**
   * @swagger
   * /api/task/:id:
   *   post:
   *     description: 查看任务详情
   *     summary: "任务列表"
   *     tags: [任务模块]
   *     parameters:
   *       - name: id
   *         description: 任务id
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.get(getUrl("/:id"), TaskController.detail);
};
