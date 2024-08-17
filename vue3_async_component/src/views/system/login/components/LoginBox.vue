<!--
 * @Author: Null
 * @Date: 2022-10-28 09:03:55
 * @Description: 登录
-->
<template>
  <div class="Login">
    <div class="Login-form">
      <el-tabs
        v-model="activeName"
        class="Login-form__tabs"
        @tab-click="handleClick"
      >
        <el-tab-pane label="账号密码登录" name="LoginPwd">
          <LoginPwd></LoginPwd>
        </el-tab-pane>
        <el-tab-pane label="手机号登录" name="LoginPhone">
          <LoginPhone></LoginPhone>
        </el-tab-pane>
        <!-- <el-tab-pane label="二维码登录" name="LoginQr">
            <LoginQr></LoginQr>
          </el-tab-pane> -->
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { customerAsyncComponent } from '@/plugins/component/index'
import { ref } from 'vue'

export default {
  name: 'LoginBox',
  components: {
    LoginPwd: customerAsyncComponent(() => import('./LoginPwd.vue')),
    LoginPhone: customerAsyncComponent(() => import('./LoginPhone.vue'))
    // LoginQr: customerAsyncComponent(() => import('./LoginQr.vue'))
  },
  setup () {
    const activeName = ref('LoginPwd')

    const handleClick = (tab, event) => {
      console.log(tab, event)
    }
    return {
      activeName,
      handleClick
    }
  }
}
</script>

  <style lang="scss" scoped>
.Login {
  &-form {
    width: 320px;
    aspect-ratio: 1/1;
    &__tabs {
      :deep(.el-tabs__nav-scroll) {
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>
