<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-02-03 11:03:58
 * @LastEditTime: 2024-07-20 23:32:58
 * @Description:
-->
<template>
  <div
    class="AgRowActionBtn"
    v-show="params.node.rowPinned !== 'bottom'"
    @click.stop
  >
    <BLButton
      type="link"
      class="AgRowActionBtn-btn"
      @click="operation(params, '编辑')"
      >编辑</BLButton
    >
    <BLButton
      type="link"
      class="AgRowActionBtn-btn"
      @click="operation(params, '设置')"
    >
      设置
    </BLButton>
    <BLButton
      type="link"
      class="AgRowActionBtn-btn"
      @click="operation(params, params.data.dicState === 1 ? '禁用' : '启用')"
      >{{ params.data.dicState === 1 ? "禁用" : "启用" }}</BLButton
    >
    <BLButton
      type="link"
      class="AgRowActionBtn-btn"
      @click="operation(params, '删除')"
      >删除</BLButton
    >
  </div>
</template>

<script>
import { AgGridUtils } from "@/components/AgGridTable/common/agGrid-utils";

export default {
  name: "AgRowActionBtn",

  methods: {
    // 设置线路
    operation(params, btnText) {
      console.log("params", params);
      const colId = params.colDef?.colId;
      console.log("colId=====>", colId);
      if (colId) {
        AgGridUtils.EventBus.$emit(colId, {
          btnText,
          params,
        });
      } else {
        this.$message.warning("表格操作事件colId未绑定，请联系管理员");
      }
    },
  },
};
</script>

<style lang="less" scoped>
.AgRowActionBtn {
  display: flex;
  gap: 6px;

  &-btn {
    padding: 0px;
  }
}
</style>
