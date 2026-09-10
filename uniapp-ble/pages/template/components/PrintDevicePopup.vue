<template>
	<view v-if="visible" class="deviceMask" @click="onMaskClick" @touchmove.stop.prevent>
		<view class="devicePanel printDevicePanel" @click.stop>
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

			<view class="printFooter">
				<button
					class="action-btn action-btn--lg action-btn--primary printBtn"
					:loading="printing"
					:disabled="printing"
					@click="$emit('confirm-print')"
				>
					{{ printing ? '打印中...' : '打印' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import DeviceInfo from '../../print/components/DeviceInfo.vue'

	export default {
		name: 'PrintDevicePopup',
		components: { DeviceInfo },
		props: {
			visible: { type: Boolean, default: false },
			title: { type: String, default: '连接蓝牙并打印' },
			closeOnMask: { type: Boolean, default: true },
			moduleState: { type: String, default: 'notStarted' },
			searchState: { type: String, default: 'notSearched' },
			deviceList: {
				type: Array,
				default: function () {
					return []
				},
			},
			searching: { type: Boolean, default: false },
			scanning: { type: Boolean, default: false },
			connectingId: { type: String, default: '' },
			printing: { type: Boolean, default: false },
		},
		methods: {
			onMaskClick() {
				if (this.closeOnMask && !this.printing) this.onClose()
			},
			onClose() {
				this.$emit('update:visible', false)
				this.$emit('close')
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.printDevicePanel {
		max-height: 88vh;
		display: flex;
		flex-direction: column;
	}

	.devicePanel-body {
		max-height: 62vh;

		::v-deep .box {
			margin: 12rpx 16rpx 20rpx;
		}
	}

	.printFooter {
		padding: 16rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid $pr-border-light;
		background: $pr-page-bg;
	}

	.printBtn {
		width: 100%;
		box-shadow: 0 6rpx 16rpx rgba(249, 174, 61, 0.28);
	}
</style>
