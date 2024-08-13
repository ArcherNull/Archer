<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-31 16:40:54
 * @LastEditTime: 2024-07-08 00:50:20
 * @Description: 地址搜索下拉框
-->

<template>
  <div class="BLRegionAddress" :style="{ width: comWidth }">
    <div class="BLRegionAddress-searchBox">
      <a-input
        class="BLRegionAddress-searchBox__input"
        v-model="defaultValue"
        v-bind="customizedAttrs"
        v-on="$listeners"
      />
      <BLButton
        v-show="!customizedAttrs.disabled"
        :icon="showMap ? 'up' : 'down'"
        @click="showMap = !showMap"
      />
    </div>
    <div
      v-if="defaultValue && showMap && !customizedAttrs.disabled"
      class="BLRegionAddress-map"
    >
      <MyBaiduMap
        :location="bLocation"
        :keyword="defaultValue"
        :map-width="comWidth"
        @resultshtmlset="resultshtmlset"
        @searchcomplete="searchcomplete"
        @markersset="markersset"
        @infohtmlset="infohtmlset"
        @mapMoveend="mapMoveend"
      />
    </div>
  </div>
</template>

<script>
import { isEmpty, isObject } from "lodash";
export default {
  name: "BLRegionAddress",
  components: {
    MyBaiduMap: () => import("./components/MyBaiduMap.vue"),
  },
  inheritAttrs: false,
  props: {
    // String, Point, None 	location表示检索区域，其类型可为空、坐标点或城市名称的字符串。当参数为空时，检索位置由当前地图中心点确定，且搜索结果的标注将自动加载到地图上，并支持调整地图视野层级；当参数为坐标时，检索位置由该点所在位置确定；当参数为城市名称时，检索会在该城市内进行。
    location: {
      type: [String, Object],
      default: "深圳",
    },
    value: {
      type: [String, undefined],
      default: "",
    },
  },
  data() {
    return {
      showMap: false, // 是否展示地图
    };
  },
  computed: {
    bLocation() {
      return this.location || "深圳";
    },
    customizedAttrs() {
      const obj = {
        size: "default",
        clearable: true,
        disabled: false,
        placeholder: "请输入详细地址",
      };

      const { style } = this.$attrs;

      if (style && isEmpty(style) && isObject(style)) {
        obj.style = style;
      } else {
        obj.style = {
          width: "300px",
        };
      }

      const data = Object.assign(obj, this.$attrs);
      return data;
    },

    comWidth() {
      let width = "300px";
      const { style } = this.customizedAttrs;
      if (style && style.width) {
        width = style.width;
      }
      return width;
    },

    defaultValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  methods: {
    // 获取地区检索经纬度
    mapMoveend(e) {
      if (this.defaultValue !== "") {
        this.$emit("mapMoveend", {
          ...e,
          ...{ keyword: this.defaultValue },
        });
      }
    },
    /**
     * @description: 结果列表添加完成后的回调函数
     * @param {*} ele
     * @return {*}
     */
    resultshtmlset(ele) {
      console.log("结果列表添加完成后的回调函数=====>", ele);
    },

    /**
     * @description: 检索完成后的回调函数。如果是多关键字检索，回调函数参数返回一个LocalResult的数组，数组中的结果顺序和检索中多关键字数组中顺序一致
     * @param {*} ele
     * @return {*}
     */
    searchcomplete(ele) {
      console.log('检索完成后的回调函数=====>', ele)
    },

    /**
     * @description: 标注添加完成后的回调函数
     * @param {*} ele
     * @return {*}
     */
    markersset(ele) {
      console.log('标注添加完成后的回调函数=====>', ele)
    },

    /**
     * @description: 标注气泡内容创建后的回调函数
     * @param {*} ele
     * @return {*}
     */
    infohtmlset(ele) {
      const address = ele.address;
      console.log("标注气泡内容创建后的回调函数=====>", address);
      this.$emit("change", ele.address);
      this.$emit("input", ele.address);
    },
  },
};
</script>

<style lang="less" scoped>
.BLRegionAddress {
  position: relative;
  // width: 300px;
  &-searchBox {
    margin-bottom: 4px;
    display: flex;
    align-content: center;
    justify-content: center;
  }
  &-map {
    width: 100%;
    position: absolute;
    background: #fff;
    z-index: 10;
  }
}
</style>
