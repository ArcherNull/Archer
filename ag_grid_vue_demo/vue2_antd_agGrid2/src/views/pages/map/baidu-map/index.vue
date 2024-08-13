<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-07-08 08:43:53
 * @LastEditTime: 2024-07-08 10:54:55
 * @Description: 
-->
<template>
  <div class="BaiduMap">
    <a-tabs :default-active-key="activeName" size="small">
      <a-tab-pane class="BaiduMapTab" key="电子围栏" tab="电子围栏">
        <ElectronicFence></ElectronicFence>
      </a-tab-pane>
      <a-tab-pane class="BaiduMapTab" key="地图轨迹" tab="地图轨迹">
        <MapTrajectory></MapTrajectory>
      </a-tab-pane>
      <a-tab-pane class="BaiduMapTab" key="地图相关组件" tab="地图相关组件">
        <MapComponents></MapComponents>
      </a-tab-pane>
      <a-tab-pane class="BaiduMapTab" key="地图相关工具函数" tab="地图相关工具函数">
        <MapTools></MapTools>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import ElectronicFence from './electronic-fence/index.vue'
import MapComponents from './map-components/index.vue'
import MapTools from './map-tools/index.vue'
import MapTrajectory from './map-trajectory/index.vue'

export default {
  name: "BaiduMap",
  components:{
    ElectronicFence,
    MapComponents,
    MapTools,
    MapTrajectory
  },
  data() {
    return {
      activeName: "电子围栏",
    };
  },
};
</script>

<style lang="less" scoped></style>
