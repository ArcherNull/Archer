import{b as C,i as g,f as k,c as p,j as m,t as f,d as t,w as o,l as n,n as x,r as b,s as _,E as w}from"./index-DjauntYY.js";const y={__name:"HeaderBox",props:{title:String,likes:[Number,String]},emits:["refresh"],setup(s,{expose:l,emit:a}){const c=s;l({handleNodeClick:()=>{console.log("要执行的方法,可以通过ref调用")}});const r=a;C(()=>{console.log("渲染======>",c.title)});const i=()=>{console.log("执行渲染"),x(()=>{console.log("执行渲染123"),r("refresh",!0)})};return(u,d)=>{const e=g("el-button");return k(),p("div",null,[m("div",null,f(s.title),1),m("div",null,f(s.likes),1),t(e,{onClick:i},{default:o(()=>[n("执行渲染")]),_:1})])}}},M={class:"Workbench"},v={__name:"index",setup(s){const l=b(null),a=()=>{console.log("父页面刷新")},c=()=>{l.value.handleNodeClick()},h=()=>{_("提示")},r=()=>{_({message:"测试",type:"error",showClose:!0,duration:2e3})},i=()=>{const u=()=>{setTimeout(()=>{w.closeAll()},2e3)};window.handleCancelRequestFun=u;const d=1e4,e=5e3;_({dangerouslyUseHTMLString:!0,type:"warning",duration:e,showClose:!0,message:"<span>手动取消请求在".concat(d-e,'ms内,可<button style="margin:0 6px;color:blue;" onClick="handleCancelRequestFun()">手动取消</button></span>')})};return(u,d)=>{const e=g("el-button");return k(),p("div",M,[t(y,{ref_key:"headerBox",ref:l,title:"工作台文字123",likes:"fish is you",onRefresh:a},null,512),t(e,{onClick:c},{default:o(()=>[n("点击")]),_:1}),t(e,{onClick:h},{default:o(()=>[n("点击1")]),_:1}),t(e,{onClick:r},{default:o(()=>[n("点击2")]),_:1}),t(e,{onClick:i},{default:o(()=>[n("点击3")]),_:1})])}}};export{v as default};