/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-10 14:07:19
 * @LastEditTime: 2023-08-31 11:32:40
 * @Description: https://www.ag-grid.com/javascript-data-grid/
 */
import { sumBy, isArray, isEmpty, isObject } from 'lodash-es'
import { showMessage, showConfirm } from '@/common/index'
import exportExcelFun from '@/utils/excel/index'

/**
 * @description: ag-grid渲染完成之后的处理 【原型构造函数的方法】，渲染过后的表格操作
 * @param {*}
 * @return {*}
 */
export function AgGridUtils (api) {
  const that = this
  console.log('api=====>', api)

  // gridApi 网格aoi , columnApi 列api
  const { api: gridApi, columnApi, colDef, rowPinned } = api

  if (gridApi && columnApi) {
    /* ************************ 网格API操作 ****************************  */
    this.gridApi = gridApi
    // 获取并返回当前网格内的所有过滤后的数据
    this.getCurrentGridNode = gridApi?.rowModel?.rowsToDisplay || []
    // 获取并返回当前网格内的所有原始数据
    this.getRootGridData = gridApi?.rowModel?.rootNode?.allLeafChildren || []
    // 获取当前选中行数据
    this.selectedRowData = gridApi.getSelectedRows() || []
    // 原始行数据最大长度
    this.originRowLength = this.getRootGridData.length
    // 筛选后原始行数据最大长度
    this.filterRowLength = this.getCurrentGridNode.length
    // 列头数据
    this.columnDefs = columnApi.columnModel.columnDefs
    // 列数据最大长度
    this.columnDefsLength = this.columnDefs.length

    // 行位置
    this.rowPosition = function () {
      const rowIndex = api?.rowIndex
      return rowIndex ? rowIndex + 1 : 0
    }

    // 列位置
    this.colPosition = function () {
      if (colDef) {
        const { field, headerName } = colDef
        if (field && headerName && this.columnDefs?.length) {
          const findIndex = this.columnDefs.findIndex(ele => ele.field === field && ele.headerName === headerName)
          return findIndex ? findIndex + 1 : 0
        } else {
          return 0
        }
      } else {
        return 0
      }
    }

    // 列固定状态，left / right
    this.colPinnedPosition = function () {
      if (colDef) {
        const { pinned } = colDef
        return pinned || ''
      } else {
        return ''
      }
    }

    // 行固定状态， top / bottom
    this.rowPinnedPosition = function () {
      return rowPinned || ''
    }

    // 获取并返回当前网格内的所有过滤后的前端视图数据
    this.getCurrentGridData = function () {
      const getCurrentGridNode = this.getCurrentGridNode
      if (Array.isArray(getCurrentGridNode) && getCurrentGridNode.length) {
        return getCurrentGridNode.map(ele => ele.data)
      } else {
        return []
      }
    }

    // 当前网格中的所有后端数据【包含筛选阴残的】
    this.allLeafChildren = function () {
      const getRootGridData = this.getRootGridData
      if (Array.isArray(getRootGridData) && getRootGridData.length) {
        return getRootGridData.map(ele => ele.data)
      } else {
        return []
      }
    }

    /**
     * @description: 检查行数据
     * @param {Object[]} rows 行数据
     * @return {*}
     */
    this.checkRowsType = function (rows) {
      return rows && Array.isArray(rows) && rows.length !== 0
    }

    /**
     * @description: 选中的行数据
     */
    this.getSelectedRows = function () {
      const selectedRowData = gridApi.getSelectedRows()
      console.log('选中的行数据selectedRowData=====>', selectedRowData)
      // const { maxSelectedRows } =  store.state.agGrid.cellContextMenu
      const maxSelectedRows = 200
      if (that.checkRowsType(selectedRowData)) {
        if (selectedRowData.length <= maxSelectedRows) {
          return selectedRowData
        } else {
          showMessage(`选中的行数据不可超过${maxSelectedRows}条!`)
          return false
        }
      } else {
        showMessage(`未选中的行数据！`)
        return false
      }
    }

    /**
     * @description: 删除选中的行数据【当前网格内存在的数据】
     * @param {number} id  要删除数据的主键，数据的唯一标识
     * @return {*}
     */
    this.deleteSelectedRows = function (id) {
      const selectedRowData = gridApi.getSelectedRows()
      console.log('selectedRowData===========', selectedRowData)
      if (that.checkRowsType(selectedRowData)) {
        this.gridApi.updateRowData({
          remove: selectedRowData
        })
      } else {
        alert('您未选中任何数据')
        return []
      }
    }

    /**
     * @description: 手动设置底部行数据方法
     * @param {*} pinnedBottomRowData 置底部行数据
     * @return {*}
     */
    this.setPinnedBottomRowData = function (pinnedBottomRowData) {
      gridApi.setPinnedBottomRowData(pinnedBottomRowData)
    }

    /**
     * @description: 手动设置顶部行数据方法
     * @param {*} pinnedTopRowData 置顶部行数据
     * @return {*}
     */
    this.setPinnedTopRowData = function (pinnedTopRowData) {
      gridApi.setPinnedBottomRowData(pinnedTopRowData)
    }

    /**
     * @description: 设置默认选中方法
     * @param {*} value
     * @param {*} id
     * @return {*}
     */
    this.getCustomerSelectedRows = function (value, id) {
      gridApi.forEachLeafNode(node => {
        if (node.data[id] === value) {
          node.setSelected(false)
        }
      })
    }

    /**
     * @description: 列宽度自适应
     * @param {*}
     * @return {*}
     */
    this.sizeColumnsToFit = function () {
      gridApi.sizeColumnsToFit()
    }

    // 全选
    this.selectAll = function () {
      gridApi.selectAll()
    }

    // 不选中
    this.deselectAll = function () {
      gridApi.deselectAll()
    }

    // 设置行数据  Object[]
    this.setRowData = function (rowData) {
      gridApi.setRowData(rowData)
    }

    /**
     * @description: 获取所有列数据
     * @return {*}
     */
    this.getAllColumns = function () {
      return columnApi.getAllColumns()
    }

    /**
     * @description:  跳转到对应的列
     * @param {Number} number 对应的行位置
     * @return {*}
     */
    this.jumpToCol = function (number) {
      console.log('跳转到对应的列', index)
      const index = Number(number)
      const allColumns = columnApi.getAllColumns()
      let jumpIndex = 1
      if (isNaN(index)) {
        showMessage('跳转列,接收的参数应为数字')
        jumpIndex = 1
      } else {
        const allColumnsLength = allColumns.length
        if (index > 0) {
          if (index <= allColumnsLength) {
            jumpIndex = index
          } else {
            jumpIndex = allColumnsLength
          }
        } else {
          jumpIndex = 1
          showMessage('跳转列,传递的数字序号应大于0')
        }
      }
      const column = allColumns?.[jumpIndex - 1]
      if (column) {
        gridApi.ensureColumnVisible(column)
      } else {
        showMessage('跳转列,未能够获取到跳转列')
      }
      return jumpIndex
    }

    // 跳转到对应的行
    this.jumpToRow = function (number) {
      const index = Number(number)
      let jumpIndex = 1
      if (isNaN(index)) {
        showMessage('跳转行,接收的参数应为数字')
        jumpIndex = 1
      } else {
        if (index > 0) {
          const tableRowData = gridApi?.rowModel?.rootNode?.allLeafChildren
          const tableRowDataLength = tableRowData.length
          if (index <= tableRowDataLength) {
            jumpIndex = index
          } else {
            jumpIndex = tableRowDataLength
            showMessage(`跳转行，超出最大行数${tableRowDataLength}`)
          }
        } else {
          jumpIndex = 1
          showMessage('跳转行,传递的数字序号应大于0')
        }
      }
      gridApi.ensureIndexVisible(jumpIndex - 1)
      return jumpIndex
    }

    /**
     * @description: 行数据不滚动，紧凑在一起
     */
    this.sizeToFit = function () {
      gridApi.sizeColumnsToFit()
    }

    /* ************************ 列api操作 ****************************  */

    /**
     * @description: 移动列，到对应的位置
     * @param {*} fieldsArr  ['field1' , 'field2']
     * @param {*} index 0 表示首位
     * @return {*}
     */
    this.moveColumns = function (fieldsArr, index = 0) {
      columnApi.moveColumns(fieldsArr, index)
    }

    /**
     * @description: 列显示或隐藏
     * @param {String} field 隐藏或显示的字段名
     * @param {Boolean} bool false隐藏或true显示
     * @return {*}
     */
    this.setColumnVisible = function (field, bool) {
      columnApi.setColumnVisible(field, bool)
    }

    /**
     * @description: 清除所有固定状态
     * @param {*}
     * @return {*}
     */
    this.clearAllColumnsPinned = function () {
      columnApi.applyColumnState({
        defaultState: {
          pinned: null
        }
      })

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
    }

    /**
     * @description: 冻结列
     * @param {Object[]} columns [{ colId: 'country', pinned: 'left' }]  , colId 跟field 一致
     * @return {*}
     */
    this.pinnedColumns = function (columns) {
      columnApi.applyColumnState({
        state: columns,
        defaultState: {
          pinned: null
        }
      })
    }

    /**
     * @description: 将列的行数据省略号的数据显示完整【不会超过列最大的设置宽度】
     * @param {Boolean} skipHeader true 表示列头省略号显示的数据跳过， false表示不跳过
     * @return {*}
     */
    this.autoSizeAll = function (skipHeader) {
      const allColumnIds = []
      columnApi.getAllColumns().forEach(column => {
        allColumnIds.push(column.getId())
      })
      columnApi.autoSizeColumns(allColumnIds, skipHeader)
    }

    /**
     * @description: 单元格刷新，默认强制刷新
     * @param {*} params
     * @return {*}
     */
    this.refreshCells = function (params) {
      const defaultObj = {
        force: true, // 强制刷新
        ...params
      }
      gridApi.refreshCells(defaultObj)
    }

    /**
     * @description: 整行数据更新 -- 应用场景:选中行弹出层，编辑表单
     * @param {*} row
     * @return {*}
     */
    this.updateRowData = function (row) {
      gridApi.updateRowData(row)
    }

    /**
     * @description: 导出 .csv 格式的excel文件
     * 参考属性文档：https://www.ag-grid.com/javascript-data-grid/csv-export/#csvexportparams
     * 导出csv文件，
     * 优点：能够导出视图上的渲染列头，包含设定好的列头
     * 缺点：存在一个问题，就是时间数据容易乱码【需要用户手动调整】，未测试其它数据
     *
     * @return {*}
     */
    this.exportDataAsCsv = function (config = '导出数据') {
      console.log('导出所有数据')

      const defaultConfig = {
        columnSeparator: ',', // 列分隔符
        allColumns: true, // 如果为true，则所有列都将按照它们在columnDefs中的显示顺序导出。
        fileName: 'excel.csv', // 导出 .csv文件的文件名
        onlySelected: false, // true表示仅仅导出选中的行数据
        onlySelectedAllPages: false, // 导出选中的行数据，并包含其它页的数据
        skipPinnedBottom: false, // 跳过固定在底部的数据
        skipPinnedTop: false // 跳过固定在顶部的数据
      }

      // eslint-disable-next-line prefer-const
      let exportParams = {
        columnGroups: true,
        fileName: 'excel.csv',
        ...defaultConfig
      }
      if (typeof config === 'string') {
        exportParams.fileName = `${config}`
      } else {
        exportParams = Object.assign(exportParams, {
          ...config
        })
      }

      gridApi.exportDataAsCsv(exportParams)
    }

    /**
     * @description: 导出excel , xlsx文件
     * @return {*}
     */
    this.exportExcelFun = function () {
      const selectedRowData = gridApi.getSelectedRows() || []
      const columnDefs = columnApi.columnModel.columnDefs
      if (!selectedRowData?.length) {
        showConfirm(
          {
            title: '温馨提示',
            description: '当前不存在被选项数据，是否确认导出？'
          },
          res => {
            console.log('接下来的操作', res)
            exportExcelFile([], columnDefs)
          }
        )
      } else {
        exportExcelFile(selectedRowData, columnDefs)
      }
    }

    // 导出excel文件
    this.exportExcelFile = exportExcelFile

    /**
     * @description: 【企业版的才可使用】，当前免费版的不行
     * @return {*}
     */
    this.exportDataAsExcel = function () {
      console.log('导出excel')
      gridApi.exportDataAsExcel(null)
    }

    /**
     * @description: 输出特定的数据为 .csv 格式的excel文件
     * @param {*} rowData
     * @return {*}
     */
    this.getDataAsCsv = function (rowData) {
      gridApi.getDataAsCsv(rowData)
    }

    /**
     * @description: 生成数据分隔符
     * @return {*}
     */
    this.dataInputSelector = function (data) {
      switch (data) {
        case 'none':
          return
        case 'tab':
          return '\t'
        default:
          return data
      }
    }

    /**
     * @description: 设置过滤,当设置为null时，清空所有过滤条件
     * @param {*} model
     * @return {*}
     */
    this.setFilterModel = function (model = null) {
      gridApi.setFilterModel(model)
    }

    /**
     * @description: 重置过滤【未生效】
     * @return {*}
     */
    this.resetFilters = function () {
      gridApi.resetFilters()
    }

    /**
     * @description: 清除过滤【未生效】
     * @return {*}
     */
    this.destroyFilter = function () {
      gridApi.destroyFilter()
    }

    /**
     * @description: 全局的数据过滤
     * @param {*} value
     * @return {*}
     */
    this.setQuickFilter = function (value) {
      gridApi.setQuickFilter(value)
    }

    /**
     * @description: 设置高度自适应，数据有多少，高度就有多高
     * @param {*} layout
     * @return {*}
     */
    this.setDomLayout = function (layout = 'autoHeight') {
      gridApi.setDomLayout(layout)
    }

    /* ************************ 底部合计行 ****************************  */
    /**
     * @description: 刷新合计，可用于每次网格数据发生变动(数据从网格获取)【重要】
     * @param { 生成的gridApi实例，ag-grid-vue标签上的@gridReady="onGridReady"所返回的 } gridApi
     */
    this.refreshTotal = gridApi => {
      return new Promise(resolve => {
        const list = this.getCurrentGridData(gridApi)

        // 判断是不是底部合计行

        const totalParams = this.calculateTotalLine(list)
        // 设置底部合计行数据
        gridApi.setPinnedBottomRowData(totalParams)

        resolve(true)
      })
    }

    /**
     * @description: 计算合计,传入需要计算的数据对象、合计参数，返回一个ag-grid合计需要的参数,只要是数字行自动计算【重要】
     * @param { 网格数据对象 Object[] } list
     * @return {*}
     */
    this.calculateTotalLine = list => {
      if (isArray(list) && !isEmpty(list)) {
        const val = JSON.parse(JSON.stringify(list[0]))
        const keys = Object.keys(val)

        // 判断特定的金额字段/序列行，才做计算
        const autoCalc = ele => ele === 'numericalOrder' || /Fee|money|Money|Price|Pay|Weight|Volume|Num|costShare|age$/g.test(ele)
        // 数字转换
        const convertNumber = num => {
          const val = Number(num)
          return isNaN(val) ? 0 : val
        }
        // 格式化数字
        const formatMathNum = num => (!num && convertNumber(num) ? 0 : num.toFixed(3))

        /**
         * @description: 计算数组对象中某属性的和
         * @param {*} arr 数组
         */
        const getSum = (arr, keyName) => {
          const sum = sumBy(arr, function (item) {
            return convertNumber(item[keyName])
          })
          return formatMathNum(sum)
        }

        // 平均值计算字段
        const averageField = ['costRate']

        /**
         * @description: 计算字段的平均值1
         * @param {*} arr 数组
         * @param {*} keyName 数组元素中对象中的键名
         * @return {*}
         */
        const getAverageNum = (arr, keyName) => {
          const sum = getSum(arr, keyName)
          return sum && formatMathNum((convertNumber(sum) * 1000) / (1000 * arr.length))
        }

        for (const ele of keys) {
          if (autoCalc(ele)) {
            if (!isNaN(Number(val[ele]))) {
              // 判断是不是序号行
              if (ele !== 'numericalOrder') {
                val[ele] = getSum(list, ele)
              }
            } else {
              val[ele] = ''
            }
          } else if (averageField.includes(ele)) {
            val[ele] = getAverageNum(list, ele)
          } else {
            val[ele] = ''
          }
        }
        val.numericalOrder = `${list.length}条`
        console.log('[val]=====>', [val])
        return [val]
      } else {
        return []
      }
    }

    /**
     * @description: 刷新合计，可用于每次网格数据发生变动(指定数据) 【重要】
     * @param { 当前表格所加载的数据 } list
     * @param { 生成的gridApi实例，ag-grid-vue标签上的@gridReady="onGridReady"所返回的 } gridApi
     * @return {*}
     */

    this.refreshTotalToList = (list = [], gridApi) => {
      const showFirstColumn = true
      const showCalcBottomRow = true

      if (showFirstColumn) {
        if (isArray(list) && !isEmpty(list)) {
          if (showCalcBottomRow) {
            console.log('用于刷新合计行的事件=====>实际执行')
            const totalParams = this.calculateTotalLine(list)
            gridApi.setPinnedBottomRowData(totalParams)
          } else {
            console.error('底部[合计行]展示已关闭')
          }
        }
      } else {
        console.error('首列[序号列]展示已关闭，并且底部合计行也不展示')
      }
    }

    /**
     * @description: 添加底部合计行
     * @param {*} gridApi
     * @return {*}
     */
    this.addBottomCalcRow = gridApi => {
      console.log('1、agGrid实例创建完成之后执行=====>添加后台数据合计行')
      const getCurrentGridData = this.getCurrentGridDataAndNumericalOrder(this.getCurrentGridNode)
      this.refreshTotalToList(getCurrentGridData, gridApi)
    }

    /**
     * @description: 获取当前网格数据，并添加序列列 NumericalOrder
     * @param {*} getCurrentGridNode
     * @return {*}
     */
    this.getCurrentGridDataAndNumericalOrder = (getCurrentGridNode = []) => {
      if (Array.isArray(getCurrentGridNode) && getCurrentGridNode.length) {
        return getCurrentGridNode.map((ele, ind) => {
          ele.data.numericalOrder = ind + 1
          return ele.data
        })
      } else {
        return []
      }
    }

    /* ************************ 底部合计行 ****************************  */
  } else {
    alert('ag-grid表格工具实例创建失败！')
  }

  setTimeout(() => {
    console.group('agGrid实例创建完成之后执行')
    this.addBottomCalcRow(gridApi)
    console.groupEnd()
  }, 500)
}

