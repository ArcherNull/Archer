/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-07 10:36:26
 * @LastEditTime: 2024-07-24 23:19:18
 * @Description: 
 */
const { generateModulePrefix } = require("@lib/common");
const ExcelController = require("@db/controllers/excel");
const getUrl = (url) => generateModulePrefix(url, "/excel");

module.exports = (router) => {
  /**
   * @swagger
   * /api/excel/parse:
   *   post:
   *     description: 解析excel文件
   *     summary: "解析excel文件"
   *     tags: [excel模块]
   *     security:
   *        - ApiKeyAuth: []
   *     requestBody:
   *        description: 解析excel文件
   *        content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/excel-export'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/parse"), ExcelController.parse);

  /**
   * @swagger
   * components:
   *   schemas:
   *     excel-export:
   *       type: object
   *       properties:
   *         dbName:
   *           type: string
   *           description: 数据表名称
   *           example: 用户表
   *         startTime:
   *           type: date
   *           description: 开始时间
   *           example: 2020-01-11 00:00:00
   *         endTime:
   *           type: date
   *           description: 截至时间
   *           example: 2023-09-11 17:14:57
   *       required:
   *          - dbName
   *          - startTime
   *          - endTime
   */

  /**
   * @swagger
   * /api/excel/export:
   *   post:
   *     description: 导出excel文件
   *     summary: "导出excel文件"
   *     tags: [excel模块]
   *     security:
   *        - ApiKeyAuth: []
   *     requestBody:
   *        description: 导出excel文件
   *        content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/excel-export'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/export"), ExcelController.export);


  /** 
    * @swagger
    * components:
    *   schemas:
    *     excel-export-bolb:
    *       type: object
    *       properties:
    *         dbName:
    *           type: string
    *           description: 数据表名称, 
    *           example: 用户表
    *         filename:
    *           type: string
    *           description: 导出文件名称, 
    *           example: 用户表
    *         mapping:
    *           type: object
    *           description: 映射关系
    *           example: {"用户名称": "userName","用户角色": "userRole","性别": "sex", "详细地址": "address"}
    *         queryParams:
    *           type: object
    *           description: 表格查询条件
    *           example: {"state":1}
    *         isDownLoadTemplate:
    *           type: boolean
    *           description: 是否导出用于导入的模板
    *           example: false
    *       required:
    *          - dbName
    *          - filename
    *          - mapping
    *          - queryParams
    *          - isDownLoadTemplate
    */

  /**
   * @swagger
   * /api/excel/exportExcelBolb:
   *   post:
   *     description: 导出excel的bolb文件流
   *     summary: "导出excel的bolb文件流"
   *     tags: [excel模块]
   *     security:
   *        - ApiKeyAuth: []
   *     requestBody:
   *        description: 导出excel的bolb文件流
   *        content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/excel-export-bolb'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/exportExcelBolb"), ExcelController.exportExcelBolb);
};
