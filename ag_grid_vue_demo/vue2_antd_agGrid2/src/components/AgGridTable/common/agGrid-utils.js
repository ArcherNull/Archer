/*
 * @Author: Null
 * @Date: 2022-02-22 16:20:22
 * @Description: ag-grid工具函数
 * 官方文档： https://www.ag-grid.com/javascript-data-grid/
 */
import Vue from "vue";
import store from "@/store/index";
import {
  sumBy,
  isArray,
  isEmpty,
  isObject,
  cloneDeep,
  isString,
  throttle,
} from "lodash";
import { message as Message } from "ant-design-vue";
import { initFieldFun } from "./agGrid-getServerField";
import {
  MAX_SELECTED_ROWS,
  SHOW_FIRST_COLUMN,
  SHOW_CALC_BOTTOM_ROWS,
  GET_HTML_DOM_ID,
  SHOW_ACTION_COLUMN,
} from "./agGrid-config";
import { listSetList, listSetAdd, listSetEdit } from "@/api/index";

// ag-grid渲染之前的处理

/**
 * @description: 统一处理header 列头
 * @param { Object[] } header 统一处理列头，譬如动态设置width , 以及添加hide属性，  格式为 ： [{ field:'field1' , headerName:'字段1' }]
 * @param { Object[] } cellStyleArr 单元格样式或者dom节点 ， 一般用于状态表示 ，
 * 格式为：
 *       [
          {
            headName: '订单状态',
            cellRender: cellRender // 特殊自定义dom字符串
          },
          {
            headName: '是否回单',
            cellRender: params => (Number(params.value) === 0 ? '否' : '是') // 简单的状态判断，将0改为否，将1改为是
          },
          {
            headName: '订单时间',
            filter: 'agDateColumnFilter' // 将时间的filter更改为时间筛选框，跟文本筛选框区分开
          },
          {
            headName: '订单时间',
              colSpan: function (params) {
               const country = params.data.country;
                if (country === 'Russia') {
                   // have all Russia age columns width 2
                   return 2;
                 } else if (country === 'United States') {
                   // have all United States column width 4
                   return 4;
                 } else {
                   // all other rows should be just normal
                   return 1;
                 }
               }
              }
         ],
 *
 * @return {*}
 */
export function batchProcessHeader(header = [], cellStyleArr = []) {
  return header.map((ele) => {
    const { headName } = ele;
    // 动态计算width
    const getStrLen = (str = "") => {
      const len = str.length;
      const pxNum = len * 15 + 90;
      return pxNum;
    };

    let extraAttribute = {};

    cellStyleArr.forEach((el) => {
      if (el.headName === headName) {
        extraAttribute = { ...el };
      }
    });
    return {
      hide: false,
      width: getStrLen(headName),
      // 继承ele设置的其他属性
      ...ele,
      ...extraAttribute,
    };
  });
}

/**  生成完整的，可供ag-grid直接使用的列头数据
 * @description: 列头数据拼装,拼装固定左侧的序列列，右侧的操作列，以及中间插入的列
 * @param { Object[] } headerData 列头数据 , 格式为 ： [{ field:'field1' , headerName:'字段1' ,hide:false }]
 * @param { Object[] } customerColumns 自定义列，不固定在首位两端的组件
 * @param { Object[] } pinnedLeftColumns 固定在左侧的操作列
 * @param { Object[] } pinnedRightColumns 固定在右侧的操作列
 * @param { Object[] } columnsDefaultOptions 列头配置 ， showSerialColumns， true 表示展示序号列  , showOperationColumns , true 表示操作列
 * @return {*}
 */
export function setColumnDefs(
  headerData = [],
  columns = {
    pinnedLeftColumns: [],
    pinnedRightColumns: [],
    customerColumns: [],
  },
  columnsDefaultOptions = {
    showSerialColumns: true,
    showOperationColumns: true,
  }
) {
  // 是否存在固定表格左侧的自定义列
  if (columns.pinnedLeftColumns.length) {
    headerData.unshift(columns.pinnedLeftColumns);
  }

  // 是否展示序列行，默认展示序列行
  if (columnsDefaultOptions.showSerialColumns) {
    // 默认添加序号列
    const serialColumns = {
      headerName: "序号",
      field: "numericalOrder",
      width: 120,
      pinned: "left", // 固定在左侧
      lockPosition: true, // 锁定位置，默认为false,该属性设置为true时，拖拽列无效；如果不设置pinned: 'right', 默认展示在最左方
      checkboxSelection: true, // 设置当前列有可选项
      sortable: false,
      filter: false,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
    };
    headerData.unshift(serialColumns);
  }

  // 在不固定到两端的列，添加自定义组件
  if (columns.customerColumns.length) {
    console.log("自定义添加组件", columns.customerColumns);
    headerData.push(columns.customerColumns);
  }

  if (columns.pinnedRightColumns.length) {
    headerData.push(columns.pinnedRightColumns);
  }

  // 是否添加操作列，默认添加
  if (columnsDefaultOptions.showOperationColumns) {
    // 默认加操作列
    const operationColumns = {
      headerName: "操作",
      field: "agTableOperation",
      pinned: "right", // 固定在左侧
      lockPosition: true,
      sortable: false,
      filter: false,
      width: 200,
    };
    headerData.push(operationColumns);
  }

  return headerData;
}

/**
 * @description: ag-grid渲染完成之后的处理 【原型构造函数的方法】，渲染过后的表格操作
 * @param {*}
 * @return {*}
 */
export class AgGridUtils {
  // 通信组件，用于表格操作列与父组件之间的通信
  static EventBus = new Vue();
  // 事件列表
  static eventNameListObj = {};

