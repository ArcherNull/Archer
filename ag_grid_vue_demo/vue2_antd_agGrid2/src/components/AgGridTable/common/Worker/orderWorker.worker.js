/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-31 10:19:02
 * @LastEditTime: 2024-06-08 09:45:56
 * @Description:
 */
import {
  RequestItem,
  BatchRequest,
} from "@/components/AgGridTable/common/utils/batchRequest";

import {
  exportExcelFileBlob,
  formatSpecDate,
} from "@/components/AgGridTable/common/utils/exportExcel.js";

import { SuccessModel } from "@/components/AgGridTable/common/utils/exceptions.js";
/**
 * @description: 此方法用于所有接口全部请求完毕后，一起返回
 * @param {*} config
 * @return {*}
 */
async function batchRequestFun(config, callback) {
  console.log("config123123123", config);
  const { requestParams, pageParams } = config.pageOptions;
  const { maxNum } = config.requestOptions;
  const { data, ...queryParams } = requestParams;
  const { pageNum, pageSize, ...resetDataObj } = data;
  const { totalPage } = pageParams;
  const ajaxLists = [];

  callback(
    new SuccessModel({
      message: "任务拼装进行中",
      status: "config.processing",
    })
  );

  for (let i = pageNum; i <= totalPage; i++) {
    const newRequestItem = new RequestItem({
      reqParams: {
        id: i,
        ...queryParams,
        data: {
          pageSize,
          pageNum: i,
          ...resetDataObj,
        },
      },
      // 校验请求参数方法
      validateReqParamsFun: (params) => {
        if (!params?.url) {
          return "请求ajaxItem不能为空";
        }
        const methodVal = params?.method;
        if (methodVal) {
          const methodArr = ["GET", "POST"];
          if (!methodArr.includes(methodVal.toUpperCase()))
            return `请求方式不满足【${methodArr.join("/")}】其中之一`;
        }
      },
      // 处理res响应
      dealResFun: (res) => {
        const resObj = {
          status: RequestItem.REQ_FAIL_STATUS,
          response: null,
        };
        if (res?.code === 200) {
          resObj.status = RequestItem.REQ_SUCCESS_STATUS;
          resObj.response = res?.data;
        } else if (res?.code === 500) {
          resObj.status = RequestItem.REQ_FAIL_STATUS;
          resObj.response = res?.data;
        }
        return resObj;
      },
    });

    ajaxLists.push(newRequestItem);
  }

  callback(
    new SuccessModel({
      message: "任务拼装完毕",
      status: "config.success",
    })
  );

  const newBatchRequest = new BatchRequest({
    ajaxLists,
    maxNum,
    callback,
  });

  callback(
    new SuccessModel({
      message: "请求进行中",
      status: "request.processing",
    })
  );

  // 第一种方式，请求所有
  const results = await newBatchRequest.concurRequest();

  return newBatchRequest.dealResult(results);
}

function sleep(time = 1500) {
  return Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}

// Web Workers的部分代码（在Workers中计算两个数的和）
self.onmessage = async function (ele) {
  try {
    const config = ele.data;
    console.log("batchExportExcelWorker.js中配置参数=====>", config);

    const fileType = config.requestOptions.responseType;

    // 获取到阶段性数据
    batchRequestFun(config, (ele) => {
      console.log("回调函数", ele);
      // 不能将 接口响应的data数据[非可转移数据]传递给主线程，否则数据量超过10w,会造成浏览器崩溃
      // 对象/变量/数组等数据，如果传递给主线程，其实是从worker线程将值复制一份到主线程，数据量过大同样会导致主线程崩溃
      // 如果实在是需要在前端展示这些数据，则需要借助indexDB做中间存储 
      if (fileType === "asyncFile") {
        console.log("回调函数asyncFile", ele);
        self.postMessage({
          status: ele.status,
          data: null,
          code: ele.code,
          message: ele.message,
        });
      } else {
        self.postMessage({
          status: ele.status,
          data: null,
          code: ele.code,
          message: ele.message,
        });
      }
      // return index > 1;
    })
      .then(async (result) => {
        console.log("最终result=====>", result);
        if (fileType === "file") {
          self.postMessage({
            status: "exportExcel.processing",
            message: `请求完毕【${result.length}/${result.length}】，文件导出准备中...`,
          });
          const fileBlobArr = await exportExcelFileBlob(result, config);
          const exportFileOptions = config.exportFileOptions;
          self.postMessage({
            status: "exportExcel.processing",
            message: `文件导出中,请不要刷新...`,
            data: fileBlobArr,
            fileNameObj: exportFileOptions,
          });
        } else if (fileType === "data") {
          self.postMessage({
            status: "request.success",
            message: `请求完毕【${result.length}/${result.length}】,数据加载中...`,
            data: result,
          });
        }
      })
      .then(() => {
        self.postMessage({
          status: "exportExcel.success",
          message: `web worker 任务结束`,
        });
      });
  } catch (err) {
    self.postMessage({
      status: "config.failed",
      message: `orderWorker.js线程执行失败，${err.message || ""}`,
    });
  }
};

/**
 * 处理错误的函数 主线程可以监听 Worker 是否发生错误。
 * 如果发生错误，Worker 会触发主线程的`error`事件。
 */
const ERROR = () => {
  // 发送错误信息
  self.postMessage({ message: "error", data: [] });

  // `self.close()`用于在 Worker 内部关闭自身。
  self.close();
};

// 错误处理
self.addEventListener("error", (event) => {
  ERROR();

  // 输出错误信息
  console.log(
    "ERROR: Line ",
    event.lineno,
    " in ",
    event.filename,
    ": ",
    event.message
  );
});
