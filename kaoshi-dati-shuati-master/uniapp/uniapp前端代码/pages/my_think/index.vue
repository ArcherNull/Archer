<template>
	<view>
		<thinkList :list="list"></thinkList>
	</view>
</template>

<script>
	import thinkList from '@/components/think-list/think-list.vue';
	import request from '@/util/request.js';
	const app = getApp();
	export default {
		components:{
			thinkList
		},
		onLoad(){
			var uid = app.globalData.userInfo.id;
			var token = app.globalData.userInfo.token;
			var url = app.globalData.site_url+'/appapi/?s=User.Myupdate';
			request.requestApi(url,{uid:uid,token:token,p:1}).then(res=>{
				console.log(res);
				this.list = res.data.info[0].list;
			})
		},
		onReachBottom(){
			var _this = this;
			if(this.isBottom==true){
				uni.showToast({
					title:'已经到底部了',
					icon:'none'
				})
				return ;
			}
			var p = this.page+1;
			this.page = p;
			
			var uid = app.globalData.userInfo.id;
			var token = app.globalData.userInfo.token;
			var url1 = app.globalData.site_url+'/appapi/?s=User.Myupdate';
			request.requestApi(url1,{uid:uid,token:token,p:p}).then(res1=>{
				if(res1.data.info[0].list.length<10){
					_this.isBottom = true;
				}
				var list = this.list;
				for(var i=0;i<res1.data.info[0].list.length;i++){
					list.push(res1.data.info[0].list[i]);
				}
				this.list = list;
			})
		},
		data() {
			return {
				list:[],//鎴戝彂琛ㄧ殑
				page:1,//
				isBottom:false,//有没有到底部
			}
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
