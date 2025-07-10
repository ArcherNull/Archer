<!--
 * @Author: Null
 * @Date: 2022-08-23 16:50:52
 * @Description:
-->
<template>
  <div class="AppHeader">
    <div class="AppHeader-top" flex="main:justify cross:stretch">
      <div class="AppHeader-top__left" flex="cross:stretch"><BreNav></BreNav></div>
      <div class="AppHeader-top__right" flex="cross:center"><UserOperation></UserOperation></div>
    </div>
    <div class="AppHeader-bottom">
      <TagViews></TagViews>
    </div>
  </div>
</template>

<script>
import { customerAsyncComponent } from '@/plugins/component/index'

export default {
  name: 'AppHeader',
  components: {
    BreNav: customerAsyncComponent(() =>
      import('./components/BreNav/index.vue')
    ),
    UserOperation: customerAsyncComponent(() =>
      import('./components/UserOperation/index.vue')
    ),
    TagViews: customerAsyncComponent(() =>
      import('./components/TagViews/index.vue')
    )
  },
  setup () {}
}
</script>

<style lang="scss" scoped>
.AppHeader {
  width: 100%;
  &-top {
    height: 40px;
  }
}
</style>
