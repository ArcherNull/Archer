<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-31 15:52:04
 * @LastEditTime: 2024-04-29 12:02:23
 * @Description: 地址选择
-->
<template>
  <a-tree-select
    v-model="defaultValue"
    v-bind="customizedAttrs"
    :value="value"
    v-on="$listeners"
  >
    <span slot="title" slot-scope="{ value }" style="color: #08c">{{
      value
    }}</span>
  </a-tree-select>
</template>

<script>
import { TreeSelect } from "ant-design-vue";
import REGION from "../common/region-utils";
const { SHOW_PARENT, SHOW_ALL, SHOW_CHILD } = TreeSelect;

export default {
  name: "RegionComponents",

  // 不希望组件的根元素继承特性
  inheritAttrs: false,
  props: {
    value: {
      type: Array,
      default: () => {
        return [];
      },
    },
    rootDisabled: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
  },

  computed: {
    customizedAttrs() {
      const obj = {
        treeData: [],
        placeholder: "请选择",
        fieldNames: { label: "name", value: "code", children: "children" },
        dropdownStyle: {
          maxHeight: "400px",
          overflow: "auto",
        },
        showSearch: true,
        allowClear: true,
        treeDefaultExpandAll: false,
        replaceFields: {
          children: "children",
          title: "name",
          key: "id",
          value: "shortName",
        },
      };

      if (this.$attrs.regionType === "pca") {
        let treeData = REGION.getRegionData("pca");
        for (let index = 0; index < treeData.length; index++) {
          const element = treeData[index];
          element.disabled = this.rootDisabled;
        }
        obj.treeData = treeData;
        obj.placeholder = "请选择省市区";
      } else {
        let treeData = REGION.getRegionData("pc");
        for (let index = 0; index < treeData.length; index++) {
          const element = treeData[index];
          element.disabled = this.rootDisabled;
        }
        obj.treeData = treeData;
        obj.placeholder = "请选择省市";
      }

      if (this.$attrs.chooseType === "showAll") {
        obj.showCheckedStrategy = SHOW_ALL;
      } else if (this.$attrs.chooseType === "showChild") {
        obj.showCheckedStrategy = SHOW_CHILD;
      } else {
        obj.showCheckedStrategy = SHOW_PARENT;
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
};
</script>
