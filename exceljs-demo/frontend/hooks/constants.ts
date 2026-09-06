/** 导出用序号列字段名 */
export const SERIAL_NUMBER_EXPORT_PROP = '__serialNumber__';

/** Tabulator 列定义（支持多级 columns） */
export type TableColumnDef = {
  title?: string;
  field?: string;
  visible?: boolean;
  columns?: TableColumnDef[];
  [key: string]: unknown;
};

/** 与 Tabulator 实例兼容的最小 API（便于测试/替换） */
export type TableApi = {
  getData: (activeOnly?: boolean | string) => Record<string, unknown>[];
  getSelectedData: () => Record<string, unknown>[];
  getColumnDefinitions: () => TableColumnDef[];
};
