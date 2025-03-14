/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-10 14:07:19
 * @LastEditTime: 2024-12-18 11:37:34
 * @Description: ag-grid 基本配置
 */

// 侧边栏配置
export const SIDEBAR_CONFIGURATION = {
  defaultToolPanel: null, // 默认收起侧边栏(指定为null找不到首先展示的)
  position: 'right', // 侧边栏在表格右侧显示
  toolPanels: [
    {
      iconKey: 'columns',
      id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      maxWidth: 225,
      minWidth: 225,
      toolPanel: 'agColumnsToolPanel',
      width: 225,
    },
  ],
};

// 表格导出样式
export const EXCELSTYLES = [
  {
    // 边框
    borders: {
      color: '#ccc',
      lineStyle: 'Continuous',
      weight: 1,
    },
    id: 'oddBackcolor',
    interior: {
      color: '#ddebf7',
      pattern: 'Solid',
    },
  },
  {
    alignment: {
      horizontal: 'Left', // 水平
      vertical: 'Center', // 垂直
    },
    // 边框
    borders: {
      borderBottom: {
        color: '#C0C0C0',
        lineStyle: 'Continuous',
        weight: 1,
      },
      borderLeft: {
        color: '#C0C0C0',
        lineStyle: 'Continuous',
        weight: 1,
      },
      borderRight: {
        color: '#C0C0C0',
        lineStyle: 'Continuous',
        weight: 1,
      },
      borderTop: {
        color: '#C0C0C0',
        lineStyle: 'Continuous',
        weight: 1,
      },
    },
    // 字体设置
    font: {
      bold: true,
      color: 'block',
      size: 11,
    },
    // 必填 样式的ID，该id是唯一的字符串
    id: 'header',
    // 背景颜色和图案
    interior: {
      color: '#cdebf9',
      pattern: 'Solid',
      patternColor: '#C0C0C0',
    },
  },
  {
    alignment: {
      horizontal: 'Left', // 水平
      vertical: 'Top', // 垂直
      wrapText: true, // 文字超出换行
    },
    id: 'cell',
  },
  {
    alignment: {
      horizontal: 'Center', // 水平
      vertical: 'Center', // 垂直
      wrapText: true, // 文字超出换行
    },
    id: 'headerGroup',
  },
  {
    font: {
      color: '#358ccb',
      underline: 'Single',
    },
    id: 'hyperlinks', // 链接样式
  },
];

