<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-02-03 11:03:58
 * @LastEditTime: 2024-05-29 11:30:20
 * @Description:
-->
<template>
  <div class="AgRowActionBtn" v-show="params.node.rowPinned !=='bottom'" @click.stop>
    <BLButton type="link" class="AgRowActionBtn-btn" @click="operation(params,'删除')">删除</BLButton>
  </div>
</template>

<script>
import { AgGridUtils } from '@/components/AgGridTable/common/agGrid-utils'

export default {
  name: 'AgRowActionBtn',

  methods: {
    // 设置线路
    operation(params, btnText) {
      const colId = params.colDef.colId
      if (colId) {
        AgGridUtils.EventBus.$emit(colId, {
          btnText,
          params
        })
      } else {
        this.$message.warning('表格操作事件colId未绑定，请联系管理员')
      }
    }
  }
}
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
