<!--
 * @Author: Null
 * @Date: 2022-09-05 10:40:46
 * @Description: 面包屑导航
-->
<template>
  <div class="BreNav" flex="main:left cross:stretch">
    <div class="BreNav-left" flex="main:center cross:center">
      <CollapseMenu :is-collapse-menu="store.isCollapseMenu" @onCollapseMenu="collapseMenu"></CollapseMenu>
    </div>
    <div class="BreNav-right" flex="cross:center">
      <Breadcrumb></Breadcrumb>
    </div>
  </div>
</template>

<script>
import { customerAsyncComponent } from '@/plugins/component/index'
import { useMenuStore } from '@/store/system/menu'

export default {
  name: 'BreNav',
  components: {
    Breadcrumb: customerAsyncComponent(() => import('./Breadcrumb/index.vue')),
    CollapseMenu: customerAsyncComponent(() => import('./CollapseMenu/index.vue'))
  },
  setup () {
    const store = useMenuStore()
    const collapseMenu = () => {
      store.onIsCollapseMenu(!store.isCollapseMenu)
    }
    return {
      collapseMenu,
      store
    }
  }
}
</script>

<style lang="scss" scoped>
.BreNav {
  &-left {
    height: inherit;
    aspect-ratio: 1/1;

    &:hover {
      background: rgb(246, 246, 246);
    }
  }
}
</style>
