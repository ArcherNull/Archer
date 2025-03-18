<!--
 * @Author: Null
 * @Date: 2022-10-26 17:11:29
 * @Description: 注册表单
-->
<template>
  <div class="RegisterForm">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      class="LoginPwd-ruleForm"
      :size="$commJs.formSize"
      status-icon
    >
      <el-form-item prop="username">
        <el-input v-model="ruleForm.username" clearable>
          <template #prepend>
            <el-button :icon="User" />
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="ruleForm.password"
          show-password
          clearable
          @keyup.enter.up="submitForm"
        >
          <template #prepend>
            <el-button :icon="Lock" />
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="ruleForm.password"
          show-password
          clearable
          @keyup.enter.up="submitForm"
        >
          <template #prepend>
            <el-button :icon="Lock" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          class="LoginPwd-submitBtn"
          type="primary"
          :loading="submitLoading"
          @click="submitForm"
        >
          注册
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
export default {
  name: 'RegisterForm',
  setup () {
    const submitLoading = ref(false)
    const ruleFormRef = ref(null)
    const ruleForm = reactive({
      username: '',
      password: ''
    })
    const rules = reactive({
      username: [
        {
          required: true,
          message: '请输入账号名称',
          trigger: 'blur'
        },
        {
          min: 5,
          max: 15,
          message: '账号名称长度应该在5·15之间',
          trigger: 'blur'
        }
      ],
      password: [
        {
          required: true,
          message: '请输入密码',
          trigger: 'blur'
        },
        { min: 5, max: 15, message: '密码长度应该在5·15之间', trigger: 'blur' }
      ]
    })

    const submitForm = async () => {
      console.log('提交表单')
      if (!ruleFormRef.value) return
      console.log('ruleFormRef', ruleFormRef.value)
      await ruleFormRef.value.validate((valid, fields) => {
        if (valid) {
          console.log('submit!', ruleForm.value)
        } else {
          console.log('error submit!', fields)
        }
      })
    }

    return {
      submitLoading,
      ruleFormRef,
      ruleForm,
      rules,

      submitForm
    }
  }
}
</script>
