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

<script>
	export default {
		name: 'PrintItemBox',
		props: {
			title: {
				type: String,
				default: '',
			},
			subTitle: {
				type: String,
				default: '',
			},
			isShowBottomLine: {
				type: Boolean,
				default: false,
			},
		},
	}
</script>

<style lang="scss" scoped>
	$theme: #f9ae3d;

	.box {
		margin: 20rpx 24rpx;
		padding: 8rpx 24rpx 24rpx;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

		&-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 20rpx;
			padding: 20rpx 0 16rpx;
			border-bottom: 1rpx solid #f3eee6;

			&-left {
				display: flex;
				align-items: center;
				justify-content: flex-start;
				gap: 16rpx;
				flex-wrap: wrap;
				min-width: 0;
				flex: 1;

				&__text {
					position: relative;
					padding-left: 16rpx;
					color: #2c2c2c;
					font-size: 32rpx;
					font-weight: 700;
					line-height: 1.3;

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
						width: 6rpx;
						height: 28rpx;
						border-radius: 6rpx;
						background: $theme;
					}
				}

				&__subTitle {
					color: #999;
					font-size: 26rpx;
				}
			}

			&-right {
				font-size: 26rpx;
				flex-shrink: 0;
			}
		}

		&-content {
			font-size: 28rpx;
			padding-top: 8rpx;
		}
	}

	.borderBtm {
		/* 卡片模式不再依赖底部分割线，保留 class 兼容旧调用 */
		border-bottom: none;
	}
</style>
