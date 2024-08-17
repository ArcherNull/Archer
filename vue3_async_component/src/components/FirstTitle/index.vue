<!--
 * @Author: Null
 * @Date: 2022-09-05 11:20:04
 * @Description: 一级标题组件
-->
<template>
  <div class="FirstTitle">
    <div class="FirstTitle-title" flex>
      <div class="FirstTitle-title__bg"></div>
      <div class="FirstTitle-title__title">{{ title }}</div>
    </div>
    <div class="FirstTitle-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FirstTitle',
  props: {
    title: {
      type: String,
      require: true,
      default: '标题'
    }
  },
  setup () {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.FirstTitle {
  margin-bottom: 16px;
  &-title {
    margin-bottom: 10px;
    &__bg {
      background-color: #409eff;
      width: 6px;
      height: 18px;
      border-radius: 2px;
    }
    &__title {
      margin-left: 8px;
      font-size: 14px;
      color: #333;
      font-weight: bold;
    }
  }
}
</style>
