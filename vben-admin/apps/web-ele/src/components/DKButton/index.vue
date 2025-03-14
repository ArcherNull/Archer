<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-15 11:08:41
 * @LastEditTime: 2025-02-22 11:38:17
 * @Description: 二次封装的el-button
-->

<script lang="ts" setup name="DKButton">
import type { ButtonProps } from 'element-plus';

// import type { PropType } from 'vue';
import { computed, defineExpose, defineOptions, ref, useAttrs } from 'vue';

import { ElButton } from 'element-plus';

import { getPowerPath, hasPermission } from '#/comm/permission';

export interface CusButtonProps extends Partial<ButtonProps> {
  power?: string;
  btnText?: string;
}

defineOptions({
  // 是否使得组件自动地继承 attribute
  inheritAttrs: false,
});
const attrs = useAttrs() as ButtonProps;
const buttonRef = ref<InstanceType<typeof ElButton>>();

const customizedAttrs = computed(() => {
  const obj = {
    disabled: false,
    size: 'default',
    type: 'primary',
  } as CusButtonProps;
  const data = Object.assign(obj, attrs);
  return data;
});

defineExpose({ element: buttonRef });
</script>

<template>
  <ElButton
    ref="buttonRef"
    v-bind="customizedAttrs"
    v-if="hasPermission(customizedAttrs.power)"
    :data-power="getPowerPath(customizedAttrs.power)"
  >
    <slot>{{ customizedAttrs.btnText }}</slot>
  </ElButton>
</template>
