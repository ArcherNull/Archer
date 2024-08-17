<!--
 * @Author: Null
 * @Date: 2022-08-24 17:17:14
 * @Description:
-->
<template>
  <div class="UserOperation" flex="main:right cross:center">
    <!-- 搜索 -->
    <GlobalSearch></GlobalSearch>
    <!-- 全屏 -->
    <FullScreen></FullScreen>
    <!-- 主题 -->
    <Theme></Theme>
    <!-- 消息 -->
    <Message></Message>
    <!-- 用户 -->
    <User></User>
    <!-- 设置 -->
    <Setting></Setting>
  </div>
</template>

<script>
import { customerAsyncComponent } from '@/plugins/component/index'

export default {
  name: 'UserOperation',
  components: {
    Setting: customerAsyncComponent(() => import('./components/Setting/index.vue')),
    FullScreen: customerAsyncComponent(() => import('./components/FullScreen/index.vue')),
    Message: customerAsyncComponent(() => import('./components/Message/index.vue')),
    User: customerAsyncComponent(() => import('./components/User/index.vue')),
    GlobalSearch: customerAsyncComponent(() => import('./components/GlobalSearch/index.vue')),
    Theme: customerAsyncComponent(() => import('./components/Theme/index.vue'))
  },
  setup () {}
}
</script>

<style lang="scss" scoped>
.UserOperation {
  height: 100%;
  div {
    height: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    height: inherit;
    aspect-ratio: 1/1;

    &:hover {
      background: rgb(246, 246, 246);
    }
  }
}
</style>
