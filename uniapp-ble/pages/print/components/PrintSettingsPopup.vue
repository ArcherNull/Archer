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
					class="action-btn action-btn--lg action-btn--ghost"
					@click="onReset"
				>恢复平台默认</button>
				<button
					class="action-btn action-btn--lg action-btn--primary"
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
	@import '../comm/common.scss';

	.devicePanel-body {
		max-height: 62vh;

		/* PrintSettings 内 PrintItemBox 在弹层中收紧边距 */
		::v-deep .box {
			margin: 12rpx 16rpx 20rpx;
		}
	}

	.action-btn--ghost,
	.action-btn--primary {
		min-width: 200rpx;
	}
</style>