/**
 * @description: 导出excel格式为xlsx文件
 * @param {*} selectedRowData 所选数据
 * @param {*} columnDefs 列头
 * @return {*}
 */
function exportExcelFile (selectedRowData, columnDefs) {
  if (isArray(columnDefs) && !isEmpty(columnDefs)) {
    const tHeader = []
    const filterVal = []

    for (const item of columnDefs) {
      if (!item.hide) {
        tHeader.push(item.headerName)
        filterVal.push(item.field)
      }
    }
    const exportData = {
      title: '数据',
      tHeader,
      filterVal,
      tableData: selectedRowData || []
    }
    exportExcelFun(exportData)
  } else {
    showMessage('列头数据columnDefs不能为空数组')
  }
}

// 数据拼装要分为三个步骤走：
// 1、拼装基础数据，headerName , field
// 2、拼装用户自定义字段特征，包含 hide , width , filter , sort , 排序， 单元格样式等特征
// 3、插入页面特定设置，包含末尾固定列操作， 列自定义， 前端自定义生成列

// 采用Promise 链式调用的方式，实现有层级先后顺序执行
// 创建类对象，实现多实例调用

/**
 * @description: 生成列头配置项
 * @param { Object } database 前端存储原始的字段对象
 * @param { Array } oldServerData 存储在服务器中的用户自定义字段
 * @return {*}
 */
