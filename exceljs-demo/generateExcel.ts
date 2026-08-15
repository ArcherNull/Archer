import type { Worksheet, Workbook } from "exceljs";
import dayjs from "dayjs";
import * as exceljs from "exceljs";
import { isObject, isEmpty, isArray, isFunction } from "lodash";

export type NewObject = {
  [key: string]: any;
};

export type SelectColumnsType = string[] | { [key: string]: boolean }[];

export class GenerateExcelClass {
  constructor() {}

  /**
   * @description: 是否是空对象
   * @param {unknown} obj
   * @return {*}
   */
  isNoEmptyObj(obj: unknown): boolean {
    return isObject(obj) && !isEmpty(obj);
  }

  /**
   * @description: 是否是空对象
   * @param {unknown} arr
   * @return {*}
   */
  isNoEmptyArr(arr: unknown): boolean {
    return isArray(arr) && !isEmpty(arr);
  }

  /**
   * @description: 获取随机名
   * @param {number} randomNum 随机数
   * @return {*}
   */
  getRandomName(randomNum: number = 6) {
    const dateStr = dayjs().format("YYYYMMDDHHmmss");
    const randomName = Array(randomNum)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join("");
    return dateStr + randomName;
  }

  /**
   * @description: 扁平化表头结构
   * @param {any} headers
   * @return {*}
   */
  flattenHeaders(headers: any[]) {
    const flat: any[] = [];
    function traverse(items: any[]) {
      items.forEach((item) => {
        if (item.children) {
          traverse(item.children);
        } else {
          flat.push(item);
        }
      });
    }
    traverse(headers);
    return flat;
  }

  /**
   * @description: 构建多级表头
   * @return {*}
   */
  buildMultiLevelHeader(
    worksheet: Worksheet,
    headers: any[],
    startRow: number = 1
  ) {
    let maxDepth = 1;
    function getDepth(items: any[], currentDepth = 1) {
      maxDepth = Math.max(maxDepth, currentDepth);
      items.forEach((item) => {
        if (item.children) {
          getDepth(item.children, currentDepth + 1);
        }
      });
    }
    getDepth(headers);

    // 构建表头数据
    const headerData: any = Array(maxDepth)
      .fill("")
      .map(() => []);

    function buildHeaderRow(items: any[], depth = 0, colIndex = 0) {
      items.forEach((item) => {
        if (item.children) {
          const span = GenerateExcelClass.countLeafNodes(item.children);
          headerData[depth].push({ value: item.header, span });
          buildHeaderRow(item.children, depth + 1, colIndex);
          colIndex += span;
        } else {
          headerData[depth].push({ value: item.header, span: 1 });
          for (let i = depth + 1; i < maxDepth; i++) {
            headerData[i].push({ value: "", span: 1 });
          }
          colIndex++;
        }
      });
    }
    buildHeaderRow(headers);

    // 设置表头单元格
    let currentCol = 1;
    console.log('headerData123123123', headerData)
    headerData.forEach((row: any, rowIndex: number) => {
      row.forEach((cell: any) => {
        console.log('cell123123123', cell)
        
        const worksheetRow = worksheet.getRow(startRow + rowIndex);
        const cellRef = worksheetRow.getCell(currentCol);
        cellRef.value = cell.value;

        if (cell.span > 1) {
          worksheet.mergeCells(
            startRow + rowIndex,
            currentCol,
            startRow + rowIndex,
            currentCol + cell.span - 1
          );
        }

        // 设置样式
        cellRef.font = { bold: true, size: 12 };
        cellRef.alignment = { vertical: "middle", horizontal: "center" };
        cellRef.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6F3FF" },
        };
        cellRef.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        currentCol += cell.span;
      });
      currentCol = 1;
    });

