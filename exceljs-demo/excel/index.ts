import type { Alignment, Cell, Font, Workbook, Worksheet } from 'exceljs';

// import ExcelJS from 'exceljs';
import { mappingToHeaderMatrix } from './headerMatrix';

type Key = string;

export type MappingInput =
  | Map<string, unknown>
  | readonly [string, unknown][]
  | Record<string, unknown>;

export type RowInput = Map<string, unknown> | Record<string, unknown>;

export type HeaderStyle = {
  alignment?: Partial<Alignment>;
  border?: any;
  fill?: any;
  font?: Partial<Font>;
};

export type CellStyle = {
  alignment?: Partial<Alignment>;
  border?: any;
  fill?: any;
  font?: Partial<Font>;
  numFmt?: string;
};

export type ColumnStyleFn = (args: {
  field: Key;
  row: RowInput;
  rowIndex: number; // 0-based on input data
  value: unknown;
}) => CellStyle | undefined;

export type RowStyleFn = (args: {
  row: RowInput;
  rowIndex: number; // 0-based on input data
}) => CellStyle | undefined;

/** 列导出：将原始单元格值转为写入 Excel 的值（如 `Date`、数字等） */
export type ColumnNumFmtValFmtFn = (val: unknown, row: RowInput) => unknown;

/**
 * 列数字格式配置：
 * - 字符串：仅设置列 `numFmt`；
 * - 对象：设置 `numFmt`，可选 `valFmt` 在导出时改写该列单元格写入值。
 */
export type ColumnNumFmtConfig =
  | string
  | {
      numFmt: string;
      valFmt?: ColumnNumFmtValFmtFn;
    };

function parseColumnNumFmtSpec(spec: ColumnNumFmtConfig | undefined): {
  numFmt?: string;
  valFmt?: ColumnNumFmtValFmtFn;
} {
  if (spec === undefined || spec === null) return {};
  if (typeof spec === 'string') {
    const s = spec.trim();
    return s ? { numFmt: s } : {};
  }
  if (isPlainObject(spec)) {
    const o = spec as Record<string, unknown>;
    const numFmtRaw = o.numFmt;
    const numFmt =
      typeof numFmtRaw === 'string'
        ? numFmtRaw.trim()
        : String(numFmtRaw ?? '').trim();
    const valFmt = o.valFmt;
    return {
      ...(numFmt ? { numFmt } : {}),
      ...(typeof valFmt === 'function'
        ? { valFmt: valFmt as ColumnNumFmtValFmtFn }
        : {}),
    };
  }
  return {};
}

/** 按数据行返回行高；返回 undefined 时使用 defaultRowHeight */
export type RowHeightFn = (args: {
  row: RowInput;
  rowIndex: number; // 0-based，与 rows 数组下标一致
}) => number | undefined;

export type RowHeightsSpec =
  | Map<number, number>
  | Record<number, number>
  | RowHeightFn;

const DEFAULT_ROW_HEIGHT = 20;

function isValidRowHeight(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 5;
}

function normalizeRowHeightValue(value: unknown, fallback: number): number {
  return isValidRowHeight(value) ? value : fallback;
}

function normalizeDefaultRowHeight(value: unknown): number {
  return normalizeRowHeightValue(value, DEFAULT_ROW_HEIGHT);
}

function lookupRowHeightsMap(
  spec: Map<number, number> | Record<number, number>,
  rowIndex: number,
): unknown {
  if (spec instanceof Map) {
    const m = spec as Map<unknown, unknown>;
    return m.get(rowIndex) ?? m.get(String(rowIndex));
  }
  const rec = spec as Record<number | string, unknown>;
  return rec[rowIndex] ?? rec[String(rowIndex)];
}

function rowHeightsSpecHasIndex(
  spec: Map<number, number> | Record<number, number>,
  rowIndex: number,
): boolean {
  if (spec instanceof Map) {
    const m = spec as Map<unknown, unknown>;
    return m.has(rowIndex) || m.has(String(rowIndex));
  }
  const rec = spec as Record<number | string, unknown>;
  return (
    Object.prototype.hasOwnProperty.call(rec, String(rowIndex)) ||
    Object.prototype.hasOwnProperty.call(rec, rowIndex)
  );
}

