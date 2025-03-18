<!--
 * @Author: Null
 * @Date: 2022-10-25 09:37:08
 * @Description:
-->
<template>
  <div class="LoginPhone">
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" class="LoginPhone-ruleForm" :size="$commJs.formSize" status-icon>
      <el-form-item prop="username">
        <el-input v-model="ruleForm.username" type="number" minlength="11" placeholder="请输入手机号" clearable>
          <template #prepend>
            <el-button :icon="Iphone" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="ruleForm.password" show-password clearable placeholder="请输入验证码" type="number" @keyup.enter.up="submitForm">
          <template #prepend>
            <el-button :icon="Message" />
          </template>
          <template #append>
            <el-button :loading="sendValCodeLoading" @click="sendValidateFun()">
              {{ sendValCodeText }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="LoginPhone-submitBtn" type="primary" :loading="submitLoading" @click="submitForm"> 登录 </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { Iphone, Message } from '@element-plus/icons-vue'

export default {
  name: 'LoginPhone',
  setup () {
    const times = 5
    const submitLoading = ref(false)
    const ruleFormRef = ref(null)
    const sendValCodeText = ref('发送验证码')
    const sendValCodeLoading = ref(false)
    const intervalTimes = ref(times)
    const intervalTimer = ref(null)

    const ruleForm = reactive({
      username: '',
      password: ''
    })
    const rules = reactive({
      username: [
        {
          required: true,
          message: '请输入手机号',
          trigger: 'blur'
        },
        {
          min: 11,
          max: 11,
          message: '手机号长度应为11位',
          trigger: 'blur'
        }
      ],
      password: [
        {
          required: true,
          message: '请输入验证码',
          trigger: 'blur'
        },
        {
          min: 5,
          max: 15,
          message: '验证码长度应该在5·15之间',
          trigger: 'blur'
        }
      ]
    })

    // 发送验证码
    const sendValidateFun = () => {
      console.log('发送验证码', intervalTimer.value)
      sendValCodeLoading.value = true
      if (intervalTimer.value) {
        return
      } else {
        sendValCodeText.value = `${intervalTimes.value}s后重发`
      }
      intervalTimer.value = setInterval(() => {
        if (intervalTimes.value > 1) {
          intervalTimes.value--
          sendValCodeText.value = `${intervalTimes.value}s后重发`
        } else {
          clearInterval(intervalTimer.value)
          intervalTimer.value = null
          intervalTimes.value = times
          sendValCodeLoading.value = false
          sendValCodeText.value = '发送验证码'
        }
      }, 1000)
    }

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
      ruleFormRef,
      ruleForm,
      rules,
      Iphone,
      Message,
      sendValCodeLoading,
      sendValCodeText,
      sendValidateFun,
      submitLoading,
      submitForm
    }
  }
}
</script>

<style lang="scss" scoped>
.LoginPhone {
  // padding: 10px 16px;
  &-submitBtn {
    margin-top: 32px;
    width: 100%;
  }
  &-forgetPwd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    width: 100%;
  }
}
</style>
