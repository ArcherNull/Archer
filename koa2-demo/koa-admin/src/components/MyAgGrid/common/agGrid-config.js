/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-10 14:07:19
 * @LastEditTime: 2023-08-31 09:59:22
 * @Description: ag-grid 基本配置
 */

// 侧边栏配置
export const SIDEBAR_CONFIGURATION = {
  toolPanels: [
    {
      id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
      minWidth: 225,
      width: 225,
      maxWidth: 225
    }
  ],
  position: 'right', // 侧边栏在表格右侧显示
  defaultToolPanel: null // 默认收起侧边栏(指定为null找不到首先展示的)
}

// 表格导出样式
export const EXCELSTYLES = [
  {
    id: 'oddBackcolor',
    interior: {
      color: '#ddebf7',
      pattern: 'Solid'
    },
    // 边框
    borders: {
      color: '#ccc',
      lineStyle: 'Continuous',
      weight: 1
    }
  },
  {
    // 必填 样式的ID，该id是唯一的字符串
    id: 'header',
    // 字体设置
    font: {
      color: 'block',
      size: 11,
      bold: true
    },
    alignment: {
      horizontal: 'Left', // 水平
      vertical: 'Center' // 垂直
    },
    // 边框
    borders: {
      borderBottom: {
        color: '#C0C0C0',
        lineStyle: 'Continuous',
        weight: 1
      },
      borderLeft: {
        color: '#C0C0C0',
        lineStyle: 'Continuous',
        weight: 1
      },
      borderRight: {
        color: '#C0C0C0',
        lineStyle: 'Continuous',
        weight: 1
      },
      borderTop: {
        color: '#C0C0C0',
        lineStyle: 'Continuous',
        weight: 1
      }
    },
    // 背景颜色和图案
    interior: {
      color: '#cdebf9',
      pattern: 'Solid',
      patternColor: '#C0C0C0'
    }
  },
  {
    id: 'cell',
    alignment: {
      horizontal: 'Left', // 水平
      vertical: 'Top', // 垂直
      wrapText: true // 文字超出换行
    }
  },
  {
    id: 'headerGroup',
    alignment: {
      horizontal: 'Center', // 水平
      vertical: 'Center', // 垂直
      wrapText: true // 文字超出换行
    }
  },
  {
    id: 'hyperlinks', // 链接样式
    font: {
      underline: 'Single',
      color: '#358ccb'
    }
  }
]

// 中文
export const AG_GRID_LOCALE_ZH = {
  page: '页',
  more: '更多',
  to: '到',
  of: 'of',
  next: '下一页',
  last: '上一页',
  first: '首页',
  previous: '上一页',
  loadingOoo: '加载中...',
  selectAll: '查询全部',
  searchOoo: '查询...',
  blanks: '空白',
  filterOoo: '过滤...',
  applyFilter: '确定',
  resetFilter: '取消',
  equals: '相等',
  notEqual: '不相等',
  lessThan: '小于',
  greaterThan: '大于',
  lessThanOrEqual: '小于等于',
  greaterThanOrEqual: '大于等于',
  inRange: '范围',
  contains: '包含',
  notContains: '不包含',
  startsWith: '开始于',
  endsWith: '结束于',
  group: '组',
  columns: '列配置',
  filters: '筛选',
  rowGroupColumns: 'laPivot Cols',
  rowGroupColumnsEmptyMessage: 'la drag cols to group',
  valueColumns: 'laValue Cols',
  pivotMode: '屏蔽所有列',
  groups: 'laGroups',
  values: '值',
  pivots: 'laPivots',
  valueColumnsEmptyMessage: 'la drag cols to aggregate',
  pivotColumnsEmptyMessage: 'la drag here to pivot',
  toolPanelButton: 'la tool panel',
  noRowsToShow: '数据为空',
  pinColumn: '调整固定列',
  valueAggregation: 'laValue Agg',
  autosizeThiscolumn: '调整当前列宽',
  autosizeAllColumns: '自动调整所有列宽',
  groupBy: '排序',
  ungroupBy: '不排序',
  resetColumns: '重置列',
  expandAll: '展开全部',
  collapseAll: '关闭',
  toolPanel: '工具面板',
  export: '导出',
  csvExport: '导出为CSV格式文件',
  excelExport: '导出到Excel',
  pinLeft: '左固定 &lt;&lt;',
  pinRight: '右固定 &gt;&gt;',
  noPin: '不固定 &lt;&gt;',
  sum: '总数',
  min: '最小值',
  max: '最大值',
  none: '无',
  count: '总',
  average: '平均值',
  copy: '复制',
  copyWithHeaders: '携带表头复制',
  copyWithHeaderGroups: '携带表头集合复制',
  ctrlC: 'ctrl + C',
  paste: '粘贴',
  ctrlV: 'ctrl + V'
}

