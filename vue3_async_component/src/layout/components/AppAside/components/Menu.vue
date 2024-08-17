<!--
 * @Author: Null
 * @Date: 2022-08-24 16:02:37
 * @Description: 菜单栏
-->
<template>
  <div class="Menu">
    <el-scrollbar wrap-class="Menu-scrollbar">
      <el-menu
        :default-active="store.currentRoute"
        class="Menu-container"
        :collapse="store.isCollapseMenu"
        :unique-opened="false"
        :router="true"
        :collapse-transition="false"
        @open="handleOpen"
        @close="handleClose"
      >
        <MenuItem
          v-for="route in menuList"
          :key="route.path"
          :index="route.path"
          :route="route"
          :base-path="route.path"
          :default-active="store.currentRoute"
          :default-id="store.currentRoute"
        >
        </MenuItem>
      </el-menu>
    </el-scrollbar>
  </div>
</template>
<script>
import { ref, reactive } from 'vue'
import MenuItem from './MenuItem.vue'
import { useMenuStore } from '@/store/system/menu'

import frameInRoutes from '@/router/routers'

export default {
  name: 'Menu',
  components: {
    MenuItem
  },
  setup () {
    const store = useMenuStore()
    // 声明菜单栏对象
    const menuList = reactive(frameInRoutes)
    // 当前选中的菜单
    const currentMenu = ref('/index')
    // id
    const activeId = ref('123')

    const handleOpen = (key, keyPath) => {
      console.log(key, keyPath)
    }
    const handleClose = (key, keyPath) => {
      console.log(key, keyPath)
    }

    return {
      store,
      handleOpen,
      handleClose,
      menuList,
      currentMenu,
      activeId
    }
  }
}
</script>

<style lang="scss" scoped>
.Menu {
  height: calc(100vh - 50px);
  &-container{
    border-right: none;
  }
}
</style>
