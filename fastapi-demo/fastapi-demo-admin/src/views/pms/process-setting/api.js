/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-04-16 15:58:46
 * @LastEditTime: 2025-04-19 21:35:23
 * @Description:
 */

import { request } from "@/utils";

export default {
  create: (data) => request.post("/process_setting/createOrEdit", data),
  read: (params = {}) => request.get("/process_setting/list", { params }),
  update: (data) => request.post(`/process_setting/createOrEdit`, data),
  edit_process_state: (data) => request.post(`/process_setting/edit_process_state`, data),
  
  delete: (id) => request.post(`/process_setting/soft_del`, { ids: `${id}` }),
  get_process_node_by_id: (id) =>
    request.get(`/process_setting/process_node/${id}`),
  del_process_node: (ids) =>
    request.post(`/process_node/soft_del`, { ids: `${ids}` }),

  get_approval_user: () =>
    request.get("/user/list", { params: { role: "审核员", state: 1 } }),
};
