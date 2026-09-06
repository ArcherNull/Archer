<template>
	<view :class="['box', isShowBottomLine ? 'borderBtm' : '']">
		<view class="box-header" v-if="title">
			<view class="box-header-left">
				<view class="box-header-left__text">
					{{ title }}
				</view>
				<slot name="subTitle">
					<view class="box-header-left__subTitle" v-if="subTitle">
						{{ subTitle }}
					</view>
				</slot>
			</view>
			<view class="box-header-right">
				<slot name="right"></slot>
			</view>
		</view>
		<view class="box-content">
			<slot></slot>
		</view>
	</view>
</template>

<script setup>
	defineProps({
		title: {
			type: String,
			default: ''
		},
		subTitle: {
			type: String,
			default: ''
		},
		isShowBottomLine: {
			type: Boolean,
			default: false
		}
	})
</script>

<style lang="scss" scoped>
	.box {
		padding: 20rpx;
		background-color: #fff;

		&-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 20rpx;
			padding: 16rpx 0;

			&-left {
				display: flex;
				align-items: center;
				justify-content: flex-start;
				gap: 16rpx;
				flex-wrap: wrap;

				&__text {
					color: #333;
					font-size: 32rpx;
					font-weight: bold;
				}

				&__subTitle {
					color: #999;
					font-size: 28rpx;
				}
			}

			&-right {
				font-size: 28rpx;
			}
		}

		&-content {
			font-size: 28rpx;
		}
	}

	.borderBtm {
		border-bottom: solid 2rpx #e3e3e3;
		box-sizing: border-box;
	}
</style>
