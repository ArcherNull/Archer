<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-02 10:50:50
 * @LastEditTime: 2024-09-02 11:10:58
 * @Description:
-->
<template>
  <div
    title="可计算底部合计行"
    :class="[sortable ? 'sortableLeft' : 'sortableNone', 'sortableBox']"
    @click.stop="clickFun(sortable)"
  >
    <a-icon type="calculator" :class="[sortable ? 'sortable' : 'no-sortable']" />
  </div>
</template>

<script>
export default {
  name: 'CalculatorBox',
  model: {
    prop: 'sortable',
    event: 'update'
  },
  props: {
    sortable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    clickFun(ele) {
      console.log('点击', ele)
      this.$emit('change', ele)
    }
  }
}
</script>

<style lang="less" scoped>
.sortableBox {
  cursor: pointer;
  box-sizing: border-box;
  font-size: 18px;
  &:hover {
    background: rgb(232, 244, 255);
  }
}
.sortableLeft {
  // border: solid 1px #f00;
}

.sortableNone {
  // border: solid 1px #badeff;
}
.sortable {
  color: #f00;
}
.no-sortable {
  color: #c0c0c0;
}
</style>
