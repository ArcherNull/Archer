<template>
	<view class="LabelBox">
		<view class="LabelBox-left" @click="checkFun">
			<view
				v-if="showCheck"
				:class="[
					'LabelBox-left__radio',
					checked
						? 'LabelBox-left__radio-active'
						: 'LabelBox-left__radio-unactive',
				]"
			></view>
			<view class="LabelBox-left__text">{{ label }}</view>
		</view>
		<view class="LabelBox-right">
			<slot></slot>
		</view>
	</view>
</template>

<script>
	/**
	 * 对齐 kpsapp LabelBox：左侧圆点单选 + 右侧插槽
	 * showCheck=false 时仅展示文案（运单份数等）
	 */
	export default {
		name: 'LabelBox',
		props: {
			label: {
				type: String,
				default: '',
			},
			checked: {
				type: Boolean,
				default: true,
			},
			showCheck: {
				type: Boolean,
				default: true,
			},
		},
		methods: {
			checkFun() {
				if (!this.showCheck) return
				this.$emit('checked')
			},
		},
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
					border: solid 2rpx #ff9407;
					display: flex;
					align-items: center;
					justify-content: center;

					&::after {
						content: '';
						background-color: #ff9407;
						width: 16rpx;
						height: 16rpx;
						border-radius: 8rpx;
					}
				}

				&-unactive {
					border: solid 2rpx #999;
				}
			}

			&__text {
				font-size: 28rpx;
				color: #333;
			}
		}

		&-right {
			display: flex;
			align-items: center;
			justify-content: flex-end;
		}
	}
</style>
