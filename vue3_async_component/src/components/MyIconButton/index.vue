<!--
 * @Author: Null
 * @Date: 2022-08-26 08:42:22
 * @Description: icon 按钮图标
-->

<template>
  <el-icon class="MyIconButton" :size="20" color="#f00" @click="clickIcon">
    <slot></slot>
  </el-icon>
</template>

<script>
export default {
  name: 'MyIconButton',
  setup (props, context) {
    // 点击icon
    const clickIcon = () => {
      context.emit('clickIcon')
    }
    return {
      clickIcon
    }
  }
}
</script>
