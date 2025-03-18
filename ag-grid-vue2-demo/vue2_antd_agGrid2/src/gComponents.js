/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-26 12:00:10
 * @LastEditTime: 2024-05-21 20:50:38
 * @Description: 全局组件注册
 */
import BaiduMap from "vue-baidu-map";
import BLHeaderBtn from "@/components/BLHeaderBtn/index";
import AgGridTable from "@/components/AgGridTable/index";
import directives from "@/components/AgGridTable/directives/index";
import BLHeaderSearch from "@/components/BLHeaderSearch/index";
import BLEmpty from "@/components/BLEmpty/index";
import BLModal from "@/components/BLModal/index";
import BLHeaderBox from "@/components/BLHeaderBox/index";
import BLButton from "@/components/BLButton/index";
import BLRegion from "@/components/BLRegion/Region/index";
import BLRegionTree from "@/components/BLRegion/RegionTree/index";
import BLRegionAddress from "@/components/BLRegion/Address/index";
import REGION from "@/components/BLRegion/common/region-utils";

export default {
  install(Vue) {
    // 百度地图
    Vue.use(BaiduMap, {
      // ak 是在百度地图开发者平台申请的密钥 详见 http://lbsyun.baidu.com/apiconsole/key */
      ak: 'DjZL60GyDrVkIgOzm0Fjx2mXuAzdMHvw'
    });
    // 注册ag-grid-vue全局指令
    Vue.use(directives);
    // 标题容器
    Vue.component("AgGridTable", AgGridTable);
    // 标题容器
    Vue.component("BLHeaderBox", BLHeaderBox);
    // modal容器
    Vue.component("BLModal", BLModal);
    // button按钮
    Vue.component("BLButton", BLButton);
    // 页面头部搜索
    Vue.component("BLHeaderSearch", BLHeaderSearch);
    // 页面按钮组件
    Vue.component("BLHeaderBtn", BLHeaderBtn);
    // 暂无数据组件
    Vue.component("BLEmpty", BLEmpty);
    // 注册地址处理方法对象
    Vue.prototype.$region = REGION;
    // 地址组件
    Vue.component("BLRegion", BLRegion);
    // 地址详细组件
    Vue.component("BLRegionAddress", BLRegionAddress);
    // 地址树型组件
    Vue.component("BLRegionTree", BLRegionTree);
  },
};
