<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-15 11:09:41
 * @LastEditTime: 2024-09-15 13:48:00
 * @Description: 
-->
<script lang="ts" setup name="DKEmpty">
import type { EmptyProps } from 'element-plus';

import { computed, defineOptions, useAttrs } from 'vue';

import { $t } from '@vben/locales';

import { ElEmpty } from 'element-plus';

defineOptions({
  // 是否使得组件自动地继承 attribute
  inheritAttrs: false,
});

const attrs = useAttrs();

const customizedAttrs = computed(() => {
  const obj = {
    description: $t('system.noData'),
    imageSize: 60,
  } as EmptyProps;
  const data = Object.assign(obj, attrs);
  return data;
});
</script>

<template>
  <ElEmpty v-bind="customizedAttrs" />
</template>
