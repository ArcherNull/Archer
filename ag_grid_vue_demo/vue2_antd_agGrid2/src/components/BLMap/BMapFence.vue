<template>
  <div class="BMapFence">
    <baidu-map
      style="height: 700px;width: 100%;"
      :center="center"
      :zoom="zoom"
      :scroll-wheel-zoom="true"
      @ready="bMapReady"
      @click="clickBMap"
      @moveend="syncCenterAndZoom"
      @zoomend="syncCenterAndZoom"
    >
      <!-- 比例尺 -->
      <bm-scale anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-scale>
      <!-- 缩放 -->
      <bm-navigation anchor="BMAP_ANCHOR_BOTTOM_LEFT"></bm-navigation>
      <!-- 城市选择控件 -->
      <bm-city-list anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-city-list>
      <!-- 行政区域 -->
      <bm-boundary name="北京市海淀区" :strokeWeight="2" strokeColor="blue"></bm-boundary>
      <!-- 搜索框 -->
      <!-- <bm-control :offset="{ width: '10px', height: '10px' }">
        <bm-auto-complete v-model="keyword" :sugStyle="{ zIndex: 1 }" @searchcomplete="searchcompleteFun">
          <a-input-search placeholder="请输入地名关键字" style="width: 200px" />
        </bm-auto-complete>
      </bm-control> -->

      <bm-control class="bmControl" anchor="BMAP_ANCHOR_TOP_LEFT">
        <a-radio-group class="control" :value="addFenceType" button-style="solid" @change="addFenceTypeChange">
          <a-radio-button value="circle">圆</a-radio-button>
          <a-radio-button value="polygon">多边形</a-radio-button>
        </a-radio-group>
      </bm-control>

      <!-- 圆形描点 -->
      <bm-marker
        :position="circlePath.center"
        v-if="showCircleCenterMarker"
        :dragging="true"
        @dragend="dragMarkerCircleEnd"
      >
        <bm-label
          v-if="circlePath.label"
          :content="circlePath.label"
          :labelStyle="{ color: 'red', fontSize: '16px' }"
          :offset="{ width: -45, height: -30 }"
        />
      </bm-marker>

      <!-- 多边形描点 -->
      <bm-marker
        :position="polygonPath.center"
        v-if="showPolygonCenterMarker"
        :dragging="true"
        @dragend="dragMarkerPolygonEnd"
      >
        <bm-label
          v-if="polygonPath.label"
          :content="polygonPath.label"
          :labelStyle="{ color: 'red', fontSize: '16px' }"
          :offset="{ width: -45, height: -30 }"
        />
      </bm-marker>

      <!-- 圆 -->
      <bm-circle
        v-if="showCircle"
        :center="circlePath.center"
        :radius="circlePath.radius"
        stroke-color="blue"
        :stroke-opacity="0.5"
        :stroke-weight="2"
        @lineupdate="updateCirclePath"
        :editing="true"
      ></bm-circle>

      <!-- 多边形 -->
      <bm-polygon
        v-if="showPolygon"
        :path="polygonPath.path"
        stroke-color="blue"
        :stroke-opacity="0.5"
        :stroke-weight="2"
        :editing="true"
        @lineupdate="updatePolygonPath"
      />
    </baidu-map>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import { convertNumber } from '@/utils/math.js'