export type ExcelSheetOptions = {
  /**
   * 叶子列数字格式（Excel `numFmt`），与 `columnWidths` 一样按列 key 配置。
   * - 传字符串：仅设置列 `style.numFmt`；
   * - 传 `{ numFmt, valFmt? }`：同时设置列格式，并在导出时用 `valFmt(原始值, 当前行)` 写入单元格值。
   * `numFmt` 示例：`yyyy-mm-dd`、`yyyy-mm-dd hh:mm:ss`、`0.00`、`0.00%` 等。
   * 语义分类可参考：general、number、currency、accounting、date、time、percentage、
   * fraction、scientific、text、special、custom（实际仍为上述格式字符串）。
   */
  columnNumFmts?: Record<Key, ColumnNumFmtConfig>;
  /**
   * 叶子列样式（按单元格回调）
   */
  columnStyle?: ColumnStyleFn;
  /**
   * 叶子列宽覆盖：key -> width
   */
  columnWidths?: Record<Key, number>;
  /**
   * 数据区默认单元格样式（例如：对齐、边框）
   */
  dataCellStyle?: CellStyle;
  /**
   * 全局默认列宽（叶子列）
   */
  defaultColumnWidth?: number;
  /**
   * 数据区与表头默认行高；未设置或值非法（非有限数字或小于 5）时按 20
   */
  defaultRowHeight?: number;
  /**
   * 不传则默认：表头最后一行作为 filter 行
   */
  enableFilter?: boolean;
  /**
   * 冻结窗口（默认冻结表头最后一行）
   */
  freezeHeader?: boolean;
  /**
   * 表头起始行（默认1）
   */
  headerStartRow?: number;
  /**
   * 表头样式（会应用到表头所有单元格，包括被 merge 的区域）
   */
  headerStyle?: HeaderStyle;
  mapping: MappingInput;
  /**
   * 按数据行索引（0 起，与 rows 一致）设置行高；可为 Record、Map 或函数。
   * 未配置到的行用 defaultRowHeight；映射值非法（非有限数字或小于 5）时按 20。
   * 回调返回非法值时同样按 20。
   */
  rowHeights?: RowHeightsSpec;
  rows: RowInput[];
  /**
   * 行样式（整行同一个 style；若 columnStyle 也返回 fill，则 columnStyle 优先）
   */
  rowStyle?: RowStyleFn;
  sheetName: string;
};

export type ExcelExportOptions = {
  fileName: string;
  sheets: ExcelSheetOptions[];
};

type HeaderNode = {
  children?: HeaderNode[];
  header: string;
  key?: Key;
  /** Excel 列数字格式（与 columnNumFmts 一致） */
  numFmt?: string;
  width?: number;
};

type LeafColumn = {
  header: string;
  key: Key;
  numFmt?: string;
  width?: number;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Map)
  );
}

function toEntries(mapping: MappingInput): [string, unknown][] {
  if (mapping instanceof Map) return [...mapping.entries()];
  if (Array.isArray(mapping)) return [...mapping] as [string, unknown][];
  if (isPlainObject(mapping)) return Object.entries(mapping);
  return [];
}

function isMappingLike(value: unknown): value is MappingInput {
  return value instanceof Map || Array.isArray(value) || isPlainObject(value);
}

export function getFromRow(row: RowInput, key: string) {
  return row instanceof Map ? row.get(key) : (row as any)[key];
}

function setToRow(obj: Record<string, unknown>, key: string, value: unknown) {
  (obj as any)[key] = value;
}

function normalizeRowsToObjects(rows: RowInput[], leafKeys: string[]) {
  return rows?.map((row) => {
    if (!(row instanceof Map)) return row as Record<string, unknown>;
    const obj: Record<string, unknown> = {};
    for (const k of leafKeys) setToRow(obj, k, row.get(k));
    return obj;
  });
}

function countLeafNodes(items: HeaderNode[]) {
  let count = 0;
  for (const item of items) {
    count += item.children?.length ? countLeafNodes(item.children) : 1;
  }
  return count;
}

function getDepth(items: HeaderNode[], currentDepth = 1): number {
  let max = currentDepth;
  for (const item of items) {
    if (item.children?.length) {
      max = Math.max(max, getDepth(item.children, currentDepth + 1));
    }
  }
  return max;
}

function flattenLeaves(items: HeaderNode[], out: LeafColumn[] = []) {
  for (const item of items) {
    if (item.children?.length) flattenLeaves(item.children, out);
    else {
      if (!item.key) {
        throw new Error(`叶子节点缺少 key：${item.header}`);
      }
      out.push({
        header: item.header,
        key: item.key,
        numFmt: item.numFmt,
        width: item.width,
      });
    }
  }
  return out;
}

