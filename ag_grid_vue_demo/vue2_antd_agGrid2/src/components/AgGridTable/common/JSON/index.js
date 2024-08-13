import { saveAs } from "file-saver";

/**
 * @description: 导出json文件
 * @param {String} data 字符串
 * @param {String} fileName 文件名
 * @return {*}
 */
export function downLoadJsonFile(data, fileName = "示例") {
  var blob = new Blob([JSON.stringify(data)], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, `${fileName}.json`);
}
