(this["webpackJsonp"]=this["webpackJsonp"]||[]).push([["chunk-6a5d2c15"],{"35bb":function(e,t,o){"use strict";o.r(t);var r=function(){var e=this,t=e._self._c;return t("div",{staticClass:"page-login--form"},[t("el-card",{attrs:{shadow:"never"}},[t("el-form",{ref:"loginForm",attrs:{"label-position":"top",rules:e.rules,model:e.loginForm,size:"default"}},[t("el-form-item",{attrs:{prop:"phoneNumber"}},[t("el-input",{attrs:{type:"text",placeholder:"用户名",name:"phoneNumber",clearable:"","auto-complete":"on"},model:{value:e.loginForm.phoneNumber,callback:function(t){e.$set(e.loginForm,"phoneNumber",t)},expression:"loginForm.phoneNumber"}},[t("SvgIcon",{attrs:{slot:"prepend",name:"phone"},slot:"prepend"})],1)],1),t("el-form-item",{attrs:{prop:"code"}},[t("el-input",{attrs:{type:"text",placeholder:"验证码"},model:{value:e.loginForm.code,callback:function(t){e.$set(e.loginForm,"code",t)},expression:"loginForm.code"}},[t("SvgIcon",{attrs:{slot:"prepend",name:"verify"},slot:"prepend"}),t("template",{slot:"append"},[t("div",{staticClass:"login-code"},[t("ValidateCode",{on:{getValidateCode:function(t){e.validateCode=t}}})],1)])],2)],1),t("el-form-item",{attrs:{prop:"verifyCode"}},[t("el-input",{attrs:{placeholder:"验证码",name:"verifyCode"},nativeOn:{keyup:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.submit.apply(null,arguments)}},model:{value:e.loginForm.verifyCode,callback:function(t){e.$set(e.loginForm,"verifyCode",t)},expression:"loginForm.verifyCode"}},[t("SvgIcon",{attrs:{slot:"prepend",name:"verifyCode"},slot:"prepend"}),t("template",{slot:"append"},[t("MyButton",{on:{click:function(t){return e.sendVerifyCode()}}},[e._v(" 发送验证码 ")])],1)],2)],1),t("MyButton",{staticClass:"button-login",attrs:{loading:e.loading,type:"primary"},on:{click:e.submit}},[e._v(" "+e._s(e.submitBtnText)+" ")])],1)],1)],1)},i=[],n=(o("cdf1"),o("3042")),l=o("8c1b"),a=o("c276");let s;const d=(e,t,o)=>{l["a"].validateFun(t,s).then(e=>e?o():o("验证码不正确"))};var u={name:"LoginPhone",props:{formType:{type:String,default:"loginForm"}},data(){return{loading:!1,validateCode:"",loginForm:{phoneNumber:"15908349517",verifyCode:"123456",code:""},rules:{phoneNumber:[{required:!0,message:"请输入用户名",trigger:"blur"},{min:2,max:16,message:"长度在 2 到 16 个字符",trigger:"blur"},{validator:n["b"],trigger:"blur"}],verifyCode:[{required:!0,message:"请输入验证码",trigger:"blur"},{validator:n["d"],trigger:"blur"}],code:[{required:!0,message:"请输入图形验证码",trigger:"blur"},{validator:d,trigger:"blur"}]},isRememberverifyCode:!1}},computed:{submitBtnText(){return this.safetyVerifyFun?"确定":"登录"}},watch:{validateCode:function(e){s=e,this.loginForm.code=e}},methods:{sendVerifyCode(){},submit(){const e=this.safetyVerifyFun&&"function"===typeof this.safetyVerifyFun;e?this.safetyVerifyFun(()=>!0):this.validateLoginForm()},validateLoginForm(){this.$refs.loginForm.validate(e=>{e&&(this.loading=!0,this.login())})},login(){const e=this;e.loading=!0,"loginForm"===this.formType?(a["a"].cookies.set("token",s),setTimeout(()=>{e.$router.push({path:e.$route.query.redirect||"/index"})},500)):this.formType}}},p=u,m=(o("7631"),o("d4a3")),c=Object(m["a"])(p,r,i,!1,null,"e652abd2",null);t["default"]=c.exports},7631:function(e,t,o){"use strict";o("df9b")},df9b:function(e,t,o){}}]);