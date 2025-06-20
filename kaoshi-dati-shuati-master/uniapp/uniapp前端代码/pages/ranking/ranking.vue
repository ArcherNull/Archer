<template>
	<view>

		<view class="ranking-tt-top" :style="'padding-top:' + tophight+'px;'">
			<view class="page-title-wrap">
				
			</view>
		</view>

		<view class="ranking-all-wrap">
			<!-- 冠军亚军季军展示台 -->
			<view class="rostrum">
				<view class="rostrum-item">
					<block v-if="firstThree[1] != undefined">
						<image class="rostrum-item-avatar" :src="firstThree[1].avatar" mode="aspectFill"></image>
						<text class="ranking-nickname font_26 color_ff">{{firstThree[1].user_nickname}}</text>
						<text class="ranking-score font_28">{{firstThree[1].score}}分</text>
					</block>
				</view>
				<view class="rostrum-item">
					<view class="shape"></view>
					<block v-if="firstThree[0] != undefined">
						<image class="rostrum-item-avatar" :src="firstThree[0].avatar" mode="aspectFill"></image>
						<text class="ranking-nickname font_26 color_ff">{{firstThree[0].user_nickname}}</text>
						<text class="ranking-score font_28">{{firstThree[0].score}}分</text>
					</block>
				</view>
				<view class="rostrum-item">
					<block v-if="firstThree[2] != undefined">
						<image class="rostrum-item-avatar" :src="firstThree[2].avatar" mode="aspectFill"></image>
						<text class="ranking-nickname font_26 color_ff">{{firstThree[2].user_nickname}}</text>
						<text class="ranking-score font_28">{{firstThree[2].score}}分</text>
					</block>
				</view>
			</view>

			<!-- 排行切换按钮 -->
			<view class="ranking-btn-wrap">
				<view @click="getRankingType(1)" :class="{bgyelllow :(showType == 1)}" class="ranking-btn-item ranking-btn-left font_28">所属单位排行</view>
				<view @click="getRankingType(2)" :class="{bgyelllow :(showType == 2)}" class="ranking-btn-item ranking-btn-right font_28">各单位排行</view>
			</view>

			<!-- 排行展示区 -->
			<image class="ranking-line" src="../../static/images/rangking_line.png" mode="aspectFill"></image>
			<view class="ranking-show" :style="'height:' + scrollHRankShow+'rpx;'">
				<view class="ranking-bottom-title font_28 align_center">{{showTitle}}</view>
				<scroll-view class="scroll-view" scroll-y="true" :style="'height:' + scrollH+'rpx;'">
				
					<view v-for="(item, index) in list" :key="index" class="ranking-show-item">
						<text class="ranking-index">{{parseInt(index)+1}}</text>
						<image v-if="isParty === false" :src="item.avatar" class="ranking-show-item-avatar"></image>
						<text class="ranking-show-item-nickname font_28">{{item.user_nickname}}</text>
						<text class="ranking-show-item-score font_30">{{item.score}}分</text>
					</view>
					
				</scroll-view>
			</view>
		</view>

	</view>
</template>

<script>
	
	const app = getApp();
	
	export default {
		data() {
			return {
				tophight: 0,
				scrollH: 0,
				scrollHRankShow: 0,
				allRanking: [],
				departRanking: [],
				list: [],
				showType: 1, //默认部门排行
				firstThree:[], //前三
				showTitle: '所属单位排行', //排行标题
				partys: [], //单位排行数组
				isParty: false,
			}
		},
		onShow() {
			if(app.globalData.userInfo == '') {
				uni.navigateTo({
					url: '../login/index',
				});
				return;
			}
			this.getRanking();
			
		},
		onShareTimeline: function(res) {},
		onShareAppMessage: function(res) {},
		onReady() {
			if(app.globalData.userInfo == '') {
				uni.navigateTo({
					url: '../login/index',
				});
				return;
			}
			this.getRanking();
			
			let that = this;
			// #ifdef MP-WEIXIN
			that.tophight = uni.getMenuButtonBoundingClientRect().top + 8;
			// #endif
			uni.getSystemInfo({
				success: function(res) {
					that.scrollHRankShow = res.windowHeight * 750 / res.windowWidth - 790;
					if(res.windowHeight < 700) {
						that.scrollH = res.windowHeight * 750 / res.windowWidth - parseInt(res.safeArea.top) - parseInt(res.safeArea.bottom) - 200;
					} else {
						that.scrollH = res.windowHeight * 750 / res.windowWidth - parseInt(res.safeArea.top) - parseInt(res.safeArea.bottom) - 50;
					}
					
				}
			});
		},
		methods: {
			
			fanhui(){
				uni.navigateBack({
					delta: 1
				});
			},
			getRanking() {
				let that = this;
				uni.request({
					url: app.globalData.site_url + '/appapi/?s=Home.GetRankingScore',
					method: 'GET',
					data: {
						'uid': app.globalData.userInfo.id,
						'token': app.globalData.userInfo.token,
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
						
						that.allRanking = res.data.data.info[0].all;
						that.departRanking = res.data.data.info[0].depart;
						that.partys = res.data.data.info[0].partys;
						that.list = res.data.data.info[0].depart; //默认部门排行
						for (var i = 0; i < 3; i++) {
							that.firstThree.push(that.list[i]);
						}
						
					},
					fail: () => {
						uni.showToast({
							icon: 'none',
							title: '网络错误'
						});
					},
				});
				
			},
			// 按部门获取排行榜
			getRankingType(type) {
				if(type == 1) {
					this.list = this.departRanking;
					this.isParty = false;
					this.showType = 1;
					this.showTitle = '所属单位排行'
					
					for (var i = 0; i < 3; i++) {
						this.firstThree[i] = this.departRanking[i];
					}
					
				} else {
					this.list = this.partys;
					this.isParty = true;
					this.showType = 2;
					this.showTitle = '各单位排行'
					
					for (var i = 0; i < 3; i++) {
						this.firstThree[i] = this.partys[i];
					}
				}
				
			},
			
		}
	}