  // 用于刷新合计行的定时器
  refreshTotalToListTimer = null;

  // 配置数据
  fieldsConfig = null;

  constructor(api, fieldsConfig) {
    console.log("fieldsConfig=====>", fieldsConfig);
    this.fieldsConfig = cloneDeep(fieldsConfig);
    this.init(api);
  }

  init(api) {
    const that = this;
    console.log("api=====>", api);
    // gridApi 网格api , columnApi 列api
    const { api: gridApi, columnApi } = api;

    if (gridApi && columnApi) {
      /* ************************ 网格API操作 ****************************  */
      // gridApi 网格api
      this.gridApi = gridApi;
      // 获取并返回当前网格内的所有过滤后的数据
      this.getCurrentGridNode = gridApi.getModel().rowsToDisplay || [];
      // 获取并返回当前网格内的所有原始数据
      this.getRootGridData = gridApi.getModel().rootNode.allLeafChildren || [];
      // 获取当前选中行数据
      this.selectedRowData = gridApi.getSelectedRows() || [];
      // 原始行数据最大长度
      this.originRowLength = this.getRootGridData.length;
      // 筛选后原始行数据最大长度
      this.filterRowLength = this.getCurrentGridNode.length;
      // 列头数据
      this.columnDefs = columnApi.columnModel.columnDefs;
      // 列数据最大长度
      this.columnDefsLength = this.columnDefs.length;
      // 获取视图展示的第一行数据下标
      this.displayedFirstRowIndex = gridApi.getFirstDisplayedRow() || 0;
      // 获取视图展示的最后一行数据下标， 如果为-1表示无数据，也就是说小于等于所有原始数据的长度时，可以请求接口
      this.displayedLastRowIndex = gridApi.getLastDisplayedRow() || 0;
      // 表格共设置后台数据量
      this.displayedRowCount = gridApi.getDisplayedRowCount() || 0;

      // 获取并返回当前网格内的所有过滤后的前端视图数据
      this.getCurrentGridData = function () {
        const getCurrentGridNode = this.getCurrentGridNode;
        if (Array.isArray(getCurrentGridNode) && getCurrentGridNode.length) {
          return getCurrentGridNode.map((ele) => ele.data);
        } else {
          return [];
        }
      };

      // 添加序列行
      this.getCurrentGridDataAndNumericalOrder = function () {
        return getCurrentGridDataAndNumericalOrder(this.getCurrentGridNode);
      };

      // 当前网格中的所有后端数据【包含筛选阴残的】
      this.allLeafChildren = function () {
        const getRootGridData = this.getRootGridData;
        if (Array.isArray(getRootGridData) && getRootGridData.length) {
          return getRootGridData.map((ele) => ele.data);
        } else {
          return [];
        }
      };

      /**
       * @description: 检查行数据
       * @param {Object[]} rows 行数据
       * @return {*}
       */
      this.checkRowsType = function (rows) {
        return rows && Array.isArray(rows) && rows.length !== 0;
      };

      /**
       * @description: 选中的行数据
       */
      this.getSelectedRows = throttle(function (noMsg = true) {
        let selectedRowData = [];
        console.log(
          "this.fieldsConfig.isFirstColumnCheckboxSelectio",
          that.fieldsConfig.isFirstColumnCheckboxSelectio
        );
        if (that.fieldsConfig.firstColumnConfig === false) {
          selectedRowData = that.getRootGridData;
        } else {
          selectedRowData = gridApi.getSelectedRows();
        }
        console.log("选中的行数据selectedRowData=====>", selectedRowData);
        const maxSelectedRows = MAX_SELECTED_ROWS;

        if (that.checkRowsType(selectedRowData)) {
          if (selectedRowData.length <= maxSelectedRows) {
            return selectedRowData;
          } else {
            Message.error(
              `选中的行数据不可超过${maxSelectedRows}条,当前${selectedRowData.length}条!`
            );
          }
        } else {
          noMsg && Message.warning(`未选中的行数据！`);
        }
      }, 60);

      /**
       * @description: 删除选中的行数据【当前网格内存在的数据】
       * @param {number} id  要删除数据的主键，数据的唯一标识
       * @return {*}
       */
      this.deleteSelectedRows = function () {
        const selectedRowData = gridApi.getSelectedRows();
        console.log("selectedRowData===========", selectedRowData);
        if (that.checkRowsType(selectedRowData)) {
          // 注意调用updateRowData方法并不会更新vue的data
          this.gridApi.updateRowData({ remove: selectedRowData });
          // 正确的删除方法是这样的
          // return that.allLeafChildren.filter((item) => {
          //   return selectedRowData.filter((m) => m[id] === item[id]).length <= 0
          // })
        } else {
          alert("您未选中任何数据");
          return [];
        }
      };

      /**
       * @description: 手动设置底部行数据方法
       * @param {*} pinnedBottomRowData 置底部行数据
       * @return {*}
       */
      this.setPinnedBottomRowData = function (pinnedBottomRowData) {
        gridApi && gridApi.setPinnedBottomRowData(pinnedBottomRowData);
      };

      /**
       * @description: 手动设置顶部行数据方法
       * @param {*} pinnedTopRowData 置顶部行数据
       * @return {*}
       */
      this.setPinnedTopRowData = function (pinnedTopRowData) {
        gridApi && gridApi.setPinnedBottomRowData(pinnedTopRowData);
      };

      /**
       * @description: 设置默认选中方法
       * @param {*} value
       * @param {*} id
       * @return {*}
       */
      this.getCustomerSelectedRows = function (value, id) {
        gridApi.forEachLeafNode((node) => {
          if (node.data[id] === value) {
            node.setSelected(false);
          }
        });
      };

      /**
       * @description: 列宽度自适应
       * @param {*}
       * @return {*}
       */
      this.sizeColumnsToFit = function () {
        gridApi && gridApi.sizeColumnsToFit();
      };

      // 全选
      this.selectAll = function () {
        gridApi && gridApi.selectAll();
      };

      // 反选
      this.deselectAll = function () {
        gridApi && gridApi.deselectAll();
      };

      // 设置行数据  Object[]
      this.setRowData = function (rowData) {
        gridApi && gridApi.setRowData(rowData);
      };

      /**
       * @description:  跳转到对应的列
       * @param {Number} number 对应的行位置
       * @return {*}
       */
      this.jumpToCol = function (number) {
        const index = Number(number);
        if (!isNaN(index)) {
          const allColumns = columnApi.getAllColumns();
          const column = allColumns[index];
          console.log("allColumns===============", allColumns);

          console.log("column===============", column);
          if (column) {
            gridApi && gridApi.ensureColumnVisible(column);
          }
        } else {
          Message.error(`跳转列数据的索引应为数字`);
        }
      };

      // 跳转到对应的行
      this.jumpToRow = function (number) {
        const index = Number(number);
        if (isNaN(index)) {
          Message.error(`跳转行数据的索引应为数字`);
        } else {
          if (typeof index === "number" && !isNaN(index)) {
            gridApi && gridApi.ensureIndexVisible(index);
          }
        }
      };

      /**
       * @description: 行数据不滚动，紧凑在一起
       */
      this.sizeToFit = function () {
        gridApi && gridApi.sizeColumnsToFit();
      };

      /* ************************ 列api操作 ****************************  */

      /**
       * @description: 移动列，到对应的位置
       * @param {*} fieldsArr  ['field1' , 'field2']
       * @param {*} index 0 表示首位
       * @return {*}
       */
      this.moveColumns = function (fieldsArr, index = 0) {
        columnApi && columnApi.moveColumns(fieldsArr, index);
      };

      /**
       * @description: 列显示或隐藏
       * @param {String} field 隐藏或显示的字段名
       * @param {Boolean} bool false隐藏或true显示
       * @return {*}
       */
      this.setColumnVisible = function (field, bool) {
        columnApi && columnApi.setColumnVisible(field, bool);
      };

      /**
       * @description: 清除所有固定状态
       * @param {*}
       * @return {*}
       */
      this.clearAllColumnsPinned = function () {
        columnApi &&
          columnApi.applyColumnState({ defaultState: { pinned: null } });

        /*
        给特定的行设定状态
        columnApi.applyColumnState({
          state: [
            { colId: 'year', sort: 'asc' },
            { colId: 'country', sort: 'desc' },
          ],
          defaultState: { sort: null },
        });
        */

        /*
        清除排序
        columnApi.applyColumnState({
          defaultState: { sort: null },
        });
        */
      };

      /**
       * @description: 冻结列
       * @param {Object[]} columns [{ colId: 'country', pinned: 'left' }]  , colId 跟field 一致
       * @return {*}
       */
      this.pinnedColumns = function (columns) {
        columnApi &&
          columnApi.applyColumnState({
            state: columns,
            defaultState: { pinned: null },
          });
      };

      /**
       * @description: 将列的行数据省略号的数据显示完整【不会超过列最大的设置宽度】
       * @param {Boolean} skipHeader true 表示列头省略号显示的数据跳过， false表示不跳过
       * @return {*}
       */
      this.autoSizeAll = function (skipHeader) {
        const allColumnIds = [];
        columnApi &&
          columnApi.getAllColumns().forEach((column) => {
            allColumnIds.push(column.getId());
          });
        columnApi && columnApi.autoSizeColumns(allColumnIds, skipHeader);
      };

      /**
       * @description: 单元格刷新，默认强制刷新
       * @param {*} params
       * @return {*}
       */
      this.refreshCells = function (params) {
        const defaultObj = {
          force: true, // 强制刷新
          ...params,
        };
        gridApi && gridApi.refreshCells(defaultObj);
      };

      /**
       * @description: 整行数据更新 -- 应用场景:选中行弹出层，编辑表单
       * @param {*} row
       * @return {*}
       */
      this.updateRowData = function (row) {
        console.log("updateRowData--12313123");
        gridApi && gridApi.updateRowData(row);
      };

      /**
       * @description: 导出 .csv 格式的excel文件
       * 参考属性文档：https://www.ag-grid.com/javascript-data-grid/csv-export/#csvexportparams
       * 导出csv文件，
       * 优点：能够导出视图上的渲染列头，包含设定好的列头
       * 缺点：存在一个问题，就是时间数据容易乱码，未测试其它数据
       *
       * @return {*}
       */
      this.exportDataAsCsv = function (config = "导出数据") {
        console.log("导出所有数据");

        // const defaultConfig = {
        //   columnSeparator: ',', // 列分隔符
        //   allColumns: false, // 如果为true，则所有列都将按照它们在columnDefs中的显示顺序导出。
        //   fileName: 'excel.csv', // 导出 .csv文件的文件名
        //   onlySelected: true, // true表示仅仅导出选中的行数据
        //   onlySelectedAllPages: false, // 导出选中的行数据，并包含其它页的数据
        //   skipPinnedBottom: false, // 跳过固定在底部的数据
        //   skipPinnedTop: false // 跳过固定在顶部的数据
        // }

        // eslint-disable-next-line prefer-const
        let exportParams = {
          columnGroups: true,
          fileName: "excel.csv",
        };
        if (typeof config === "string") {
          exportParams.fileName = `${config}`;
        } else {
          exportParams = Object.assign(exportParams, {
            ...config,
          });
        }

        gridApi && gridApi.exportDataAsCsv(exportParams);
      };

      /**
       * @description: 输出特定的数据为 .csv 格式的excel文件
       * @param {*} rowData
       * @return {*}
       */
      this.getDataAsCsv = function (rowData) {
        gridApi && gridApi.getDataAsCsv(rowData);
      };

      /**
       * @description: 生成数据分隔符
       * @return {*}
       */
      this.dataInputSelector = function (data) {
        switch (data) {
          case "none":
            return;
          case "tab":
            return "\t";
          default:
            return data;
        }
      };

      this.tableDataTotal = function () {};
    } else {
      alert("ag-grid表格工具实例创建失败！");
    }
  }

