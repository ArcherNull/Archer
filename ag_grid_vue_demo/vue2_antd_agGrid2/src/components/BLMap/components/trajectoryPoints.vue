<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-28 21:38:17
 * @LastEditTime: 2024-06-20 10:30:18
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
  name: 'TrajectoryPoints',
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
          areaInfo: []
        }
      }
    }
  },
  data() {
    return {
      fieldsConfig: {
        name: '轨迹点',
        // 页面中如果有多表，需要字段设置用
        id: 'DKMapTrajectoryPoints',
        style: { height: '350px', width: '100%' },
        database: {
          车牌号: 'vehicleNo',
          定位时间: 'gpsTime',
          '速度(km/h)': 'speed',
          状态: 'status',
          里程: 'odometer',
          位置: 'placeName',
          上报类型: 'sendMsgType',
          经度: 'lon',
          纬度: 'lat'
        },
        specColumns: [
          {
            headerName: '上报类型',
            field: 'sendMsgType',
            valueFormatter: (params) => {
              if (params.node.rowPinned === 'bottom') return
              return '三方接口'
            }
          }
        ]
      }
    }
  },
  watch: {
    wayInfo: function (newVal) {
      if (Array.isArray(newVal.gpsInfo)) {
        this.getList()
      }
    }
  },
  methods: {
    // 请求接口
    getList(params) {
      this.agQueryParams.getDataLoading = false
      this.agTableOptions.rowData = this.wayInfo.gpsInfo
      this.agQueryParams.getDataLoading = false
    }
  }
}
</script>
