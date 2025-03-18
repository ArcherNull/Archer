/*
 * @Author: Null
 * @Date: 2022-10-24 15:04:36
 * @Description：请求模型
 */

const { REQUEST_ERROR_CODE_LIST } = require("../lib/constants.js");
// 基础模型
class BaseModel {
  constructor(data, message) {
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
class BasePageModel {
  constructor(pageData, message) {
    // 如果传递的data不是对象，是字符串，那么就把data给message
    const { pageSize, pageNum, total, data } = pageData;
    this.data = data;
    this.pageSize = pageSize;
    this.pageNum = pageNum;
    this.pages = Math.ceil(total / pageSize)
    this.total = total;

    if (message) {
      this.message = message;
    } else {
      this.message = "操作成功";
    }
  }
}

// 成功模型
class SuccessModel extends BaseModel {
  constructor(data, message) {
    super(data, message);
    this.code = 200;
  }
}

// 错误模型
class ErrorModel extends BaseModel {
  constructor(message, code) {
    super(message);
    this.code = code || 400;

    // 如果有特定传入的code
    if (code) {
      const codeArr = Object.keys(REQUEST_ERROR_CODE_LIST);
      if (!codeArr.includes(code)) {
        this.message = message ? message : (REQUEST_ERROR_CODE_LIST[code] ||
        "操作失败")
      } else {
        this.message = `错误码code【${code}】不符合格式，请检查`
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
class SuccessPageModel extends BasePageModel {
  constructor(data, message) {
    super(data, message);
    this.code = 200;
  }
}

module.exports = {
  SuccessModel,
  ErrorModel,
  SuccessPageModel,
};