// 英文
export const AG_GRID_LOCALE_EN = {
  // Set Filter
  selectAll: '(Select All)',
  selectAllSearchResults: '(Select All Search Results)',
  searchOoo: 'Search...',
  blanks: '(Blanks)',
  noMatches: 'No matches',
  // Number Filter & Text Filter
  filterOoo: 'Filter...',
  equals: 'Equals',
  notEqual: 'Not equal',
  blank: 'Blank',
  notBlank: 'Not blank',
  empty: 'Choose One',
  // Number Filter
  lessThan: 'Less than',
  greaterThan: 'Greater than',
  lessThanOrEqual: 'Less than or equal',
  greaterThanOrEqual: 'Greater than or equal',
  inRange: 'In range',
  inRangeStart: 'from',
  inRangeEnd: 'to',
  // Text Filter
  contains: 'Contains',
  notContains: 'Not contains',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  // Date Filter
  dateFormatOoo: 'yyyy-mm-dd',
  // Filter Conditions
  andCondition: 'AND',
  orCondition: 'OR',
  // Filter Buttons
  applyFilter: 'Apply',
  resetFilter: 'Cancel',
  clearFilter: 'Clear',
  cancelFilter: 'Cancel',
  // Filter Titles
  textFilter: 'Text Filter',
  numberFilter: 'Number Filter',
  dateFilter: 'Date Filter',
  setFilter: 'Set Filter',
  // Side Bar
  columns: 'Columns Configuration',
  filters: 'Filters',
  // columns tool panel
  pivotMode: 'Pivot Mode',
  groups: 'Row Groups',
  rowGroupColumnsEmptyMessage: 'Drag here to set row groups',
  values: 'Values',
  valueColumnsEmptyMessage: 'Drag here to aggregate',
  pivots: 'Column Labels',
  pivotColumnsEmptyMessage: 'Drag here to set column labels',
  // Header of the Default Group Column
  group: 'Group',
  // Row Drag
  rowDragRows: 'rows',
  // Other
  loadingOoo: 'Loading...',
  noRowsToShow: 'No Rows To Show',
  enabled: 'Enabled',
  // Menu
  pinColumn: 'Pin Column',
  pinLeft: 'Pin Left',
  pinRight: 'Pin Right',
  noPin: 'No Pin',
  valueAggregation: 'Value Aggregation',
  autosizeThiscolumn: 'Autosize This Column',
  autosizeAllColumns: 'Autosize All Columns',
  groupBy: 'Group by',
  ungroupBy: 'Un-Group by',
  addToValues: 'Add ${variable} to values',
  removeFromValues: 'Remove ${variable} from values',
  addToLabels: 'Add ${variable} to labels',
  removeFromLabels: 'Remove ${variable} from labels',
  resetColumns: 'Reset Columns',
  expandAll: 'Expand All',
  collapseAll: 'Close All',
  copy: 'Copy',
  ctrlC: 'Ctrl+C',
  copyWithHeaders: 'Copy With Headers',
  copyWithHeaderGroups: 'Copy With Header Groups',
  paste: 'Paste',
  ctrlV: 'Ctrl+V',
  export: 'Export',
  csvExport: 'CSV Export',
  excelExport: 'Excel Export',
  // Enterprise Menu Aggregation and Status Bar
  sum: 'Sum',
  min: 'Min',
  max: 'Max',
  none: 'None',
  count: 'Count',
  avg: 'Average',
  filteredRows: 'Filtered',
  selectedRows: 'Selected',
  totalRows: 'Total Rows',
  totalAndFilteredRows: 'Rows',
  more: 'More',
  to: 'to',
  of: 'of',
  page: 'Page',
  nextPage: 'Next Page',
  lastPage: 'Last Page',
  firstPage: 'First Page',
  previousPage: 'Previous Page',
  // Pivoting
  pivotColumnGroupTotals: 'Total',
  // Enterprise Menu (Charts)
  pivotChartAndPivotMode: 'Pivot Chart & Pivot Mode',
  pivotChart: 'Pivot Chart',
  chartRange: 'Chart Range',
  columnChart: 'Column',
  groupedColumn: 'Grouped',
  stackedColumn: 'Stacked',
  normalizedColumn: '100% Stacked',
  barChart: 'Bar',
  groupedBar: 'Grouped',
  stackedBar: 'Stacked',
  normalizedBar: '100% Stacked',
  pieChart: 'Pie',
  pie: 'Pie',
  doughnut: 'Doughnut',
  line: 'Line',
  xyChart: 'X Y (Scatter)',
  scatter: 'Scatter',
  bubble: 'Bubble',
  areaChart: 'Area',
  area: 'Area',
  stackedArea: 'Stacked',
  normalizedArea: '100% Stacked',
  histogramChart: 'Histogram',
  combinationChart: 'Combination',
  columnLineCombo: 'Column & Line',
  AreaColumnCombo: 'Area & Column',
  // Charts
  pivotChartTitle: 'Pivot Chart',
  rangeChartTitle: 'Range Chart',
  settings: 'Settings',
  data: 'Data',
  format: 'Format',
  categories: 'Categories',
  defaultCategory: '(None)',
  series: 'Series',
  xyValues: 'X Y Values',
  paired: 'Paired Mode',
  axis: 'Axis',
  navigator: 'Navigator',
  color: 'Color',
  thickness: 'Thickness',
  xType: 'X Type',
  automatic: 'Automatic',
  category: 'Category',
  number: 'Number',
  time: 'Time',
  xRotation: 'X Rotation',
  yRotation: 'Y Rotation',
  ticks: 'Ticks',
  width: 'Width',
  height: 'Height',
  length: 'Length',
  padding: 'Padding',
  spacing: 'Spacing',
  chart: 'Chart',
  title: 'Title',
  titlePlaceholder: 'Chart title - double click to edit',
  background: 'Background',
  font: 'Font',
  top: 'Top',
  right: 'Right',
  bottom: 'Bottom',
  left: 'Left',
  labels: 'Labels',
  size: 'Size',
  minSize: 'Minimum Size',
  maxSize: 'Maximum Size',
  legend: 'Legend',
  position: 'Position',
  markerSize: 'Marker Size',
  markerStroke: 'Marker Stroke',
  markerPadding: 'Marker Padding',
  itemSpacing: 'Item Spacing',
  itemPaddingX: 'Item Padding X',
  itemPaddingY: 'Item Padding Y',
  layoutHorizontalSpacing: 'Horizontal Spacing',
  layoutVerticalSpacing: 'Vertical Spacing',
  strokeWidth: 'Stroke Width',
  offset: 'Offset',
  offsets: 'Offsets',
  tooltips: 'Tooltips',
  callout: 'Callout',
  markers: 'Markers',
  shadow: 'Shadow',
  blur: 'Blur',
  xOffset: 'X Offset',
  yOffset: 'Y Offset',
  lineWidth: 'Line Width',
  normal: 'Normal',
  bold: 'Bold',
  italic: 'Italic',
  boldItalic: 'Bold Italic',
  predefined: 'Predefined',
  fillOpacity: 'Fill Opacity',
  strokeOpacity: 'Line Opacity',
  histogramBinCount: 'Bin count',
  columnGroup: 'Column',
  barGroup: 'Bar',
  pieGroup: 'Pie',
  lineGroup: 'Line',
  scatterGroup: 'X Y (Scatter)',
  areaGroup: 'Area',
  histogramGroup: 'Histogram',
  combinationGroup: 'Combination',
  groupedColumnTooltip: 'Grouped',
  stackedColumnTooltip: 'Stacked',
  normalizedColumnTooltip: '100% Stacked',
  groupedBarTooltip: 'Grouped',
  stackedBarTooltip: 'Stacked',
  normalizedBarTooltip: '100% Stacked',
  pieTooltip: 'Pie',
  doughnutTooltip: 'Doughnut',
  lineTooltip: 'Line',
  groupedAreaTooltip: 'Area',
  stackedAreaTooltip: 'Stacked',
  normalizedAreaTooltip: '100% Stacked',
  scatterTooltip: 'Scatter',
  bubbleTooltip: 'Bubble',
  histogramTooltip: 'Histogram',
  columnLineComboTooltip: 'Column & Line',
  areaColumnComboTooltip: 'Area & Column',
  customComboTooltip: 'Custom Combination',
  noDataToChart: 'No data available to be charted.',
  pivotChartRequiresPivotMode: 'Pivot Chart requires Pivot Mode enabled.',
  chartSettingsToolbarTooltip: 'Menu',
  chartLinkToolbarTooltip: 'Linked to Grid',
  chartUnlinkToolbarTooltip: 'Unlinked from Grid',
  chartDownloadToolbarTooltip: 'Download Chart',
  seriesChartType: 'Series Chart Type',
  seriesType: 'Series Type',
  secondaryAxis: 'Secondary Axis',
  // ARIA
  ariaHidden: 'hidden',
  ariaVisible: 'visible',
  ariaChecked: 'checked',
  ariaUnchecked: 'unchecked',
  ariaIndeterminate: 'indeterminate',
  ariaDefaultListName: 'List',
  ariaColumnSelectAll: 'Toggle Select All Columns',
  ariaInputEditor: 'Input Editor',
  ariaDateFilterInput: 'Date Filter Input',
  ariaFilterList: 'Filter List',
  ariaFilterInput: 'Filter Input',
  ariaFilterColumnsInput: 'Filter Columns Input',
  ariaFilterValue: 'Filter Value',
  ariaFilterFromValue: 'Filter from value',
  ariaFilterToValue: 'Filter to value',
  ariaFilteringOperator: 'Filtering Operator',
  ariaColumn: 'Column',
  ariaColumnList: 'Column List',
  ariaColumnGroup: 'Column Group',
  ariaRowSelect: 'Press SPACE to select this row',
  ariaRowDeselect: 'Press SPACE to deselect this row',
  ariaRowToggleSelection: 'Press Space to toggle row selection',
  ariaRowSelectAll: 'Press Space to toggle all rows selection',
  ariaToggleVisibility: 'Press SPACE to toggle visibility',
  ariaSearch: 'Search',
  ariaSearchFilterValues: 'Search filter values',
  ariaRowGroupDropZonePanelLabel: 'Row Groups',
  ariaValuesDropZonePanelLabel: 'Values',
  ariaPivotDropZonePanelLabel: 'Column Labels',
  ariaDropZoneColumnComponentDescription: 'Press DELETE to remove',
  ariaDropZoneColumnValueItemDescription:
    'Press ENTER to change the aggregation type',
  // ARIA Labels for Dialogs
  ariaLabelColumnMenu: 'Column Menu',
  ariaLabelCellEditor: 'Cell Editor',
  ariaLabelDialog: 'Dialog',
  ariaLabelSelectField: 'Select Field',
  ariaLabelTooltip: 'Tooltip',
  ariaLabelContextMenu: 'Context Menu',
  ariaLabelSubMenu: 'SubMenu',
  ariaLabelAggregationFunction: 'Aggregation Function',

  // Number Format (Status Bar, Pagination Panel)
  thousandSeparator: ',',
  decimalSeparator: '.'
}