// 中文
export const AG_GRID_LOCALE_CN = {
  addCurrentSelectionToFilter: '将当前选择添加到筛选器',
  // eslint-disable-next-line no-template-curly-in-string
  addToLabels: '将${variable}添加到标签',
  // eslint-disable-next-line no-template-curly-in-string
  addToValues: '将${variable}添加到值',
  advancedFilterAnd: '且',
  advancedFilterApply: '应用',
  advancedFilterBlank: '为空',

  advancedFilterBuilder: '构建器',
  advancedFilterBuilderAddButtonTooltip: '添加筛选或组',
  advancedFilterBuilderAddCondition: '添加筛选',
  advancedFilterBuilderAddJoin: '添加组',
  advancedFilterBuilderApply: '应用',
  advancedFilterBuilderCancel: '取消',

  advancedFilterBuilderEnterValue: '输入一个值...',
  advancedFilterBuilderMoveDownButtonTooltip: '下移',
  advancedFilterBuilderMoveUpButtonTooltip: '上移',
  advancedFilterBuilderRemoveButtonTooltip: '移除',
  advancedFilterBuilderSelectColumn: '选择一个列',
  advancedFilterBuilderSelectOption: '选择一个选项',
  advancedFilterBuilderTitle: '高级筛选',

  advancedFilterBuilderValidationAlreadyApplied: '当前筛选已应用。',
  advancedFilterBuilderValidationEnterValue: '必须输入一个值。',
  advancedFilterBuilderValidationIncomplete: '并非所有条件都已完成。',
  advancedFilterBuilderValidationSelectColumn: '必须选择一个列。',

  advancedFilterBuilderValidationSelectOption: '必须选择一个选项。',
  // Advanced Filter
  advancedFilterContains: '包含',
  advancedFilterEndsWith: '结束于',

  advancedFilterEquals: '=',
  advancedFilterFalse: '为假',

  advancedFilterGreaterThan: '>',
  advancedFilterGreaterThanOrEqual: '>=',
  advancedFilterLessThan: '<',
  advancedFilterLessThanOrEqual: '<=',

  advancedFilterNotBlank: '不为空',
  advancedFilterNotContains: '不包含',
  advancedFilterNotEqual: '!=',
  advancedFilterOr: '或',

  advancedFilterStartsWith: '开始于',

  advancedFilterTextEquals: '等于',
  advancedFilterTextNotEqual: '不等于',
  advancedFilterTrue: '为真',
  advancedFilterValidationExtraEndBracket: '结束括号过多',
  advancedFilterValidationInvalidColumn: '找不到列',
  advancedFilterValidationInvalidDate: '值不是一个有效日期',
  advancedFilterValidationInvalidJoinOperator: '找不到连接操作符',
  advancedFilterValidationInvalidOption: '找不到选项',
  advancedFilterValidationJoinOperatorMismatch:
    '一个条件内的连接操作符必须相同',
  // eslint-disable-next-line no-template-curly-in-string
  advancedFilterValidationMessage: '表达式有错误。${variable} - ${variable}。',
  advancedFilterValidationMessageAtEnd:
    // eslint-disable-next-line no-template-curly-in-string
    '表达式有错误。表达式末尾的${variable}。',
  advancedFilterValidationMissingColumn: '缺少列',
  advancedFilterValidationMissingCondition: '缺少条件',
  advancedFilterValidationMissingEndBracket: '缺少结束括号',
  advancedFilterValidationMissingOption: '缺少选项',
  advancedFilterValidationMissingQuote: '值缺少结束引号',
  advancedFilterValidationMissingValue: '缺少值',
  advancedFilterValidationNotANumber: '值不是一个数字',
  advancedSettings: '高级设置',
  after: '之后',
  aggregate: '汇总',
  // Filter Conditions
  andCondition: '和',
  animation: '动画',
  // Filter Buttons
  applyFilter: '应用',
  april: '四月',
  area: '面积',
  areaChart: '面积图',
  AreaColumnCombo: '面积图和柱状图组合',
  areaColumnComboTooltip: '面积图与柱图',
  areaGroup: '面积图',
  ariaAdvancedFilterBuilderColumn: '列',
  ariaAdvancedFilterBuilderFilterItem: '过滤条件',
  ariaAdvancedFilterBuilderGroupItem: '过滤组',
  // ARIA
  ariaAdvancedFilterBuilderItem:
    // eslint-disable-next-line no-template-curly-in-string
    '${variable}. 级别 ${variable}. 按 ENTER 进行编辑。',
  ariaAdvancedFilterBuilderItemValidation:
    // eslint-disable-next-line no-template-curly-in-string
    '${variable}. 级别 ${variable}. ${variable} 按 ENTER 进行编辑。',
  ariaAdvancedFilterBuilderJoinOperator: '连接运算符',
  ariaAdvancedFilterBuilderList: '高级过滤器构建器列表',
  ariaAdvancedFilterBuilderOption: '选项',
  ariaAdvancedFilterBuilderValueP: '值',
  ariaAdvancedFilterInput: '高级过滤器输入',
  ariaChartMenuClose: '关闭图表编辑菜单',
  ariaChartSelected: '已选择',
  ariaChecked: '已选中',
  ariaColumn: '列',
  ariaColumnFiltered: '列已过滤',
  ariaColumnGroup: '列组',
  // ARIA Labels for the Side Bar
  ariaColumnPanelList: '列列表',
  ariaColumnSelectAll: '切换选择所有列',
  ariaDateFilterInput: '日期过滤器输入',
  ariaDefaultListName: '列表',
  // used for aggregate drop zone, format: {aggregation}{ariaDropZoneColumnComponentAggFuncSeparator}{column name}
  ariaDropZoneColumnComponentAggFuncSeparator: ' 的 ',
  ariaDropZoneColumnComponentDescription: '按 DELETE 键移除',

  ariaDropZoneColumnComponentSortAscending: '升序',
  ariaDropZoneColumnComponentSortDescending: '降序',

  ariaDropZoneColumnGroupItemDescription: '按 ENTER 键排序',
  ariaDropZoneColumnValueItemDescription: '按 ENTER 键更改聚合类型',
  ariaFilterColumn: '按 CTRL ENTER 打开过滤器',
  ariaFilterColumnsInput: '过滤列输入',
  ariaFilterFromValue: '过滤从值',
  ariaFilteringOperator: '过滤运算符',
  ariaFilterInput: '过滤器输入',

  ariaFilterList: '过滤器列表',

  ariaFilterMenuOpen: '打开过滤器菜单',
  ariaFilterPanelList: '过滤列表',

  ariaFilterToValue: '过滤至值',
  ariaFilterValue: '过滤值',
  ariaHidden: '隐藏',
  ariaIndeterminate: '不确定',

  ariaInputEditor: '输入编辑器',
  ariaLabelAdvancedFilterAutocomplete: '高级筛选自动完成',
  ariaLabelAdvancedFilterBuilderAddField: '高级筛选生成器添加字段',
  ariaLabelAdvancedFilterBuilderColumnSelectField: '高级筛选生成器列选择字段',
  ariaLabelAdvancedFilterBuilderJoinSelectField:
    '高级筛选生成器连接操作符选择字段',
  ariaLabelAdvancedFilterBuilderOptionSelectField: '高级筛选生成器选项选择字段',
  ariaLabelAggregationFunction: '聚合函数',
  ariaLabelCellEditor: '单元格编辑器',
  ariaLabelColumnFilter: '列过滤器',
  ariaLabelColumnMenu: '列菜单',
  ariaLabelContextMenu: '上下文菜单',
  ariaLabelDialog: '对话框',
  ariaLabelRichSelectDeleteSelection: '按下删除键来取消选择项目',
  ariaLabelRichSelectDeselectAllItems: '按下删除键来取消选择所有项目',
  // aria labels for rich select
  ariaLabelRichSelectField: '丰富选择字段',
  ariaLabelRichSelectToggleSelection: '按下空格键以切换选择',
  ariaLabelSelectField: '选择字段',
  ariaLabelSubMenu: '子菜单',
  ariaLabelTooltip: '工具提示',
  ariaMenuColumn: '按 ALT 向下 打开列菜单',
  ariaPageSizeSelectorLabel: '页面大小',
  ariaPivotDropZonePanelLabel: '列标签',
  ariaRowDeselect: '按 SPACE 取消选择此行',
  // ARIA Labels for Drop Zones
  ariaRowGroupDropZonePanelLabel: '行分组',
  ariaRowSelect: '按 SPACE 选择此行',
  ariaRowSelectAll: '按 Space 切换所有行选择',
  ariaRowSelectionDisabled: '此行的行选择功能被禁用',
  ariaRowToggleSelection: '按 Space 切换行选择',
  ariaSearch: '搜索',
  ariaSearchFilterValues: '搜索过滤值',
  ariaSkeletonCellLoading: '行数据加载中',
  ariaSkeletonCellLoadingFailed: '行加载失败',
  ariaSortableColumn: '按 ENTER 排序',
  ariaToggleCellValue: '按 Space 切换单元格值',
  ariaToggleVisibility: '按 Space 切换可见性',

  ariaUnchecked: '未选中',
  ariaValuesDropZonePanelLabel: '值',
  ariaVisible: '可见',
  august: '八月',
  automatic: '自动',
  autoRotate: '自动旋转',
  autosizeAllColumns: '自动调整所有列',
  autosizeThisColumn: '自动调整该列',
  avg: '平均',
  axis: '轴',
  axisType: '轴类型',
  background: '背景',
  bar: '条形图',
  barChart: '条形图',
  barGroup: '条形图',
  before: '之前',
  blank: '空白',
  blanks: '(空白)',
  blur: '模糊',
  bold: '加粗',
  boldItalic: '加粗斜体',
  bottom: '底部',
  boxPlot: '箱线图',

  boxPlotTooltip: '箱线图',

  bubble: '气泡图',
  bubbleTooltip: '气泡图',
  callout: '标注',
  calloutLabels: '标注标签',
  cancelFilter: '取消',
  cap: '顶部',
  capLengthRatio: '顶部长度比',
  categories: '类别',
  category: '类别',
  categoryAdd: '添加类别',
  categoryValues: '类别值',
  chartAdvancedSettings: '高级设置',
  chartDownload: '下载图表',
  chartDownloadToolbarTooltip: '下载图表',
  chartEdit: '编辑图表',
  chartLink: '链接到网格',
  chartLinkToolbarTooltip: '链接到网格',
  chartMenuToolbarTooltip: '菜单',
  chartRange: '图表范围',
  chartSettingsToolbarTooltip: '菜单',
  chartStyle: '图表样式',
  chartSubtitle: '副标题',
  chartTitle: '图表标题',
  chartTitles: '标题',
  chartUnlink: '从网格中取消链接',
  chartUnlinkToolbarTooltip: '从网格中取消链接',
  chooseColumns: '选择列',
  circle: '圆形',
  clearFilter: '清除',
  collapseAll: '关闭所有行组',
  color: '颜色',
  column: '柱形图',
  columnChart: '柱状图',
  columnChooser: '选择列',
  columnFilter: '列过滤',
  columnGroup: '柱形图',
  columnLineCombo: '柱状图和折线图组合',
  columnLineComboTooltip: '柱图与折线图',
  // Side Bar
  columns: '列',
  combinationChart: '组合图',
  combinationGroup: '组合图',
  connectorLine: '连接线',

  // Text Filter
  contains: '包含',
  copy: '复制',
  copyWithGroupHeaders: '复制包含组标题',
  copyWithHeaders: '复制包含标题',
  count: '计数',
  cross: '十字符',
  crosshair: '准星',
  crosshairLabel: '标签',
  crosshairSnap: '对节点对齐',
  csvExport: '导出为CSV',
  ctrlC: 'Ctrl+C',
  ctrlV: 'Ctrl+V',
  ctrlX: 'Ctrl+X',
  customCombo: '自定义组合',
  customComboTooltip: '自定义组合',
  cut: '剪切',
  data: '设置',
  dateFilter: '日期过滤器',
  // Date Filter
  dateFormatOoo: 'yyyy-mm-dd',
  december: '十二月',
  decimalSeparator: '.',
  defaultCategory: '(无)',
  diamond: '菱形',
  direction: '方向',
  donut: '环形图',
  donutTooltip: '环形图',
  durationMillis: '持续时间 (毫秒)',
  empty: '选择一个',
  enabled: '启用',
  endAngle: '终止角度',
  endsWith: '结束于',
  equals: '等于',
  excelExport: '导出为Excel',
  expandAll: '展开所有行组',
  export: '导出',
  false: '假',
  february: '二月',
  fillOpacity: '填充不透明度',
  filteredRows: '已筛选',
  // Number Filter & Text Filter
  filterOoo: '过滤...',
  filters: '过滤器',
  first: '第一个',
  firstPage: '第一页',
  fixed: '固定',
  font: '字体',
  footerTotal: '合计',
  format: '自定义',
  greaterThan: '大于',
  greaterThanOrEqual: '大于等于',
  gridLines: '网格线',
  // Header of the Default Group Column
  group: '组',
  groupBy: '按此分组',
  groupedAreaTooltip: '面积图',
  groupedBar: '分组',
  groupedBarFull: '分组条形图',
  groupedBarTooltip: '分组',
  groupedColumn: '分组',
  groupedColumnFull: '分组柱形图',
  groupedColumnTooltip: '分组',
  groupedSeriesGroupType: '分组',
  // Group Column Filter
  groupFilterSelect: '选择字段:',
  groupPadding: '组间距',
  groups: '行组',
  heart: '爱心',
  heatmap: '热力图',
  heatmapTooltip: '热力图',
  height: '高度',
  hierarchicalChart: '层次图',
  hierarchicalGroup: '层次图',
  histogram: '直方图',
  histogramBinCount: '箱数',
  histogramChart: '直方图',
  histogramFrequency: '频率',
  histogramTooltip: '直方图',
  horizontal: '水平',
  horizontalAxisTitle: '水平轴标题',
  innerRadius: '内半径',
  inRange: '介于',
  inRangeEnd: '到',
  inRangeStart: '从',
  inside: '内部',
  invalidColor: '无效的颜色值',
  invalidDate: '无效日期',
  invalidNumber: '无效数字',
  italic: '斜体',
  itemPaddingX: '项目内边距 X',
  itemPaddingY: '项目内边距 Y',
  itemSpacing: '项目间距',
  january: '一月',
  july: '七月',
  june: '六月',
  labelPlacement: '标签位置',
  labelRotation: '旋转',
  labels: '标签',
  last: '最后一个',
  lastPage: '最后一页',
  layoutHorizontalSpacing: '横向间距',
  layoutVerticalSpacing: '纵向间距',
  left: '左边',
  legend: '图例',
  legendEnabled: '启用',
  length: '长度',
  // Number Filter
  lessThan: '小于',
  lessThanOrEqual: '小于等于',
  line: '折线图',
  lineDash: '线条虚线',
  lineDashOffset: '虚线偏移',
  lineGroup: '折线图',
  lineTooltip: '折线图',
  lineWidth: '线宽',
  loadingError: '错误',
  // Other
  loadingOoo: '加载中...',
  march: '三月',
  markerPadding: '标记内边距',
  markers: '标记',
  markerSize: '标记大小',
  markerStroke: '标记描边',
  max: '最大值',
  maxSize: '最大大小',
  may: '五月',
  min: '最小值',
  miniChart: '迷你图表',
  minSize: '最小大小',
  more: '更多',
  navigator: '导航器',
  nextPage: '下一页',
  nightingale: '夜莺图',
  nightingaleTooltip: '玫瑰图',
  noAggregation: '无',
  noDataToChart: '无可绘制的数据。',
  noMatches: '无匹配项',
  none: '无',
  noPin: '取消固定',
  normal: '常规',
  normalizedArea: '100% 堆积',
  normalizedAreaFull: '100% 堆积面积图',
  normalizedAreaTooltip: '100% 堆积',
  normalizedBar: '100% 堆积',
  normalizedBarFull: '100% 堆积条形图',
  normalizedBarTooltip: '100% 堆积',
  normalizedColumn: '100% 堆积',
  normalizedColumnFull: '100% 堆积柱形图',
  normalizedColumnTooltip: '100% 堆积',
  normalizedSeriesGroupType: '100% 堆积',
  noRowsToShow: '无显示行',
  notBlank: '非空',
  notContains: '不包含',
  notEqual: '不等于',
  november: '十一月',
  number: '数值',
  numberFilter: '数字过滤器',
  october: '十月',
  of: '的',
  offset: '偏移',
  offsets: '偏移',
  orCondition: '或',
  orientation: '方向',
  outside: '外部',
  padding: '内边距',
  page: '页',
  pageLastRowUnknown: '?',
  pageSizeSelectorLabel: '每页大小：',
  paired: '配对模式',
  parallel: '平行',
  paste: '粘贴',
  perpendicular: '垂直',
  pie: '饼图',
  pieChart: '饼图',
  pieGroup: '饼图',
  pieTooltip: '饼图',
  // Menu
  pinColumn: '固定列',
  pinLeft: '固定在左侧',
  pinRight: '固定在右侧',
  pivotChart: '数据透视图',
  // Enterprise Menu (Charts)
  pivotChartAndPivotMode: '数据透视图和数据透视模式',
  pivotChartRequiresPivotMode: '数据透视图需要启用数据透视模式。',
  // Charts
  pivotChartTitle: '数据透视图',
  // Pivoting
  pivotColumnGroupTotals: '总计',
  pivotColumnsEmptyMessage: '拖动到此处设置列标签',
  // columns tool panel
  pivotMode: '透视模式',
  pivots: '列标签',
  plus: '加号',
  polarAxis: '极坐标轴',
  polarAxisTitle: '极坐标轴标题',
  polarChart: '极地图',
  polarGroup: '极坐标图',
  polygon: '多边形',
  position: '位置',
  positionRatio: '位置比例',
  predefined: '预定义',
  preferredLength: '首选长度',
  previousPage: '上一页',
  radarArea: '雷达面积',
  radarAreaTooltip: '雷达面积图',
  radarLine: '雷达线',
  radarLineTooltip: '雷达线图',
  radialBar: '径向条形图',
  radialBarTooltip: '径向条图',
  radialColumn: '径向柱状图',
  radialColumnTooltip: '径向柱图',
  radiusAxis: '半径轴',
  radiusAxisPosition: '位置',
  rangeArea: '区间面积图',
  rangeAreaTooltip: '范围面积图',
  rangeBar: '区间条形图',
  rangeBarTooltip: '范围条图',
  rangeChartTitle: '范围图',
  // eslint-disable-next-line no-template-curly-in-string
  removeFromLabels: '将${variable}从标签中移除',
  // eslint-disable-next-line no-template-curly-in-string
  removeFromValues: '将${variable}从值中移除',
  resetColumns: '重置列',
  resetFilter: '重置',
  reverseDirection: '反向',
  right: '右边',
  // Row Drag
  rowDragRow: '行',
  rowDragRows: '行',
  rowGroupColumnsEmptyMessage: '拖动到此处设置行组',
  scatter: '散点图',
  scatterGroup: '散点图',

  scatterTooltip: '散点图',
  scrollingStep: '滚动步骤',
  scrollingZoom: '滚动',
  searchOoo: '搜索...',
  secondaryAxis: '次轴',
  sectorLabels: '扇区标签',
  // Set Filter
  selectAll: '(全选)',
  selectAllSearchResults: '(全选搜索结果)',
  selectedRows: '已选中',
  selectingZoom: '选择',
  september: '九月',
  series: '系列',
  seriesAdd: '添加系列',
  seriesChartType: '系列图表类型',
  seriesGroupType: '分组类型',
  seriesItemLabels: '项目标签',
  seriesItemNegative: '负面',
  seriesItemPositive: '正面',
  seriesItems: '系列项目',
  seriesItemType: '项目类型',
  seriesLabels: '系列标签',
  seriesPadding: '系列间距',
  seriesType: '系列类型',
  setFilter: '集合过滤器',
  settings: '图表',
  shadow: '阴影',
  shape: '形状',
  size: '大小',
  sortAscending: '升序排列',
  sortDescending: '降序排列',
  sortUnSort: '清除排序',
  spacing: '间距',
  specializedChart: '专项图',
  specializedGroup: '专用图',
  square: '方形',
  stackedArea: '堆积',
  stackedAreaFull: '堆积面积图',
  stackedAreaTooltip: '堆积',
  stackedBar: '堆积',
  stackedBarFull: '堆积条形图',
  stackedBarTooltip: '堆积',
  stackedColumn: '堆积',
  stackedColumnFull: '堆积柱形图',
  stackedColumnTooltip: '堆积',
  stackedSeriesGroupType: '堆积',
  startAngle: '起始角度',
  startsWith: '开始于',

  statisticalChart: '统计图',
  statisticalGroup: '统计图',
  strokeColor: '线条颜色',
  strokeOpacity: '线条不透明度',
  strokeWidth: '描边宽度',
  // Enterprise Menu Aggregation and Status Bar
  sum: '总和',

  sunburst: '旭日图',
  sunburstTooltip: '旭日图',
  switchCategorySeries: '切换类别 / 系列',
  // Filter Titles
  textFilter: '文本过滤器',
  thickness: '厚度',
  // Number Format (Status Bar, Pagination Panel)
  thousandSeparator: ',',
  ticks: '刻度',
  tile: '瓦片',

  time: '时间',
  timeFormat: '时间格式',
  timeFormatDashesYYYYMMDD: 'YYYY-MM-DD',
  timeFormatDotsDDMYY: 'DD.M.YY',
  timeFormatDotsMDDYY: 'M.DD.YY',
  timeFormatHHMMSS: 'HH:MM:SS',
  timeFormatHHMMSSAmPm: 'HH:MM:SS 上午/下午',
  timeFormatSlashesDDMMYY: 'DD/MM/YY',
  // Time formats
  timeFormatSlashesDDMMYYYY: 'DD/MM/YYYY',
  timeFormatSlashesMMDDYY: 'MM/DD/YY',
  timeFormatSlashesMMDDYYYY: 'MM/DD/YYYY',
  timeFormatSpacesDDMMMMYYYY: 'DD MMMM YYYY',
  title: '标题',

  titlePlaceholder: '图表标题',
  to: '至',

  tooltips: '工具提示',
  top: '顶部',

  totalAndFilteredRows: '行',
  totalRows: '总行数',
  treemap: '树图',
  treemapTooltip: '树状图',
  triangle: '三角形',
  // Data types
  true: '真',
  ungroupAll: '取消全部分组',
  ungroupBy: '取消按此分组',
  valueAggregation: '值汇总',
  valueColumnsEmptyMessage: '拖动到此处聚合',
  values: '值',
  vertical: '垂直',
  verticalAxisTitle: '垂直轴标题',
  waterfall: '瀑布图',
  waterfallTooltip: '瀑布图',
  weight: '粗细',

  whisker: '须',
  width: '宽度',
  xAxis: '水平轴',
  xOffset: 'X 偏移',
  xType: 'X 类型',
  xyChart: 'X Y (散点图)',
  xyValues: 'XY 值',
  yAxis: '垂直轴',
  yOffset: 'Y 偏移',
  zoom: '缩放',
};

