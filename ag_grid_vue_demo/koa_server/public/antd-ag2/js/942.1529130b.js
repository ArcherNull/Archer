"use strict";(self["webpackChunkAG"]=self["webpackChunkAG"]||[]).push([[942],{75942:function(e,t,r){r.r(t),r.d(t,{export_json_to_excel:function(){return f},export_table_to_excel:function(){return h}});var n=r(87265),o=r(74499),s=r(89467);function a(e){for(var t=[],r=e.querySelectorAll("tr"),n=[],o=0;o<r.length;++o){for(var s=[],a=r[o],l=a.querySelectorAll("td"),c=0;c<l.length;++c){var u=l[c],i=u.getAttribute("colspan"),h=u.getAttribute("rowspan"),f=u.innerText;if(""!==f&&f==+f&&(f=+f),n.forEach((function(e){if(o>=e.s.r&&o<=e.e.r&&s.length>=e.s.c&&s.length<=e.e.c)for(var t=0;t<=e.e.c-e.s.c;++t)s.push(null)})),(h||i)&&(h=h||1,i=i||1,n.push({s:{r:o,c:s.length},e:{r:o+h-1,c:s.length+i-1}})),s.push(""!==f?f:null),i)for(var v=0;v<i-1;++v)s.push(null)}t.push(s)}return[t,n]}function l(e,t){t&&(e+=1462);var r=Date.parse(e);return(r-new Date(Date.UTC(1899,11,30)))/864e5}function c(e,t){for(var r={},n={s:{c:1e7,r:1e7},e:{c:0,r:0}},s=0;s!=e.length;++s)for(var a=0;a!=e[s].length;++a){n.s.r>s&&(n.s.r=s),n.s.c>a&&(n.s.c=a),n.e.r<s&&(n.e.r=s),n.e.c<a&&(n.e.c=a);var c={v:e[s][a]};if(null!=c.v){var u=o.utils.encode_cell({c:a,r:s});"number"===typeof c.v?c.t="n":"boolean"===typeof c.v?c.t="b":c.v instanceof Date?(c.t="n",c.z=o.SSF._table[14],c.v=l(c.v)):c.t="s",r[u]=c}}return n.s.c<1e7&&(r["!ref"]=o.utils.encode_range(n)),r}function u(){if(!(this instanceof u))return new u;this.SheetNames=[],this.Sheets={}}function i(e){for(var t=new ArrayBuffer(e.length),r=new Uint8Array(t),n=0;n!=e.length;++n)r[n]=255&e.charCodeAt(n);return t}function h(e){var t=document.getElementById(e);s.log("a");var r=a(t),l=r[1],h=r[0],f="SheetJS";s.log(h);var v=new u,p=c(h);p["!merges"]=l,v.SheetNames.push(f),v.Sheets[f]=p;var S=o.write(v,{bookType:"xlsx",bookSST:!1,type:"binary"});(0,n.saveAs)(new Blob([i(S)],{type:"application/octet-stream"}),"test.xlsx")}function f(e,t,r){var s=t;s.unshift(e);var a="SheetJS",l=new u,h=c(s);l.SheetNames.push(a),l.Sheets[a]=h;var f=o.write(l,{bookType:"xlsx",bookSST:!1,type:"binary"}),v=r||"列表";(0,n.saveAs)(new Blob([i(f)],{type:"application/octet-stream"}),v+".xlsx")}r(24389),r(93638),r(26001)}}]);
//# sourceMappingURL=942.1529130b.js.map