export function mappingToHeaderTree(
  mapping: MappingInput,
  opts: {
    columnNumFmts?: Record<string, ColumnNumFmtConfig>;
    columnWidths?: Record<string, number>;
    defaultColumnWidth?: number;
  },
): HeaderNode[] {
  const result: HeaderNode[] = [];
  for (const [label, value] of toEntries(mapping)) {
    if (isMappingLike(value)) {
      result.push({
        header: label,
        children: mappingToHeaderTree(value as MappingInput, opts),
      });
      continue;
    }
    const key = String(value ?? '');
    const width =
      opts.columnWidths?.[key] ??
      (typeof opts.defaultColumnWidth === 'number'
        ? opts.defaultColumnWidth
        : undefined);
    const { numFmt } = parseColumnNumFmtSpec(opts.columnNumFmts?.[key]);
    result.push({
      header: label,
      key,
      width,
      ...(numFmt ? { numFmt } : {}),
    });
  }
  return result;
}

function applyCellStyle(cell: Cell, style?: CellStyle | HeaderStyle) {
  if (!style) return;
  if (style.font) cell.font = style.font as any;
  if (style.alignment) cell.alignment = style.alignment as any;
  if ((style as any).fill) cell.fill = (style as any).fill;
  if ((style as any).border) cell.border = (style as any).border;
  if ((style as any).numFmt) (cell as any).numFmt = (style as any).numFmt;
}

function applyStyleToRange(
  worksheet: Worksheet,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  style?: CellStyle | HeaderStyle,
) {
  if (!style) return;
  for (let r = r1; r <= r2; r++) {
    const row = worksheet.getRow(r);
    for (let c = c1; c <= c2; c++) {
      const cell = row.getCell(c);
      applyCellStyle(cell, style);
    }
  }
}

function getDefaultHeaderStyle(): HeaderStyle {
  return {
    font: { bold: true, size: 12 },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' },
    },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  };
}

function buildMultiLevelHeaderFromMapping(args: {
  headerStyle?: HeaderStyle;
  mapping: MappingInput;
  startRow: number;
  worksheet: Worksheet;
}): { headerEndRow: number; leafColumns: LeafColumn[] } {
  const { worksheet, mapping, startRow, headerStyle } = args;

  const { tHeader, filterVal, realHeader, mergeArr } =
    mappingToHeaderMatrix(mapping);

  const headerRowCount = tHeader.length;
  const headerColCount = filterVal.length;
  const headerEndRow = startRow + headerRowCount - 1;

  const style = { ...getDefaultHeaderStyle(), ...headerStyle };

  // 写入二维表头
  for (let r = 0; r < headerRowCount; r++) {
    const excelRow = worksheet.getRow(startRow + r);
    for (let c = 0; c < headerColCount; c++) {
      const cell = excelRow.getCell(1 + c);
      cell.value = tHeader[r]?.[c] ?? '';
    }
  }

  // 行列合并（0-based -> 1-based + startRow 偏移）
  for (const [r1, c1, r2, c2] of mergeArr) {
    worksheet.mergeCells(startRow + r1, 1 + c1, startRow + r2, 1 + c2);
  }

  // 表头区域整体样式（包含合并区域）
  applyStyleToRange(
    worksheet,
    startRow,
    1,
    headerEndRow,
    headerColCount,
    style,
  );

  const leafColumns: LeafColumn[] = filterVal.map((key, i) => ({
    key,
    header: realHeader[i] ?? '',
  }));

  return { headerEndRow, leafColumns };
}

