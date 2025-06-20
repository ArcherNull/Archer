<template>
	<view>
		<view class="deme-top">
			<picker @change="onChange" mode="date" fields="month" :value="date" start="1949-01" end="2050-12">
				<image class="deme-top-img" src="/static/images/san.png"></image>
				<text class="deme-top-text">{{date}}</text>
			</picker>
		</view>
		<view class="heng"></view>
		<view class="deme-content">
			<block v-for="(item,index) in list">
				<view class="deme-content-li" @click="goH5" :data-url="item.url">
					<view class="deme-content-li-right">
						<view class="deme-content-li-right-des">{{item.title}}</view>
						<view class="deme-content-li-right-date">{{item.addtime}}</view>
					</view>
					<image class="deme-content-li-img" src="/static/images/zhe.png"></image>
				</view>				
			</block>

		</view>
	</view>
</template>

<script>
	import request from '@/util/request.js';
	const app = getApp();
	export default {
		data() {
			return {
				list:[],//党员身份
				page:1,//分页
				date:'2020-01',//日期
				isBottom:false,//有没有到底部
			}
		},
		onLoad(){
			var url = app.globalData.site_url+'/appapi/?s=Home.Getshouce';
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			this.date = year+'-'+month;
			request.requestApi(url,{date:year+'-'+month}).then(res=>{
				this.list = res.data.info[0];
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
			
			var url1 = app.globalData.site_url+'/appapi/?s=Home.Getshouce';
			request.requestApi(url1,{date:this.date,p:p}).then(res1=>{
				if(res1.data.info[0].length<10){
					_this.isBottom = true;
				}
				var list = this.list;
				for(var i=0;i<res1.data.info[0].length;i++){
					list.push(res1.data.info[0][i]);
				}
				this.list = list;
			})
		},
		methods: {
			onChange(e){ //选择日期
				this.date = e.detail.value;
				var url1 = app.globalData.site_url+'/appapi/?s=Home.Getshouce';
				request.requestApi(url1,{date:e.detail.value,p:1}).then(res1=>{
					this.list = res1.data.info[0];
				})
			},
			goH5(e){
				uni.navigateTo({
					url:'/pages/webview/index?url='+e.currentTarget.dataset.url
				})
			}
		}
	}
</script>

<style>
	.deme-content-li-img{
		float: right;
		width: 30rpx;
		height: 30rpx;
		margin-top: 10rpx;
	}
	.deme-content-li-right{
		float: left;
		width: 90%;
	}
	.heng{
		background: #FAFAFA;
		width: 100%;
		height: 10rpx;
	}
	.deme-content-li-right-date{
		color: #969696;
		font-size: 28rpx;
		margin-top: 26rpx;
	}
	.deme-content-li-right-des{
		font-size: 34rpx;
		letter-spacing: 1rpx;
		overflow: hidden;
		-webkit-line-clamp: 1;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		font-weight: 500;
	}
	.deme-content-li{
	    clear: both;
	    overflow: hidden;
	    padding: 36rpx 0 36rpx 0;
	    width: 94%;
	    margin: 0 auto;
	    border-bottom: 1rpx solid #F0F0F0;
	}
	.deme-content{
		background: #fff;
	}
	.deme-top-text{
		margin-left: 12rpx;
		font-size: 30rpx;
		position: relative;
		top: 4rpx;
	}
	.deme-top-img{
		width: 16rpx;
		height: 10rpx;
		margin-left: 3%;
		margin-top: 50rpx;
	}
	.deme-top{
	    width: 100%;
	    background: #fff;
	    height: 100rpx;
	}
</style>
