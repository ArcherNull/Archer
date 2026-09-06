import { defineStore } from 'pinia'
import storage from '@/utils/storage/index'
import api from '@api/index'

// 菜单栏折叠变量
export const userUserInfoStore = defineStore('userInfoStore', {
  state: () => ({
    userInfo: null // 用户惜
  }),
  actions: {
    // 登入
    async login(data) {
      // const userInfo = await api.login.login(data)
      const userInfo = await new Promise(resolve => {
        resolve({
          token: '13123',
          userName: '测试'
        })
      })
      if (userInfo?.token) {
        this.userInfo = userInfo
        storage.set('token', userInfo?.token)
        storage.set('userInfo', JSON.stringify(userInfo))
        return userInfo
      } else {
        return Promise.reject('未获取到token')
      }
    },
    // 登出
    async logOut() {
      const userInfo = storage.get('userInfo')
      console.log('userInfo=====>', userInfo)

      userInfo?.id &&
        (await api.login.logOut({
          id: userInfo.id
        }))
      this.userInfo = null
      storage.clear()
    }
  }
})
