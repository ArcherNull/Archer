import{_ as k,v as u,r as v,$ as x,c as s,d as g,w as d,x as L,i as m,f as a,C as p,F as y,G as w,a0 as B,t as f,l as C}from"./index-DjauntYY.js";const T={name:"Breadcrumb",setup(){const i=u(),r=v([]),h=L();return x(()=>h.currentRoute.value,e=>{var l,c;console.log("监听路由=====>",e),r.value=[],i.setCurrentRoute(e.path);let o=e.matched.filter(n=>n.meta&&n.meta.title&&n.meta.breadcrumb!==!1);const _=o[0];_&&_.name==="index"&&(o=[{path:"/index",meta:{title:"首页"}}]),i.addTags({title:((l=e==null?void 0:e.meta)==null?void 0:l.title)||"未知页面",name:e.path,path:e.path,cache:((c=e==null?void 0:e.meta)==null?void 0:c.cache)||!1}),console.log("matched=====>",o),r.value=o},{immediate:!0,deep:!0}),{routerLevelList:r}}},F={class:"Breadcrumb"},G={key:0},N={key:0,class:"no-redirect"},S={key:1,class:"unknown-page-css"},V={key:1,class:"unknown-page-css"};function $(i,r,h,e,o,_){const l=m("router-link"),c=m("el-breadcrumb-item"),n=m("el-breadcrumb");return a(),s("div",F,[g(n,{separator:"/"},{default:d(()=>[e.routerLevelList.length?(a(),p(B,{key:0,name:"breadcrumb",mode:"out-in"},{default:d(()=>[(a(!0),s(y,null,w(e.routerLevelList,(t,b)=>(a(),p(c,{key:t.path},{default:d(()=>[t.meta.title?(a(),s("div",G,[t.redirect==="index"||b==e.routerLevelList.length-1?(a(),s("span",N,f(t.meta.title),1)):(a(),p(l,{key:1,to:t.redirect||t.path},{default:d(()=>[C(f(t.meta.title),1)]),_:2},1032,["to"]))])):(a(),s("div",S,"未知页面"))]),_:2},1024))),128))]),_:1})):(a(),s("div",V,"404"))]),_:1})])}const E=k(T,[["render",$],["__scopeId","data-v-8b2e1a71"]]);export{E as default};