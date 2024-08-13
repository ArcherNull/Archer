/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-06 19:29:45
 * @LastEditTime: 2024-07-25 09:56:44
 * @Description: 
 */
/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-06 19:29:45
 * @LastEditTime: 2023-08-01 16:32:20
 * @Description: 上传接口
 *
 * https://juejin.cn/post/6948091413506555934
 */

const {
  unploadFileFun,
  downloadFileFun,
} = require("@middlewares/upload");

module.exports = (router) => {
  /**
   * @swagger
   * /upload:
   *   post:
   *     description: 上传文件
   *     summary: "文件上传"
   *     tags: [文件上传]
   *     parameters:
   *       - name: file
   *         description: 上传文件对象
   *         required: true
   *         in: query
   *         type: file
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取数据列表
   */
  router.post("/upload", unploadFileFun);

  /**
   * @swagger
   * /download:
   *   post:
   *     description: 下载文件
   *     summary: "下载文件"
   *     tags: [文件上传]
   *     parameters:
   *       - name: fileUrl
   *         description: 下载文件相对路径
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取文件流数据
   */
  router.post("/download", downloadFileFun);

  /**
   * @swagger
   * /download:
   *   get:
   *     description: 下载文件
   *     summary: "下载文件"
   *     tags: [文件上传]
   *     parameters:
   *       - name: fileUrl
   *         description: 下载文件相对路径
   *         required: true
   *         in: query
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: 获取文件流数据
   */
  router.get("/download", downloadFileFun);
};
