<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-28 21:38:17
 * @LastEditTime: 2024-06-25 12:02:28
 * @Description:官方文档：https://dafrok.github.io/vue-baidu-map/#/zh/other/boundary
-->
<template>
  <div>
    <div class="map">
      <baidu-map
        class="bm-view"
        :center="center"
        :zoom="zoom"
        :scroll-wheel-zoom="true"
        @ready="readyMap"
        @moveend="syncCenterAndZoom"
        @zoomend="syncCenterAndZoom"
      >
        <!-- 比例尺 -->
        <bm-scale anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-scale>
        <!-- 缩放 -->
        <bm-navigation anchor="BMAP_ANCHOR_BOTTOM_LEFT"></bm-navigation>
        <!-- 地图类型 -->
        <!-- <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_LEFT"></bm-map-type> -->
        <!-- 缩略图 -->
        <!-- <bm-overview-map anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :isOpen="false"></bm-overview-map> -->
        <!-- 定位 -->
        <bm-geolocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :showAddressBar="true" :autoLocation="true"></bm-geolocation>
        <!-- 城市选择控件 -->
        <bm-city-list anchor="BMAP_ANCHOR_TOP_LEFT"></bm-city-list>

        <!-- 中转电子围栏位置 -->
        <bm-marker
          v-for="(cPoint, cindex) in fenceMarkerList"
          :key="`p${cindex}`"
          :position="{ lng: cPoint.lng, lat: cPoint.lat }"
          :icon="
            cPoint.addressType === 0 ? iconMarkerStart : cPoint.addressType === 1 ? iconMarkerEnd : iconMarkerTransfer
          "
          :dragging="false"
          :z-index="3"
          @click="infoWindowOpen(cPoint)"
        >
          <!-- <bm-label
            v-if="cPoint.address"
            :content="cPoint.address"
            :labelStyle="{ color: 'red', fontSize: '16px' }"
            :offset="{ width: -45, height: -30 }"
          /> -->
        </bm-marker>

        <!-- 途经点 -->
        <div v-if="showPoints">
          <bm-marker
            v-for="(item, index) of points"
            :key="`m${index}`"
            :position="{ lng: item.lng, lat: item.lat }"
            @click="infoWindowOpen(item)"
          />
        </div>

        <!-- 电子围栏圆 -->
        <div v-for="(circlePath, index) in circleFenceList" :key="`circle${index}`">
          <bm-circle
            :center="circlePath.center"
            :radius="circlePath.radius"
            :fillColor="circlePath.addressType === 0 ? 'red' : circlePath.addressType === 1 ? 'green' : 'yellow'"
            :fillOpacity="0.25"
            stroke-color="blue"
            :stroke-opacity="0.5"
            :stroke-weight="2"
            :editing="false"
          ></bm-circle>
        </div>

        <!-- 信息窗体 -->
        <bm-info-window
          v-if="showPoints && showPath && marker && Object.keys(marker).length && marker.lng && marker.lat"
          :position="{ lng: marker.lng, lat: marker.lat }"
          :show="openInfoWindow"
          :close-on-click="true"
          :auto-pan="false"
          @close="infoWindowClose"
          @open="infoWindowOpen"
        >
          <div class="info-box">
            <div class="infoTextBox" v-if="marker.vehicleNo">
              <span class="infoTextBox-1">车辆</span>
              <span>{{ marker.vehicleNo }}</span>
            </div>
            <div class="infoTextBox" v-if="marker.gpsTime">
              <span class="infoTextBox-1">时间</span>
              <span>{{ marker.gpsTime }}</span>
            </div>
            <div class="infoTextBox" v-if="marker.speed">
              <span class="infoTextBox-1">速度</span>
              <span>{{ (marker.speed || 0) + 'km/h' }}</span>
            </div>
            <div class="infoTextBox">
              <span class="infoTextBox-1">位置</span>
              <span>{{ marker.placeName || marker.address || '未获取到详细位置' }}</span>
            </div>
            <div class="infoTextBox" v-if="marker.equipCode">
              <span class="infoTextBox-1">设备编号</span>
              <span>{{ marker.equipCode }}</span>
            </div>
          </div>
        </bm-info-window>

        <!-- 路书 轨迹 -->
        <bml-lushu
          v-if="showPoints && showPath"
          :path="path"
          :icon="icon"
          :play="play"
          :rotation="true"
          :speed="speed"
          :info-window="true"
          :auto-view="true"
          :z-index="999"
          @reset="reset"
        />
        <!-- 折线 自己重新封装了百度的组件，才可以用icons贴合折线的图标 -->
        <NewPolyline
          v-if="showPoints && showPath && checkPoints({ points })"
          :path="path"
          stroke-color="#1890ff"
          :stroke-opacity="1"
          :stroke-weight="8"
          :icons="icons"
          :editing="false"
          :mass-clear="true"
          :z-index="-999999"
          @lineupdate="updatePolylinePath"
        />

        <bm-control class="bmControl" anchor="BMAP_ANCHOR_TOP_LEFT">
          <div class="operation" @click.stop="">
            <div class="bottom-btn">
              <BLButton :class="{ pause: pauseBtnOpen, start: startBtnOpen }" @click="startPlay">开始</BLButton>
              <a-slider
                id="test"
                :value="currentMileage"
                :tip-formatter="formatter"
                :min="1"
                disabled
                style="width: 150px; margin-top: 20px; margin-right: 16px"
                :max="totalMileage"
                size="'small"
              />
              <span v-if="wayInfo && wayInfo.orderInfo">
                <b>{{ currentMileage }}km</b>/<b>{{ totalMileage }}km</b>
              </span>
              <a-select
                size="small"
                class="ant-select"
                @change="handleChange"
                :default-value="1"
                :dropdownStyle="{ width: 100 }"
              >
                <a-select-option v-for="(item, index) in selectList" :key="`sel${index}`" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>

              <BLButton type="link" @click="openShowDetail()">
                线路详情
                <a-icon :type="!showDetail ? 'down' : 'up'" />
              </BLButton>
            </div>
          </div>
        </bm-control>

        <!-- <bm-control class="bmControl-input" anchor="BMAP_ANCHOR_TOP_LEFT">
          <a-input-search placeholder="请输入运单号" style="width: 200px" @search="onSearch" />
        </bm-control> -->

        <!-- 轨迹点/区域/停留点 -->
        <bm-control
          class="bmControl-pointAreaPoint"
          anchor="BMAP_ANCHOR_TOP_LEFT"
          v-if="showDetail"
          style="height: 350px"
        >
          <a-card :bodyStyle="{ padding: '10px' }" :headStyle="{ height: '10px' }" @click.stop="">
            <a-tabs class="card-tab" type="card" size="small">
              <a-tab-pane key="TrajectoryPoints" tab="轨迹点">
                <TrajectoryPoints :wayInfo="wayInfo"></TrajectoryPoints>
              </a-tab-pane>
              <a-tab-pane key="Region" tab="区域">
                <Region :wayInfo="wayInfo"></Region>
              </a-tab-pane>
              <a-tab-pane key="HoldPoint" tab="停留点">
                <HoldPoint :wayInfo="wayInfo"></HoldPoint>
              </a-tab-pane>
            </a-tabs>
          </a-card>
        </bm-control>
      </baidu-map>
    </div>
  </div>
