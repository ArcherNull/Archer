<script lang="ts" setup name="DKHeaderSearch">
import type { EmptyProps } from 'element-plus';

import { computed, defineOptions, useAttrs } from 'vue';

import { $t } from '@vben/locales';

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
  <div class="DKHeaderSearch">{{ customizedAttrs.imageSize }}</div>
</template>