</script>

<style>
	page {
		background-color: #ED292A;
		height: 100%;
		overflow: hidden;
	}
	
	/* overflow: hidden; */

	.ranking-tt-top {
		/* #ifndef MP-WEIXIN */
		height: 270rpx;
		/* #endif */
		/* #ifdef MP-WEIXIN */
		height: 120rpx;
		/* #endif */
		
		background: url(../../static/images/ranking_title.png)no-repeat;
		background-position: bottom;
		background-size: 100%;
	}

	.ranking-all-wrap {
		width: 96%;
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

	/* 冠军亚军季军展示台*/
	.rostrum {
		width: 100%;
		height: 300rpx;
		/* #ifndef MP-WEIXIN */
		margin-top: 30rpx;
		/* #endif */
		/* #ifdef MP-WEIXIN */
		margin-top: 2rpx;
		/* #endif */
		
		background: url(../../static/images/ranking_guanjun_bg.png)no-repeat;
		background-size: 104% 100%;
	}

	.rostrum-item {
		float: left;
		width: 28%;
		height: 100%;
		text-align: center;
		margin-right: 30rpx;
		position: relative;
	}

	.rostrum-item:nth-child(1) {
		margin-left: 27rpx;
	}
	
	.rostrum-item::after {
		position: absolute;
		width: 34rpx;
		height: 34rpx;
		font-size: 24rpx;
		color: #FFFFFF;
		background-color: #ED292A;
		border-radius: 50%;
	}

	.rostrum-item:nth-child(1)::after {
		content: '2';
		right: 40rpx;
		top: 52rpx;
	}

	.rostrum-item:nth-child(2)::after {
		content: '1';
		right: 29rpx;
		top: 22rpx;
	}

	.rostrum-item:nth-child(3)::after {
		content: '3';
		right: 34rpx;
		top: 54rpx;
		
	}

	.rostrum-item:nth-child(3) {
		margin-right: 0;
	}

	.rostrum-item-avatar {
		display: inline-block;
		width: 94rpx;
		height: 94rpx;
		margin-top: 70rpx;
		border-radius: 50%;
		border: 2rpx solid #FF2A39;
	}

	.rostrum-item:nth-child(2) .rostrum-item-avatar {
		width: 130rpx !important;
		height: 130rpx !important;
		margin-top: 28rpx !important;
	}

	.ranking-score {
		display: inline-block;
		position: relative;
		
		top: -10rpx;
	}

	.ranking-nickname {
		width: 192rpx;
		height: 60rpx;
		line-height: 57rpx;
		position: relative;
		top: -30rpx;
		background-color: #323232;
		display: inline-block;
		
		background: url(../../static/images/ranking_score.png)no-repeat center;
		background-size: 100%;
	}

	.ranking-score {
		color: #f5a005;
		position: relative;
		top: -30rpx;
		font-weight: bold;
		display: inline-block;
		height: 40rpx;
	}

	/* 排行切换按钮 */
	.ranking-btn-wrap {
		width: 80%;
		height: 60rpx;
		margin: 0 auto;
		line-height: 60rpx;
		position: relative;
	}

	.ranking-btn-item {
		position: absolute;
		width: 44%;
		text-align: center;
		color: #FF2A39;
		border-radius: 9rpx;
		letter-spacing: 2rpx;
		background-color: #fff;
	}

	.ranking-btn-left {
		left: 0;
	}

	.ranking-btn-right {
		right: 0;
	}
	
	.bgyelllow {
		background-color: #F9BA00 !important;
		color: #FFFFFF !important; 
	}

	.ranking-show {
		width: 90%;
		margin: -35rpx auto 0;
		padding-top: 30rpx;
		position: relative;
		
		background: url(../../static/images/ranking_white.png)no-repeat center;
		background-size: 110% 110%;
		box-shadow: 0rpx 13px 0 rgba(0, 0, 0, 0.1) inset;
		overflow: hidden;
	}

	.ranking-line {
		display: inline-block;
		width: 100%;
		height: 48rpx;
		margin-top: 28rpx;
	}

	.ranking-bottom-title {
		color: #F9BA00;
	}

	.ranking-bottom-title::before {
		content: '';
		left: 210rpx;
		top: 42rpx;
		position: absolute;
		width: 15rpx;
		height: 15rpx;
		font-size: 24rpx;
		color: #FFFFFF;
		background-color: #F9BA00;
		border-radius: 50%;
	}

	.ranking-bottom-title::after {
		content: '';
		right: 210rpx;
		top: 42rpx;
		position: absolute;
		width: 15rpx;
		height: 15rpx;
		font-size: 24rpx;
		color: #FFFFFF;
		background-color: #F9BA00;
		border-radius: 50%;
	}

	
	/* 白板排行区域 */
	.ranking-show-item {
		display: flex;
		align-items: center;
		height: 90rpx;
		line-height: 90rpx;
		padding-left: 30rpx;
		position: relative;
	}
	
	.ranking-index {
		display: inline-block;
		width: 100rpx;
	}
		
	.ranking-show-item-avatar {
		display: inline-block;
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
	}
	
	.ranking-show-item-nickname {
		display: inline-block;
		width: 200rpx;
		margin-left: 58rpx;
		text-align: left;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	
	.ranking-show-item-score {
		display: inline-block;
		width: 30%;
		text-align: right;
		position: absolute;
		right: 30rpx;
		color: #FA191A;
	}
	
	
	
</style>
