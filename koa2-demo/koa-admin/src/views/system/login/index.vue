<!--
 * @Author: Null
 * @Date: 2022-08-24 11:04:53
 * @Description: 首页
-->
<template>
  <div class="Index">
    <div class="Index-container">
      <div class="Index-container-top" flex="cross:stretch">
        <div class="Index-container-top__left" flex="cross:center">
          <SideBox></SideBox>
        </div>
        <div
          class="Index-container-top__right"
          flex="main:center cross:stretch dir:top"
        >
          <div class="Index-container-top__right-title">登录</div>
          <div class="Index-container-top__right-form" flex="main:center">
            <LoginBox></LoginBox>
          </div>
        </div>
      </div>

      <div class="Index-container-footer">
        Copyright ©2022 Admin Projects 开源组织出品 <a href="https://juejin.cn/user/3633260177130872">@前端梭哈攻城狮</a>
      </div>
    </div>
  </div>
</template>

<script>
import { customerAsyncComponent } from '@/plugins/component/index'

export default {
  name: 'Login',
  components: {
    LoginBox: customerAsyncComponent(() => import('./components/LoginBox.vue')),
    SideBox: customerAsyncComponent(() => import('./components/SideBox.vue'))
  },
  setup () {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.Index {
  width: 100%;
  height: 100vh;
  // background: #1d976c; /* fallback for old browsers */
  // background: -webkit-linear-gradient(
  //   to right,
  //   #93f9b9,
  //   #1d976c
  // ); /* Chrome 10-25, Safari 5.1-6 */
  // background: linear-gradient(
  //   to right,
  //   #93f9b9,
  //   #1d976c
  // ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  &-container {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    transform: translate(-50%, -50%);

    &-top {
      background: #fff;
      box-shadow: 0px 20px 80px 0px rgb(0 0 0 / 30%);
      &__left {
        width: 460px;
        border-right: solid 1px rgba(0, 0, 0, 0.15);
      }

      &__right {
        width: 460px;
        padding: 64px 70px 48px;

        &-title {
          font-size: 24px;
          margin-bottom: 16px;
        }
      }
    }
    &-footer {
      margin-top: 50px;
      font-size: 12px;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
      color: #999;
    }
  }
}
</style>
