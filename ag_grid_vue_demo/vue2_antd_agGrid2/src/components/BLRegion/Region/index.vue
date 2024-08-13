<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-31 15:52:04
 * @LastEditTime: 2024-04-29 12:02:44
 * @Description: 地址选择
-->
<template>
  <a-cascader
    v-model="defaultValue"
    v-bind="customizedAttrs"
    :value="value"
    v-on="$listeners"
  />
</template>

<script>
import REGION from "../common/region-utils";

export default {
  name: "RegionCascader",

  // 不希望组件的根元素继承特性
  inheritAttrs: false,
  props: {
    value: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },

  computed: {
    customizedAttrs() {
      const obj = {
        options: [],
        placeholder: "请选择",
        showSearch: {
          filter: this.$attrs.filter || this.filterFun,
        },
        fieldNames: {
          label: "name",
          value: "code",
          key: "id",
          children: "children",
        },
      };

      if (this.$attrs.regionType === "pca") {
        obj.options = REGION.getRegionData("pca");
        obj.placeholder = "请选择省市区";
      } else {
        obj.options = REGION.getRegionData("pc");
        obj.placeholder = "请选择省市";
      }
      const data = Object.assign(obj, this.$attrs);
      return data;
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
    // 数据过滤方法
    filterFun(inputValue, path) {
      const bool = path.some((option) => {
        return (
          option.name && inputValue && option.name.indexOf(inputValue) > -1
        );
      });
      return bool;
    },
  },
};
</script>
