function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["./LoginPwd-eMeRn4qo.js","./index-DjauntYY.js","./index-D1q6PlH6.css","./LoginPwd-DKVXrba0.css","./LoginPhone-D74LWFqU.js","./LoginPhone-BOvEEvZk.css"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
import{_ as g,g as _,h as i,r as L,c as u,j as f,d as e,w as t,i as n,f as P}from"./index-DjauntYY.js";const v={name:"LoginBox",components:{LoginPwd:_(()=>i(()=>import("./LoginPwd-eMeRn4qo.js"),__vite__mapDeps([0,1,2,3]),import.meta.url)),LoginPhone:_(()=>i(()=>import("./LoginPhone-D74LWFqU.js"),__vite__mapDeps([4,1,2,5]),import.meta.url))},setup(){return{activeName:L("LoginPwd"),handleClick:(s,o)=>{console.log(s,o)}}}},b={class:"Login"},h={class:"Login-form"};function C(l,a,s,o,k,w){const d=n("LoginPwd"),c=n("el-tab-pane"),r=n("LoginPhone"),m=n("el-tabs");return P(),u("div",b,[f("div",h,[e(m,{modelValue:o.activeName,"onUpdate:modelValue":a[0]||(a[0]=p=>o.activeName=p),class:"Login-form__tabs",onTabClick:o.handleClick},{default:t(()=>[e(c,{label:"账号密码登录",name:"LoginPwd"},{default:t(()=>[e(d)]),_:1}),e(c,{label:"手机号登录",name:"LoginPhone"},{default:t(()=>[e(r)]),_:1})]),_:1},8,["modelValue","onTabClick"])])])}const x=g(v,[["render",C],["__scopeId","data-v-44b2ec6e"]]);export{x as default};
