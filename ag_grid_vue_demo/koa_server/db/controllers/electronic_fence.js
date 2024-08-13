/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-07-08 14:19:29
 * @LastEditTime: 2024-07-22 23:14:40
 * @Description: 电子围栏
 */

const models = require("../models");
const { Op } = require('sequelize')
const { SuccessModel, ErrorModel, SuccessPageModel } = require("@exceptions/index");
const { isPositiveInteger } = require("@lib/validate");
const { filterObjEmptyProperty, validateRequiredParams } = require("@lib/common");
const { addCreateCommonField, addUpdateCommonField } = require("@middlewares/addCommonField");
const { PAGE_SIZE, CURRENT_PAGE } = require("@config");
const { generateOrderNumber } = require('@lib/numGenerator')
class ElectronicFenceController {
    /**
     * @description: 获取list的查询参数
     * @param {*} params
     * @return {*}
     */
    static getListQueryParams(params) {
        return new Promise(async (resolve, reject) => {
            let queryData = {};
            let {
                queryParams,
                pageSize = PAGE_SIZE,
                pageNum = CURRENT_PAGE,
            } = params;

            if (isPositiveInteger(pageSize)) {
                queryData.limit = pageSize;
            } else {
                reject("pageSize需为正整数");
            }

            if (isPositiveInteger(pageNum)) {
                queryData.offset = (pageNum - 1) * pageSize;
            } else {
                reject("pageNum需为正整数");
            }

            const describeObj = await models.electronic_fence.describe();
            const attributes = Object.keys(describeObj)
            const queryNoEmptyObj = filterObjEmptyProperty(queryParams, attributes);
            if (queryNoEmptyObj) {
                queryData.where = queryNoEmptyObj;
            }

            resolve(queryData);
        });
    }

    /**
     * 电子围栏列表
     * @param ctx
     * @returns {Promise<void>}
     */
    static async list(ctx) {
        //接收客服端参数
        const {
            queryParams,
            pageSize = PAGE_SIZE,
            pageNum = CURRENT_PAGE,
        } = ctx.request.body;

        const queryData = await ElectronicFenceController.getListQueryParams({
            queryParams,
            pageSize,
            pageNum,
        }).catch(
            (err) => {
                ctx.body = new ErrorModel(err || "参数错误");
                return;
            }
        );
        console.log("queryData=====>", queryData);

        if (queryData) {
            try {
                const { count, rows } = await models.electronic_fence.findAndCountAll({
                    ...queryData,
                    // include: [{ // include关键字表示关联查询
                    //     model: models.info_dict, // 指定关联的model
                    //     as: 'dict', // 由于前面建立映射关系时为class表起了别名，那么这里也要与前面保持一致，否则会报错
                    //     attributes: ['dicLabel'], // 这里的attributes属性表示查询class表的name和rank字段，其中对name字段起了别名className
                    // }],
                    raw: true // 这个属性表示开启原生查询，原生查询支持的功能更多，自定义更强
                });
                ctx.body = new SuccessPageModel({
                    data: rows,
                    total: count,
                    pageSize,
                    pageNum,
                });
            } catch (err) {
                console.log("err=====>", err);
                ctx.body = new ErrorModel(err || "参数错误");
            }
        }
    }

    /**
     * @description: 创建电子围栏参数筛选
     * @param {*} params
     * @return {*}
     */
    static getCreateQueryParams(params) {
        return new Promise((resolve, reject) => {
            const { name, type, category, radius, size, address, longitude, latitude, province, provinceId, city, cityId, area, areaId, dispatchAreaCoordinates } = params;
            const codeStr = generateOrderNumber('EF')
            console.log('codeStr=====>', codeStr)
            const validateRulesObj = {
                code: '围栏编码',
                name: '围栏名称',
                type: '围栏类型',
                category: '围栏分类',
                size: '面积',
                address: '详细地址',
                longitude: '经度',
                latitude: '纬度'
            }

            if (type === 1) {
                validateRulesObj.radius = '半径'
            } else {
                validateRulesObj.dispatchAreaCoordinates = '坐标点集合'
            }

            const submitData = {
                code: codeStr, name, type, category, radius, size, address, longitude, latitude, province, provinceId, city, cityId, area, areaId, dispatchAreaCoordinates
            }

            const errLog = validateRequiredParams(submitData, validateRulesObj)
            if (errLog?.length) {
                reject(errLog.join(';'))
            } else {
                resolve({
                    code: codeStr,
                    ...params
                });
            }
        });
    }

