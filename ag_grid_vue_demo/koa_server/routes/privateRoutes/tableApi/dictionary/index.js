/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-05 16:21:22
 * @LastEditTime: 2024-07-22 00:36:58
 * @Description:  字典表
 */

const { generateModulePrefix } = require("@lib/common");
const DictionaryController = require("@db/controllers/info_dict");
const getUrl = (url) => generateModulePrefix(url, "/dictionary");

module.exports = (router) => {
  /**
   * @swagger
   * /api/dictionary/list:
   *   post:
   *     description: 字典列表,带搜索
   *     summary: "字典列表"
   *     tags: [字典模块]
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
  router.post(getUrl("/list"), DictionaryController.list);

  /**
   * @swagger
   * /api/dictionary/create:
   *   post:
   *     description: 创建字典
   *     summary: "创建字典"
   *     tags: [字典模块]
   *     parameters:
   *       - name: dicLabel
   *         description: 字典label
   *         required: true
   *         in: query
   *         type: string
   *       - name: dicValue
   *         description: 字典value
   *         required: true
   *         in: query
   *         type: string
   *       - name: dicBindId
   *         description: 绑定父级id
   *         required: false
   *         in: query
   *         type: number
   *       - name: dicRemark
   *         description: 备注
   *         required: false
   *         in: query
   *         type: string
   *       - name: dicExtraParams
   *         description: 额外参数
   *         required: false
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/create"), DictionaryController.create);

  /**
   * @swagger
   * /api/dictionary/edit:
   *   post:
   *     description: 编辑字典
   *     summary: " 编辑字典"
   *     tags: [字典模块]
   *     parameters:
   *       - name: id
   *         description: 字典id
   *         required: false
   *         in: query
   *         type: string
   *       - name: dicLabel
   *         description: 字典label
   *         required: true
   *         in: query
   *         type: string
   *       - name: dicValue
   *         description: 字典value
   *         required: true
   *         in: query
   *         type: string
   *       - name: dicBindId
   *         description: 绑定父级id
   *         required: false
   *         in: query
   *         type: number
   *       - name: dicRemark
   *         description: 备注
   *         required: false
   *         in: query
   *         type: string
   *       - name: dicExtraParams
   *         description: 额外参数
   *         required: false
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/edit"), DictionaryController.edit);

  /**
    * @swagger
    * /api/dictionary/bulkCreate:
    *   post:
    *     description: 批量导入字典数据
    *     summary: " 批量导入字典数据"
    *     tags: [字典模块]
    *     parameters:
    *       - name: list
    *         description: 字典数据
    *         required: true
    *         in: query
    *         type: array
    *     produces:
    *       - application/json
    *     responses:
    *       200:
    *         description: 获取数据列表
    */
  router.post(getUrl("/bulkCreate"), DictionaryController.bulkCreate);

  /**
   * @swagger
   * /api/dictionary/batchGet:
   *   post:
   *     description: 批量获取绑定字典数据
   *     summary: " 批量获取绑定字典数据"
   *     tags: [字典模块]
   *     parameters:
   *       - name: ids
   *         description: 字典ids , 使用英文逗号,拼接
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.get(getUrl("/batchGet"), DictionaryController.getMultiDictItemsByIds);


  /**
   * @swagger
   * /api/dictionary/batchEditdDicState:
   *   post:
   *     description: 更改字典状态
   *     summary: "更改字典状态"
   *     tags: [字典模块]
   *     parameters:
   *       - name: ids
   *         description: 字典id , 逗号分隔
   *         required: true
   *         in: query
   *         type: string
   *       - name: userState
   *         description: 字典状态 , 0-禁用；1-启用；2-注销
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/batchEditdDicState"), DictionaryController.batchEditdDicState);

  /**
   * @swagger
   * /api/dictionary/batchDel:
   *   delete:
   *     description: 批量物理删除字典
   *     summary: "批量物理删除字典"
   *     tags: [字典模块]
   *     parameters:
   *       - name: ids
   *         description: 字典id , 逗号分隔
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/batchDel"), DictionaryController.batchDel);


  /**
   * @swagger
   * /api/dictionary/del:
   *   delete:
   *     description: 物理删除字典
   *     summary: "物理删除字典"
   *     tags: [字典模块]
   *     parameters:
   *       - name: id
   *         description: 字典id
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.delete(getUrl("/del"), DictionaryController.del);

  /**
   * @swagger
   * /api/dictionary/:id:
   *   get:
   *     description: 查看字典详情
   *     summary: "字典列表"
   *     tags: [字典模块]
   *     parameters:
   *       - name: id
   *         description: 字典id
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.get(getUrl("/:id"), DictionaryController.detail);
};