  /**
   * @description: 计算合计,传入需要计算的数据对象、合计参数，返回一个ag-grid合计需要的参数,只要是数字行自动计算【重要】
   * @param { 网格数据对象 Object[] } list
   * @return {*}
   */
  calculateTotalLine(list) {
    return calculateTotalLine(list);
  }

  /**
   * @description: 刷新合计，可用于每次网格数据发生变动(指定数据) 【重要】
   * @param { 当前表格所加载的数据 } list
   * @param { 生成的gridApi实例，ag-grid-vue标签上的@gridReady="onGridReady"所返回的 } gridApi
   * @return {*}
   */
  refreshTotalToList(list = [], gridApi) {
    return refreshTotalToList(list, gridApi);
  }

  /**
   * @description: 刷新合计，可用于每次网格数据发生变动(数据从网格获取)【重要】
   * @param { 生成的gridApi实例，ag-grid-vue标签上的@gridReady="onGridReady"所返回的 } gridApi
   */
  refreshTotal(gridApi) {
    return new Promise((resolve) => {
      const list = this.getCurrentGridData(gridApi);
      // 判断是不是底部合计行
      if (gridApi.pinnedRowModel.pinnedBottomRows[0]) {
        const totalParams = this.calculateTotalLine(list);
        // 设置底部合计行数据
        gridApi.setPinnedBottomRowData(totalParams);
      }
      // 刷新全部单元格
      gridApi.refreshCells({ force: true });
      // 刷新指定
      // gridApi.refreshCells({columns:['numericalOrder']})
      // gridApi.getColumnDefs();
      resolve(true);
    });
  }

