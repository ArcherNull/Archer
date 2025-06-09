<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-15 16:09:02
 * @LastEditTime: 2025-01-03 14:09:24
 * @Description: 
-->
<script setup lang="ts" name="GridItem">
import type { BreakPoint, Responsive } from '../interface/index';

import type { Ref } from 'vue';
import { computed, inject, ref, useAttrs, watch } from 'vue';

type Props = {
  lg?: Responsive;
  md?: Responsive;
  offset?: number;
  show?: boolean | Function;
  sm?: Responsive;
  span?: number;
  suffix?: boolean;
  xl?: Responsive;
  xs?: Responsive;
};

const props = withDefaults(defineProps<Props>(), {
  lg: undefined,
  md: undefined,
  offset: 0,
  show: true,
  sm: undefined,
  span: 1,
  suffix: false,
  xl: undefined,
  xs: undefined,
});

const attrs = useAttrs() as { index: string };
const isShow = ref(props.show);

// 注入断点
const breakPoint = inject<Ref<BreakPoint>>('breakPoint', ref('xl'));
const shouldHiddenIndex = inject<Ref<number>>('shouldHiddenIndex', ref(-1));
watch(
  () => [shouldHiddenIndex.value, breakPoint.value],
  (n) => {
    if (attrs.index && props.show === true) {
      isShow.value = !(
        n[0] !== -1 && Number.parseInt(attrs.index) >= Number(n[0])
      );
    }
  },
  { immediate: true },
);

const gap = inject('gap', 0);
const cols = inject('cols', ref(4));
const style = computed(() => {
  const span = props[breakPoint.value]?.span ?? props.span;
  const offset = props[breakPoint.value]?.offset ?? props.offset;
  return props.suffix
    ? {
        gridColumnEnd: `span ${span + offset}`,
        gridColumnStart: cols.value - span - offset + 1,
        marginLeft:
          offset === 0
            ? 'unset'
            : `calc(((100% + ${gap}px) / ${span + offset}) * ${offset})`,
      }
    : {
        gridColumn: `span ${span + offset > cols.value ? cols.value : span + offset}/span ${
          span + offset > cols.value ? cols.value : span + offset
        }`,
        marginLeft:
          offset === 0
            ? 'unset'
            : `calc(((100% + ${gap}px) / ${span + offset}) * ${offset})`,
      };
});
</script>
<template>
  <div v-show="isShow" :style="style">
    <slot></slot>
  </div>
</template>
