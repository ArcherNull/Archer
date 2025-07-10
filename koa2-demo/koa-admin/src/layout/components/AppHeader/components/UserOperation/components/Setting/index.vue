<!--
 * @Author: Null
 * @Date: 2022-08-25 08:50:48
 * @Description: 设置
-->
<template>
  <div class="Setting">
    <MyTooltip content="设置">
      <MyIconButton><SettingIcon></SettingIcon></MyIconButton>
    </MyTooltip>
  </div>
</template>

<script>
import { Setting as SettingIcon } from '@element-plus/icons-vue'

export default {
  name: 'Setting',
  components: {
    SettingIcon
  },
  setup () {}
}
</script>

<style lang="scss" scoped>
</style>
