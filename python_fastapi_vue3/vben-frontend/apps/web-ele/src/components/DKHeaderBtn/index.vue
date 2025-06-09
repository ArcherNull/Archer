<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-15 13:51:51
 * @LastEditTime: 2024-09-15 15:23:04
 * @Description: 顶部按钮
-->
<script lang="ts" setup name="DKHeaderBtn">
import type { CusButtonProps } from '#/components/DKButton/index.vue';

import type { Reactive } from 'vue';
import { defineEmits, defineProps } from 'vue';

import DKButton from '#/components/DKButton/index.vue';

export type BtnConfigListType = CusButtonProps[];

interface Props {
  btnConfigList: Reactive<BtnConfigListType>;
}
defineProps<Props>();

const emit = defineEmits(['operation']);
</script>

<template>
  <div v-for="(item, index) in btnConfigList" :key="index" class="DKHeaderBtn">
    <DKButton v-bind="item" @click.stop="emit('operation', item)">
      {{ item.btnText }}
    </DKButton>
  </div>
</template>
