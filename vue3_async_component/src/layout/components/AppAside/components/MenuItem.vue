<!--
 * @Author: Null
 * @Date: 2022-09-05 08:31:13
 * @Description: 菜单项
-->
<template>
  <div v-if="route.meta && !route.hidden" class="MenuItem">
    <!-- 没有下级，可点击跳转的路由， 可接受外链或者页面路由 -->
    <template v-if="!route.children">
      <el-menu-item :index="route.path">
        <el-icon>
          <component :is="route.meta.icon || 'Document'" />
        </el-icon>
        <template #title>{{ route.meta.title }}</template>
      </el-menu-item>
    </template>

    <el-sub-menu v-else :index="route.path">
      <template #title>
        <el-icon>
          <component :is="route.meta.icon || 'IconMenu'" />
        </el-icon>
        <span>{{ route.meta.title }}</span>
      </template>

      <MenuItem v-for="(child, index) in route.children" :key="child.path + index" :route="child" :default-active="defaultActive" :default-id="defaultId" :base-path="child.path" />
    </el-sub-menu>
  </div>
</template>

<script>
import { Document, Menu as IconMenu, Location, Setting } from '@element-plus/icons-vue'

export default {
  name: 'MenuItem',
  components: {
    Document,
    IconMenu,
    Location,
    Setting
  },
  props: {
    // 路由，必传
    route: {
      type: Object,
      default: () => {},
      require: true
    },
    defaultActive: {
      type: String,
      default: ''
    },
    defaultId: {
      type: String,
      default: ''
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      menuIcon: 'Document'
    }
  }
}
</script>

<style lang="scss">
/*隐藏文字*/
.el-menu--collapse .el-sub-menu__title span {
  display: none;
}

/*隐藏 > */
.el-menu--collapse .el-sub-menu__title .el-sub-menu__icon-arrow {
  display: none;
}
</style>
