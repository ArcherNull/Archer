<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-20 14:33:09
 * @LastEditTime: 2024-09-20 15:25:07
 * @Description: 
-->
<script lang="ts" setup name="DKTable">
import type { TableColumnCtx } from 'element-plus';

import { computed, useAttrs } from 'vue';

defineOptions({
  // 是否使得组件自动地继承 attribute
  inheritAttrs: false,
});

const attrs = useAttrs();
type CommType = typeof attrs;

export interface CusTableProps extends Partial<TableColumnCtx<CommType>> {
  power?: string;
  btnText?: string;
}

const customizedAttrs = computed(() => {
  const obj = {
    minWidth: 100, // 最小距离
    resizable: true, // 列宽可拖拽
  } as TableColumnCtx<CommType>;
  const data = Object.assign(obj, attrs);
  return data;
});
</script>

<template>
  <el-table-column v-bind="customizedAttrs">
    <template #default="scope">
      <slot :scope="scope"> {{ scope.row[customizedAttrs.prop] }} </slot>
    </template>
  </el-table-column>
</template>
