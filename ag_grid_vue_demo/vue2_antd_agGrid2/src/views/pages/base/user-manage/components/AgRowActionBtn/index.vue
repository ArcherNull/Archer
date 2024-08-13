<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-02-03 11:03:58
 * @LastEditTime: 2024-05-02 17:07:22
 * @Description:
-->
<template>
  <div class="AgRowActionBtn" v-show="params.node.rowPinned !=='bottom'" @click.stop>
    <BLButton type="link" class="AgRowActionBtn-btn" @click="operation(params,'编辑')">编辑</BLButton>
    <BLButton
      type="link"
      class="AgRowActionBtn-btn"
      @click="operation(params, params.data.userState === 1 ? '禁用':'启用')"
    >{{ params.data.userState === 1 ? '禁用':'启用' }}</BLButton>
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
      console.log('params', params)
      const colId = params.colDef.colId

      if (colId) {
        console.log('colId=====>', colId)
        AgGridUtils.EventBus.$emit(colId, {
          btnText,
          params
        })
      } else {
        this.$message.warning('表格操作事件colId未绑定，请联系管理员')
      }

      this.$emit('button-click', 'Button clicked!') // 触发事件并传递数据
    }
  }
}
</script>

<style lang="less" scoped>
.AgRowActionBtn {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 6px;

  &-btn {
    padding: 0px;
  }
}
</style>
