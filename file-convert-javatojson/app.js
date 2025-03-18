/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-08-23 08:54:56
 * @LastEditTime: 2024-08-23 08:57:46
 * @Description: 
 */
const path = require('path')
const {
  enumerableFile,
  convertJavaFileToJsonFile,
} = require("./comm/fs");


function main() {
  // java文件转json文件
  const directory = path.join(__dirname, "./public/java");
  enumerableFile(directory, false).then((res) => {
    if (res) {
      res.forEach((ele) => {
        convertJavaFileToJsonFile(ele.name);
      });
    }
  });
}

main()