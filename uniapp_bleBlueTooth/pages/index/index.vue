<template>
	<DKPageContent :loadingType="loadingType">
		<view class="printPage">
			<PrintSettings
				:platform-name="platformName"
				:device-name="deviceName"
				:config="printConfig"
				:platform-default-config="platformDefaultConfig"
				@update:config="onConfigUpdate"
				@apply="applyPrintConfig"
			/>

			<DeviceInfo
				:bt="cusBModuleInstance"
				:bt-version="btVersion"
				:searching="searching"
				:scanning="scanning"
				:connecting-id="connectingId"
				@open-search="openBluetoothAndSearch"
				@research="reSearchDevices"
				@restart="restartBluetooth"
				@scan-join="scanJoinDevice"
				@connect="connectDevice"
				@disconnect="disconnectDevice"
			/>

			<TemplateSelect
				:template-options="templateOptions"
				v-model:template-index="templateIndex"
			/>

			<view class="signalTip">
				<view class="signalTip-title">信号强度常识</view>
				<view class="signalTip-list">
					<text class="signalTip-item">-50 至 -60 dBm：极强（贴着基站，满格）</text>
					<text class="signalTip-item">-60 至 -70 dBm：很强（通话上网流畅）</text>
					<text class="signalTip-item">-70 至 -80 dBm：较好（日常使用没问题）</text>
					<text class="signalTip-item">-80 至 -90 dBm：一般（边缘区域，可能掉线）</text>
					<text class="signalTip-item">-90 至 -100 dBm：较弱（接近无信号边缘）</text>
					<text class="signalTip-item">-100 以下：极弱（基本无法连接）</text>
				</view>
			</view>

			<view class="footerBtn">
				<view class="footerBtn-row">
					<button
						class="cancelBtn"
						:disabled="!printLoading"
						@click="cancelRecursivePrint"
					>
						取消打印
					</button>
					<button
						type="primary"
						class="primary-btn printBtn"
						:disabled="printLoading"
						@click="confirmPrinting"
					>
						<view class="printBtn-title">{{ printLoading ? '打印中...' : '打印' }}</view>
						<view class="printBtn-success">
							<text>{{ printStatusInfo.platformName }}</text>
							<text>{{ printStatusInfo.deviceName }}</text>
							<text>蓝牙{{ printStatusInfo.btDeviceName }}</text>
							<text>信号{{ printStatusInfo.btRssi }}dBm</text>
							<text>MTU{{ printStatusInfo.mtu }}字节</text>
							<text>包{{ printStatusInfo.packetIntervalMs }}ms</text>
							<text>重试{{ printStatusInfo.retryIntervalMs }}ms</text>
						</view>
						<view class="printBtn-meta">
							<text>预计{{ printProgressView.estimatedSec }}s</text>
							<text>进度{{ printProgressView.printProgress }}%</text>
							<text>传输{{ printProgressView.transferProgress }}%</text>
							<text>耗时{{ printProgressView.elapsedSec }}s</text>
						</view>
					</button>
				</view>
			</view>
		</view>
	</DKPageContent>
</template>

