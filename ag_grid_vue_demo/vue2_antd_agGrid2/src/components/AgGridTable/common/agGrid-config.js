/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-26 15:24:58
 * @LastEditTime: 2024-06-11 09:54:42
 * @Description:
 */

// import { getRandom6DigitNumber } from '../common/utils/index'

// 是否展示底部合计行
export const SHOW_CALC_BOTTOM_ROWS = true

// 最大选择条数
export const MAX_SELECTED_ROWS = 50000

// 是否默认展示序列
export const SHOW_FIRST_COLUMN = true

// 是否默认展示操作列
export const SHOW_ACTION_COLUMN = true

// 生成id规则
export const GET_HTML_DOM_ID = fieldsConfig => {
  let agGridTableId = 'ag-table'
  if (fieldsConfig && fieldsConfig.id) {
    agGridTableId = 'ag-table-' + fieldsConfig.id
  } else {
    console.error('fieldsConfig配置参数中id是必传的，且唯一，不能与其它界面的id项重复，且不能使用时间戳，随机字符串等')
  }
  fieldsConfig.agGridTableId = agGridTableId
  return agGridTableId
}

// 点击表格全选，触发请求所有数据阈值, 建议要比分页第一页要小
export const SELECTD_ALL_THRESHOLD_NUM = 100

// 序列列头字段
export const AG_GRID_FIRST_COLUMN_FIELD = 'numericalOrder'

// 序列列头名
export const AG_GRID_FIRST_COLUMN_HEADER_NAME = '#'

// ag-grid主题列表
export const AG_GRID_THEME_LIST = [
  {
    label: '厚重风格',
    value: 'alpine'
  },
  {
    label: '简约风格',
    value: 'balham'
  },
  {
    label: '线性风格',
    value: 'material'
  }
]

// ag-grid默认主题
export const AG_GRID_DEFAULT_THEME = 'alpine'

// ag-grid表格是否开启列头筛选
export const AG_GRID_IS_COLUMNS_FILTER = true

// ag-grid表格是否开启列头排序
export const AG_GRID_IS_COLUMNS_SORTABLE = true

// ag-grid表格是否开启列编辑
export const AG_GRID_IS_COLUMNS_EDITABLE = true

// ag-grid表格是否开启前端全局筛选过滤
export const AG_GRID_IS_GLOBAL_FILTER_DATA = true

// ag-grid表格是否开启前端行跳转
export const AG_GRID_IS_ROWS_JUMP = true

// ag-grid表格是否开启前端列跳转
export const AG_GRID_IS_CLOUMNS_JUMP = true

// 当一页数据无法承载后端所有数据时，ag-grid表格是可通过开启全选触发后端所有数据一次性请求
export const AG_GRID_IS_SELECTED_All_BY_BACK_END = true

// 编辑单元格样式统一处理
export const AG_GRID_EDIT_CELL_OBJ = {
  editable: params => {
    // 当为底部合计栏是不可编辑
    if (params.node.rowPinned === 'bottom') return false
    return true
  },
  cellStyle: params => {
    if (params.node.rowPinned === 'bottom') {
      return {
        backgroundColor: '#fff',
        color: '#333'
      }
    } else {
      return {
        backgroundColor: '#E1FFFF',
        color: 'red'
      }
    }
  }
}

//
