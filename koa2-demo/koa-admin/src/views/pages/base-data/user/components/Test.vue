<!--
 * @Author: Null
 * @Date: 2022-10-13 08:51:23
 * @Description: 测试组件
-->
<template>
    <div class="Test">
        {{ title }}
    </div>
</template>

<script>
import { ref } from 'vue'
export default {
  name: 'Test',
  setup () {
    const title = ref('测试组件')
    return {
      title
    }
  }

}
</script>

<style lang="scss" scoped>
.Test{
    width: 100%;
    height: 50vh;
}
</style>
