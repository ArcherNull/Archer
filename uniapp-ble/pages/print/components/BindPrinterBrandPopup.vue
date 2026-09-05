<template>
	<view v-if="visible" class="bindMask" @click="onMaskClick">
		<view class="bindPanel" @click.stop>
			<view class="bindPanel-header">
				<view class="bindPanel-title">绑定设备品牌</view>
				<view class="bindPanel-close" @click="onClose">×</view>
			</view>

			<view class="bindPanel-device" v-if="device">
				<view class="bindPanel-device__name">{{ deviceName }}</view>
				<view class="bindPanel-device__id">设备ID：{{ device.deviceId || '--' }}</view>
			</view>

			<scroll-view class="bindPanel-body" scroll-y>
				<view
					v-for="group in brandGroups"
					:key="group.brand"
					class="brandGroup"
				>
					<view class="brandGroup-title">{{ group.brandName }}</view>
					<view
						v-for="model in group.models"
						:key="model.key"
						:class="['modelItem', selectedKey === model.key ? 'modelItem--active' : '']"
						@click="selectModel(model)"
					>
						<image
							v-if="model.image"
							class="modelItem-img"
							:src="model.image"
							mode="aspectFit"
						/>
						<view class="modelItem-meta">
							<view class="modelItem-name">{{ model.model }}</view>
							<view class="modelItem-sub">
								{{ model.brandName }}
								<text v-if="model.protocol"> · {{ String(model.protocol).toUpperCase() }}</text>
							</view>
						</view>
						<view class="modelItem-check" v-if="selectedKey === model.key">✓</view>
					</view>
				</view>
				<view v-if="!brandGroups.length" class="bindPanel-empty">暂无可选品牌机型</view>
			</scroll-view>

			<view class="bindPanel-footer">
				<button
					class="action-btn action-btn--ghost"
					@click="onClose"
				>取消</button>
				<button
					class="action-btn action-btn--primary"
					:disabled="!selectedKey"
					@click="onConfirm"
				>确认绑定</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { getPrinterBrandsGrouped } from '../ble/config.js'

	export default {
		name: 'BindPrinterBrandPopup',
		props: {
			visible: {
				type: Boolean,
				default: false,
			},
			device: {
				type: Object,
				default: null,
			},
			closeOnMask: {
				type: Boolean,
				default: true,
			},
		},
		data() {
			return {
				selectedKey: '',
				selectedModel: null,
				brandGroups: getPrinterBrandsGrouped(),
			}
		},
		computed: {
			deviceName() {
				const d = this.device || {}
				return d.name || d.localName || '未命名设备'
			},
		},
		watch: {
			visible: function (val) {
				if (val) {
					this.brandGroups = getPrinterBrandsGrouped()
					this.selectedKey = ''
					this.selectedModel = null
				}
			},
		},
		methods: {
			selectModel(model) {
				if (!model || !model.key) return
				this.selectedKey = model.key
				this.selectedModel = model
			},
			onMaskClick() {
				if (this.closeOnMask) {
					this.onClose()
				}
			},
			onClose() {
				this.$emit('update:visible', false)
				this.$emit('close')
			},
			onConfirm() {
				if (!this.selectedModel || !this.device || !this.device.deviceId) {
					uni.showToast({
						title: '请选择要绑定的机型',
						icon: 'none',
					})
					return
				}
				this.$emit('confirm', {
					device: this.device,
					deviceId: this.device.deviceId,
					model: this.selectedModel,
				})
				this.$emit('update:visible', false)
			},
		},
	}
</script>

<style lang="scss" scoped>
	$theme: #f9ae3d;
	$theme-soft: rgba(249, 174, 61, 0.12);
	$page-bg: #faf6f0;

	.bindMask {
		position: fixed;
		z-index: 1100;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background: rgba(44, 36, 24, 0.45);
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.bindPanel {
		width: 100%;
		max-height: 78vh;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -8rpx 32rpx rgba(249, 174, 61, 0.12);

		&-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 28rpx 28rpx 16rpx;
			border-bottom: 1rpx solid #f3eee6;
		}

		&-title {
			position: relative;
			padding-left: 16rpx;
			font-size: 32rpx;
			font-weight: 700;
			color: #2c2c2c;
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

		&-close {
			width: 56rpx;
			height: 56rpx;
			line-height: 52rpx;
			text-align: center;
			font-size: 40rpx;
			color: #a89880;
			border-radius: 50%;
			background: $page-bg;
		}

		&-device {
			margin: 20rpx 28rpx 12rpx;
			padding: 18rpx 20rpx;
			background: $theme-soft;
			border: 1rpx solid rgba(249, 174, 61, 0.28);
			border-radius: 14rpx;

			&__name {
				font-size: 28rpx;
				font-weight: 700;
				color: #2c2c2c;
			}

			&__id {
				margin-top: 6rpx;
				font-size: 22rpx;
				color: #a89880;
				word-break: break-all;
			}
		}

		&-body {
			flex: 1;
			max-height: 52vh;
			padding: 0 28rpx;
			box-sizing: border-box;
		}

		&-empty {
			padding: 60rpx 0;
			text-align: center;
			color: #a89880;
			font-size: 26rpx;
		}

		&-footer {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			flex-wrap: wrap;
			gap: 16rpx;
			padding: 20rpx 28rpx 0;
			border-top: 1rpx solid #f3eee6;
		}
	}

	.action-btn {
		margin: 0;
		padding: 0 40rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 30rpx;
		font-weight: 600;
		border-radius: 999rpx;
		border: none;
		box-sizing: border-box;
		text-align: center;

		&::after {
			border: none;
		}

		&[disabled] {
			opacity: 0.45;
		}

		&--ghost {
			min-width: 180rpx;
			color: #c4841a;
			background: $theme-soft;
		}

		&--primary {
			min-width: 220rpx;
			color: #fff !important;
			background: $theme !important;
			box-shadow: 0 6rpx 16rpx rgba(249, 174, 61, 0.35);
		}
	}

	.brandGroup {
		margin-bottom: 20rpx;

		&-title {
			font-size: 26rpx;
			font-weight: 700;
			color: #8a7a64;
			padding: 12rpx 0;
		}
	}

	.modelItem {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 18rpx 16rpx;
		margin-bottom: 12rpx;
		border: 2rpx solid #efe6d8;
		border-radius: 14rpx;
		background: #fffaf3;

		&--active {
			border-color: $theme;
			background: $theme-soft;
			box-shadow: 0 4rpx 12rpx rgba(249, 174, 61, 0.15);
		}

		&-img {
			width: 72rpx;
			height: 72rpx;
			flex-shrink: 0;
			border-radius: 12rpx;
			background: #fff;
		}

		&-meta {
			flex: 1;
			min-width: 0;
		}

		&-name {
			font-size: 28rpx;
			font-weight: 700;
			color: #2c2c2c;
		}

		&-sub {
			margin-top: 4rpx;
			font-size: 22rpx;
			color: #a89880;
		}

		&-check {
			flex-shrink: 0;
			width: 40rpx;
			height: 40rpx;
			line-height: 40rpx;
			text-align: center;
			border-radius: 50%;
			background: $theme;
			color: #fff;
			font-size: 24rpx;
			font-weight: 700;
		}
	}
</style>
