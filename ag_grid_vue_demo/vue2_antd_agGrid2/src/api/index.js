/*
 * @Author: junsong Chen
 * @Date: 2024-03-29 22:48:53
 * @Email: 779217162@qq.com
 * @LastEditors: junsong Chen
 * @LastEditTime: 2024-07-25 00:41:17
 * @Description:
 */
import http from "@/server/index.js";

// 注册
export function register(data) {
  return http.post("/admin/register", data).then((res) => res);
}

// 登录
export function login(data) {
  return http.post("/admin/login", data).then((res) => res);
}

// 获取图形验证码
export function getSendSvgCaptcha() {
  return http.get("/admin/sendSvgCaptcha").then((res) => res);
}

// 发送邮箱验证码
export function sendEMailCode(data) {
  return http.post("/admin/sendEMailCode", data).then((res) => res);
}

// 发送邮箱验证码重置密码
export function resetPwdByEmail(data) {
  return http.post("/admin/resetPwdByEmail", data).then((res) => res);
}

// 导出excel文件流
export function exportExcelBolb(data) {
  return http.post("/api/excel/exportExcelBolb", data, { responseType: 'blob' }).then((res) => res);
}

// 获取用户信息
export function getUserInfo(data) {
  return http.get("/api/user/getUserInfo", data).then((res) => res);
}

// 获取用户信息列表
export function getUserInfoList(data) {
  return http.post("/api/user/list", data).then((res) => res);
}

// 修改用户密码
export function resetUserPwd(data) {
  return http.post("/api/user/resetUserPwd", data).then((res) => res);
}

// 新增用户信息
export function addUser(data) {
  return http.post("/api/user/create", data).then((res) => res);
}

// 编辑用户信息
export function editUser(data) {
  return http.post("/api/user/edit", data).then((res) => res);
}

// 删除单个用户信息
export function delUserInfo(id) {
  return http.delete(`/api/user/${id}`).then((res) => res);
}

// 批量删除用户信息
export function batchDelUserInfo(data) {
  return http.post(`/api/user/batchDel`, data).then((res) => res);
}

// 批量编辑用户状态
export function batchEditUserState(data) {
  return http.post(`/api/user/batchEditUserState`, data).then((res) => res);
}

// 表格配置列表
export function listSetList(data) {
  return http.post("/api/userTableConfig/list", data).then((res) => res);
}

// 新增表格配置
export function listSetAdd(data) {
  return http.post("/api/userTableConfig/create", data).then((res) => res);
}

// 编辑表格配置
export function listSetEdit(data) {
  return http.post("/api/userTableConfig/edit", data).then((res) => res);
}

// 订单列表
export function getOrderList(data) {
  return http.post("/api/order/list", data).then((res) => res);
}

// 删除订单
export function batchDelOrder(data) {
  return http.post("/api/order/batchDel", data).then((res) => res);
}

// 字典码
export function getMultiDictItems(ids) {
  return http.get(`/api/dictionary/batchGet?ids=${ids}`).then((res) => res);
}

// 获取字典列表
export function getDictList(data) {
  return http.post("/api/dictionary/list", data).then((res) => res);
}

// 新增字典
export function addDict(data) {
  return http.post("/api/dictionary/create", data).then((res) => res);
}

// 编辑字典
export function editDict(data) {
  return http.post("/api/dictionary/edit", data).then((res) => res);
}

// 删除字典
export function batchDelDict(data) {
  return http.post('/api/dictionary/batchDel', data).then((res) => res);
}

// 查看字典详情
export function getDictDetail(id) {
  return http.get(`/api/dictionary/${id}`).then((res) => res);
}

// 更改字典状态
export function batchEditdDicState(data) {
  return http.post("/api/dictionary/batchEditdDicState", data).then((res) => res);
}

// 获取电子围栏列表
export function getElectronicFenceList(data) {
  return http.post("/api/electronicFence/list", data).then((res) => res);
}

// 新增电子围栏
export function addElectronicFence(data) {
  return http.post("/api/electronicFence/create", data).then((res) => res);
}

// 编辑电子围栏
export function editElectronicFence(data) {
  return http.post("/api/electronicFence/edit", data).then((res) => res);
}

// 删除围栏列表
export function delElectronicFence(id) {
  return http.delete("/api/electronicFence/del?id=" + id).then((res) => res);
}

// 批量删除围栏列表
export function batchDelElectronicFence(data) {
  return http.post("/api/electronicFence/batchDel", data).then((res) => res);
}

// 获取电子围栏详情
export function getElectronicFenceDetail(id) {
  return http.get(`/api/order/${id}`).then((res) => res);
}
