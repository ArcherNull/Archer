<!--
 * @Author: Null
 * @Date: 2022-08-23 16:50:48
 * @Description: 侧边栏
-->
<template>
  <div class="AppAside">
    <!-- logo -->
    <Logo></Logo>
    <!-- 菜单 -->
    <Menu></Menu>
  </div>
</template>

<script>
import { customerAsyncComponent } from '@/plugins/component/index'

export default {
  name: 'AppAside',
  components: {
    Logo: customerAsyncComponent(() => import('./components/Logo.vue')),
    Menu: customerAsyncComponent(() => import('./components/Menu.vue'))
  },
  setup () {}
}
</script>

<style lang="scss" scoped>
</style>
