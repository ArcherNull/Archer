<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-05-27 19:18:18
 * @LastEditTime: 2025-06-02 13:51:55
 * @Description: 
-->
<script lang="tsx" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import { computed, markRaw, ref } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const authenticationLoginRef = ref(null)

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    authStore.showCaptcha ? {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'VbenInput',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入验证码',
        "aria-autocomplete":'off',
        autocomplete:'off',
      },
      // 字段名
      fieldName: 'code',
      suffix: () => <img src={authStore.captchaImg} alt="验证码" onClick={authStore.getCaptchaFun}></img>,
    } : {
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    }
  ];
});


authStore.getCaptchaFun()

</script>

<template>
  <AuthenticationLogin
    ref="authenticationLoginRef"
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    :showRegister="authStore.showRegister"
    @submit="authStore.authLogin"
  />
</template>