export function buildMultiLevelHeader(args: {
  headers: HeaderNode[];
  headerStyle?: HeaderStyle;
  startRow: number;
  worksheet: Worksheet;
}): { headerEndRow: number; leafColumns: LeafColumn[] } {
  const { worksheet, headers, startRow, headerStyle } = args;
  const maxDepth = getDepth(headers);

  const headerData: { span: number; value: string }[][] = Array.from(
    { length: maxDepth },
    () => [],
  );

  function walk(items: HeaderNode[], depth = 0) {
    for (const item of items) {
      if (item.children?.length) {
        const span = countLeafNodes(item.children);
        headerData[depth]?.push({ value: item.header, span });
        walk(item.children, depth + 1);
      } else {
        headerData[depth]?.push({ value: item.header, span: 1 });
        for (let i = depth + 1; i < maxDepth; i++) {
          headerData[i]?.push({ value: '', span: 1 });
        }
      }
    }
  }

  walk(headers);

  const defaultHeaderStyle: HeaderStyle = {
    font: { bold: true, size: 12 },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' },
    },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  const style = { ...defaultHeaderStyle, ...headerStyle };

  let currentCol = 1;
  for (const [rowIndex, row] of headerData.entries()) {
    const excelRow = worksheet.getRow(startRow + rowIndex);
    for (const cell of row) {
      const c1 = currentCol;
      const r1 = startRow + rowIndex;
      const c2 = currentCol + cell.span - 1;
      const r2 = r1;

      const cellRef = excelRow.getCell(currentCol);
      cellRef.value = cell.value;

      if (cell.span > 1) {
        worksheet.mergeCells(r1, c1, r2, c2);
      }

      applyStyleToRange(worksheet, r1, c1, r2, c2, style);
      currentCol += cell.span;
    }
    currentCol = 1;
  }

  const headerEndRow = startRow + maxDepth - 1;
  const leafColumns = flattenLeaves(headers);
  return { headerEndRow, leafColumns };
}

function setAutoFilter(args: {
  columnCount: number;
  filterRow: number;
  worksheet: Worksheet;
}) {
  const { worksheet, filterRow, columnCount } = args;
  if (columnCount <= 0) return;
  worksheet.autoFilter = {
    from: { row: filterRow, column: 1 },
    to: { row: filterRow, column: columnCount },
  };
}

