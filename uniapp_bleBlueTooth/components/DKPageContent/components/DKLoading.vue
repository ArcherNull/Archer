<template>
	<view class="extraPage">
		<view class="pageStatusLoading s-pull-loading-icon s-pull-loading-rotate"></view>
		<view class="pageStatusImg_text">
			拼命加载中...
		</view>
	</view>
</template>

<script setup>
</script>

<style lang="scss" scoped>
	.pageStatusLoading {
		margin-bottom: 20rpx;
		font-size: $uni-font-size-base;
	}
	
	/* 旋转loading */
	.s-pull-loading-icon {
		width: 60rpx;
		height: 60rpx;
		display: inline-block;
		vertical-align: middle;
		border-radius: 50%;
		border: 4rpx solid $uni-color-primary;
		border-bottom-color: transparent;
		box-sizing: border-box;
	
		&:first-child {
			margin-right: 16rpx;
		}
	}
	
	/* 旋转动画 */
	.s-pull-loading-rotate {
		animation: s-pull-loading-rotate 0.6s linear infinite;
	}
	
	@keyframes s-pull-loading-rotate {
		0% {
			transform: rotate(0deg);
		}
	
		100% {
			transform: rotate(360deg);
		}
	}
</style>