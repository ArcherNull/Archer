<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-25 13:55:03
 * @LastEditTime: 2024-07-08 01:04:38
 * @Description: 
-->
<template>
  <BLModal
    class="RegisterForm"
    :title="rowInfo ? '编辑用户' : '新增用户'"
    :visible="visible"
    :okButtonProps="{ htmlType: 'submit' }"
    :confirmLoading="submitLoading"
    width="700px"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <a-form
      :form="form"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 12 }"
      class="user-layout-login"
    >
      <a-form-item label="用户名">
        <a-input
          v-decorator="['userName', validatorRules.userName]"
          type="text"
          placeholder="请输入用户名"
          allowClear
        >
          <a-icon slot="prefix" type="user" :style="defaultStyle" />
        </a-input>
      </a-form-item>

      <a-form-item label="手机号">
        <a-input
          v-decorator="['phoneNumber', validatorRules.phoneNumber]"
          type="text"
          placeholder="请输入手机号"
          :maxLength="11"
          allowClear
        >
          <a-icon slot="prefix" type="phone" :style="defaultStyle" />
        </a-input>
      </a-form-item>

      <a-form-item label="邮箱">
        <a-input
          v-decorator="['email', validatorRules.email]"
          type="text"
          placeholder="请输入邮箱"
          :maxLength="50"
          allowClear
        >
          <a-icon slot="prefix" type="mail" :style="defaultStyle" />
        </a-input>
      </a-form-item>

      <a-form-item label="用户角色">
        <a-select
          v-decorator="['userRole', validatorRules.userRole]"
          placeholder="请选择用户角色"
          allowClear
        >
          <a-select-option value="超级管理员"> 超级管理员 </a-select-option>
          <a-select-option value="管理员"> 管理员 </a-select-option>
          <a-select-option value="普通用户"> 普通用户 </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="用户图片">
        <a-input
          v-decorator="['userImg', validatorRules.userImg]"
          type="text"
          placeholder="请输入用户图片"
          allowClear
        >
        </a-input>
      </a-form-item>

      <a-form-item label="真实姓名">
        <a-input
          v-decorator="['realName', validatorRules.realName]"
          type="text"
          placeholder="请输入真实姓名"
          :maxLength="11"
          allowClear
        >
          <a-icon slot="prefix" type="user" :style="defaultStyle" />
        </a-input>
      </a-form-item>

      <a-form-item label="身份证号">
        <a-input
          v-decorator="['idCardNo', validatorRules.idCardNo]"
          type="text"
          placeholder="请输入身份证号"
          :maxLength="18"
          allowClear
        >
        </a-input>
      </a-form-item>

      <a-form-item label="性别">
        <a-radio-group v-decorator="['sex', validatorRules.sex]">
          <a-radio :value="1"> 男 </a-radio>
          <a-radio :value="0">女</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="生日">
        <a-date-picker
          v-decorator="['birthday']"
          placeholder="请选择您的生日"
        />
      </a-form-item>

      <a-form-item label="省市区">
        <BLRegion
          v-decorator="[`pcaRegion`]"
          regionType="pca"
          @change="pcaRegionChange"
        />
      </a-form-item>

      <a-form-item label="详细地址">
        <BLRegionAddress
          v-decorator="[`address`]"
          :location="locationCity"
          :style="{ width: '300px' }"
          :max-length="100"
          @mapMoveend="mapMoveendChange"
        />
      </a-form-item>

      <a-form-item label="用户状态">
        <a-radio-group v-decorator="['userState', validatorRules.userState]">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="备注">
        <a-textarea
          placeholder="请输入备注"
          rows="4"
          :maxLength="120"
          v-decorator="['remark']"
        />
      </a-form-item>
    </a-form>
  </BLModal>
</template>

<script>
import { isPhoneNumber, isEmail } from "@/utils/validate.js";
import { addUser, editUser } from "@/api/index.js";

