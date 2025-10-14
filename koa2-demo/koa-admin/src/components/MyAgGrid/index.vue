<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-17 11:12:17
 * @LastEditTime: 2023-07-10 14:08:16
 * @Description:
-->
<template>
  <ag-grid-vue
    ref="gridTableRef"
    v-loading="loading"
    style="width: 1000px; height: 800px"
    class="ag-theme-alpine"
    :grid-options="mergedOptions"
    :excel-styles="tableExcelStyles"
    :column-defs="columnDefs"
    :row-data="tableDataOptions.rowData"
    :on-pagination-changed="throttle(onPaginationChanged, 1500, { 'trailing': false })"
  >
  </ag-grid-vue>
</template>

<script>
import {
  computed,
  ref,
  reactive
} from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { throttle } from 'lodash-es'
// 引入配置
import {
  GRID_OPTIONS,
  SIDEBAR_CONFIGURATION,
  EXCELSTYLES
} from './common/agGrid-config'
// 引入主题
import './common/agGrid-theme.js'
// 破解文件
import './common/agGrid-crack.js'
// ag-grid工具
import { InitColumnDefs, AgGridUtils } from './common/agGrid-utils.js'

export default {
  name: 'MyAgGrid',
  components: {
    AgGridVue
  },
  props: {
    // 表格加载loading
    loading: {
      type: Boolean,
      default: false
    },
    // 表格个性化配置项
    tableOptions: {
      type: Object,
      default: () => ({})
    },
    // 表格数据配置 ， 包括表格头和行数据
    tableDataOptions: {
      type: Object,
      require: true,
      default () {
        return {
          columnDefs: [],
          rowData: []
        }
      }
    }
  },
  setup (props, { emit, expose, watch }) {
    // 表格的实例对象
    const gridTableRef = ref(null)

    const agGridTable = reactive({
      // 表格实例化api
      agGridApi: null
    })
    // 列头
    const columnDefs = computed(() => [
      ...(new InitColumnDefs(props?.tableDataOptions?.columnDefs) || [])
    ])

    // 默认合并option配置使用计算属性
    const mergedOptions = GRID_OPTIONS
    // 设置侧边栏配置
    const rewriteSideBar = SIDEBAR_CONFIGURATION
    // 合并表格导出样式
    const tableExcelStyles = EXCELSTYLES

    // 表格刷新函数
    const onPaginationChanged = (params) => {
      console.log('表格刷新函数', params)
      if (props.tableDataOptions.rowData?.length) {
        // 实例化自定义个性化api
        agGridTable.agGridApi = new AgGridUtils(params)
      } else {
        // 清空底部合计行
        agGridTable.agGridApi?.gridApi?.setPinnedBottomRowData([])
      }
    }

    // 对父组件暴露方法以及属性
    expose({ agGridTable })

    return {
      gridTableRef,
      // 表格options
      mergedOptions,
      // 设置侧边栏配置
      rewriteSideBar,
      // 合并表格导出样式
      tableExcelStyles,
      // computed缓存过后的列头配置
      columnDefs,
      // 节流函数
      throttle,
      // 表格刷新函数
      onPaginationChanged
    }
  }
}
</script>
