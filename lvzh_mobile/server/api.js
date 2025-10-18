import {
    request
} from './request.js'

const apis = {
    // 登录 --  登录页面
    login: (data) => {
        return request('login', data, 'POST').then(res => res)
    },
    // 我的 --  获取用户信息
    getUserInfo: () => {
        return request('getUserInfo').then(res => res)
    }
}

export default apis