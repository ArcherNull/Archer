/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-09-09 16:20:41
 * @LastEditTime: 2024-07-24 23:17:27
 * @Description: excel导出
 */
const models = require("../models");
const { Op } = require("sequelize");
const { DEFAULT_DATE_FORMAT } = require("@config");
const moment = require("moment");
const { EXPORT_EXCEL_DB_NAME_LIST } = require("@lib/constants");
const { SuccessModel, ErrorModel } = require("@exceptions/index");
const { validateStartTimeAndEndTIme } = require("@lib/common");
const { ExcelUtils } = require('@middlewares/excel/exportExcel')

class ExcelController {
  // 时间格式化
  static dateFormat = DEFAULT_DATE_FORMAT || "YYYY-MM-DD HH:mm:ss";
  // 导出excel
  static async export(ctx) {
    //接收客服端参数
    let { dbName, startTime, endTime } = ctx.request.body;
    const dbNameList = Object.keys(EXPORT_EXCEL_DB_NAME_LIST);
    if (dbNameList.includes(dbName)) {
      try {
        const validateDate = await validateStartTimeAndEndTIme(
          {
            startTime,
            endTime,
          },
          ExcelController.dateFormat
        );

        console.log("validateDate=====>", validateDate);

        switch (dbName) {
          case "用户表":
            console.log(dbName);
            await ExcelController.exportUserTable(ctx, validateDate);
            break;
          default:
            ctx.body = new ErrorModel("excel导表数据名称不正确");
            break;
        }
      } catch (err) {
        console.log("err====>", err);
        ctx.body = new ErrorModel(err || "导出错误");
      }
    } else {
      ctx.body = new ErrorModel("excel导表数据名称不正确");
    }
  }

  /**
   * @description: 导出用户表excel
   * @param {*} ctx
   * @return {*}
   */
  static async exportUserTable(ctx, validateDate) {
    let { startTime, endTime } = validateDate;

    let queryData = {
      attributes: { exclude: ["password", "token", "id", "userImg"] },
      order: [["updatedAt", "desc"]],
    };

    if (startTime || endTime) {
      const currentTime = moment().format(ExcelController.dateFormat);
      queryData.where = {
        [Op.and]: [
          {
            updatedAt: {
              [Op.between]: [
                startTime || endTime,
                !startTime ? currentTime : endTime || currentTime,
              ],
            },
          },
        ],
      };
    }

    const results = await models.user.findAll(queryData);
    ctx.body = new SuccessModel(results);
  }

  /**
   * @description: 解析excel
   * @param {*} ctx
   * @return {*}
   */
  static async parse(ctx) { }

  /**
   * @description: 导出excel的bolb文件流
   * @param {*} ctx
   * @return {*}
   */
  static async exportExcelBolb(ctx) {
    try {
      let bodyData = ctx.request.body;
      const excelUtils = new ExcelUtils(bodyData)
      return await excelUtils.sendExcelExportBuff(ctx)
    } catch (err) {
      ctx.body = new ErrorModel('文件导出失败，' + err)
    }
  }
}
module.exports = ExcelController;
