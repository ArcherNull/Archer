/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-05 16:24:23
 * @LastEditTime: 2024-05-06 09:46:46
 * @Description: 名言表
 */

const { generateModulePrefix } = require("@lib/common");
const WksController = require("@db/controllers/well_konwn_saying");
const getUrl = (url) => generateModulePrefix(url, "/wks");

module.exports = (router) => {
  /**
   * @swagger
   * /api/wks/list:
   *   post:
   *     description: 名言列表,带搜索
   *     summary: "名言列表"
   *     tags: [名言模块]
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
  router.post(getUrl("/list"), WksController.list);

  /**
   * @swagger
   * /api/wks/create:
   *   post:
   *     description: 创建名言
   *     summary: "创建名言"
   *     tags: [名言模块]
   *     parameters:
   *       - name: wksCNContent
   *         description: 名言中文内容
   *         required: false
   *         in: query
   *         type: string
   *
   *       - name: wksENContent
   *         description: 名言英文内容
   *         required: false
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
   *       - name: wksType
   *         description: 名言类型
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: wksTag
   *         description: 名言标签
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: wksState
   *         description: 名言状态
   *         required: true
   *         in: query
   *         type: number
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/create"), WksController.create);

  /**
   * @swagger
   * /api/wks/create:
   *   post:
   *     description: 编辑名言
   *     summary: "编辑名言"
   *     tags: [名言模块]
   *     parameters:
   *       - name: id
   *         description: 名言id
   *         required: true
   *         in: query
   *         type: number
   *
   *       - name: wksCNContent
   *         description: 名言中文内容
   *         required: false
   *         in: query
   *         type: string
   *
   *       - name: wksENContent
   *         description: 名言英文内容
   *         required: false
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
   *       - name: wksType
   *         description: 名言类型
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: wksTag
   *         description: 名言标签
   *         required: true
   *         in: query
   *         type: string
   *
   *       - name: wksState
   *         description: 名言状态
   *         required: true
   *         in: query
   *         type: number
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/edit"), WksController.edit);
  // 删除名言

  /**
   * @swagger
   * /api/wks/del:
   *   post:
   *     description: 删除名言
   *     summary: "名言列表"
   *     tags: [名言模块]
   *     parameters:
   *       - name: id
   *         description: 名言id
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/del"), WksController.del);
  // 查看名言详情, 这个动态id只能放置于最后

  /**
   * @swagger
   * /api/wks/:id:
   *   get:
   *     description: 名言详情
   *     summary: "名言详情"
   *     tags: [名言模块]
   *     parameters:
   *       - name: id
   *         description: 名言id
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.get(getUrl("/:id"), WksController.detail);
};