  /**
   * @description: 设置事件监听器
   * @param {*} eventName
   * @param {*} callback
   * @return {*}
   */
  static setEventBusListener(eventName, callback) {
    if (eventName) {
      if (callback && typeof callback === "function") {
        AgGridUtils.removeEventBusListener(eventName);
        const eventFun = (params) => {
          console.log("params======>", params);
          callback(params);
        };
        // 加入事件总线列表
        AgGridUtils.eventNameListObj[eventName] = eventFun;
        AgGridUtils.EventBus.$on(eventName, eventFun);
      } else {
        console.error("事件处理回调函数是必填项");
      }
    }
  }

  /**
   * @description:事件发射器
   * @param {*} eventName
   * @param {*} params
   * @return {*}
   */
  static emitEventBus(eventName, params = {}) {
    if (eventName) {
      AgGridUtils.EventBus.$emit(eventName, params);
    }
  }

  /**
   * @description: 移除事件
   * @param {*} eventName
   * @return {*}
   */
  static removeEventBusListener(eventName) {
    if (eventName) {
      const existEventName = AgGridUtils.eventNameListObj[eventName];
      if (existEventName) {
        delete AgGridUtils.eventNameListObj[eventName];
      }
      AgGridUtils.EventBus.$off(eventName);
    }
  }

  /**
   * @description: 移除所有事件
   * @return {*}
   */
  static removeAllEventBusListener() {
    if (
      isObject(AgGridUtils.eventNameListObj) &&
      !isEmpty(AgGridUtils.eventNameListObj)
    ) {
      Object.keys(AgGridUtils.eventNameListObj).forEach((eventName) => {
        AgGridUtils.removeEventBusListener(eventName);
      });
    }
  }
}

/**
 * @description: 获取当前网格数据，并添加序列列 NumericalOrder
 * @param {*} getCurrentGridNode
 * @return {*}
 */
export function getCurrentGridDataAndNumericalOrder(getCurrentGridNode = []) {
  if (Array.isArray(getCurrentGridNode) && getCurrentGridNode.length) {
    return getCurrentGridNode.map((ele, ind) => {
      ele.data.numericalOrder = ind + 1;
      return ele.data;
    });
  } else {
    return [];
  }
}

/**
 * @description: 刷新合计，可用于每次网格数据发生变动(指定数据) 【重要】
 * @param { 当前表格所加载的数据 } list
 * @param { 生成的gridApi实例，ag-grid-vue标签上的@gridReady="onGridReady"所返回的 } gridApi
 * @return {*}
 */
export function refreshTotalToList(list = [], gridApi) {
  if (isArray(list) && !isEmpty(list)) {
    const setTime = () => {
      if (!AgGridUtils.refreshTotalToListTimer) {
        AgGridUtils.refreshTotalToListTimer = setTimeout(() => {
          AgGridUtils.refreshTotalToListTimer = null;
          console.log("用于刷新合计行的事件=====>实际执行");
          const totalParams = calculateTotalLine(list);
          gridApi.setPinnedBottomRowData(totalParams);
          gridApi.refreshCells({ force: true });
        }, 350);
      } else {
        console.error("刷新合计行正在执行,中断多余执行=====>");
      }
    };
    setTime();
  } else {
    gridApi.setPinnedBottomRowData([]);
    gridApi.refreshCells({ force: true });
  }
}

