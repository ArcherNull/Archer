import{_ as l,a1 as p,a2 as i,C as c,w as r,i as u,f as t,D as d}from"./index-DjauntYY.js";const _={name:"CollapseMenu",components:{Expand:p,Fold:i},props:{isCollapseMenu:{type:Boolean,default:!1}},setup(n,e){const{isCollapseMenu:o}=n;return{clickIcon:()=>{e.emit("onCollapseMenu",o)}}}};function f(n,e,o,a,C,m){const s=u("MyIconButton");return t(),c(s,{onClickIcon:a.clickIcon},{default:r(()=>[(t(),c(d(o.isCollapseMenu?"Expand":"Fold")))]),_:1},8,["onClickIcon"])}const k=l(_,[["render",f]]);export{k as default};