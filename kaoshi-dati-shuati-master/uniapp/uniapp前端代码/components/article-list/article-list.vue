<template>
	<view>
		<block v-for="(item,index) in list" :key="index">
			<view class="article-list-li" @click="goH5" :data-id = "item.id" :data-url="item.url">
				<image class="article-list-li-thumb" :src="item.thumb"></image>
				<view class="article-list-li-right">
					<view class="article-list-li-right-title">{{item.title}}</view>
					<view class="article-list-li-right-date">{{item.date}}</view>
				</view>
			</view>
		</block>
	</view>
</template>

<script>
	
	const app = getApp();
	
	export default {
		props:{
			list:{
				type:Array,
				value:[]
			}
		},
		data() {
			return {
				
			}
		},
		methods: {
			goH5(e){
				console.log(e.currentTarget);		
				// 记录每天第一次阅读
				if(app.globalData.first_read != '1') {
					uni.request({
						url:  app.globalData.site_url+'/appapi/?s=Home.AddReadScore',
						method: 'GET',
						data: {
							'uid': app.globalData.userInfo.id,
							'token': app.globalData.userInfo.token,
							'news_id': e.currentTarget.dataset.id
						},
						success: res => {
							if(res.data.data.code == 0) {
								let score = res.data.data.info['score'];
								uni.showToast({
									title: '积分+' +score,
									image: '../../static/images/jifen_shan.png',
									mask: true,
									duration: 2000
								});
							}
						},
					});
				}
				
				uni.navigateTo({
					url:'/pages/webview/index?url='+e.currentTarget.dataset.url
				})
			}
		}
	}
</script>

<style>
	.article-list-li-right-date{
		font-size: 28rpx;
		margin-top: 46rpx;
		color: #969696;
	}
	.article-list-li-right-title{
		font-size: 36rpx;
		letter-spacing: 1rpx;
		font-weight: 500;
		overflow: hidden;
		-webkit-line-clamp: 2;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		height: 98rpx;
	}
	.article-list-li-right{
		float: left;
		width: 64%;
		margin-left: 4%;
	}
	.article-list-li{
		clear: both;
		overflow: hidden;
		height: 170rpx;
		padding: 40rpx 0 40rpx 0;
		border-bottom: 1rpx solid #F0F0F0;
		width: 100%;
	}
	.article-list-li-thumb{
	    width: 32%;
	    height: 100%;
	    float: left;
	}
</style>
