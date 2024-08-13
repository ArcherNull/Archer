<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-02 20:41:31
 * @LastEditTime: 2024-07-25 00:18:48
 * @Description: 
-->
<template>
  <div class="login">
    <div class="login-form">
      <div class="login-form-title">AG-Grid管理系统</div>
      <div class="login-form-content">
        <a-form :form="form" class="user-layout-login">
          <a-tabs
            :activeKey="customActiveKey"
            :tabBarStyle="{
              borderBottom: 'unset',
              display: 'flex',
              justifyContent: 'center',
              userSelect: 'none',
            }"
            @change="handleTabClick"
          >
            <!-- 账号密码tab -->
            <a-tab-pane class="left" key="accountLogin" tab="账号密码登录">
              <div v-if="customActiveKey === 'accountLogin'">
                <a-form-item>
                  <a-input
                    size="large"
                    v-decorator="['userName', validatorRules.userName]"
                    type="text"
                    placeholder="请输入账号"
                    allowClear
                  >
                    <a-icon
                      slot="prefix"
                      type="user"
                      :style="{ color: 'rgba(0,0,0,.25)' }"
                    />
                  </a-input>
                </a-form-item>

                <a-form-item>
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

                <a-form-item>
                  <a-input
                    class="svgCaptcha"
                    size="large"
                    v-decorator="['captcha', validatorRules.captcha]"
                    type="text"
                    placeholder="请输入验证码"
                    allowClear
                  >
                    <a-icon
                      slot="prefix"
                      type="safety-certificate"
                      :style="{ color: 'rgba(0,0,0,.25)' }"
                    />
                    <span slot="addonAfter">
                      <span
                        id="svgCaptcha"
                        @click="getSendSvgCaptchaFun()"
                      ></span>
                    </span>
                  </a-input>
                </a-form-item>
              </div>
            </a-tab-pane>

            <!-- 邮箱登录tab -->
            <a-tab-pane class="left" key="emailLogin" tab="邮箱登录">
              <div v-if="customActiveKey === 'emailLogin'">
                <a-form-item>
                  <a-input
                    size="large"
                    v-decorator="['email', validatorRules.email]"
                    type="text"
                    placeholder="请输入邮箱"
                    :maxLength="35"
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
                    <a-button
                      slot="enterButton"
                      :diasbled="verifyCodeState.smsSendBtn"
                    >
                      {{
                        verifyCodeState.smsSendBtn
                          ? `${verifyCodeState.time}s后重新发送`
                          : "发送邮箱验证码"
                      }}
                    </a-button>
                  </a-input-search>
                </a-form-item>
              </div>
            </a-tab-pane>
          </a-tabs>

          <!-- 注册/忘记密码 -->
          <div class="login-form-registerAndForgetPwd">
            <a-button type="link" size="small" @click="forgetPwd()">
              忘记密码?
            </a-button>
            <a-button type="link" size="small" @click="register()">
              没有账号，去注册
            </a-button>
          </div>

          <a-form-item style="margin-top: 24px">
            <a-button
              size="large"
              type="primary"
              htmlType="submit"
              class="login-button"
              :loading="submitLoginLoading"
              @click.stop.prevent="submitAndLogin()"
              >确定</a-button
            >
          </a-form-item>
        </a-form>

        <!-- 版权信息 -->
        <div class="login-form-copyright">
          XXX-Admin ©2024 Created by
          <a href="https://juejin.cn/user/3633260177130872">@前端梭哈攻城狮</a>
        </div>
      </div>
    </div>

    <!-- 忘记密码 -->
    <ForgetPwdDialog :visible.sync="openForgetPwdDialog"></ForgetPwdDialog>

    <!-- 注册表单 -->
    <RegisterFormDialog
      :visible.sync="openRegisterFormDialog"
    ></RegisterFormDialog>
  </div>
</template>

<script>
import { mapActions } from "vuex";

import {
  isPhoneNumber,
  isNumberverifyCode,
  isPassword,
  isUserName,
  isEmail,
} from "@/utils/validate.js";

import { getSendSvgCaptcha } from "@/api/index";

import RegisterFormDialog from "./components/RegisterFormDialog.vue";
import ForgetPwdDialog from "./components/ForgetPwdDialog.vue";

