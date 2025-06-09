<script lang="ts" setup name="ResetPwd">
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, defineExpose, reactive, toRaw } from 'vue';

import { useVbenForm, useVbenModal, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { resetPwd } from '#/api/core/auth';
import { useAuthStore } from '#/store';

const authStore = useAuthStore();
const [Modal, modalApi] = useVbenModal({
  onConfirm: () => {
    handleSubmit();
  },
});

function handleOpen() {
  modalApi.open();
}

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('header.resetPwdDialog.oldPasswordPlac'),
      },
      fieldName: 'oldPassword',
      label: $t('header.resetPwdDialog.oldPassword'),
      rules: z
        .string()
        .min(1, { message: $t('header.resetPwdDialog.oldPasswordPlac') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('header.resetPwdDialog.newPasswordPlac'),
      },
      fieldName: 'newPassword',
      label: $t('header.resetPwdDialog.newPassword'),
      renderComponentContent() {
        return {
          strengthText: () => $t('header.resetPwdDialog.passwordStrength'),
        };
      },
      rules: z
        .string()
        .min(1, { message: $t('header.resetPwdDialog.newPasswordPlac') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('header.resetPwdDialog.confirmPasswordPlac'),
      },
      dependencies: {
        rules(values) {
          return z
            .string()
            .min(1, {
              message: $t('header.resetPwdDialog.confirmPasswordPlac'),
            })
            .refine((value) => value === values.newPassword, {
              message: $t('header.resetPwdDialog.confirmPasswordTip'),
            });
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirmPassword',
      label: $t('header.resetPwdDialog.confirmPassword'),
      rules: z
        .string()
        .min(1, { message: $t('header.resetPwdDialog.confirmPasswordPlac') }),
    },
  ];
});

const [Form, { validate }] = useVbenForm(
  reactive({
    commonConfig: {
      hideLabel: true,
      hideRequiredMark: true,
    },
    schema: formSchema,
    showDefaultActions: false,
  }),
);

async function handleSubmit() {
  const { valid, values } = await validate();
  if (valid) {
    const params = toRaw(values) as {
      newPassword: string;
      oldPassword: string;
    };
    const mForm = new FormData();
    mForm.append('newPassword', params.newPassword);
    mForm.append('oldPassword', params.oldPassword);
    await resetPwd(mForm);
    ElMessage.success($t('operatedSuccess'));

    setTimeout(async () => {
      authStore.logout(false);
    }, 1500);
  }
}

defineExpose({
  handleOpen,
});
</script>

<template>
  <div>
    <Modal :title="$t('header.resetPassword')" class="w-[400px]">
      <Form />
    </Modal>
  </div>
</template>
