(this["webpackJsonp"]=this["webpackJsonp"]||[]).push([["chunk-2d208251"],{a419:function(e,t,s){"use strict";s.r(t);var a=function(){var e=this,t=e._self._c;return t("div",[t("FirstTitle",{attrs:{"is-show-title-bg":!1,title:"系统主题"}},[t("div",{attrs:{slot:"content"},slot:"content"},[t("MyForm",{attrs:{register:e.systemFormRegister}})],1)]),t("FirstTitle",{attrs:{"is-show-title-bg":!1,title:"推荐主题"}},[t("div",{attrs:{slot:"content"},slot:"content"},[t("MyForm",{attrs:{register:e.themeFormRegister}})],1)])],1)},m=[],i=s("4360"),h=s("6eef"),r={name:"SystemTheme",data(){return{themeTableData:[{themeName:"经典",themeImage:"",operations:""},{themeName:"紫罗兰",themeImage:"",operations:""},{themeName:"简约线条",themeImage:"",operations:"操作"}],systemFormRegister:{formSchemas:[{label:"系统主题色",component:"myColorPicker",defaultValue:"#409EFF",field:"theme",change:(e,t)=>{t.defaultValue=e,this.changeTheme(e)}}]},themeFormRegister:{formSchemas:[{label:"主题",component:"select",selectList:i["a"].state.setting.theme.themeList,defaultValue:i["a"].state.setting.theme.theme,field:"theme",change:(e,t)=>{t.defaultValue=e,this.SET_THEME_LIST(e)}}]}}},methods:{...Object(h["b"])("setting/theme",["set"]),...Object(h["d"])("setting/theme",["SET_THEME_LIST"]),setSystemTheme(){},changeTheme(e){this.set(e)}}},o=r,n=s("d4a3"),l=Object(n["a"])(o,a,m,!1,null,"26b921b1",null);t["default"]=l.exports}}]);