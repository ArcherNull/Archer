<!--
 * @Author: Null
 * @Date: 2022-10-18 09:06:19
 * @Description:
-->
<template>
  <div class="Loading">
    <div
      v-if="loading"
      class="s-pull-loading-icon s-pull-loading-rotate"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.Loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 25px;
  height: inherit;
  width: 100%;
}

/* 旋转loading */
.s-pull-loading-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
  border-radius: 50%;
  border: 2px solid var(--el-color-primary);
  border-bottom-color: transparent;
  box-sizing: border-box;

  &:first-child {
    margin-right: px;
  }
}

/* 旋转动画 */
.s-pull-loading-rotate {
  animation: s-pull-loading-rotate 0.6s linear infinite;
}

@keyframes s-pull-loading-rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
