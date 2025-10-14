<template>
  <div class="DKContanier">
    <div v-if="title" class="DKContanier-title">
      <div class="DKContanier-title-left">
        <div
          v-if="titleBgColor"
          :style="{ backgroundColor: titleBgColor }"
          class="DKContanier-title-left-bg"
        />
        <div class="DKContanier-title-left-text">
          {{ title }}
        </div>
        <div class="DKContanier-title-left-sub">
          <slot name="subTitle" />
        </div>
      </div>
      <div class="DKContanier-title-right">
        <slot name="right" />
      </div>
    </div>

    <n-spin :show="contentStatus === 'loading'">
      <div class="DKContanier-content">
        <div v-if="contentStatus === 'empty'">
          <MeEmpty />
        </div>
        <div v-else-if="contentStatus === 'error'">
          <MeResult title="异常错误" :description="errMsg || '系统异常，请联系管理员'" />
        </div>
        <div
          v-else-if="contentStatus === 'success'"
          :class="`DKContanier-content-${classType} ${contentClass}`"
        >
          <slot />
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script setup name="MeContanier">
import MeEmpty from '../empty/index.vue'
import MeResult from '../result/index.vue'

defineProps({
  classType: {
    default: 'grid2',
    type: String,
  },
  contentClass: {
    default: '',
    type: String,
  },
  // 内容状态，success成功，loading加载中 , empty数据为空, error错误
  contentStatus: {
    default: 'success',
    type: String,
  },
  // contentStatus 为 error 时展示
  errMsg: {
    default: '',
    type: String,
  },

  title: {
    default: '',
    type: String,
  },
  titleBgColor: {
    default: '#006BE6',
    type: String,
  },
})
</script>

<style lang="scss" scoped>
.DKContanier {
  margin-bottom: 16px;

  &-title {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    height: 30px;

    &-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      &-bg {
        width: 5px;
        height: 14px;
        margin-right: 8px;
        border-radius: 2px;
      }

      &-text {
        font-size: 15px;
        font-weight: bold;
      }

      &-sub {
        margin-left: 16px;
        display: flex;
        align-items: center;
      }
    }
  }

  &-content {
    min-height: 150px;
    font-size: 14px;

    &-grid2,
    &-grid3,
    &-flex {
      padding: 10px 16px;
    }

    &-grid2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 10px;
    }

    &-grid3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      column-gap: 10px;
    }

    &-flex {
      display: flex;
      gap: 10px;
    }
  }
}
</style>
