/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-12-12 09:30:49
 * @LastEditTime: 2024-12-12 09:32:04
 * @Description:
 */
import { convertNumber } from '#/comm/math/index';

import { getNestedProperty } from './index';

export function renderMoneyCell(scope: any, field: string) {
  const row = scope?.row;
  const defaultVal = '---';
  if (row) {
    const val = getNestedProperty(row, field);
    if (val) {
      const nVal = convertNumber(val);
      return <span style={{ color: nVal < 0 ? '#f00' : '' }}>{nVal}</span>;
    }
  }
  return defaultVal;
}