</template>

<script>
// 新的折线组件
import NewPolyline from './components/NewPolyline.vue'
// 路书
import { BmlLushu } from 'vue-baidu-map'
import { convertNumber } from '@/utils/math.js'
export default {
  props: {
    // 查询方法
    querySelect: {
      type: Function,
      default: () => {}
    },
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
    },

    // 订单信息
    orderInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  components: {
    BmlLushu,
    NewPolyline,
    TrajectoryPoints: () => import('./components/trajectoryPoints.vue'),
    Region: () => import('./components/regions.vue'),
    HoldPoint: () => import('./components/holdPoint.vue')
  },
  data() {
    return {
      // 信息弹窗标记点
      marker: {},
      // 打开信息弹窗
      openInfoWindow: false,

      center: { lng: 114.162508, lat: 22.661813 },
      zoom: 11,
      startPoint: { lng: 120.79, lat: 27.95 },
      endPoint: { lng: 106.41199, lat: 26.36501 },
      points: [],
      play: false,
      // 小车移动速度--（小车就是覆盖物默认4000）
      speed: 100000,
      // 小车起始点
      startCar: {},
      // 小车终止点
      endCar: {},
      // 开始按钮
      startBtnOpen: false,
      // 暂停按钮
      pauseBtnOpen: true,
      // 总里程
      totalMileage: 332.91,
      // 当前里程
      currentMileage: 0,
      // 路上路径
      path: [],
      // 折线图标
      icons: [],
      // 小车速度倍数
      selectList: [
        { label: '1x', value: 1 },
        { label: '2x', value: 2 },
        { label: '5x', value: 5 },
        { label: '10x', value: 10 }
      ],
      // 标注图标
      iconMarkerStart: {
        url: require('../../assets/images/qidian.png'),
        size: { width: 32, height: 32 },
        opts: { anchor: { width: 18, height: 28 } }
      },
      iconMarkerEnd: {
        url: require('../../assets/images/zhongdian.png'),
        size: { width: 32, height: 32 },
        opts: { anchor: { width: 18, height: 28 } },
        zIndex: 999
      },
      iconMarkerTransfer: {
        url: require('../../assets/images/timeline-dw.png'),
        size: { width: 32, height: 32 },
        opts: { anchor: { width: 20, height: 28 } },
        zIndex: 999
      },
      icon: {
        url: require('../../assets/images/car.png'),
        size: { width: 64, height: 54 },
        opts: { anchor: { width: 30, height: 22 } }
      },
      // 展示订单详细信息
      showDetail: false,

      fenceMarkerList: [],

      // 起始点电子围栏
      startFenceCirclePath: {
        addressType: 0,
        center: {
          lng: undefined,
          lat: undefined
        },
        radius: undefined,
        area: undefined,
        label: undefined
      },

      // 起始点电子围栏
      endFenceCirclePath: {
        addressType: 1,
        center: {
          lng: undefined,
          lat: undefined
        },
        radius: undefined,
        area: undefined,
        label: undefined
      },

      circleFenceList: [],
      transferPoint: [],

      BMap: null,
      map: null
    }
  },
  watch: {
    wayInfo: {
      handler(newVal) {
        console.log('newVal123123123', newVal)
        if (newVal) {
          this.resetData()
          this.initMap(newVal)
        }
      },
      immediate: true
    }
  },
  computed: {
    showPoints() {
      const points = this.points
      return Array.isArray(points)
    },

    showPath() {
      const path = this.path
      return path && Array.isArray(path) && path.length
    }
  },
  methods: {
    // 初始化地图
    initMap(wayInfo) {
      console.log('初始化地图', wayInfo)
      // 描点
      const { orderInfo } = wayInfo
      const { points, startPoint, endPoint, transferPoint } = this.getMarkers(wayInfo)

      console.log('points', points)
      console.log('startPoint', startPoint)
      console.log('endPoint', endPoint)
      console.log('transferPoint', transferPoint)

      this.startPoint = startPoint
      this.endPoint = endPoint
      this.points = points
      this.transferPoint = transferPoint

      this.totalMileage = convertNumber(orderInfo.estimatesKm)
      this.currentMileage = convertNumber(orderInfo.travelledDistance)

      if (points.length) {
        const newTrackPoints = [...points]
        const endLocationPoint = newTrackPoints[newTrackPoints.length - 1]
        console.log('endLocationPoint123123132', endLocationPoint)
        this.center = { lng: endLocationPoint.lng, lat: endLocationPoint.lat }
        // 存在实际发车时间，则加入起点，因为未发车，车不一定是从起点出发的
        if (this.orderInfo.departureTime) {
          newTrackPoints.unshift(startPoint)
        }
        // 签收状态后，才将终点连接起来，因为可能还在运输中
        if (['签收'].includes(this.orderInfo.currentNode)) {
          newTrackPoints.push(endPoint)
        }
        this.$nextTick(() => {
          this.fenceMarkerList = this.getFenceMarkerList()
          this.trackAddPoints(newTrackPoints)
        })
      }
    },

    getFenceMarkerList() {
      const newMarkerList = []
      if (this.startPoint.lng && this.startPoint.lat) {
        newMarkerList.push(this.startPoint)
      }

      if (this.transferPoint.length) {
        newMarkerList.push(...this.transferPoint)
      }

      if (this.endPoint.lng && this.endPoint.lat) {
        newMarkerList.push(this.endPoint)
      }
      return newMarkerList
    },

    resetData() {
      this.points = []
      this.path = []
      this.startPoint = {}
      this.endPoint = {}
      this.transferPoint = []
      this.circleFenceList = []
      this.startFenceCirclePath = {
        addressType: 0,
        center: {
          lng: undefined,
          lat: undefined
        },
        radius: undefined,
        area: undefined,
        label: undefined
      }
      this.endFenceCirclePath = {
        addressType: 1,
        center: {
          lng: undefined,
          lat: undefined
        },
        radius: undefined,
        area: undefined,
        label: undefined
      }
    },

    // 校验是否是圆形电子围栏数据
    validateCircleFenceData(fenceData) {
      return fenceData.center && fenceData.center.lng && fenceData.center.lat && fenceData.radius
    },

    // 获取描点marks
    getMarkers(newVal) {
      console.log('newVal12312321', newVal)
      const points = []
      let startPoint = {}
      let endPoint = {}
      let transferPoint = []
      const orderFence = newVal.orderFence

      const dealCircleFence = this.dealCircleFence(orderFence)
      startPoint = dealCircleFence.startPoint
      endPoint = dealCircleFence.endPoint
      transferPoint = dealCircleFence.transferPoint

      newVal.gpsInfo.forEach((ele) => {
        const point = {
          ...ele,
          lng: ele.lon
        }
        points.push(point)
      })

      return {
        points,
        startPoint,
        endPoint,
        transferPoint
      }
    },

    dealCircleFence(orderFence) {
      let startPoint = {}
      let endPoint = {}
      const transferPoint = []
      if (Array.isArray(orderFence) && orderFence.length >= 2) {
        let resetList = []
        orderFence.forEach((ele) => {
          const newObj = {
            ...ele,
            lng: ele.lon
          }
          if (ele.addressType === 0) {
            startPoint = newObj
          } else if (ele.addressType === 1) {
            endPoint = newObj
          } else {
            transferPoint.push(newObj)
            resetList.push({
              addressType: ele.addressType,
              center: {
                lng: ele.lon,
                lat: ele.lat
              },
              radius: Number(ele.radius),
              label: ele.address
            })
          }
        })
        this.startFenceCirclePath.center.lat = startPoint.lat
        this.startFenceCirclePath.center.lng = startPoint.lng
        this.startFenceCirclePath.radius = Number(startPoint.radius)
        this.startFenceCirclePath.label = startPoint.address

        this.endFenceCirclePath.center.lat = endPoint.lat
        this.endFenceCirclePath.center.lng = endPoint.lng
        this.endFenceCirclePath.radius = Number(endPoint.radius)
        this.endFenceCirclePath.label = endPoint.address

        const newFenceList = []
        if (this.validateCircleFenceData(this.startFenceCirclePath)) {
          newFenceList.push(this.startFenceCirclePath)
        }

        if (this.validateCircleFenceData(this.endFenceCirclePath)) {
          newFenceList.push(this.endFenceCirclePath)
        }

        resetList.forEach((ele) => {
          if (this.validateCircleFenceData(ele)) {
            newFenceList.push(ele)
          }
        })

        console.log('newFenceLis123123123t', newFenceList)

        this.circleFenceList = newFenceList
      }
      return {
        startPoint,
        endPoint,
        transferPoint
      }
    },

    addZoom(level) {
      this.zoom = level
    },
    reset() {
      this.play = false
    },
    // 轨迹点
    trackAddPoints(data) {
      data.forEach((item, index) => {
        if (index !== 0 || index !== item.length - 1) {
          this.path.push(new this.BMap.Point(item.lng, item.lat))
        }
      })
    },
    // 查重 如果数组中只有一组有意义的坐标,绘制折线时可能会报错,因为绘制一条折线需要两组不同的坐标点
    checkPoints({ points }) {
      // 拿到第一组点
      var originPoint = points[0]
      // 将第一组点与后续点进行对比 如果坐标集合中只有一组实际坐标点则return false
      // 只要坐标集合中有两组不同的实际坐标点,则return true
      for (var i = 1; i < points.length; i++) {
        if (points[i].lat !== originPoint.lat || points[i].lng !== originPoint.lng) {
          return true
        }
      }
      return false
    },
    /** 添加地图标注 */
    readyMap({ BMap, map }) {
      // 折线上的图标
      // eslint-disable-next-line no-undef
      var sy = new BMap.Symbol(BMap_Symbol_SHAPE_FORWARD_OPEN_ARROW, {
        scale: 0.5, // 图标缩放大小
        strokeColor: '#fff', // 设置矢量图标的线填充颜色
        strokeWeight: '1.5' // 设置线宽
      })
      // offset为符号相对于线起点的位置,可以是百分比也可以是距离值
      // repeat为符号在线上重复显示的距离，可以是百分比也可以是距离值，同时设置repeat与offset时，以repeat为准
      var icons = new BMap.IconSequence(sy, '5%', '4%')
      this.BMap = BMap
      this.map = map
      // 折线上的图标
      this.icons.push(icons)
    },
    // 移动或缩放时
    syncCenterAndZoom(e) {
      const Zoom = e.target.getZoom()
      if (Zoom < 13) {
        this.nameShow = false
      } else {
        this.nameShow = true
      }
    },
    // 运单号查询
    async onSearch(value) {
      console.log('value======>', value)
      const res = await this.querySelect(value)
    },
    // 折线
    updatePolylinePath(e) {
      this.path = e.target.getPath()
    },
    startPlay() {
      if (this.path.length) {
        this.play = !this.play
        this.startBtnOpen = !this.startBtnOpen
      } else {
        this.$message('抱歉，没有查询到车辆呢')
      }
    },
    formatter(value) {
      return `已行驶距离${value}km`
    },
    handleChange(ele) {
      console.log('ele', ele)
      this.speed = 100000 * ele
    },
    // 最大化/最小化
    openShowDetail() {
      this.showDetail = !this.showDetail
    },
    // 打开信息窗体
    async infoWindowOpen(marker) {
      console.log('打开信息窗体', marker)
      const that = this
      if (marker.lng && marker.lat) {
        that.marker = marker

        setTimeout(() => {
          that.openInfoWindow = true
        })
      }
    },
    // 关闭信息窗体
    infoWindowClose() {
      this.openInfoWindow = false
    }
  }
}
</script>
<style lang="less" scoped>
.bm-view {
  width: 100%;
  height: calc(100vh - 250px);
}
#test {
  margin-left: 20px;
  padding: 0px;
  width: 400px;
}

