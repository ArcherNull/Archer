/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-06 14:59:04
 * @LastEditTime: 2024-05-09 11:58:47
 * @Description:
 * 参考文档：https://www.cnblogs.com/yinxingen/p/11052184.html
 * 参考文档：https://juejin.cn/post/7282950051319595066?searchId=202405061028396619942978A84BCD82DB
 * 报错解决方案：https://blog.csdn.net/m0_51431448/article/details/128630505
 */
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import XLSXS from "xlsx-style";

require("script-loader!file-saver");
require("./Blob.js"); //转二进制用  这边要写你的blob的实际地址
require("script-loader!xlsx/dist/xlsx.core.min");

/**
 *
 * @param {*} table
 * @returns
 * 将HTML表格转换为二维数组
 * 函数支持处理表格中的单元格合并、行列跨度以及特定数据类型转换
 */
function generateArray(table) {
  let out = [];
  let rows = table.querySelectorAll("tr");
  let ranges = [];
  for (let R = 0; R < rows.length; ++R) {
    let outRow = [];
    let row = rows[R];
    let columns = row.querySelectorAll("td");
    for (let C = 0; C < columns.length; ++C) {
      let cell = columns[C];
      let colspan = cell.getAttribute("colspan");
      let rowspan = cell.getAttribute("rowspan");
      let cellValue = cell.innerText;
      if (cellValue !== "" && cellValue == +cellValue) cellValue = +cellValue;

      //Skip ranges
      ranges.forEach(function (range) {
        if (
          R >= range.s.r &&
          R <= range.e.r &&
          outRow.length >= range.s.c &&
          outRow.length <= range.e.c
        ) {
          for (let i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null);
        }
      });

      //Handle Row Span
      if (rowspan || colspan) {
        rowspan = rowspan || 1;
        colspan = colspan || 1;
        ranges.push({
          s: {
            r: R,
            c: outRow.length,
          },
          e: {
            r: R + rowspan - 1,
            c: outRow.length + colspan - 1,
          },
        });
      }
      //Handle Value
      outRow.push(cellValue !== "" ? cellValue : null);

      //Handle Colspan
      if (colspan) for (let k = 0; k < colspan - 1; ++k) outRow.push(null);
    }
    out.push(outRow);
  }
  return [out, ranges];
}

