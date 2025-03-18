/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-08 10:52:39
 * @LastEditTime: 2024-05-06 09:46:52
 * @Description:
 */
const { downloadFileFun } = require("@middlewares/upload");

module.exports = (router) => {
  // 下载文件
  router.get("/download", downloadFileFun);
};
