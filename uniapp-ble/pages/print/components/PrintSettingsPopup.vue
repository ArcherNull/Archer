<template>
	<view v-if="visible" class="deviceMask" @click="onMaskClick" @touchmove.stop.prevent>
		<view class="devicePanel" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">{{ title }}</view>
				<view class="devicePanel-close" @click="onClose">×</view>
			</view>

			<scroll-view class="devicePanel-body" scroll-y>
				<PrintSettings
					ref="printSettings"
					:hide-actions="true"
					:platform-name="platformName"
					:device-name="deviceName"
					:config="config"
					:platform-default-config="platformDefaultConfig"
					@update:config="$emit('update:config', $event)"
					@apply="onSettingsApply"
				/>
			</scroll-view>

			<view class="devicePanel-footer">
				<button
					class="action-btn action-btn--ghost"
					@click="onReset"
				>恢复平台默认</button>
				<button
					class="action-btn action-btn--primary"
					@click="onApply"
				>应用配置</button>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * 传输设置弹层：外壳对齐 DeviceInfoPopup / BindPrinterBrandPopup
	 * PrintSettings 隐藏内置按钮，由底部 footer 触发恢复 / 应用
	 */
	import PrintSettings from './PrintSettings.vue'

	export default {
		name: 'PrintSettingsPopup',
		components: {
			PrintSettings,
		},
		props: {
			visible: {
				type: Boolean,
				default: false,
			},
			title: {
				type: String,
				default: '传输设置',
			},
			closeOnMask: {
				type: Boolean,
				default: true,
			},
			platformName: {
				type: String,
				default: '其它',
			},
			deviceName: {
				type: String,
				default: '未知设备',
			},
			config: {
				type: Object,
				default: function () {
					return {}
				},
			},
			platformDefaultConfig: {
				type: Object,
				default: function () {
					return {}
				},
			},
		},
		methods: {
			onMaskClick() {
				if (this.closeOnMask) {
					this.onClose()
				}
			},
			onClose() {
				this.$emit('update:visible', false)
				this.$emit('close')
			},
			getSettingsRef() {
				return this.$refs.printSettings
			},
			onReset() {
				const settings = this.getSettingsRef()
				if (settings && settings.resetPlatformDefault) {
					settings.resetPlatformDefault()
				}
			},
			onApply() {
				const settings = this.getSettingsRef()
				if (settings && settings.applyConfig) {
					settings.applyConfig()
				}
			},
			onSettingsApply(cfg) {
				this.$emit('apply', cfg)
			},
		},
	}
</script>

<style lang="scss" scoped>
	$theme: #f9ae3d;
	$theme-soft: rgba(249, 174, 61, 0.12);
	$page-bg: #faf6f0;

	.deviceMask {
		position: fixed;
		z-index: 1000;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background: rgba(44, 36, 24, 0.45);
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.devicePanel {
		width: 100%;
		max-height: 82vh;
		background: $page-bg;
		border-radius: 24rpx 24rpx 0 0;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -8rpx 32rpx rgba(249, 174, 61, 0.12);

		&-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 28rpx 28rpx 16rpx;
			background: #fff;
			border-bottom: 1rpx solid #f3eee6;
			border-radius: 24rpx 24rpx 0 0;
			flex-shrink: 0;
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

		&-body {
			flex: 1;
			max-height: 62vh;
			box-sizing: border-box;

			/* PrintSettings 内 PrintItemBox 在弹层中收紧边距 */
			::v-deep .box {
				margin: 12rpx 16rpx 20rpx;
			}
		}

		&-footer {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			flex-wrap: wrap;
			gap: 16rpx;
			padding: 20rpx 28rpx 0;
			border-top: 1rpx solid #f3eee6;
			background: #fff;
			flex-shrink: 0;
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

		&--ghost {
			min-width: 200rpx;
			color: #c4841a;
			background: $theme-soft;
		}

		&--primary {
			min-width: 200rpx;
			color: #fff !important;
			background: $theme !important;
			box-shadow: 0 6rpx 16rpx rgba(249, 174, 61, 0.35);
		}
	}
</style>