export default {
  name: 'BMapFence',
  data() {
    return {
      center: { lng: 114.162508, lat: 22.661813 },

      zoom: 11,

      // 圆形覆盖物
      circlePath: {
        center: {
          lng: undefined,
          lat: undefined
        },
        radius: undefined,
        area: undefined,
        label: undefined
      },
      // 添加电子围栏类型
      addFenceType: '',
      //   // 圆形中心点label
      //   circleCenterLabel: '',
      // 多边形形覆盖物
      polygonPath: {
        path: [],
        center: {
          lng: undefined,
          lat: undefined
        },
        area: undefined,
        label: undefined
      },
      // 当前中心点经纬度
      currentCenter: { lng: 114.162508, lat: 22.661813 },
      // 地图类
      BMap: null,
      // 地图实例
      map: null,

      // 关键词
      keyword: '',
      // 计算面积
      calcAreaSize: 0
    }
  },
  computed: {
    showCircleCenterMarker() {
      const { center } = this.circlePath
      return this.addFenceType === 'circle' && center.lng && center.lat
    },
    showPolygonCenterMarker() {
      const { center, path } = this.polygonPath
      return this.showPolygon && center.lng && center.lat && path.length > 2
    },
    showCircle() {
      const { radius } = this.circlePath
      return this.showCircleCenterMarker && radius
    },
    showPolygon() {
      return this.addFenceType === 'polygon' && this.polygonPath.path && this.polygonPath.path.length
    }
  },
  methods: {
    
    /** 添加地图标注 */
    bMapReady({ BMap, map }) {
      this.BMap = BMap
      this.map = map
    },
    // 点击BMap
    clickBMap(e) {
      console.log('点击BMap', e)
      const { lat, lng } = e.point
      if (this.addFenceType === 'circle') {
        this.resetPolygonData()
        if (!(this.circlePath.center.lng && this.circlePath.center.lat)) {
          this.circlePath.center.lng = lng
          this.circlePath.center.lat = lat
          this.circlePath.radius = 5000
          this.zoom = 15
          this.center = { lng, lat }
          const circleAreaSize = this.calcCircleAreaSize(5000)
          console.log('circleAreaSize123123', circleAreaSize)
          this.circlePath.area = circleAreaSize
          this.getAddressInfoByLocation(e.point, 'circle')
        }
      } else if (this.addFenceType === 'polygon') {
        this.resetCircleData()
        this.polygonPath.path.push({
          lng,
          lat
        })
        if (this.polygonPath.path.length > 2) {
          this.calcPolygonAreaSize()
        }
        this.postMessageFun()
      }
    },
    // 发送消息
    postMessageFun() {
      const data = {
        addFenceType: this.addFenceType,
        circlePath: this.circlePath,
        polygonPath: this.polygonPath
      }
      console.log('发送消息', data)
      this.$emit('postMessage', data)
    },
    // 重置绘制的圆数据
    resetCircleData() {
      this.circlePath.center.lng = undefined
      this.circlePath.center.lat = undefined
      this.circlePath.radius = undefined
      this.circlePath.area = undefined
      this.circlePath.label = undefined
    },
    // 重置绘制的多边形数据
    resetPolygonData() {
      this.polygonPath.path = []
      this.polygonPath.center.lng = undefined
      this.polygonPath.center.lat = undefined
      this.polygonPath.area = undefined
      this.polygonPath.label = undefined
    },

    // 计算圆形面积
    calcCircleAreaSize(radius) {
      const radiusVal = convertNumber(radius)
      if (radiusVal > 0) {
        return Math.ceil(Math.PI * radiusVal * radiusVal)
      } else {
        return 0
      }
    },

    // 计算多边形面颊
    calcPolygonAreaSize() {
      const newPolygon = this.polygonPath.path.map((ele) => {
        return [ele.lng, ele.lat]
      })
      const calcArr = [...newPolygon, newPolygon[0]]
      var polygon = turf.polygon([calcArr])
      var area = turf.area(polygon)
      var center = turf.centerOfMass(polygon)
      const location = center.geometry.coordinates
      if (location && location.length === 2) {
        const [lng, lat] = location
        this.polygonPath.center.lng = lng
        this.polygonPath.center.lat = lat
        const newPoint = new this.BMap.Point(lng, lat)
        this.getAddressInfoByLocation(newPoint, 'polygon')
      }
      this.polygonPath.area = Math.ceil(area / 1000)
    },
    // 移动或缩放时
    syncCenterAndZoom(e) {
      console.log('移动或缩放时', e)
      //   const Zoom = e.target.getZoom()
      if (e.target && e.target.re) {
        this.currentCenter.lng = e.target.re.lng
        this.currentCenter.lat = e.target.re.lat
      }
    },

    // 添加围栏类型
    addFenceTypeFun(fenceType) {
      console.log('添加围栏类型', fenceType)
      this.addFenceType = fenceType
    },

    // 添加围栏类型
    addFenceTypeChange(ele) {
      console.log('添加围栏类型12', ele)
      const val = ele.target.value
      this.addFenceType = val
      setTimeout(() => {
        this.resetPolygonData()
        this.resetCircleData()
        this.postMessageFun()
      })
    },
    // 更新圆形覆盖物
    updateCirclePath: debounce(function (e) {
      console.log('更新圆形覆盖物', e)
      const centerLocation = e.target.getCenter()
      const raduis = e.target.getRadius()
      console.log('centerLocation123123', centerLocation)
      this.circlePath.center.lng = centerLocation.lng
      this.circlePath.center.lat = centerLocation.lat
      const raduisVal = Math.ceil(raduis)
      this.circlePath.radius = raduisVal
      this.circlePath.area = this.calcCircleAreaSize(raduisVal)
      this.postMessageFun()
    }, 150),
    // 更新矩形覆盖物的路径
    updatePolygonPath(e) {
      console.log('更新矩形覆盖物的路径', e)
      this.polygonPath.path = e.target.getPath()
      this.calcPolygonAreaSize()
      this.postMessageFun()
    },
    // 拖拽圆形marker
    dragMarkerCircleEnd: debounce(function (ele) {
      console.log('拖拽marker', ele)
      this.circlePath.center.lng = ele.point.lng
      this.circlePath.center.lat = ele.point.lat
      this.getAddressInfoByLocation(ele.point, 'circle')
    }, 100),
    // 拖拽多边形marker
    dragMarkerPolygonEnd: debounce(function (ele) {
      console.log('拖拽marker', ele)
      this.polygonPath.center.lng = ele.point.lng
      this.polygonPath.center.lat = ele.point.lat
      this.getAddressInfoByLocation(ele.point, 'polygon')
    }, 100),
    // 根据经纬度获取地址信息
    getAddressInfoByLocation(point, type) {
      const that = this
      // 创建地址解析器实例
      const myGeo = new that.BMap.Geocoder()
      myGeo.getLocation(point, (res) => {
        console.log('reererre', res)
        const address = res.address
        if (type === 'circle') {
          that.circlePath.label = address
        } else {
          that.polygonPath.label = address
        }
        this.postMessageFun()
      })
    },
    // 搜索完成方法
    searchcompleteFun(ele) {
      console.log('搜索完成方法', ele)
    },
    // 更改参数
    changeFenceParams(data) {
      console.log('更改参数', data)
      const { addFenceType, circlePath, polygonPath } = data
      this.addFenceType = addFenceType
      if (addFenceType === 'circle') {
        const { label, radius, center } = circlePath
        this.circlePath.radius = radius
        this.circlePath.label = label
        if (center && center.lat && center.lng) {
          const { lng, lat } = center
          this.circlePath.center.lng = lng
          this.circlePath.center.lat = lat
          const circleAreaSize = this.calcCircleAreaSize(radius)
          this.circlePath.area = circleAreaSize
          setTimeout(() => {
            this.map.centerAndZoom(new this.BMap.Point(lng, lat), 13)
          }, 300)
        }
      } else if (addFenceType === 'polygon') {
        const { path, center, label } = polygonPath
        if (Array.isArray(path) && path.length) {
          this.polygonPath.path = path
        }
        if (center && center.lat && center.lng) {
          const { lng, lat } = center
          this.polygonPath.center.lng = lng
          this.polygonPath.center.lat = lat
          setTimeout(() => {
            this.map.centerAndZoom(new this.BMap.Point(lng, lat), 13)
          }, 300)
        }
        this.polygonPath.label = label
      } else {
        this.addFenceType = ''
        this.resetPolygonData()
        this.resetCircleData()
      }
    },

    // 通过关键词获取搜素下拉列表
    getAddressListByKeyword(keyword) {
      return new Promise((resolve) => {
        console.log('通过关键词获取搜素下拉列表', keyword)
        if (keyword) {
          const that = this
          console.log('keyword123123123', keyword)
          console.log('keyword123123123', this.BMap)
          const local = new that.BMap.LocalSearch(that.map, {
            // 渲染在此地图上，当前条件不需要渲染并标注点
            // renderOptions: { map: that.map }
            autoViewport: true
          })
          local.search(keyword)
          local.setSearchCompleteCallback(function (ele) {
            console.log('setSearchCompleteCallback', ele)
            resolve(ele.as || [])
          })
        } else {
          resolve([])
        }
      })
    }
  }
}
</script>

<style lang="less">
.BMapFence{
  width: 100%;

}
.control {
  margin: 10px;
}
</style>
