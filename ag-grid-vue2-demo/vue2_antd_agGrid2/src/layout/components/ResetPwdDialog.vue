<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-03 11:57:04
 * @LastEditTime: 2024-07-17 00:01:57
 * @Description: 忘记密码
-->
<template>
  <BLModal
    class="RegisterForm"
    title="忘记密码"
    :visible="visible"
    :okButtonProps="{ htmlType: 'submit' }"
    :confirmLoading="submitLoading"
    width="500px"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <a-form :form="form" class="user-layout-login">
      <a-form-item label="原密码">
        <a-input-password
          size="large"
          v-decorator="['oldPwd', validatorRules.oldPwd]"
          type="password"
          placeholder="请输入原密码"
          allowClear
        >
          <a-icon
            slot="prefix"
            type="lock"
            :style="{ color: 'rgba(0,0,0,.25)' }"
          />
        </a-input-password>
      </a-form-item>

      <a-form-item label="新密码">
        <a-input-password
          size="large"
          v-decorator="['newPwd', validatorRules.newPwd]"
          type="password"
          placeholder="请输入新密码"
          allowClear
        >
          <a-icon
            slot="prefix"
            type="lock"
            :style="{ color: 'rgba(0,0,0,.25)' }"
          />
        </a-input-password>
      </a-form-item>

      <a-form-item label="确认原密码">
        <a-input-password
          size="large"
          v-decorator="['confirmNewPwd', validatorRules.confirmNewPwd]"
          placeholder="请输入确认原密码"
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
import { isPassword } from "@/utils/validate.js";
import { resetUserPwd } from "@/api/index.js";

export default {
  name: "ResetPwdDialog",
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
      form: this.$form.createForm(this, { name: "resetPwdForm" }),
      validatorRules: {
        oldPwd: {
          initialValue: "",
          rules: [
            { required: true, message: "请输入原密码!" },
            { validator: isPassword },
          ],
        },
        newPwd: {
          rules: [
            { required: true, message: "请输入新密码!" },
            { validator: isPassword },
          ],
        },
        confirmNewPwd: {
          rules: [
            { required: true, message: "请输入确认新密码!" },
            { validator: this.isConfirmPassword },
          ],
        },
      },
    };
  },
  methods: {
    // 确认密码
    isConfirmPassword(rule, value, callback) {
      let password = this.form.getFieldValue("newPwd");
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
      this.form.validateFields((err, values) => {
        if (!err) {
          this.submitLoading = true;
          console.log("values=====>", values);
          resetUserPwd(values)
            .then((res) => {
              if (res.code === 200) {
                this.$message.success(res?.message || "重置成功");
                this.handleCancel();
              }
            })
            .finally(() => {
              this.submitLoading = false;
            });
        }
      });
    },
  },
};
</script>

<style lang="less" scoped></style>
