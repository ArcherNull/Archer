<!--
 * @Author: Null
 * @Date: 2022-08-23 15:45:38
 * @Description: 布局组件
-->
<template>
  <div class="Layout">
    <el-container class="Layout-container">
      <el-aside class="Layout-container__aside" :width="store.isCollapseMenu ? '63px' : '280px'">
        <AppAside></AppAside>
      </el-aside>
      <el-container class="Layout-container__right">
        <el-header height="80px" class="Layout-container__right-header" flex="cross:stretch">
          <AppHeader></AppHeader>
        </el-header>
        <el-main class="Layout-container__right-main">
          <div class="AppMain">
            <el-scrollbar class="AppMain-scrollbar">
              <router-view v-if="isRouterAlive" v-slot="{ Component }">
                <keep-alive v-if="$route.meta.keepAlive" :max="10">
                  <component :is="Component" v-if="$route.meta.keepAlive" :key="$route.path" />
                </keep-alive>
                <component :is="Component" v-else />
              </router-view>
            </el-scrollbar>
            <!-- <el-backtop
              target=".AppMain-scrollbar"
              :right="100"
              :bottom="100"
            /> -->
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { customerAsyncComponent } from '@/plugins/component/index'
import { ref, nextTick, provide } from 'vue'
import { useMenuStore } from '@/store/system/menu'

export default {
  name: 'Layout',
  components: {
    AppAside: customerAsyncComponent(() =>
      import('./components/AppAside/index.vue')
    ),
    AppHeader: customerAsyncComponent(() =>
      import('./components/AppHeader/index.vue')
    )
  },
  setup () {
    const store = useMenuStore()
    // 是否刷新
    const isRouterAlive = ref(true)

    const reload = () => {
      console.log('点击刷新')
      isRouterAlive.value = false
      nextTick(() => {
        isRouterAlive.value = true
      })
    }
    provide('reload', reload)

    return {
      store,
      isRouterAlive,
      reload
    }
  }
}
</script>

<style lang="scss" scoped>
.Layout {
  height: 100%;

  &-container {
    &__aside {
      border-right: solid 1px var(--el-border-color);
      box-sizing: border-box;
    }

    &__right {
      &-header {
        padding: 0px;
      }

      &-main {
        height: 100%;
        padding: 10px;

        .AppMain {
          height: calc(100vh - 100px);

          &-scrollbar {
            height: 100%;
          }
        }
      }
    }
  }
}
</style>

