<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-28 14:33:42
 * @LastEditTime: 2024-09-28 15:10:06
 * @Description:
-->
<template>
  <n-result v-bind="customizedAttrs">
    <template #icon>
      <slot v-if="$slots.icon" name="icon" />
    </template>
    <template #default>
      <slot v-if="$slots.default" name="default" />
    </template>
    <template #footer>
      <slot v-if="$slots.footer" name="footer" />
    </template>
  </n-result>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

const descObj = {
  info: {
    title: '提示',
    description: '这是一个操作提示',
  },
  success: {
    title: '成功',
    description: '操作成功，请继续下一步操作',
  },
  warning: {
    title: '警告',
    description: '当前操作需要格外注意',
  },
  error: {
    title: '错误',
    description: '系统异常，请联系管理员',
  },
  404: {
    title: '404 Not Found',
    description: 'You know life is always ridiculous.',
  },
  403: {
    title: '403 Forbidden',
    description: 'Some of the doors are always close to you.',
  },
  500: {
    title: '500 Server Error',
    description: 'Server error may prove that you need hiring more developers',
  },
  418: {
    title: `418 I'm a Teapot`,
    description: `In Chinese, teapot is a kind of 'Beiju', which means 'tragedy'`,
  },
}

const customizedAttrs = computed(() => {
  const { status = 'info', ...restObj } = attrs
  const statusObj = descObj[status]
  const obj = {
    status, // 'info' | 'success' | 'warning' | 'error' | '404' | '403' | '500' | '418'
    size: 'medium', // 'small' | 'medium' | 'large' | 'huge'
    title: statusObj.title,
    description: statusObj.description,
  }

  const data = Object.assign(obj, restObj)
  return data
})
</script>