    return startRow + maxDepth;
  }

  /**
   * @description: 计算叶子节点数量
   * @param {any} items
   * @return {*}
   */
  static countLeafNodes(items: any[]) {
    let count = 0;
    items.forEach((item) => {
      if (item.children) {
        count += GenerateExcelClass.countLeafNodes(item.children);
      } else {
        count++;
      }
    });
    return count;
  }

  /**
   * @description: 检查导入传参是否通过
   * @param {any} bodyData
   * @return {*}
   */
  validateExportBody(bodyData: any) {
    const { sheets, fileName } = bodyData;
    const errLog = [];
    const newSheets = [];
    if (!fileName) {
      errLog.push("导出excel文件名不能为空");
    }
    if (!this.isNoEmptyArr(sheets)) {
      errLog.push("导出的工作表不能为空");
    } else {
      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        const {
          headers,
          fields,
          sheetName,
          queryParams,
          errLog: eLogs,
          ...restObj
        } = this.generateHeader(sheet, i);
        if (this.isNoEmptyArr(eLogs)) {
          errLog.push(...eLogs);
        } else {
          newSheets.push({
            headers,
            fields,
            sheetName,
            queryParams,
            ...restObj,
          });
        }
      }
    }

    return {
      errLog,
      newSheets,
    };
  }

  /**
   * @description: 生成头部
   * @param {any} sheetData
   * @param {number} ind
   * @return {*}
   */
  generateHeader(sheetData: any, ind: number) {
    const { mapping, sheetName, queryParams, ...restObj } = sheetData;
    let headers: any[] = [];
    const fields: any[] = [];
    const errLog: any[] = [];
    const nParams = this.isNoEmptyObj(queryParams) ? queryParams : {};
    const newSheetName = sheetName ? sheetName : `${sheetName}${ind + 1}`;
    const recFun = (mapObj: NewObject): any[] => {
      const nList: any[] = [];
      if (this.isNoEmptyObj(mapObj)) {
        for (const [label, field] of Object.entries(mapObj)) {
          const obj: NewObject = {
            header: label,
          };
          if (this.isNoEmptyObj(field)) {
            obj.children = recFun(field);
          } else {
            obj.key = field;
            obj.width = 20
            fields.push(field);
          }
          nList.push(obj);
        }
      }
      return nList;
    };

    headers = recFun(mapping);

    console.log("headers", headers);

    return {
      headers,
      fields,
      errLog,
      queryParams: nParams,
      sheetName: newSheetName,
      ...restObj,
    };
  }

  /**
   * @description: 导出excel
   * @param {*} bodyData
   * @return {*}
   */
  exportExcel(bodyData: any): Promise<Workbook> {
    return new Promise(async (resolve, reject) => {
      const { errLog, newSheets } = this.validateExportBody(bodyData);
      if (this.isNoEmptyArr(errLog)) {
        reject(new Error(`${errLog.join(";")}`));
      } else {
        const workbook = new exceljs.Workbook();

        for (let i = 0; i < newSheets.length; i++) {
          const sheet = newSheets[i];
          const { headers, sheetName, tableData, rowStyle, colStyle, filter } =
            sheet;
          // 添加一个新的工作表，命名为'sheet'
          const worksheet = workbook.addWorksheet(sheetName);
          // 构建多级表头
          const dataStartRow = this.buildMultiLevelHeader(worksheet, headers);
          // 设置数据列
          const flatHeaders = this.flattenHeaders(headers);
          worksheet.columns = flatHeaders;

          if (filter) {
            const rInd = dataStartRow - 1;
            // 设置筛选功能
            worksheet.autoFilter = `A${rInd}:F${rInd}`;
          }

          // 向工作表中添加数据行
          worksheet.addRows(tableData);
          // 设置数据行样式
          for (let i = dataStartRow; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            const rowInfo = tableData[i - dataStartRow];
            let rObj: any;
            if (rowStyle && isFunction(rowStyle)) {
              rObj = rowStyle(rowInfo);
            }
            row.eachCell((cell: any, colNumber: number) => {
              const columnConfig = worksheet.columns[colNumber - 1]; // 数组下标从0开始
              const fieldKey = columnConfig?.key;

              cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              };

              // 行数据样式
              if (rObj) {
                cell.fill = rObj;
              }

              // 列数据样式
              if (fieldKey && colStyle && isFunction(colStyle)) {
                const value = rowInfo[fieldKey];
                const cObj = colStyle({ field: fieldKey, value }, rowInfo);
                if (cObj) {
                  cell.fill = cObj;
                }
              }
            });
          }
          // 自动调整列宽
          worksheet.columns.forEach((column) => {
            column.width = column.width || 15;
          });
        }
        resolve(workbook);
      }
    });
  }
}