/**
 * @description: 计算合计,传入需要计算的数据对象、合计参数，返回一个ag-grid合计需要的参数,只要是数字行自动计算【重要】
 * @param { 网格数据对象 Object[] } list
 * @return {*}
 */
export function calculateTotalLine(list) {
  if (isArray(list) && !isEmpty(list)) {
    // 当遇到树型结构的表格数据，此方法不能使用
    // const val = JSON.parse(JSON.stringify(list[0]));
    const val = cloneDeep(list[0])
    const keys = Object.keys(val);

    // 判断特定的金额字段/序列行，才做计算
    const autoCalc = (ele) => {
      if (ele === "numericalOrder") {
        return true;
      } else {
        const regStr = /Fee|money|Price|Pay|Weight|Volume|Num|stock$/gi;
        return regStr.test(ele);
      }
    };

    const formatMathNum = (num) => (!num && isNaN(num) ? 0 : num.toFixed(3));

    /**
     * @description: 计算数组对象中某属性的和
     * @param {*} arr 数组
     */
    const getSum = (arr, keyName) => {
      const sum = sumBy(arr, function (item) {
        return Number(item[keyName]);
      });
      return formatMathNum(sum);
    };

    // 平均值计算字段
    const averageField = ["costRate"];

    /**
     * @description: 计算字段的平均值1
     * @param {*} arr 数组
     * @param {*} keyName 数组元素中对象中的键名
     * @return {*}
     */
    const getAverageNum = (arr, keyName) => {
      const sum = getSum(arr, keyName);
      return sum && formatMathNum((sum * 1000) / (1000 * arr.length));
    };

    for (const ele of keys) {
      if (autoCalc(ele)) {
        if (!isNaN(Number(val[ele]))) {
          // 判断是不是序号行
          if (ele !== "numericalOrder") {
            val[ele] = getSum(list, ele);
          }
        } else {
          val[ele] = "";
        }
      } else if (averageField.includes(ele)) {
        val[ele] = getAverageNum(list, ele);
      } else {
        val[ele] = "";
      }
    }
    val.numericalOrder = `${list.length}条`;
    console.log("[val]=====>", [val]);
    return [val];
  } else {
    return [];
  }
}

// 获取并返回当前网格内的所有过滤后的前端视图数据
export function getCurrentGridData(gridApi) {
  const getCurrentGridNode = gridApi.getModel().rowsToDisplay || [];
  if (Array.isArray(getCurrentGridNode) && getCurrentGridNode.length) {
    return getCurrentGridNode.map((ele) => ele.data);
  } else {
    return [];
  }
}

/**
 * @description: 刷新合计，可用于每次网格数据发生变动(数据从网格获取)【重要】
 * @param { 生成的gridApi实例，ag-grid-vue标签上的@gridReady="onGridReady"所返回的 } gridApi
 */
export function refreshTotal(gridApi) {
  return new Promise((resolve) => {
    const list = getCurrentGridData(gridApi);
    // 判断是不是底部合计行
    if (gridApi.pinnedRowModel.pinnedBottomRows[0]) {
      const totalParams = calculateTotalLine(list);
      // 设置底部合计行数据
      gridApi.setPinnedBottomRowData(totalParams);
    }
    // 刷新全部单元格
    gridApi.refreshCells({ force: true });
    // 刷新指定
    // gridApi.refreshCells({columns:['numericalOrder']})
    // gridApi.getColumnDefs();
    resolve(true);
  });
}

export const fieldsConfig = {
  name: "表名", // 表名,用于导出excel文件的名称
  id: "table", // 表id，表唯一，必传参数

  showFirstColumn: true, // 是否展示序号列
  showActionColumn: true, // 是否展示操作列
  firstColumnConfig: true, // 序列行是否有可选项
  // // 或者 , 头部没有选项，行数据有选项
  // firstColumnConfig: {
  //   checkboxSelection: true,
  //   headerCheckboxSelection: false,
  //   headerCheckboxSelectionFilteredOnly: false
  // },
  isRequestServerFields: true, // 是否请求后台自定义字段
  isDefaultInitAgGridTable: true, // 是否执行默认初始化ag-grid表格，在created中执行
  isDefaultDealQueryParamObj: true, // 是否默认执行ag-grid表格的初始化的搜索组件

  database: {
    姓名: "name",
    性别: "sex",
    年龄: "age",
    年龄1: "age1",
    籍贯: "jg",
    省份: "sf",
    地址: "dz",
    时间: "date",
  },
  // 原生的表格用法，自定义表格columnDefs,优先级大于database与specColumns
  columnDefs: [],
  // 特殊列
  specColumns: [
    {
      headerName: "姓名123",
      field: "name",
      pinned: "left", // 固定在左侧
      headerComponentParams: { menuIcon: "fa-cog" },
      cellRenderer: function (params) {
        const getDom = (color = "#E6A23C") => {
          return (
            `<span style="background-color:${color};display:inline-block;width:5px;height:5px;border-radius:5px;margin-right:5px;margin-bottom:2px"></span>` +
            params.value
          );
        };
        if (params.value === "李四") {
          return getDom("#E6A23C");
        } else if (params.value === "王五") {
          return getDom("#ffffff");
        } else {
          return params.value;
        }
      },
    },
    {
      headerName: "姓名",
      field: "name",
      pinned: "left", // 固定在左侧
      headerComponentParams: { menuIcon: "fa-cog" },
      cellRenderer: function (params) {
        const getDom = (color = "#E6A23C") => {
          return (
            `<span style="background-color:${color};display:inline-block;width:5px;height:5px;border-radius:5px;margin-right:5px;margin-bottom:2px"></span>` +
            params.value
          );
        };
        if (params.value === "李四") {
          return getDom("#E6A23C");
        } else if (params.value === "王五") {
          return getDom("#ffffff");
        } else {
          return params.value;
        }
      },
    },
    {
      headerName: "年龄之和",
      field: "age2",
      afterField: "age", // 改新增的前端字段，放置于那个字段后
      sort: "desc",
      cellRenderer: (params) => {
        return Number(params.data.age) + Number(params.data.age1);
      },
    },
    {
      headerName: "年龄之和2",
      field: "age2",
      afterField: "age", // 改新增的前端字段，放置于那个字段后
      sort: "desc",
      cellRenderer: (params) => {
        return Number(params.data.age) + Number(params.data.age1);
      },
    },
    {
      headerName: "年龄之和123",
      field: "age2",
      afterField: "age", // 改新增的前端字段，放置于那个字段后
      sort: "desc",
      // 单元格是否可渲染
      cellRenderer: (params) => {
        return Number(params.data.age) + Number(params.data.age1);
      },
      // 单元格是否可编辑
      editable: (params) => {
        // 当为底部合计栏是不可编辑
        if (params.node.rowPinned === "bottom") return false;
        return true;
      },
      // 单元格样式
      cellStyle: (params) => {
        if (params.node.rowPinned === "bottom") {
          return {
            backgroundColor: "#fff",
            color: "#333",
          };
        } else {
          return {
            backgroundColor: "#E1FFFF",
            color: "red",
          };
        }
      },
      // 单单只是值获取
      valueGetter: (params) =>
        Number(params.data.age) + Number(params.data.age1),
    },
  ],
  // 操作列
  actionColumns: [
    {
      headerName: "操作",
      field: "agTableAction",
      pinned: "right",
      lockPosition: true,
      sortable: false,
      filter: false,
      width: "100",
      cellRendererFramework: "TableBtn",
      cellRendererParams: { myParam: "My Parameter" }, // 传递参数给 Vue 组件
    },
  ],
};

