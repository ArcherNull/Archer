import { localeText } from './agGrid-localeText'

// 设置表格配置项
export const gridOptions = {
  // 全局列配置
  // defaultColDef,
  /* *********** 表格属性 ***************** */

  // defaultColGroupDef={} // 默认列组定义
  // enableColResize: false, // 允许拖动修改列宽【不起作用】
  suppressAutoSize: false, // 【重要】列的自动调整，下方滚动条消失，如果ag-grid-vue标签上绑定属性:enable-col-resize="true"，该属性失效，效果等同于调用gridApi.sizeColumnsToFit()方法
  suppressMovableColumns: false, // 【重要】禁止列拖动移动，固定列的位置
  // suppressFieldDontNotation // 如果为true，则address.firstline字段名称中的点（例如）不被视为深引用。如果您愿意，可以在字段名称中使用点。
  unSortIcon: false, // 【重要】todo 设置为true常显示“无排序”图标
  suppressMenuHide: false, //  【重要】设置为true以始终显示列菜单按钮，而不是仅在鼠标位于列标题上时显示。
  // autoGroupColumnDef // todo 如果您对默认值不满意，则允许指定组“自动列”。如果分组，则此列def包含在网格中的第一列定义中。如果不进行分组，则不包括此列。
  // suppressSetColumnStateEvents // todo 设置为true以禁止在调用columnApi.setColumnState(state)和 columnApi.resetColumnState()调用时引发的列事件。
  // quickFilterText: '', // 【重要】使用此文本过滤行作为快速过滤器。

  // enableSorting: true, // 允许排序【不起作用】
  // enableFilter: true, // 允许筛选 加上报错 不知道是不是版权的原因【不起作用】
  // showToolPanel: true, // 【不起作用】
  rowSelection: 'multiple', // 【重要】 单选single/多选multiple ;多选打开，默认只能单选，支持多选multiple ；企业级的支持shift连续多选和ctrl不连续多选，如果ag-grid-vue标签上不绑定属性row-selection="multiple"该属性不生效
  rowMultiSelectWithClick: true, // 【重要】为true表示允许单击选择多行,为false不能，要选多行，只能通过ctrl+鼠标左键点击
  suppressRowClickSelection: true, // 【重要】如果为true， 则单击行时不会发生行选择。当您想要专门选择复选框时使用。
  suppressCellSelection: false, // 如果为true，则不能选择列。这意味着当您单击它们时，列不会获得键盘焦点。
  // enableRangeSelection // 设置为true以启用范围选择。
  // rowDragManaged: true, // 设置为true以启用托管行拖动。启动分页、排序、过滤之后无效【不起作用】
  suppressRowDrag: true, // 设置为true以禁止行拖动。【未知其作用】
  singleClickEdit: false, // 【重要】设置为true以启用列的单击编辑，只需单击即可开始编辑。
  // suppressClickEdit: true, // 【重要】设置为true，以便单击或双击都不会开始编辑。请参阅单击，双击，无单击编辑
  // enableGroupEdit // 设置为true以启用组编辑，否则默认情况下无法编辑行组。
  // editType: 'fullRow', // 设置为“fullRow”以启用“ 完整行编辑”。否则留空以一次编辑一个列。【不起作用】
  enableCellChangeFlash: true, // 【重要】设置为true以使数据更改后列闪烁。请参阅闪烁数据更改。
  stopEditingWhenCellsLoseFocus: true, // 【不起作用】将此设置为true可 在网格失去焦点时停止列编辑。默认情况下，网格会一直编辑，直到焦点转到另一个列。仅适用于内联（非弹出）编辑器。
  // enterMovesDown enterMovesDownAfterEdit // 将两个属性都设置为true以使Enter键具有Excel样式行为，即输入键向下移动。
  headerHeight: 40, // 【重要】包含列标签标题的行的高度。如果未指定，则默认值为30px。请参阅标题高度示例。
  // groupHeaderHeight // 包含标题列组的行的高度。如果未指定，则使用headerHeight。请参阅标题高度示例。
  // floatingFilter: false, // 【重要】浮动过滤器的显示和隐藏，就是列头下面的筛选器
  // floatingFiltersHeight: 34, // 【重要】包含浮动过滤器的行的高度。如果未指定，则默认值为30px。请参阅标题高度示例。
  // pivotHeaderHeight // 在枢轴模式下包含列的行的高度。如果未指定，则使用headerHeight。请参阅标题高度示例。
  // pivotGroupHeaderHeight // 处于透视模式时包含标题列组的行的高度。如果未指定，则使用groupHeaderHeight。请参阅标题高度示例。
  // 行分组和透视
  // 数据和行模型
  // 滚动
  // 分页
  pagination: false, // 【重要】分页已启用，前端分页。
  // paginationPageSize:50 ,// 【重要】数。每页加载多少行。默认值= 100.如果paginationAutoPageSize 指定，则忽略此属性。请参阅自定义分页示例。
  paginationAutoPageSize: true, // 【重要】True - 每页加载的行数由ag-Grid自动调整，因此每个页面显示足够的行以填充为网格指定的区域。是以表格高度为限制，此属性设定之后paginationPageSize:50失效
  // suppressPaginationPanel: true, // True - 开箱即用的ag-Grid导航控件是隐藏的。如果pagination=true您想要提供自己的分页控件，这将非常有用 。 False（默认） - 当pagination=true它自动在底部显示必要的控件，以便用户可以浏览不同的页面。请参见示例自定义分页控件。
  /* 行块加载：无限和企业行模型 */
  /* 行模型：视口 */
  /* 全宽渲染器 */
  /* 大师细节 */
  /* 渲染和造型 */
  rowHeight: 36, // 【重要】默认行高度（以像素为单位）。默认值为30。
  animateRows: true, // 【重要】设置为true以启用行动画。
  rowStyle: { 'font-weight': '400', color: '#999', 'font-size': '14px' }, // 【重要】给出特定行的样式。请参见行样式。
  // rowClass	给出特定行的类。请参阅行类。
  // rowClassRules	可以应用于包含某些CSS类的规则。请参阅行类规则。
  // excelStyles	导出到Excel时要使用的Excel样式列表
  // scrollbarwidth  设定	告诉网格滚动条在网格宽度计算的计算中使用的宽度。仅在使用非标准浏览器提供的滚动条时设置，因此网格可以在其计算中使用非标准大小。
  // suppressRowHoverHighlight	设置为true以通过添加ag-row-hoverCSS类不突出显示行。
  /* 国际化 */
  // localeText，localeTextFunc	您可以通过提供a localeText或a 来更改分页面板和默认过滤器中的文本localeTextFunc（请参阅下文）。见国际化。
  localeText, // 【重要】国际化
  overlayLoadingTemplate: `<span></span>`, // 【重要】叠加层 loadding----加载中
  overlayNoRowsTemplate: `<span></span>`, // 【重要】叠加层 loadding----无数据
  /* 其他 */
  // defaultExportParams: true, // 用于导出到csv或 excel的默认配置对象,该属性适用于版本v25.2，新版本是defaultCsvExportParams
  // defaultCsvExportParams: true,
  // 导出excel参数
  /*   exportParams: {
      columnGroups: true,
      fileName: '导出数据.csv'
    }, */
  defaultCsvExportParams: {
    columnGroups: true,
    fileName: '导出数据.csv'
  },
  enableCellExpressions: true, // 设置为true以允许列表达式。
  // ensureDomOrder: true,	// 【未知其作用】如果为true，则dom中行和列的顺序与屏幕上的顺序一致。请参阅辅助功能 - 行和列顺序。
  suppressDragLeaveHidesColumns: true, // 【不起作用】如果为true，则将列拖出网格（例如，拖到组区域）时，不会隐藏该列。
  suppressCopyRowsToClipboard: true, // 【不起作用】设置为true以仅具有范围选择，而不是行选择，复制到 剪贴板。企业级版本属性
  // clipboardDeliminator	// 【不起作用】指定在复制到剪贴板时使用的分隔符。企业级版本属性
  suppressFocusAfterRefresh: true, // 设置为true以在刷新后不将焦点设置回网格。这可以避免您希望将注意力集中在浏览器的另一部分上的问题。
  // suppressTabbing // 【不起作用】设置为true以删除网格标签功能。如果要以不同于网格提供的方式管理选项卡，请使用此选项。
  // suppressContextMenu: true, // 【不起作用】设置为true表示不显示上下文菜单。如果您不想使用默认的“右键单击”上下文菜单，请使用此选项。
  // allowContextMenuWithControlKey: true, // 【不起作用】允许上下文菜单显示，即使在Ctrl键被按下。
  /* 底部添加状态栏 */
  // statusBar: {
  //   statusPanels: [
  //     { statusPanel: 'BtnLiist' },
  //     {
  //       statusPanel: 'agAggregationComponent',
  //       statusPanelParams: {
  //         aggFuncs: ['count', 'sum']
  //       }
  //     }
  //   ]
  // },
  // 设置置顶行【重要】
  pinnedTopRowData: [],
  // getRowHeight: function(params) {
  //   if (params.node.rowPinned) {
  //     return 36
  //   } else {
  //     return 80
  //   }
  // },
  // 设置置顶行样式【重要】
  getRowStyle: function(params) {
    if (params.node.rowPinned) {
      return { 'font-weight': 'bold', color: 'rgba(0,0,0,0.01)', backgroundColor: '#fff' }
    }
  },
  pinnedBottomRowData: [
    {
      numericalOrder: '0条',
      age: 0,
      pr: 0
    }
  ]
}

