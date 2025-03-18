<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-03 11:53:55
 * @LastEditTime: 2024-07-27 10:21:07
 * @Description: 注册表单
-->
<template>
  <BLModal
    class="RegisterForm"
    title="注册"
    :visible="visible"
    :okButtonProps="{ htmlType: 'submit' }"
    :confirmLoading="submitLoading"
    width="500px"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <a-form :form="form" class="user-layout-login">
      <a-form-item label="用户名">
        <a-input
          size="large"
          v-decorator="['userName', validatorRules.userName]"
          type="text"
          placeholder="请输入用户名"
          allowClear
        >
          <a-icon
            slot="prefix"
            type="user"
            :style="{ color: 'rgba(0,0,0,.25)' }"
          />
        </a-input>
      </a-form-item>

      <a-form-item label="手机号">
        <a-input
          size="large"
          v-decorator="['phoneNumber', validatorRules.phoneNumber]"
          type="text"
          placeholder="请输入手机号"
          :maxLength="11"
          allowClear
        >
          <a-icon
            slot="prefix"
            type="phone"
            :style="{ color: 'rgba(0,0,0,.25)' }"
          />
        </a-input>
      </a-form-item>

      <a-form-item label="邮箱">
        <a-input
          size="large"
          v-decorator="['email', validatorRules.email]"
          type="text"
          placeholder="请输入邮箱"
          :maxLength="50"
          allowClear
        >
          <a-icon
            slot="prefix"
            type="mail"
            :style="{ color: 'rgba(0,0,0,.25)' }"
          />
        </a-input>
      </a-form-item>

      <a-form-item label="密码">
        <a-input-password
          v-decorator="['password', validatorRules.password]"
          size="large"
          type="password"
          autocomplete="false"
          placeholder="请输入密码"
          allowClear
        >
          <a-icon
            slot="prefix"
            type="lock"
            :style="{ color: 'rgba(0,0,0,.25)' }"
          />
        </a-input-password>
      </a-form-item>

      <a-form-item label="确认密码">
        <a-input-password
          v-decorator="['confirmPassword', validatorRules.confirmPassword]"
          size="large"
          type="password"
          autocomplete="false"
          placeholder="请输入确认密码"
          allowClear
        >
          <a-icon
            slot="prefix"
            type="lock"
            :style="{ color: 'rgba(0,0,0,.25)' }"
          />
        </a-input-password>
      </a-form-item>
    </a-form>
  </BLModal>
</template>

<script>
import {
  isPhoneNumber,
  isEmail,
  isPassword,
  isUserName,
} from "@/utils/validate.js";
import { register } from "@/api/index.js";

export default {
  name: "RegisterFormDialog",
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
        userName: {
          rules: [
            { required: true, message: "请输入用户名!" },
            { validator: isUserName },
          ],
        },
        password: {
          rules: [
            { required: true, message: "请输入密码!" },
            { validator: isPassword },
          ],
        },
        confirmPassword: {
          rules: [
            { required: true, message: "请输入确认密码!" },
            { validator: this.isConfirmPassword },
          ],
        },
        phoneNumber: {
          rules: [
            { required: true, message: "请输入手机号!" },
            { validator: isPhoneNumber },
          ],
        },
        email: {
          rules: [
            { required: true, message: "请输入邮箱!" },
            { validator: isEmail },
          ],
        },
      },
    };
  },
  methods: {
    // 确认密码
    isConfirmPassword(rule, value, callback) {
      let password = this.form.getFieldValue("password");
      if (value === undefined) {
        callback(new Error("请输入确认密码"));
        return;
      }
      if (value && password && value.trim() !== password.trim()) {
        callback(new Error("两次密码不一致"));
        return;
      }
      callback();
    },

    // 取消
    handleCancel() {
      this.$emit("update:visible", false);
    },

    // 提交表单
    handleSubmit() {
      console.log("提交表单");
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log("校验表单成功", values);
          register(values).then((res) => {
            console.log("注册表单", res);
            if (res.code === 200) {
              this.$message.success("注册成功");
              this.handleCancel();
            } else {
              this.$message.error(res.message || "注册失败");
            }
          });
        }
      });
    },
  },
};
</script>

<style lang="less" scoped></style>
