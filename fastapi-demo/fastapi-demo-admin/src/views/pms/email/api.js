/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-04-16 11:40:21
 * @LastEditTime: 2025-06-20 14:07:26
 * @Description:
 */

import { request } from '@/utils'

export default {
  create: data => request.post('/email/add', data),
  read: (params = {}) => request.get('/email/list', { params }),
  getSendEmailList: () => request.get('/email/send_email_list'),
  update: data => request.post(`/email/edit`, data),
  delete: id => request.delete(`/email/${id}`),
}
