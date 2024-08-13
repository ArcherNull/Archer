/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-07 10:32:08
 * @LastEditTime: 2023-09-09 16:35:39
 * @Description:  公共api入口文件
 */

const upload = require("./upload/index");

const intervalSchedule = require("./intervalSchedule/index");

const excel = require("./excel/index");

module.exports = (router) => {
  // 上传接口
  upload(router);
  // 定时任务
  intervalSchedule(router);
  // 导出
  excel(router);
};