// 数据拼装要分为三个步骤走：
// 1、拼装基础数据，headerName , field
// 2、拼装用户自定义字段特征，包含 hide , width , filter , sort , 排序， 单元格样式等特征
// 3、插入页面特定设置，包含末尾固定列操作， 列自定义， 前端自定义生成列

// 采用Promise 链式调用的方式，实现有层级先后顺序执行
// 创建类对象，实现多实例调用

/**
 * @description: 生成列头配置项
 * @param { Object } database 前端存储原始的字段对象
 * @param { Array } oldServerFields 存储在服务器中的用户自定义字段
 * @return {*}
 */
export class InitColumnDefs {
  // 显示列头
  SHOW_FIRST_COLUMN = SHOW_FIRST_COLUMN;
  // 显示底部合计行
  SHOW_CALC_BOTTOM_ROW = SHOW_CALC_BOTTOM_ROWS;
  // 是否默认展示操作列
  SHOW_ACTION_COLUMN = SHOW_ACTION_COLUMN;
  // 后台存储的字段数据
  oldServerFields = null;
  // 用于表格展示的字段列表
  currentFields = null;
  // 当前可用于拖拽的字段列表， 不包含序列和操作列
  sortabledFields = null;
  // 后台存储的字段数据的id
  oldServerFieldsId = null;
  // ag-grid表格绑定的id
  agGridTableId = null;
  // 序号列
  FIRST_COLUMN = null;

  // constructor(fieldsConfig) {
  //   this.fieldsConfig = fieldsConfig
  // }

  // 判断是否需要读取后台服务字段
  async judgeReadServerFieldsData(fieldsConfig) {
    this.fieldsConfig = fieldsConfig;

    const agGridId = this.getAgGridTableId(fieldsConfig);

    if (agGridId && fieldsConfig?.isRequestServerFields !== false) {
      const { code, data: result } = await this.getServerFieldsAjax(
        undefined,
        agGridId
      );
      console.log("data=====>", result);
      if (
        code === 200 &&
        !isEmpty(result) &&
        Array.isArray(result) &&
        result.length
      ) {
        const firstRow = result[0];
        const { fieldJson, id } = firstRow;
        this.oldServerFieldsId = id;
        if (fieldJson) {
          const oldServerFields = JSON.parse(fieldJson);
          this.oldServerFields = oldServerFields;
          const currentFields = this.init(fieldsConfig, oldServerFields);
          return currentFields;
        } else {
          return this.init(fieldsConfig);
        }
      } else {
        return this.init(fieldsConfig);
      }
    } else {
      return this.init(fieldsConfig);
    }
  }

  // 初始化函数
  init(fieldsConfig, oldServerFields) {
    const { database, columnDefs, specColumns } = fieldsConfig;

    this.judgeRequiredParams(fieldsConfig);

    // 获取序列行
    this.FIRST_COLUMN = this.getFirstColumn(fieldsConfig);
    // 拼装获取agGridTableId
    this.agGridTableId = this.getAgGridTableId(fieldsConfig);

    // isCustomerColumns 表示是否是自定义列
    const genetateColumns = () => {
      if (isEmpty(columnDefs)) {
        let colDefs = [];
        if (isEmpty(specColumns)) {
          colDefs = this.initColDefs(database);
        } else {
          colDefs = this.dealSpecColumns(database, specColumns);
        }

        return colDefs;
      } else {
        const clonecolumnDefs = cloneDeep(columnDefs);
        const newColumnDefs = this.initOriColumnDefs(clonecolumnDefs);
        return newColumnDefs;
      }
    };

    if (!isEmpty(database)) {
      // 用户自定义
      if (oldServerFields && oldServerFields.length) {
        console.log("oldServerFields", oldServerFields);
        // [注意]:这里是拼装服务器存储的用户自定义字段,但是跟agGrid-getServerField.js方法还是有区别的,是个优化点
        const newColumns = genetateColumns();
        const customerColumns = initFieldFun(newColumns, oldServerFields);
        return this.addSequenceAndActionColumns(customerColumns);
      } else {
        const newColumns = genetateColumns();
        return this.addSequenceAndActionColumns(newColumns);
      }
    } else {
      // console.error('database是必传字段,且不能为空')
      const newColumns = genetateColumns();
      const customerColumns = initFieldFun(newColumns, oldServerFields);
      return this.addSequenceAndActionColumns(customerColumns);
    }
  }

