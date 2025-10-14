<!--
 * @Author: Null
 * @Date: 2022-08-25 08:53:09
 * @Description: 全局搜索
-->
<template>
  <div class="GlobalSearch">
    <MyTooltip content="全局搜索">
      <MyIconButton><Search></Search></MyIconButton>
    </MyTooltip>
  </div>
</template>

<script>
import { Search } from '@element-plus/icons-vue'

export default {
  name: 'GlobalSearch',
  components: {
    Search
  },
  setup () {}
}
</script>

<style lang="scss" scoped>
</style>
