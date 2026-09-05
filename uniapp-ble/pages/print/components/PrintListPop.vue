<template>
	<view class="ppop" v-if="openPop" @touchmove.stop.prevent>
		<view class="ppop-mask" @click="operation('1')"></view>
		<view class="ppop-panel">
			<view class="ppop-title">
				<view class="ppop-title__text">打印机列表</view>
				<view class="ppop-title__research" @click="reSearchNearByBlueToothFun">
					重新搜索
				</view>
			</view>

			<scroll-view class="ppop-scroll" scroll-y>
				<view v-if="printerList.length">
					<view
						:class="['pItem', index !== printerList.length - 1 ? 'borderBtm' : '']"
						v-for="(item, index) in printerList"
						:key="item.deviceId"
					>
						<view class="pItem-left">
							<view class="pItem-left__name">
								{{ item.name || item.localName || '未知设备' }}
							</view>
							<view class="pItem-left__id">UUID：{{ item.deviceId }}</view>
							<view class="pItem-left__id">
								信号强度：{{ item.RSSI || 0 }}dBm
							</view>
							<view class="pItem-left__id" v-if="item.printType">
								绑定：{{ printTypeText(item.printType) }}
							</view>
						</view>
						<view class="pItem-right" v-if="type">
							<button
								:class="['pBtn', item.isConnect ? 'pBtn__unactive' : 'pBtn__active']"
								:loading="printLoading && connectingId === item.deviceId"
								@click="connectPrinter(item)"
							>
								{{ item.isConnect ? '取消连接' : '连接' }}
							</button>
						</view>
					</view>
				</view>
				<view class="ppop-empty" v-else>暂无搜索到打印机，请点击重新搜索</view>
			</scroll-view>

			<view class="ppop-btn">
				<button class="ppop-btn-item ppop-btn-item--ghost" @click="operation('1')">
					关闭
				</button>
				<button
					v-if="isStarted && searchLoading"
					class="ppop-btn-item ppop-btn-item--ghost"
					@click="operation('2')"
				>
					取消搜索
				</button>
				<button
					v-if="isStarted"
					class="ppop-btn-item ppop-btn-item--primary"
					:loading="searchLoading"
					@click="operation('3')"
				>
					{{ searchLoading ? '搜索中' : '继续搜索' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * 对齐 kpsapp PrintListPop：搜索 / 连接 / 取消搜索
	 * 父页通过 ref.initCInstance(bt) 刷新列表
	 */
	import { showMsg } from '../comm/utils.js'

	export default {
		name: 'PrintListPop',
		props: {
			openPop: {
				type: Boolean,
				default: false,
			},
			type: {
				type: String,
				default: '',
			},
			printInstance: {
				type: Object,
				default: null,
			},
			connectingId: {
				type: String,
				default: '',
			},
		},
		data() {
			return {
				searchLoading: false,
				printLoading: false,
				cusBModuleInstance: null,
				printerList: [],
			}
		},
		computed: {
			isStarted() {
				const bt = this.cusBModuleInstance || this.printInstance
				return bt && bt._bluetoothModuleState === 'started'
			},
		},
		watch: {
			openPop: function (val) {
				if (val) {
					this.initCInstance(this.printInstance || this.cusBModuleInstance)
				}
			},
			printInstance: function (val) {
				if (this.openPop && val) {
					this.initCInstance(val)
				}
			},
		},
		methods: {
			printTypeText(type) {
				if (type === 'shared') return '共用打印机'
				if (type === 'label') return '打印标签'
				if (type === 'waybill') return '打印运单'
				if (type === 'receipt') return '打印回单'
				return type || ''
			},
			initCInstance(cInstance) {
				this.cusBModuleInstance = cInstance || this.printInstance || {}
				const sList = this.cusBModuleInstance._searchDevicesResultList || []
				const cList = this.cusBModuleInstance._connectedDevicesList || []
				this.getPrinterList({ sList: sList, cList: cList })
			},
			getPrinterList(pData) {
				const sList = (pData && pData.sList) || []
				const cList = (pData && pData.cList) || []
				this.printerList = sList.map(function (ele) {
					const findItem = cList.find(function (item) {
						return item.deviceId === ele.deviceId
					})
					return Object.assign({}, ele, {
						isConnect: Boolean(findItem),
						printType: (findItem && findItem.printType) || ele.printType || '',
					})
				})
			},
			connectPrinter(item) {
				this.printLoading = true
				this.$emit('connect', {
					item: item,
					type: this.type,
				})
				const that = this
				setTimeout(function () {
					that.printLoading = false
				}, 800)
			},
			operation(type) {
				switch (type) {
					case '1':
						this.$emit('update:openPop', false)
						this.$emit('close')
						break
					case '2':
						this.asyncStopSearch()
						break
					case '3':
						this.findBTDevices()
						break
				}
			},
			async asyncStopSearch() {
				try {
					const bt = this.cusBModuleInstance
					if (bt && bt.stopContinuousDeviceDiscovery) {
						await bt.stopContinuousDeviceDiscovery()
					} else if (bt && bt.stopBluetoothDevicesDiscovery) {
						await bt.stopBluetoothDevicesDiscovery()
					}
					this.searchLoading = false
					this.$emit('stop-search')
				} catch (err) {
					showMsg((err && err.message) || '停止搜索失败')
				}
			},
			async findBTDevices() {
				try {
					this.searchLoading = true
					this.$emit('continue-search')
					const bt = this.cusBModuleInstance
					if (bt && bt.startContinuousDeviceDiscovery) {
						await bt.startContinuousDeviceDiscovery('continue')
					} else if (bt && bt.searchNearByBlueTooth) {
						await bt.searchNearByBlueTooth('finded', 'continue')
					}
					this.initCInstance(bt)
				} catch (err) {
					showMsg((err && err.message) || '继续搜索失败')
				} finally {
					this.searchLoading = false
				}
			},
			async reSearchNearByBlueToothFun() {
				try {
					this.searchLoading = true
					this.$emit('research')
					const bt = this.cusBModuleInstance
					if (bt && bt.searchNearByBlueTooth) {
						await bt.searchNearByBlueTooth('finded', 'refresh')
					}
					this.initCInstance(bt)
				} catch (err) {
					showMsg((err && err.message) || '重新搜索失败')
				} finally {
					this.searchLoading = false
				}
			},
		},
	}
</script>

<style lang="scss" scoped>
	.ppop {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 1000;

		&-mask {
			position: absolute;
			left: 0;
			top: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.45);
		}

		&-panel {
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			max-height: 75vh;
			background: #fff;
			border-radius: 20rpx 20rpx 0 0;
			padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
			display: flex;
			flex-direction: column;
		}

		&-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 28rpx 32rpx 16rpx;

			&__text {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}

			&__research {
				font-size: 26rpx;
				color: #ff9407;
			}
		}

		&-scroll {
			flex: 1;
			max-height: 52vh;
			padding: 0 24rpx;
			box-sizing: border-box;
		}

		&-empty {
			padding: 80rpx 24rpx;
			text-align: center;
			color: #999;
			font-size: 26rpx;
		}

		&-btn {
			display: flex;
			gap: 16rpx;
			padding: 16rpx 24rpx 0;

			&-item {
				flex: 1;
				margin: 0;
				font-size: 28rpx;
				border-radius: 12rpx;

				&--ghost {
					background: #f5f5f5;
					color: #666;
				}

				&--primary {
					background: #ff9407;
					color: #fff;
				}
			}
		}
	}

	.pItem {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
		padding: 24rpx 8rpx;

		&-left {
			flex: 1;
			min-width: 0;

			&__name {
				font-size: 28rpx;
				color: #333;
				margin-bottom: 8rpx;
			}

			&__id {
				font-size: 22rpx;
				color: #999;
				line-height: 1.5;
				word-break: break-all;
			}
		}

		&-right {
			flex-shrink: 0;
		}
	}

	.borderBtm {
		border-bottom: 1rpx solid #eee;
	}

	.pBtn {
		margin: 0;
		min-width: 140rpx;
		height: 64rpx;
		line-height: 64rpx;
		font-size: 24rpx;
		border-radius: 8rpx;
		padding: 0 20rpx;

		&__active {
			background: #ff9407;
			color: #fff;
		}

		&__unactive {
			background: #f0f0f0;
			color: #666;
		}
	}
</style>
