/*
 * @Author: junsong Chen
 * @Date: 2024-03-29 23:05:55
 * @Email: 779217162@qq.com
 * @LastEditors: junsong Chen
 * @LastEditTime: 2024-03-29 23:16:43
 * @Description: 
 */
import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user
  },
  getters
})
