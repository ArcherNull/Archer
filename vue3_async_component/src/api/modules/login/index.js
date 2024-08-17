/*
 * @Author: Null
 * @Date: 2022-08-26 11:55:14
 * @Description:  登录api
 */
import http from '@server/index.js'

const login = {
  // 获取用户列表
  login: data => http.post('/admin/login', data).then(res => res),

  // 注册
  register: (params) => http.post('/admin/register', params).then(res => res),

  // 发送邮箱验证码
  sendEMailCode: (params) => http.post('/admin/sendEMailCode', params).then(res => res),

  // 发送邮箱验证码重置密码
  resetPwdByEmail: (params) => http.post('/admin/resetPwdByEmail', params).then(res => res),

  // 登出接口
  logOut: data => http.post('/admin/logOut', data).then(res => res)
}

export default login
