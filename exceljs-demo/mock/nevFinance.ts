import { SERIAL_NUMBER_EXPORT_PROP } from '../frontend/hooks/constants';
import type { ColumnStyleFn, RowStyleFn } from '../excel/index';

/** 新能源车辆财务报表 · 100 叶列 / 4 级表头 / 3500 行 + 合计行 */

export type NevMockRow = Record<string, string | number>;

const ROW_COUNT = 5000;
const LEAF_COUNT = 100;

/** 数值型叶字段（合计行做求和） */
const numericLeafFields: string[] = [];
/** 文本型叶字段 */
const textLeafFields: string[] = [];

const REGIONS = ['华东', '华南', '华北', '西南', '西北', '华中', '东北'];
const PLATFORMS = ['E-Platform 3.0', 'SEA', 'CTP3.0', 'e-GMP', 'PPE'];
const SERIES = ['海豚', '海鸥', '汉EV', '元PLUS', '零跑C10', '阿维塔12', '问界M7'];
const MODELS = ['标准续航', '长续航', '四驱高性能', '智驾版', '激光雷达版'];
const CHANNELS = ['直营门店', '授权经销商', '线上商城', '大客户'];
const CUSTOMER_TYPES = ['个人', '企业', '网约车', '租赁'];
const SETTLEMENT = ['已结算', '部分结算', '待结算', '逾期'];
const SALES_REPS = ['陈晨', '刘洋', '王磊', '赵敏', '周杰', '吴婷', '郑浩', '孙丽'];

/**
 * 语义字段 → 当前 mock 叶字段（供行列样式 / 导出引用）
 * t_015：结算状态；t_019：风险等级；n_020：作「利润」示意列（可出负值）
 */
export const MOCK_STYLE_FIELDS = {
  settlementStatus: 't_015',
  riskLevel: 't_019',
  /** 金额示意列：负值标红 */
  profitLike: 'n_020',
  /** 低额示意列：低于阈值标黄 */
  lowAmountLike: 'n_021',
} as const;

export const LOW_AMOUNT_THRESHOLD = 3000;

/** L1 → 每组 20 叶；L2×4 → L3×5 → L4 叶字段，共 4 级、100 叶列 */
const L1_GROUPS = [
  {
    title: '基础档案',
    l2: ['车辆身份', '组织归属', '车型配置', '档案扩展'],
  },
  {
    title: '销售交付',
    l2: ['订单信息', '交付履约', '渠道客户', '销售扩展'],
  },
  {
    title: '收入体系',
    l2: ['整车收入', '增值服务', '金融保险', '收入扩展'],
  },
  {
    title: '成本费用',
    l2: ['采购成本', '履约成本', '销售费用', '成本扩展'],
  },
  {
    title: '利润结算',
    l2: ['税费利润', '补贴回款', '结算状态', '利润扩展'],
  },
] as const;

const L3_LABELS = ['一组', '二组', '三组', '四组', '五组'];

function pad(n: number, len = 4) {
  return String(n).padStart(len, '0');
}

/** 确定性伪随机，保证刷新数据稳定、生成速度快 */
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function moneyAt(i: number, salt: number, base: number, spread = 0.25) {
  const v = base * (1 + (seeded(i, salt) * 2 - 1) * spread);
  return Math.round(v * 100) / 100;
}

function monthOf(i: number) {
  const m = (i % 12) + 1;
  return `2024-${pad(m, 2)}`;
}

function dateOf(month: string, day: number) {
  return `${month}-${pad(Math.min(day, 28), 2)}`;
}

function isNumericLeaf(field: string): boolean {
  return field.startsWith('n_');
}

/**
 * 构建 4 级 mapping，叶列恰好 100。
 * 叶字段：t_* 文本，n_* 数值
 */
