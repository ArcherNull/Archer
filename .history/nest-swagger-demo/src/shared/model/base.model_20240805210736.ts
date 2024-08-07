/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-11-24 19:23:43
 * @LastEditTime: 2024-08-05 15:15:36
 * @Description: 响应模型
 */
import { isEmpty, isString, isArray, isObject } from 'lodash';
import { CusHttpCode } from '@/shared/constants/error.constants';

export interface IResponse {
  data: string | Record<string, any>;
  code?: number;
  message?: string;
  extParams?: unknown;
  [key: string]: any;
}

type ResDataType = {
  [key: string]: any;
};

class BaseModel {
  data: any;
  message: string;
  accessToken?: string;
  constructor(data: ResDataType | any, message?: string) {
    if (isString(data)) {
      this.data = null;
      this.message = data;
    } else {
      if (isEmpty(data)) {
        this.data = null;
      } else {
        if (isArray(data)) {
          this.data = data;
        } else if (isObject(data)) {
          const { accessToken, ...restObj } = data as ResDataType;
          this.data = isEmpty(restObj) ? null : restObj;
          if (accessToken) {
            this.accessToken = accessToken;
          }
        }
      }
      this.message = message || CusHttpCode.Success.MESSAGE;
    }
  }
}

// 成功基础模型
export class SuccessModel extends BaseModel {
  code: number;
  constructor(data: any, message?: string) {
    super(data, message);
    this.code = CusHttpCode.Success.CODE;
  }
}

// 失败基础模型
export class ErrorModel extends BaseModel {
  code: number;
  constructor(data: any, message: string = CusHttpCode.BadRequest.MESSAGE) {
    super(data, message);
    this.code = CusHttpCode.BadRequest.CODE;
  }
}

// 根据code返回失败基础模型
export class ErrorByCodeModel extends BaseModel {
  code: number;
  constructor(code: number, data: any = null) {
    super(data);
    if (CusHttpCode.HasCode(code)) {
      this.code = code;
      this.message = CusHttpCode[code].MESSAGE;
    } else {
      this.code = CusHttpCode.BadRequest.CODE;
      this.message = CusHttpCode.BadRequest.MESSAGE;
    }
  }
}

interface IPageData {
  data: any;
  pageSize: number;
  currentPage: number;
  total: number;
  accessToken?: string;
}

// 基础分页模型
export class BasePageModel {
  data: any;
  pageSize: number;
  currentPage: number;
  total: number;
  message: string;
  accessToken?: string;
  constructor(pageData: IPageData, message?: string) {
    // 如果传递的data不是对象，是字符串，那么就把data给message
    const { pageSize, currentPage, total, data, accessToken } = pageData;
    this.data = data;
    this.pageSize = pageSize;
    this.currentPage = currentPage;
    this.total = total;
    this.message = message || '操作成功';

    if (accessToken) {
      this.accessToken = accessToken;
    }
  }
}

// 成功分页模型
export class SuccessPageModel extends BasePageModel {
  code: number;
  constructor(data: IPageData, message?: string) {
    super(data, message);
    this.code = CusHttpCode.Success.CODE;
  }
}
