<template>
	<view class="page">
		<view class="page-title">蓝牙调试</view>
		<view class="page-desc">蓝牙调试相关功能可在此扩展</view>
		<view class="page-link" @click="goPrintDebug">进入打印调试页</view>
	</view>
</template>

<script>
	export default {
		methods: {
			goPrintDebug() {
				uni.navigateTo({
					url: '/pages/print/debugPage/index',
				})
			},
		},
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		padding: 48rpx 32rpx;
		background: #faf6f0;
		box-sizing: border-box;
	}

	.page-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #2c2c2c;
	}

	.page-desc {
		margin-top: 16rpx;
		font-size: 28rpx;
		color: #8a7a64;
	}

	.page-link {
		margin-top: 40rpx;
		display: inline-flex;
		padding: 16rpx 28rpx;
		border-radius: 12rpx;
		background: #f9ae3d;
		color: #fff;
		font-size: 28rpx;
	}
</style>
