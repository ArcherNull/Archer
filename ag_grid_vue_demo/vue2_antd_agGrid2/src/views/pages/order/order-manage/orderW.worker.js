/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-31 10:19:02
 * @LastEditTime: 2024-06-06 17:19:49
 * @Description:
 */
import {
  RequestItem,
  BatchRequest,
} from "@/components/AgGridTable/common/utils/batchRequest";

// import { exportExcelBySortFieldAndTableData } from "@/components/AgGridTable/common/utils/exportExcel.js";

// import { SuccessModel } from "@/components/AgGridTable/common/utils/exceptions.js";

/**
 * @description: 此方法用于所有接口全部请求完毕后，一起返回
 * @param {*} config
 * @return {*}
 */
// async function batchRequestFun(config, callback) {
//   console.log("config123123123", config);
//   const { requestParams, pageParams } = config.pageOptions;
//   const { maxNum } = config.requestOptions;
//   const { data, ...queryParams } = requestParams;
//   const { pageNum, pageSize, ...resetDataObj } = data;
//   const { totalPage } = pageParams;
//   const ajaxLists = [];

//   callback(
//     new SuccessModel({
//       message: "任务拼装进行中",
//       status: "config.processing",
//     })
//   );

//   for (let i = pageNum; i <= totalPage; i++) {
//     const newRequestItem = new RequestItem({
//       reqParams: {
//         id: i,
//         ...queryParams,
//         data: {
//           pageSize,
//           pageNum,
//           ...resetDataObj,
//         },
//       },
//       // 校验请求参数方法
//       validateReqParamsFun: (params) => {
//         if (!params?.url) {
//           return "请求ajaxItem不能为空";
//         }
//         const methodVal = params?.method;
//         if (methodVal) {
//           const methodArr = ["GET", "POST"];
//           if (!methodArr.includes(methodVal.toUpperCase()))
//             return `请求方式不满足【${methodArr.join("/")}】其中之一`;
//         }
//       },
//       // 处理res响应
//       dealResFun: (res) => {
//         const resObj = {
//           status: RequestItem.REQ_FAIL_STATUS,
//           response: null,
//         };
//         if (res?.code === 200) {
//           resObj.status = RequestItem.REQ_SUCCESS_STATUS;
//           resObj.response = res?.data;
//         } else if (res?.code === 500) {
//           resObj.status = RequestItem.REQ_FAIL_STATUS;
//           resObj.response = res?.data;
//         }
//         return resObj;
//       },
//     });
//     ajaxLists.push(newRequestItem);
//   }

//   callback(
//     new SuccessModel({
//       message: "任务拼装完毕",
//       status: "config.success",
//     })
//   );

//   const newBatchRequest = new BatchRequest({
//     ajaxLists,
//     maxNum,
//     callback,
//   });

//   callback(
//     new SuccessModel({
//       message: "请求进行中",
//       status: "request.processing",
//     })
//   );

//   // 第一种方式，请求所有
//   const results = await newBatchRequest.concurRequest();
//   return results;
// }

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
  console.log("batchExportExcelWorker.js中配置参数=====>", ele);

  try {
    // const config = ele.data;
    // const dealResult = (result) => {
    //   const postResult = result.map((ele) => {
    //     return {
    //       reqParams: ele.reqParams,
    //       reqStatus: ele.reqStatus,
    //       response: ele.response,
    //       responseMsg: ele.responseMsg,
    //     };
    //   });
    //   return postResult;
    // };
    // // 获取到阶段性数据
    // batchRequestFun(config, (ele) => {
    //   console.log("回调函数", ele);
    //   // return index > 1;
    // }).then((result) => {
    //   console.log("result=====>", result);
    //   if (config.requestOptions.responseType === "file") {
    //     const tableData = getTableData(result);
    //     const newBolb = exportExcelBySortFieldAndTableData(
    //       tableData,
    //       config?.sortabledFields
    //     );
    //     self.postMessage(
    //       new SuccessModel({
    //         status: "request.success",
    //         message: `请求完毕【${result.length}/${result.length}】,文件导出中...`,
    //         data: newBolb,
    //       })
    //     );
    //   } else {
    //     self.postMessage(
    //       new SuccessModel({
    //         status: "request.success",
    //         message: `请求完毕【${result.length}/${result.length}】,数据加载中...`,
    //         data: result,
    //       })
    //     );
    //   }
    // });
  } catch (err) {
    // self.postMessage(
    //   new SuccessModel({
    //     status: "config.failed",
    //     message: `orderWorker.js线程执行失败，${err.message || ""}`,
    //   })
    // );
  }
};
