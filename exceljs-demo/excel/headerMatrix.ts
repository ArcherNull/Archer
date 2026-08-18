export type MappingInput =
  | Map<string, unknown>
  | readonly [string, unknown][]
  | Record<string, unknown>;

export type HeaderMatrixExport = {
  /** 叶子字段 key（用于数据映射） */
  filterVal: string[];
  /** 合并信息（0-based）：[r1, c1, r2, c2] */
  mergeArr: Array<[number, number, number, number]>;
  /** 最后一行真实表头（叶子表头） */
  realHeader: string[];
  /** 多级表头二维数组：每行一个数组（0-based） */
  tHeader: string[][];
};

type HeaderNode = {
  children?: HeaderNode[];
  header: string;
  key?: string;
};

type CellPlacement = {
  col: number;
  colSpan: number;
  row: number;
  rowSpan: number;
  value: string;
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

function mappingToHeaderTree(mapping: MappingInput): HeaderNode[] {
  const result: HeaderNode[] = [];
  for (const [label, value] of toEntries(mapping)) {
    if (isMappingLike(value)) {
      result.push({
        header: label,
        children: mappingToHeaderTree(value as MappingInput),
      });
      continue;
    }
    result.push({ header: label, key: String(value ?? '') });
  }
  return result;
}

function countLeafNodes(nodes: HeaderNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count += node.children?.length ? countLeafNodes(node.children) : 1;
  }
  return count;
}

function getMaxDepth(nodes: HeaderNode[], depth = 1): number {
  let max = depth;
  for (const node of nodes) {
    if (node.children?.length) {
      max = Math.max(max, getMaxDepth(node.children, depth + 1));
    }
  }
  return max;
}

function collectLeaves(
  nodes: HeaderNode[],
  filterVal: string[],
  realHeader: string[],
) {
  for (const node of nodes) {
    if (node.children?.length) {
      collectLeaves(node.children, filterVal, realHeader);
      continue;
    }
    filterVal.push(node.key ?? '');
    realHeader.push(node.header);
  }
}

/**
 * 自顶向下放置表头单元格，每个单元格携带显式 rowSpan / colSpan。
 * 合并区域在构建阶段即互不重叠，无需事后扫描空单元格推断。
 */
function placeHeaderCells(
  nodes: HeaderNode[],
  row: number,
  startCol: number,
  maxDepth: number,
  out: CellPlacement[],
): number {
  let col = startCol;
  for (const node of nodes) {
    if (node.children?.length) {
      const colSpan = countLeafNodes(node.children);
      out.push({
        row,
        col,
        rowSpan: 1,
        colSpan,
        value: node.header,
      });
      col = placeHeaderCells(node.children, row + 1, col, maxDepth, out);
      continue;
    }

    out.push({
      row,
      col,
      rowSpan: maxDepth - row,
      colSpan: 1,
      value: node.header,
    });
    col += 1;
  }
  return col;
}

function buildHeaderGrid(
  maxDepth: number,
  colCount: number,
  placements: CellPlacement[],
  realHeader: string[],
): string[][] {
  const grid = Array.from({ length: maxDepth }, () =>
    Array<string>(colCount).fill(''),
  );

  for (const cell of placements) {
    grid[cell.row]![cell.col] = cell.value;
  }

  if (maxDepth > 0) {
    grid[maxDepth - 1] = [...realHeader];
  }

  return grid;
}

function placementsToMergeArr(
  placements: CellPlacement[],
): Array<[number, number, number, number]> {
  return placements
    .filter((cell) => cell.rowSpan > 1 || cell.colSpan > 1)
    .map(
      (cell) =>
        [
          cell.row,
          cell.col,
          cell.row + cell.rowSpan - 1,
          cell.col + cell.colSpan - 1,
        ] as [number, number, number, number],
    );
}

/**
 * 把 mapping（Object / Map / entries）转换为等长二维表头与合并信息。
 *
 * 实现思路（与 HTML 表格 colspan/rowspan 一致）：
 * 1. mapping → 表头树
 * 2. 树遍历时为每个节点计算精确 span 并落位
 * 3. 由落位结果直接生成 mergeArr，天然无重叠
 */
export function mappingToHeaderMatrix(
  mapping: MappingInput,
): HeaderMatrixExport {
  const tree = mappingToHeaderTree(mapping);
  const maxDepth = getMaxDepth(tree);
  const colCount = countLeafNodes(tree);

  const filterVal: string[] = [];
  const realHeader: string[] = [];
  collectLeaves(tree, filterVal, realHeader);

  if (colCount === 0) {
    return { tHeader: [], filterVal, realHeader, mergeArr: [] };
  }

  const placements: CellPlacement[] = [];
  placeHeaderCells(tree, 0, 0, maxDepth, placements);

  const tHeader = buildHeaderGrid(maxDepth, colCount, placements, realHeader);
  const mergeArr = placementsToMergeArr(placements);

  return { tHeader, filterVal, realHeader, mergeArr };
}
