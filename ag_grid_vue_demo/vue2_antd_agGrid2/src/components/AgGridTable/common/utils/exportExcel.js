import * as XLSX from "xlsx";

function datenum(v, date1904) {
  if (date1904) v += 1462;
  var epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

function sheet_from_array_of_arrays(data) {
  var ws = {};
  var range = {
    s: {
      c: 10000000,
      r: 10000000,
    },
    e: {
      c: 0,
      r: 0,
    },
  };
  for (var R = 0; R != data.length; ++R) {
    for (var C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      var cell = {
        v: data[R][C],
      };
      if (cell.v == null) continue;
      var cell_ref = XLSX.utils.encode_cell({
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

function s2ab(s) {
  // let maxSize = 0x7fffffff; // 2GB, 16-bit platforms are limited to 2GB
  // var buf = new ArrayBuffer(maxSize);
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

export function export_json_to_excel(th, jsonData) {
  var data = jsonData;
  data.unshift(th);
  var ws_name = "SheetJS";

  var wb = new Workbook(),
    ws = sheet_from_array_of_arrays(data);

  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;

  var wbout = XLSX.write(wb, {
    bookType: "xlsx",
    bookSST: false,
    type: "binary",
  });
  return s2ab(wbout);
}

/**
 * @description: Excel导表方法封装
 * @param {string[]} tHeader 表格第一行标题，例如['吸粉公众号', '吸粉数', '日期']
 * @param {object[]} data  过滤处理的数据
 * @param {string[]} lastRow  表格自定义最后一行
 * @param {string} title  导出表格文件的标题
 */
function exportExcel(dataObj) {
  const { tHeader, data, lastRow } = dataObj;
  data.push(...lastRow); // 在导表的最后一行加入总数
  const newBold = export_json_to_excel(tHeader, data); // 最后一个是表名字
  return newBold;
}

/**
 * @description: Excel数据过滤数据方法，例如时间格式 【将金额转为数字】
 * @param {string[]} filterVal 过滤键值
 * @param {object[]} jsonData 过滤数据
 * @return {} 返回对应的数据
 */
function formatJson(filterVal, jsonData) {
  const formatExcelData = (str) => {
    if (str) {
      if (/[Fee|Money|Price|Pay|Weight|Volume]$/g.test(str)) {
        const val = Number(str);
        // 导出excel超出11位，会被转换为科学计数法，通过加入' ，强制转换为字符串
        if (isNaN(val)) {
          return str;
        } else {
          if (val.toString().length > 10) {
            return `'${val}`;
          } else {
            return val;
          }
        }
      } else {
        return str;
      }
    } else {
      return str;
    }
  };
  return jsonData.map((v) =>
    filterVal.map((j) => {
      const str = v[j];
      return formatExcelData(str);
    })
  );
}

/**
 * @description: 导柱形图excel表
 * @param {string[]} tHeader 表头数据 ，现在只适用一级表头， string[] , 例如['时间', '吸粉数']
 * @param {string[]} filterVal 表格列数据，必须与表头相对应，string[] , 例如['time', 'number']
 * @param {object[] } tableData 表格行数据
 * @param {string} title 导出表格的文件标题
 * @param {any[]} lastRow 可自定义最后一行数据， string[] ，注意其长度最好是与表头相对应
 * @return {*}
 */

// 导出极限为 100M, 超出100M会报错
export function exportExcelFun(data) {
  return new Promise((resolve) => {
    const cData = Array.isArray(data.tableData)
      ? formatJson(data.filterVal, data.tableData)
      : [];
    const dataObj = {
      tHeader: data.tHeader,
      filterVal: data.filterVal,
      lastRow: data.lastRow || [],
      title: data.title || "downLoadExcel",
      data: cData,
    };
    const parseBolb = exportExcel(dataObj);
    resolve(parseBolb);
  });
}

function isNotEmptyArr(arr) {
  return Array.isArray(arr) && arr.length;
}

// 获取排序字段
function getSortabledFields(sortabledFields) {
  let tHeader = [];
  let filterVal = [];
  sortabledFields.forEach((ele) => {
    if (!ele.hide) {
      tHeader.push(ele.headerName);
      filterVal.push(ele.field);
    }
  });
  return {
    tHeader,
    filterVal,
  };
}

// 导出最大限制，为100M , 超出100M解析会出问题
export const EXPORT_EXCEL_FILE_SIZE_LIMIT = 90;
// 导出excel超出限制的最大分割数
export const EXPORT_EXCEL_SPLIT_MAX_NUM = 15000;

/**
 * @description: 通过ArrayBuffer计算数据大小MB
 * @param {*} buf 实例化的ArrayBuffer
 * @param {*} sizeUnit 计算的单位 ， MB / KB
 * @return {*}
 */
export function calcFileSizeByBuf(buf, sizeUnit = "MB") {
  if (sizeUnit === "MB") {
    // 转换为MB (1024 bytes per KB, 1024 KB per MB)
    const sizeInMB = buf.byteLength / 1024 / 1024;
    const sizeInMBVal = sizeInMB.toFixed(2);
    console.log(`Size in MB: ${sizeInMBVal}`);
    return sizeInMBVal;
  } else if (sizeUnit === "KB") {
    // 转换为KB (1024 bytes per KB)
    const sizeInKB = buf.byteLength / 1024;
    const sizeInKBVal = sizeInKB.toFixed(2);
    console.log(`Size in KB: ${sizeInKBVal}`);
    return sizeInKBVal;
  }
}

// 导出excelexcel， 通过表格数据和排序字段
export function exportExcelBySortFieldAndTableData(
  tableData = [],
  sortabledFields
) {
  const { tHeader, filterVal } = getSortabledFields(sortabledFields);

  if (isNotEmptyArr(tHeader) && isNotEmptyArr(filterVal)) {
    const newBolb = exportExcelFun({
      tHeader,
      filterVal,
      tableData,
    });
    return newBolb;
  } else {
    throw new Error("参数排序字段不能为空或者全部隐藏");
  }
}

// 格式化
const formatDateStr = (n) => (n > 9 ? n : "0" + n);

/**
 * @description: 日期时间格式化
 * @param {number} offsetHour 偏移小时
 * @return {*}
 */
export function formatSpecDate(offsetHour = 0) {
  let date = new Date();
  if (offsetHour) {
    const cDate = date.getTime() + offsetHour * 60 * 1000 * 60;
    date = new Date(cDate);
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  return `${year}${formatDateStr(month)}${formatDateStr(day)}${formatDateStr(
    hour
  )}${formatDateStr(minute)}`;
}

function getTableData(result) {
  const tableData = [];
  result.forEach((ele) => {
    if (ele.reqStatus === "success") {
      tableData.push(...ele.response);
    }
  });
  return tableData;
}

// 导出excel文件blob数据
export async function exportExcelFileBlob(result, config) {
  console.log("导出excel文件blob数据");

  const tableData = getTableData(result);
  const tableDataLen = tableData.length;
  console.log("tableDataLen123123123", tableDataLen);
  const sortabledFields = config?.pageOptions?.sortabledFields;
  let splitStep = EXPORT_EXCEL_SPLIT_MAX_NUM;
  const { tHeader, filterVal } = getSortabledFields(sortabledFields);

  if (isNotEmptyArr(tHeader) && isNotEmptyArr(filterVal)) {
    const isOnceExportPass = splitStep >= tableDataLen;
    console.log("123123123123", isOnceExportPass);

    // 如果超出导出限制，则分批到处 , 15000 为一批
    const splitTableData = [];
    let len = Math.ceil(tableData.length / splitStep);

    for (let i = 0; i < len; i++) {
      const splitArr = tableData.slice(i * splitStep, (i + 1) * splitStep);
      const cNewBolb = await exportExcelFun({
        tHeader,
        filterVal,
        tableData: splitArr,
      });
      console.log("cNewBolb123123123", cNewBolb);
      splitTableData.push(cNewBolb);
    }

    console.log("splitTableData123123123", splitTableData);

    return splitTableData;
  } else {
    throw new Error("参数排序字段不能为空或者全部隐藏");
  }
}
