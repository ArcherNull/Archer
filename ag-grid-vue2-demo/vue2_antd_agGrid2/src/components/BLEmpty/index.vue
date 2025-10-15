<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-30 16:11:55
 * @LastEditTime: 2024-04-04 18:20:29
 * @Description:
-->
<template>
  <a-empty v-bind="customizedAttrs" v-on="$listeners">
    <slot />
  </a-empty>
</template>

<script>
export default {
  name: 'BLEmpty',
  // 不希望组件的根元素继承特性
  inheritAttrs: false,

  computed: {
    customizedAttrs () {
      const obj = {
        imageStyle: {
          height: '80px'
        }
      }
      const data = Object.assign(obj, this.$attrs)
      return data
    }
  }
}
</script>
