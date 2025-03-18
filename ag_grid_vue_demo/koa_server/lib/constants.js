/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-26 16:01:38
 * @LastEditTime: 2023-11-30 14:18:41
 * @Description:
 */
// 信息码分类列表
const IC_ClASSIFY_LIST = {
  preLoginVerifyCode: "预登录验证码",
  loginingVerifyCode: "登录中验证码",
  resetPwd: "重置密码",
  emailRemind: "邮件提醒",
};

// 信息码类型列表
const IC_TYPE_LIST = {
  qrCode: "二维码",
  email: "邮箱",
  phoneNumber: "手机号",
  token: "用户token",
};

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

// 数据库名称列表
const EXPORT_EXCEL_DB_NAME_LIST = {
  '用户表':'user',
  '计划表':'plan',
  '任务表':'task',
  '名言表':'well_konwn_saying',
}

module.exports = {
  IC_ClASSIFY_LIST,
  IC_TYPE_LIST,
  REQUEST_ERROR_CODE_LIST,
  EXPORT_EXCEL_DB_NAME_LIST
};
