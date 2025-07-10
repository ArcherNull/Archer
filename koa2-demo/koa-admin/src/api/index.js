/*
 * @Author: Null
 * @Date: 2022-08-24 11:58:55
 * @Description: api 入口文件
 */

import publicApi from './public/index'
import login from './modules/login/index'
import user from './modules/user/index'

export default {
  publicApi,
  login,
  user
}
