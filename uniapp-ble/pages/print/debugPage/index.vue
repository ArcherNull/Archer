<template>
	<view class="printPage">
		<view class="printPage-body">
			<DeviceInfo
				:module-state="moduleState"
				:search-state="searchState"
				:device-list="deviceList"
				:searching="searching"
				:scanning="scanning"
				:connecting-id="connectingId"
				@open-search="openBluetoothAndSearch"
				@research="reSearchDevices"
				@restart="restartBluetooth"
				@scan-join="scanJoinDevice"
				@device-connect="onDeviceConnect"
				@device-disconnect="onDeviceDisconnect"
				@disconnect-all="disconnectAllDevices"
				@toggle-search="toggleContinuousSearch"
				@clear-search="clearSearchResults"
				@brand-bind="onBrandBind"
			/>

			<TemplateSelect
				:template-options="templateOptions"
				:template-index="templateIndex"
				:template-mode="templateMode"
				@update:templateIndex="onTemplateIndexUpdate"
				@update:templateMode="onTemplateModeUpdate"
				@change="onTemplateIndexUpdate"
				@mode-change="onTemplateModeUpdate"
				@preview="onCommonTemplatePreview"
			/>

			<PrintSettings
				:platform-name="platformName"
				:device-name="deviceName"
				:config="printConfig"
				:platform-default-config="platformDefaultConfig"
				@update:config="onConfigUpdate"
				@apply="applyPrintConfig"
			/>

			<view class="signalTip">
				<view class="signalTip-badge">提示</view>
				<view class="signalTip-main">
					<view class="signalTip-title">信号强度常识</view>
					<view class="signalTip-list">
						<text
							class="signalTip-item"
							v-for="(item, index) in signalTipList"
							:key="index"
						>{{ item }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="footerBar">
			<PrintTaskStatus
				:print-status-info="printStatusInfo"
				:print-progress-view="printProgressView"
				:print-loading="printLoading"
			/>
			<view class="footerBar-row">
				<button
					class="cancelBtn"
					:disabled="!printLoading"
					@click="cancelRecursivePrint"
				>
					取消
				</button>
				<button
					type="primary"
					class="primary-btn printBtn"
					:disabled="printLoading"
					@click="confirmPrinting"
				>
					{{ printLoading ? '打印中...' : '开始打印' }}
				</button>
			</view>
		</view>

		<PreviewPopup
			:visible="previewVisible"
			:title="previewTitle"
			:ops="previewOps"
			@update:visible="onPreviewVisibleUpdate"
			@close="previewVisible = false"
		/>
	</view>
</template>

<script>
	import PrintSettings from '../components/PrintSettings.vue'
	import DeviceInfo from '../components/DeviceInfo.vue'
	import TemplateSelect from '../components/TemplateSelect.vue'
	import PrintTaskStatus from '../components/PrintTaskStatus.vue'
	import PreviewPopup from '../template-comm/preivew/PreviewPopup.vue'
	import { createBluetoothAdapter } from '../ble/index.js'
	import { resolvePrinterBrandInfo } from '../ble/config.js'
	import { showMsg, isNotEmptyArr } from '../comm/utils.js'
	import { SIGNAL_TIP_LIST } from '../help/index.js'
	import { template5 } from './template/CC3/template5.js'
	import { template8 } from './template/HM/template8.js'
	import {
		COMMON_TEMPLATE_OPTIONS,
		buildCommonTemplate,
		getCommonTemplateCpcl,
	} from '../template-comm/template/index.js'
	import { getMockByTemplateKey } from '../template-comm/mock/index.js'

	const brandTemplateMap = {
		template5: template5,
		template8: template8,
	}

	/** 品牌 → 默认模板 key：芝柯(CC3) / 汉印(HM) */
	const BRAND_TEMPLATE_KEY = {
		CC3: 'template5',
		HM: 'template8',
	}

	const brandTemplateOptions = [
		{ key: 'template5', label: '模板5-芝柯', brand: 'CC3', desc: 'template5' },
		{ key: 'template8', label: '模板8-汉印', brand: 'HM', desc: 'template8' },
	]

	const commonTemplateOptions = COMMON_TEMPLATE_OPTIONS.slice()

	export default {
		name: 'PrintDebugPage',
		components: {
			PrintSettings,
			DeviceInfo,
			TemplateSelect,
			PrintTaskStatus,
			PreviewPopup,
		},
		data() {
			const defaultTplIndex = brandTemplateOptions.findIndex(function (item) {
				return item.key === 'template8'
			})
			return {
				templateMode: 'brand',
				templateOptions: brandTemplateOptions,
				signalTipList: SIGNAL_TIP_LIST,
				cusBModuleInstance: null,
				btVersion: 0,
				moduleState: 'notStarted',
				searchState: 'notSearched',
				deviceList: [],
				printConfig: {},
				platformDefaultConfig: {},
				platformName: '其它',
				deviceName: '未知设备',
				templateIndex: defaultTplIndex >= 0 ? defaultTplIndex : 0,
				previewVisible: false,
				previewTitle: '',
				previewOps: [],
				printLoading: false,
				searching: false,
				scanning: false,
				connectingId: '',
				pendingClosePromise: null,
				printProgress: {
					estimatedSec: 0,
					printProgress: 0,
					transferProgress: 0,
					elapsedSec: 0,
					status: 'idle',
				},
				printProgressVersion: 0,
			}
		},
		computed: {
			currentTemplate() {
				return this.templateOptions[this.templateIndex] || this.templateOptions[0]
			},
			connectedBtDevice() {
				void this.btVersion
				const list = (this.cusBModuleInstance && this.cusBModuleInstance._connectedDevicesList) || []
				return list[0] || null
			},
			printStatusInfo() {
				void this.btVersion
				const bt = this.cusBModuleInstance
				const btDevice = this.connectedBtDevice
				const cfg = this.printConfig || {}
				let rssi = btDevice && btDevice.RSSI
				if ((rssi === undefined || rssi === null) && btDevice && btDevice.deviceId && bt) {
					const found = (bt._searchDevicesResultList || []).find(function (ele) {
						return ele.deviceId === btDevice.deviceId
					})
					rssi = found && found.RSSI
				}
				return {
					platformName: this.platformName || '其它',
					deviceName: this.deviceName || '未知设备',
					btDeviceName: (btDevice && (btDevice.name || btDevice.localName)) || '未连接',
					btRssi: (rssi === 0 || (rssi !== undefined && rssi !== null)) ? rssi : '--',
					mtu: Number(cfg.mtu) || 0,
					packetIntervalMs: Number(cfg.packetIntervalMs) || 0,
					retryIntervalMs: Number(cfg.retryIntervalMs) || 0,
				}
			},
			printProgressView() {
				void this.printProgressVersion
				return {
					estimatedSec: Number(this.printProgress.estimatedSec || 0),
					printProgress: Number(this.printProgress.printProgress || 0),
					transferProgress: Number(this.printProgress.transferProgress || 0),
					elapsedSec: Number(this.printProgress.elapsedSec || 0),
					status: this.printProgress.status || 'idle',
				}
			},
		},
		watch: {
			templateIndex: function () {
				if (!this.printLoading) {
					this.previewEstimatedTime()
				}
			},
			templateMode: function () {
				if (!this.printLoading) {
					this.previewEstimatedTime()
				}
			},
			printConfig: {
				deep: true,
				handler: function () {
					if (!this.printLoading) {
						this.previewEstimatedTime()
					}
				},
			},
		},
		onShow() {
			this.initBlueTooth()
		},
		onHide() {
			this.teardownBlueTooth()
		},
		onUnload() {
			this.teardownBlueTooth()
		},
		methods: {
			/** 离开页面：停止搜索并关闭蓝牙连接 */
			teardownBlueTooth() {
				const bt = this.cusBModuleInstance
				if (!bt) return
				this.searching = false
				this.cusBModuleInstance = null
				this.syncDeviceViewFromBt()
				this.btVersion += 1
				const that = this
				this.pendingClosePromise = Promise.resolve()
					.then(function () {
						if (bt.stopContinuousDeviceDiscovery) {
							return bt.stopContinuousDeviceDiscovery()
						}
						if (bt.stopBluetoothDevicesDiscovery) {
							return bt.stopBluetoothDevicesDiscovery()
						}
					})
					.catch(function () {})
					.then(function () {
						if (bt.safeCloseBluetoothAdapter) {
							return bt.safeCloseBluetoothAdapter()
						}
						if (bt.closeBluetoothAdapter) {
							return bt.closeBluetoothAdapter()
						}
					})
					.catch(function () {})
					.then(function () {
						that.pendingClosePromise = null
					})
			},
			onTemplateIndexUpdate(index) {
				this.templateIndex = Number(index)
			},
			onTemplateModeUpdate(mode) {
				const next = mode === 'common' ? 'common' : 'brand'
				if (next === this.templateMode) return
				this.templateMode = next
				this.templateOptions =
					next === 'common' ? commonTemplateOptions : brandTemplateOptions
				this.templateIndex = 0
				if (next === 'brand') {
					this.syncTemplateByConnectedDevice()
				}
			},
			onPreviewVisibleUpdate(v) {
				this.previewVisible = !!v
			},
			resolveConnectedBrand() {
				const btDevice = this.connectedBtDevice
				if (!btDevice) return 'common'
				const deviceName = btDevice.name || btDevice.localName || ''
				const brandInfo = resolvePrinterBrandInfo(deviceName, btDevice.deviceId || '')
				if (brandInfo.brand) return brandInfo.brand
				// 与 ble 编码分支对齐：GBK 机→CC3，其余已连接设备按汉印，避免结尾指令用错多走纸
				const bt = this.cusBModuleInstance
				if (bt && typeof bt.isGbkPrinter === 'function' && bt.isGbkPrinter(deviceName, btDevice.deviceId || '')) {
					return 'CC3'
				}
				return 'HM'
			},
			onCommonTemplatePreview(payload) {
				const item = (payload && payload.item) || this.currentTemplate
				if (!item || !item.key) {
					showMsg('无法预览该模板')
					return
				}
				const mock = getMockByTemplateKey(item.key) || {}
				const brand = this.resolveConnectedBrand()
				const built = buildCommonTemplate(item.key, mock, { brand: brand })
				if (!built || !built.ops || !built.ops.length) {
					showMsg('预览数据为空')
					return
				}
				this.previewTitle = item.label || '模板预览'
				this.previewOps = built.ops
				this.previewVisible = true
			},
			previewEstimatedTime() {
				const bt = this.cusBModuleInstance
				if (!bt) return
				const list = bt._connectedDevicesList || []
				const tpl = this.getSelectedTemplateStr()
				if (!isNotEmptyArr(list) || !tpl) {
					this.printProgress = Object.assign({}, this.printProgress, { estimatedSec: 0 })
					this.printProgressVersion += 1
					return
				}
				const device = list[0]
				const estimatedSec = bt.estimatePrintTimeSec([{
					deviceId: device.deviceId,
					name: device.name,
					localName: device.localName,
					printDataStr: tpl,
				}])
				this.printProgress = Object.assign({}, this.printProgress, { estimatedSec: estimatedSec })
				this.printProgressVersion += 1
			},
			syncPrintProgressFromBt() {
				const bt = this.cusBModuleInstance
				if (!bt) return
				this.printProgress = bt.getPrintProgress()
				this.printProgressVersion += 1
			},
			bumpBtVersion() {
				this.btVersion += 1
				this.syncDeviceViewFromBt()
				this.syncConfigFromBt()
				this.syncTemplateByConnectedDevice()
				this.syncPrintProgressFromBt()
				if (this.cusBModuleInstance && this.cusBModuleInstance._continuousDiscovering) {
					this.searching = true
				}
				if (!this.printLoading) {
					this.previewEstimatedTime()
				}
			},
			/**
			 * 按已连接打印机品牌自动选择模板：芝柯→模板5，汉印→模板8（仅品牌模式）
			 */
			syncTemplateByConnectedDevice() {
				if (this.templateMode !== 'brand') return
				const btDevice = this.connectedBtDevice
				if (!btDevice) return
				const deviceName = btDevice.name || btDevice.localName || ''
				const brandInfo = resolvePrinterBrandInfo(deviceName, btDevice.deviceId || '')
				const templateKey = BRAND_TEMPLATE_KEY[brandInfo.brand]
				if (!templateKey) return
				const index = this.templateOptions.findIndex(function (item) {
					return item.key === templateKey
				})
				if (index >= 0 && index !== this.templateIndex) {
					this.templateIndex = index
				}
			},
			onBrandBind() {
				this.bumpBtVersion()
			},
			mapDeviceForView(item, connectedIds) {
				if (!item) return null
				const deviceId = item.deviceId || ''
				if (!deviceId) return null
				const isConnect = connectedIds
					? connectedIds.indexOf(deviceId) !== -1
					: !!item.isConnect
				return {
					deviceId: deviceId,
					name: item.name || '',
					localName: item.localName || '',
					RSSI: item.RSSI,
					isConnect: isConnect,
					printType: item.printType || '',
				}
			},
			syncDeviceViewFromBt() {
				const bt = this.cusBModuleInstance
				if (!bt) {
					this.moduleState = 'notStarted'
					this.searchState = 'notSearched'
					this.deviceList = []
					return
				}
				this.moduleState = bt._bluetoothModuleState || 'notStarted'
				this.searchState = bt._bluetoothModuleSearchState || 'notSearched'
				const sList = bt._searchDevicesResultList || []
				const cList = bt._connectedDevicesList || []
				const connectedIds = cList
					.map(function (ele) {
						return (ele && ele.deviceId) || ''
					})
					.filter(Boolean)
				const fromSearch = sList
					.map((item) => this.mapDeviceForView(item, connectedIds))
					.filter(Boolean)
				const searchIds = fromSearch.map(function (ele) {
					return ele.deviceId
				})
				const fromConnectedOnly = cList
					.filter(function (item) {
						return item && item.deviceId && searchIds.indexOf(item.deviceId) === -1
					})
					.map((item) => this.mapDeviceForView(item, connectedIds))
					.filter(Boolean)
				this.deviceList = fromSearch.concat(fromConnectedOnly)
			},
			syncConfigFromBt() {
				const bt = this.cusBModuleInstance
				if (!bt) return
				this.platformName = bt.getPlatformDisplayName()
				this.deviceName = bt.getDeviceDisplayName()
				this.platformDefaultConfig = bt.getPlatformDefaultConfig()
				this.printConfig = bt.getPrintConfig()
			},
			async initBlueTooth() {
				const that = this
				if (this.pendingClosePromise) {
					try {
						await this.pendingClosePromise
					} catch (e) {}
					await new Promise(function (resolve) {
						setTimeout(resolve, 400)
					})
				}
				const needSetup =
					!this.cusBModuleInstance ||
					this.cusBModuleInstance._bluetoothModuleState !== 'started'
				if (!this.cusBModuleInstance) {
					const instance = createBluetoothAdapter()
					instance.on('stateChange', function () {
						that.bumpBtVersion()
					})
					instance.on('printProgress', function () {
						that.syncPrintProgressFromBt()
					})
					this.cusBModuleInstance = instance
					this.syncConfigFromBt()
					this.syncPrintProgressFromBt()
				}
				if (needSetup) {
					const instance = this.cusBModuleInstance
					await instance.setupBlueTooth()
					if (instance.refreshHistoryDevicesFromTasks) {
						instance.refreshHistoryDevicesFromTasks()
					}
					await instance.connectHistoryPrintDevices()
				}
				this.bumpBtVersion()
				return this.cusBModuleInstance
			},
			onConfigUpdate(cfg) {
				this.printConfig = Object.assign({}, cfg)
			},
			applyPrintConfig(cfg) {
				const bt = this.cusBModuleInstance
				if (!bt) {
					showMsg('请先启动蓝牙模块')
					return
				}
				bt.updatePrintConfig(cfg)
				this.syncConfigFromBt()
			},
			async openBluetoothAndSearch() {
				try {
					this.searching = true
					const bt = await this.initBlueTooth()
					await bt.searchNearByBlueTooth('finded', 'refresh')
					this.bumpBtVersion()
				} catch (err) {
					showMsg((err && err.message) || '搜索蓝牙设备失败')
				} finally {
					this.searching = !!(this.cusBModuleInstance && this.cusBModuleInstance._continuousDiscovering)
				}
			},
			async reSearchDevices() {
				try {
					this.searching = true
					const bt = await this.initBlueTooth()
					await bt.reSearchNearByBlueTooth()
					this.bumpBtVersion()
				} catch (err) {
					showMsg((err && err.message) || '重新搜索失败')
				} finally {
					this.searching = !!(this.cusBModuleInstance && this.cusBModuleInstance._continuousDiscovering)
				}
			},
			async toggleContinuousSearch() {
				try {
					const bt = await this.initBlueTooth()
					if (this.searching || bt._continuousDiscovering) {
						await bt.stopContinuousDeviceDiscovery()
						this.searching = false
						this.bumpBtVersion()
						return
					}
					this.searching = true
					// 每次重新搜索都先停再开，并回填系统缓存中的已发现设备
					const ok = await bt.startContinuousDeviceDiscovery('continue')
					if (!ok) {
						this.searching = false
					}
					this.bumpBtVersion()
				} catch (err) {
					this.searching = false
					showMsg((err && err.message) || '搜索失败')
				}
			},
			async clearSearchResults() {
				const bt = this.cusBModuleInstance
				if (!bt) {
					this.deviceList = []
					return
				}
				// 清空时若正在搜索，先停扫，避免列表空了却收不到旧设备回调
				if (bt._continuousDiscovering || this.searching) {
					try {
						await bt.stopContinuousDeviceDiscovery()
					} catch (e) {}
					this.searching = false
				}
				bt.clearSearchDevicesResultList()
				this.bumpBtVersion()
			},
			async disconnectAllDevices() {
				try {
					const bt = await this.initBlueTooth()
					await bt.disconnectAllConnectedDevices()
					this.bumpBtVersion()
				} catch (err) {
					showMsg((err && err.message) || '全部中断失败')
				}
			},
			async restartBluetooth() {
				const bt = await this.initBlueTooth()
				await bt.restartOpenBluetoothAdapter()
				this.searching = false
				this.bumpBtVersion()
			},
			async scanJoinDevice() {
				const that = this
				this.scanning = true
				uni.scanCode({
					onlyFromCamera: false,
					success: async function (res) {
						try {
							const code = String((res && res.result) || '').trim()
							if (!code) {
								showMsg('扫码结果为空')
								return
							}
							const bt = await that.initBlueTooth()
							await bt.searchNearByBlueTooth('finded', 'refresh')
							that.bumpBtVersion()
							const list = bt._searchDevicesResultList || []
							const matched = list.find(function (ele) {
								const name = (ele && (ele.name || ele.localName)) || ''
								const deviceId = (ele && ele.deviceId) || ''
								return deviceId === code ||
									name === code ||
									deviceId.toLowerCase() === code.toLowerCase() ||
									name.indexOf(code) !== -1 ||
									deviceId.indexOf(code) !== -1
							})
							if (matched) {
								await that.connectDevice(matched.deviceId)
							} else {
								showMsg('未匹配到设备：' + code)
							}
						} catch (err) {
							showMsg((err && err.message) || '扫码加入设备失败')
						} finally {
							that.scanning = false
						}
					},
					fail: function () {
						that.scanning = false
						showMsg('扫码取消或失败')
					},
				})
			},
			resolveDeviceItem(payload) {
				if (!payload) return null
				if (payload.deviceId) return payload
				const detail = payload.detail
				if (detail && detail.deviceId) return detail
				if (detail && detail.__args__ && detail.__args__[0]) {
					return detail.__args__[0]
				}
				return null
			},
			onDeviceConnect(payload) {
				const item = this.resolveDeviceItem(payload)
				this.connectDevice(item && item.deviceId)
			},
			onDeviceDisconnect(payload) {
				const item = this.resolveDeviceItem(payload)
				this.disconnectDevice(item && item.deviceId)
			},
			async disconnectDevice(deviceId) {
				const bt = this.cusBModuleInstance
				if (!bt || !deviceId) {
					showMsg('设备信息不完整')
					return
				}
				const item = (bt._connectedDevicesList || []).find(function (ele) {
					return ele && ele.deviceId === deviceId
				})
				if (!item) {
					showMsg('设备未连接或不存在')
					this.bumpBtVersion()
					return
				}
				await bt.closeBlueToothPrinter(item)
				this.bumpBtVersion()
			},
			async connectDevice(deviceId) {
				if (!deviceId) {
					showMsg('设备信息不完整')
					return
				}
				const bt = await this.initBlueTooth()
				const item = (bt._searchDevicesResultList || []).find(function (ele) {
					return ele && ele.deviceId === deviceId
				}) || (bt._connectedDevicesList || []).find(function (ele) {
					return ele && ele.deviceId === deviceId
				})
				if (!item || !item.deviceId) {
					showMsg('设备信息不完整')
					return
				}
				const alreadyConnected = (bt._connectedDevicesList || []).some(function (ele) {
					return ele && ele.deviceId === deviceId
				})
				if (alreadyConnected) {
					await this.disconnectDevice(item.deviceId)
					return
				}
				try {
					this.connectingId = item.deviceId
					const connected = (bt._connectedDevicesList || []).slice()
					for (let i = 0; i < connected.length; i++) {
						const old = connected[i]
						if (old && old.deviceId && old.deviceId !== item.deviceId) {
							await bt.closeBlueToothPrinter(old)
						}
					}
					await bt.connectBlueToothPrinter(Object.assign({}, item))
					this.bumpBtVersion()
				} catch (err) {
					showMsg((err && err.message) || '连接失败')
				} finally {
					this.connectingId = ''
					this.bumpBtVersion()
				}
			},
			getSelectedTemplateStr() {
				const opt = this.currentTemplate
				if (!opt || !opt.key) return ''
				if (this.templateMode === 'common') {
					const mock = getMockByTemplateKey(opt.key) || {}
					const brand = this.resolveConnectedBrand()
					return getCommonTemplateCpcl(opt.key, mock, { brand: brand }) || ''
				}
				const tpl = brandTemplateMap[opt.key]
				if (typeof tpl === 'function') {
					return tpl() || ''
				}
				return tpl || ''
			},
			validateBeforePrint() {
				const errLog = []
				const bt = this.cusBModuleInstance
				const list = (bt && bt._connectedDevicesList) || []
				if (!isNotEmptyArr(list)) {
					errLog.push('请先连接蓝牙打印机')
				}
				const tpl = this.getSelectedTemplateStr()
				if (!tpl) {
					errLog.push('请选择有效的打印模板')
				}
				const cfg = this.printConfig || {}
				const timeout = Number(cfg.printTimeoutSec)
				if (isNaN(timeout) || timeout < 10 || timeout > 100) {
					errLog.push('打印任务超时时间需为 10–100 的整数')
				}
				return errLog
			},
			cancelRecursivePrint() {
				const bt = this.cusBModuleInstance
				if (!bt || !this.printLoading) {
					showMsg('当前没有进行中的打印任务')
					return
				}
				bt.cancelAllPrintTasks('已取消所有打印任务')
				this.syncPrintProgressFromBt()
			},
			async confirmPrinting() {
				const errLog = this.validateBeforePrint()
				if (errLog.length) {
					showMsg(errLog.join(';'))
					return
				}
				const bt = this.cusBModuleInstance
				bt.updatePrintConfig(this.printConfig)
				const device = bt._connectedDevicesList[0]
				const printTaskList = [{
					deviceId: device.deviceId,
					serviceId: device.serviceId,
					characteristicId: device.characteristicId,
					name: device.name || device.localName || '',
					localName: device.localName || '',
					writeType: device.writeType || '',
					printDataStr: this.getSelectedTemplateStr(),
				}]

				this.printProgress = Object.assign({}, bt.getPrintProgress(), {
					estimatedSec: bt.estimatePrintTimeSec(printTaskList),
					printProgress: 0,
					transferProgress: 0,
					elapsedSec: 0,
					status: 'printing',
				})
				this.printProgressVersion += 1

				this.printLoading = true
				try {
					const ok = await bt.print(printTaskList)
					this.syncConfigFromBt()
					this.syncPrintProgressFromBt()
					if (ok) {
						showMsg('打印完成', 'success')
					}
				} finally {
					this.printLoading = false
					this.bumpBtVersion()
				}
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../comm/common.scss';

	.printPage {
		min-height: 100vh;
		background: $pr-page-bg;
		padding-bottom: calc(280rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;

		&-body {
			padding-top: 8rpx;
			padding-bottom: 24rpx;
		}
	}

	.signalTip {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
		margin: 8rpx 24rpx 0;
		padding: 20rpx 22rpx;
		background: #fff;
		border-radius: 16rpx;
		border: 1rpx solid $pr-border-color;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

		&-badge {
			flex-shrink: 0;
			padding: 4rpx 14rpx;
			border-radius: 8rpx;
			background: $pr-theme-soft-strong;
			color: $pr-theme-text;
			font-size: 22rpx;
			font-weight: 700;
			line-height: 1.4;
		}

		&-main {
			flex: 1;
			min-width: 0;
		}

		&-title {
			color: $pr-text-main;
			font-size: 26rpx;
			line-height: 1.3;
			margin-bottom: 8rpx;
			font-weight: 700;
		}

		&-list {
			display: flex;
			flex-direction: column;
			gap: 4rpx;
		}

		&-item {
			color: $pr-text-muted;
			font-size: 22rpx;
			line-height: 1.45;
		}
	}

	.footerBar {
		backdrop-filter: blur(8px);

		&-row {
			display: flex;
			align-items: stretch;
			gap: 16rpx;
			margin-top: 14rpx;
		}
	}

	.cancelBtn {
		width: 168rpx;
		margin: 0;
		height: 88rpx;
		padding: 0;
		font-size: 28rpx;
		font-weight: 600;
		line-height: 88rpx;
		text-align: center;
		background: #f3eee6;
		color: #666;
		border-radius: 16rpx;
		border: none;

		&[disabled] {
			opacity: 0.45;
		}
	}

	.printBtn {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		padding: 0 24rpx;
		font-size: 32rpx;
		border: none;
	}

	.primary-btn {
		background: $pr-theme !important;
		color: #fff !important;
	}
</style>
