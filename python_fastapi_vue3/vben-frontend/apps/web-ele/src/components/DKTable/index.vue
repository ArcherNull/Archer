<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-20 14:33:09
 * @LastEditTime: 2024-09-20 15:23:51
 * @Description: 
-->
<script lang="ts" setup name="DKTable">
import type { TableProps } from 'element-plus';

import { computed, defineOptions, ref, useAttrs } from 'vue';

import DKTableColumn from './components/DKTableColumn/index.vue';

defineOptions({
  // 是否使得组件自动地继承 attribute
  inheritAttrs: false,
});

const tableRef = ref(null);
const attrs = useAttrs();
type CommType = typeof attrs;

export interface CusTableProps extends Partial<TableProps<CommType>> {
  power?: string;
  btnText?: string;
}

const customizedAttrs = computed(() => {
  const obj = {
    maxHeight: '100vh',
  } as TableProps<CommType>;
  const data = Object.assign(obj, attrs);
  return data;
});
</script>

<template>
  <el-table ref="tableRef" v-bind="customizedAttrs">
    <DKTableColumn label="name" prop="name" width="180">
      <template #default="{ row }">
        <div style="color: red">{{ row.name }}</div>
      </template>
    </DKTableColumn>
    <DKTableColumn label="age" prop="age" width="180" />
    <DKTableColumn label="address" prop="address" width="500" />
    <!-- <el-table-column
      :filter-method="filterHandler"
      :filters="[
        { text: '2016-05-01', value: '2016-05-01' },
        { text: '2016-05-02', value: '2016-05-02' },
        { text: '2016-05-03', value: '2016-05-03' },
        { text: '2016-05-04', value: '2016-05-04' },
      ]"
      column-key="date"
      label="Date"
      prop="date"
      sortable
      width="180"
    />
    <el-table-column label="Name" prop="name" width="180" />
    <el-table-column :formatter="formatter" label="Address" prop="address" />

    <el-table-column
      :filter-method="filterTag"
      :filters="[
        { text: 'Home', value: 'Home' },
        { text: 'Office', value: 'Office' },
      ]"
      filter-placement="bottom-end"
      label="Tag"
      prop="tag"
      width="100"
    >
      <template #default="scope">
        <el-tag
          :type="scope.row.tag === 'Home' ? '' : 'success'"
          disable-transitions
        >
          {{ scope.row.tag }}
        </el-tag>
      </template>
    </el-table-column> -->
  </el-table>
</template>