export default {
  name: "AddUser",
  props: {
    // 弹窗显示隐藏
    visible: {
      type: Boolean,
      default: false,
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
      submitLoading: false,
      form: this.$form.createForm(this, { name: "AddUserForm" }),
      defaultStyle: { color: "rgba(0,0,0,.25)" },

      locationCity: "深圳",
      locationObj: {
        longitude: undefined,
        latitude: undefined,
      },
      validatorRules: {
        userName: {
          rules: [{ required: true, message: "请输入用户名!" }],
        },
        phoneNumber: {
          rules: [
            { required: true, message: "请输入手机号!" },
            { validator: isPhoneNumber },
          ],
        },
        userRole: {
          initialValue: "普通用户",
          rules: [{ required: true, message: "请选择用户角色!" }],
        },
        email: {
          rules: [
            { required: true, message: "请输入邮箱!" },
            { validator: isEmail },
          ],
        },
        realName: {
          rules: [{ required: false, message: "请输入真实姓名!" }],
        },
        idCardNo: {
          rules: [{ required: false, message: "请输入身份证号!" }],
        },
        sex: {
          initialValue: 0,
        },
        userState: {
          initialValue: 1,
          rules: [{ required: true, message: "请选择用户状态" }],
        },
      },
    };
  },
  beforeCreate() {},
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initModel();
      } else {
        this.form.resetFields();
      }
    },
  },
  methods: {
    initModel() {
      if (this.rowInfo?.id) {
        this.echoForm(this.rowInfo);
      }
    },

    // 回显表单
    echoForm(rowInfo) {
      console.log("回显表单");
      this.$nextTick(() => {
        let pcaRegion = [];

        if (rowInfo.provinceId && rowInfo.cityId && rowInfo.areaId) {
          pcaRegion = [rowInfo.provinceId, rowInfo.cityId, rowInfo.areaId];
        }
        this.form.setFieldsValue({
          userName: rowInfo.userName,
          phoneNumber: rowInfo.phoneNumber,
          email: rowInfo.email,
          userImg: rowInfo.userImg,
          realName: rowInfo.realName,
          idCardNo: rowInfo.idCardNo,
          pcaRegion,
          sex: rowInfo.sex,
          userState: rowInfo.userState,
          birthday: rowInfo.birthday,
          address: rowInfo.address,
          remark: rowInfo.remark,
        });
      });
    },

    handleCancel() {
      this.$emit("update:visible", false);
    },

    // 选择地址更改
    pcaRegionChange(ele) {
      console.log("选择地址更改", ele);
      if (ele && ele.length) {
        const startLocation = this.$region.getRegionCode(ele, "name");
        if (startLocation && startLocation.length) {
          const [city] = startLocation;
          const address = startLocation.join("");
          this.locationCity = city;
          this.$nextTick(() => {
            this.form.setFieldsValue({
              address,
            });
          });
        }
      } else {
        this.locationCity = "深圳";
        this.$nextTick(() => {
          this.form.setFieldsValue({
            address: "",
          });
        });
      }
    },

    // 地址更改
    dKRegionAddressChange(ele) {
      console.log("地址更改", ele);
      if (typeof ele === "string") {
        this.$nextTick(() => {
          this.form.setFieldsValue({
            address: ele,
          });
        });
      }
    },

    // 地址更改
    mapMoveendChange(ele) {
      console.log("地址更改", ele);
      if (typeof ele === "string") {
        this.$nextTick(() => {
          this.locationObj = {
            longitude: ele.lng,
            latitude: ele.lat,
          };
          this.form.setFieldsValue({
            address: ele.keyword,
          });
        });
      }
    },

    // 获取提交表单数据
    getSubmitData(values) {
      const { pcaRegion, ...restObj } = values;
      const data = {
        ...restObj,
        ...this.locationObj,
        registerFrom: 2,
      };
      const startLocation = this.$region.getRegionCode(pcaRegion, "name");
      if (startLocation && startLocation.length) {
        const [province, city, area] = startLocation;
        const [provinceId, cityId, areaId] = pcaRegion;
        data.province = province;
        data.city = city;
        data.area = area;
        data.provinceId = provinceId;
        data.cityId = cityId;
        data.areaId = areaId;
      }

      return data;
    },

    // 提交表单
    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log("校验表单成功", values);
          const submitData = this.getSubmitData(values);
          console.log("submitData====>", submitData);
          if (this.rowInfo?.id) {
            submitData.id = this.rowInfo.id;
            this.editUserFun(submitData);
          } else {
            this.addUserFun(submitData);
          }
        }
      });
    },

    // 编辑用户
    editUserFun(data) {
      this.submitLoading = true;
      editUser(data)
        .then((res) => {
          console.log("新增用户", res);
          if (res.code === 200) {
            this.$message.success("编辑成功");
            this.handleCancel();
            this.$emit("success");
          } else {
            this.$message.error(res?.message || "编辑失败");
          }
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },
    // 新增用户
    addUserFun(data) {
      this.submitLoading = true;
      addUser(data)
        .then((res) => {
          if (res.code === 200) {
            this.$message.success("新增成功");
            this.handleCancel();
            this.$emit("success");
          } else {
            this.$message.error(res?.message || "新增失败");
          }
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
