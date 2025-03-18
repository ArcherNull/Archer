<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-12-17 16:34:10
 * @LastEditTime: 2025-03-11 17:37:51
 * @Description: 
-->

<script name="MyAgGrid">
import { reactive, ref } from 'vue';

import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  provideGlobalGridOptions,
  ValidationModule,
} from 'ag-grid-community';
import {
  AllEnterpriseModule,
  IntegratedChartsModule,
} from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';
import { throttle } from 'lodash-es';

// 引入配置
import {
  EXCELSTYLES,
  GRID_OPTIONS,
  SIDEBAR_CONFIGURATION,
} from './common/agGrid-config';
// ag-grid工具
// import { AgGridUtils } from './common/agGrid-utils.js';

// 引入主题
import './common/agGrid-theme.js';
// 破解文件
import './common/agGrid-crack.js';

// Mark all grids as using legacy themes
provideGlobalGridOptions({
  theme: 'legacy',
});
// 企业版
ModuleRegistry.registerModules([
  AllCommunityModule,
  AllEnterpriseModule,
  ClientSideRowModelModule,
  ValidationModule /* Development Only */,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
]);

export default {
  components: {
    AgGridVue,
  },
  props: {
    // 表格加载loading
    loading: {
      default: false,
      type: Boolean,
    },
    // 表格数据配置 ， 包括表格头和行数据
    tableDataOptions: {
      default() {
        return {
          columnDefs: [],
          rowData: [],
        };
      },
      require: true,
      type: Object,
    },
  },
  setup(props, { expose }) {
    // 表格的实例对象
    const gridTableRef = ref(null);

    const agGridTable = reactive({
      // 表格实例化api
      agGridApi: null,
    });
    // 列头
    // const columnDefs = computed(() => [
    //   // ...new InitColumnDefs(props?.tableDataOptions?.columnDefs || []),
    // ]);

    // 默认合并option配置使用计算属性
    const mergedOptions = GRID_OPTIONS;
    // 设置侧边栏配置
    const rewriteSideBar = SIDEBAR_CONFIGURATION;
    // 合并表格导出样式
    const tableExcelStyles = EXCELSTYLES;

    // 表格刷新函数
    const onPaginationChanged = (params) => {
      console.log('表格刷新函数', params);
    };

    // 对父组件暴露方法以及属性
    expose({ agGridTable });

    return {
      // computed缓存过后的列头配置
      // columnDefs,
      gridTableRef,
      // 表格options
      mergedOptions,
      // 表格刷新函数
      onPaginationChanged,
      // 设置侧边栏配置
      rewriteSideBar,
      // 合并表格导出样式
      tableExcelStyles,
      // 节流函数
      throttle,
    };
  },
};
</script>

<template>
  <AgGridVue
    ref="gridTableRef"
    :cell-selection="true"
    :column-defs="tableDataOptions.columnDefs"
    :enable-charts="true"
    :excel-styles="tableExcelStyles"
    :grid-options="mergedOptions"
    :on-pagination-changed="
      throttle(onPaginationChanged, 1500, { trailing: false })
    "
    :row-data="tableDataOptions.rowData"
    class="ag-theme-alpine"
    style="height: 700px"
    v-loading="loading"
  />
</template>
