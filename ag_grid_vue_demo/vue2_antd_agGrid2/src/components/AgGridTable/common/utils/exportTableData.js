/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-06-11 10:12:06
 * @LastEditTime: 2024-06-11 11:21:36
 * @Description:
 */

// 数据触发拆分
export function setXlsxData(parms) {
  // arr 行   headerList列
  var s = 1000;
  var sum = Math.ceil(parms.arr.length / s);
  var newObj = {};
  for (var i = 0; i < sum; i++) {
    (function (j) {
      setTimeout(function () {
        var sIn = j * s;
        var endI = sIn + s;
        if (j == sum - 1 && parms.arr.length < s * sum) {
          endI = parms.arr.length;
        }
        var newArr = parms.arr.slice(sIn, endI);
        newObj[j] = toForXlsxData(newArr, parms.headerList);
        checkDataOver(sum, newObj, parms, j);
      }, j * 200);
    })(i);
  }
}

// 拆分循环处理数据的逻辑
function toForXlsxData(arr, headerList) {
  var newArr = [];
  for (var i = 0; i < arr.length; i++) {
    var _itemRow = [];
    for (var k = 0; k < headerList.length; k++) {
      // _itemRow 每一个单元格数据处理 样式 等
    }
    newArr.push(_itemRow);
  }
  return newArr;
}

// 检查数据是否组装完成
function checkDataOver(sum, newObj, parms, j) {
  // 导出进度等处理
  var status = Math.round((j / sum) * 100);
  var statusText = "已导出进度" + status + "%";
  if (sum === Object.keys(newObj).length) {
    // 组装数据完后的操作
  }
}
