<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-31 09:55:55
 * @LastEditTime: 2024-04-29 11:26:02
 * @Description:
-->
<template>
  <div class="BLHeaderBtn">
    <span v-for="(item, index) in btnConfigList" :key="index">
      <!-- 批量操作按钮 -->
      <a-dropdown v-if="validateDropdownBtn(item)">
        <a-menu slot="overlay" @click="handleMenuClick">
          <a-menu-item
            v-for="cItem in item.menuItems"
            v-bind="cItem"
            :key="cItem.btnText"
          >
            <a-icon v-if="cItem.icon" :type="cItem.icon" />
            {{ cItem.btnText }}
            <a-icon v-if="cItem.afterIcon" :type="cItem.afterIcon" />
          </a-menu-item>
        </a-menu>
        <BLButton v-bind="item" type="primary" v-show="showDropdownMenuList">
          {{ item.btnText }}
          <a-icon v-if="item.afterIcon" :type="item.afterIcon" />
        </BLButton>
      </a-dropdown>

      <!-- 普通按钮 -->
      <BLButton v-else v-bind="item" @click.stop="headerBtnOperation(item)">
        {{ item.btnText }}
        <a-icon v-if="item.afterIcon" :type="item.afterIcon" />
      </BLButton>
    </span>
  </div>
</template>

<script>
export default {
  name: "BLHeaderBtn",
  props: {
    btnConfigList: {
      type: Array,
      default() {
        return [];
      },
    },
    // 是否有下拉菜单
    hasDropdownMenu: {
      type: Boolean,
      default: false,
    },
    // 选中数据
    rowSelectedList: {
      type: [Array, null],
      default() {
        return [];
      },
    },
  },
  computed: {
    showDropdownMenuList() {
      const rowSelectedList = this.rowSelectedList;
      return rowSelectedList && rowSelectedList.length > 0;
    },
  },
  methods: {
    validateDropdownBtn(item) {
      const { btnType, menuItems } = item;
      return btnType === "dropdown" && menuItems && menuItems.length;
    },

    // 操作批量操作
    handleMenuClick(ele) {
      console.log("操作批量操作=====>", ele);
      this.$emit("headerBtnOperation", {
        btnText: `批量操作-${ele.key}`,
      });
    },

    // 操作
    headerBtnOperation(item) {
      console.log("操作", item);
      this.$emit("headerBtnOperation", item);
    },
  },
};
</script>

<style lang="less" scoped>
.BLHeaderBtn {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}
</style>
