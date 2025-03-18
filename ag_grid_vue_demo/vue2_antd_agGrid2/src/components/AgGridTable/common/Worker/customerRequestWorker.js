/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-06-05 10:16:06
 * @LastEditTime: 2024-06-07 11:28:21
 * @Description: 自定义worker class
 *
 *  写此类的目的是，统一管理worker方法，以及自定义方法，不分散
 *  约束web worker 入参和出参，数据统一管理
 *  节省应用代码
 *  
 *  worker 当数据内存大于500M时会崩溃，所以需要拿到一部分数据，就立马导出
 *
 */
import { saveAs } from "file-saver";

// 示例
export const validateConfigRules = {
  // 页面配置
  pageOptions: {
    // 请求参数
    requestParams: {
      url: "请求参数-请求【url】[string]",
      method: "请求参数-请求【method】['get' | 'post']",
      data: {
        pageNum: "请求参数-请求当前页[number]",
        pageSize: "请求参数-请求页数[number]",
      },
      headers: {
        Authorization: "请求头部【Authorization】参数[string]",
      },
    },
    // 界面参数
    pageParams: {
      total: "界面参数-总条数[number]",
      totalPage: "界面参数-总页面[number]",
    },
    // 表格排序字段
    sortabledFields: "表格排序字段[array[]]",
  },

  // 请求配置
  requestOptions: {
    maxNum: "最大并发数[number]",
    isRequestErrorAndStop: "请求错误，立即中断循环请求[boolean]",
    isDealResponseErrorAndStop: "响应处理错误，立即中断循环请求[boolean]",
    // 数据响应类型，data 表示直接返回数据，file 表示返回文件
    responseType: "数据响应类型['data' | 'file']",
  },

  // 导出文件配置
  exportFileOptions: {
    fileType: "文件类型['excel' | 'txt' | 'pdf' | 'json']",
    fileName: "文件名称[string]",
    extName: "文件后缀名['.xlsx' | '.csv' | '.txt' | '.json' | '.pdf']",
  },
};

export class CustomerRequestWorker {
  // 导出excel文件大小限制，超出100M则不行
  static EXPORT_EXCEL_FILE_SIZE_LIMIT = 90;
  // 请求每页页数大小
  static REQUEST_DEFAULT_PAGE_SIZE = 5000;
  // 请求最大并发数
  static REQUEST_DEFAULT_MAX_NUM = 3;
  // 请求错误，立即中断循环请求[boolean]
  static IS_REQUEST_ERROR_AND_STOP = false;
  // 响应处理错误，立即中断循环请求[boolean]
  static IS_DEAL_RESPONSE_ERROR_AND_STOP = false;
  // 数据响应类型['data' | 'file']，data 表示直接返回数据，file 表示返回文件
  static REQUEST_RESPONSE_TYPE = "file";
  // 导出文件名称
  static EXPORT_FILE_NAME = "Download File";

  // Worker 实例
  _myWorker = null;
  // 配置项
  _config = null;
  // 回调函数
  _callback = null;

  constructor(options, callback) {
    this.init(options, callback);
  }

  /**
   * @description: 初始化, 因为worker 不能读取文件路径
   * @param {*} workerPath 相对路径
   * @return {*}
   */
  init(options, callback) {
    try {
      const { myWorker, ...config } = options;
      if (myWorker instanceof Worker) {
        this._myWorker = myWorker;

        if (typeof callback === "function") {
          // 回调函数
          this._callback = callback;

          const dealConfig = this.getDealConfig(config);
          if (dealConfig) {
            // 配置config
            this._config = dealConfig;
            // 发送参数
            this.postMessageFun(dealConfig);
            // 开启监听分发消息
            this.listenAndDispatchMessage();
          }
        } else {
          throw new Error("第二参数[callback]需为函数");
        }
      } else {
        throw new Error("第一参数[options]需要传入myWorker实例");
      }
    } catch (err) {
      console.error(err?.message || "创建web worker失败");
    }
  }

