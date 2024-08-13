function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["./index-CWgAvrbF.js","./index-DjauntYY.js","./index-D1q6PlH6.css","./index-4oa0ogvh.css","./index-BCcp3mth.js"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
import{_ as p,g as s,h as n,v as u,c as i,j as t,d as a,i as r,f as m}from"./index-DjauntYY.js";const d={name:"BreNav",components:{Breadcrumb:s(()=>n(()=>import("./index-CWgAvrbF.js"),__vite__mapDeps([0,1,2,3]),import.meta.url)),CollapseMenu:s(()=>n(()=>import("./index-BCcp3mth.js"),__vite__mapDeps([4,1,2]),import.meta.url))},setup(){const e=u();return{collapseMenu:()=>{e.onIsCollapseMenu(!e.isCollapseMenu)},store:e}}},v={class:"BreNav",flex:"main:left cross:stretch"},f={class:"BreNav-left",flex:"main:center cross:center"},M={class:"BreNav-right",flex:"cross:center"};function B(e,c,C,o,h,x){const l=r("CollapseMenu"),_=r("Breadcrumb");return m(),i("div",v,[t("div",f,[a(l,{"is-collapse-menu":o.store.isCollapseMenu,onOnCollapseMenu:o.collapseMenu},null,8,["is-collapse-menu","onOnCollapseMenu"])]),t("div",M,[a(_)])])}const E=p(d,[["render",B],["__scopeId","data-v-559211a1"]]);export{E as default};
