<template>
	
	<view>
	  <!-- 上半部分用时正确率 -->
	  <view class="result-tt-top" :style="'padding-top:' + tophight+'px;'">
		  
		 <view class="page-title-wrap">
			<text @click="fanhui" class="iconfont icon-fanhui1 fanhui-icon"></text>
			<text>在线答题</text>
		</view>
		<!-- 展示做题结果 -->
		<view class="time-lv-wrap">
			<view class="top_text top_text1 color_ff font_28">
			   <view>本次答题用时</view>
			   <view class="top_text3">{{result.time}}</view>
			</view>
			<view class="shu"></view>
			<view class="top_text top_text2 color_ff font_28">
			  <view>正确率</view>
			  <view class="top_text3">{{result.acc}}%</view>
			</view>
		</view>
		
	  </view>	
		
	  <view class="result-all-wrap">
		<!-- 下半部分 -->
		 <view class="result-bottom">
			 <view class="result-bottom-t">
				 <image class="result-bottom-t-item result-bottom-t-img" src="https://d15file.680.com/2021-12/25/s/22021122514031715234_11117758.png"></image>
				 <view class="result-bottom-t-item result-bottom-t-text">
					 <view>
						 <text class="font_w font_40">中国梦</text>
						 <text class="result-nengshou font_28 color_ff">答题小能手</text>
					 </view>
					 <view class="result-receive font_28 color_32">
						 邀请你一起来学习答题
					 </view>
				 </view>
			 </view>
			 
			 <view class="result-bottom-c">
			 		<view class="result-bottom-c-dadui font_45 align_center mb-20">本次答对{{result.right_nums}}题!</view>
			 		<view class="result-bottom-c-history align_center font_26">历史答对最高题数{{result.max_right}}题</view>
			 		<!-- <view class="result-bottom-c-bitem result-bottom-c-bitem1">
						<view class="align_center pt-60">
							<text class="font_45 font_w">{{result.score}}</text>
							<text class="font_26">分</text>
						</view>
						<view class="font_24 color_96 align_center">本次所得成绩</view>
					</view> -->
			 		<view class="result-bottom-c-bitem result-bottom-c-bitem2">
						<view class="align_center pt-60">
							<text class="font_45 font_w">{{result.res_integral}}</text>
							<text class="font_26">分</text>
						</view>
						<view  class="font_24 color_96 align_center">本次所获积分</view>
					</view>		 
			 </view>
			 
			 <view class="result-bottom-b">
				<view class="result-bottom-b-t">
					<image class="qrcode-img" :src="result.gongzhong_url" mode="aspectFill"></image>
					<view class="font_30 result-bottom-saomiao">扫描二维码关注我们的公众号</view>
				</view>
				
				<view class="button_view">
					 <text @click="fanhui" class="button_view_item align_center color_ff">返回首页</text>
					 <button open-type="share" class="button_view_item align_center color_ff">分享成绩</button>
				</view>			
			 </view>	 
		 </view>
		 
	  </view>	
	   
	</view>
	
</template>

	

<script>
	import request from '@/util/request.js';
	
	const app = getApp();
	export default {
		data() {
			return {
				tophight: 0,
				result: []
			}
		},
		onReady() {
			// #ifdef MP-WEIXIN
				this.tophight = uni.getMenuButtonBoundingClientRect().top + 8;
			// #endif
			
		},
		onShareTimeline: function(res) {},
		onShareAppMessage: function(res) {},
		onLoad(option){
			if(option.info != undefined) {
				this.result = JSON.parse(decodeURIComponent(option.info));
			}
		},
		onBackPress(options) {
			console.log(options);
			if (options.from === 'navigateBack') {
				return false;
			}
			uni.redirectTo({
				url: '../index/index',
			});
			return true;
		},
		onUnload() {
			uni.reLaunch({
				url: '/pages/index/index',
			})
		},
		
		methods: {
			fanhui(){
				uni.reLaunch({
					url: '/pages/index/index'
				})
			},
			datiAgain() {
				uni.reLaunch({
					url: '/pages/index/index',
				})
			}
			
		}
	}
	
</script>