  // 校验配置项config，激活对应功能
  getDealConfig(config) {
    const { pageOptions, requestOptions, exportFileOptions } = config;

    const dealConfig = {
      // 页面配置
      pageOptions: {
        requestParams: {
          url: pageOptions?.requestParams?.url,
          method: pageOptions?.requestParams?.method,
          data: {
            pageNum: pageOptions?.requestParams?.data?.pageNum,
            pageSize:
              pageOptions?.requestParams?.data?.pageSize ||
              CustomerRequestWorker.REQUEST_DEFAULT_PAGE_SIZE,
          },
          headers: {
            Authorization: pageOptions?.requestParams?.headers?.Authorization,
          },
        },
        pageParams: {
          total: pageOptions?.pageParams?.total,
          totalPage: pageOptions?.pageParams?.totalPage,
        },
        sortabledFields: pageOptions?.sortabledFields || [],
      },
      // 请求配置
      requestOptions: {
        maxNum:
          requestOptions?.maxNum ||
          CustomerRequestWorker.REQUEST_DEFAULT_MAX_NUM,
        isRequestErrorAndStop:
          requestOptions?.isRequestErrorAndStop ||
          CustomerRequestWorker.IS_REQUEST_ERROR_AND_STOP,
        isDealResponseErrorAndStop:
          requestOptions?.isDealResponseErrorAndStop ||
          CustomerRequestWorker.IS_DEAL_RESPONSE_ERROR_AND_STOP,
        responseType:
          requestOptions?.responseType ||
          CustomerRequestWorker.REQUEST_RESPONSE_TYPE,
      },
      // 导出文件配置
      exportFileOptions: {
        fileType: exportFileOptions?.fileType,
        fileName:
          exportFileOptions?.fileName || CustomerRequestWorker.EXPORT_FILE_NAME,
        extName: exportFileOptions?.extName,
      },
    };

    const nExportFileOptions = this.getExportFileType(
      dealConfig.exportFileOptions.fileType,
      dealConfig.exportFileOptions.fileName
    );

    console.log("nExportFileOptions", nExportFileOptions);

    if (nExportFileOptions) {
      console.log("dealConfig=====>", dealConfig);
      const total = dealConfig?.pageOptions?.pageParams?.total;
      const pageNum = dealConfig?.pageOptions?.requestParams?.data?.pageNum;
      const pageSize = pageOptions?.requestParams?.data?.pageSize;
      const rPageSize = dealConfig?.pageOptions?.requestParams?.data?.pageSize;
      const totalPage = Math.ceil(
        (total - (pageNum - 1) * pageSize) / rPageSize
      );

      dealConfig.exportFileOptions = nExportFileOptions;
      dealConfig.pageOptions.pageParams.totalPage = totalPage;
      return dealConfig;
    } else {
      throw new Error("导出文件类型配置错误");
    }
  }

  // 获取导出文件类型
  getExportFileType(fileType, fileName) {
    if (fileName) {
      const fileTypeList = {
        excel: {
          fileName,
          extName: ".xlsx",
        },
        txt: {
          fileName,
          extName: ".txt",
        },
        pdf: {
          fileName,
          extName: ".pdf",
        },
        json: {
          fileName,
          extName: ".json",
        },
      };

      const fileTypeObj = fileTypeList[fileType];

      console.log("fileTypeObj123123", fileTypeObj);

      if (fileTypeObj) {
        return {
          fileType,
          ...fileTypeObj,
        };
      }
    }
  }

  // 发送消息
  postMessageFun(params) {
    this._myWorker.postMessage(params);
  }

  // 监听并分发消息
  listenAndDispatchMessage() {
    const that = this;
    that._myWorker.onmessage = function (ele) {
      try {
        const result = ele.data;
        console.log("监听并分发消息", result);

        const { message, data, status } = result;

        switch (status) {
          case "config.processing":
            console.log("config.processing");
            break;
          case "config.success":
            console.log("config.success");
            break;
          case "config.failed":
            console.log("config.failed");
            that.closeWorker();
            break;

          case "request.processing":
            console.log("request.processing", message);
            console.log("数据data=====>", data);
            break;
          case "request.success":
            console.log("request.success", message);
            console.log("数据data=====>", data);

            break;
          case "request.failed":
            console.log("request.failed");

            break;

          case "exportExcel.processing":
            console.log("exportExcel.processing");
            data && that.saveExcelFileByBolbArr(data, result?.fileNameObj);
            break;
          case "exportExcel.success":
            console.log("exportExcel.success");
            break;
          case "exportExcel.failed":
            console.log("exportExcel.failed");
            that.closeWorker();
            break;

          default:
            console.log("default");
            break;
        }

        that._callback(message);
      } catch (err) {
        console.error(err?.message || "操作失败");
      }
    };
  }

