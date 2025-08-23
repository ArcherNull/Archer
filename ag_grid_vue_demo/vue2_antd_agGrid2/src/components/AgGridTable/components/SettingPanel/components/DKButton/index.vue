import { method } from 'lodash';
<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-30 16:11:55
 * @LastEditTime: 2024-06-05 09:24:11
 * @Description:
-->
<template>
  <a-button v-bind="customizedAttrs" v-if="hasPermission(customizedAttrs.power)" v-on="$listeners">
    <slot />
  </a-button>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DKButton',
  // 不希望组件的根元素继承特性
  inheritAttrs: false,

  computed: {
    ...mapGetters(['authButtonPermissionList', 'userInfo']),

    customizedAttrs() {
      const obj = {
        size: 'default',
        disabled: false
      }
      const data = Object.assign(obj, this.$attrs)
      return data
    }
  },
  methods: {
    hasPermission(power) {
      const userInfo = this.userInfo
      if (userInfo) {
        if (userInfo.realname === '管理员' && userInfo.username === 'admin') {
          return true
        } else {
          if (power) {
            const { pathname } = window.location
            if (pathname) {
              const powerKey = `${pathname}|${power}`
              return this.authButtonPermissionList.includes(powerKey)
            } else {
              return true
            }
          } else {
            return true
          }
        }
      } else {
        return false
      }
    }
  }
}
</script>