export default {
  name: "LoginPage",
  components: {
    RegisterFormDialog,
    ForgetPwdDialog,
  },
  data() {
    return {
      // 选中的tab
      customActiveKey: "accountLogin",
      form: this.$form.createForm(this, { name: "blqcLoginForm" }),

      validatorRules: {
        userName: {
          initialValue: "",
          rules: [
            { required: true, message: "请输入用户名!" },
            { validator: isUserName },
          ],
        },
        password: {
          initialValue: "",
          rules: [
            { required: true, message: "请输入密码!", validator: "blur" },
            { validator: isPassword },
          ],
        },
        captcha: {
          initialValue: "",
          rules: [
            {
              required: true,
              message: "请输入图形验证码!",
              validator: "blur",
            },
          ],
        },
        phoneNumber: {
          rules: [
            { required: true, message: "请输入邮箱!" },
            { validator: isPhoneNumber },
          ],
        },
        email: {
          rules: [
            { required: true, message: "请输入邮箱!" },
            { validator: isEmail },
          ],
        },
        verifyCode: {
          rules: [
            { required: true, message: "请输入验证码!" },
            { validator: isNumberverifyCode },
          ],
        },
      },

      // 验证码数据状态
      verifyCodeState: {
        time: 60,
        timer: null,
        smsSendBtn: false,
      },

      // 提交登录loading
      submitLoginLoading: false,

      // 忘记密码
      openForgetPwdDialog: false,
      // 注册表单
      openRegisterFormDialog: false,

      svgCaptchaInfo: {
        img: "",
        uuid: "",
      },
    };
  },
  created() {
    this.getSendSvgCaptchaFun();
  },
  methods: {
    ...mapActions("user", ["login", "sendEMailCodeFun"]),

    // 登录tab切换
    handleTabClick(key) {
      this.customActiveKey = key;
      if (key === "accountLogin") {
        this.getSendSvgCaptchaFun();
      }
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
            codeType: "preLoginVerifyCode",
          };
          console.log("formData", formData);
          this.countDownFun(formData);
        }
      });
    },

    // 忘记密码
    forgetPwd() {
      console.log("忘记密码");
      this.openForgetPwdDialog = true;
    },

    // 没有账号，去注册
    register() {
      console.log("没有账号，去注册");
      this.openRegisterFormDialog = true;
    },

    // 获取图形验证码
    getSendSvgCaptchaFun() {
      getSendSvgCaptcha().then((res) => {
        console.log("getSendSvgCaptchaFun=====>", res);
        if (res.code === 200) {
          const resData = res?.data;
          this.svgCaptchaInfo = resData;

          const dom = document.getElementById("svgCaptcha");
          dom.innerHTML = resData.img;

          this.$nextTick(() => {
            this.form.setFieldsValue({
              captcha: resData.text,
            });
          });
        } else {
          this.$message.error(res?.message || "获取图形验证码失败");
        }
      });
    },

    // 提交表单
    submitAndLogin() {
      console.log("提交表单");
      const that = this;
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log("校验表单成功", values);
          this.submitLoginLoading = true;
          this.login(values)
            .then((token) => {
              if (token) {
                that.$router.push({
                  path: that.$route.query.redirect || "/index",
                });
              } else {
                this.$message.error("登录失败");
              }
            })
            .catch(() => {
              this.submitLoginLoading = false;
            })
            .finally(() => {
              this.submitLoginLoading = false;
            });
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login {
  position: relative;
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  // background-image: linear-gradient(120deg, #f6d365 0%, #fda085 100%);

  // background-image: radial-gradient(73% 147%, #EADFDF 59%, #ECE2DF 100%), radial-gradient(91% 146%, rgba(255, 255, 255, 0.50) 47%, rgba(0, 0, 0, 0.50) 100%);
  // background-blend-mode: screen;

  background-image: linear-gradient(to top, #e6b980 0%, #eacda3 100%);

  &-form {
    width: 460px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px 32px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 10px 2px rgba(0, 0, 0, 0.15);

    &-title {
      font-size: 24px;
      line-height: 48px;
      text-align: center;
      margin-bottom: 16px;
    }

    &-registerAndForgetPwd {
      display: flex;
      align-content: center;
      justify-content: space-between;
      flex-direction: row-reverse;
    }

    &-copyright {
      color: #999;
      width: 100%;
      margin-top: 10px;
      text-align: center;
    }
  }
}

.login-button {
  width: 100%;
}

::v-deep .svgCaptcha .ant-input-group-addon {
  padding: 0px !important;
  border: none !important;
  background-color: #fff;
}
</style>
