/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-02 08:46:11
 * @LastEditTime: 2024-07-07 22:03:28
 * @Description: 用户表
 */
const { generateModulePrefix } = require("@lib/common");
const UserController = require("@db/controllers/user");
const getUrl = (url) => generateModulePrefix(url, "/user");

module.exports = (router) => {
  /**
   * @swagger
   * /api/user/list:
   *   post:
   *     description: 用户列表,带搜索
   *     summary: "用户列表"
   *     tags: [用户模块]
   *     parameters:
   *       - name: queryParams
   *         description: 搜索字段
   *         required: false
   *         in: query
   *         type: object
   *       - name: pageSize
   *         description: 页数
   *         required: false
   *         in: query
   *         type: number
   *       - name: pageNum
   *         description: 当前页
   *         required: false
   *         in: query
   *         type: number
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/list"), UserController.list);
  // 创建用户

  /**
   * @swagger
   * /api/user/create:
   *   post:
   *     description: 创建用户
   *     summary: "创建用户"
   *     tags: [用户模块]
   *     parameters:
   *       - name: userName
   *         description: 用户名/账号名
   *         required: false
   *         in: query
   *         type: string
   *       - name: userImg
   *         description: 用户头像
   *         required: false
   *         in: query
   *         type: string
   *       - name: sex
   *         description: 性别
   *         required: false
   *         in: query
   *         type: number
   *       - name: realName
   *         description: 真实姓名
   *         required: false
   *         in: query
   *         type: string
   *       - name: birthday
   *         description: 用户生日
   *         required: false
   *         in: query
   *         type: string
   *       - name: age
   *         description: 用户年龄
   *         required: false
   *         in: query
   *         type: string
   *       - name: idCardNo
   *         description: 身份证号
   *         required: false
   *         in: query
   *         type: string
   *       - name: phoneNumber
   *         description: 手机号
   *         required: false
   *         in: query
   *         type: string
   *       - name: email
   *         description: 邮箱
   *         required: false
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/create"), UserController.create);

  /**
   * @swagger
   * /api/user/edit:
   *   post:
   *     description: 编辑用户
   *     summary: "编辑用户"
   *     tags: [用户模块]
   *     parameters:
   *       - name: id
   *         description: 用户id
   *         required: false
   *         in: query
   *         type: string
   *       - name: userName
   *         description: 用户名/账号名
   *         required: false
   *         in: query
   *         type: string
   *       - name: userImg
   *         description: 用户头像
   *         required: false
   *         in: query
   *         type: string
   *       - name: sex
   *         description: 性别
   *         required: false
   *         in: query
   *         type: number
   *       - name: realName
   *         description: 真实姓名
   *         required: false
   *         in: query
   *         type: string
   *       - name: birthday
   *         description: 用户生日
   *         required: false
   *         in: query
   *         type: string
   *       - name: age
   *         description: 用户年龄
   *         required: false
   *         in: query
   *         type: string
   *       - name: idCardNo
   *         description: 身份证号
   *         required: false
   *         in: query
   *         type: string
   *       - name: phoneNumber
   *         description: 手机号
   *         required: false
   *         in: query
   *         type: string
   *       - name: email
   *         description: 邮箱
   *         required: false
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/edit"), UserController.edit);

  /**
   * @swagger
   * /api/user/del:
   *   post:
   *     description: 软删除用户
   *     summary: "软删除用户"
   *     tags: [用户模块]
   *     parameters:
   *       - name: id
   *         description: 用户id
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/del"), UserController.softDel);

  /**
   * @swagger
   * /api/user/batchDel:
   *   post:
   *     description: 批量物理删除用户
   *     summary: "批量物理删除用户"
   *     tags: [用户模块]
   *     parameters:
   *       - name: ids
   *         description: 用户id , 逗号分隔
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/batchDel"), UserController.batchDel);

  /**
   * @swagger
   * /api/user/batchEditUserState:
   *   post:
   *     description: 批量物理删除用户
   *     summary: "批量物理删除用户"
   *     tags: [用户模块]
   *     parameters:
   *       - name: ids
   *         description: 用户id , 逗号分隔
   *         required: true
   *         in: query
   *         type: string
   *       - name: userState
   *         description: 用户状态 , 0-禁用；1-启用；2-注销
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/batchEditUserState"), UserController.batchEditUserState);

  /**
   * @swagger
   * /api/user/resetUserPwd:
   *   post:
   *     description: 重新设置用户密码
   *     summary: "用户重新设置用户密码"
   *     tags: [用户模块]
   *     parameters:
   *       - name: oldPwd
   *         description: 原密码
   *         required: true
   *         in: query
   *         type: string
   *       - name: newPwd
   *         description: 新密码
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/resetUserPwd"), UserController.resetUserPwd);

  /**
   * @swagger
   * /api/user/:id:
   *   delete:
   *     description: 物理删除用户，如注销用户
   *     summary: "物理删除用户"
   *     tags: [用户模块]
   *     parameters:
   *       - name: id
   *         description: 用户id
   *         required: false
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.delete(getUrl("/:id"), UserController.del);

  /**
   * @swagger
   * /api/user/refreshLongToken:
   *   post:
   *     description: 刷新获取用户长token
   *     summary: "用户列表"
   *     tags: [用户模块]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/refreshLongToken"), UserController.refreshLongToken);

  /**
   * @swagger
   * /api/user/refreshShortToken:
   *   post:
   *     description: 刷新获取用户短token
   *     summary: "用户列表"
   *     tags: [用户模块]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/refreshShortToken"), UserController.refreshShortToken);

  /**
   * @swagger
   * /api/user/transaction:
   *   post:
   *     description: 用户事务测试
   *     summary: "用户列表"
   *     tags: [用户模块]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/transaction"), UserController.transaction);

  /**
   * @swagger
   * /api/user/getUserInfo:
   *   get:
   *     description: 获取用户信息
   *     summary: "用户列表"
   *     tags: [用户模块]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.get(getUrl("/getUserInfo"), UserController.getUserInfoByToken);

  /**
   * @swagger
   * /api/user/:id:
   *   get:
   *     description: 查看用户详情
   *     summary: "用户列表"
   *     tags: [用户模块]
   *     parameters:
   *       - name: id
   *         description: 用户id
   *         required: false
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.get(getUrl("/:id"), UserController.detail);
};
