/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-11-20 08:50:27
 * @LastEditTime: 2024-08-05 15:20:54
 * @Description: 用于http的status的语言处理
 */
class Type {
  CODE: number;
  MESSAGE: string;
}

export class CusHttpCode {
  static readonly Success: Type = { CODE: 200, MESSAGE: '操作成功' };

  static readonly Found: Type = {
    CODE: 302,
    MESSAGE: '接口重定向了',
  };

  static readonly BadRequest: Type = {
    CODE: 400,
    MESSAGE: '操作失败',
  };

  static readonly Unauthorized: Type = {
    CODE: 401,
    MESSAGE: '您未登录，或者登录已经超时，或者被挤下线，请先登录',
  };

  static readonly Forbidden: Type = {
    CODE: 403,
    MESSAGE: '没有权限执行此操作',
  };

  static readonly NotFound: Type = { CODE: 404, MESSAGE: '找不到请求的资源' };

  static readonly RequestTimeout: Type = {
    CODE: 408,
    MESSAGE: '请求超时',
  };

  static readonly Conflict: Type = {
    CODE: 409,
    MESSAGE: '系统已存在相同数据',
  };

  static readonly InternalServerError: Type = {
    CODE: 500,
    MESSAGE: '服务器内部错误',
  };

  static readonly NotImplemented: Type = {
    CODE: 501,
    MESSAGE: '服务未实现',
  };

  static readonly BadGateway: Type = {
    CODE: 502,
    MESSAGE: '系统正在更新，请稍后重试',
  };

  static readonly ServiceUnavailable: Type = {
    CODE: 503,
    MESSAGE: '服务不可用',
  };

  static readonly GatewayTimeout: Type = {
    CODE: 504,
    MESSAGE: '服务暂时无法访问，请稍后再试',
  };

  static readonly HttpVersionNotSupported: Type = {
    CODE: 505,
    MESSAGE: 'HTTP版本不受支持',
  };

  // 自定义响应码转对应的提示信息
  static CodeToMessage(code: number): string {
    for (const key of Object.keys(this)) {
      return this[key].CODE === code ? this[key].MESSAGE : '';
    }
  }

  // 检查是否存在对应的响应码
  static HasCode(code: number): boolean {
    const valuesArr = Object.values(this);
    const findItem = valuesArr.find((ele) => ele.CODE === code);
    return Boolean(findItem);
  }

  // 检查是否存在对应的响应码
  static FindCode(code: number): Type | undefined {
    const valuesArr = Object.values(this);
    const findItem = valuesArr.find((ele) => ele.CODE === code);
    return findItem;
  }
}
