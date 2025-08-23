<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-02 10:11:34
 * @LastEditTime: 2024-09-04 11:47:33
 * @Description:
-->
<template>
  <!-- 冻结列 -->
  <div title="跳转到此列,跳转到视图之外的列有效" class="ColumnJumpBox" @click.stop="clickFun(item)">
    <a-icon type="arrow-right" />
  </div>
</template>

<script>
export default {
  name: 'ColumnJumpBox',
  props: {
    item: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  methods: {
    clickFun(ele) {
      console.log('点击', ele)
      this.$emit('clickFun', ele)
    }
  }
}
</script>

<style lang="less" scoped>
.ColumnJumpBox {
  cursor: pointer;
  box-sizing: border-box;
  font-size: 18px;
  color: #c0c0c0;

  &:hover {
    background: rgb(232, 244, 255);
  }
}
</style>