export function buildNevFinanceMapping(): Record<string, unknown> {
  numericLeafFields.length = 0;
  textLeafFields.length = 0;

  const mapping: Record<string, unknown> = {};
  let leafIndex = 0;

  for (const g of L1_GROUPS) {
    const l1: Record<string, unknown> = {};
    for (const l2Title of g.l2) {
      const l2: Record<string, unknown> = {};
      for (let l3i = 0; l3i < L3_LABELS.length; l3i++) {
        const l3Title = `${l2Title}${L3_LABELS[l3i]}`;
        const l3: Record<string, unknown> = {};
        // 每个 L3 下 1 个 L4 叶 → 5*4*5 = 100
        const fieldIdx = leafIndex++;
        const useText =
          fieldIdx < 20 || // 前 20 个偏档案/销售文本
          fieldIdx === 92 ||
          fieldIdx === 93;
        const field = useText ? `t_${pad(fieldIdx, 3)}` : `n_${pad(fieldIdx, 3)}`;
        const leafTitle = useText
          ? `文本指标${pad(fieldIdx + 1, 3)}-${field}`
          : `金额指标${pad(fieldIdx + 1, 3)}-${field}`;
        l3[leafTitle] = field;
        if (useText) textLeafFields.push(field);
        else numericLeafFields.push(field);
        l2[l3Title] = l3;
      }
      l1[l2Title] = l2;
    }
    mapping[g.title] = l1;
  }

  if (leafIndex !== LEAF_COUNT) {
    throw new Error(`叶列数量异常: expect ${LEAF_COUNT}, got ${leafIndex}`);
  }
  return mapping;
}

/** 语义化填充前若干文本列，其余文本列填占位 */
function fillTextField(field: string, i: number): string {
  const idx = Number(field.slice(2));
  const reportMonth = monthOf(i);
  switch (idx) {
    case 0:
      return reportMonth;
    case 1:
      return REGIONS[i % REGIONS.length]!;
    case 2:
      return `D${pad((i % 40) + 1, 3)}`;
    case 3:
      return `${REGIONS[i % REGIONS.length]}新能源体验中心${(i % 40) + 1}`;
    case 4:
      return PLATFORMS[i % PLATFORMS.length]!;
    case 5:
      return SERIES[i % SERIES.length]!;
    case 6:
      return MODELS[i % MODELS.length]!;
    case 7:
      return `LNV${pad(i + 1, 14)}`;
    case 8:
      return `沪A·${pad(10000 + (i % 90000), 5)}`;
    case 9:
      return `SO2024${pad(i + 1, 6)}`;
    case 10:
      return dateOf(reportMonth, 3 + (i % 10));
    case 11:
      return dateOf(reportMonth, 12 + (i % 15));
    case 12:
      return CHANNELS[i % CHANNELS.length]!;
    case 13:
      return CUSTOMER_TYPES[i % CUSTOMER_TYPES.length]!;
    case 14:
      return SALES_REPS[i % SALES_REPS.length]!;
    case 15:
      return SETTLEMENT[i % SETTLEMENT.length]!;
    case 16:
      return i % 2 === 0 ? '是' : '否';
    case 17:
      return ['A', 'B', 'C', 'D'][i % 4]!;
    case 18:
      return `备注-${(i % 50) + 1}`;
    case 19:
      return ['正常', '关注', '风险'][i % 3]!;
    default:
      return `T${pad(idx, 3)}-${(i % 100) + 1}`;
  }
}

function fillNumericField(field: string, i: number): number {
  const idx = Number(field.slice(2));
  const base = 1000 + (idx % 40) * 850 + (i % 9) * 120;
  let v = moneyAt(i, idx + 1, base, 0.35);
  // 利润示意列：约 12% 为负，便于样式演示
  if (field === MOCK_STYLE_FIELDS.profitLike && seeded(i, idx + 99) < 0.12) {
    v = -Math.abs(v);
  }
  // 低额示意列：压到阈值附近，便于黄色高亮
  if (field === MOCK_STYLE_FIELDS.lowAmountLike) {
    v = moneyAt(i, idx + 1, 2500, 0.55);
  }
  return v;
}

