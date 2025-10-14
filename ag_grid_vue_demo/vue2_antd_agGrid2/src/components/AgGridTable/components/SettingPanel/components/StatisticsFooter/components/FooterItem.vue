<!--
 * @Author: Null
 * @Date: 2022-11-30 08:34:24
 * @Description:
-->
<template>
  <span class="FooterItem" :title="labelItem.title" :style="{ color: labelItem.color }" @click="clickFun(labelItem)">
    <span class="FooterItem-content">{{ labelItem.content || 0 }}</span>
  </span>
</template>

<script>
export default {
  name: 'FooterItem',
  props: {
    labelItem: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  methods: {
    // 点击事件
    clickFun(item) {
      console.log('点击事件', item)
      this.$emit('clickFun', item)
    }
  }
}
</script>

<style lang="less" scoped>
.FooterItem {
  font-size: 13px;
  display: flex;
  &-content {
    font-weight: bold;
    cursor: pointer;
    &:hover {
      background-color: rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
