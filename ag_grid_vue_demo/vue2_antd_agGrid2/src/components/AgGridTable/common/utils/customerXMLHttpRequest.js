/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-06-03 11:54:34
 * @LastEditTime: 2024-06-04 13:58:21
 * @Description: 因为web worker 只能使用XMLHttpRequest方式请求接口，所以需要对此封装
 */
import * as storage from "@/utils/storage";

// 请求方式
const REQUEST_METHODS_LIST = ["GET", "POST", "PUT", "DELETE"];

// 请求Content-Type 类型
// const REQUEST_CONTENT_TYPE_LIST = [
//   "application/x-www-form-urlencoded",
//   "application/json",
//   "multipart/form-data",
//   "application/xml",
//   "text/plain",
//   "text/html",
// ];

export class CustomerXMLHttpRequest extends XMLHttpRequest {
  // 默认超时时间为30s
  static DEFAULT_TIME_OUT = 30 * 1000;
  // 默认content-type
  static DEFAULT_CONTENT_TYPE = "application/json";
  // 域名
  _domainUrl = "";
  // 基础域名
  _baseURL = "";
  // 请求链接
  _url = "";
  // 头部
  _headers = {
    "Content-Type": CustomerXMLHttpRequest.DEFAULT_CONTENT_TYPE,
  };
  // 超时时间
  _timeout = CustomerXMLHttpRequest.DEFAULT_TIME_OUT;

  constructor(config) {
    super();
    this.init(config);
  }

  // 初始化函数
  init(config) {
    console.log("初始化函数", config);
    const {
      domainUrl,
      baseURL = "",
      timeout = CustomerXMLHttpRequest.DEFAULT_TIME_OUT,
      headers,
    } = config;
    if (domainUrl) {
      // 域名
      this._domainUrl = domainUrl;
      // 基础域名
      this._baseURL = baseURL;
      // 超时时间
      this._timeout = timeout;
      // 请求链接
      this._url = domainUrl + baseURL;
      // 设置自定义头部
      if (this.isNotEmptyObj(headers)) {
        const newHeaders = Object.assign(this._headers, headers);
        this._headers = newHeaders;
      }
    } else {
      throw new Error("参数【domainUrl】是必要参数");
    }
  }

  // 请求前拦截
  setRequestInterceptors(config) {
    const Authorization = storage.getStorage("token");
    if (Authorization) {
      config.headers["Authorization"] = `Bearer ${Authorization}`;
    }

    return config;
  }

  // 发送请求
  request(config) {
    console.log("发送请求", config);
    return new Promise((resolve, reject) => {
      try {
        // 请求前拦截器
        const newConfig = config; // this.setRequestInterceptors(config);

        console.log("newConfig123123123", newConfig);

        const {
          url: apiUrl,
          method = "get",
          data,
          params,
          headers,
        } = newConfig;
        console.log("发起请求");
        const methodUpper = method?.toUpperCase();
        if (REQUEST_METHODS_LIST.includes(methodUpper)) {
          let url = this._url + apiUrl;
          this.open(methodUpper, url, true);
          // 设置请求超时时间
          this.timeout = this._timeout;

          // 设置自定义头部
          if (this.isNotEmptyObj(headers)) {
            console.log("设置自定义头部", headers);
            const newHeaders = Object.assign(this._headers, headers);
            this.setReqHeaderByObj(newHeaders);
          }

          if (methodUpper === "GET") {
            if (params) {
              let paramsStr = "";
              if (this.isNotEmptyObj(params)) {
                paramsStr = this.getUrlParamsStr(params);
              } else {
                paramsStr = params;
              }
              url += `?${paramsStr}`;
            }
          } else if (methodUpper === "POST") {
            if (typeof data === "string") {
              // 设置对应的content-type
              this.setRequestHeader(
                "Content-Type",
                "application/x-www-form-urlencoded"
              );
              this.send(data);
            } else if (typeof data === "object") {
              if (data instanceof FormData) {
                this.setRequestHeader("Content-Type", "multipart/form-data");
                this.send(data);
              } else {
                const str = JSON.stringify(data);
                this.send(str);
              }
            }
          } else {
            this.send();
          }

          // 请求状态更改
          this.onreadystatechange = function () {
            if (this.readyState === 4) {
              if (this.status === 200) {
                let resData = JSON.parse(this.responseText);
                console.log("resData123123123", resData);
                if (resData.code === 200) {
                  resolve(resData);
                } else {
                  reject({
                    status: this.status,
                    ...resData,
                    message: resData?.message || "请求失败",
                  });
                }
              } else {
                reject({
                  status: this.status,
                  code: 500,
                  data: null,
                  message: "请求出错",
                });
              }
            }
          };
        } else {
          throw new Error(
            `参数【method】不满足【${REQUEST_METHODS_LIST.join("/")}】其中之一`
          );
        }
      } catch (err) {
        reject(err?.message || "请求出错");
      }
    });
  }

  // 非空数组
  isNotEmptyArr(arr) {
    return Array.isArray(arr) && arr.length;
  }

  // 非空对象
  isNotEmptyObj(obj) {
    return obj && typeof obj === "object" && Object.keys(obj)?.length;
  }

  /**
   * @description: 将对象装换为url params 字符串
   * @param {*} paramsObj
   * @return {*}
   */
  getUrlParamsStr(paramsObj) {
    if (typeof paramsObj === "object") {
      return Object.entries(paramsObj)
        .map((ele) => `${ele[0]}=${ele[1]}`)
        .join("&");
    } else {
      return "";
    }
  }

  // 通过对象设置请求头部
  setReqHeaderByObj(obj) {
    if (this.isNotEmptyObj(obj)) {
      Object.entries(obj).forEach((ele) => {
        this.setRequestHeader(ele[0], ele[1]);
      });
    }
  }

  // 中断请求
  abortReq() {
    this.abort();
  }

  // 请求后拦截

  // 超时请求处理

  // 异常请求处理

  // 中断请求处理
}

export function ajax({ url, type, data = "", success }) {
  // 创建一个XMLHttpRequest对象
  const xhr = new XMLHttpRequest();
  // 判断type请求方式
  if (type === "get") {
    // 判断data的数据类型转换成字符串
    if (typeof data === "object") {
      data = new URLSearchParams(data).toString();
    }
    // 设置请求方式和请求地址
    xhr.open(type, url + "?" + data);
    // 发送请求
    xhr.send();
  } else if (type === "post") {
    // 设置请求方式和请求地址
    xhr.open(type, url);
    // 判断数据是不是字符串
    if (typeof data === "string") {
      // 设置对应的content-type
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.send(data);
    } else if (typeof data === "object") {
      if (data instanceof FormData) {
        xhr.send(data);
      } else {
        xhr.setRequestHeader("Content-type", "application/json");
        const str = JSON.stringify(data);
        console.log(typeof str);
        xhr.send(str);
      }
    }
  }
  // 监听load 获取响应结果
  xhr.addEventListener("load", function () {
    // 把json格式的数据转换成对象
    const obj = JSON.parse(this.response);
    // 就是返回结果
    success(obj);
  });
}
