<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-20 16:13:32
 * @LastEditTime: 2024-09-24 14:24:27
 * @Description: 
-->
<script setup name="AddDepaModal">
import { defineEmits, defineExpose, reactive, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { addDepartment, editDepartment } from '../../api';

const emit = defineEmits(['success']);

const [Modal, modalApi] = useVbenModal({
  onConfirm: () => {
    handleSubmit();
  },
});

const ruleFormRef = ref();
const departmentId = ref();
const modalType = ref('create');

const ruleForm = reactive({
  fullName: '',
  isAddChild: false,
  parentId: '',
  remark: '',
});

const rules = reactive({
  fullName: [
    {
      message: '请输入部门名称',
      required: true,
      trigger: 'blur',
    },
  ],
  remark: [
    {
      message: '请输入部门描述',
      required: false,
      trigger: 'blur',
    },
  ],
});

// 更改等级
function changeRadio(ele) {
  ruleForm.parentId = ele ? departmentId.value : '';
}

// 提交
function handleSubmit() {
  ruleFormRef.value.validate(async (isValid) => {
    if (isValid) {
      const submitData = ruleForm;
      if (modalType.value === 'edit') {
        submitData.id = departmentId.value;
        const res = await editDepartment(submitData);
        res?.code === 200 && ElMessage.success('编辑成功');
        emit('success');
        modalApi.close();
      } else {
        submitData?.id && delete submitData.id;
        const res = await addDepartment(submitData);
        res?.code === 200 && ElMessage.success('新增成功');
        emit('success');
        modalApi.close();
      }
    }
  });
}

function echoForm(row = {}) {
  ruleForm.fullName = row?.fullName;
  ruleForm.parentId = row?.parentId;
  ruleForm.remark = row?.remark;
}

function handleOpen(options = {}) {
  const { row = {}, type } = options;
  modalType.value = type || 'create';
  departmentId.value = row?.id;
  echoForm(type === 'create' ? {} : row);

  modalApi.open();
}
defineExpose({
  handleOpen,
});
</script>

<template>
  <Modal
    :title="modalType === 'edit' ? '编辑部门' : '新建部门'"
    class="w-[500px]"
  >
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="120px"
      status-icon
    >
      <el-form-item
        v-if="departmentId && modalType === 'create'"
        label="部门层级"
        prop="isAddChild"
      >
        <el-radio-group v-model="ruleForm.isAddChild" @change="changeRadio">
          <el-radio :value="false">本级</el-radio>
          <el-radio :value="true">添加下级</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="部门名称" prop="fullName">
        <el-input
          clearable
          placeholder="请输入部门名称"
          v-model.trim="ruleForm.fullName"
        />
      </el-form-item>

      <el-form-item label="部门描述" prop="remark">
        <el-input
          :rows="2"
          clearable
          placeholder="请输入部门描述"
          type="textarea"
          v-model.trim="ruleForm.remark"
        />
      </el-form-item>
    </el-form>
  </Modal>
</template>
