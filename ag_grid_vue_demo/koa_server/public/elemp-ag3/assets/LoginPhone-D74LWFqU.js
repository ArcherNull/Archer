import{_ as F,r,a as f,Y as V,Z as w,c as h,d as l,w as n,i as c,f as y,X as C,l as v,t as L}from"./index-DjauntYY.js";const x={name:"LoginPhone",setup(){const a=r(!1),t=r(null),e=r("发送验证码"),d=r(!1),s=r(5),o=r(null),u=f({username:"",password:""}),i=f({username:[{required:!0,message:"请输入手机号",trigger:"blur"},{min:11,max:11,message:"手机号长度应为11位",trigger:"blur"}],password:[{required:!0,message:"请输入验证码",trigger:"blur"},{min:5,max:15,message:"验证码长度应该在5·15之间",trigger:"blur"}]});return{ruleFormRef:t,ruleForm:u,rules:i,Iphone:V,Message:w,sendValCodeLoading:d,sendValCodeText:e,sendValidateFun:()=>{console.log("发送验证码",o.value),d.value=!0,!o.value&&(e.value="".concat(s.value,"s后重发"),o.value=setInterval(()=>{s.value>1?(s.value--,e.value="".concat(s.value,"s后重发")):(clearInterval(o.value),o.value=null,s.value=5,d.value=!1,e.value="发送验证码")},1e3))},submitLoading:a,submitForm:async()=>{console.log("提交表单"),t.value&&(console.log("ruleFormRef",t.value),await t.value.validate((_,b)=>{_?console.log("submit!",u.value):console.log("error submit!",b)}))}}}},k={class:"LoginPhone"};function I(g,a,t,e,d,s){const o=c("el-button"),u=c("el-input"),i=c("el-form-item"),p=c("el-form");return y(),h("div",k,[l(p,{ref:"ruleFormRef",model:e.ruleForm,rules:e.rules,class:"LoginPhone-ruleForm",size:g.$commJs.formSize,"status-icon":""},{default:n(()=>[l(i,{prop:"username"},{default:n(()=>[l(u,{modelValue:e.ruleForm.username,"onUpdate:modelValue":a[0]||(a[0]=m=>e.ruleForm.username=m),type:"number",minlength:"11",placeholder:"请输入手机号",clearable:""},{prepend:n(()=>[l(o,{icon:e.Iphone},null,8,["icon"])]),_:1},8,["modelValue"])]),_:1}),l(i,{prop:"password"},{default:n(()=>[l(u,{modelValue:e.ruleForm.password,"onUpdate:modelValue":a[2]||(a[2]=m=>e.ruleForm.password=m),"show-password":"",clearable:"",placeholder:"请输入验证码",type:"number",onKeyup:C(e.submitForm,["enter","up"])},{prepend:n(()=>[l(o,{icon:e.Message},null,8,["icon"])]),append:n(()=>[l(o,{loading:e.sendValCodeLoading,onClick:a[1]||(a[1]=m=>e.sendValidateFun())},{default:n(()=>[v(L(e.sendValCodeText),1)]),_:1},8,["loading"])]),_:1},8,["modelValue","onKeyup"])]),_:1}),l(i,null,{default:n(()=>[l(o,{class:"LoginPhone-submitBtn",type:"primary",loading:e.submitLoading,onClick:e.submitForm},{default:n(()=>[v(" 登录 ")]),_:1},8,["loading","onClick"])]),_:1})]),_:1},8,["model","rules","size"])])}const T=F(x,[["render",I],["__scopeId","data-v-36ed7139"]]);export{T as default};
