<template>
	<view class="print">
		<!-- 顶部手机设备信息 -->
		<view class="deviceBar">
			<view class="deviceBar-left">
				<text class="deviceBar-item">平台：{{ platformName }}</text>
				<text class="deviceBar-split">|</text>
				<text class="deviceBar-item">设备：{{ deviceName }}</text>
			</view>
			<view class="deviceBar-link" @click="goDebugPage">调试页</view>
		</view>

		<!-- 手机蓝牙模块 -->
		<PrintItemBox title="手机蓝牙模块" :isShowBottomLine="true">
			<view slot="right">
				<view class="btBox">
					<view :class="['btBox-start', moduleStateClass]">{{ moduleStateText }}</view>
					<view :class="['btBox-search', searchStateClass]">{{ searchStateText }}</view>
					<view v-if="moduleState === 'started'">已搜索{{ searchCount }}设备</view>
				</view>
			</view>

			<view class="cPBox">
				<view class="cPList" v-if="connectedName">
					<view class="cPList-item">{{ connectedName }}</view>
				</view>
				<view class="noMoreBox" v-else>暂无连接蓝牙打印机</view>
			</view>
		</PrintItemBox>

		<!-- 打印标签 -->
		<PrintItemBox title="打印标签" :isShowBottomLine="true">
			<view slot="right">
				<SelectPrinter :selectedPrinter="labelPrinter" />
			</view>
			<view class="main">
				<LabelBox
					label="打印份数"
					:showCheck="true"
					:checked="labelPrintChecked"
					@checked="labelPrintChecked = !labelPrintChecked"
				>
					<input
						v-if="labelPrintChecked"
						class="numInput"
						type="number"
						v-model="bqValue"
					/>
				</LabelBox>
				<LabelBox
					label="打印指定页码"
					:showCheck="true"
					:checked="!labelPrintChecked"
					@checked="labelPrintChecked = !labelPrintChecked"
				>
					<view class="pBox" v-if="!labelPrintChecked">
						<input class="numInput" type="number" v-model="assignBqValueStart" />
						<view>至</view>
						<input class="numInput" type="number" v-model="assignBqValueEnd" />
					</view>
				</LabelBox>
			</view>
		</PrintItemBox>

		<!-- 打印运单 -->
		<PrintItemBox title="打印运单" :isShowBottomLine="true">
			<view slot="right">
				<SelectPrinter :selectedPrinter="waybillPrinter" />
			</view>
			<view class="main">
				<LabelBox label="打印份数">
					<input class="numInput" type="number" v-model="ydValue" />
				</LabelBox>
				<view class="checkbox">
					<checkbox-group class="checkbox-group">
						<label
							class="checkbox-item"
							v-for="item in multiList"
							:key="item.value"
						>
							<checkbox
								color="#FF9407"
								style="transform: scale(0.7)"
								:value="item.name"
								:checked="item.checked"
							/>
							<view :class="item.checked ? 'checkbox-item__active' : 'checkbox-item__unactive'">
								{{ item.name }}
							</view>
						</label>
					</checkbox-group>
				</view>
			</view>
		</PrintItemBox>

		<!-- 打印回单 -->
		<PrintItemBox title="打印回单" :isShowBottomLine="true">
			<view slot="right">
				<SelectPrinter :selectedPrinter="receiptPrinter" />
			</view>
			<view class="main">
				<LabelBox
					label="打印份数"
					:showCheck="true"
					:checked="printReceiptChecked"
					@checked="printReceiptChecked = !printReceiptChecked"
				>
					<input
						v-if="printReceiptChecked"
						class="numInput"
						type="number"
						v-model="printReceiptNum"
					/>
				</LabelBox>
			</view>
		</PrintItemBox>

		<view class="alertBox">
			<view
				class="alertBox_item"
				v-for="(item, index) in alertTextList"
				:key="index"
			>
				{{ item }}
			</view>
		</view>

		<view class="footerBtn">
			<button type="primary" class="printBtn" disabled>打印</button>
		</view>
	</view>
</template>

