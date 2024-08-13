/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-05 16:24:23
 * @LastEditTime: 2024-07-22 22:25:20
 * @Description: 电子围栏表
 */

const { generateModulePrefix } = require("@lib/common");
const ElectronicFenceController = require("@db/controllers/electronic_fence");
const getUrl = (url) => generateModulePrefix(url, "/electronicFence");

module.exports = (router) => {
    /**
     * @swagger
     * /api/electronicFence/list:
     *   post:
     *     description: 电子围栏列表,带搜索
     *     summary: "电子围栏列表"
     *     tags: [电子围栏模块]
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
    router.post(getUrl("/list"), ElectronicFenceController.list);

    /**
     * @swagger
     * /api/electronicFence/create:
     *   post:
     *     description: 创建电子围栏
     *     summary: "创建电子围栏"
     *     tags: [电子围栏模块]
     *     parameters:
     *       - name: code
     *         description: 围栏编码
     *         required: false
     *         in: query
     *         type: string
     *       - name: name
     *         description: 电子围栏名称
     *         required: false
     *         in: query
     *         type: string
     *       - name: type
     *         description: 电子围栏类型， 点 / 圆 / 区域
     *         required: false
     *         in: query
     *         type: string
     *       - name: category
     *         description: 电子围栏分类， 收货区域 / 发货区域
     *         required: false
     *         in: query
     *         type: string
    *       - name: remark
     *         description: 备注
     *         required: false
     *         in: query
     *         type: json
     *       - name: dispatchAreaCoordinates
     *         description: 不规则形状坐标点json集合
     *         required: false
     *         in: query
     *         type: json
     *       - name: radius
     *         description: 圆半径
     *         required: false
     *         in: query
     *         type: number
     *       - name: size
     *         description: 图形面积
     *         required: false
     *         in: query
     *         type: number
     *       - name: address
     *         description: 详细地址
     *         required: false
     *         in: query
     *         type: string
     *       - name: longitude
     *         description: 经度
     *         required: false
     *         in: query
     *         type: number
     *       - name: latitude
     *         description: 纬度
     *         required: false
     *         in: query
     *         type: number
     *       - name: province
     *         description: 省份
     *         required: true
     *         in: query
     *         type: string
     *       - name: provinceId
     *         description: 省份编码
     *         required: true
     *         in: query
     *         type: number
     *       - name: city
     *         description: 城市
     *         required: true
     *         in: query
     *         type: string
     *       - name: cityId
     *         description: 城市编码
     *         required: true
     *         in: query
     *         type: number
     *       - name: area
     *         description: 区/县
     *         required: true
     *         in: query
     *         type: string
     *       - name: areaId
     *         description: 区/县编码
     *         required: true
     *         in: query
     *         type: number
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: 获取数据列表
     */
    router.post(getUrl("/create"), ElectronicFenceController.create);

    /**
     * @swagger
     * /api/electronicFence/edit:
     *   post:
     *     description: 编辑电子围栏
     *     summary: "编辑电子围栏"
     *     tags: [电子围栏模块]
     *     parameters:
     *       - name: id
     *         description: 电子围栏id
     *         required: true
     *         in: query
     *         type: number
     *
     *       - name: wksCNContent
     *         description: 电子围栏中文内容
     *         required: false
     *         in: query
     *         type: string
     *
     *       - name: wksENContent
     *         description: 电子围栏英文内容
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
     *         description: 电子围栏类型
     *         required: true
     *         in: query
     *         type: string
     *
     *       - name: wksTag
     *         description: 电子围栏标签
     *         required: true
     *         in: query
     *         type: string
     *
     *       - name: wksState
     *         description: 电子围栏状态
     *         required: true
     *         in: query
     *         type: number
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: 获取数据列表
     */
    router.post(getUrl("/edit"), ElectronicFenceController.edit);

    /**
     * @swagger
     * /api/electronicFence/del:
     *   post:
     *     description: 删除电子围栏
     *     summary: "电子围栏列表"
     *     tags: [电子围栏模块]
     *     parameters:
     *       - name: id
     *         description: 电子围栏id
     *         required: true
     *         in: query
     *         type: string
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: 获取数据列表
     */
    router.delete(getUrl("/del"), ElectronicFenceController.del);

    /**
     * @swagger
     * /api/electronicFence/batchDel:
     *   post:
     *     description: 批量删除电子围栏
     *     summary: "电子围栏列表"
     *     tags: [电子围栏模块]
     *     parameters:
     *       - name: id
     *         description: 电子围栏id
     *         required: true
     *         in: query
     *         type: string
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: 获取数据列表
     */
    router.post(getUrl("/batchDel"), ElectronicFenceController.batchDel);


    /**
     * @swagger
     * /api/electronicFence/:id:
     *   get:
     *     description: 电子围栏详情
     *     summary: "电子围栏详情"
     *     tags: [电子围栏模块]
     *     parameters:
     *       - name: id
     *         description: 电子围栏id
     *         required: true
     *         in: query
     *         type: string
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: 获取数据列表
     */
    router.get(getUrl("/:id"), ElectronicFenceController.detail);
};
