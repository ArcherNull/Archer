/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-04-16 11:40:21
 * @LastEditTime: 2025-04-21 11:28:31
 * @Description:
 */

import { request } from "@/utils";

export default {
  toggleRole: (data) => request.post("/auth/role/toggle", data),
  login: (data) => request.post("/auth/login", data, { needToken: false }),
  getUser: () => request.post("/user/getUserInfo"),
  getCaptchaUrl: (params) => request.get("/auth/captcha", { params }),
};
