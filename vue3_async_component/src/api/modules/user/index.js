/*
 * @Author: Null
 * @Date: 2022-08-26 11:55:23
 * @Description:  用户接口
 */

const user = {
    // 用户信息
    getUserInfo: (params) => http.get('/api/user/getUserInfo', params),

    // 获取用户信息列表
    getUserList: (params) => http.post('/api/user/list', params),

    // 修改用户密码
    resetUserPwd: (params) => http.post('/api/user/resetUserPwd', params),

    // 新增用户信息
    addUser: (params) => http.post('/api/user/create', params),

    // 编辑用户信息
    editUser: (params) => http.post('/api/user/edit', params),

    // 删除单个用户信息
    delUser: (id) => http.delete(`/api/user/${id}`),

    // 批量删除用户信息
    batchDelUser: (params) => http.delete(`/api/user/batchDel`, params),

    // 批量编辑用户状态
    batchEditUserState: (params) => http.delete(`/api/user/batchEditUserState`, params),

    // 表格配置列表
    listSetList: (params) => http.post(`/api/userTableConfig/list`, params),

    // 新增表格配置
    listSetAdd: (params) => http.post(`/api/userTableConfig/create`, params),

    // 编辑表格配置
    listSetEdit: (params) => http.post(`/api/userTableConfig/edit`, params),
}

export default user
