import { describe, expect, it } from 'vitest';

import { mappingToHeaderMatrix } from './newHeaderMatrix';

function validateMergeArr(arr: Array<[number, number, number, number]>) {
  for (let i = 0; i < arr.length; i++) {
    const [r1, c1, r2, c2] = arr[i]!;
    for (let j = i + 1; j < arr.length; j++) {
      const [r3, c3, r4, c4] = arr[j]!;
      if (r1 <= r4 && r3 <= r2 && c1 <= c4 && c3 <= c2) {
        return {
          valid: false,
          error: `第 ${i} 个方格 [${r1},${c1},${r2},${c2}] 与第 ${j} 个方格 [${r3},${c3},${r4},${c4}] 重叠`,
        };
      }
    }
  }
  return { valid: true };
}

describe('mappingToHeaderMatrix (newHeaderMatrix)', () => {
  it('深层表头后追加浅层动态列时不产生重叠合并', () => {
    const mapping: Record<string, unknown> = {
      月累计: {
        毛利: {
          订单毛利: 'outsourcingGrossProfit',
          外贸毛利: 'fullTruckGrossProfit',
        },
        利润: {
          费用预算: 'costEstimate',
          收入合计: 'totalIncome',
        },
      },
      新列1: {
        '新列1-1': 'newColumn1_1',
        '新列1-2': 'newColumn1_2',
      },
      新列2: 'newColumn2',
      新列3: 'newColumn3',
    };

    const { mergeArr, tHeader, filterVal } = mappingToHeaderMatrix(mapping);

    expect(validateMergeArr(mergeArr).valid).toBe(true);
    expect(filterVal).toHaveLength(8);
    expect(tHeader).toHaveLength(3);
    expect(tHeader[0]).toEqual([
      '月累计',
      '',
      '',
      '',
      '新列1',
      '',
      '新列2',
      '新列3',
    ]);
    expect(mergeArr).toContainEqual([0, 6, 2, 6]);
    expect(mergeArr).toContainEqual([0, 7, 2, 7]);
    expect(mergeArr).not.toContainEqual([1, 5, 2, 7]);
  });

  it('原有三级表头合并区域仍完整且无重叠', () => {
    const mapping: Record<string, unknown> = {
      一级: {
        二级A: {
          叶子1: 'f1',
          叶子2: 'f2',
        },
        二级B: {
          叶子3: 'f3',
        },
      },
    };

    const { mergeArr } = mappingToHeaderMatrix(mapping);

    expect(validateMergeArr(mergeArr).valid).toBe(true);
    expect(mergeArr).toContainEqual([0, 0, 0, 2]);
    expect(mergeArr).toContainEqual([1, 0, 1, 1]);
  });

  it('支持 Map 类型 mapping', () => {
    const mapping = new Map<string, unknown>([
      ['分组', new Map<string, unknown>([['列A', 'a'], ['列B', 'b']])],
      ['单列', 'c'],
    ]);

    const { filterVal, mergeArr } = mappingToHeaderMatrix(mapping);

    expect(filterVal).toEqual(['a', 'b', 'c']);
    expect(validateMergeArr(mergeArr).valid).toBe(true);
    expect(mergeArr).toContainEqual([0, 2, 1, 2]);
  });

  it('单级表头不产生合并', () => {
    const mapping = { 姓名: 'name', 年龄: 'age' };
    const { mergeArr, tHeader } = mappingToHeaderMatrix(mapping);

    expect(mergeArr).toEqual([]);
    expect(tHeader).toEqual([['姓名', '年龄']]);
  });
});
