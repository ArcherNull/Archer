/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-04-16 11:40:21
 * @LastEditTime: 2025-04-18 15:01:44
 * @Description:
 */

import { request } from "@/utils";

export default {
  create: (data) => request.post("/user/add", data),
  read: (params = {}) => request.get("/user/list", { params }),
  update: (data) => request.post(`/user/edit`, data),
  delete: (id) => request.delete(`/user/${id}`),
  resetPwd: (id, data) => request.post(`/user/password/reset/${id}`, data),
};
