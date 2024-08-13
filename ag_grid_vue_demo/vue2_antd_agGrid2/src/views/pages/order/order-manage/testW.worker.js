/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-31 10:19:02
 * @LastEditTime: 2024-06-06 17:03:11
 * @Description:
 */
import {
  RequestItem,
  BatchRequest,
} from "@/components/AgGridTable/common/utils/batchRequest";
import { exportExcelFun } from "@/components/AgGridTable/common/utils/exportExcel";

/**
 * @description: 此方法用于所有接口全部请求完毕后，一起返回
 * @param {*} config
 * @return {*}
 */
async function batchRequestFun(config, callback) {
  console.log("config123123123", config);
  const { requestParams, pageParams } = config;
  const { data, ...queryParams } = requestParams;
  const { pageNum, pageSize, ...resetDataObj } = data;
  const { totalPage } = pageParams;
  const ajaxLists = [];
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

  const newBatchRequest = new BatchRequest({
    ajaxLists,
    maxNum: 2,
    callback,
  });

  // 第一种方式，请求所有
  const results = await newBatchRequest.concurRequest();
  return results;
}

// 获取排序字段
function getSortabledFields(sortabledFields) {
  console.log("sortabledFields", sortabledFields);
  let tHeader = [];
  let filterVal = [];
  sortabledFields.forEach((ele) => {
    if (!ele.hide) {
      tHeader.push(ele.headerName);
      filterVal.push(ele.field);
    }
  });
  return {
    tHeader,
    filterVal,
  };
}

function getTableData(result) {
  const tableData = [];
  result.forEach((ele) => {
    if (ele.reqStatus === "success") {
      tableData.push(...ele.response);
    }
  });
  return tableData;
}

// Web Workers的部分代码（在Workers中计算两个数的和）
self.onmessage = async function (ele) {
  try {
    const config = ele.data;
    console.log("batchExportExcelWorker.js中配置参数=====>", config);

    const dealResult = (result) => {
      const postResult = result.map((ele) => {
        return {
          reqParams: ele.reqParams,
          reqStatus: ele.reqStatus,
          response: ele.response,
          responseMsg: ele.responseMsg,
        };
      });
      return postResult;
    };

    // 获取到阶段性数据
    batchRequestFun(config, (ele) => {
      console.log("回调函数", ele);
      const { status, data, message } = ele;
      const { result } = data;
      self.postMessage({
        status,
        message,
        postResult: dealResult(result),
      });
      // return index > 1;
    }).then((result) => {
      console.log("result=====>", result);
      const tableData = getTableData(result);
      const { tHeader, filterVal } = getSortabledFields(
        config?.sortabledFields
      );

      console.log("tableData123123123", tableData);

      const newBolb = exportExcelFun({
        tHeader,
        filterVal,
        tableData: tableData,
      });

      console.log("newBolb13123", newBolb);
      // 将结果发送回主线程, 不能携带DOM，函数等
      self.postMessage({
        status: "request.success",
        message: `请求完毕【${result.length}/${result.length}】`,
        postResult: newBolb,
      });
    });
  } catch (err) {
    console.error(err.message || `batchExportExcelWorker.js执行失败`);
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

/**
 * @description: Worker 线程内部需要有一个监听函数，监听`message`事件。 工作线程接收到主线程的消息
 * @param {object} event event.data  获取到主线程发送过来的数据
 */
self.addEventListener(
  "message",
  async () => {
    // 向主线程发送消息
    // 发送消息
    const data = {
      test: "123134",
    };
    self.postMessage({ message: "success", data });
  },
  false
);
