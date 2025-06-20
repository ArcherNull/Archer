<template>
	<view>
		<view class="my_collection-top">
		</view>
		
		<view v-if="isA==1" class="my_collection-list">
			<articleList :list="list"></articleList>
		</view>
		
		<view v-if="isA==0" class="my_collection-list1">
			<thinkList :list="list1"></thinkList>
		</view>
	</view>
</template>

<script>
	import articleList from '@/components/article-list/article-list.vue';
	import thinkList from '@/components/think-list/think-list.vue';
	import request from '@/util/request.js';
	const app = getApp();
	export default {
		components:{
			articleList,
			thinkList
		},
		data() {
			return {
				isA:1,//是不是新闻资讯
				list:[],//新闻资讯
				list1:[],//思想交流
				page:1,//
				isBottom:false,//有没有到底部
			}
		},
		onLoad(){
			var uid = app.globalData.userInfo.id;
			var token = app.globalData.userInfo.token;
			var url1 = app.globalData.site_url+'/appapi/?s=User.Collect_news';
			request.requestApi(url1,{uid:uid,token:token,p:1}).then(res1=>{
				this.list = res1.data.info[0].list;
			})
			
			
			var url = app.globalData.site_url+'/appapi/?s=User.Collect_think';
			request.requestApi(url,{uid:uid,token:token,p:1}).then(res=>{
				this.list1 = res.data.info[0].list;
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
			if(this.isA==1){
				var url1 = app.globalData.site_url+'/appapi/?s=User.Collect_news';
				request.requestApi(url1,{uid:uid,token:token,p:1}).then(res1=>{
					if(res1.data.info[0].list.length<10){
						_this.isBottom = true;
					}
					var list = this.list;
					for(var i=0;i<res1.data.info[0].list.length;i++){
						list.push(res1.data.info[0][i]);
					}
					this.list = list;
				})
			}else{
				var url = app.globalData.site_url+'/appapi/?s=Collect_think';
				request.requestApi(url,{uid:uid,token:token,p:1}).then(res=>{
					if(res1.data.info[0].list.length<10){
						_this.isBottom = true;
					}
					var list1 = this.list1;
					for(var i=0;i<res1.data.info[0].list.length;i++){
						list1.push(res1.data.info[0][i]);
					}
					this.list1 = list1;
				})
			}
		},
		methods: {
			changeLi(e){ //改变
				this.isA = e.currentTarget.dataset.type;
			}
		}
	}
</script>

<style>
	.my_collection-top-li-selected{
		color: #FF342F;
	}
	.my_collection-list1{
		width: 100%;
	}
	.my_collection-list{
		width: 92%;
		margin: 0 auto;
	}
	.my_collection-top-li-heng{
		width: 20%;
		height: 2rpx;
		position: relative;
		top: 30rpx;
		background: #FF342F;
		margin: 0 auto;
		display: block;
	}
	.my_collection-top-li{
		flex: 1;
		text-align: center;
	}
	.my_collection-top{
	    display: flex;
	    border-bottom: 1rpx solid #F0F0F0;
	    padding: 30rpx 0 30rpx 0;
	    color: #646464;
	    letter-spacing: 1rpx;
	    font-size: 30rpx;
	}
</style>
