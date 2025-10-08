/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-04-16 11:40:20
 * @LastEditTime: 2025-04-16 19:59:53
 * @Description:
 */

import { request } from "@/utils";

export default {
  // 获取用户信息
  getUser: () => request.post("/user/getUserInfo"),
  // 刷新token
  refreshToken: () => request.get("/auth/refresh/token"),
  // 登出
  logout: () => request.post("/auth/logout", {}, { needTip: false }),
  // 切换当前角色
  switchCurrentRole: (role) =>
    request.post(`/auth/current-role/switch/${role}`),
  // 获取角色权限
  getRolePermissions: () => request.get("/role/permissions/tree"),
  // 验证菜单路径
  validateMenuPath: (path) =>
    request.get(`/permission/menu/validate?path=${path}`),

  // 文件上传
  uploadFile: (data) =>
    request.post("/api/file/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // 下载上传
  downloadFile: (data) => request.post("/api/file/download", data),

  // 下载上传
  downloadGetFile: (params) =>
    request.get("/api/file/download", {
      params,
    }),

  // 导出excel blob
  exportExcelBlob: (data) =>
    request.post("/api/excel/exportExcelBlob", data, {
      responseType: "blob",
    }),
};

// 上传url
export const UPLOAD_FILE_URL = `${import.meta.env.VITE_AXIOS_BASE_URL}/api/file/upload`;
