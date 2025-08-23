/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:29:51
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from "@/utils";

export default {
  create: (data = {}) => request.post("/work_order/add", data),
  read: (params = {}) => request.get("/work_order/list", { params }),
  update: (data = {}) => request.post(`/work_order/edit`, data),
  delete: (id) => request.delete(`/work_order/${id}`),

  get_available_process: () => request.get(`/process_setting/available`),
  get_work_order_process: (params = {}) =>
    request.get(`/work_order/process`, { params }),
  approval_process_node: (data = {}) =>
    request.post(`/process_node/approval`, data),
  get_work_order_approval_process: (params = {}) =>
    request.get(`/work_order/approval_process`, { params }),
};
