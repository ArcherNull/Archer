<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-17 11:12:17
 * @LastEditTime: 2024-07-12 10:24:35
 * @Description:
-->
<template>
  <div v-loading="loading">
    <ag-grid-vue
      ref="gridTableRef"
      style="width: 1000px; height: 800px"
      class="ag-theme-alpine"
      :grid-options="mergedOptions"
      :excel-styles="tableExcelStyles"
      :column-defs="tableDataOptions.columnDefs"
      :row-data="tableDataOptions.rowData"
      :on-pagination-changed="
        throttle(onPaginationChanged, 1500, { trailing: false })
      "
    >
    </ag-grid-vue>
  </div>
</template>

<script>
import { ref, reactive, watch } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { throttle } from "lodash-es";
// 引入配置
import {
  GRID_OPTIONS,
  SIDEBAR_CONFIGURATION,
  EXCELSTYLES,
} from "./common/agGrid-config";
// 引入主题
import "./common/agGrid-theme.js";
// 破解文件
import "./common/agGrid-crack.js";
// ag-grid工具
import { InitColumnDefs, AgGridUtils } from "./common/agGrid-utils.js";

export default {
  name: "MyAgGrid",
  components: {
    AgGridVue,
  },
  props: {
    // 表格加载loading
    loading: {
      type: Boolean,
      default: false,
    },
    // 表格数据配置 ， 包括表格头和行数据
    tableDataOptions: {
      type: Object,
      require: true,
      default() {
        return {
          columnDefs: [],
          rowData: [],
        };
      },
    },
  },
  setup(props, { emit, expose, watch }) {
    // 表格的实例对象
    const gridTableRef = ref(null);

    const agGridTable = reactive({
      // 表格实例化api
      agGridApi: null,
      columnDefs: [],
      rowData: [],
    });
    // 默认合并option配置使用计算属性
    const mergedOptions = GRID_OPTIONS;
    // 设置侧边栏配置
    const rewriteSideBar = SIDEBAR_CONFIGURATION;
    // 合并表格导出样式
    const tableExcelStyles = EXCELSTYLES;

    watch(props.tableDataOptions, (newValue, oldValue) => {
      console.log("props.tableDataOptions", newValue);
      console.log("props.tableDataOptions", oldValue);
    });

    // 表格刷新函数
    const onPaginationChanged = (params) => {
      console.log("表格刷新函数", params);
      if (props.tableDataOptions.rowData?.length) {
        // 实例化自定义个性化api
        agGridTable.agGridApi = new AgGridUtils(params);
      } else {
        // 清空底部合计行
        agGridTable.agGridApi?.gridApi?.setPinnedBottomRowData([]);
      }
    };

    const col = [
      {
        headerName: "#",
        field: "numericalOrder",
        width: 80,
        pinned: "left",
        lockPosition: true,
        checkboxSelection: true,
        sortable: false,
        filter: false,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
      },
      {
        hide: false,
        pinned: "left",
        headerName: "姓名",
        field: "name",
        width: 110,
        headerComponentParams: {
          menuIcon: "fa-cog",
        },
      },
      {
        hide: false,
        pinned: "none",
        headerName: "性别",
        field: "sex",
        width: 110,
      },
      {
        headerName: "年龄之和",
        field: "age2",
        afterField: "age",
        sort: "desc",
      },
      {
        headerName: "年龄之和2",
        field: "age3",
        afterField: "age",
        sort: "desc",
      },
      {
        headerName: "年龄之和123",
        field: "age4",
        afterField: "age",
        sort: "desc",
      },
      {
        hide: false,
        pinned: "none",
        headerName: "年龄",
        field: "age",
        width: 110,
      },
      {
        hide: false,
        pinned: "none",
        headerName: "年龄1",
        field: "age1",
        width: 125,
      },
      {
        hide: false,
        pinned: "none",
        headerName: "籍贯",
        field: "jg",
        width: 110,
      },
      {
        hide: false,
        pinned: "none",
        headerName: "省份",
        field: "sf",
        width: 110,
      },
      {
        hide: false,
        pinned: "none",
        headerName: "地址",
        field: "dz",
        width: 110,
      },
      {
        hide: false,
        pinned: "none",
        headerName: "时间",
        field: "date",
        width: 180,
      },
    ];

    // 对父组件暴露方法以及属性
    expose({ agGridTable });

    return {
      gridTableRef,
      // 表格options
      mergedOptions,
      // 设置侧边栏配置
      rewriteSideBar,
      // 合并表格导出样式
      tableExcelStyles,
      // 节流函数
      throttle,
      col,
      // 表格刷新函数
      onPaginationChanged,
    };
  },
};
</script>
