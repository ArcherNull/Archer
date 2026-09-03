<template>
	<PrintItemBox title="设备信息" :isShowBottomLine="true">
		<template #right>
			<view class="btBox" v-if="bt">
				<view
					:class="['btBox-start', moduleStateClass]"
					@click="emitRestart"
				>
					{{ moduleStateText }}
				</view>
				<view
					:class="['btBox-search', searchStateClass]"
					@click="emitResearch"
				>
					{{ searchStateText }}
				</view>
				<view v-if="bt._bluetoothModuleState === 'started'">
					已搜索{{ deviceList.length }}设备
				</view>
			</view>
			<view class="unactiveCss" v-else @click="emitOpenSearch">
				未启动
			</view>
		</template>

		<view class="ops">
			<button
				type="primary"
				class="primary-btn ops-btn"
				size="mini"
				:loading="searching"
				@click="emitOpenSearch"
			>
				开启蓝牙并搜索设备
			</button>
			<button size="mini" class="ops-btn" :loading="scanning" @click="emitScanJoin">
				扫码加入设备
			</button>
		</view>

		<view class="cPBox">
			<view class="cPTitle">已连接蓝牙设备</view>
			<view class="cPList" v-if="connectedList.length">
				<view class="cPList-item" v-for="(item, index) in connectedList" :key="item.deviceId || index">
					<view class="cPList-item__name">{{ item.name || item.localName || '未命名设备' }}</view>
					<button size="mini" class="disconnectBtn" @click="emitDisconnect(item)">取消连接</button>
				</view>
			</view>
			<view class="noMoreBox" v-else>暂无连接蓝牙设备</view>
		</view>

		<view class="listBox">
			<view class="cPTitle">已搜索蓝牙设备</view>
			<scroll-view class="listScroll" scroll-y>
				<view
					v-for="(item, index) in deviceList"
					:key="item.deviceId || index"
					:class="['pItem', index !== deviceList.length - 1 ? 'borderBtm' : '']"
				>
					<view class="pItem-left">
						<view class="pItem-left__name">{{ item.name || item.localName || '未命名设备' }}</view>
						<view class="pItem-left__id">信号：{{ item.RSSI || 0 }} dBm</view>
					</view>
					<view class="pItem-right">
						<button
							:class="['pBtn', item.isConnect ? 'pBtn__unactive' : 'pBtn__active']"
							size="mini"
							:loading="connectingId === item.deviceId"
							@click="emitConnect(item)"
						>
							{{ item.isConnect ? '已连接' : '连接' }}
						</button>
					</view>
				</view>
				<view v-if="!deviceList.length" class="noMoreBox">暂无搜索结果</view>
			</scroll-view>
		</view>
	</PrintItemBox>
</template>

<script setup>
	import {
		computed
	} from 'vue'
	import PrintItemBox from './PrintItemBox.vue'

	const props = defineProps({
		bt: {
			type: Object,
			default: null
		},
		btVersion: {
			type: Number,
			default: 0
		},
		searching: {
			type: Boolean,
			default: false
		},
		scanning: {
			type: Boolean,
			default: false
		},
		connectingId: {
			type: String,
			default: ''
		}
	})

	const emits = defineEmits([
		'open-search',
		'research',
		'restart',
		'scan-join',
		'connect',
		'disconnect'
	])

	const deviceList = computed(() => {
		void props.btVersion
		return props.bt?._searchDevicesResultList || []
	})

	const connectedList = computed(() => {
		void props.btVersion
		return props.bt?._connectedDevicesList || []
	})

	const moduleStateText = computed(() => {
		void props.btVersion
		const s = props.bt?._bluetoothModuleState
		if (s === 'started') return '已启动'
		if (s === 'starting') return '正在启动...'
		return '未启动'
	})

	const searchStateText = computed(() => {
		void props.btVersion
		const s = props.bt?._bluetoothModuleSearchState
		if (s === 'searched') return '已搜索'
		if (s === 'searching') return '正在搜索...'
		return '未搜索'
	})

	const moduleStateClass = computed(() => {
		void props.btVersion
		const s = props.bt?._bluetoothModuleState
		if (s === 'started') return 'activeCss'
		if (s === 'starting') return 'activeingCss'
		return 'unactiveCss'
	})

	const searchStateClass = computed(() => {
		void props.btVersion
		const s = props.bt?._bluetoothModuleSearchState
		if (s === 'searched') return 'activeCss'
		if (s === 'searching') return 'activeingCss'
		return 'unactiveCss'
	})

	function emitOpenSearch() {
		emits('open-search')
	}

	function emitResearch() {
		emits('research')
	}

	function emitRestart() {
		emits('restart')
	}

	function emitScanJoin() {
		emits('scan-join')
	}

	function emitConnect(item) {
		emits('connect', item)
	}

	function emitDisconnect(item) {
		emits('disconnect', item)
	}
</script>

<style lang="scss" scoped>
	.btBox {
		display: flex;
		gap: 12rpx;
		flex-wrap: wrap;
		justify-content: flex-end;
		font-size: 26rpx;
	}

	.unactiveCss {
		color: $uni-color-error;
	}

	.activeingCss {
		color: $uni-color-primary;
	}

	.activeCss {
		color: $uni-color-success;
	}

	.ops {
		display: flex;
		gap: 16rpx;
		flex-wrap: wrap;
		padding: 8rpx 0 16rpx;
	}

	.ops-btn {
		margin: 0;
	}

	.cPTitle {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 12rpx;
	}

	.cPList {
		display: flex;
		flex-direction: column;
		gap: 12rpx;

		&-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16rpx;
			padding: 12rpx 16rpx;
			border: solid 1px $uni-color-primary;
			border-radius: 8rpx;

			&__name {
				flex: 1;
				color: #333;
				font-size: 28rpx;
			}
		}
	}

	.disconnectBtn {
		margin: 0;
		color: #fff;
		background: #999;
	}

	.noMoreBox {
		min-height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
	}

	.listBox {
		margin-top: 20rpx;
	}

	.listScroll {
		max-height: 420rpx;
		border: 1rpx solid #eee;
		border-radius: 8rpx;
		padding: 0 16rpx;
		box-sizing: border-box;
	}

	.pItem {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		padding: 16rpx 0;

		&-left {
			flex: 1;

			&__name {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
			}

			&__id {
				font-size: 26rpx;
				color: #999;
				margin-top: 4rpx;
			}
		}

		&-right {
			width: 160rpx;
		}
	}

	.pBtn {
		height: 48rpx;
		padding: 0 20rpx;
		border-radius: 24rpx;
		color: #fff;
		font-size: 26rpx;
		width: 140rpx;
		line-height: 48rpx;
		text-align: center;
		margin: 0;

		&__unactive {
			background-color: #999;
		}

		&__active {
			background-color: $uni-color-primary;
		}
	}

	.borderBtm {
		border-bottom: solid 2rpx #e3e3e3;
		box-sizing: border-box;
	}
</style>
