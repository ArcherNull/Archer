<template>
	<view class="loadMore flex-cencen">
		<view v-if="loading" class="s-pull-loading-icon s-pull-loading-rotate"></view>
		<view>{{loading? config.lodaingText:config.noMoreText}}</view>
	</view>
</template>

<script setup>
	import {
		defineProps,
	} from 'vue'

	defineProps({
		loading: {
			type: Boolean,
			default: false
		},
		config: {
			type: Object,
			default () {
				return {
					lodaingText: '加载中...',
					noMoreText: '没有更多了'
				}
			}
		}
	})
</script>

<style lang="scss" scoped>
	.loadMore {
		width: 100%;
		height: 80rpx;
		color: #999;
		font-size: 26rpx;
	}

	.flex-cencen {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 旋转loading */
	.s-pull-loading-icon {
		width: 30rpx;
		height: 30rpx;
		display: inline-block;
		vertical-align: middle;
		border-radius: 50%;
		border: 2rpx solid $uni-color-primary;
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