  // 判断必传参数
  judgeRequiredParams(fieldsConfig) {
    const { name, id, columnDefs, database } = fieldsConfig;

    if (!name) {
      console.warning("[name]表名参数，用于导出excel文件名使用");
    }

    if (!id) {
      console.warning(
        "[id]表唯一id，同一界面中不可与其它表id一致，否则中央事件总线会出错"
      );
    }

    if (database && !isObject(database)) {
      console.warning("[database]参数字段设置，需为对象");
    }

    if (columnDefs && !isArray(columnDefs)) {
      console.warning(
        "[columnDefs]原生的表格用法，需为数组对象,优先级大于[database]"
      );
    }

    if (isEmpty(database) && isEmpty(columnDefs)) {
      console.warning("[database][columnDefs]参数二选一必填");
    }
  }

  // 获取基础的列头数据
  initColDefs(database, supplyColumns, insertColumns) {
    console.log("database", database);
    console.log("supplyColumns", supplyColumns);
    if (isObject(database) && !isEmpty(database)) {
      const colDefs = [];
      Object.keys(database).forEach((item) => {
        let findItem = [];
        // 补充列
        if (isArray(supplyColumns) && !isEmpty(supplyColumns)) {
          findItem = supplyColumns.filter((ele) => ele.headerName === item);
        }

        // 动态计算width
        const getStrLen = (str = "") => {
          const len = str.length;
          const pxNum = len * 15 + 80;
          return pxNum;
        };

        const regStr = /date|time|createdAt|updatedAt|id$/gi;
        const regName = /Name|sysOrgCode|orderSn|billCode$/gi

        const obj = {
          hide: false,
          pinned: "none",
          headerName: item,
          field: database[item],
          width: regStr.test(database[item])
            ? 180
            : regName.test(database[item])
            ? 250
            : item.includes('地址')
            ? 400
            : getStrLen(item)
        };
        // console.log('findItem=====>', findItem)
        // 如果存在补充列，那么headerName跟补充列保持一致
        if (!isEmpty(findItem) && isArray(findItem)) {
          if (findItem.length > 1) {
            console.log("findItem", findItem);
            console.error(`字段名称为${item},设置的自定义列重复`);
            findItem.forEach((ele) => {
              colDefs.push({
                ...obj,
                ...ele,
              });
            });
          } else {
            colDefs.push({
              ...obj,
              ...findItem[0],
            });
          }
        } else {
          colDefs.push(obj);
        }
      });

      // 插入列
      if (isArray(insertColumns) && !isEmpty(insertColumns)) {
        insertColumns.forEach((ele) => {
          const idsArr = [];
          const filterItem = colDefs.filter((item, ind) => {
            if (item.field === ele.afterField) {
              idsArr.push(ind);
              return true;
            } else {
              return false;
            }
          });

          if (isArray(filterItem) && !isEmpty(filterItem)) {
            console.log("idsArr", idsArr);
            idsArr.forEach((id) => {
              colDefs.splice(id, 0, ele);
            });
          } else {
            console.error(
              `插入列字段名称为${ele.field},插入原列字段${ele.afterField}后，未成功`
            );
          }
        });
      }
      return colDefs;
    } else {
      console.error("database参数是必传项并且不能为空对象");
    }
  }

  // 初始化原始columnDefs
  initOriColumnDefs(columnDefs) {
    if (Array.isArray(columnDefs) && columnDefs.length) {
      return columnDefs.map((item) => {
        return {
          hide: false,
          pinned: "none",
          ...item,
        };
      });
    } else {
      return [];
    }
  }

  // 处理特殊的自定义列
  dealSpecColumns(database, specColumns) {
    // 特殊列： 1）前端插入列；1.1）同字段，不同表头名插入列
    //  2）自定义列；
    // 区分插入列和补充列
    const insertColumns = [];
    const supplyColumns = [];

    specColumns.forEach((ele) => {
      if (ele.afterField) {
        insertColumns.push(ele);
      } else {
        supplyColumns.push(ele);
      }
    });

    console.log("insertColumns=====>", insertColumns);

    const colDefs = this.initColDefs(database, supplyColumns, insertColumns);

    console.log("colDefs=====>", colDefs);

    return colDefs;
  }

  // 添加序列和操作列
  addSequenceAndActionColumns(colDefs) {
    const { showFirstColumn = true, showActionColumn = true } =
      this.fieldsConfig;
    this.sortabledFields = cloneDeep(colDefs);

    // 拼接序列
    this.SHOW_FIRST_COLUMN &&
      showFirstColumn &&
      colDefs.unshift(this.FIRST_COLUMN);

    // 拼接操作列
    const actionColumns = this.dealActionColumns();

    console.log("actionColumns========>", actionColumns);

    this.SHOW_ACTION_COLUMN &&
      showActionColumn &&
      actionColumns &&
      actionColumns.length &&
      colDefs.push(...actionColumns);

    console.log("colDefs=====>", colDefs);

    this.currentFields = cloneDeep(colDefs);

    return colDefs;
  }