  /**
   * @description: 通过ArrayBuffer计算数据大小MB
   * @param {*} buf 实例化的ArrayBuffer
   * @param {*} sizeUnit 计算的单位 ， MB / KB
   * @return {*}
   */
  calcFileSizeByBuf(buf, sizeUnit = "MB") {
    if (sizeUnit === "MB") {
      // 转换为MB (1024 bytes per KB, 1024 KB per MB)
      const sizeInMB = buf.byteLength / 1024 / 1024;
      const sizeInMBVal = sizeInMB.toFixed(2);
      console.log(`Size in MB: ${sizeInMBVal}`);
      return sizeInMBVal;
    } else if (sizeUnit === "KB") {
      // 转换为KB (1024 bytes per KB)
      const sizeInKB = buf.byteLength / 1024;
      const sizeInKBVal = sizeInKB.toFixed(2);
      console.log(`Size in KB: ${sizeInKBVal}`);
      return sizeInKBVal;
    }
  }

  /**
   * @description:
   * @param {*} buf 实例化的ArrayBuffer
   * @return {*}
   */
  isFileSizeOverExportExcelLimit(buf) {
    const dateSize = this.calcFileSizeByBuf(buf);
    return dateSize <= CustomerRequestWorker.EXPORT_EXCEL_FILE_SIZE_LIMIT;
  }

  // 格式化
  formatDateStr(n) {
    return n > 9 ? n : "0" + n;
  }

  /**
   * @description: 日期时间格式化
   * @param {number} offsetHour 偏移小时
   * @return {*}
   */
  formatSpecDate(offsetHour = 0) {
    let date = new Date();
    const formatDateStr = this.formatDateStr;
    if (offsetHour) {
      const cDate = date.getTime() + offsetHour * 60 * 1000 * 60;
      date = new Date(cDate);
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    return `${year}${formatDateStr(month)}${formatDateStr(day)}${formatDateStr(
      hour
    )}${formatDateStr(minute)}`;
  }

  // 二进制对象数组
  saveExcelFileByBolbArr(blobArr, fileNameObj) {
    if (Array.isArray(blobArr) && blobArr.length) {
      const that = this;
      blobArr.forEach((blob, index) => {
        if (blob) {
          const dateTime = that.formatSpecDate();
          let fileNameStr = `${dateTime}-downLoadExcel-${index + 1}.xlsx`;
          if (fileNameObj?.fileName && fileNameObj?.extName) {
            fileNameStr = `${dateTime}-${fileNameObj.fileName}-${index + 1}${
              fileNameObj.extName
            }`;
          }
          that.saveExcelFileByBolb(blob, fileNameStr);
        }
      });
    } else {
      throw new Error(`导出失败,未获取到二进制数据`);
    }
  }

  /**
   * @description: 通过二进制数据保存excel文件
   * @param {*} wbout 二进制文件数据
   * @param {*} fileNameStr 文件名
   * @return {*}
   */
  saveExcelFileByBolb(wbout, fileNameStr) {
    const dateSize = this.calcFileSizeByBuf(wbout);
    const limitSize = CustomerRequestWorker.EXPORT_EXCEL_FILE_SIZE_LIMIT;
    const isExport = dateSize <= limitSize;

    if (isExport) {
      saveAs(
        new Blob([wbout], {
          type: "application/octet-stream",
        }),
        fileNameStr
      );
    } else {
      throw new Error(
        `导出失败,当前数据大小为【${dateSize}】已超出导出最大限制【${limitSize}】`
      );
    }
  }

  // 关闭worker
  closeWorker() {
    this._myWorker?.terminate();
  }

  // 暂停worker中的request请求
  stopWorkerAjaxRequest() {}
}