/** 生成明细行（不含序号） */
export function buildNevFinanceRows(
  count = ROW_COUNT,
  mapping = buildNevFinanceMapping(),
): NevMockRow[] {
  const leafFields = collectLeafFields(mapping);
  const rows: NevMockRow[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const row: NevMockRow = {};
    for (const field of leafFields) {
      row[field] = isNumericLeaf(field)
        ? fillNumericField(field, i)
        : fillTextField(field, i);
    }
    rows[i] = row;
  }
  return rows;
}

/** 合计行：序号列为「合计」，文本列为空，数值列求和 */
export function buildSummaryRow(
  rows: NevMockRow[],
  mapping: Record<string, unknown>,
): NevMockRow {
  const leafFields = collectLeafFields(mapping);
  const summary: NevMockRow = {
    [SERIAL_NUMBER_EXPORT_PROP]: '合计',
    __isSummary: 1,
  };

  for (const field of leafFields) {
    if (isNumericLeaf(field)) {
      let sum = 0;
      for (const row of rows) {
        const v = row[field];
        if (typeof v === 'number' && Number.isFinite(v)) sum += v;
      }
      summary[field] = Math.round(sum * 100) / 100;
    } else {
      // 含 t_000 等文本列：合计行一律空串（「合计」只写在序号列）
      summary[field] = '';
    }
  }
  return summary;
}

function collectLeafFields(mapping: Record<string, unknown>): string[] {
  const out: string[] = [];
  const walk = (node: Record<string, unknown>) => {
    for (const v of Object.values(node)) {
      if (typeof v === 'string') out.push(v);
      else if (v && typeof v === 'object' && !Array.isArray(v)) {
        walk(v as Record<string, unknown>);
      }
    }
  };
  walk(mapping);
  return out;
}

/** 将 mapping 转为 Tabulator 多级 columns（含 bottomCalc） */
export function mappingToTabulatorColumns(
  mapping: Record<string, unknown>,
): Record<string, unknown>[] {
  const walk = (
    node: Record<string, unknown>,
  ): Record<string, unknown>[] => {
    const list: Record<string, unknown>[] = [];
    for (const [title, val] of Object.entries(node)) {
      if (typeof val === 'string') {
        const col: Record<string, unknown> = {
          title,
          field: val,
          headerFilter: 'input',
          hozAlign: 'center',
          headerHozAlign: 'center',
          minWidth: 110,
        };
        if (isNumericLeaf(val)) {
          col.bottomCalc = 'sum';
          col.bottomCalcParams = { precision: 2 };
          col.formatter = 'money';
          col.formatterParams = {
            thousand: ',',
            decimal: '.',
            precision: 2,
            symbol: '',
          };
          col.bottomCalcFormatter = 'money';
          col.bottomCalcFormatterParams = {
            thousand: ',',
            decimal: '.',
            precision: 2,
            symbol: '',
          };
        }
        list.push(col);
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        list.push({
          title,
          headerHozAlign: 'center',
          columns: walk(val as Record<string, unknown>),
        });
      }
    }
    return list;
  };

  return walk(mapping);
}

/** @deprecated 请使用 mappingToTabulatorColumns */
export function mappingToColumnDefs(mapping: Record<string, unknown>) {
  return mappingToTabulatorColumns(mapping);
}

export function countLeafFields(mapping: Record<string, unknown>): number {
  let n = 0;
  for (const v of Object.values(mapping)) {
    if (typeof v === 'string') n += 1;
    else if (v && typeof v === 'object') {
      n += countLeafFields(v as Record<string, unknown>);
    }
  }
  return n;
}

