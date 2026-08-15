import { cloneDeep, isFunction, isNumber } from 'lodash-es';

import type {
  ExportExcelFileConfig,
  MultipleHeaderExcelExportOptions,
} from '../../excel/export';
import { exportExcelFile } from '../../excel/export';
import { getMergeSheetOptions } from '../../excel/comm';
import {
  SERIAL_NUMBER_EXPORT_PROP,
  type TableApi,
  type TableColumnDef,
} from './constants';

function isNotEmptyArr(arr: unknown): arr is unknown[] {
  return Array.isArray(arr) && arr.length > 0;
}

type TableApiRef = { value: TableApi | null };

type UseExportMultipleHeaderExcelOptions = {
  /** 导出前处理 */
  beforeExport?: (sheetData: ExportExcelFileConfig) => Promise<void>;
  /**
   * 表格 API（Tabulator 实例即可，需具备 getData / getSelectedData / getColumnDefinitions）
   */
  tableApi: TableApiRef;
  onSuccess?: (fileName: string) => void;
  onError?: (error: unknown) => void;
};

/**
 * 多级表头 Excel 导出（适配 Tabulator CDN 表格，不依赖 Vue / ag-grid）
 */
export function useExportMultipleHeaderExcel(
  options: UseExportMultipleHeaderExcelOptions,
) {
  const { tableApi } = options;

  function getTable(): TableApi {
    const api = tableApi.value;
    if (!api) {
      throw new Error('tableApi is not initialized');
    }
    return api;
  }

  async function getProcessTableData(): Promise<{
    bottomRowsData: Record<string, unknown>[];
    filteredData: Record<string, unknown>[];
  }> {
    const api = getTable();
    // active=true：当前过滤后的可见数据（Tabulator）
    const rows = api.getData(true) || [];
    const filteredData = rows.map((row, index) => {
      const next = { ...row };
      next[SERIAL_NUMBER_EXPORT_PROP] = isNumber(index) ? index + 1 : index;
      return next;
    });
    return { filteredData, bottomRowsData: [] };
  }

  function getTableColumns(): TableColumnDef[] {
    return cloneDeep(getTable().getColumnDefinitions() || []) as TableColumnDef[];
  }

  async function getExcelTableData(): Promise<Record<string, unknown>[]> {
    const api = getTable();
    const selectedRows = api.getSelectedData?.() || [];
    const { filteredData, bottomRowsData } = await getProcessTableData();
    const rawData = selectedRows.length > 0 ? selectedRows : filteredData;
    return [...rawData, ...bottomRowsData];
  }

  /** 将 Tabulator 多级列定义转为 Excel mapping */
  function getExcelTableShowHeaderMapping(): Record<string, unknown> {
    const mapping: Record<string, unknown> = {};
    const cols = getTableColumns();

    const recFun = (
      list: TableColumnDef[],
      mObj: Record<string, unknown> = {},
    ) => {
      list.forEach((col) => {
        const title = col.title;
        const field = col.field;
        const children = col.columns;
        const isShow = col.visible !== false;

        if (field === SERIAL_NUMBER_EXPORT_PROP) {
          if (isShow) {
            mObj[title === '#' ? '序号' : title || '序号'] =
              SERIAL_NUMBER_EXPORT_PROP;
          }
          return;
        }

        if (field && ['operation', 'agTableOperation'].includes(field)) {
          return;
        }

        if (!isShow) return;

        if (children?.length && title) {
          mObj[title] = {};
          recFun(children, mObj[title] as Record<string, unknown>);
          return;
        }

        if (field && title) {
          mObj[title] = field;
        }
      });
    };

    recFun(cols, mapping);
    return mapping;
  }

  async function exportMultipleHeaderExcel(
    exportOptions: MultipleHeaderExcelExportOptions = {},
  ) {
    try {
      const {
        sheetOptions,
        sheets,
        fileName,
        tableData,
        tDataMapping,
        ...restOptions
      } = exportOptions;
      const resolvedFileName = fileName ? String(fileName).trim() : '导出文件';

      const mOptions = getMergeSheetOptions(sheetOptions, restOptions);
      const tData = tableData || (await getExcelTableData());
      const tMapping = tDataMapping || getExcelTableShowHeaderMapping();

      const singleSheet: ExportExcelFileConfig['sheets'] = [
        {
          sheetName: 'sheet',
          mapping: tMapping as ExportExcelFileConfig['sheets'][number]['mapping'],
          rows: tData,
          enableFilter: true,
          columnWidths: {
            [SERIAL_NUMBER_EXPORT_PROP]: 10,
          },
          ...mOptions,
        },
      ];
      const sheetData: ExportExcelFileConfig = {
        fileName: resolvedFileName,
        sheets: isNotEmptyArr(sheets)
          ? (sheets as ExportExcelFileConfig['sheets'])
          : singleSheet,
      };

      if (isFunction(options.beforeExport)) {
        await options.beforeExport(sheetData);
      }

      await exportExcelFile(sheetData);
      options.onSuccess?.(resolvedFileName);
    } catch (error) {
      console.error(error);
      options.onError?.(error);
      throw error;
    }
  }

  return {
    exportMultipleHeaderExcel,
    getExcelTableData,
    getExcelTableShowHeaderMapping,
  };
}
