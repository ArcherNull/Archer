/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-23 16:19:43
 * @LastEditTime: 2024-07-24 00:21:40
 * @Description: 批量请求列表
 *
 * 此方法可用于处理高并发请求，也可以用于处理高并发耗时业务逻辑处理
 *
 * 配合着web worker食用，味道更佳
 *
 */
import { CustomerXMLHttpRequest } from "./customerXMLHttpRequest.js";
import { SuccessModel } from "@/components/AgGridTable/common/utils/exceptions";

// 是否是函数
function isFunction(func) {
  return func && typeof func === "function";
}

// 请求项类
export class RequestItem {
  // 请求成功状态
  static REQ_SUCCESS_PENDDING = "pendding";
  // 请求成功状态
  static REQ_SUCCESS_STATUS = "success";
  // 请求失败状态
  static REQ_FAIL_STATUS = "fail";
  // 请求中断状态
  static REQ_BROKEN_STATUS = "broken";

  constructor(config) {
    this.init(config);
  }

  // 初始化方法
  init(config) {
    // reqParams 请求入参 ； reqStatus 请求状态 ， 成功 success , 失败 fail , 中断 break ； response 数据响应 ; responseMsg 数据响应消息
    const { reqParams, validateReqParamsFun, dealResFun } = config;
    this.reqParams = reqParams;
    this.reqStatus = RequestItem.REQ_SUCCESS_PENDDING;
    this.response = null;
    this.responseMsg = "";

    if (isFunction(validateReqParamsFun)) {
      const msg = validateReqParamsFun(reqParams);
      msg && this.setReqBrokenStatus(`validateReqParamsFun===>${msg}`);
    }

    if (isFunction(dealResFun)) {
      this.dealResFun = dealResFun;
    }
  }

  // 设置中断请求状态
  setReqBrokenStatus(msg) {
    this.reqStatus = RequestItem.REQ_BROKEN_STATUS;
    this.response = null;
    this.responseMsg = "主动中断请求" + (msg ? `,【${msg}】` : "");
    this.dealResFun = null;
  }

  // 设置失败请求状态
  setReqFailStatus(res = null) {
    this.reqStatus = RequestItem.REQ_FAIL_STATUS;
    this.response = res;
    this.responseMsg = "请求失败";
  }

  // 设置成功请求状态
  setReqSuccessStatus(res = null) {
    this.reqStatus = RequestItem.REQ_SUCCESS_STATUS;
    this.response = res;
    this.responseMsg = "请求成功";
  }

  // 设置响应
  setResponse(res) {
    try {
      if (this.dealResFun) {
        const { status, response } = this.dealResFun(res);
        if (status === RequestItem.REQ_FAIL_STATUS) {
          this.setReqFailStatus(response);
        } else if (status === RequestItem.REQ_SUCCESS_STATUS) {
          this.setReqSuccessStatus(response);
        }
      }
    } catch (err) {
      this.setReqFailStatus(err);
    }
  }

  // 重新发起已失败请求
  reFailedRequest() { }
}

// 批量请求类
export class BatchRequest {
  // 请求结果集
  _results = [];
  // 下一个发送请求的下标
  _index = 0;
  // 请求完成数量
  _count = 0;

  constructor(config) {
    this.init(config);
  }

  init(config) {
    const { ajaxLists, maxNum, callback: resCallback } = config;
    // 请求列表
    this.requestList = ajaxLists;
    // 合并请求最大数量
    this.mergeRequestMaxNum = maxNum;
    // 终止请求
    this.isBrokenRequest = false;

    // 监听回调
    if (isFunction(resCallback)) {
      this.resCallback = resCallback;
    }
  }

