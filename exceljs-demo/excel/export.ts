import type { ExcelSheetOptions, MappingInput, RowInput } from './index';

import { saveAs } from 'file-saver';

import { colorFlagMap } from './colorMap';

import { exportExcelWorkbook } from './index';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Map)
  );
}

/** mapping 无有效条目时视为空，对应 sheet 会被过滤 */
export function isMappingEmpty(mapping: MappingInput): boolean {
  if (mapping instanceof Map) return mapping.size === 0;
  if (Array.isArray(mapping)) return mapping.length === 0;
  if (isPlainObject(mapping)) return Object.keys(mapping).length === 0;
  return true;
}

function normalizeRowsInput(
  rows: Map<unknown, RowInput> | RowInput[],
): RowInput[] {
  if (rows instanceof Map) return [...rows.values()];
  return rows;
}

/**
 * 单个 sheet 入参：mapping、rows 必填；mapping 为空时整项在导出前被过滤。
 * rows 可为空数组；也支持 Map（按 value 顺序作为行序列）。
 */
export type NewExcelSheetInput = Omit<
  Partial<ExcelSheetOptions>,
  'mapping' | 'rows'
> & {
  mapping: MappingInput;
  rows: Map<unknown, RowInput> | RowInput[];
};

/** 每个 sheet 的默认配置，sheet 上同名属性优先 */
export type NewExcelSheetDefaults = Partial<
  Omit<ExcelSheetOptions, 'mapping' | 'rows' | 'sheetName'>
>;

export type ExportExcelFileConfig = {
  fileName: string;
  sheetOptions?: NewExcelSheetDefaults;
  sheets: NewExcelSheetInput[];
};

export type MultipleHeaderExcelExportOptions = {
  // 其他选项
  [key: string]: any;
  fileName?: string;
  // 公共sheet设置
  sheetOptions?: NewExcelSheetDefaults;
  // 多sheet设置
  sheets?: ExcelSheetOptions[];
  // 自定义表格数据，给默认的单sheet用的，多sheet时无效
  tableData?: any[];
  // 自定义表格数据映射，给默认的单sheet用的，多sheet时无效
  tDataMapping?: Record<string, string>;
};

/**
 * 浏览器端导出多 sheet Excel。
 * @param config 配置对象
 * @param config.fileName 文件名（可带或不带 .xlsx）,默认导出xlsx文件，如果需要导出csv文件，需要定义后缀名，例如：fileName: '导出文件.csv'
 * @param config.sheets sheet 列表；mapping 为空的项会被忽略
 * @param config.options 各 sheet 的默认参数，优先级低于 sheets 元素上的属性
 */
export async function exportExcelFile(
  config: ExportExcelFileConfig,
): Promise<void> {
  const { fileName, sheets, sheetOptions } = config;
  if (!fileName || typeof fileName !== 'string') {
    throw new TypeError('导出 excel 文件名不能为空');
  }
  if (!Array.isArray(sheets)) {
    throw new TypeError('导出的工作表列表无效');
  }

  const mergedSheets: ExcelSheetOptions[] = [];
  let outIndex = 0;

  for (const sheet of sheets) {
    if (!Object.prototype.hasOwnProperty.call(sheet, 'rows')) {
      throw new TypeError('每个 sheet 必须包含 rows 属性（可为空数组）');
    }
    if (!Object.prototype.hasOwnProperty.call(sheet, 'mapping')) {
      throw new TypeError('每个 sheet 必须包含 mapping 属性');
    }
    const mapping = sheet.mapping;
    if (mapping === undefined || mapping === null) {
      throw new TypeError('每个 sheet 的 mapping 不能为 undefined 或 null');
    }
    if (isMappingEmpty(mapping)) {
      continue;
    }

    const rows = normalizeRowsInput(sheet.rows);
    const sheetName = sheet.sheetName ?? `Sheet${outIndex + 1}`;

    mergedSheets.push({
      ...sheetOptions,
      ...sheet,
      mapping,
      rows,
      sheetName,
    });
    outIndex++;
  }

  if (mergedSheets.length === 0) {
    throw new Error('没有可导出的工作表（mapping 不能为空）');
  }

  const workbook = await exportExcelWorkbook({
    fileName,
    sheets: mergedSheets,
  });
  const lowerFileName = fileName.toLowerCase();
  if (lowerFileName.endsWith('.csv')) {
    const buffer = await workbook.csv.writeBuffer({
      sheetName: mergedSheets[0]?.sheetName,
      formatterOptions: {
        // 导出为 UTF-8 with BOM，避免 Excel 打开中文乱码
        writeBOM: true,
      },
    });
    const blob = new Blob([buffer], {
      type: 'text/csv;charset=utf-8',
    });
    saveAs(blob, fileName);
    return;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const outName = lowerFileName.endsWith('.xlsx')
    ? fileName
    : `${fileName}.xlsx`;
  saveAs(blob, outName);
}

export function getBgColorList() {
  const keys = [...colorFlagMap.keys()];
  const bgColorListObj: { [key: string]: string } = {};
  keys.forEach((key) => {
    bgColorListObj[key] = `FF${colorFlagMap.get(key)?.split('#')[1]}`;
  });
  return bgColorListObj;
}
