(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/nav-title/nav-title"],{"24af":function(t,n,e){"use strict";var a=e("2bfe"),u=e.n(a);u.a},"2bfe":function(t,n,e){},"3b69":function(t,n,e){"use strict";e.r(n);var a=e("ee43"),u=e("dca6");for(var r in u)"default"!==r&&function(t){e.d(n,t,(function(){return u[t]}))}(r);e("24af");var i,o=e("f0c5"),f=Object(o["a"])(u["default"],a["b"],a["c"],!1,null,null,null,!1,a["a"],i);n["default"]=f.exports},dca6:function(t,n,e){"use strict";e.r(n);var a=e("e484"),u=e.n(a);for(var r in a)"default"!==r&&function(t){e.d(n,t,(function(){return a[t]}))}(r);n["default"]=u.a},e484:function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var a=u(e("cf5a"));function u(t){return t&&t.__esModule?t:{default:t}}var r=getApp(),i={components:{},props:{title:{type:String,value:""}},created:function(){var t=this;this.navHeight=r.globalData.navHeight+"rpx";var n=r.globalData.site_url+"/appapi/?s=Home.GetConfig";a.default.requestApi(n,{}).then((function(n){t.configInfo=n.data.info[0]}))},data:function(){return{navHeight:0,configInfo:[]}},methods:{}};n.default=i},ee43:function(t,n,e){"use strict";var a;e.d(n,"b",(function(){return u})),e.d(n,"c",(function(){return r})),e.d(n,"a",(function(){return a}));var u=function(){var t=this,n=t.$createElement;t._self._c},r=[]}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/nav-title/nav-title-create-component',
    {
        'components/nav-title/nav-title-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("3b69"))
        })
    },
    [['components/nav-title/nav-title-create-component']]
]);
