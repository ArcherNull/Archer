export const defaultColDef = {
  // 默认宽度宽度 ， 如果存在resizable: true, width/minWidth/maxWidth限制失效，并且gridApi.sizeColumnsToFit()也会打破width/minWidth/maxWidth限制
  // 这个应该是style的width样式,resizable: true/ gridApi.sizeColumnsToFit(),是js改变dom样式，优先级大于style
  // 要将这个gridApi.sizeColumnsToFit()注释掉，width才生效
  width: 120,
  minWidth: 50, // 【重要】最小宽度， 最小和最大宽度可限制列拖动
  maxWidth: 600, // 【重要】最大宽度
  editable: false, // 是否可编辑,存在突然失效的情况【未知其原因】在键盘中按下D可打开编辑,跟options中的singleClickEdit: false,true单击可编辑存在关联,false不实现单击可关联
  suppressMenu: false, // 【重要】列头右侧的菜单栏按钮显示和隐藏，true为隐藏，false为显示
  cellStyle: { color: '#333', 'line-height': '34px' }, // 列的单元格默认样式
  hide: false, // 是否隐藏
  sort: true, // 前端排序方式 asc 顺序 desc倒序，还有自定义拍序 .优先顺序为 sortable为true,才能设置排序方法，sort与 comparator 不能共存
  // comparator: dateComparator, // 自定义排序，dateComparator为排序方法名
  sortable: true, // 是否开启排序，这个是展示原本的列头排序，当sort设置不是true时，有数字展示；操作之后就消失
  resizable: true, // true可以拖动改变列的大小，false不允许用户拖动改变列大小
  filter: true, // 是否显示筛选
  // 【未知其作用】
  menuTabs: ['filterMenuTab'] // 有效值为：'filterMenuTab'，'generalMenuTab'和'columnsMenuTab' TODO filterMenuTab无效

  // enableRowGroup: true, // 打开列集合
  // enablePivot: true, // 打开枢轴控件
  // enableValue: true
  // 【未知其作用】
  // headerComponentParams: { menuIcon: "fa-bars" },
  // columnGroupShow:false, // 是否在组打开/关闭时显示列
  // toolPanelClass:[],
  // suppressToolPanel:false,
  // checkboxSelection:false,
  // rowDrag:false,
  // suppressResize:false,
  // suppressAggFuncInHeader:true,
}