// 表格默认配置
export const GRID_OPTIONS = {
  localeText: AG_GRID_LOCALE_ZH, // 中英文
  suppressContextMenu: false, // 关闭右键菜单列表
  suppressScrollOnNewData: true, // 网格在页面更改时不要滚动到顶部。
  // stopEditingWhenCellsLoseFocus: true, //在编辑的时候点击表格任何地方停止编辑
  headerHeight: 40, // 表头高度
  // suppressMenuHide: true, // 默认显示menu图标
  tooltipMouseTrack: true, // 用鼠标跟踪以演示工具提示需要跟随光标的方案
  rowHeight: 35, // 设置行高为30px,默认情况下25px
  rowBuffer: 10, // 行缓冲区，默认为10行
  animateRows: true, // 开启行动画
  rowSelection: 'multiple', // 行多选
  cacheBlockSize: 100, // 缓存中的每个块应该包含多少行
  suppressRowClickSelection: true, // 点击及选择复选框
  tooltipShowDelay: 100, // 鼠标触摸提示出现时间100毫秒
  groupSelectsChildren: true, // 选中子级
  groupSelectsFiltered: true, // 勾选行组只获取子级数据
  defaultColDef: {
    // 默认的列配置
    menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'], // 表头menuTabs，默认第一个为筛选器
    filterParams: {
      buttons: ['apply', 'reset'], // 过滤器按钮
      closeOnApply: true, // 按住apply reset按钮关闭
      excelMode: 'windows', // 转换为widows模式
      showTooltips: true // 设置过滤器工具提示
    },
    wrapHeaderText: true, // 表头自动换行
    autoHeaderHeight: true, // 自适应表头高度
    // rowDragManaged: true, // 拖拽
    sortable: true, // 可以排序
    headerCheckboxSelectionFilteredOnly: true, // 全选仅仅勾选筛选的全部
    resizable: true, // 允许调整列大小，就是拖动改变列大小
    // lockPosition: true,  //列位置为true代表不能拖动列
    minWidth: 100, // 列最小宽度
    maxWidth: 600, // 最大宽度
    editable: false, // 是否可编辑
    filter: false, // 开启数据刷选器，就是在列头上增加数据搜索过滤功能
    cellStyle: {
      color: '#333',
      textAlign: 'left'
    }
  },
  defaultCsvExportParams: {
    // columnGroups: true,
    fileName: '导出数据.csv'
  }
}
