<script name="DKAgGrid" setup lang="tsx">
import type {
  GridApi,
  GridReadyEvent,
  PaginationChangedEvent,
} from 'ag-grid-community';

import type { DKAgGridProps, ObejectType } from './interface/index';

import {
  computed,
  defineExpose,
  defineOptions,
  defineProps,
  ref,
  shallowRef,
  useAttrs,
  withDefaults,
} from 'vue';

import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  provideGlobalGridOptions,
} from 'ag-grid-community';
import {
  AllEnterpriseModule,
  IntegratedChartsModule,
} from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';
import { cloneDeep, isEmpty, isFunction, isObject, throttle } from 'lodash-es';

// 引入配置
import { EXCELSTYLES, GRID_OPTIONS } from './common/agGrid-config';

// 引入主题
import './common/agGrid-theme';
// 破解文件
import './common/agGrid-crack';

defineOptions({
  // 是否使得组件自动地继承 attribute
  inheritAttrs: false,
});
const props = withDefaults(defineProps<DKAgGridProps>(), {
  loading: false,
  style: 'min-height: 300px; height: 100%; max-height:2000px;',
});

const attrs = useAttrs();

// Mark all grids as using legacy themes
provideGlobalGridOptions({
  theme: 'legacy',
});
// 企业版
ModuleRegistry.registerModules([
  AllCommunityModule,
  AllEnterpriseModule,
  ClientSideRowModelModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
]);

// 网格实例api
const gridApi = shallowRef<GridApi | null>(null);

const nObj = {};
if (isFunction(attrs?.['grid-options-fun'])) {
  const fObj = attrs['grid-options-fun']();
  if (isObject(fObj) && !isEmpty(fObj)) {
    Object.assign(nObj, fObj);
  }
}

// 默认合并option配置使用计算属性
const mergedOptions = ref(Object.assign(cloneDeep(GRID_OPTIONS), nObj));

// 合并表格导出样式
const tableExcelStyles = ref(EXCELSTYLES);

const customizedAttrs = computed(() => {
  const obj: ObejectType = {
    onGridReady: (params: GridReadyEvent) => {
      console.log('DKAgGrid网格渲染完毕', params);
      gridApi.value = params.api;
    },
    onPaginationChanged: throttle(
      (params: PaginationChangedEvent) => {
        console.log('表格刷新函数', params);
      },
      1500,
      { trailing: false },
    ),
  };

  // 树形表格必传参数
  if (isFunction(attrs?.['get-data-path'])) {
    const aColumn =
      attrs?.['auto-group-column-def'] ||
      props.tableDataOptions?.autoGroupColumnDef;
    if (aColumn) {
      obj.treeData = true;
      // 树形展开状态
      obj.groupDefaultExpanded = -1;
      // 分组头
      obj.autoGroupColumnDef = cloneDeep(aColumn);
    }
  }

  if (attrs?.['enable-cell-span']) {
    console.log('enable-cell-span');
    obj.suppressRowTransform = true;
  }

  const data = Object.assign(obj, attrs);
  return data;
});

defineExpose({
  gridApi,
});
</script>

<template>
  <AgGridVue
    :cell-selection="true"
    :column-defs="tableDataOptions.columnDefs"
    :enable-cell-span="true"
    :enable-charts="true"
    :excel-styles="tableExcelStyles"
    :grid-options="mergedOptions"
    :row-data="tableDataOptions.rowData"
    :style="style"
    class="ag-theme-alpine"
    v-loading="loading"
    v-bind="customizedAttrs"
  />
</template>
