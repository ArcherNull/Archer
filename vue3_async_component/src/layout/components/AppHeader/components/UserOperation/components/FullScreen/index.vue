<!--
 * @Author: Null
 * @Date: 2022-08-25 08:51:22
 * @Description: 全屏
-->
<template>
  <div class="FullScreen">
    <MyTooltip content="全屏">
      <MyIconButton><FullScreenIcon></FullScreenIcon></MyIconButton>
    </MyTooltip>
  </div>
</template>

<script>
import { FullScreen as FullScreenIcon } from '@element-plus/icons-vue'

export default {
  name: 'FullScreen',
  components: {
    FullScreenIcon
  },
  setup () {}
}
</script>
