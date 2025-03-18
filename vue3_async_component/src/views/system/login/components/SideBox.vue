<!--
 * @Author: Null
 * @Date: 2022-10-28 09:13:18
 * @Description:
-->
<template>
  <div class="SideBox" flex="dir:top cross:stretch main:between">
    <div class="SideBox-header" flex="cross:center">
      <div class="SideBox-header__icon">
        <img src="../../../../assets/vite.svg" class="logo-css" />
      </div>
      <div class="SideBox-header__title">XXX管理后台</div>
    </div>
    <div class="SideBox-content" flex-box="1">
      Vite（法语意为 "快速的"，发音 /vit/，发音同
      "veet"）是一种新型前端构建工具，能够显著提升前端开发体验。它主要由两部分组成：
      一个开发服务器，它基于 原生 ES 模块 提供了
      丰富的内建功能，如速度快到惊人的 模块热更新（HMR）。 一套构建指令，它使用
      Rollup
      打包你的代码，并且它是预配置的，可输出用于生产环境的高度优化过的静态资源。
    </div>
    <div class="SideBox-footer" flex="main:center cross:center">
        <div class="dk-text-btn">join us</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideBox'
}
</script>

<style lang="scss" scoped>
.SideBox {
  height: 100%;
  padding: 64px 70px 48px;
  &-header {
    font-size: 24px;
    margin-bottom: 16px;
    &__icon {
      width: 55px;
      position: relative;
    }
  }
  &-content {
    border-top: solid 1px rgba(0,0,0,0.15);
    font-size: 14px;
    text-indent: 28px;
    line-height: 20px;
    padding: 10px;
    overflow-y: auto;
    max-height: 30vh;
  }
  &-footer{
    border-top: solid 1px rgba(0,0,0,0.15);
    margin-top: 16px;
    height: 32px;
  }
}
.logo-css {
  position: absolute;
  z-index: 1;
  width: 48px;
  height: 48px;
  top: -25px;
}
</style>