function datenum(v, date1904) {
  if (date1904) v += 1462;
  let epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

/**
 *
 * @param {*} data
 * @param {*} opts
 * @returns
 * 用于将二维数组转换为Excel工作表对象的JavaScript函数
 * 使用了XLSX.js库提供的工具方法来编码单元格引用和工作表范围，可生成可供Excel处理的工作表数据
 * 支持将一些数据类型转换为Excel支持的数据类型，例如将日期对象转换为数字类型，并设置相应的格式。
 */
function sheet_from_array_of_arrays(data) {
  let ws = {};
  let range = {
    s: {
      c: 10000000,
      r: 10000000,
    },
    e: {
      c: 0,
      r: 0,
    },
  };
  for (let R = 0; R != data.length; ++R) {
    for (let C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      let cell = {
        v: data[R][C],
      };
      if (cell.v == null) continue;
      let cell_ref = XLSX.utils.encode_cell({
        c: C,
        r: R,
      });

      if (typeof cell.v === "number") cell.t = "n";
      else if (typeof cell.v === "boolean") cell.t = "b";
      else if (cell.v instanceof Date) {
        cell.t = "n";
        cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      } else cell.t = "s";

      ws[cell_ref] = cell;
    }
  }
  if (range.s.c < 10000000) ws["!ref"] = XLSX.utils.encode_range(range);
  return ws;
}

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

function s2ab(s) {
  let buf = new ArrayBuffer(s.length);
  let view = new Uint8Array(buf);
  for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

export function export_table_to_excel(id) {
  let theTable = document.getElementById(id);
  let oo = generateArray(theTable);
  let ranges = oo[1];

  /* original data */
  let data = oo[0];
  let ws_name = "SheetJS";
  let wb = new Workbook(),
    ws = sheet_from_array_of_arrays(data);

  /* add ranges to worksheet */
  // ws['!cols'] = ['apple', 'banan'];
  ws["!merges"] = ranges;

  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;

  let wbout = XLSX.write(wb, {
    bookType: "xlsx",
    bookSST: false,
    type: "binary",
  });

  saveAs(
    new Blob([s2ab(wbout)], {
      type: "application/octet-stream",
    }),
    "test.xlsx"
  );
}

export function export_json_to_excelhb({
  multiHeader = [], //  第一行表头
  multiHeader2 = [], // 第二行表头
  header = [], // 第三行表头
  data, //传递的数据
  filename, //文件名
  merges = [], // 合并
  autoWidth = true, //用于设置列宽的
  bookType = "xlsx",
} = {}) {
  console.log("multiHeader", multiHeader);
  console.log("multiHeader2", multiHeader2);

  /* original data */
  filename = filename || "列表";
  data = [...data];
  for (let i = header.length - 1; i > -1; i--) {
    data.unshift(header[i]);
  }
  for (let i = multiHeader2.length - 1; i > -1; i--) {
    data.unshift(multiHeader2[i]);
  }
  for (let i = multiHeader.length - 1; i > -1; i--) {
    data.unshift(multiHeader[i]);
  }

  let ws_name = "SheetJS";
  let wb = new Workbook(),
    ws = sheet_from_array_of_arrays(data);

  // 设置单元格公共样式
  let borderAll = {
    //单元格外侧框线
    top: {
      style: "thin",
    },
    bottom: {
      style: "thin",
    },
    left: {
      style: "thin",
    },
    right: {
      style: "thin",
    },
  };

  for (let key in ws) {
    // 单元格公共样式设置
    if (ws[key] instanceof Object) {
      ws[key].s = {
        border: borderAll,
        alignment: {
          horizontal: "center", //水平居中对齐
          vertical: "center", //垂直居中
          wrapText: 1, //自动换行
        },
        // fill: { //背景色
        //     fgColor: { rgb: 'dbf3f2' }
        // },
        font: {
          sz: 10, //单元格中字体的样式与颜色设置
          color: {
            rgb: "000000",
          },
        },
        bold: true,
        numFmt: 0,
      };
    }

    //给特定格子（带'1'的，即首行 标题）添加样式，下面同理
    // if (key.replace(/[^0-9]/ig, '') === '1') {
    //     ws[key].s = {
    //         ...ws[key].s,
    //         fill: { //背景色
    //             fgColor: { rgb: 'd4e6fd' }
    //         },
    //         font: {//覆盖字体
    //             name: '等线',
    //             sz: 10,
    //             // bold: true
    //         },
    //     }
    // }
    if (key === "A1") {
      ws[key].s = {
        ...ws[key].s,
        fill: {
          //背景色
          fgColor: { rgb: "d4e6fd" },
        },
      };
    }
    // if (key === 'B2' || key === 'C2' || key === 'D2' || key === 'E2' || key === 'F2' || key === 'G2') {
    //     ws[key].s = {
    //         ...ws[key].s,
    //         fill: { //背景色
    //             fgColor: { rgb: 'fbedd7' }
    //         }
    //     }
    // }
  }
  if (merges.length > 0) {
    if (!ws["!merges"]) ws["!merges"] = [];
    merges.forEach((item) => {
      ws["!merges"].push(
        XLSX.utils.decode_range(
          XLSX.utils.encode_cell(item.s) + ":" + XLSX.utils.encode_cell(item.e)
        )
      );
      // 设置单元格的样式
      ws[XLSX.utils.encode_cell(item.s)].s = item.style;
    });
  }
  // ws['I2'] = ws['H2'] = ws['G2'] = ws['F2'] = ws['E2'] = ws['D2'] = ws['C2'] = ws['B2'] = ws['A2']//用于第二行的单元格的样式设置（如果是合并的第一行，就是1）
  // if (merges.length > 0) {
  //     if (!ws['!merges']) ws['!merges'] = [];
  //     merges.forEach(item => {
  //         console.log(item);
  //         ws['!merges'].push(XLSX.utils.decode_range(item))
  //     })
  // }
  if (autoWidth) {
    let colWidths = [];
    // 计算每一列的所有单元格宽度
    // 先遍历行
    data.forEach((row) => {
      // 列序号
      let index = 0;
      // 遍历列
      for (const key in row) {
        if (colWidths[index] == null) colWidths[index] = [];
        switch (typeof row[key]) {
          case "string":
          case "number":
          case "boolean":
            colWidths[index].push(getCellWidth(row[key]));
            break;
          case "object":
          case "function":
            colWidths[index].push(0);
            break;
        }
        index++;
      }
    });
    ws["!cols"] = [];
    // 第三行表头的设置
    colWidths.forEach((widths) => {
      // 计算列头的宽度
      // widths.push(getCellWidth(header[index]))
      // 设置最大值为列宽
      ws["!cols"].push({
        wch: Math.max(...widths),
      });
    });
  }
  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;
  let wbout = XLSXS.write(wb, {
    bookType: bookType,
    bookSST: false,
    type: "binary",
  });
  saveAs(
    new Blob([s2ab(wbout)], {
      type: "application/octet-stream",
    }),
    `${filename}.${bookType}`
  );
}

export function getCellWidth(value) {
  if (value == null) {
    return 10;
  } else if (value.toString().charCodeAt(0) > 255) {
    // 判断是否包含中文
    let length = value.toString().length * 2;
    if (length > 60) {
      length = length - 40;
      //这里的宽度可以自己设定，在前面设置wrapText: 1可以在单元格内换行
    }
    return length;
  } else {
    return value.toString().length * 1.2;
  }
}
