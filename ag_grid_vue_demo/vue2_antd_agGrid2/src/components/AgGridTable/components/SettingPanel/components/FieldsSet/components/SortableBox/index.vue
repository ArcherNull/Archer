<!--
 * @Author: Null
 * @Date: 2022-11-14 14:59:22
 * @Description: 筛选
-->
<template>
  <!-- 冻结列 -->
  <div
    title="可排序"
    :class="[sortable ? 'sortableLeft' : 'sortableNone', 'sortableBox']"
    @click.stop="clickFun(sortable)"
  >
    <a-icon type="sort-ascending" :class="[sortable ? 'sortable' : 'no-sortable']" />
  </div>
</template>

<script>
export default {
  name: 'SortableBox',
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
