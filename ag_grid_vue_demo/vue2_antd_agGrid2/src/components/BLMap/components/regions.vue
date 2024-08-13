<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-28 21:38:17
 * @LastEditTime: 2024-06-15 17:29:28
 * @Description:
-->
<template>
  <div>
    <AgGridTable
      :agTableOptions="agTableOptions"
      :agTableSwitch="{
        isShowPagination: false,
        isFilterChangedRequest: false,
        isScrollEndRequest: true,
        isShowExcelDownload: true,
        drawerDoubleShow: true,
      }"
      :query-params="agQueryParams"
      @getRowData="getRowData"
      @getGridApi="getGridApi"
      @rowSelected="rowSelected"
      @requestNextPage="requestNextPage"
    />
  </div>
</template>
<script>
import AgGridTableMixins from '@/components/AgGridTable/agTableMixins/index'

export default {
  name: 'Regions',
  mixins: [AgGridTableMixins],
  props: {
    wayInfo: {
      type: Object,
      default() {
        return {
          // 轨迹点
          gpsInfo: [],
          // 停留点
          stopInfo: [],
          // 区域
          areaInfo: [],
        }
      },
    },
  },
  data() {
    return {
      fieldsConfig: {
        name: '区域',
        // 页面中如果有多表，需要字段设置用
        id: 'DKMapRegions',
        style: { height: '350px', width: '100%' },
        database: {
          围栏名称: 'areaName',
          驶入时间: 'beginTime',
          驶出时间: 'endTime',
          停留时长: 'duration',
          里程: 'odometer',
          行驶里程: 'odometer',
        },
        specColumns: [
          {
            headerName: '上报类型',
            field: 'sendMsgType',
            afterField: 'placeName',
            cellRenderer: (params) => {
              if (params.node.rowPinned === 'bottom') return
              return '三方接口'
            },
          },
        ],
      },
    }
  },
  watch: {
    wayInfo: function (newVal) {
      if (Array.isArray(newVal.areaInfo)) {
        this.getList()
      }
    },
  },
  methods: {
    // 请求接口
    getList() {
      console.log('123123123123123请求接口', this.wayInfo)
      this.agQueryParams.getDataLoading = false
      this.agTableOptions.rowData = this.wayInfo.areaInfo
      this.agQueryParams.getDataLoading = false
    },
  },
}
</script>

