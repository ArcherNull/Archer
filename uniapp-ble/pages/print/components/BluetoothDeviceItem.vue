<template>
	<view :class="rootClass">
		<view class="bdi-main">
			<image
				v-if="brandInfo.image"
				:class="['bdi-img', variant === 'search' ? 'bdi-img--sm' : '']"
				:src="brandInfo.image"
				mode="aspectFit"
			/>
			<view class="bdi-meta">
				<view class="bdi-titleRow">
					<view class="bdi-name">{{ deviceName }}</view>
					<view class="bdi-tag" v-if="showPrintType && printTypeLabel">
						{{ printTypeLabel }}
					</view>
				</view>
				<view class="bdi-brand">
					{{ brandInfo.brandName || (variant === 'search' ? '未知品牌' : '') }}
					<text v-if="brandInfo.model"> · {{ brandInfo.model }}</text>
				</view>
				<view class="bdi-rssi" v-if="variant === 'search' && device.RSSI != null && device.RSSI !== ''">
					信号：{{ device.RSSI || 0 }} dBm
				</view>
				<view class="bdi-deviceId">设备ID：{{ device.deviceId || '--' }}</view>
			</view>
		</view>
		<view class="bdi-actions">
					<slot
						name="actions"
						:device="device"
						:index="index"
						:unrecognized="unrecognized"
						:isConnect="!!device.isConnect"
					></slot>
		</view>
	</view>
</template>

<script>
	import {
		resolvePrinterBrandInfo,
		isUnrecognizedPrinterBrand,
	} from '../ble/config.js'

	export default {
		name: 'BluetoothDeviceItem',
		props: {
			device: {
				type: Object,
				default: function () {
					return {}
				},
			},
			index: {
				type: Number,
				default: 0,
			},
			/** connected：卡片样式；search：列表行样式 */
			variant: {
				type: String,
				default: 'connected',
			},
			showPrintType: {
				type: Boolean,
				default: false,
			},
			/** 品牌绑定变更后由父级递增，用于刷新展示 */
			brandBindVersion: {
				type: Number,
				default: 0,
			},
			bordered: {
				type: Boolean,
				default: false,
			},
		},
		computed: {
			rootClass() {
				if (this.variant === 'search') {
					return ['bdi', 'bdi--search', this.bordered ? 'bdi--border' : '']
				}
				return ['bdi', 'bdi--connected']
			},
			deviceName() {
				const d = this.device || {}
				return d.name || d.localName || '未命名设备'
			},
			brandInfo() {
				void this.brandBindVersion
				const d = this.device || {}
				const name = d.name || d.localName || ''
				const deviceId = d.deviceId || ''
				return resolvePrinterBrandInfo(name, deviceId)
			},
			unrecognized() {
				return isUnrecognizedPrinterBrand(this.brandInfo)
			},
			printTypeLabel() {
				const type = (this.device && this.device.printType) || ''
				if (type === 'shared') return '共用'
				if (type === 'label') return '标签打印'
				if (type === 'waybill') return '运单打印'
				if (type === 'receipt') return '回单打印'
				return type || ''
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../comm/common.scss';

	.bdi {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
		box-sizing: border-box;

		&--connected {
			padding: 16rpx 18rpx;
			border: 2rpx solid $pr-theme;
			border-radius: 14rpx;
			background: $pr-theme-soft;
		}

		&--search {
			padding: 18rpx 0;
		}

		&--border {
			border-bottom: solid 2rpx $pr-border-color;
		}

		&-main {
			flex: 1;
			display: flex;
			align-items: center;
			gap: 16rpx;
			min-width: 0;
		}

		&-img {
			width: 88rpx;
			height: 88rpx;
			flex-shrink: 0;
			border-radius: 12rpx;
			background: #fff;

			&--sm {
				width: 72rpx;
				height: 72rpx;
			}
		}

		&-meta {
			flex: 1;
			min-width: 0;
		}

		&-titleRow {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 10rpx;
			min-width: 0;
		}

		&-name {
			font-size: 28rpx;
			font-weight: 700;
			color: $pr-text-main;
			line-height: 1.3;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 100%;
		}

		&-tag {
			flex-shrink: 0;
			padding: 2rpx 12rpx;
			font-size: 20rpx;
			line-height: 1.4;
			font-weight: 600;
			color: $pr-theme-text;
			background: $pr-theme-soft-tag;
			border-radius: 8rpx;
		}

		&-brand {
			margin-top: 4rpx;
			color: $pr-theme-text;
			font-size: 24rpx;
		}

		&-rssi {
			margin-top: 6rpx;
			font-size: 24rpx;
			color: $pr-text-muted;
		}

		&-deviceId {
			margin-top: 4rpx;
			color: $pr-text-muted;
			font-size: 22rpx;
			word-break: break-all;
		}

		&-actions {
			display: flex;
			flex-direction: column;
			align-items: stretch;
			gap: 10rpx;
			flex-shrink: 0;
		}

		&--search &-actions {
			align-items: flex-end;
		}
	}
</style>
