<template>
	<view class="LabelBox">
		<view class="LabelBox-left" @click="checkFun()">
			<view
				:class="['LabelBox-left__radio', checked ? 'LabelBox-left__radio-active' : 'LabelBox-left__radio-unactive']">

			</view>
			<view class="LabelBox-left__text">
				{{ label }}
			</view>
		</view>
		<view class="LabelBox-right">
			<slot></slot>
		</view>
	</view>
</template>

<script>
	export default {
		name: "LabelBox",
		props: {
			label: {
				type: String,
				default: ''
			},
			checked: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {

			}
		},
		methods: {
			checkFun() {
				this.$emit('checked')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.LabelBox {
		display: flex;
		align-items: center;
		justify-content: space-between;
		row-gap: 20rpx;
		padding: 10rpx 0;
		flex-wrap: wrap;

		&-left {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			gap: 16rpx;


			&__radio {
				width: 28rpx;
				height: 28rpx;
				border-radius: 14rpx;
				box-sizing: border-box;

				&-active {
					border: solid 2rpx $uni-color-primary;
					display: flex;
					align-items: center;
					justify-content: center;

					&::after {
						content: '';
						background-color: $uni-color-primary;
						width: 16rpx;
						height: 16rpx;
						border-radius: 8rpx;
					}
				}

				&-unactive {
					border: solid 2rpx #999;
				}
			}
		}

		&-right {}
	}
</style>