// 默认列样式
export const defaultColDef = {
  // 默认宽度宽度 ， 如果存在resizable: true, width/minWidth/maxWidth限制失效，并且gridApi.sizeColumnsToFit()也会打破width/minWidth/maxWidth限制
  // 这个应该是style的width样式,resizable: true/ gridApi.sizeColumnsToFit(),是js改变dom样式，优先级大于style
  // 要将这个gridApi.sizeColumnsToFit()注释掉，width才生效
  width: 120,
  minWidth: 50, // 【重要】最小宽度， 最小和最大宽度可限制列拖动
  maxWidth: 600, // 【重要】最大宽度
  editable: false, // 是否可编辑,存在突然失效的情况【未知其原因】在键盘中按下D可打开编辑,跟options中的singleClickEdit: false,true单击可编辑存在关联,false不实现单击可关联
  suppressMenu: false, // 【重要】列头右侧的菜单栏按钮显示和隐藏，true为隐藏，false为显示
  cellStyle: { color: '#333', 'line-height': '36px' }, // 列的单元格默认样式
  hide: false, // 是否隐藏
  sort: true, // 前端排序方式 asc 顺序 desc倒序，还有自定义拍序 .优先顺序为 sortable为true,才能设置排序方法，sort与 comparator 不能共存
  // comparator: dateComparator, // 自定义排序，dateComparator为排序方法名
  sortable: true, // 是否开启排序，这个是展示原本的列头排序，当sort设置不是true时，有数字展示；操作之后就消失
  resizable: true, // true可以拖动改变列的大小，false不允许用户拖动改变列大小
  filter: true // 是否显示筛选
}
