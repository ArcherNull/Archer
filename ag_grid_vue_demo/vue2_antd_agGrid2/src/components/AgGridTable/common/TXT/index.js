/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-08 17:38:20
 * @LastEditTime: 2024-05-09 11:38:15
 * @Description: TXT文件导出
 */
import { saveAs } from "file-saver";

/**
 * @description: 导出txt文件
 * @param {String} data 字符串
 * @param {String} fileName 文件名
 * @return {*}
 */
export function downLoadTxtFile(data, fileName = "文本") {
  var blob = new Blob([JSON.stringify(data)], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, `${fileName}.txt`);
}

/**
 * @description: 数据过滤数据方法
 * @param {string[]} filterVal 过滤键值
 * @param {object[]} jsonData 过滤数据
 * @return {} 返回对应的数据
 */
function formatJson(filterVal, jsonData) {
  return jsonData.map((v) => filterVal.map((j) => v[j]));
}

/**
 * @description: 导柱TXT
 * @param {string[]} tHeader 表头数据 ，现在只适用一级表头， string[] , 例如['时间', '吸粉数']
 * @param {string[]} filterVal 表格列数据，必须与表头相对应，string[] , 例如['time', 'number']
 * @param {object[] } tableData 表格行数据
 * @param {string} title 导出表格的文件标题
 * @param {any[]} lastRow 可自定义最后一行数据， string[] ，注意其长度最好是与表头相对应
 * @return {*}
 */
export function downLoadTableTxtFile(config) {
  const { title, tHeader, filterVal, tableData, lastRow = [] } = config;

  const filterTableData = formatJson(filterVal, tableData);
  const newList = [tHeader, ...filterTableData, lastRow];

  const newTxt = newList
    .filter((ele) => ele?.length)
    .map((item) => {
      if (item.length) {
        return item.join("\xA0\xA0");
      } else {
        return "";
      }
    })
    .join("\n");

  var blob = new Blob([newTxt], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, `${title}.txt`);
}
