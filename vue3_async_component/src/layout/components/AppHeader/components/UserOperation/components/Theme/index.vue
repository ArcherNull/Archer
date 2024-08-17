<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-22 14:18:45
 * @LastEditTime: 2024-08-17 10:11:52
 * @Description:
-->
<template>
  <div class="Setting">
    <!-- <MyTooltip content="主题">
      <button class="border-none w-full bg-transparent cursor-pointer" style="height: var(--el-menu-item-height)" @click="toggleDark()">
        <i inline-flex i="dark:el-moon el-sunny" />
      </button>
    </MyTooltip> -->

    <MyTooltip content="主题" @click="toggleDark()">
      <MyIconButton><Moon></Moon></MyIconButton>
    </MyTooltip>
  </div>
</template>

<script>
// Sunny
import { Moon } from '@element-plus/icons-vue'
import { useDark, useToggle } from '@vueuse/core'

export default {
  name: 'Theme',
  components: {
    Moon
    // Sunny
  },
  setup () {
    const isDark = useDark()
    console.log('isDark123123123', isDark)

    const toggleDark = useToggle(isDark)

    return {
      toggleDark
    }
  }
}
</script>