export class InitColumnDefs {
  // 是否展示序号列
  static SHOW_FIRST_COLUMN = true
  // 是否展示底部计算行
  static SHOW_CALC_BOTTOM_ROW = true

  // 序号列
  static FIRST_COLUMN = {
    headerName: '#',
    field: 'numericalOrder',
    width: 100,
    // state: true,
    pinned: 'left', // 固定在左侧
    lockPosition: true, // 锁定位置，默认为false,该属性设置为true时，拖拽列无效；如果不设置pinned: 'right', 默认展示在最左方
    checkboxSelection: true, // 设置当前列有可选项
    sortable: false,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,

    filter: false,
    // filter: CustomerFilter,
    floatingFilter: false
  }

  constructor (fieldsConfig, oldServerData) {
    this.fieldsConfig = fieldsConfig
    this.oldServerData = oldServerData

    // 初始化
    return this.init(fieldsConfig, oldServerData)
  }

  static init (fieldsConfig, oldServerData) {
    const { database, columnDefs, showFirstColumn, specColumns } = fieldsConfig

    console.log('this.FIRST_COLUMN=====>', this.FIRST_COLUMN)

    if (!isEmpty(database)) {
      // 用户自定义
      if (oldServerData?.length) {
        console.log('oldServerData', oldServerData)
        // [注意]:这里是拼装服务器存储的用户自定义字段,但是跟agGrid-getServerField.js方法还是有区别的,是个优化点
      } else {
        console.log('this.SHOW_FIRST_COLUMN', this.SHOW_FIRST_COLUMN)

        if (isEmpty(columnDefs)) {
          let colDefs = []
          if (isEmpty(specColumns)) {
            colDefs = this.initColDefs(database)
          } else {
            colDefs = this.dealSpecColumns(database, specColumns)
          }

          console.log('this.FIRST_COLUMN', this.FIRST_COLUMN)
          this.SHOW_FIRST_COLUMN && showFirstColumn && colDefs.unshift(this.FIRST_COLUMN)

          console.log('colDefs=====>', colDefs)
          return colDefs
        } else {
          this.SHOW_FIRST_COLUMN && showFirstColumn && columnDefs.unshift(this.FIRST_COLUMN)
          return columnDefs
        }
      }
    } else {
      console.error('database是必传字段,且不能为空')
      return []
    }
  }
  // 获取基础的列头数据
  static initColDefs (database, supplyColumns, insertColumns) {
    console.log('database', database)
    console.log('supplyColumns', supplyColumns)
    if (isObject(database) && !isEmpty(database)) {
      const colDefs = []
      Object.keys(database).forEach(item => {
        let findItem = []
        // 补充列
        if (isArray(supplyColumns) && !isEmpty(supplyColumns)) {
          findItem = supplyColumns?.filter(ele => ele.field === item)
        }
        const obj = {
          headerName: database[item],
          field: item
        }
        console.log('findItem=====>', findItem)
        // 如果存在补充列，那么headerName跟补充列保持一致
        if (!isEmpty(findItem) && isArray(findItem)) {
          if (findItem.length > 1) {
            console.log('findItem', findItem)
            console.error(`字段名称为${item},设置的自定义列重复`)
            findItem.forEach(ele => {
              colDefs.push({
                ...obj,
                ...ele
              })
            })
          } else {
            colDefs.push({
              ...obj,
              ...findItem[0]
            })
          }
        } else {
          colDefs.push(obj)
        }
      })

      // 插入列
      if (isArray(insertColumns) && !isEmpty(insertColumns)) {
        insertColumns.forEach(ele => {
          const { afterField, ...restEleObj } = ele
          const idsArr = []
          const filterItem = colDefs.filter((item, ind) => {
            if (`${item.headerName}-${item.field}` === afterField) {
              idsArr.push(ind)
              return true
            } else {
              return false
            }
          })

          if (isArray(filterItem) && !isEmpty(filterItem)) {
            idsArr.forEach(id => {
              colDefs.splice(id, 0, restEleObj)
            })
          } else {
            console.error(`插入列字段名称为【${ele.headerName}-${ele.field}】,插入原列字段【${ele.afterField}】后，未成功`)
            idsArr.push(ele)
          }
        })
      }
      return colDefs
    } else {
      console.error('database参数是必传项并且不能为空对象')
    }
  }
  // 处理特殊的自定义列
  static dealSpecColumns (database, specColumns) {
    // 特殊列： 1）前端插入列；1.1）同字段，不同表头名插入列
    //  2）自定义列；
    // 区分插入列和补充列
    const insertColumns = []
    const supplyColumns = []

    specColumns.forEach((ele, ind) => {
      if (ele.afterField) {
        insertColumns.push(ele)
      } else {
        supplyColumns.push(ele)
      }
    })

    console.log('insertColumns=====>', insertColumns)

    const colDefs = this.initColDefs(database, supplyColumns, insertColumns)

    console.log('colDefs=====>', colDefs)

    return colDefs
  }

  // 清空过滤
  /*
  gridOptions.api.setFilterModel(null);
  $scope.gridOptions.api.resetFilters();
  $scope.gridOptions.api.destroyFilter();
  */
}
