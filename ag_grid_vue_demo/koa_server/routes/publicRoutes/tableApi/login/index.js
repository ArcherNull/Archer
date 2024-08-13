/*
 * @Author: Null
 * @Date: 2023-01-13 14:18:05
 * @Description: 登录接口
 */
const LoginController = require("@db/controllers/login");
const { generateModulePrefix } = require("@lib/common");
const getUrl = (url) => generateModulePrefix(url, "");

module.exports = (router) => {
  /**
   * @swagger
   * /admin/login:
   *   post:
   *     description: 用户登录，登录方式存在三种组合，第一手机号+验证码，第二邮箱+验证码，第三手机号/邮箱/用户名 + 密码
   *     summary: "用户登录"
   *     tags: [用户模块]
   *     parameters:
   *       - name: userName
   *         description: 账号
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
   *       - name: verifyCode
   *         description: 验证码
   *         required: false
   *         in: query
   *         type: string
   *       - name: password
   *         description: 密码
   *         in: query
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/login"), LoginController.login);

  /**
   * @swagger
   * /admin/loginByQrCode:
   *   post:
   *     description: 移动端扫码登录
   *     summary: "移动端扫码登录"
   *     tags: [用户模块]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/loginByQrCode"), LoginController.loginByQrCode);

  /**
   * @swagger
   * /admin/logOut:
   *   post:
   *     description: 登出接口
   *     summary: "登出接口"
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
  router.post(getUrl("/logOut"), LoginController.logOut);

  /**
   * @swagger
   * /admin/register:
   *   post:
   *     description: 注册接口
   *     summary: "用户注册"
   *     tags: [用户模块]
   *     parameters:
   *       - name: userName
   *         description: 账号
   *         required: true
   *         in: query
   *         type: string
   *       - name: phoneNumber
   *         description: 手机号
   *         required: true
   *         in: query
   *         type: string
   *       - name: password
   *         description: 密码
   *         in: query
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/register"), LoginController.register);

  /**
   * @swagger
   * /admin/logOff:
   *   post:
   *     description: 注销接口
   *     summary: "注销接口"
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
  router.post(getUrl("/logOff"), LoginController.logOff);

  /**
   * @swagger
   * /admin/sendEMailCode:
   *   post:
   *     description: 发送邮箱验证码，preLoginVerifyCode|预登录验证码 loginingVerifyCode|登录中验证码,resetPwd|重置密码
   *     summary: "发送邮箱验证码"
   *     tags: [用户模块]
   *     parameters:
   *       - name: email
   *         description: 邮箱
   *         required: true
   *         in: query
   *         type: string
   *       - name: codeType
   *         description: 验证码类型
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/sendEMailCode"), LoginController.sendEMailCode);

  /**
   * @swagger
   * /admin/resetPwdByEmail:
   *   post:
   *     description: 发送邮箱验证码重置密码，如果忘记了密码，需要找回密码，则可以通过账号名或手机号，找到唯一用户，然后再使用邮箱重置密码
   *     summary: "发送邮箱验证码重置密码"
   *     tags: [用户模块]
   *     parameters:
   *       - name: email
   *         description: 邮箱
   *         required: true
   *         in: query
   *         type: string
   *       - name: verifyCode
   *         description: 重置密码的验证码
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post(getUrl("/resetPwdByEmail"), LoginController.resetPwdByEmail);
};
