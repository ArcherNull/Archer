<template>
	<view v-if="visible" class="deviceMask" @click="onMaskClick" @touchmove.stop.prevent>
		<view class="devicePanel" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">{{ title }}</view>
				<view class="devicePanel-close" @click="onClose">×</view>
			</view>

			<scroll-view class="devicePanel-body" scroll-y>
				<DeviceInfo
					:module-state="moduleState"
					:search-state="searchState"
					:device-list="deviceList"
					:searching="searching"
					:scanning="scanning"
					:connecting-id="connectingId"
					@open-search="$emit('open-search')"
					@research="$emit('research')"
					@restart="$emit('restart')"
					@scan-join="$emit('scan-join')"
					@device-connect="$emit('device-connect', $event)"
					@device-disconnect="$emit('device-disconnect', $event)"
					@disconnect-all="$emit('disconnect-all')"
					@toggle-search="$emit('toggle-search')"
					@clear-search="$emit('clear-search')"
					@brand-bind="$emit('brand-bind', $event)"
				/>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	/**
	 * 设备信息弹层：仅做弹窗外壳 + DeviceInfo 透传
	 * 蓝牙实例不在此组件内创建/持有，由父页（index）统一管理
	 */
	import DeviceInfo from './DeviceInfo.vue'

	export default {
		name: 'DeviceInfoPopup',
		components: {
			DeviceInfo,
		},
		props: {
			visible: {
				type: Boolean,
				default: false,
			},
			title: {
				type: String,
				default: '选择打印机',
			},
			closeOnMask: {
				type: Boolean,
				default: true,
			},
			moduleState: {
				type: String,
				default: 'notStarted',
			},
			searchState: {
				type: String,
				default: 'notSearched',
			},
			deviceList: {
				type: Array,
				default: function () {
					return []
				},
			},
			searching: {
				type: Boolean,
				default: false,
			},
			scanning: {
				type: Boolean,
				default: false,
			},
			connectingId: {
				type: String,
				default: '',
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
		},
	}
</script>

<style lang="scss" scoped>
	$theme: #f9ae3d;
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
			max-height: 80vh;
			box-sizing: border-box;

			/* DeviceInfo 内 PrintItemBox 在弹层中收紧边距 */
			::v-deep .box {
				margin: 12rpx 16rpx 20rpx;
			}

		}
	}
</style>
