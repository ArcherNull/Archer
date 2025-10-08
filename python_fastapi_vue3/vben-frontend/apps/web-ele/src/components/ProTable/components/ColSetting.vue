<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-15 15:52:26
 * @LastEditTime: 2025-02-28 15:53:06
 * @Description: 
-->
<script setup lang="ts" name="ColSetting">
import type { ColumnProps } from '#/components/ProTable/interface';

import {
  computed,
  defineEmits,
  defineExpose,
  defineProps,
  nextTick,
  ref,
} from 'vue';

import Sortable from 'sortablejs';

const props = defineProps<{ colSetting: ColumnProps[]; uuid: string }>();

// 定义 emit 事件
const emit = defineEmits<{
  dragSort: [{ newIndex?: number; oldIndex?: number }];
}>();

const drawerVisible = ref<boolean>(false);

const openColSetting = () => {
  drawerVisible.value = true;
  nextTick(() => {
    props.uuid && dragSort();
  });
};

// 处理表格数据
const processTableData = computed(() => {
  return props.colSetting;
});

const alignOptions = [
  {
    label: '靠左',
    value: 'left',
  },
  {
    label: '居中',
    value: 'center',
  },
  {
    label: '靠右',
    value: 'right',
  },
];

// const fixedOptions = [
//   {
//     label: '固定在左侧',
//     value: 'left',
//   },
//   {
//     label: '固定在右侧',
//     value: 'right',
//   },
//   {
//     label: '不固定',
//     value: undefined,
//   },
// ];

// 表格拖拽排序
function dragSort() {
  const tbody = document.querySelector(
    `#${props.uuid}-setting tbody`,
  ) as HTMLElement;
  console.log('tbody123123', tbody);

  if (tbody) {
    Sortable.create(tbody, {
      animation: 300,
      handle: '.columnMove',
      onEnd({ newIndex, oldIndex }) {
        const [removedItem] = processTableData.value.splice(oldIndex!, 1);
        processTableData.value.splice(newIndex!, 0, removedItem!);
        emit('dragSort', { newIndex, oldIndex });
      },
    });
  }
}

defineExpose({
  openColSetting,
});
</script>

<template>
  <!-- 列设置 -->
  <el-drawer v-model="drawerVisible" size="800px" title="列设置">
    <div class="table-main">
      <el-table
        :id="`${uuid}-setting`"
        :border="true"
        :data="processTableData"
        :tree-props="{ children: '_children' }"
        default-expand-all
        row-key="prop"
      >
        <el-table-column align="center" label="#" type="index" width="50" />
        <el-table-column align="left" label="列名" prop="label" />
        <el-table-column align="left" label="字段" prop="prop" />
        <el-table-column align="center" class="move" width="60">
          <template #default>
            <el-tag class="columnMove" size="small" type="success">
              <el-icon> <DCaret /></el-icon>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-slot="scope"
          align="center"
          label="显示"
          prop="isShow"
          width="80px"
        >
          <el-switch v-model="scope.row.isShow" />
        </el-table-column>
        <el-table-column
          v-slot="scope"
          align="center"
          label="排序"
          prop="sortable"
          width="80px"
        >
          <el-switch v-model="scope.row.sortable" />
        </el-table-column>
        <!-- <el-table-column
          v-slot="scope"
          align="center"
          label="头部筛选"
          prop="filterable"
        >
          <el-switch v-model="scope.row.filterable" />
        </el-table-column> -->

        <el-table-column
          v-slot="scope"
          align="center"
          label="单元格排版"
          prop="align"
          width="120px"
        >
          <el-select v-model="scope.row.align" placeholder="请选择">
            <el-option
              v-for="item in alignOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-table-column>

        <!-- <el-table-column
          v-slot="scope"
          align="center"
          label="列固定"
          prop="fixed"
          width="160px"
        >
          <el-select v-model="scope.row.fixed" placeholder="请选择">
            <el-option
              v-for="item in fixedOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-table-column> -->
        <template #empty>
          <div class="table-empty">
            <!-- <img alt="notData" src="#/assets/images/notData.png" /> -->
            <div>暂无可配置列</div>
          </div>
        </template>
      </el-table>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.cursor-move {
  cursor: move;
}
</style>