<style>
	page {
		background-color: #ED292A;
		width: 100%;
		height: 100%;
	}
	
	.result-tt-top {
		height: 270rpx;
		/* background: url("") no-repeat; */
		background-position: left top;
		background-size: 100%;
		position: relative;
	}
	
	.result-all-wrap {
		width: 90%;
		margin: 0 auto;
	}
	
	.page-title-wrap {
		text-align: center;
		color: #FFFFFF;
		font-size: 32rpx;
		position: relative;
	}
	
	.fanhui-icon {
		position: absolute;
		display: inline-block;
		width: 40rpx;
		height: 40rpx;
		left: 6rpx;
		top: 6rpx;
	}
	
	/* 用时正确率 */
	.time-lv-wrap {
		position: relative;
		height: 180rpx;
	}
	
	.result-top {
		height: 250rpx;
	}
	
	.top_text {
		width: 48%;
		height: 120rpx;
		margin: 70rpx 0 0;
		text-align: center;
		float: left;
	}
	
	.top_text3 {
		margin-top: 10rpx;
		font-size: 50rpx;
	}
	
	.shu {
		width: 2rpx;
		height: 100rpx;
		position: absolute;
		left: 50%;
		transform: translate(-50%);
		top: 80rpx;
		background-color: #FFFFFF;
	}
	
	
	/******** 下半部分 ********/
	.result-bottom {
		/* height: calc(77vh); */
		border-radius: 20rpx;
		background-color: #FFFFFF;
		position: relative;
	}
	
	/* 小圆点 */
	.result-bottom::before {
		content: ' ';
		position: absolute;
		left: -20rpx;
		top: 184rpx;
		width: 34rpx;
		height: 34rpx;
		background-color: #ED292A;
		border-radius: 50%;
	}
	
	 .result-bottom::after {
		content: ' ';
		position: absolute;
		right: -20rpx;
		top: 184rpx;
		width: 34rpx;
		height: 34rpx;
		background-color: #ED292A;
		border-radius: 50%;
	}
			
	.result-bottom-t {
		height: 120rpx;
		background-color: #FDEDED;	
		border-radius: 20rpx 20rpx 0 0;
		padding: 40rpx;
	}
	
	.result-bottom-t-item {
		float: left;	
	}
	
	.result-bottom-t-img {
		display: inline-block;
		width: 120rpx;
		height: 120rpx;
	}
	
	.result-bottom-t-text {
		margin-left: 20rpx;
		line-height: 60rpx;
	}
	
	.result-nengshou {
		display: inline-block;
		height: 40rpx;
		line-height: 40rpx;
		margin-left: 15rpx;
		background-color: #EC292A;
		border-radius: 20rpx 20rpx 20rpx 0;
		padding: 0 10rpx;
	}
	
	/* 下方中部区域 */
	.result-bottom-c {
		width: 87%;
		margin: 0 auto;
		min-height: 440rpx;
		padding-top: 40rpx;
		border-bottom: 2rpx dashed #ED292A;
		position: relative;
	}
		
	.result-bottom-c-history {
		width: 300rpx;
		height: 40rpx;
		line-height: 40rpx;
		margin: 0 auto;
		color: #FFA423;
		background-color: #FFF4E4;
	}
	
	.result-bottom-c-bitem {
		height: 180rpx;
		width: 280rpx;
		border-radius: 14rpx;
		background-color: #F7F7F7;
		position: relative;
	}
	
	.result-bottom-c-bitem1 {
		margin-right: 23rpx;
	}
	
	.result-bottom-c-bitem2 {
		margin: 90rpx auto 0;
	}
	
	.result-bottom-c-bitem::before {
		content: '成绩';
		position: absolute;
		left: 50%;
		transform: translate(-50%);
		top: -50rpx;
		width: 100rpx;
		height: 100rpx;
		text-align: center;
		line-height: 100rpx;
		color: #FFFFFF;
		font-size: 30rpx;
		background-color: #ED292A;
		border-radius: 50%;
	}
	
	.result-bottom-c-bitem2::before  {
		content: '积分';
	}
	
	/* 下方底部区域 */
	.result-bottom-b {
		min-height: 300rpx;
		width: 87%;
		margin: 0 auto;
	}
	
	.result-bottom-b-t {
		display: flex;
		align-items: center;
		margin-top: 35rpx;
		margin-bottom: 20rpx;
	}
	
	.qrcode-img {
		width: 130rpx;
		height: 130rpx;
		display: inline-block;
		float: left;
	}
	
	.result-bottom-saomiao {
		display: inline-block;
		margin-left: 26rpx;
		color: #ED292A;
	}
	
	.button_view {
		position: relative;
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
	}
	
	.button_view_item {
		width: 45%;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border-radius: 40rpx;
		letter-spacing: 2rpx;
		background-color: #FFA423;
		font-size: 28rpx;
		position: absolute;
	}
	
	.button_view_item:nth-child(1) {
		left: 0;
	}
	
	.button_view_item:nth-child(2) {
		right: 0;	
		background-color: #EC292A !important;
	}
	
</style>
