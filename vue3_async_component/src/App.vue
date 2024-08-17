<!--
 * @Author: Null
 * @Date: 2022-08-23 15:09:28
 * @Description:
-->
<template>
  <el-config-provider :locale="locale">
    <router-view></router-view>
  </el-config-provider>
</template>

<script>
import { ElConfigProvider } from 'element-plus'

// 中文
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// 英文
// eslint-disable-next-line no-unused-vars
import en from 'element-plus/es/locale/lang/en'

export default {
  name: 'App',
  components: {
    ElConfigProvider
  },

  setup () {
    return {
      locale: zhCn
    }
  }
}
</script>

<style>
#app {
  color: var(--el-text-color-primary);
}

/* .main-container {
  height: calc(100vh - var(--el-menu-item-height) - 3px);
} */
</style>
