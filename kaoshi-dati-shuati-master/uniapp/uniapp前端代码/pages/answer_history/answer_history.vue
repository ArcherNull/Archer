<template>
	<view>
		
		<view class="answer-wrap">
			<view v-if="hisList.length > 0" v-for="(item, index) in hisList" :key="index" class="answer-item">
				<view class="answer-item-one">
					<text class="answer-item-one-ymd">{{item.begin_ymd}}</text>
					<text class="answer-item-one-hms">{{item.begin_hms}}答题</text>
					<text class="answer-item-one-score">积分:&nbsp;&nbsp;{{item.res_integral}}分</text>
				</view>
				<view class="answer-item-two">
					<text class="answer-duration">答题用时:</text>
					<text class="answer-duration-value">{{item.duration}}</text>
					<text class="answer-duration-integral-title">得分:</text>
					<text class="answer-duration-integral">{{item.score}}分</text>
				</view>
			</view>
			
			<view class="kong-wrap" v-if="isKong == true">
				<image class="xiangzi" src="../../static/images/xiangzi.png" mode="aspectFill"></image>
				<text class="font_24 color_96">暂无记录</text>
			</view>
			
		</view>
		
	</view>
</template>

<script>
	
	const app = getApp();
	
	export default {
		data() {
			return {
				hisList: [],
				isKong: false, 
			}
		},
		onReady() {
			this.getAnswerHistory();
		},
		methods: {
			
			getAnswerHistory() {
				let that = this;
				uni.request({
					url: app.globalData.site_url + '/appapi/?s=Tests.GetAnswerHistory',
					method: 'GET',
					data: {
						'uid': app.globalData.userInfo.id,
						'token': app.globalData.userInfo.token
					},
					success: res => {
						if(res.data.data.code != 0) {
							uni.showToast({
								icon: 'none',
								title: res.data.data.msg
							});
							if(res.data.data.code == 700) {
								uni.navigateTo({
									url: '../login/index',
								});
								return;
							}
						}
						that.hisList = res.data.data.info[0];
						if(res.data.data.info[0].length <= 0) {
							that.isKong = true;
						}
					},
					fail: () => {},
				});
				
			}
			
		}
	}
</script>

<style>
	
	
	.answer-wrap {
		width: 94%;
		margin: 0 auto;
		
	}
	
	.answer-item {
		height:140rpx;
		padding-top: 20rpx;
		border-bottom: 2rpx solid #F0F0F0;
	}
	
	.answer-item-one {
		font-size: 32rpx;
		position: relative;
	}
	
	.answer-item-two {
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #969696;
	}
	
	.answer-item-one-hms {
		display: inline-block;
		margin-left: 70rpx;
	}
	
	.answer-item-one-score {
		display: inline-block;
		color: #AC060A;
		width: 32%;
		text-align: right;
		position: absolute;
		right: 0;
	}
	
	.answer-duration-value {
		margin-left: 20rpx;	
	}
	
	.answer-duration-integral-title {
		margin-left: 60rpx;
	}
	
	.answer-duration-integral {
		margin-left: 20rpx;
	}
	
	.kong-wrap {
		position: absolute;
		top: 40%;
		left: 50%;
		transform: translate(-40%, -50%);
		text-align: center;
	}
	
	.kong-wrap .xiangzi {
		display: block;
		width: 150rpx;
		height: 150rpx;
	}
	
	

</style>