<script setup name="Index">
	import {
		ref,
		computed,
		toRaw,
		watch
	} from 'vue'
	import {
		onShow,
		onHide
	} from '@dcloudio/uni-app'
	import DKPageContent from '@/components/DKPageContent/index.vue'
	import PrintSettings from './components/PrintSettings.vue'
	import DeviceInfo from './components/DeviceInfo.vue'
	import TemplateSelect from './components/TemplateSelect.vue'
	import {
		CusBluetoothModuleClass,
		showMsg,
		isNotEmptyArr
	} from '@/ble/comm/cusBluetooth.js'
	import {
		template1,
		template2,
		template3,
		template4,
		template5,
		template6
	} from '@/ble/template/cpcl/index.js'

	const templateMap = {
		template1,
		template2,
		template3,
		template4,
		template5,
		template6
	}

	const templateOptions = [{
			key: 'template1',
			label: '模板1-运单'
		},
		{
			key: 'template2',
			label: '模板2-配军'
		},
		{
			key: 'template3',
			label: '模板3'
		},
		{
			key: 'template4',
			label: '模板4'
		},
		{
			key: 'template5',
			label: '模板5-配军标签'
		},
		{
			key: 'template6',
			label: '模板6-配军动态'
		}
	]

	const loadingType = ref('normal')
	const cusBModuleInstance = ref(null)
	const btVersion = ref(0)
	const printConfig = ref({})
	const platformDefaultConfig = ref({})
	const platformName = ref('其它')
	const deviceName = ref('未知设备')
	const templateIndex = ref(0)
	const printLoading = ref(false)
	const searching = ref(false)
	const scanning = ref(false)
	const connectingId = ref('')
	const printProgress = ref({
		estimatedSec: 0,
		printProgress: 0,
		transferProgress: 0,
		elapsedSec: 0,
		status: 'idle'
	})
	const printProgressVersion = ref(0)

	const currentTemplate = computed(() => templateOptions[templateIndex.value] || templateOptions[0])

	const connectedBtDevice = computed(() => {
		void btVersion.value
		const list = cusBModuleInstance.value?._connectedDevicesList || []
		return list[0] || null
	})

	const printStatusInfo = computed(() => {
		void btVersion.value
		const bt = cusBModuleInstance.value
		const btDevice = connectedBtDevice.value
		const cfg = printConfig.value || {}
		let rssi = btDevice?.RSSI
		// 已连接对象可能无 RSSI，回退到搜索列表中的信号
		if ((rssi === undefined || rssi === null) && btDevice?.deviceId) {
			const found = (bt?._searchDevicesResultList || []).find(
				(ele) => ele.deviceId === btDevice.deviceId
			)
			rssi = found?.RSSI
		}
		return {
			platformName: platformName.value || '其它',
			deviceName: deviceName.value || '未知设备',
			btDeviceName: btDevice?.name || btDevice?.localName || '未连接',
			btRssi: (rssi === 0 || (rssi !== undefined && rssi !== null)) ? rssi : '--',
			mtu: Number(cfg.mtu) || 0,
			packetIntervalMs: Number(cfg.packetIntervalMs) || 0,
			retryIntervalMs: Number(cfg.retryIntervalMs) || 0
		}
	})

	const printProgressView = computed(() => {
		void printProgressVersion.value
		return {
			estimatedSec: Number(printProgress.value.estimatedSec || 0),
			printProgress: Number(printProgress.value.printProgress || 0),
			transferProgress: Number(printProgress.value.transferProgress || 0),
			elapsedSec: Number(printProgress.value.elapsedSec || 0),
			status: printProgress.value.status || 'idle'
		}
	})

	watch([templateIndex, printConfig, cusBModuleInstance], () => {
		if (!printLoading.value) {
			previewEstimatedTime()
		}
	}, {
		deep: true
	})

	function previewEstimatedTime() {
		const bt = cusBModuleInstance.value
		if (!bt) return
		const list = bt._connectedDevicesList || []
		const tpl = getSelectedTemplateStr()
		if (!isNotEmptyArr(list) || !tpl) {
			printProgress.value = {
				...printProgress.value,
				estimatedSec: 0
			}
			printProgressVersion.value += 1
			return
		}
		const device = list[0]
		const estimatedSec = bt.estimatePrintTimeSec([{
			deviceId: device.deviceId,
			name: device.name,
			localName: device.localName,
			printDataStr: tpl
		}])
		printProgress.value = {
			...printProgress.value,
			estimatedSec
		}
		printProgressVersion.value += 1
	}

	onShow(() => {
		initBlueTooth()
	})

	onHide(() => {
		if (cusBModuleInstance.value) {
			cusBModuleInstance.value.closeBluetoothAdapter()
			cusBModuleInstance.value = null
		}
	})

	function syncPrintProgressFromBt() {
		const bt = cusBModuleInstance.value
		if (!bt) return
		printProgress.value = bt.getPrintProgress()
		printProgressVersion.value += 1
	}

	function bumpBtVersion() {
		btVersion.value += 1
		syncConfigFromBt()
		syncPrintProgressFromBt()
		if (!printLoading.value) {
			previewEstimatedTime()
		}
	}

	function syncConfigFromBt() {
		const bt = cusBModuleInstance.value
		if (!bt) return
		platformName.value = bt.getPlatformDisplayName()
		deviceName.value = bt.getDeviceDisplayName()
		platformDefaultConfig.value = bt.getPlatformDefaultConfig()
		printConfig.value = bt.getPrintConfig()
	}

	async function initBlueTooth() {
		if (!cusBModuleInstance.value) {
			const instance = new CusBluetoothModuleClass()
			instance.on('stateChange', bumpBtVersion)
			instance.on('printProgress', syncPrintProgressFromBt)
			cusBModuleInstance.value = instance
			syncConfigFromBt()
			syncPrintProgressFromBt()
			await instance.setupBlueTooth()
			await instance.connectHistoryPrintDevices()
			bumpBtVersion()
		}
		return cusBModuleInstance.value
	}

	function onConfigUpdate(cfg) {
		printConfig.value = {
			...cfg
		}
	}

	function applyPrintConfig(cfg) {
		const bt = cusBModuleInstance.value
		if (!bt) {
			showMsg('请先启动蓝牙模块')
			return
		}
		bt.updatePrintConfig(cfg)
		syncConfigFromBt()
	}

	async function openBluetoothAndSearch() {
		try {
			searching.value = true
			const bt = await initBlueTooth()
			await bt.searchNearByBlueTooth('finded', 'refresh')
			bumpBtVersion()
		} catch (err) {
			showMsg(err?.message || '搜索蓝牙设备失败')
		} finally {
			searching.value = false
		}
	}

	async function reSearchDevices() {
		try {
			searching.value = true
			const bt = await initBlueTooth()
			await bt.reSearchNearByBlueTooth()
			bumpBtVersion()
		} catch (err) {
			showMsg(err?.message || '重新搜索失败')
		} finally {
			searching.value = false
		}
	}

	async function restartBluetooth() {
		const bt = await initBlueTooth()
		await bt.restartOpenBluetoothAdapter()
		bumpBtVersion()
	}

	async function scanJoinDevice() {
		scanning.value = true
		uni.scanCode({
			onlyFromCamera: false,
			success: async (res) => {
				try {
					const code = String(res?.result || '').trim()
					if (!code) {
						showMsg('扫码结果为空')
						return
					}
					const bt = await initBlueTooth()
					await bt.searchNearByBlueTooth('finded', 'refresh')
					bumpBtVersion()
					const list = bt._searchDevicesResultList || []
					const matched = list.find((ele) => {
						const name = ele?.name || ele?.localName || ''
						const deviceId = ele?.deviceId || ''
						return deviceId === code ||
							name === code ||
							deviceId.toLowerCase() === code.toLowerCase() ||
							name.includes(code) ||
							deviceId.includes(code)
					})
					if (matched) {
						await connectDevice(matched)
					} else {
						showMsg(`未匹配到设备：${code}`)
					}
				} catch (err) {
					showMsg(err?.message || '扫码加入设备失败')
				} finally {
					scanning.value = false
				}
			},
			fail: () => {
				scanning.value = false
				showMsg('扫码取消或失败')
			}
		})
	}

	async function disconnectDevice(item) {
		const bt = cusBModuleInstance.value
		if (!bt || !item) return
		await bt.closeBlueToothPrinter(item)
		bumpBtVersion()
	}

	async function connectDevice(item) {
		const bt = await initBlueTooth()
		if (!item?.deviceId) {
			showMsg('设备信息不完整')
			return
		}
		if (item.isConnect) {
			await disconnectDevice(item)
			return
		}
		try {
			connectingId.value = item.deviceId
			const connected = [...(bt._connectedDevicesList || [])]
			// 已有连接时，先断开再连新设备（替换）
			for (const old of connected) {
				if (old?.deviceId && old.deviceId !== item.deviceId) {
					await bt.closeBlueToothPrinter(old)
				}
			}
			await bt.connectBlueToothPrinter({
				...item
			})
			bumpBtVersion()
		} catch (err) {
			showMsg(err?.message || '连接失败')
		} finally {
			connectingId.value = ''
		}
	}

	function getSelectedTemplateStr() {
		const opt = currentTemplate.value
		return templateMap[opt.key] || ''
	}

	function validateBeforePrint() {
		const errLog = []
		const bt = cusBModuleInstance.value
		const list = bt?._connectedDevicesList || []
		if (!isNotEmptyArr(list)) {
			errLog.push('请先连接蓝牙打印机')
		}
		const tpl = getSelectedTemplateStr()
		if (!tpl) {
			errLog.push('请选择有效的打印模板')
		}
		const cfg = printConfig.value || {}
		const timeout = Number(cfg.printTimeoutSec)
		if (isNaN(timeout) || timeout < 10 || timeout > 100) {
			errLog.push('打印任务超时时间需为 10–100 的整数')
		}
		return errLog
	}

	function cancelRecursivePrint() {
		const bt = cusBModuleInstance.value
		if (!bt || !printLoading.value) {
			showMsg('当前没有进行中的打印任务')
			return
		}
		bt.cancelAllPrintTasks('已取消所有打印任务')
		syncPrintProgressFromBt()
	}

	async function confirmPrinting() {
		const errLog = validateBeforePrint()
		if (errLog.length) {
			showMsg(errLog.join(';'))
			return
		}
		const bt = cusBModuleInstance.value
		bt.updatePrintConfig(printConfig.value)
		const device = toRaw(bt._connectedDevicesList[0])
		const printTaskList = [{
			deviceId: device.deviceId,
			serviceId: device.serviceId,
			characteristicId: device.characteristicId,
			name: device.name || device.localName || '',
			localName: device.localName || '',
			writeType: device.writeType || '',
			printDataStr: getSelectedTemplateStr()
		}]

		// 先展示预计时间
		printProgress.value = {
			...bt.getPrintProgress(),
			estimatedSec: bt.estimatePrintTimeSec(printTaskList),
			printProgress: 0,
			transferProgress: 0,
			elapsedSec: 0,
			status: 'printing'
		}
		printProgressVersion.value += 1

		printLoading.value = true
		try {
			const ok = await bt.print(printTaskList)
			syncConfigFromBt()
			syncPrintProgressFromBt()
			if (ok) {
				showMsg('打印完成', 'success')
			}
		} finally {
			printLoading.value = false
			bumpBtVersion()
		}
	}
