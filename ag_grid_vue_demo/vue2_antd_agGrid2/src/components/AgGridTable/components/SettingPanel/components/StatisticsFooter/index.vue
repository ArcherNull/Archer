<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-03 09:36:04
 * @LastEditTime: 2024-09-04 11:00:15
 * @Description:
-->
<template>
  <div class="StatisticsFooter">
    <div class="StatisticsFooter-num">
      <div v-for="(item, index) in tableTotalLeftList" class="StatisticsFooter-num-item" :key="index">
        <FooterItem :labelItem="item" @clickFun="totalClick(item)"></FooterItem>
        <span v-if="index !== tableTotalLeftList.length - 1">/</span>
      </div>
    </div>

    <div class="StatisticsFooter-operation">
      <span v-for="(item, index) in operationList" :title="item.title" :key="index" @click="operationFun(item)">
        <a-icon :type="item.icon" />
      </span>
    </div>
  </div>
</template>

<script>
import { cloneDeep, isArray, isEmpty } from 'lodash'
export default {
  name: 'StatisticsFooter',
  components: {
    FooterItem: () => import('./components/FooterItem.vue')
  },
  props: {
    agTableOptions: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tableTotalLeftList: [],
      tableTotalRightList: [],
      jumpSelectedRows: [], // 用于跳转行数据位置
      jumpToColumnsArr: [], // 用于跳转列数据位置
      jumpColIntervalPo: -1, // 记录已经跳转的位置

      operationList: [
        {
          code: 'exportExcel',
          icon: 'cloud-download',
          title: '快捷导出选中数据和字段的excel'
        },
        {
          code: 'selectedFilterAll',
          icon: 'check-circle',
          title: '全选网格中所有筛选过后的数据'
        },
        {
          code: 'desSelectedFilterAll',
          icon: 'close-circle',
          title: '反选网格中所有所有筛选过后数据'
        },
        {
          code: 'selectedAll',
          icon: 'check-square',
          title: '全选网格中所有数据'
        },
        {
          code: 'desSelectedAll',
          icon: 'close-square',
          title: '反选网格中所有数据'
        },
        {
          code: 'columnAutoSize',
          icon: 'column-width',
          title: '自适应当前视图中的列宽'
        }
      ]
    }
  },
  methods: {
    // 获取统计信息
    getStatisticsInfo() {
      console.log('this.agTableOptions', this.agTableOptions)
      const { agTableApi } = this.agTableOptions
      if (agTableApi) {
        const obj = {
          tableRowDataLength: agTableApi.getRootGridData.length,
          filterRowDataLength: agTableApi.getCurrentGridNode.length,
          selectedRowDataLength: agTableApi.selectedRowData.length,
          columnDefsLength: agTableApi.columnDefsLength,
          colPosition: agTableApi.colPosition(),
          rowPosition: agTableApi.rowPosition(),
          colPinnedPosition: agTableApi.colPinnedPosition(),
          rowPinnedPosition: agTableApi.rowPinnedPosition()
        }
        this.tableTotalLeftList = this.dealTableTotalLeftList(obj)

        console.log('this.tableTotalLeftList', this.tableTotalLeftList)
      }

      this.jumpSelectedRows = []
      this.jumpToColumnsArr = []
      this.jumpColIntervalPo = -1
    },

    // 左侧
    dealTableTotalLeftList(val) {
      const keys = Object.keys(val)
      if (keys.length) {
        const LeftNumArr = this.dealTableTotalLeftNum(val)
        const LeftPinnedArr = this.dealTableTotalLeftPinned(val)
        return [...LeftNumArr, ...LeftPinnedArr]
      } else {
        return []
      }
    },

    // 数字定位数据
    dealTableTotalLeftNum(val) {
      const titleObj = {
        tableRowDataLength: {
          title: '表格中数据库返回的数据',
          color: '#FF8F8F'
        },
        filterRowDataLength: {
          title: '表格中筛选过后的数据',
          color: '#E6A23C'
        },
        selectedRowDataLength: {
          title: '表格中选中后的数据',
          color: '#3898FF'
        },
        columnDefsLength: {
          title: '列数据最大长度,含合成列',
          color: '#7CCDF0'
        },
        rowPosition: {
          title: '当前单元格所处行位置',
          color: '#DA91F4'
        },
        colPosition: {
          title: '当前单元格所处列位置',
          color: '#78E6D8'
        }
      }
      const displayKeys = Object.keys(titleObj)
      const arr = displayKeys.map((ele) => {
        const itemObj = titleObj[ele]
        return {
          title: itemObj.title || 'X',
          color: itemObj.color || '#333',
          field: ele,
          content: val[ele]
        }
      })
      return arr
    },

    dealTableTotalLeftPinned(val) {
      const titleObj = {
        colPinnedPosition: {
          title: '列固定位置,L【left】:固定于左侧; R【right】:固定于右侧; N【normal】:表示正常',
          color: '#FF8F8F'
        },
        rowPinnedPosition: {
          title: '行固定位置,T【top】:固定于顶部; B【bottom】:固定于底部; N【normal】:表示正常',
          color: '#E6A23C'
        }
      }
      const displayKeys = Object.keys(titleObj)
      const arr = displayKeys.map((ele) => {
        const itemObj = titleObj[ele]
        const getContent = (val) => {
          if (val) {
            return val.slice(0, 1).toUpperCase()
          } else {
            return 'N'
          }
        }

        console.log('val[ele]', val[ele])
        return {
          title: itemObj.title || 'X',
          color: itemObj.color || '#333',
          field: ele,
          content: getContent(val[ele])
        }
      })
      return arr
    },
    // 右侧
    dealTableTotalRightList(val) {
      const keys = Object.keys(val)
      if (keys.length) {
        const titleObj = {
          rowPosition: {
            title: '行',
            color: '#FF8F8F'
          },
          colPosition: {
            title: '列',
            color: '#E6A23C'
          }
        }
        const displayKeys = Object.keys(titleObj)
        const arr = displayKeys.map((ele) => {
          const itemObj = titleObj[ele]
          return {
            title: itemObj.title || 'X',
            color: itemObj.color || '#333',
            content: val[ele]
          }
        })
        return arr
      } else {
        return []
      }
    },
    totalClick(item) {
      console.log('操作', item)
      const { field } = item
      switch (field) {
        case 'filterRowDataLength':
          this.setFilterRowData()
          break
        case 'selectedRowDataLength':
          this.jumpSelectedRowData()
          break
        case 'columnDefsLength':
          this.jumpToColumns()
          break
      }
    },
    // 重置筛选
    setFilterRowData() {
      console.log('重置筛选')
      const { agTableApi } = this.agTableOptions
      if (agTableApi && agTableApi.setFilterModel) {
        this.agTableOptions.agTableApi.setFilterModel(null)
      }
    },
    // 选中行跳转
    jumpSelectedRowData() {
      console.log('选中行跳转')
      const { agTableApi } = this.agTableOptions
      if (agTableApi) {
        const { selectedRowData, selectedRowDataLength, jumpToRow } = agTableApi
        if (this.jumpSelectedRows.length) {
          const shiftData = this.jumpSelectedRows.shift()

          console.log('this.jumpSelectedRows', this.jumpSelectedRows)
          console.log('选中行跳转位置=====>', shiftData.numericalOrder)
          this.$message.info(`选中行跳转表新的行位置【${shiftData.numericalOrder}】`)
          jumpToRow(shiftData.numericalOrder - 1)
        } else {
          if (selectedRowDataLength !== 0 && isArray(selectedRowData) && !isEmpty(selectedRowData)) {
            console.log('selectedRowData=====>', selectedRowData)
            this.jumpSelectedRows = cloneDeep(selectedRowData)
            this.jumpSelectedRowData()
          } else {
            this.$message.warning(`未选中行数据`)
          }
        }
      }
    },
    // 选中列跳转 ，跟据当前单元格列向后为间隔4的跳转,也就是以4为等分划分
    jumpToColumns() {
      console.log('选中列跳转')
      const { agTableApi } = this.agTableOptions
      if (agTableApi) {
        const { columnDefsLength, jumpToCol } = agTableApi
        const jumpFun = (num) => {
          const findIndex = this.jumpToColumnsArr.findIndex((item) => item > num)
          const jumpNum = this.jumpToColumnsArr[findIndex]
          this.$message.info(`选中列跳转表新的列位置【${jumpNum}】`)
          if (findIndex === this.jumpToColumnsArr.length - 1) {
            this.jumpColIntervalPo = -1
          } else {
            this.jumpColIntervalPo = findIndex
          }
          jumpToCol(jumpNum)
        }
        if (this.jumpToColumnsArr.length) {
          const ind = this.jumpColIntervalPo === -1 ? 0 : this.jumpColIntervalPo
          jumpFun(this.jumpToColumnsArr[ind] + 1)
        } else {
          const interval = 4
          // 列长度要比间隔大
          if (columnDefsLength > interval) {
            const intervalLev = Math.floor(columnDefsLength / interval)

            // 加上头部0， 尾部columnDefsLength
            const jumpToColumnsArr = []
            for (let i = 0; i <= intervalLev; i++) {
              jumpToColumnsArr.push(interval * i)
            }
            this.jumpToColumnsArr = jumpToColumnsArr
            jumpToColumnsArr.length && jumpFun(jumpToColumnsArr[0])
          }
        }
      }
    },
    // 操作
    operationFun(item) {
      console.log('操作', item)
      const { code } = item
      switch (code) {
        case 'selectedFilterAll':
          this.selectedFilterAll(true)
          break
        case 'desSelectedFilterAll':
          this.selectedFilterAll(false)
          break
        case 'selectedAll':
          this.selectedAll()
          break
        case 'desSelectedAll':
          this.desSelectedAll()
          break
        case 'columnAutoSize':
          this.columnAutoSize()
          break
      }
    },
    selectedFilterAll(bool) {
      console.log('全选或反选')
      const { agTableApi } = this.agTableOptions
      if (agTableApi && agTableApi.getCurrentGridNode && agTableApi.getCurrentGridNode.length) {
        agTableApi.getCurrentGridNode.forEach((node) => {
          node.setSelected(bool)
        })
      }
    },
    // 全选
    selectedAll() {
      console.log('全选或反选')
      const { agTableApi } = this.agTableOptions
      if (agTableApi && agTableApi.selectAll) {
        this.agTableOptions.agTableApi.selectAll()
      }
    },

    // 反选
    desSelectedAll() {
      console.log('全选或反选')
      const { agTableApi } = this.agTableOptions
      if (agTableApi && agTableApi.deselectAll) {
        this.agTableOptions.agTableApi.deselectAll()
      }
    },

    // 列宽自适应
    columnAutoSize() {
      console.log('列宽自适应')
      const { agTableApi } = this.agTableOptions
      if (agTableApi && agTableApi.autoSizeAll) {
        this.agTableOptions.agTableApi.autoSizeAll()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.StatisticsFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  &-num {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    &-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }
  &-operation {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }
}
</style>
