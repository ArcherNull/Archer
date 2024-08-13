/*
 * @Author: Null
 * @Date: 2022-02-22 16:08:32
 * @Description: ag-grid 方法
 *
 * ag-grid方法官方文档：https://www.ag-grid.com/vue-data-grid/grid-events/
 *
 */

// 定时器，用于刷新手动计算的合计行 paginationChanged
import {
  SHOW_CALC_BOTTOM_ROWS,
  SELECTD_ALL_THRESHOLD_NUM,
  AG_GRID_IS_SELECTED_All_BY_BACK_END,
} from "./agGrid-config";

import {
  AgGridUtils,
  refreshTotal,
  refreshTotalToList,
  getCurrentGridDataAndNumericalOrder,
} from "./agGrid-utils";

import { throttle } from 'lodash'

export const agGridMethods = {
  /**
   * @description: 滚动事件bodyScroll,对应ag-grid-vue 标签上的@bodyScroll事件的监听
   * @param {*} event
   * @return {*}
   */
  bodyScroll(event) {
    console.log("滚动事件bodyScroll", event);
  },

  /**
   * @description: 停止触底事件bodyScrollEnd,对应ag-grid-vue 标签上的@bodyScrollEnd事件的监听
   * @param {*} event
   * @return {*}
   */
  bodyScrollEnd(event) {
    if (this.agTableSwitch.isScrollEndRequest) {
      console.log("停止滚动事件bodyScrollEnd", event);
      const gridApi = event.api;

      const lastDisplayedRowIndex = gridApi.getLastDisplayedRow();
      const displayedRowCount = gridApi.getDisplayedRowCount();
      const getRootGridData = gridApi.getModel().rootNode.allLeafChildren || [];

      if (displayedRowCount) {
        if (
          getRootGridData.length === displayedRowCount &&
          displayedRowCount === lastDisplayedRowIndex + 1
        ) {
          console.log("滚动条触底了，可以出发接口调用下一页数据");
          this.$emit("requestNextPage");
        } else {
          console.log("滚动条未触底");
        }
      }
    }
  },

  /**
   * @description: 停止触底事件bodyScrollEnd,对应ag-grid-vue 标签上的@bodyScrollEnd事件的监听
   * @param {*} event
   * @return {*}
   */
  getVerticalPixelRange(event) {
    console.log("尺寸范围", event);
  },

  /**
   * @description: ag-grid创建完成后执行的事件,对应ag-grid-vue 标签上的@gridReady事件的监听
   * @param { ag-grid-vue组件传递过来的api } params
   * @return {*}
   */
  onGridReady(params) {
    console.log("ag-grid实例params", params);
    this.$emit("getGridApi", params);
    // 获取gridApi
    //  this.gridApi = params.api
    // this.columnApi = params.columnApi
    // 这时就可以通过gridApi调用ag-grid的传统方法了，调整表格为自适应
    // this.gridApi.sizeColumnsToFit()
  },

  /**
   * @description: 单元格鼠标悬浮事件cellMouseOver，对应ag-grid-vue 标签上的 @cellMouseOver
   * @param { 鼠标悬浮在单元格上的数据 } cell
   * @return {*}
   */
  onCellMouseOver(cell) {
    console.log("单元格鼠标悬浮事件cellMouseOver", cell);
    if (cell.type === "cellMouseOver") {
      this.hoveredCell = cell;
    }
    // console.log('this', this.columnApi.getRowStyle)
    // console.log('cell', cell.colDef.cellStyle)
  },

  /* ****************  单元格点击事件调用顺序：onCellClicked => rowClicked => onRowDoubleClicked  **************** */
  /**
   * @description: 单元格点击事件onCellClicked,对应ag-grid-vue 标签上的 @cellClicked
   * @param { 点击的单元格数据 } cell
   * @return {*}
   */
  onCellClicked(cell) {
    this.$emit("onCellClicked", cell);
    console.log("单元格点击事件onCellClicked", cell);
    // 获取选中单元格的数据
    console.log(
      "单元格点击事件onCellClicked--获取选中单元格的数据",
      cell.value
    );
    // 获取选中单元格所在行号
    console.log(
      "单元格点击事件onCellClicked--获取选中单元格所在行号",
      cell.rowIndex
    );
    // 获取选中单元格所在行的数据
    console.log(
      "单元格点击事件onCellClicked--获取选中单元格所在行的数据",
      cell.data
    );
  },

  /**
   * @description: 单元格点击事件onCellClicked,对应ag-grid-vue 标签上的 @cellClicked
   * @param { 点击的单元格数据 } cell
   * @return {*}
   */
  onCellDoubleClicked(cell) {
    console.log("onCellDoubleClicked", cell);
    this.$emit("onCellDoubleClicked", cell);
  },

  /**
   * @description: 行单击事件rowClicked ,对应ag-grid-vue标签上的@rowClicked
   * @param { 点击的行数据 } cell
   * @return { }
   */
  rowClicked(cell) {
    console.log(" ", cell);
    // this.getRowData(getData(cell))
    if (cell.rowPinned === "bottom") return;

    this.$emit("getRowData", cell);
  },

  /**
   * @description: 行单元格聚焦事件 ,对应ag-grid-vue标签上的@rowClicked
   * @param { 点击的行单元格 } cell
   * @return { }
   */
  onCellFocused(cell) {
    console.log("行单元格聚焦事件rowClicked", cell);

    // this.getRowData(getData(cell))
    if (cell.rowPinned === "bottom" || cell.column.pinned === "right") return;
    this.$emit("getRowData", cell);
  },

  /**
   * @description: 行双击事件onRowDoubleClicked,对应ag-grid-vue 标签上的 @rowDoubleClicked
   * @param { 双击的单元格数据 } cell
   * @return { 【注意】需要用鼠标尖叫图形去触发的，因为按F12，鼠标图形会变成圆形的，该事件就不会点击触发}
   */
  rowDoubleClicked(cell) {
    console.log("行双击事件onRowDoubleClicked", cell);
    console.log(
      "行双击事件onRowDoubleClicked--获取选中所在行的数据",
      cell.data
    );
    if (!["bottom", "top"].includes(cell.rowPinned)) {
      if (this.agTableSwitch.drawerDoubleShow) {
        this.openAgRowDataDetailDrawer = !this.openAgRowDataDetailDrawer;
        if (this.openAgRowDataDetailDrawer)
          this.agRowDataDetailData = cell.data;
      }
    }
    // this.$emit('onRowDoubleClickedFun', cell)
  },

  /* **************** 编辑事件调用顺序为：@cellEditingStarted => @cellValueChanged => @cellEditingStopped   ************** */
  /**
   * @description: 监听单元格开始编辑的事件cellEditingStarted,对应ag-grid-vue标签上的  @cellEditingStarted
   * @param { 开始编辑的单元格数据 } cell
   * @return {*}
   */
  cellEditingStarted(cell) {
    console.log("监听单元格开始编辑的事件cellEditingStarted", cell);
  },

  /**
   * @description: 监听单元格内容更改事件cellValueChanged,对应ag-grid-vue标签上的  @cellValueChanged
   * @param { 编辑内容更改的单元格数据 } cell
   * @return {*}
   */
  cellValueChanged(cell) {
    console.log("监听单元格内容更改事件cellValueChanged", cell);
  },

  /**
   * @description: 监听单元格修改后的操作cellEditingStopped,对应ag-grid-vue标签上的  @cellEditingStopped
   * @param { 终止编辑的单元格数据 } cell
   * @return {*}
   */
  cellEditingStopped(cell) {
    console.log("监听单元格修改后的操作cellEditingStopped", cell);
    this.$emit("cellEditingStoppedFun", cell);
  },

  /**
   * @description: cell选择事件回调onCellContextMenu,对应ag-grid-vue标签上的  @cellContextMenu
   * @param { 选中的行数据 } row
   * @return {*}
   */
  onCellContextMenu(row) {
    console.log("onCellContextMenu", row);
  },

  /**
   * @description: 列显示隐藏事件columnVisible , 对应ag-grid-vue标签上的  @columnVisible
   * @param {*} event
   * @return {*}
   */
  columnVisible(event) {
    console.log("列显示隐藏事件columnVisible", event);
    // 列必须消失后
    /*       if (!event.visible) {
                  // 可实现列保存功能
                } */
  },

  /**
   * @description: 列固定(冻结)事件columnPinned,对应ag-grid-vue标签上的  @columnPinned
   * @param {*} event
   * @return {*}
   */
  columnPinned(event) {
    console.log("列固定(冻结)事件columnPinned", event);
  },

  /**
   * @description: 列宽大小调整事件columnResized,对应ag-grid-vue标签上的  @columnResized
   * @param {*} event
   * @return {*}
   */
  columnResized(event) {
    console.log("列宽大小调整事件columnResized", event);
    // 列在拖动改变大小时是一个持续的过程，需要在完成的时候再去调用保存方法
    if (event.finished === true) {
      // 可实现列保存功能
    }
  },

  /**
   * @description: 列移动事件columnMoved ,对应ag-grid-vue标签上的  @columnMoved
   * @param {*} event
   * @return {*}
   */
  columnMoved(event) {
    console.log("列移动事件columnMoved", event);
    // 可实现列保存功能
  },

  /**
   * @description: 列显示或隐藏的监听事件,是ag-grid内的假显示或隐藏 ,对应ag-grid-vue标签上的 @columnVisible
   * @param {*} event
   * @return {*}
   */
  onColumnVisible(event) {
    console.log("列显示或隐藏的监听事件onColumnVisible", event);
  },

  /**
   * @description: 列数据加载的所有动作都完成最后的动作【不包括假数据筛选】,对应ag-grid-vue标签上的  @columnEverythingChanged
   * @param {*} event
   * @return {*}
   */
  columnEverythingChanged(event) {
    console.log(
      "列数据加载的所有动作都完成最后的动作【不包括假数据筛选】columnEverythingChanged",
      event
    );
  },

  /**
   * @description: 固定列数目发生改变监听事件,对应ag-grid-vue标签上的  @columnPinnedCountChanged
   * @param {*} event
   * @return {*}
   */
  columnPinnedCountChanged(event) {
    console.log("固定列数目发生改变监听事件columnPinnedCountChanged", event);
  },

  /* **************** 行数据事件 *************** */
  /**
   * @description: 行数据改变触发事件rowDataChanged,对应ag-grid-vue标签上的  @rowDataChanged
   * @param { 改变后的行数据 } row
   * @return {*}
   */
  rowDataChanged(row) {
    console.log("行数据改变触发事件rowDataChanged", row);
  },

  /**
   * @description: row选择事件回调rowSelected,对应ag-grid-vue标签上的  @rowSelected
   * @param { 选中的行数据 } row
   * @return {*}
   */
  // rowSelected(row) {
  //   console.log("row选择事件回调rowSelected", row);
  //   this.$emit("rowSelected", row);
  // },

  rowSelected: throttle(function(row) {
    console.log('row选择事件回调rowSelected', row)
    this.$emit('rowSelected', row)
  }, 150),

  /**
   * @description: row行数据改变事件触发rowValueChanged,对应ag-grid-vue标签上的  @rowValueChanged
   * @param {*} row
   * @return {*}
   */
  rowValueChanged(row) {
    console.log("row行数据改变事件触发rowValueChanged", row);
  },

  /* ************* 分页事件paginationChanged / 表格刷新事件OnRowDataUpdatedEvent  / 过滤事件FilterChangedEvent  *************** */
  /**
   * @description: 每次页面状态更改时刷新合计paginationChanged,对应ag-grid-vue标签上的  @paginationChanged
   * @param {*} event
   * @return {*}
   */
  paginationChanged(event) {
    console.log("执行=====>agGrid事件paginationChanged", event);
    const bool = SHOW_CALC_BOTTOM_ROWS;
    bool && paginationChanged(event);
  },

  /**
   * @description: 客户端已使用api.applyTransaction(transaction)或通过更改rowData绑定属性来更新网格数据immutableData=true。
   * 表格刷新事件，对应ag-grid-vue标签上的  @OnRowDataUpdatedEvent
   * @param {*} event
   * @return {*}
   */
  OnRowDataUpdatedEvent(event) {
    console.log("表格刷新事件OnRowDataUpdatedEvent", event);
    // 刷新合计
    const bool = SHOW_CALC_BOTTOM_ROWS;
    bool && paginationChanged(event);
  },

  /**
   * @description: 过滤事件,监听过滤行的筛选的改变，对应ag-grid-vue标签上的  @filterChanged
   * @param {*} event
   * @return {*}
   */
  FilterChangedEvent(event) {
    if (this.agTableSwitch.isFilterChangedRequest) {
      // 刷新合计
      console.log("过滤事件,监听过滤行的筛选的改变FilterChangedEvent", event);
      refreshTotal(event.api);

      const activeColumnFilters = event.api.filterManager.activeColumnFilters;

      console.log("activeColumnFilters", activeColumnFilters);

      const resultObj = {
        // 字段列表
        field: {},
        // 等值查询，用于所有字段
        equal: {},
        // 范围查询， 用于时间等
        range: {},
        // 大于字段
        gtField: {},
        // 小于字段
        ltField: {},
      };
      for (let i = 0; i < activeColumnFilters.length; i++) {
        const item = activeColumnFilters[i];
        const { field, headerName } = item.textFilterParams.colDef;
        // 如果列头和字段都存在，排除不是自定义列的情况
        if (field && headerName) {
          const appliedModel = item.appliedModel;
          // 先只考虑文本框
          if (appliedModel.filterType === "text") {
            console.log("appliedModel=====>", appliedModel);

            const isNumReg = /^(\\-|\+)?\d+(\.\d+)?$/;

            const addEqualQueryField = () => {
              const type = item.appliedModel.type;

              // 如果存在操作表示一项输入
              const eCondition1BodyValue =
                item.appliedModel.filter || item.appliedModel.condition1.filter;

              if (eCondition1BodyValue) {
                if (
                  type === "startsWith" &&
                  isNumReg.test(eCondition1BodyValue)
                ) {
                  resultObj["gtField"][field] = eCondition1BodyValue;
                  resultObj["field"][
                    `${headerName}|${field}`
                  ] = `【大于】${eCondition1BodyValue}`;
                } else if (
                  type === "endsWith" &&
                  isNumReg.test(eCondition1BodyValue)
                ) {
                  resultObj["ltField"][field] = eCondition1BodyValue;
                  resultObj["field"][
                    `${headerName}|${field}`
                  ] = `【小于】${eCondition1BodyValue}`;
                } else {
                  resultObj["equal"][field] = eCondition1BodyValue;
                  resultObj["field"][`${headerName}|${field}`] =
                    eCondition1BodyValue;
                }
              }
            };

            // 如果存在操作表示两项输入, 此处为范围
            if (appliedModel.operator) {
              // 满足时间筛选条件
              const { condition1, condition2 } = appliedModel;
              const filter1 = condition1.filter;
              const filter2 = condition2.filter;

              // 第一输入框为开始于， 第二输入框为结束于，并且两者都存在值
              if (
                filter1 &&
                condition1.type === "startsWith" &&
                filter2 &&
                condition2.type === "endsWith"
              ) {
                const dateReg = /[Time|Date]$/g;
                const numReg =
                  /[Fee|money|Money|Price|Pay|Weight|Volume|Num|costShare|Income|Cost|Count|totalIn|realTax]$/g;

                // 区分日期字段
                if (dateReg.test(field)) {
                  const isDateReg =
                    /^[1-9]\d{3}-([0-1][1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) ([0-1][0-9]|2[0-4]):([0-5][0-9]):([0-5][0-9])/;
                  const isDate1 = isDateReg.test(filter1);
                  const isDate2 = isDateReg.test(filter2);

                  if (isDate1 && isDate2) {
                    if (new Date(filter2) > new Date(filter1)) {
                      resultObj["range"][field] = [filter1, filter2];
                      resultObj["field"][`${headerName}|${field}`] = [
                        filter1,
                        filter2,
                      ];
                    } else {
                      addEqualQueryField();
                    }
                  } else {
                    addEqualQueryField();
                  }
                  // 区分数字字段
                } else if (numReg.test(field)) {
                  const isNum1 = isNumReg.test(filter1);
                  const isNum2 = isNumReg.test(filter2);
                  if (isNum1 && isNum2 && Number(filter1) < Number(filter2)) {
                    resultObj["gtField"][field] = filter1;
                    resultObj["ltField"][field] = filter2;
                    resultObj["field"][
                      `${headerName}|${field}`
                    ] = `【大于】${filter1}【小于】${filter2}`;
                  } else {
                    addEqualQueryField();
                  }
                } else {
                  addEqualQueryField();
                }
              } else {
                addEqualQueryField();
              }
            } else {
              // 如果存在操作表示一项输入
              addEqualQueryField();
            }
          }
        }
      }

      console.log("resultObj=====>", resultObj);
      if (this.queryParams) {
        this.queryParams.filterChangedObj = resultObj;
        const filterObj = this.dealFilterFun(resultObj);
        this.queryParams.filterChangedObj.filterObj = filterObj;
      }
      this.$emit("filterChangedObjFun", resultObj);
    }
  },

  // 处理筛选列
  dealFilterFun(obj) {
    const isObjEmpty = (obj) => {
      return obj && typeof obj === "object" && Object.keys(obj).length;
    };

    if (isObjEmpty(obj)) {
      const { equal, gtField, ltField, range } = obj;

      const newObj = {};
      if (isObjEmpty(equal)) {
        Object.assign(newObj, equal);
      }

      if (isObjEmpty(gtField)) {
        const gtStr = Object.entries(gtField)
          .map((ele) => `${ele[0]}:${ele[1]}`)
          .join(",");
        newObj.gtField = gtStr;
      }

      if (isObjEmpty(ltField)) {
        const ltStr = Object.entries(ltField)
          .map((ele) => `${ele[0]}:${ele[1]}`)
          .join(",");
        newObj.ltField = ltStr;
      }

      if (isObjEmpty(range)) {
        const rangeStr = Object.entries(range)
          .map((ele) => `${ele[0]}|${ele[1].join(",")}`)
          .join(";");
        newObj.commonTime = rangeStr;
      }

      return newObj;
    } else {
      return {};
    }
  },

  /**
   * @description: 过滤事件,监听过滤行的筛选的过程中的改变，对应ag-grid-vue标签上的 @filterModified
   * @param {*} event
   * @return {*}
   */
  onFilterModified(event) {
    console.log("onFilterModified", event);
  },

  /**
   * @description: 行数据勾选状态改变事件,监听行数据勾选状态的改变，对应ag-grid-vue标签上的  @selectionChanged
   * @param {*} event
   * @return {*}
   */
  onSelectionChanged(ele) {
    console.log("行数据勾选状态改变事件onSelectionChanged", ele);

    if (this.queryParams) {
      this.onSelectionChangedByPage(ele);
    } else {
      console.log("行数据勾选状态改变事件onSelectionChanged", ele);
      this.$emit("onSelectionChanged", ele);
    }
  },

  // 正整数转换
  integerRounding(num) {
    if (!isNaN(num) && num) {
      const strLen = String(num).length;
      if (strLen > 2) {
        const transitionNum = 10 ** (strLen - 1);
        const val = Math.ceil(num / transitionNum) * transitionNum;
        return val;
      } else {
        return 100;
      }
    } else {
      return 0;
    }
  },

  // 全选超出请求
  onSelectionChangedByPage(ele) {
    const { api: gridApi } = ele;
    const selectedRows = gridApi.getSelectedRows();
    const { total, pageNum, pageSize } = this.queryParams;
    const oldPageSize = pageSize;
    const ajaxData = gridApi.getModel().rootNode.allLeafChildren;
    const selectedRowsLen = selectedRows.length;

    if (
      AG_GRID_IS_SELECTED_All_BY_BACK_END &&
      ajaxData.length === selectedRowsLen &&
      selectedRowsLen >= SELECTD_ALL_THRESHOLD_NUM &&
      selectedRowsLen < total
    ) {
      console.log("全选并且选择条数大于50条且小于后台总数，则请求接口");
      const that = this;
      that.$confirm({
        title: "温馨提示",
        type: "warning",
        content: `全选触发，当前页面勾选【${selectedRowsLen}】条，全选【${total}】条，是否继续？`,
        onOk: function () {
          const resetPageNum = total - pageNum * pageSize;
          if (resetPageNum > 0) {
            that.queryParams.pageNum = 1;
            that.queryParams.pageSize = that.integerRounding(total);
            that.$emit("requestNextPage", 1);
          }
          setTimeout(() => {
            that.queryParams.pageSize = oldPageSize;
          });
        },
      });
    } else {
      console.log(`非全选且原始数据小于等于${ajaxData.length}`);
    }
  },

  /**
   * @description: 导出csv格式的excel文件，【无法实现自定义行导出，可以自定义列】
   * @param { 导出文件名 } fileName
   * @return {*}
   */
  exportCSV(fileName = "导出数据") {
    const exportParams = {
      columnGroups: true,
      fileName: `${fileName}`,
    };
    this.gridApi.exportDataAsCsv(exportParams);
  },

  /**
   * @description: 停止编辑回调stopEditing
   * @param {*} event
   * @return {*}
   */
  stopEditing(event) {
    AgGridUtils.refreshTotalToList(event.api);
    if (this.options.stopEditing) {
      this.options.stopEditing(event);
    }
  },

  // 获取选中的数据,用于多选按钮的事件
  getRows() {
    var selRows = this.gridApi.getSelectedRows();
    if (selRows == null || selRows.length <= 0) {
      this.alert("您未选中任何数据");
      return;
    }
    alert(JSON.stringify(selRows));
  },
  // 删除选中数据,    text ，要删除数据的主键，数据的唯一标识
  delRows(text) {
    // 获取选中的数据
    var selRows = this.gridApi.getSelectedRows();
    if (selRows == null || selRows.length <= 0) {
      this.alert("您未选中任何数据");
      return;
    }
    // 注意调用updateRowData方法并不会更新vue的data
    // this.gridApi.updateRowData({remove: selRows});
    // 正确的删除方法是这样的
    this.rowData = this.rowData.filter((item) => {
      return selRows.filter((m) => m[text] === item[text]).length <= 0;
    });
  },
};

// 分页改变
export function paginationChanged(event) {
  const { api: gridApi } = event;
  const getCurrentGridNode = gridApi.getModel().rowsToDisplay || [];
  const getCurrentGridData =
    getCurrentGridDataAndNumericalOrder(getCurrentGridNode);
  refreshTotalToList(getCurrentGridData, gridApi);
}
