<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-03 11:57:04
 * @LastEditTime: 2024-07-07 17:49:07
 * @Description: 忘记密码
-->
<template>
  <a-modal
    class="RegisterForm"
    title="忘记密码"
    :visible="visible"
    :okButtonProps="{ htmlType: 'submit' }"
    :confirmLoading="submitLoading"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <a-form :form="form" class="user-layout-login">
      <a-form-item label="邮箱">
        <a-input
          size="large"
          v-decorator="['email', validatorRules.email]"
          type="text"
          placeholder="请输入邮箱"
          allowClear
        >
          <a-icon
            slot="prefix"
            type="mail"
            :style="{ color: 'rgba(0,0,0,.25)' }"
          />
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-input-search
          v-decorator="['verifyCode', validatorRules.verifyCode]"
          size="large"
          autocomplete="false"
          placeholder="请输入验证码"
          :maxLength="6"
          @search="getverifyCode"
        >
          <a-icon
            slot="prefix"
            type="lock"
            :style="{ color: 'rgba(0,0,0,.25)' }"
          />
          <a-button slot="enterButton" :diasbled="verifyCodeState.smsSendBtn">
            {{
              verifyCodeState.smsSendBtn
                ? `${verifyCodeState.time}s后重新发送`
                : "发送邮箱验证码"
            }}
          </a-button>
        </a-input-search>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { mapActions } from "vuex";
import { isEmail, isSixVifyCode } from "@/utils/validate.js";
import { resetPwdByEmail } from "@/api/index.js";

export default {
  name: "ForgetPwdDialog",
  props: {
    // 弹窗显示隐藏
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 提交loading
      submitLoading: false,
      form: this.$form.createForm(this, { name: "registerForm" }),
      validatorRules: {
        email: {
          rules: [
            { required: true, message: "请输入邮箱!" },
            { validator: isEmail },
          ],
        },
        verifyCode: {
          rules: [
            { required: true, message: "请输入验证码!" },
            { validator: isSixVifyCode },
          ],
        },
      },

      // 验证码数据状态
      verifyCodeState: {
        time: 60,
        timer: null,
        smsSendBtn: false,
      },
    };
  },
  methods: {
    ...mapActions("user", ["sendEMailCodeFun"]),

    // 取消
    handleCancel() {
      this.$emit("update:visible", false);
    },
    // 提交表单
    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.submitLoading = true;
          resetPwdByEmail(values)
            .then((res) => {
              if (res.code === 200) {
                this.$message.success(res?.message || "重置成功");
              }
            })
            .finally(() => {
              this.submitLoading = false;
            });
        }
      });
    },

    // 倒计时执行
    async countDownFun(formData) {
      const that = this;
      this.verifyCodeState.smsSendBtn = true;

      const resetInterval = (timer) => {
        clearInterval(timer);
        this.verifyCodeState.timer = null;
        this.verifyCodeState.time = 60;
        this.verifyCodeState.smsSendBtn = false;
      };

      const timer = this.verifyCodeState.timer;
      if (timer) {
        resetInterval(timer);
      } else {
        this.verifyCodeState.timer = setInterval(() => {
          if (that.verifyCodeState.time <= 0) {
            resetInterval(that.verifyCodeState.timer);
          }
          that.verifyCodeState.time--;
        }, 1000);
        const msg = await this.sendEMailCodeFun(formData);
        this.$message.success(msg);
        resetInterval(timer);
      }
    },

    // 获取验证码
    getverifyCode(ele) {
      console.log("获取验证码", ele);
      this.form.validateFields(["email"], async (err, values) => {
        if (!err) {
          console.log("校验表单成功", values);
          const formData = {
            email: values.email,
            codeType: "resetPwd",
          };
          console.log("formData", formData);
          this.countDownFun(formData);
        }
      });
    },
  },
};
</script>

<style lang="less" scoped></style>