    /**
     * 创建一个电子围栏
     * @param ctx
     * @returns {Promise<void>}
     */
    static async create(ctx) {
        //接收客服端参数
        const bodyData = ctx.request.body;
        const createEfData = await ElectronicFenceController.getCreateQueryParams(
            bodyData
        ).catch((err) => {
            ctx.body = new ErrorModel(err || "参数错误");
            return;
        });
        console.log('createEfData123123', createEfData)
        const jwtData = addCreateCommonField(ctx)
        if (createEfData) {
            try {
                let efInfo = await models.electronic_fence.create({
                    ...jwtData,
                    ...createEfData,
                });
                ctx.body = new SuccessModel(efInfo);
            } catch (err) {
                ctx.body = new ErrorModel("创建电子围栏失败," + err);
            }
        }
    }

    /**
     * 获取一个电子围栏详情
     * @param ctx
     * @returns {Promise.<void>}
     */
    static async detail(ctx) {
        const { id } = ctx.params;
        if (id) {
            try {
                // 查询电子围栏详情模型
                let ef = await models.electronic_fence.findOne({
                    where: { id },
                });
                if (ef) {
                    ctx.body = new SuccessModel(ef);
                } else {
                    ctx.body = new ErrorModel(`未查询到电子围栏id为【${id}】的电子围栏详情`);
                }
            } catch (err) {
                ctx.body = new ErrorModel("查询电子围栏详情失败，" + err);
            }
        } else {
            ctx.body = new ErrorModel("电子围栏id是必传参数");
        }
    }

    /**
     * 编辑电子围栏
     * @param ctx
     * @returns {Promise<void>}
     */
    static async edit(ctx) {
        //接收客服端参数
        const { id, ...bodyData } = ctx.request.body;
        if (id) {
            const editEfData = await ElectronicFenceController.getCreateQueryParams(
                bodyData
            ).catch((err) => {
                ctx.body = new ErrorModel(err || "参数错误");
                return;
            });
            const jwtData = addUpdateCommonField(ctx)
            if (editEfData) {
                try {
                    await models.electronic_fence.update({
                        ...editEfData,
                        ...jwtData
                    }, {
                        where: { id },
                    });
                    ctx.body = new SuccessModel("更新成功");
                } catch (err) {
                    ctx.body = new ErrorModel("更新电子围栏失败，" + err);
                }
            }
        } else {
            ctx.body = new ErrorModel("电子围栏id是必传参数");
        }
    }

    /**
     * 批量删除电子围栏
     * @param ctx
     * @returns {Promise<void>}
     */
    static async batchDel(ctx) {
        //接收客服端参数
        let { ids } = ctx.request.body;
        if (ids) {
            try {
                const idArr = String(ids)?.split(',')
                console.log('idArr123123', idArr)
                if (idArr?.length) {
                    const deleteNum = await models.electronic_fence.destroy({
                        where: {
                            id: {
                                [Op.in]: idArr
                            }
                        },
                    });
                    ctx.body = deleteNum > 0 ? new SuccessModel(`删除成功【${deleteNum}】`) : new ErrorModel("删除失败");
                } else {
                    ctx.body = new ErrorModel("ids是必传参数");
                }
            } catch (err) {
                ctx.body = new ErrorModel("删除电子围栏失败，" + err);
            }
        } else {
            ctx.body = new ErrorModel("电子围栏ids是必传参数");
        }
    }

    /**
     * 删除电子围栏
     * @param ctx
     * @returns {Promise<void>}
     */
    static async del(ctx) {
        //接收客服端参数
        let { id } = ctx.request.query;
        if (id) {
            try {
                await models.electronic_fence.destroy({
                    where: {
                        id,
                    },
                });
                ctx.body = new SuccessModel("删除电子围栏成功");
            } catch (err) {
                ctx.body = new ErrorModel("删除电子围栏失败，" + err);
            }
        } else {
            ctx.body = new ErrorModel("电子围栏id是必传参数");
        }
    }
}

module.exports = ElectronicFenceController;
