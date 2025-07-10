<!--
 * @Author: Null
 * @Date: 2022-08-26 15:52:29
 * @Description:
-->
<template>
  <div class="MyCustomer">测试组件：{{ ind }}</div>
</template>

<script>
export default {
  name: 'MyCustomer',
  props: {
    ind: {
      type: Number,
      default: 0
    }
  },
  setup() {
    const clickFun = () => {
      console.log('点击事件')
    }
    return {
      clickFun
    }
  }
}
</script>

<style lang="scss" scoped>
.MyCustomer {
  height: 100px;
  width: 100%;
  margin-bottom: 10px;
  border: solid 1px #f00;
}
</style>
