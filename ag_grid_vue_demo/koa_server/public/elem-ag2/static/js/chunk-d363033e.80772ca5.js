(this["webpackJsonp"]=this["webpackJsonp"]||[]).push([["chunk-d363033e"],{"0865":function(t,i,e){},"1aeb8":function(t,i,e){"use strict";e("0865")},4398:function(t,i,e){"use strict";e.r(i);var n=function(){var t=this,i=t._self._c;return i("div",[i("div",{staticClass:"index"},[i("div",{on:{click:t.openConfirm}},[t._v("默认展示首页界面==================")]),i("div",{on:{click:t.openDialog}},[t._v("打开弹窗")]),i("div",{on:{click:t.alert}},[t._v("警告")]),i("router-link",{attrs:{to:"/system/user"}},[t._v("跳转")])],1),i("el-dialog",{attrs:{title:"提示",visible:t.dialogVisible,width:"30%",center:""},on:{"update:visible":function(i){t.dialogVisible=i}}},[i("span",[t._v("需要注意的是内容是默认不居中的")]),i("span",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[i("el-button",{on:{click:function(i){t.dialogVisible=!1}}},[t._v("取 消")]),i("el-button",{attrs:{type:"primary"},on:{click:function(i){t.dialogVisible=!1}}},[t._v("确 定")])],1)])],1)},o=[],s={name:"Index",data(){return{dialogVisible:!1,title:"标题"}},created(){},methods:{openConfirm(){this.$confirm("警告文本","警告",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(t=>{})},openDialog(){this.dialogVisible=!0},alert(){this.$message.warning("警告")}}},a=s,l=(e("1aeb8"),e("d4a3")),c=Object(l["a"])(a,n,o,!1,null,"1acdbcf4",null);i["default"]=c.exports}}]);