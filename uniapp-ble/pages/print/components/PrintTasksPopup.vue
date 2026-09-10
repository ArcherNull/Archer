<template>
	<view v-if="visible" class="deviceMask" @click="onMaskClick" @touchmove.stop.prevent>
		<view class="devicePanel" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">{{ title }}</view>
				<view class="devicePanel-close" @click="onClose">×</view>
			</view>

			<scroll-view class="devicePanel-body" scroll-y>
				<view class="taskList" v-if="taskList.length">
					<BluetoothDeviceItem
						v-for="(item, index) in taskList"
						:key="item.id"
						:device="item"
						:index="index"
						variant="search"
						:bordered="index !== taskList.length - 1"
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
				<view class="emptyBox" v-else>暂无待打印任务</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	/**
	 * 待执行打印任务弹层（非历史）
	 * 由父组件传入当前即将打印的任务列表
	 */
	import BluetoothDeviceItem from './BluetoothDeviceItem.vue'

	function pad2(n) {
		return n < 10 ? '0' + n : String(n)
	}

	export default {
		name: 'PrintTasksPopup',
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
				default: '打印任务',
			},
			closeOnMask: {
				type: Boolean,
				default: true,
			},
			/** 即将执行的打印任务 */
			tasks: {
				type: Array,
				default: function () {
					return []
				},
			},
		},
		computed: {
			taskList() {
				return Array.isArray(this.tasks) ? this.tasks : []
			},
		},
		methods: {
			formatPrintTime(ts) {
				const t = Number(ts) || Date.now()
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
			onPreview(index) {
				const list = this.taskList || []
				const item = list[index]
				if (!item) return
				this.$emit('preview', item)
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

	.taskList {
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
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
