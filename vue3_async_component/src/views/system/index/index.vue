<!--
 * @Author: Null
 * @Date: 2022-08-23 18:30:22
 * @Description: 首页
-->

<template>
  <div class="Index">
    <FirstTitle title="defer延迟加载组件,加载3000组件">
      <template #content>
        <div class="User-one">
          <MyCustomer v-for="item in maxCount" :key="item" :ind="item" v-if="!defer(item)"></MyCustomer>
        </div>
      </template>
    </FirstTitle>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDefer } from '@common/hooks/defer'

// 渲染组件的数量
const maxCount = ref(3000)
const defer = useDefer(maxCount.value)

</script>

<style lang="scss" scoped>
</style>
