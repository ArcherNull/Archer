<!--
 * @Author: Null
 * @Date: 2022-08-25 08:55:43
 * @Description: 消息通知
-->
<template>
  <div class="Message">
    <MyTooltip content="消息盒子" @click="openMessage">
      <MyIconButton><MessageBox></MessageBox></MyIconButton>
    </MyTooltip>
  </div>
</template>

<script>
import { MessageBox } from '@element-plus/icons-vue'

export default {
  name: 'Message',
  components: {
    MessageBox
  },
  setup () {
    // 打开盒子
    const openMessage = () => {
      console.log('打开盒子')
    }

    return {
      openMessage
    }
  }
}
</script>

<style lang="scss" scoped>
.Message {
  // height: inherit;
}
</style>
