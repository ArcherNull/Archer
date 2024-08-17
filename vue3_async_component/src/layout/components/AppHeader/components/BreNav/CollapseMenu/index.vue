<!--
 * @Author: Null
 * @Date: 2022-09-05 10:34:40
 * @Description: 折叠菜单
-->
<template>
  <MyIconButton @clickIcon="clickIcon">
    <component :is="isCollapseMenu ? 'Expand' : 'Fold'" />
  </MyIconButton>
</template>

<script>
import { Expand, Fold } from '@element-plus/icons-vue'

export default {
  name: 'CollapseMenu',
  components: {
    Expand,
    Fold
  },
  props: {
    // 是否折叠菜单栏
    isCollapseMenu: {
      type: Boolean,
      default: false
    }
  },
  setup (props, context) {
    const { isCollapseMenu } = props
    // 点击icon
    const clickIcon = () => {
      context.emit('onCollapseMenu', isCollapseMenu)
    }
    return {
      clickIcon
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
