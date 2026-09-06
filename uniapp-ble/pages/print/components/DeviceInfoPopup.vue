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
	@import '../comm/common.scss';

	.devicePanel-body {
		max-height: 80vh;

		/* DeviceInfo 内 PrintItemBox 在弹层中收紧边距 */
		::v-deep .box {
			margin: 12rpx 16rpx 20rpx;
		}
	}
</style>