function applyBordersToRowCells(worksheet: Worksheet, rowNumber: number) {
  const row = worksheet.getRow(rowNumber);
  row.eachCell({ includeEmpty: true }, (cell) => {
    if (!cell.border) {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
  });
}

function resolveDataRowHeight(
  options: ExcelSheetOptions,
  rowIndex: number,
  rowInput: RowInput,
  fallback: number,
): number {
  const spec = options.rowHeights;
  if (spec === undefined || spec === null) return fallback;
  if (typeof spec === 'function') {
    const h = spec({ row: rowInput, rowIndex });
    // 与对象分支一致：非法行高按 20
    return normalizeRowHeightValue(h, DEFAULT_ROW_HEIGHT);
  }
  if (!rowHeightsSpecHasIndex(spec, rowIndex)) return fallback;
  const raw = lookupRowHeightsMap(spec, rowIndex);
  // 键存在但值非法时按 20（非 defaultRowHeight）
  return normalizeRowHeightValue(raw, DEFAULT_ROW_HEIGHT);
}

/** dataCellStyle 开启自动换行时不强行写行高，由 Excel 按内容撑开（仍尊重 rowHeights 显式值） */
function isDataCellWrapTextEnabled(options: ExcelSheetOptions): boolean {
  return options.dataCellStyle?.alignment?.wrapText === true;
}

/** 仅从 rowHeights 取有效数字；无配置或非法时返回 undefined */
function getExplicitDataRowHeight(
  options: ExcelSheetOptions,
  rowIndex: number,
  rowInput: RowInput,
): number | undefined {
  const spec = options.rowHeights;
  if (spec === undefined || spec === null) return undefined;
  if (typeof spec === 'function') {
    const h = spec({ row: rowInput, rowIndex });
    return isValidRowHeight(h) ? h : undefined;
  }
  if (!rowHeightsSpecHasIndex(spec, rowIndex)) return undefined;
  const raw = lookupRowHeightsMap(spec, rowIndex);
  return isValidRowHeight(raw) ? raw : undefined;
}

function buildWorksheet(workbook: Workbook, options: ExcelSheetOptions) {
  const worksheet = workbook.addWorksheet(options.sheetName);

  const defaultRowHeight = normalizeDefaultRowHeight(options.defaultRowHeight);
  const mergedHeaderStyle = {
    ...getDefaultHeaderStyle(),
    ...options.headerStyle,
  };
  const skipForcedHeaderRowHeight =
    mergedHeaderStyle.alignment?.wrapText === true;

  const headerStartRow = options.headerStartRow ?? 1;
  const { headerEndRow, leafColumns } = buildMultiLevelHeaderFromMapping({
    worksheet,
    mapping: options.mapping,
    startRow: headerStartRow,
    headerStyle: options.headerStyle,
  });

  // 注意：如果设置了 columns[].header，exceljs 会自动把第 1 行写成“列头”，
  // 这会覆盖我们自己渲染的多级表头（导致第一行变成叶子表头）。
  // 所以这里仅设置 key/width，让表头完全由 buildMultiLevelHeaderFromMapping 负责。
  worksheet.columns = leafColumns.map((c) => {
    const { numFmt: numFmtFromSpec } = parseColumnNumFmtSpec(
      options.columnNumFmts?.[c.key] ?? c.numFmt,
    );
    const width =
      options.columnWidths?.[c.key] ??
      c.width ??
      options.defaultColumnWidth ??
      16;
    const col: {
      key: string;
      style?: { numFmt: string };
      width: number;
    } = { key: c.key, width };
    if (numFmtFromSpec && numFmtFromSpec.trim() !== '') {
      col.style = { numFmt: numFmtFromSpec.trim() };
    }
    return col;
  });

  // 冻结表头
  if (options.freezeHeader !== false) {
    worksheet.views = [{ state: 'frozen', ySplit: headerEndRow }];
  }

  // filter 行默认是表头最后一行
  if (options.enableFilter) {
    setAutoFilter({
      worksheet,
      filterRow: headerEndRow,
      columnCount: leafColumns.length,
    });
  }

  const leafKeys = leafColumns.map((c) => c.key);
  const rowsAsObjects = normalizeRowsToObjects(options.rows, leafKeys);

  // 数据写入从 headerEndRow+1 开始
  const dataStartRow = headerEndRow + 1;
  for (const [i, rowsAsObject] of rowsAsObjects.entries()) {
    worksheet.addRow(rowsAsObject);
    const excelRowNumber = dataStartRow + i;
    const rowInput = options.rows[i] ?? {};

    const rowStyle = options.rowStyle?.({
      row: rowInput as RowInput,
      rowIndex: i,
    });

    applyBordersToRowCells(worksheet, excelRowNumber);

    const excelRow = worksheet.getRow(excelRowNumber);
    if (isDataCellWrapTextEnabled(options)) {
      const explicitH = getExplicitDataRowHeight(
        options,
        i,
        rowInput as RowInput,
      );
      if (explicitH !== undefined) excelRow.height = explicitH;
    } else {
      excelRow.height = resolveDataRowHeight(
        options,
        i,
        rowInput as RowInput,
        defaultRowHeight,
      );
    }
    // 注意：exceljs 的 eachCell(includeEmpty) 只会遍历到 row.cellCount，
    // 如果某些列值为 undefined/空，可能导致“整行底色”看起来不生效。
    // 所以这里按 columnCount 全量遍历，确保 rowStyle 覆盖整行每个单元格。
    const colCount = worksheet.columnCount;
    for (let colNumber = 1; colNumber <= colCount; colNumber++) {
      const cell = excelRow.getCell(colNumber);
      const fieldKey = String(worksheet.columns[colNumber - 1]?.key ?? '');
      const rawValue = getFromRow(rowInput, fieldKey);
      const { valFmt } = parseColumnNumFmtSpec(
        options.columnNumFmts?.[fieldKey],
      );
      let value: unknown = rawValue;
      if (valFmt) {
        try {
          value = valFmt(rawValue, rowInput as RowInput);
        } catch {
          value = rawValue;
        }
        (cell as any).value = value;
      }

      // 基础数据样式
      applyCellStyle(cell, options.dataCellStyle);

      // 行样式
      if (rowStyle) applyCellStyle(cell, rowStyle);

      // 列/单元格样式（优先级最高）
      if (fieldKey && options.columnStyle) {
        const cStyle = options.columnStyle({
          field: fieldKey,
          value,
          row: rowInput,
          rowIndex: i,
        });
        if (cStyle) applyCellStyle(cell, cStyle);
      }
    }
  }

  // 表头行高：无自动换行时写入 defaultRowHeight；开启换行时不强行设置行高
  if (!skipForcedHeaderRowHeight) {
    for (let r = headerStartRow; r <= headerEndRow; r++) {
      const row = worksheet.getRow(r);
      row.height = row.height ?? defaultRowHeight;
    }
  }

  return worksheet;
}

export async function exportExcelWorkbook(options: ExcelExportOptions) {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  // console.log('exportExcelWorkbook=====>', options);
  for (const sheet of options.sheets) buildWorksheet(workbook, sheet);
  return workbook;
}

// -------------------------
//  nodejs 测试：普通对象 mapping + Map mapping
// -------------------------

export async function runDemo() {
  const testRowsObject: Record<string, unknown>[] = [
    {
      username: 'user1',
      phoneNumber: '13800138000',
      email: 'user1@example.com',
      realName: '张三',
      idCardNo: '110101199001011234',
      latestLoginTime: '2024-01-01 12:00:00',
      latestLoginType: '手机登录',
      score: 91,
    },
    {
      username: 'user2',
      phoneNumber: '13800138001',
      email: 'user2@example.com',
      realName: '李四',
      idCardNo: '110101199001011235',
      latestLoginTime: '2024-01-02 13:00:00',
      latestLoginType: '邮箱登录',
      score: 58,
    },
    {
      username: 'user8',
      phoneNumber: '13800138008',
      email: 'user8@example.com',
      realName: '王五',
      idCardNo: '110101199001011238',
      latestLoginTime: '2024-01-08 09:30:00',
      latestLoginType: '密码登录',
      score: 76,
    },
  ];

  const mappingObject: Record<string, unknown> = {
    基础信息: {
      用户名称: 'username',
      手机号: 'phoneNumber',
      邮箱: 'email',
    },
    敏感信息: {
      真实姓名: 'realName',
      身份证: 'idCardNo',
    },
    登录信息: {
      最近登录时间: 'latestLoginTime',
      最近登录方式: 'latestLoginType',
    },
    评分: 'score',
  };

  const mapSheetMapping = new Map<string, unknown>([
    [
      '好信息表',
      new Map<string, unknown>([
        [
          '基础信息',
          new Map<string, unknown>([
            ['手机号', 'phoneNumber'],
            ['用户名称', 'username'],
          ]),
        ],
        [
          '标准信息',
          new Map<string, unknown>([
            ['最近登录方式', 'latestLoginType'],
            ['最近登录时间', 'latestLoginTime'],
            ['邮箱', 'email'],
          ]),
        ],
      ]),
    ],
    [
      '用户表',
      new Map<string, unknown>([
        [
          '基础信息',
          new Map<string, unknown>([
            ['手机号', 'phoneNumber'],
            ['最近登录方式', 'latestLoginType'],
            ['最近登录时间', 'latestLoginTime'],
            ['用户名称', 'username'],
            ['真实姓名', 'realName'],
            ['身份证', 'idCardNo'],
            ['邮箱', 'email'],
          ]),
        ],
      ]),
    ],
  ]);

  const testRowsMap: Map<string, unknown>[] = testRowsObject.map((r) => {
    const m = new Map<string, unknown>();
    for (const [k, v] of Object.entries(r)) m.set(k, v);
    return m;
  });

  const workbook = await exportExcelWorkbook({
    fileName: 'newGenerateExcel-demo',
    sheets: [
      {
        sheetName: '对象Mapping',
        mapping: mappingObject,
        rows: testRowsObject,
        enableFilter: true,
        defaultColumnWidth: 18,
        columnWidths: {
          username: 14,
          phoneNumber: 16,
          email: 22,
          realName: 12,
          idCardNo: 22,
          latestLoginTime: 20,
          latestLoginType: 14,
          score: 10,
        },
        headerStyle: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF100' },
          },
        },
        dataCellStyle: {
          alignment: { vertical: 'middle', horizontal: 'center' },
        },
        rowStyle: ({ row }) => {
          const username = getFromRow(row, 'username');
          if (username === 'user8') {
            return {
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF008AFF' },
              },
            };
          }
        },
        columnStyle: ({ field, value }) => {
          if (field === 'score' && typeof value === 'number' && value < 60) {
            return {
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFE7E6' },
              },
              font: { bold: true, color: { argb: 'FFCF1322' } },
            };
          }
          if (field === 'username') {
            return {
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD9F7BE' },
              },
            };
          }
        },
      },
      {
        sheetName: '多列头合并(单Sheet)',
        mapping: mapSheetMapping,
        rows: testRowsMap,
        enableFilter: true,
        defaultColumnWidth: 18,
        headerStyle: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEFEFEF' },
          },
        },
        dataCellStyle: {
          alignment: { vertical: 'middle', horizontal: 'left' },
        },
      },
    ],
  });

  const outName = `newGenerateExcel-demo-${Date.now()}.xlsx`;
  await workbook.xlsx.writeFile(outName);

  console.log(`Excel文件已生成: ${outName}`);
}
