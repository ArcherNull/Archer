<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-03 11:57:04
 * @LastEditTime: 2024-07-22 00:53:08
 * @Description: 忘记密码
-->
<template>
  <BLModal
    class="RegisterForm"
    :title="rowInfo && rowInfo.id ? '编辑字典' : '新增字典'"
    :visible="visible"
    :okButtonProps="{ htmlType: 'submit' }"
    :confirmLoading="submitLoading"
    width="500px"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <a-form :form="form" class="user-layout-login" layout="horizontal">
      <a-form-item label="字典label">
        <a-input
          v-decorator="[
            'dicLabel',
            {
              rules: [{ required: true, message: '请输入字典label' }],
            },
          ]"
          type="text"
          placeholder="请输入字典label"
          allowClear
        >
        </a-input>
      </a-form-item>

      <a-form-item label="字典value">
        <a-input
          v-decorator="[
            'dicValue',
            {
              rules: [{ required: true, message: '请输入字典value' }],
            },
          ]"
          type="text"
          placeholder="请输入字典value"
          allowClear
        >
        </a-input>
      </a-form-item>

      <a-form-item label="额外参数">
        <a-textarea
          placeholder="请输入额外参数"
          rows="3"
          :maxLength="120"
          v-decorator="['dicExtraParams']"
        />
      </a-form-item>

      <a-form-item label="备注">
        <a-textarea
          placeholder="请输入备注"
          rows="3"
          :maxLength="120"
          v-decorator="['dicRemark']"
        />
      </a-form-item>
    </a-form>
  </BLModal>
</template>

<script>
import { addDict, editDict } from "@/api/index.js";

export default {
  name: "ResetPwdDialog",
  props: {
    // 弹窗显示隐藏
    visible: {
      type: Boolean,
      default: false,
    },
    bindId: {
      type: Number | String,
      default: "",
    },
    // 行数据
    rowInfo: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      // 提交loading
      submitLoading: false,
      form: this.$form.createForm(this, { name: "resetPwdForm" }),
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initModal();
      }else{

      }
    },
  },
  methods: {
    initModal() {
      const rowInfo = this.rowInfo;
      const id = rowInfo?.id;
      if (id) {
        this.$nextTick(() => {
          this.form.setFieldsValue({
            dicLabel: rowInfo.dicLabel,
            dicValue: rowInfo.dicValue,
            dicExtraParams: rowInfo.dicExtraParams,
            dicRemark: rowInfo.dicRemark,
          });
        });
      }
    },
    // 取消
    handleCancel() {
      this.form.resetFields()
      this.$emit("update:visible", false);
    },
    // 提交表单
    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log("values=====>", values);
          const id = this.rowInfo?.id;

          if (this.bindId) {
            values.dicBindId = this.bindId;
          }
          
          if (id) {
            values.id = id;
            this.editDictFun(values);
          } else {
            this.addDictFun(values);
          }
        }
      });
    },
    // 新增
    addDictFun(values) {
      this.submitLoading = true;
      addDict(values)
        .then((res) => {
          if (res.code === 200) {
            this.$message.success(res?.message || "新增成功");
            this.handleCancel();
            this.$emit("success");
          }
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },

    // 编辑
    editDictFun(values) {
      this.submitLoading = true;
      editDict(values)
        .then((res) => {
          if (res.code === 200) {
            this.$message.success(res?.message || "编辑成功");
            this.handleCancel();
            this.$emit("success");
          }
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },
  },
};
</script>

<style lang="less" scoped></style>
