/*
 * @Author: Null
 * @Date: 2022-10-24 15:04:36
 * @Description：请求模型
 */

// 请求约定非200码列表
const REQUEST_ERROR_CODE_LIST = {
  302: "接口重定向了",
  400: "无效的参数,请求错误",
  401: "您未登录，或者登录已经超时，或者被挤下线，请先登录",
  403: "拒绝访问",
  404: "请求地址出错",
  408: "请求超时",
  409: "系统已存在相同数据！",
  500: "服务器内部错误",
  501: "服务未实现",
  502: "系统正在更新，请稍后重试",
  503: "服务不可用",
  504: "服务暂时无法访问，请稍后再试",
  505: "HTTP版本不受支持",
};

// 基础模型
class BaseModel {
  constructor(data, message, status) {
    this.status = status;
    if (typeof data === "string") {
      this.data = null;
      this.message = data;
    } else {
      if (data) {
        this.data = data;
      } else {
        this.data = null;
      }
      if (message) {
        this.message = message;
      } else {
        this.message = "操作成功";
      }
    }
  }
}

// 基础分页模型
export class BasePageModel {
  constructor(pageData, message) {
    // 如果传递的data不是对象，是字符串，那么就把data给message
    const { pageSize, currentPage, total, data } = pageData;
    this.data = data;
    this.pageSize = pageSize;
    this.currentPage = currentPage;
    this.pages = Math.ceil(total / pageSize);
    this.total = total;

    if (message) {
      this.message = message;
    } else {
      this.message = "操作成功";
    }
  }
}

// 成功模型
export class SuccessModel extends BaseModel {
  constructor(options) {
    const { data, message, status } = options;
    super(data, message, status);
    this.code = 200;
  }
}

// 错误模型
export class ErrorModel extends BaseModel {
  constructor(options) {
    const { data, message, status, code } = options;
    super(data, message, status);
    this.code = code || 400;

    // 如果有特定传入的code
    if (code) {
      const codeArr = Object.keys(REQUEST_ERROR_CODE_LIST);
      if (!codeArr.includes(code)) {
        this.message = message
          ? message
          : REQUEST_ERROR_CODE_LIST[code] || "操作失败";
      } else {
        this.message = `错误码code【${code}】不符合格式，请检查`;
      }
    } else {
      if (message) {
        if (typeof message === "string") {
          this.message = message;
        } else {
          this.message = message.toString();
        }
      } else {
        this.message = "操作失败";
      }
    }
  }
}

// 成功分页模型
export class SuccessPageModel extends BasePageModel {
  constructor(data, message) {
    super(data, message);
    this.code = 200;
  }
}