  // 获取序列
  getFirstColumn(fieldsConfig) {
    const { firstColumnConfig = true, getFirstColumn } = fieldsConfig;

    const defaultFirstColumn = {
      headerName: "#",
      field: "numericalOrder",
      width: 80,
      pinned: "left", // 固定在左侧
      lockPosition: true, // 锁定位置，默认为false,该属性设置为true时，拖拽列无效；如果不设置pinned: 'right', 默认展示在最左方
      checkboxSelection: true, // 设置当前列有可选项
      sortable: false,
      filter: false,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
    };

    if (getFirstColumn && typeof getFirstColumn === "function") {
      const customerFirstColumn = getFirstColumn();
      if (isObject(customerFirstColumn) && !isEmpty(customerFirstColumn)) {
        return Object.assign(
          cloneDeep(defaultFirstColumn),
          customerFirstColumn
        );
      } else {
        return defaultFirstColumn;
      }
    } else {
      if (typeof firstColumnConfig === "boolean") {
        const checkboxSelection = firstColumnConfig;
        return Object.assign(cloneDeep(defaultFirstColumn), {
          checkboxSelection, // 设置当前列有可选项
          headerCheckboxSelection: checkboxSelection,
          headerCheckboxSelectionFilteredOnly: checkboxSelection,
        });
      } else if (typeof firstColumnConfig === "object") {
        const {
          checkboxSelection = defaultFirstColumn.checkboxSelection,
          headerCheckboxSelection = defaultFirstColumn.headerCheckboxSelection,
          headerCheckboxSelectionFilteredOnly = defaultFirstColumn.headerCheckboxSelectionFilteredOnly,
          ...resetObj
        } = firstColumnConfig;
        return Object.assign(cloneDeep(defaultFirstColumn), {
          checkboxSelection, // 设置当前列有可选项
          headerCheckboxSelection,
          headerCheckboxSelectionFilteredOnly,
          ...resetObj,
        });
      } else {
        return defaultFirstColumn;
      }
    }
  }

  // 拼装操作列
  dealActionColumns() {
    if (this.SHOW_ACTION_COLUMN) {
      const { actionColumns } = this.fieldsConfig;
      if (actionColumns) {
        const defaultObj = {
          headerName: "操作",
          field: "agTableAction",
          pinned: "right",
          lockPosition: true,
          sortable: false,
          filter: false,
          width: "120",
        };

        const agGridId = this.getAgGridTableId();
        console.log("agGridId=====>", agGridId);

        if (typeof actionColumns === "function") {
          const getActionColumns = actionColumns();
          if (getActionColumns) {
            console.log("getActionColumns=====>", getActionColumns);
            return getActionColumns.map((ele) => {
              return {
                ...defaultObj,
                ...ele,
                colId: agGridId,
              };
            });
          } else {
            return [];
          }
        } else {
          if (isString(actionColumns)) {
            defaultObj.cellRendererFramework = actionColumns;
            return [defaultObj];
          } else {
            const validateFun = (ele) =>
              ele.headerName && (ele.cellRendererFramework || ele.cellRenderer);
            if (!isEmpty(actionColumns)) {
              if (isArray(actionColumns)) {
                const filterArr = actionColumns.filter((ele) => {
                  return validateFun(ele);
                });

                console.log("filterArr=====>", filterArr);

                if (filterArr.length) {
                  return filterArr.map((ele) => {
                    return {
                      ...defaultObj,
                      ...ele,
                      colId: agGridId,
                    };
                  });
                }
              } else if (isObject(actionColumns)) {
                if (validateFun(actionColumns)) {
                  return {
                    ...defaultObj,
                    ...actionColumns,
                    colId: agGridId,
                  };
                }
              }
            }
          }
        }
      }
    }
  }

  // 获取后台接口数据
  getServerFieldsParams(jsonObj, type) {
    const userInfo = store.getters.userInfo;

    console.log("userInfo123123123", userInfo);

    const { pathname } = window.location;
    const data = {
      userId: userInfo?.id || "",
      menuName: pathname,
      type,
    };
    if (isObject(jsonObj) && !isEmpty(jsonObj)) {
      const { fieldJson, configJson } = jsonObj;
      data.fieldJson = fieldJson || "";
      data.configJson = configJson || "";
    } else {
      data.fieldJson = "";
      data.configJson = "";
    }
    return data;
  }

  // 加载后台用户存储的数据字段
  async getServerFieldsAjax(jsonObj, type) {
    const params = this.getServerFieldsParams(jsonObj, type);
    console.log("加载后台用户存储的数据字段", params);
    return listSetList({
      queryParams: {
        userId: params.userId,
        type: params.type,
        menuName: params.menuName,
      },
    });
  }

  // 新增或编辑用户存储字段
  addOrEditServerFieldsAjax(jsonObj, type) {
    console.log("jsonObj=====>", jsonObj);
    // 编辑
    const params = this.getServerFieldsParams(jsonObj, type);

    console.log("params=====>", params);

    if (this.oldServerFieldsId) {
      return listSetEdit({
        id: this.oldServerFieldsId,
        ...params,
      });
    } else {
      return listSetAdd(params);
    }
  }

  // 拼装获取agGridTableId
  getAgGridTableId(fieldsConfig) {
    if (this.agGridTableId) {
      return this.agGridTableId;
    } else {
      const agGridId = GET_HTML_DOM_ID(fieldsConfig);
      this.agGridTableId = agGridId;
      return agGridId;
    }
  }
}