export function getNevFinanceMock() {
  const mappingBody = buildNevFinanceMapping();
  const rawRows = buildNevFinanceRows(ROW_COUNT, mappingBody);
  const rows = rawRows.map((row, index) => ({
    ...row,
    [SERIAL_NUMBER_EXPORT_PROP]: index + 1,
  }));

  const summaryRow = buildSummaryRow(rows, mappingBody);

  const serialColumn = {
    title: '序号',
    field: SERIAL_NUMBER_EXPORT_PROP,
    hozAlign: 'center',
    headerHozAlign: 'center',
    width: 70,
    minWidth: 70,
    frozen: true,
    headerSort: false,
    headerFilter: false,
    // 函数无法经 JSON 传递，前端会补 bottomCalc 显示「合计」
    bottomCalcLabel: '合计',
  };

  const bodyColumns = mappingToTabulatorColumns(mappingBody);
  const columns = [serialColumn, ...bodyColumns];

  const mapping: Record<string, unknown> = {
    序号: SERIAL_NUMBER_EXPORT_PROP,
    ...mappingBody,
  };

  const leafCount = countLeafFields(mappingBody);

  return {
    title: '新能源车辆财务报表',
    leafColumnCount: leafCount,
    mapping,
    columns,
    rows,
    summaryRow,
  };
}

/** 前后端 Excel 导出共用的行列样式（适配 t_* / n_* 字段） */
export function getNevExcelSheetStyleOptions(numericFields?: string[]): {
  columnWidths: Record<string, number>;
  columnNumFmts: Record<string, string>;
  rowStyle: RowStyleFn;
  columnStyle: ColumnStyleFn;
} {
  const nums =
    numericFields && numericFields.length > 0
      ? numericFields
      : collectLeafFields(buildNevFinanceMapping()).filter((f) =>
          isNumericLeaf(f),
        );

  const columnNumFmts: Record<string, string> = {};
  for (const f of nums) {
    columnNumFmts[f] = '"¥"#,##0.00';
  }

  const { settlementStatus, profitLike, lowAmountLike } = MOCK_STYLE_FIELDS;

  const rowStyle: RowStyleFn = ({ row }) => {
    if (getFromRowLocal(row, SERIAL_NUMBER_EXPORT_PROP) === '合计') return
    const status = getFromRowLocal(row, settlementStatus);
    if (status === '逾期') {
      return {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE7E6' },
        },
      };
    }
  };

  const columnStyle: ColumnStyleFn = ({ field, value, row }) => {
    if (getFromRowLocal(row, SERIAL_NUMBER_EXPORT_PROP) === '合计') {
      return {
        font: { bold: true },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF8E6' },
        },
      };
    }

    if (field === settlementStatus && value === '逾期') {
      return {
        font: { bold: true, color: { argb: 'FFCF1322' } },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCC7' },
        },
      };
    }
    if (field === settlementStatus && value === '已结算') {
      return {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9F7BE' },
        },
      };
    }

    if (
      typeof field === 'string' &&
      field.startsWith('n_') &&
      typeof value === 'number' &&
      value < 0
    ) {
      return {
        font: { bold: true, color: { argb: 'FFCF1322' } },
      };
    }

    if (
      field === lowAmountLike &&
      typeof value === 'number' &&
      value < LOW_AMOUNT_THRESHOLD
    ) {
      return {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF1B8' },
        },
      };
    }

    // profitLike 已含在 n_* 负值规则中；保留引用避免未使用告警
    void profitLike;
  };

  return {
    columnWidths: {
      [SERIAL_NUMBER_EXPORT_PROP]: 8,
      t_000: 12,
      t_003: 22,
      t_007: 20,
      t_015: 12,
      [profitLike]: 14,
      [lowAmountLike]: 14,
    },
    columnNumFmts,
    rowStyle,
    columnStyle,
  };
}

function getFromRowLocal(
  row: Record<string, unknown> | Map<string, unknown>,
  key: string,
) {
  return row instanceof Map ? row.get(key) : row[key];
}
