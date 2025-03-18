import type { ColDef } from 'ag-grid-community';

export type ObejectType = { [key: string]: any };

export interface TableDataOptions {
  columnDefs?: ColDef[];
  rowData: any[] | null;
  autoGroupColumnDef?: null | ObejectType | undefined;
}

export interface DKAgGridProps {
  loading: boolean; // 表格加载loading
  tableDataOptions: TableDataOptions;
  style?: CSSStyleDeclaration | string;
}
