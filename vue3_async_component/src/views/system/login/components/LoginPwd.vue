<!--
 * @Author: Null
 * @Date: 2022-10-25 09:37:08
 * @Description:
-->
<template>
  <div class="LoginPwd">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      class="LoginPwd-ruleForm"
      :size="$commJs.formSize"
      status-icon
    >
      <el-form-item prop="userName">
        <el-input
          v-model="ruleForm.userName"
          placeholder="请输入邮箱/账号/手机号"
          clearable
        >
          <template #prepend>
            <el-button :icon="User" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="ruleForm.password"
          show-password
          placeholder="请输入密码"
          clearable
          @keyup.enter.up="submitForm"
        >
          <template #prepend>
            <el-button :icon="Lock" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <div class="LoginPwd-forgetPwd">
          <div class="dk-text-btn">忘记密码？</div>
          <el-checkbox v-model="rememberPwd">记住密码</el-checkbox>
        </div>

        <el-button
          class="LoginPwd-submitBtn"
          type="primary"
          :loading="submitLoading"
          @click="submitForm"
        >
          登录
        </el-button>
        <div class="LoginPwd-extra">
          <div class="LoginPwd-extra__line">——</div>
          <div class="dk-text-btn">快速注册</div>
          <div class="LoginPwd-extra__line">——</div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { userUserInfoStore } from '@/store/system/user'

export default {
  name: 'LoginPwd',
  setup () {
    const userUserInfo = userUserInfoStore()
    const submitLoading = ref(false)
    const ruleFormRef = ref(null)
    const rememberPwd = ref(false)
    const ruleForm = ref({
      userName: '',
      password: ''
    })
    const rules = ref({
      userName: [
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
        { min: 4, max: 15, message: '密码长度应该在5·15之间', trigger: 'blur' }
      ]
    })
    const route = useRoute()
    const router = useRouter()
    const submitForm = async () => {
      console.log('提交表单')
      if (!ruleFormRef.value) return
      console.log('ruleFormRef', ruleFormRef.value)
      await ruleFormRef.value.validate((valid, fields) => {
        if (valid) {
          console.log('submit!', ruleForm.value)
          submitLoading.value = true
          userUserInfo.login(ruleForm.value).then(res => {
            console.log('res=====>', res)
            if (res) {
              router.push({
                path: route.query.redirect || '/index'
              })
            }
          })
            .finally(() => {
              submitLoading.value = false
            })
        } else {
          console.log('error submit!', fields)
        }
      })
    }
    return {
      ruleFormRef,
      ruleForm,
      rules,
      User,
      Lock,
      submitLoading,
      rememberPwd,
      submitForm
    }
  }
}
</script>

<style lang="scss" scoped>
.LoginPwd {
  // padding: 10px 16px;
  &-submitBtn {
    width: 100%;
  }
  &-forgetPwd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    width: 100%;
  }
  &-extra {
    margin-top: 16px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    &__line {
      color: #606266;
      margin: 0 6px;
    }
  }
}
</style>