.bm-city-list {
  margin-left: 60px;
}

.bmControl-input {
  margin-left: 100px;
  margin-top: 5px;
}
.bmControl {
  margin-left: 320px;

  .operation {
    height: 80px;
    bottom: 0px;
    z-index: 100;
    .bottom-btn {
      padding: 0px 10px;
      background-color: #fff;
      border: 1px solid rgb(198, 198, 198);
      height: 40px;
      display: flex;
      border-radius: 5px;
      display: flex;
      align-items: center;
      // 暂停
      .pause {
        border-radius: 50%;
        width: 30px;
        height: 30px;
        background: url('../../assets/images/speed.png') no-repeat center;
        background-size: 30%;
        color: rgba(0, 0, 0, 0);
      }
      // 开始
      .start {
        background: url('../../assets/images/start.png') no-repeat center;
        background-size: 30%;
        color: rgba(0, 0, 0, 0);
      }
      .ant-select {
        border: none !important; /* 移除边框 */
        box-shadow: none !important; /* 移除可能的阴影 */
        width: 50px;
        margin-left: 10px;
      }
    }
  }
}
.bmControl-pointAreaPoint {
  margin-left: 40px;
  width: 95%;
  z-index: 99999;
  margin-top: 50px;
  .card-tab {
    margin-bottom: 10px;
  }
}

.infoTextBox {
  width: 350px;
  margin-bottom: 6px;
  display: grid;
  grid-template-columns: 65px 1fr;
  column-gap: 10px;
  &-1 {
    color: #999;
    text-align: right;
  }
}
</style>
