<!--
 * @Author: Null
 * @Date: 2022-08-24 16:02:24
 * @Description: 系统Logo
-->
<template>
  <div class="Logo" flex="main:center cross:center" @click="jumpToIndex">
    <img v-if="!store.isCollapseMenu" src="../../../../assets/logo.png" alt="logo" />
    <img v-else src="../../../../assets/vite.svg" alt="logo" />
  </div>
</template>
<script>
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/store/system/menu'
export default {
  name: 'Logo',
  setup () {
    const router = useRouter()
    const store = useMenuStore()
    const jumpToIndex = () => {
      router.push('/index')
    }
    return {
      store,
      jumpToIndex
    }
  }
}
</script>

<style lang="scss" scoped>
.Logo {
  height: 50px;
  width: 100%;
}
</style>
