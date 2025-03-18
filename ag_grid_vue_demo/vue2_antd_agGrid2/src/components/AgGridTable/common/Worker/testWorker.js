/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-31 10:19:02
 * @LastEditTime: 2024-05-31 10:56:27
 * @Description:
 */
import { RequestItem, BatchRequest } from "../utils/batchRequest";

async function batchRequestFun(config) {
  const { totalPage, pageNum, pageSize } = config;
  const ajaxLists = [];
  for (let i = pageNum; i < totalPage; i++) {
    const newRequestItem = new RequestItem({
      reqParams: {
        id: i + 1,
        url: "/api/order/list",
        method: "post",
        data: {
          pageSize,
          pageNum: i + 1,
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

  const newBatchRequest = new BatchRequest(ajaxLists, 3);

  // 第一种方式，请求所有
  const results = await newBatchRequest.concurRequest();
  return results;

  // 第二种方式，中断请求
  //   newBatchRequest.concurRequest().then((results) => {
  //     console.log("results123123123123132", results);
  //     return results;
  //   });

  //   setTimeout(() => {
  //     // 终止
  //     newBatchRequest.stopRequest();
  //     console.log("newBatchRequest.requestList", newBatchRequest.requestList);
  //     //   console.log("newBatchRequest._index", newBatchRequest._index);
  //     //   console.log("newBatchRequest._count", newBatchRequest._count);
  //     //   console.log("newBatchRequest._results", newBatchRequest._results);

  //     setTimeout(() => {
  //       // 重新请求
  //       // newBatchRequest.replayRequest();
  //       // 继续请求
  //       newBatchRequest.continueRequest();
  //     }, 1500);
  //   }, 3500);
}

// Web Workers的部分代码（在Workers中计算两个数的和）
self.onmessage = async function (ele) {
  try {
    const config = ele.data[0]
    console.log("batchExportExcelWorker.js中配置参数=====>", config);
    const { total, pageNum, pageSize } = config
    const totalPage = Math.ceil(total / pageSize);

    console.log("pageNum", pageNum);
    console.log("totalPage", totalPage);

    const realTotalPage = totalPage - pageNum;

    console.log("realTotalPage", realTotalPage);

    const result = await batchRequestFun({
      totalPage: realTotalPage,
      pageNum,
      pageSize,
    });
    console.log("result=====>", result);

    // 将结果发送回主线程
    self.postMessage(result);
  } catch (err) {
    console.error(err.message || `batchExportExcelWorker.js执行失败`);
  }
};