// 表格默认配置
export const GRID_OPTIONS = {
  animateRows: true, // 开启行动画
  cacheBlockSize: 100, // 缓存中的每个块应该包含多少行
  defaultColDef: {
    autoHeaderHeight: true, // 自适应表头高度
    // autoHeight: true, // 表格列自适应高度
    cellStyle: {
      color: '#333',
      textAlign: 'left',
    },
    editable: false, // 是否可编辑
    filter: 'agMultiColumnFilter', // 开启数据刷选器，就是在列头上增加数据搜索过滤功能
    filterParams: {
      buttons: ['apply', 'reset'], // 过滤器按钮
      closeOnApply: true, // 按住apply reset按钮关闭
      excelMode: 'windows', // 转换为widows模式
      showTooltips: true, // 设置过滤器工具提示
    },
    headerCheckboxSelectionFilteredOnly: true, // 全选仅仅勾选筛选的全部
    maxWidth: 600, // 最大宽度
    // 默认的列配置 , AgGridVue标签属性上设置  columnMenu = 'legacy' 有效
    menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'], // 表头menuTabs，默认第一个为筛选器
    // lockPosition: true,  //列位置为true代表不能拖动列
    minWidth: 100, // 列最小宽度
    resizable: true, // 允许调整列大小，就是拖动改变列大小
    // rowDragManaged: true, // 拖拽
    sortable: true, // 可以排序
    wrapHeaderText: true, // 表头自动换行
  },
  defaultCsvExportParams: {
    // columnGroups: true,
    fileName: '导出数据.csv',
  },
  defaultExcelExportParams: {
    author: 'DK developer', // 导出作者
    exportAsExcelTable: true, // 将表格样式以及筛选条件一并导出
    // columnGroups: true,
    exportedRows: 'filteredAndSorted', // all 所有数据 / filteredAndSorted 过滤和筛选后的数据
    fileName: '导出数据.xlsx',
    sheetName: 'sheet',
  },

  // groupSelectsFiltered: true, // 勾选行组只获取子级数据
  groupSelects: 'filteredDescendants',
  groupSelectsChildren: true, // 选中子级
  // stopEditingWhenCellsLoseFocus: true, //在编辑的时候点击表格任何地方停止编辑
  headerHeight: 40, // 表头高度
  localeText: AG_GRID_LOCALE_CN, // 中英文
  rowBuffer: 10, // 行缓冲区，默认为10行
  rowHeight: 35, // 设置行高为30px,默认情况下25px
  rowSelection: 'multiple', // 行多选
  suppressContextMenu: false, // 关闭右键菜单列表
  suppressRowClickSelection: true, // 点击及选择复选框
  suppressScrollOnNewData: true, // 网格在页面更改时不要滚动到顶部。
  // suppressMenuHide: true, // 默认显示menu图标
  tooltipMouseTrack: true, // 用鼠标跟踪以演示工具提示需要跟随光标的方案
  tooltipShowDelay: 100, // 鼠标触摸提示出现时间100毫秒
};
