<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-30 16:11:55
 * @LastEditTime: 2024-04-04 18:20:45
 * @Description:
-->
<template>
  <a-button v-bind="customizedAttrs" v-on="$listeners">
    <slot />
  </a-button>
</template>

<script>
export default {
  name: 'BLButton',
  // 不希望组件的根元素继承特性
  inheritAttrs: false,

  computed: {
    customizedAttrs () {
      const obj = {
        size: 'default'
      }
      const data = Object.assign(obj, this.$attrs)
      return data
    }
  }
}
</script>
