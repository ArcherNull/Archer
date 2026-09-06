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
	@import '../comm/common.scss';

	.devicePanel-body {
		max-height: 70vh;
		min-height: 40vh;
		padding: 8rpx 16rpx 20rpx;
	}

	.historyList {
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}
</style>
