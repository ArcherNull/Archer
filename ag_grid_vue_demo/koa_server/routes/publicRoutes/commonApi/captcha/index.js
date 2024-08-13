/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-07-23 09:58:27
 * @LastEditTime: 2024-07-24 23:55:58
 * @Description: 
 */
const { sendSvgCaptcha, validateSvgCaptcha } = require("@middlewares/svgCaptcha");

module.exports = (router) => {
    // 发送图形验证码

    /** 
     * @swagger
     * /admin/sendSvgCaptcha:
     *   get:
     *     description: 发送图形验证码
     *     summary: "发送图形验证码"
     *     tags: [图形验证码]
     *     parameters:
     *       - name: type
     *         description: 图形验证码type ，character表示随机字符串，number 表示数字运算验证码 
     *         required: true
     *         in: path
     *         type: string
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: 获取数据列表
     */
    router.get("/sendSvgCaptcha", sendSvgCaptcha);

    /** 
     * @swagger
     * /admin/validateSvgCaptcha:
     *   get:
     *     description: 校验图形验证码
     *     summary: "校验图形验证码"
     *     tags: [图形验证码]
     *     parameters:
     *       - name: uuid
     *         description: UUID
     *         required: true
     *         in: path
     *         type: string
     *       - name: text
     *         description: 验证码
     *         required: true
     *         in: path
     *         type: string
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: 获取数据列表
     */
    router.get("/validateSvgCaptcha", validateSvgCaptcha);
};
