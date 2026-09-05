<template>
	<view v-if="visible" class="deviceMask" @click="onMaskClick" @touchmove.stop.prevent>
		<view class="devicePanel" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">{{ title }}</view>
				<view class="devicePanel-close" @click="onClose">×</view>
			</view>

			<view class="devicePanel-toolbar" v-if="historyList.length">
				<button
					size="mini"
					class="action-btn action-btn--muted"
					@click="onClear"
				>清空历史</button>
			</view>

			<scroll-view class="devicePanel-body" scroll-y>
				<view class="historyList" v-if="historyList.length">
					<BluetoothDeviceItem
						v-for="(item, index) in historyList"
						:key="item.deviceId || index"
						:device="item"
						:index="index"
						variant="search"
						:bordered="index !== historyList.length - 1"
					>
						<template #actions>
							<button
								size="mini"
								class="action-btn action-btn--primary action-btn--sm"
								:loading="connectingId === item.deviceId"
								@click="onConnect(item)"
							>
								连接
							</button>
						</template>
					</BluetoothDeviceItem>
				</view>
				<view class="emptyBox" v-else>暂无连接历史</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	/**
	 * 连接历史弹层：样式对齐 DeviceInfoPopup
	 * 数据来源：ble config STORAGE_KEY（与 bleBlueTooth._storageKey 一致）
	 */
	import BluetoothDeviceItem from './BluetoothDeviceItem.vue'
	import { STORAGE_KEY } from '../ble/config.js'

	export default {
		name: 'ConnectHistoryPopup',
		components: {
			BluetoothDeviceItem,
		},
		props: {
			visible: {
				type: Boolean,
				default: false,
			},
			title: {
				type: String,
				default: '连接历史',
			},
			closeOnMask: {
				type: Boolean,
				default: true,
			},
			/** 外部传入优先；为空时从 STORAGE_KEY 读取 */
			deviceList: {
				type: Array,
				default: null,
			},
			connectingId: {
				type: String,
				default: '',
			},
		},
		data() {
			return {
				localList: [],
			}
		},
		computed: {
			historyList() {
				if (Array.isArray(this.deviceList)) {
					return this.deviceList
				}
				return this.localList
			},
		},
		watch: {
			visible: {
				immediate: true,
				handler: function (val) {
					if (val) {
						this.loadFromStorage()
					}
				},
			},
		},
		methods: {
			loadFromStorage() {
				try {
					const pStr = uni.getStorageSync(STORAGE_KEY)
					if (!pStr) {
						this.localList = []
						return
					}
					const pList = typeof pStr === 'string' ? JSON.parse(pStr) : pStr
					this.localList = Array.isArray(pList) ? pList : []
				} catch (e) {
					this.localList = []
				}
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
			onConnect(item) {
				this.$emit('device-connect', item)
			},
			onClear() {
				try {
					uni.setStorageSync(STORAGE_KEY, '')
				} catch (e) {}
				this.localList = []
				this.$emit('clear')
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

		&-toolbar {
			display: flex;
			justify-content: flex-end;
			padding: 12rpx 28rpx 0;
			flex-shrink: 0;
		}

		&-body {
			flex: 1;
			max-height: 70vh;
			box-sizing: border-box;
			padding: 8rpx 16rpx 20rpx;
		}
	}

	.historyList {
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.emptyBox {
		padding: 80rpx 24rpx;
		text-align: center;
		color: #a89880;
		font-size: 28rpx;
	}

	.action-btn {
		margin: 0;
		padding: 0 20rpx;
		height: 56rpx;
		line-height: 56rpx;
		font-size: 24rpx;
		font-weight: 600;
		border-radius: 999rpx;
		border: none;
		box-sizing: border-box;

		&::after {
			border: none;
		}

		&--sm {
			min-width: 112rpx;
		}

		&--muted {
			color: #8a7a64;
			background: #f3eee6;
		}

		&--primary {
			color: #fff !important;
			background: $theme !important;
		}
	}
</style>