</script>

<style lang="scss" scoped>
	.printPage {
		padding-bottom: 260rpx;
		background: #f5f5f5;
		min-height: 100vh;
	}

	.signalTip {
		margin: 8rpx 20rpx 12rpx;
		padding: 12rpx 16rpx;
		background: #fafafa;
		border: 1rpx solid #eee;
		border-radius: 8rpx;

		&-title {
			color: #666;
			font-size: 22rpx;
			line-height: 1.3;
			margin-bottom: 6rpx;
			font-weight: 500;
		}

		&-list {
			display: flex;
			flex-direction: column;
			gap: 2rpx;
		}

		&-item {
			color: #999;
			font-size: 20rpx;
			line-height: 1.35;
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
		box-shadow: 4rpx 12rpx 10rpx rgba(0, 0, 0, 0.5);
		box-sizing: border-box;

		&-row {
			display: flex;
			align-items: stretch;
			gap: 16rpx;
		}
	}

	.cancelBtn {
		width: 160rpx;
		margin: 0;
		padding: 0 12rpx;
		font-size: 26rpx;
		line-height: 1.3;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f2f2f2;
		color: #666;
		border-radius: 8rpx;
	}

	.printBtn {
		flex: 1;
		margin: 0;
		min-height: 96rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6rpx;
		line-height: 1.2;
		padding: 12rpx 16rpx;

		&-title {
			font-size: 30rpx;
			font-weight: bold;
		}

		&-success {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			gap: 8rpx 14rpx;
			font-size: 20rpx;
			opacity: 0.98;
		}

		&-meta {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			gap: 10rpx 16rpx;
			font-size: 20rpx;
			opacity: 0.95;
		}
	}
</style>