<script>
	import PrintItemBox from './components/PrintItemBox.vue'
	import SelectPrinter from './components/SelectPrinter.vue'
	import LabelBox from './components/LabelBox.vue'
	import { ALERT_TEXT_LIST } from './help/index.js'

	export default {
		name: 'PrintIndex',
		components: {
			PrintItemBox,
			SelectPrinter,
			LabelBox,
		},
		data() {
			return {
				platformName: '其它',
				deviceName: '未知设备',
				moduleState: 'notStarted',
				searchState: 'notSearched',
				searchCount: 0,
				connectedName: '',
				labelPrintChecked: true,
				bqValue: 1,
				assignBqValueStart: 0,
				assignBqValueEnd: 1,
				ydValue: 1,
				printReceiptNum: 1,
				printReceiptChecked: true,
				labelPrinter: {},
				waybillPrinter: {},
				receiptPrinter: {},
				multiList: [
					{ name: '托运客户联', value: '3', checked: false },
					{ name: '收货客户联', value: '4', checked: false },
					{ name: '记账联', value: '1', checked: false },
					{ name: '存根联', value: '2', checked: false },
				],
				alertTextList: ALERT_TEXT_LIST,
			}
		},
		computed: {
			moduleStateText() {
				if (this.moduleState === 'started') return '已启动'
				if (this.moduleState === 'starting') return '正在启动...'
				return '未启动'
			},
			searchStateText() {
				if (this.searchState === 'searched') return '已搜索'
				if (this.searchState === 'searching') return '正在搜索...'
				return '未搜索'
			},
			moduleStateClass() {
				if (this.moduleState === 'started') return 'activeCss'
				if (this.moduleState === 'starting') return 'activeingCss'
				return 'unactiveCss'
			},
			searchStateClass() {
				if (this.searchState === 'searched') return 'activeCss'
				if (this.searchState === 'searching') return 'activeingCss'
				return 'unactiveCss'
			},
		},
		onLoad() {
			this.initDeviceInfo()
		},
		methods: {
			resolveDeviceName(systemInfo) {
				systemInfo = systemInfo || {}
				const brand = String(systemInfo.brand || systemInfo.deviceBrand || '').trim()
				const model = String(
					systemInfo.deviceModel || systemInfo.model || systemInfo.deviceId || ''
				).trim()
				if (brand && model) {
					if (model.toLowerCase().startsWith(brand.toLowerCase())) {
						return model
					}
					return brand + ' ' + model
				}
				return model || brand || '未知设备'
			},
			resolvePlatformName(systemInfo) {
				systemInfo = systemInfo || {}
				const osName = String(systemInfo.osName || '').toLowerCase()
				const platform = String(systemInfo.platform || '').toLowerCase()
				const system = String(systemInfo.system || '').toLowerCase()
				const romName = String(systemInfo.romName || '').toLowerCase()
				const isHarmony =
					osName.indexOf('harmony') !== -1 ||
					platform.indexOf('harmony') !== -1 ||
					system.indexOf('harmony') !== -1 ||
					romName.indexOf('harmony') !== -1
				if (isHarmony) return '鸿蒙'
				if (osName === 'ios' || platform === 'ios') return 'iOS'
				if (osName === 'android' || platform === 'android') return '安卓'
				return systemInfo.osName || systemInfo.platform || '其它'
			},
			initDeviceInfo() {
				try {
					const systemInfo = uni.getSystemInfoSync() || {}
					this.platformName = this.resolvePlatformName(systemInfo)
					this.deviceName = this.resolveDeviceName(systemInfo)
				} catch (e) {
					this.platformName = '其它'
					this.deviceName = '未知设备'
				}
			},
			goDebugPage() {
				uni.navigateTo({
					url: '/pages/print/debugPage/index',
				})
			},
		},
	}
</script>

<style lang="scss" scoped>
	.print {
		padding-bottom: 150rpx;
		background: #f5f5f5;
		min-height: 100vh;
	}

	.deviceBar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
		padding: 16rpx 24rpx;
		background: #fff;
		border-bottom: 1rpx solid #eee;
		font-size: 26rpx;
		color: #ff9407;

		&-left {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 8rpx;
			flex: 1;
			min-width: 0;
		}

		&-split {
			color: #ccc;
		}

		&-item {
			color: #333;
		}

		&-link {
			flex-shrink: 0;
			color: #ff9407;
			font-size: 26rpx;
			padding: 4rpx 0;
		}
	}

	.btBox {
		display: flex;
		gap: 12rpx;
		flex-wrap: wrap;
		justify-content: flex-end;
		font-size: 26rpx;
	}

	.unactiveCss {
		color: #dd524d;
	}

	.activeingCss {
		color: #ff9407;
	}

	.activeCss {
		color: #4cd964;
	}

	.cPList {
		display: flex;
		gap: 20rpx;
		justify-content: flex-start;

		&-item {
			padding: 10rpx 20rpx;
			border: solid 1px #ff9407;
			border-radius: 6rpx;
			color: #333;
			font-size: 28rpx;
		}
	}

	.noMoreBox {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
		height: 100rpx;
	}

	.main {
		padding: 8rpx 0;
	}

	.numInput {
		width: 120rpx;
		height: 56rpx;
		line-height: 56rpx;
		text-align: center;
		border: 1rpx solid #e3e3e3;
		border-radius: 8rpx;
		background: #fafafa;
		font-size: 28rpx;
	}

	.pBox {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 16rpx;
	}

	.checkbox {
		padding: 12rpx 0 8rpx;

		&-group {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 16rpx;
		}

		&-item {
			display: flex;
			align-items: center;
			justify-content: flex-start;

			&__active {
				color: #ff9407;
			}

			&__unactive {
				color: #333;
			}
		}
	}

	.alertBox {
		color: #999;
		font-size: 24rpx;
		line-height: 32rpx;
		padding: 20rpx;

		&_item {
			margin-bottom: 4rpx;
		}
	}

	.footerBtn {
		position: fixed;
		z-index: 100;
		left: 0;
		bottom: 0;
		width: 100vw;
		padding: 16rpx 20rpx calc(16rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);
		box-sizing: border-box;
	}

	.printBtn {
		margin: 0;
		background: #ff9407;
		color: #fff;
	}
</style>
