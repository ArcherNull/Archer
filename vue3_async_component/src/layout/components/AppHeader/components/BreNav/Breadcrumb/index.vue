<!--
 * @Author: Null
 * @Date: 2022-08-24 17:14:29
 * @Description: 面包屑导航
-->
<template>
  <div class="Breadcrumb">
    <el-breadcrumb separator="/">
      <transition-group v-if="routerLevelList.length" name="breadcrumb" mode="out-in">
        <el-breadcrumb-item v-for="(item, index) in routerLevelList" :key="item.path">
          <div v-if="item.meta.title">
            <span v-if="item.redirect === 'index' || index == routerLevelList.length - 1" class="no-redirect">
              {{ item.meta.title }}
            </span>
            <router-link v-else :to="item.redirect || item.path">
              {{ item.meta.title }}
            </router-link>
          </div>
          <div v-else class="unknown-page-css">未知页面</div>
        </el-breadcrumb-item>
      </transition-group>
      <div v-else class="unknown-page-css">404</div>
    </el-breadcrumb>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/store/system/menu'

export default {
  name: 'Breadcrumb',
  setup () {
    const store = useMenuStore()
    // 面包屑导航列表
    const routerLevelList = ref([])
    // 路由
    const router = useRouter()

    watch(
      () => router.currentRoute.value,
      (currentRoute) => {
        // 要执行的方法
        console.log('监听路由=====>', currentRoute)
        routerLevelList.value = []
        store.setCurrentRoute(currentRoute.path)
        // 筛选出路由层级
        let matched = currentRoute.matched.filter(
          (item) => item.meta && item.meta.title && item.meta.breadcrumb !== false
        )

        // 将首页恒定固定在最前面
        const first = matched[0]
        if (first && first.name === 'index') {
          matched = [{ path: '/index', meta: { title: '首页' }}]
        }

        store.addTags({
          title: currentRoute?.meta?.title || '未知页面',
          name: currentRoute.path,
          path: currentRoute.path,
          cache: currentRoute?.meta?.cache || false
        })

        console.log('matched=====>', matched)
        routerLevelList.value = matched
      },
      { immediate: true, deep: true }
    )

    return {
      routerLevelList
    }
  }
}
</script>

<style lang="scss" scoped>
.Breadcrumb {
  cursor: pointer;
}

/* 面包屑动画样式 */
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}

.breadcrumb-enter,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-move {
  transition: all 0.5s;
}

.breadcrumb-leave-active {
  position: absolute;
}

.unknown-page-css {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}
</style>
