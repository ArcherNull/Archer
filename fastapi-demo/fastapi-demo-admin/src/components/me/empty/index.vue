<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-04-16 19:53:08
 * @LastEditTime: 2025-04-16 19:56:01
 * @Description:
-->
<template>
  <n-empty v-bind="customizedAttrs">
    <template #icon>
      <slot v-if="$slots.icon" name="icon" />
      <div v-else-if="customizedAttrs.showIcon">
        <i class="i-fe:frown text-40" />
      </div>
    </template>
    <template #default>
      <slot v-if="$slots.default" name="default" />
      <div v-else-if="customizedAttrs.showDescription">
        {{ customizedAttrs.description }}
      </div>
    </template>
    <template #extra>
      <slot v-if="$slots.extra" name="extra" />
    </template>
  </n-empty>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

const customizedAttrs = computed(() => {
  const obj = {
    size: 'large', // 'tiny' | 'small' | 'medium' | 'large' | 'huge'
    showIcon: true,
    showDescription: true,
    description: '暂无数据',
  }
  const data = Object.assign(obj, attrs)
  return data
})
</script>
