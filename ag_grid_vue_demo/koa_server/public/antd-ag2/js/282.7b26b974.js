(function(){"use strict";var e={22282:function(e,t,s){var n=s(95714),r=s(74499),a=s(89467);function o(e,t){t&&(e+=1462);var s=Date.parse(e);return(s-new Date(Date.UTC(1899,11,30)))/864e5}function c(){if(!(this instanceof c))return new c;this.SheetNames=[],this.Sheets={}}function i(e){for(var t={},s={s:{c:1e7,r:1e7},e:{c:0,r:0}},n=0;n!=e.length;++n)for(var a=0;a!=e[n].length;++a){s.s.r>n&&(s.s.r=n),s.s.c>a&&(s.s.c=a),s.e.r<n&&(s.e.r=n),s.e.c<a&&(s.e.c=a);var c={v:e[n][a]};if(null!=c.v){var i=r.utils.encode_cell({c:a,r:n});"number"===typeof c.v?c.t="n":"boolean"===typeof c.v?c.t="b":c.v instanceof Date?(c.t="n",c.z=r.SSF._table[14],c.v=o(c.v)):c.t="s",t[i]=c}}return s.s.c<1e7&&(t["!ref"]=r.utils.encode_range(s)),t}function u(e){for(var t=new ArrayBuffer(e.length),s=new Uint8Array(t),n=0;n!=e.length;++n)s[n]=255&e.charCodeAt(n);return t}function l(e,t){var s=t;s.unshift(e);var n="SheetJS",a=new c,o=i(s);a.SheetNames.push(n),a.Sheets[n]=o;var l=r.write(a,{bookType:"xlsx",bookSST:!1,type:"binary"});return u(l)}function f(e){const{tHeader:t,data:s,lastRow:n}=e;s.push(...n);const r=l(t,s);return r}function g(e,t){const s=e=>{if(e){if(/[Fee|Money|Price|Pay|Weight|Volume]$/g.test(e)){const t=Number(e);return isNaN(t)?e:t.toString().length>10?`'${t}`:t}return e}return e};return t.map((t=>e.map((e=>{const n=t[e];return s(n)}))))}function p(e){return new Promise((t=>{const s=Array.isArray(e.tableData)?g(e.filterVal,e.tableData):[],n={tHeader:e.tHeader,filterVal:e.filterVal,lastRow:e.lastRow||[],title:e.title||"downLoadExcel",data:s},r=f(n);t(r)}))}function h(e){return Array.isArray(e)&&e.length}function d(e){let t=[],s=[];return e.forEach((e=>{e.hide||(t.push(e.headerName),s.push(e.field))})),{tHeader:t,filterVal:s}}const m=15e3;function v(e){const t=[];return e.forEach((e=>{"success"===e.reqStatus&&t.push(...e.response)})),t}async function b(e,t){a.log("导出excel文件blob数据");const s=v(e),n=s.length;a.log("tableDataLen123123123",n);const r=t?.pageOptions?.sortabledFields;let o=m;const{tHeader:c,filterVal:i}=d(r);if(h(c)&&h(i)){const e=o>=n;a.log("123123123123",e);const t=[];let r=Math.ceil(s.length/o);for(let n=0;n<r;n++){const e=s.slice(n*o,(n+1)*o),r=await p({tHeader:c,filterVal:i,tableData:e});a.log("cNewBolb123123123",r),t.push(r)}return a.log("splitTableData123123123",t),t}throw new Error("参数排序字段不能为空或者全部隐藏")}var w=s(98905),y=s(89467);async function x(e,t){y.log("config123123123",e);const{requestParams:s,pageParams:r}=e.pageOptions,{maxNum:a}=e.requestOptions,{data:o,...c}=s,{pageNum:i,pageSize:u,...l}=o,{totalPage:f}=r,g=[];t(new w.Fu({message:"任务拼装进行中",status:"config.processing"}));for(let d=i;d<=f;d++){const e=new n.Z({reqParams:{id:d,...c,data:{pageSize:u,pageNum:d,...l}},validateReqParamsFun:e=>{if(!e?.url)return"请求ajaxItem不能为空";const t=e?.method;if(t){const e=["GET","POST"];if(!e.includes(t.toUpperCase()))return`请求方式不满足【${e.join("/")}】其中之一`}},dealResFun:e=>{const t={status:n.Z.REQ_FAIL_STATUS,response:null};return 200===e?.code?(t.status=n.Z.REQ_SUCCESS_STATUS,t.response=e?.data):500===e?.code&&(t.status=n.Z.REQ_FAIL_STATUS,t.response=e?.data),t}});g.push(e)}t(new w.Fu({message:"任务拼装完毕",status:"config.success"}));const p=new n.q({ajaxLists:g,maxNum:a,callback:t});t(new w.Fu({message:"请求进行中",status:"request.processing"}));const h=await p.concurRequest();return p.dealResult(h)}self.onmessage=async function(e){try{const t=e.data;y.log("batchExportExcelWorker.js中配置参数=====>",t);const s=t.requestOptions.responseType;x(t,(e=>{y.log("回调函数",e),"asyncFile"===s?(y.log("回调函数asyncFile",e),self.postMessage({status:e.status,data:null,code:e.code,message:e.message})):self.postMessage({status:e.status,data:null,code:e.code,message:e.message})})).then((async e=>{if(y.log("最终result=====>",e),"file"===s){self.postMessage({status:"exportExcel.processing",message:`请求完毕【${e.length}/${e.length}】，文件导出准备中...`});const s=await b(e,t),n=t.exportFileOptions;self.postMessage({status:"exportExcel.processing",message:"文件导出中,请不要刷新...",data:s,fileNameObj:n})}else"data"===s&&self.postMessage({status:"request.success",message:`请求完毕【${e.length}/${e.length}】,数据加载中...`,data:e})})).then((()=>{self.postMessage({status:"exportExcel.success",message:"web worker 任务结束"})}))}catch(t){self.postMessage({status:"config.failed",message:`orderWorker.js线程执行失败，${t.message||""}`})}};const S=()=>{self.postMessage({message:"error",data:[]}),self.close()};self.addEventListener("error",(e=>{S(),y.log("ERROR: Line ",e.lineno," in ",e.filename,": ",e.message)}))}},t={};function s(n){var r=t[n];if(void 0!==r)return r.exports;var a=t[n]={exports:{}};return e[n].call(a.exports,a,a.exports,s),a.exports}s.m=e,s.x=function(){var e=s.O(void 0,[56],(function(){return s(22282)}));return e=s.O(e),e},function(){var e=[];s.O=function(t,n,r,a){if(!n){var o=1/0;for(l=0;l<e.length;l++){n=e[l][0],r=e[l][1],a=e[l][2];for(var c=!0,i=0;i<n.length;i++)(!1&a||o>=a)&&Object.keys(s.O).every((function(e){return s.O[e](n[i])}))?n.splice(i--,1):(c=!1,a<o&&(o=a));if(c){e.splice(l--,1);var u=r();void 0!==u&&(t=u)}}return t}a=a||0;for(var l=e.length;l>0&&e[l-1][2]>a;l--)e[l]=e[l-1];e[l]=[n,r,a]}}(),function(){s.d=function(e,t){for(var n in t)s.o(t,n)&&!s.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}}(),function(){s.f={},s.e=function(e){return Promise.all(Object.keys(s.f).reduce((function(t,n){return s.f[n](e,t),t}),[]))}}(),function(){s.u=function(e){return"js/"+e+".456899ff.js"}}(),function(){s.miniCssF=function(e){}}(),function(){s.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){s.p="/public/antd-ag2/"}(),function(){var e={282:1},t=function(t){var n=t[0],a=t[1],o=t[2];for(var c in a)s.o(a,c)&&(s.m[c]=a[c]);o&&o(s);while(n.length)e[n.pop()]=1;r(t)};s.f.i=function(t,n){e[t]||importScripts(s.p+s.u(t))};var n=self["webpackChunkAG"]=self["webpackChunkAG"]||[],r=n.push.bind(n);n.push=t}(),function(){var e=s.x;s.x=function(){return s.e(56).then(e)}}();s.x()})();
//# sourceMappingURL=282.7b26b974.js.map