<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-28 21:38:17
 * @LastEditTime: 2024-06-20 10:28:03
 * @Description:
-->
<template>
  <div>
    <AgGridTable
      :agTableOptions="agTableOptions"
      :agTableSwitch="{
        isShowPagination:false,
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
  name: 'HoldPoint',
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
        id: 'DKMapHoldPoint',
        style: { height: '350px', width: '100%' },
        database: {
          车牌号: 'vehicleNo',
          开始时间: 'beginTime',
          结束时间: 'endTime',
          停车时长: 'duration',
          停车区域: 'areaName',
          停车地址: 'placeName',
          经度: 'lon',
          纬度: 'lat'
        }
      }
    }
  },
  watch: {
    wayInfo: function (newVal) {
      if (Array.isArray(newVal.stopInfo)) {
        this.getList()
      }
    }
  },
  methods: {
    // 请求接口
    getList() {
      this.agQueryParams.getDataLoading = false
      this.agTableOptions.rowData = this.wayInfo.stopInfo
      this.agQueryParams.getDataLoading = false
    }
  }
}
</script>
