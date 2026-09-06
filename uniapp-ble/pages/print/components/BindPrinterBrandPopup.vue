<template>
	<view v-if="visible" class="deviceMask deviceMask--elevated" @click="onMaskClick">
		<view class="devicePanel devicePanel--solid" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">绑定设备品牌</view>
				<view class="devicePanel-close" @click="onClose">×</view>
			</view>

			<view class="bindDevice" v-if="device">
				<view class="bindDevice__name">{{ deviceName }}</view>
				<view class="bindDevice__id">设备ID：{{ device.deviceId || '--' }}</view>
			</view>

			<scroll-view class="devicePanel-body bindBody" scroll-y>
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
				<view v-if="!brandGroups.length" class="bindEmpty">暂无可选品牌机型</view>
			</scroll-view>

			<view class="devicePanel-footer">
				<button
					class="action-btn action-btn--lg action-btn--ghost"
					@click="onClose"
				>取消</button>
				<button
					class="action-btn action-btn--lg action-btn--primary"
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
	@import '../comm/common.scss';

	.devicePanel-header {
		background: transparent;
		border-radius: 0;
	}

	.bindDevice {
		margin: 20rpx 28rpx 12rpx;
		padding: 18rpx 20rpx;
		background: $pr-theme-soft;
		border: 1rpx solid rgba(249, 174, 61, 0.28);
		border-radius: 14rpx;

		&__name {
			font-size: 28rpx;
			font-weight: 700;
			color: $pr-text-main;
		}

		&__id {
			margin-top: 6rpx;
			font-size: 22rpx;
			color: $pr-text-muted;
			word-break: break-all;
		}
	}

	.bindBody {
		max-height: 52vh;
		padding: 0 28rpx;
	}

	.bindEmpty {
		padding: 60rpx 0;
		text-align: center;
		color: $pr-text-muted;
		font-size: 26rpx;
	}

	.devicePanel-footer {
		background: transparent;
	}

	.action-btn--ghost {
		min-width: 180rpx;
	}

	.action-btn--primary {
		min-width: 220rpx;
	}

	.brandGroup {
		margin-bottom: 20rpx;

		&-title {
			font-size: 26rpx;
			font-weight: 700;
			color: $pr-text-sub;
			padding: 12rpx 0;
		}
	}

	.modelItem {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 18rpx 16rpx;
		margin-bottom: 12rpx;
		border: 2rpx solid $pr-border-color;
		border-radius: 14rpx;
		background: $pr-surface-warm;

		&--active {
			border-color: $pr-theme;
			background: $pr-theme-soft;
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
			color: $pr-text-main;
		}

		&-sub {
			margin-top: 4rpx;
			font-size: 22rpx;
			color: $pr-text-muted;
		}

		&-check {
			flex-shrink: 0;
			width: 40rpx;
			height: 40rpx;
			line-height: 40rpx;
			text-align: center;
			border-radius: 50%;
			background: $pr-theme;
			color: #fff;
			font-size: 24rpx;
			font-weight: 700;
		}
	}
</style>