  concurRequest() {
    const that = this;
    return new Promise((resolve) => {
      const ajaxLists = that.requestList;
      const maxNum = that.mergeRequestMaxNum;

      // 如果ajaxLists长度为空
      if (!this.isNotEmptyArr(ajaxLists)) {
        resolve([]);
        return;
      }

      async function request() {
        // 如果当前请求下标超出ajaxLists的长度则返回
        if (that._index === ajaxLists.length) {
          return;
        }
        // 中断请求开关
        if (that.isBrokenRequest) {
          return;
        }

        // 记录本次请求的下标
        const i = that._index;
        // 更新index
        that._index++;

        try {
          // 当前请求的ajaxItem
          const ajaxItem = ajaxLists[i];
          if (ajaxItem) {
            // 如果是待处理状态
            if (ajaxItem.reqStatus === "pendding") {
              const resp = await requestAjax(ajaxItem.reqParams);
              ajaxItem.setResponse(resp);
              that._results[i] = ajaxItem;
            } else if (ajaxItem.reqStatus === "success") {
              that._results[i] = ajaxItem;
            } else {
              ajaxItem.setReqBrokenStatus(
                `当前请求状态为【${ajaxItem.reqStatus}】`
              );
              that._results[i] = ajaxItem;
              return;
            }
          }
          console.log(`执行第【${i + 1}】次请求=====>`);
          if (isFunction(that.resCallback)) {
            // 回调函数返回false则表示可以继续请求，返回true表示立即终止请求，中断请求的
            that.isBrokenRequest = that.resCallback(
              new SuccessModel({
                message: `请求进行中【${i + 1}/${ajaxLists.length}】`,
                data: {
                  index: i,
                  // worker线程传递给主线程不能带有类实例，所以需要过滤一下
                  result: that.dealResult(that._results),
                  requestList: that.dealResult(that.requestList),
                },
                status: "request.processing",
              })
            );

            console.log("that.isBrokenRequest ", that.isBrokenRequest);
          }
        } catch (err) {
          console.error("throw error", err);
          that.resCallback(
            new SuccessModel({
              message: `请求失败【${i + 1}/${ajaxLists.length}】，${err?.message
                }`,
              data: {
                index: i,
                requestList: that.requestList,
              },
              status: "request.failed",
            })
          );
          that.isBrokenRequest = false;
        } finally {
          that._count++;
          if (that._count === ajaxLists.length) {
            resolve(that._results);
            return;
          }
          request();
        }
      }

      const times = Math.min(maxNum, ajaxLists.length);

      for (let i = 0; i < times; i++) {
        // 中断请求开关，跳出循环
        if (that.isBrokenRequest) {
          resolve(that._results);
          break;
        } else {
          request();
        }
      }
    });
  }

  sleep(time = 1000) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  dealResult(result = []) {
    const postResult = result.map((ele) => {
      return {
        reqParams: ele.reqParams,
        reqStatus: ele.reqStatus,
        response: ele.response,
        responseMsg: ele.responseMsg,
      };
    });
    return postResult;
  }

  isNotEmptyArr(arr) {
    return Array.isArray(arr) && arr.length;
  }

  // 终止请求
  stopRequest() {
    console.log("终止请求");
    this.isBrokenRequest = true;
  }

  // 继续请求
  async continueRequest() {
    console.log("继续请求");
    this.isBrokenRequest = false;
    console.log("that._count", this._count);
    const result = await this.concurRequest();
    console.log("继续请求123", result);
    return result;
  }

  // 重新请求
  async replayRequest() {
    console.log("重新请求");
    this.isBrokenRequest = false;
    this.requestList = this.requestList.map((ele) => {
      ele.reqStatus = "pendding";
      return ele;
    });
    const result = await this.concurRequest();
    console.log("重新请求", result);
    return result;
  }
}

// 异步请求方法模拟
function requestAjax(params) {
  const cRequest = new CustomerXMLHttpRequest({
    domainUrl: process.env.VUE_APP_DOMAIN,
    baseURL: "/v1",
  });
  return cRequest.request(params);
}

// 执行的测试方法【用于测试示例】
/**
 * @description:
 * @return {*}
 * 分页接口 / 非分页接口
同一接口批量请求 / 不同接口批量请求
相同请求入参 / 非相同请求入参

针对同时一个分页接口进行分批请求

 *
 */

// async function testFun() {
//   const ajaxLists = [];
//   for (let i = 0; i < 20; i++) {
//     const newRequestItem = new RequestItem({
//       reqParams: {
//         id: i + 1,
//         url: "/test",
//         method: "get",
//         data: {
//           pageSize: 1000,
//           pageNum: i + 1,
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

//   const newBatchRequest = new BatchRequest(ajaxLists, 3);

//   //   // 第一种方式，请求所有
//   // const results = await newBatchRequest.concurRequest();
//   // console.log("results123123132", results);
//   // return results;

//   // 第二种方式，中断请求
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
// }

// testFun();
