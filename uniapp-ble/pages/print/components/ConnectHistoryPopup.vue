<template>
	<view v-if="visible" class="deviceMask" @click="onMaskClick" @touchmove.stop.prevent>
		<view class="devicePanel" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">{{ title }}</view>
				<view class="devicePanel-close" @click="onClose">×</view>
			</view>

			<view class="tabBar">
				<view class="tabBar-tabs">
					<view
						:class="['tabBar-item', activeTab === 'devices' ? 'tabBar-item--active' : '']"
						@click="activeTab = 'devices'"
					>蓝牙连接历史</view>
					<view
						:class="['tabBar-item', activeTab === 'tasks' ? 'tabBar-item--active' : '']"
						@click="activeTab = 'tasks'"
					>打印任务历史</view>
				</view>
				<button
					size="mini"
					class="action-btn action-btn--muted action-btn--sm tabBar-clear"
					:disabled="!canClear"
					@click="onClear"
				>清空</button>
			</view>

			<scroll-view class="devicePanel-body" scroll-y>
				<!-- 连接历史：从一周内打印任务提取设备 -->
				<template v-if="activeTab === 'devices'">
					<view class="historyList" v-if="historyList.length">
						<BluetoothDeviceItem
							v-for="(item, index) in historyList"
							:key="item.deviceId"
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
					<view class="emptyBox" v-else>暂无连接历史（打印任务中无设备）</view>
				</template>

				<!-- 打印任务历史 -->
				<template v-else>
					<view class="historyList" v-if="taskHistoryList.length">
						<BluetoothDeviceItem
							v-for="(item, index) in taskHistoryList"
							:key="item.id || index"
							:device="item"
							:index="index"
							variant="search"
							:bordered="index !== taskHistoryList.length - 1"
							:show-print-type="!!item.printType"
						>
							<template #actions>
								<view class="taskActions">
									<view class="taskActions-name">{{ item.templateName || '打印任务' }}</view>
									<view class="taskActions-time">{{ formatPrintTime(item.printTime) }}</view>
									<button
										size="mini"
										class="action-btn action-btn--primary action-btn--sm"
										@click.stop="onPreview(index)"
									>
										预览
									</button>
								</view>
							</template>
						</BluetoothDeviceItem>
					</view>
					<view class="emptyBox" v-else>暂无一周内打印任务历史</view>
				</template>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	/**
	 * 连接历史弹层：
	 * - Tab1 蓝牙连接历史：从 kps-history-print-tasks 提取设备
	 * - Tab2 打印任务历史：一周内已执行打印任务
	 */
	import BluetoothDeviceItem from './BluetoothDeviceItem.vue'
	import {
		loadPrintTasks,
		savePrintTasks,
		extractDevicesFromPrintTasks,
	} from '../ble/config.js'

	function pad2(n) {
		return n < 10 ? '0' + n : String(n)
	}

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
			/** 外部传入设备列表优先；为空时从打印任务提取 */
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
				activeTab: 'devices',
				localDeviceList: [],
				taskHistoryList: [],
			}
		},
		computed: {
			historyList() {
				if (Array.isArray(this.deviceList)) {
					return this.deviceList
				}
				return this.localDeviceList
			},
			canClear() {
				if (this.activeTab === 'devices') {
					return this.historyList.length > 0
				}
				return this.taskHistoryList.length > 0
			},
		},
		watch: {
			visible: {
				immediate: true,
				handler: function (val) {
					if (val) {
						this.activeTab = 'devices'
						this.loadFromStorage()
					}
				},
			},
		},
		methods: {
			loadFromStorage() {
				const tasks = loadPrintTasks()
				this.taskHistoryList = tasks
				this.localDeviceList = extractDevicesFromPrintTasks(tasks)
			},
			formatPrintTime(ts) {
				const t = Number(ts) || 0
				if (!t) return '--'
				const d = new Date(t)
				return (
					d.getFullYear() +
					'-' +
					pad2(d.getMonth() + 1) +
					'-' +
					pad2(d.getDate()) +
					' ' +
					pad2(d.getHours()) +
					':' +
					pad2(d.getMinutes()) +
					':' +
					pad2(d.getSeconds())
				)
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
			onPreview(index) {
				const list = this.taskHistoryList || []
				const item = list[index]
				if (!item) return
				this.$emit('preview', item)
			},
			onClear() {
				// 设备历史来自打印任务，清空统一清任务缓存
				savePrintTasks([])
				this.localDeviceList = []
				this.taskHistoryList = []
				this.$emit('clear', this.activeTab)
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../comm/common.scss';

	.tabBar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
		padding: 12rpx 20rpx 8rpx;
		background: #fff;
		border-bottom: 1rpx solid $pr-border-light;
		flex-shrink: 0;

		&-tabs {
			display: flex;
			align-items: center;
			gap: 8rpx;
			flex: 1;
			min-width: 0;
		}

		&-item {
			padding: 10rpx 18rpx;
			border-radius: 999rpx;
			font-size: 24rpx;
			color: $pr-text-muted;
			background: $pr-page-bg;
			white-space: nowrap;

			&--active {
				color: #fff;
				background: $pr-theme;
				font-weight: 600;
			}
		}

		&-clear {
			flex-shrink: 0;
			margin: 0;
		}
	}

	.devicePanel-body {
		max-height: 70vh;
		min-height: 40vh;
		padding: 8rpx 16rpx 20rpx;
	}

	.historyList {
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;

		::v-deep .bdi--search {
			padding: 20rpx 24rpx;
		}
	}

	.taskActions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8rpx;
		min-width: 180rpx;

		&-name {
			font-size: 24rpx;
			font-weight: 600;
			color: $pr-theme-text;
			text-align: right;
			max-width: 220rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&-time {
			font-size: 20rpx;
			color: $pr-text-muted;
			text-align: right;
		}
	}
</style>
