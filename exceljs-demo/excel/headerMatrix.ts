export type MappingInput =
  | Map<string, unknown>
  | readonly [string, unknown][]
  | Record<string, unknown>;

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

export type HeaderMatrixExport = {
  /**
   * 叶子字段 key（用于数据映射）
   */
  filterVal: string[];
  /**
   * 合并信息（0-based）：[r1,c1,r2,c2]
   */
  mergeArr: Array<[number, number, number, number]>;
  /**
   * 最后一行真实表头（叶子表头）
   */
  realHeader: string[];
  /**
   * 多级表头二维数组：每行一个数组（0-based）
   */
  tHeader: string[][];
};

/**
 * @description
 * 把 mapping（Object/Map/entries）转换为：
 * - 等长二维表头 tHeader
 * - 合并 mergeArr（0-based）
 */
export function mappingToHeaderMatrix(
  mapping: MappingInput,
): HeaderMatrixExport {
  const tHeaderRaw: unknown[][] = [];
  const filterVal: string[] = [];
  const realHeader: string[] = [];

  const recFun = (node: MappingInput, rowInd = 0) => {
    const entries = toEntries(node);
    if (entries.length === 0) return;

    if (!tHeaderRaw[rowInd]) tHeaderRaw[rowInd] = [];

    for (const [i, [headerName, field]] of entries.entries()) {
      const cLen = filterVal.length;

      if (rowInd === 0) {
        tHeaderRaw[rowInd][cLen] = headerName;
      } else {
        const slot = tHeaderRaw[rowInd][cLen];
        if (!Array.isArray(slot)) tHeaderRaw[rowInd][cLen] = [];
        (tHeaderRaw[rowInd][cLen] as unknown[])[i] = headerName;
      }

      if (isMappingLike(field)) {
        recFun(field as MappingInput, rowInd + 1);
      } else {
        filterVal.push(String(field ?? ''));
        realHeader.push(headerName);
      }
    }
  };

  recFun(mapping);

  // 扁平化 + 最后一行强制为 realHeader
  const tHeader = tHeaderRaw.map((row) => [...row].flat() as string[]);
  if (tHeader.length > 0) tHeader[tHeader.length - 1] = realHeader;

  // 填充为等长二维数组
  const headerColLen = filterVal.length;
  const newTHeader = tHeader.map((row) =>
    Array.from({ length: headerColLen }, (_, ind) => row[ind] || ''),
  );

  // 计算 mergeArr
  const headerXLen = headerColLen - 1;
  const headerYLen = newTHeader.length - 1;
  const mergeArr: Array<[number, number, number, number]> = [];

  newTHeader.forEach((row, rowInd) => {
    let colThisIndex = 0;
    row.forEach((cell, colInd, cellArr) => {
      if (!cell) return;

      let colSpanIndex = colInd;
      let rowSpanIndex = rowInd;

      // 行合并：同一行向右扩展（直到下一个非空且不等的单元格）
      const rowNextVal = row[colInd + 1];
      if (
        colInd !== headerXLen &&
        colInd >= colThisIndex &&
        (!rowNextVal || rowNextVal === cell)
      ) {
        let end = headerXLen;
        for (let j = colInd + 1; j <= headerXLen; j++) {
          const next = cellArr[j];
          if (next && next !== cell) {
            end = j - 1;
            break;
          }
        }
        colSpanIndex = end;
        colThisIndex = colSpanIndex;
      }

      // 列合并：同一列向下扩展（同值才合并）
      if (rowInd !== headerYLen) {
        while (rowSpanIndex < headerYLen) {
          const nextRow = newTHeader[rowSpanIndex + 1];
          const nextVal = nextRow?.[colInd];
          // 空值，以及相等值合并，但是不超过headerYLen
          if ((nextVal && nextVal === cell) || !nextVal) {
            rowSpanIndex++;
            if (rowSpanIndex > headerYLen) break;
          }
          else break;
        }
      }

      if (colSpanIndex !== colInd || rowSpanIndex !== rowInd) {
        mergeArr.push([rowInd, colInd, rowSpanIndex, colSpanIndex]);
      }
    });
  });

  return {
    tHeader: newTHeader,
    filterVal,
    realHeader,
    mergeArr,
  };
}
