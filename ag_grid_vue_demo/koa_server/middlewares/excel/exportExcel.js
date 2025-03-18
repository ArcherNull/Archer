/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-08-30 19:22:45
 * @LastEditTime: 2024-07-24 23:13:23
 * @Description: 导出excel文件
 *
 * 导出特定的字段
 *
 */
const models = require("@db/models/index");
const xlsx = require("node-xlsx");
const { isObject, isEmpty } = require('lodash')
const { validateStartTimeAndEndTIme, filterObjEmptyProperty } = require("@lib/common");
const { EXPORT_EXCEL_DB_NAME_LIST } = require("@lib/constants");
const { SuccessModel, ErrorModel } = require("@exceptions/index");
const { DEFAULT_DATE_FORMAT } = require("@config");

class ExcelUtils {
  // 头部样式
  static HEADER_STYLE = {
    FIELD_ERROR: {
      font: {
        bold: true
      },
      alignment: {
        horizontal: "center"
      },
      fill: {
        fgColor: { rgb: "C0504D" },//16进制，注意要去掉#
      },
    }
  }
  // 列内容样式
  static CONTENT_STYLE = {
    border: {
      top: {
        style: "medium", color: "#000"
      },
      bottom: {
        style: "medium", color: "#000"
      },
      left: {
        style: "medium", color: "#000"
      },
      right: {
        style: "medium", color: "#000"
      },
    }
  }


  // 时间格式化
  static dateFormat = DEFAULT_DATE_FORMAT || "YYYY-MM-DD HH:mm:ss";
  // 表格数据
  _tableData = []
  // 数据库表名称
  _dbTableName
  // 查询条件
  _queryParams
  // 关联关系
  _mappingObj = {}
  // 文件名
  _filename
  // 是否下载的是导入模板
  _isDownLoadTemplate = false


  constructor(options) {
    this.parseOptions(options)
  }

  /**
   * @description: 解析options
   * @param {{ dbName:string;filename?:string;mapping:{ [key:string]:string };queryParams?:object;isDownLoadTemplate?:boolean   }} options 选项参数
   * @return {*}
   * 
   * ```
   * dbName:表名称;filename:文件名称;mapping:字段映射关系;queryParams:查询条件;isDownLoadTemplate：是否下载的是导入模板
   * options 示例
   {
    "dbName": "用户表",
    "filename": "用户表",
    "mapping": {
        "用户名称": "userName",
        "用户角色": "userRole",
        "性别": "sex",
        "详细地址": "address",
    },
    "queryParams": {
        "state": 1
    },
    "isDownLoadTemplate": false
    }
   * 
   * ```
   */
  parseOptions(options) {
    const { dbName, filename = 'excel', mapping, queryParams = {}, isDownLoadTemplate = false } = options
    const dbNameList = Object.keys(EXPORT_EXCEL_DB_NAME_LIST);

    if (dbNameList.includes(dbName)) {
      if (isObject(mapping) && !isEmpty(mapping)) {
        const filenameStr = `${filename}_${new Date().valueOf()}`
        this._filename = filenameStr
        this._dbTableName = EXPORT_EXCEL_DB_NAME_LIST[dbName]
        this._mappingObj = mapping
        this._queryParams = queryParams
        this._isDownLoadTemplate = isDownLoadTemplate
        return this
      } else {
        throw new Error(`参数【mapping】字段映射关系不能为空对象`)
      }
    } else {
      throw new Error(`参数【dbName】数据导表名不满足【${dbNameList.join("/")}】其中之一`)
    }
  }

  /**
   * @description: 获取表字段
   * @return {*}
   */
  async getTableAttributes() {
    const describeObj = await models?.[this._dbTableName].describe();
    const attributes = Object.keys(describeObj)
    return attributes
  }

  /**
   * @description: 通过入参和数据表名称获取数据
   * @return {*}
   */
  async getTableDataBySql(fields) {
    try {
      const attributes = await this.getTableAttributes()
      // 过滤掉非当前表格的字段，以免报错
      const queryNoEmptyObj = filterObjEmptyProperty(this._queryParams, attributes);
      let queryData = {
        attributes: fields,
        where: {
          ...queryNoEmptyObj
        },
        raw: true
      };

      let results = await models?.[this._dbTableName].findAll(queryData);
      console.log('results', results)
      return results
    } catch (err) {
      throw new Error('获取数据失败，' + err)
    }
  }

  /**
   * @description: 导出excel配置项
   * @return {*}
   */
  async getExcelOptions() {
    console.log('this._mappingOb123123j', this._mappingObj)
    const headers = Object.keys(this._mappingObj)
    const attributes = await this.getTableAttributes()
    const newHeaders = []
    const errHeaders = []
    const fields = []
    // excel 通用样式
    const mapping = {
      "!cols": [],
    };
    headers.forEach((ele, ind) => {
      const field = this._mappingObj[ele]
      // 如果传入的字段不包含在表内
      if (!attributes.includes(field)) {
        const headersItem = headers.splice(ind, 1) + '(E)'
        errHeaders.push(headersItem)
      } else {
        newHeaders.push(ele)
      }
      fields.push(field)
      mapping["!cols"].push({
        wch: 30,
      });
    });
    return {
      headers: [...newHeaders, ...errHeaders],
      fields,
      mapping
    }
  }

  // 生成excel的buff
  async generateExcelExportBuff(options = {}) {
    try {
      // excel 通用样式
      const { mapping, fields, headers } = await this.getExcelOptions()
      const tableData = await this.getTableDataBySql(fields)
      const nTableData = tableData.map(ele => {
        return Object.values(ele)
      })
      let xlsxObj = [
        {
          name: "sheet",
          data: [
            headers,
            ...nTableData
          ]
        }
      ]

      // 返回一个buffer对象
      return xlsx.build(xlsxObj, {
        ...mapping,
        ...options,
      })
    } catch (err) {
      throw new Error('生成excel失败，' + err)
    }
  }

  // 发送导出excel的buff
  async sendExcelExportBuff(ctx) {
    try {
      // 将数据转换为Buffer
      let buffer = await this.generateExcelExportBuff()
      // 设置content-type请求头
      ctx.set('Content-Type', 'application/vnd.openxmlformats');
      // 设置文件名信息请求头
      ctx.set('Content-Disposition', "attachment; filename=" + encodeURIComponent(this._filename) + ".xlsx");
      // 文件名信息由后端返回时必须设置该请求头,否则前端拿不到Content-Disposition响应头信息
      ctx.set("Access-Control-Expose-Headers", "Content-Disposition")
      // 将buffer返回给前端
      ctx.body = buffer
    } catch (err) {
      ctx.body = new SuccessModel('解析excel失败，' + err)
    }
  }
}

module.exports = {
  ExcelUtils
};