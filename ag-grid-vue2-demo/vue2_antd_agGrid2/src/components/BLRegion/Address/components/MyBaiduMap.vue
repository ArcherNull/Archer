<!--
 * @Author: Null
 * @Date: 2022-06-23 08:38:47
 * @Description: 地图
-->
<template>
  <div class="BaiduMap" :style="{width:mapWidth, height:mapWidth}">
    <baidu-map
      :scroll-wheel-zoom="true"
      :center="center"
      :zoom="zoom"
      :continuous-zoom="true"
      :double-click-zoom="true"
      @moveend="moveend"
    >
      <bm-view
        v-if="['searchMap', 'map'].includes(customizedAttrs.type)"
        class="BaiduMap-map"
        :style="{width:mapWidth, height:mapWidth}"
      />
      <bm-local-search
        v-if="['searchMap', 'search'].includes(customizedAttrs.type)"
        :location="customizedAttrs.location || '深圳'"
        v-bind="customizedAttrs"
        v-on="$listeners"
      />

      <!-- 定位 -->
      <bm-geolocation
        anchor="BMAP_ANCHOR_BOTTOM_RIGHT"
        :show-address-bar="true"
        :auto-location="true"
      />

      <!-- 在右上角加入缩放控件  -->
      <!-- <bm-navigation :enable-geolocation="true" anchor="BMAP_ANCHOR_BOTTOM_RIGHT" /> -->
    </baidu-map>
  </div>
</template>

<script>
// 参考文档：https://dafrok.github.io/vue-baidu-map/#/zh/search/local-search
export default {
  name: 'MyBaiduMap',
  // 不希望组件的根元素继承特性
  inheritAttrs: false,
  props: {
    mapWidth: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      center: { lng: 116.404, lat: 39.915 }, // 北京
      zoom: 3
    }
  },
  computed: {
    customizedAttrs() {
      const obj = {
        // type: 'searchMap', // searchMap 表示有搜索下拉框的地图 ； search 表示只有搜索下拉框;  map表示只有地图
        location: '深圳', // String, Point, None 	location表示检索区域，其类型可为空、坐标点或城市名称的字符串。当参数为空时，检索位置由当前地图中心点确定，且搜索结果的标注将自动加载到地图上，并支持调整地图视野层级；当参数为坐标时，检索位置由该点所在位置确定；当参数为城市名称时，检索会在该城市内进行。
        keyword: '附近', // String, Array 搜索关键字。当keyword为数组时将同时执行多关键字的查询，最多支持10个关键字
        selectFirstResult: false, // 是否选择第一个检索结果
        forceLocal: true, // 表示是否将搜索范围约束在当前城市
        panel: true, // 是否选展现检索结果面板
        pageCapacity: 3, // 设置每页容量，取值范围：1 - 100，对于多关键字检索，每页容量表示每个关键字返回结果的数量（例如当用2个关键字检索时，实际结果数量范围为：2 - 200）。此值只对下一次检索有效
        autoViewport: true // 检索结束后是否自动调整地图视野。
      }
      const { type } = this.$attrs
      // searchMap 表示有搜索下拉框的地图 ； search 表示只有搜索下拉框
      obj.type = type && ['searchMap', 'search', 'map'].includes(type) ? type : 'searchMap'

      return Object.assign(obj, this.$attrs)
    }
  },
  methods: {
    // 获取地区检索经纬度
    moveend(e) {
      const { lng, lat } = e.target.getCenter()
      console.log('获取地区检索经纬度', e.target.getCenter())
      this.$emit('mapMoveend', { lng, lat })
    }
  }
}
</script>

<style lang="less" scoped>
.BaiduMap {
  border: 1px solid #dddee1;
  border-color: #e9eaec;
  background: #fff;
  border-radius: 10px;
  font-size: 14px;
  position: relative;
  width: 300px;
  &-map {
    width: 100%;
    height: 300px;
  }
}
</style>
