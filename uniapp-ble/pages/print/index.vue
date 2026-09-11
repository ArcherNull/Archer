<template>
	<view class="print">
		<!-- 顶部手机设备信息（本项目扩展，便于联调） -->
		<view class="deviceBar">
			<view class="deviceBar-left">
				<text class="deviceBar-item">操作系统：{{ platformName }}</text>
				<text class="deviceBar-split">|</text>
				<text class="deviceBar-item">版本：{{ osVersion || '--' }}</text>
				<text class="deviceBar-split">|</text>
				<text class="deviceBar-item">设备：{{ deviceName }}</text>
			</view>
			<view class="deviceBar-link" @click="goDebugPage">调试页</view>
		</view>

		<!-- 手机蓝牙模块 -->
		<PrintItemBox
			title="蓝牙模块"
			:tag="sharePrinter ? '共用' : ''"
			:isShowBottomLine="true"
		>
			<view slot="right">
				<view class="btBox">
					<template v-if="moduleState === 'started'">
						<view class="btBox-link" @click.stop="openHistoryPopup = true">连接历史</view>
						<view class="btBox-link" @click.stop="openSettingsPopup = true">传输设置</view>
					</template>
					<view
						v-if="cusBModuleInstance"
						@click="restartOpenBluetoothAdapter"
						:class="['btBox-start', moduleStateClass]"
					>
						{{ moduleStateText }}
					</view>
					<view class="unactiveCss" v-else @click="initBlueTooth">未启动</view>
				</view>
			</view>

			<view
				:class="[
					'sharePrinterRow',
					'checkRow',
					sharePrinter ? 'checkRow--active' : 'checkRow--unactive',
				]"
				@click="toggleSharePrinter"
			>
				<view
					:class="[
						'checkRow-box',
						sharePrinter ? 'checkRow-box--active' : 'checkRow-box--unactive',
					]"
				></view>
				<text class="sharePrinterRow-text">共用打印机</text>
				<text class="sharePrinterRow-tip">标签/运单/回单共用一台</text>
			</view>

			<view class="cPBox">
				<view
					class="cPList"
					v-if="cusBModuleInstance && displayConnectedList.length"
				>
					<BluetoothDeviceItem
						v-for="(item, index) in displayConnectedList"
						:key="item.deviceId"
						:device="item"
						:index="index"
						variant="connected"
						:show-print-type="true"
						@connect="onConnectedClose"
					/>
				</view>
				<view class="noMoreBox" v-else @click="jumpOldPage">
					暂无连接蓝牙打印机
				</view>
			</view>
		</PrintItemBox>

		<!-- 打印标签 -->
		<PrintItemBox :isShowBottomLine="true">
			<view
				slot="title"
				:class="[
					'checkRow',
					selectedPrintLabel ? 'checkRow--active' : 'checkRow--unactive',
				]"
				@click="selectedPrintLabel = !selectedPrintLabel"
			>
				<view
					:class="[
						'checkRow-box',
						selectedPrintLabel ? 'checkRow-box--active' : 'checkRow-box--unactive',
					]"
				></view>
				<text class="checkRow-title">打印标签</text>
			</view>
			<view slot="right">
				<SelectPrinter
					:selectedPrinter="connectedPrinter.labelPrinter"
					@selected="selectedBTPrinter(connectedPrinter.labelPrinter, 'label')"
				/>
			</view>
			<view class="main">
				<LabelBox
					label="打印份数"
					:checked="labelPrintChecked"
					@checked="labelPrintChecked = !labelPrintChecked"
				>
					<NumberBox
						v-if="labelPrintChecked"
						:value="bqValue"
						:min="0"
						:max="9000"
						@input="bqValue = $event"
					/>
				</LabelBox>
				<LabelBox
					label="打印指定页码"
					:checked="!labelPrintChecked"
					@checked="labelPrintChecked = !labelPrintChecked"
				>
					<view class="pBox" v-if="!labelPrintChecked">
						<NumberBox
							:value="assignBqValueStart"
							:min="0"
							:max="9000"
							@input="assignBqValueStart = $event"
						/>
						<view>至</view>
						<NumberBox
							:value="assignBqValueEnd"
							:min="0"
							:max="9000"
							@input="assignBqValueEnd = $event"
						/>
					</view>
				</LabelBox>
			</view>
		</PrintItemBox>

		<!-- 打印运单 -->
		<PrintItemBox :isShowBottomLine="true">
			<view
				slot="title"
				:class="[
					'checkRow',
					selectedPrintWaybill ? 'checkRow--active' : 'checkRow--unactive',
				]"
				@click="selectedPrintWaybill = !selectedPrintWaybill"
			>
				<view
					:class="[
						'checkRow-box',
						selectedPrintWaybill ? 'checkRow-box--active' : 'checkRow-box--unactive',
					]"
				></view>
				<text class="checkRow-title">打印运单</text>
			</view>
			<view slot="right">
				<SelectPrinter
					:selectedPrinter="connectedPrinter.waybillPrinter"
					@selected="selectedBTPrinter(connectedPrinter.waybillPrinter, 'waybill')"
				/>
			</view>
			<view class="main">
				<LabelBox label="打印份数" :showCheck="false">
					<NumberBox
						:value="ydValue"
						:min="0"
						:max="9000"
						@input="ydValue = $event"
					/>
				</LabelBox>

				<view class="checkbox" v-if="parameterO097 != '0'">
					<checkbox-group class="checkbox-group" @change="multiCheckboxChange">
						<label
							class="checkbox-item"
							v-for="item in multiList"
							:key="item.value"
						>
							<view>
								<checkbox
									color="#f9ae3d"
									style="transform: scale(0.7)"
									:value="item.name"
									:checked="item.checked"
								/>
							</view>
							<view
								:class="[
									item.checked
										? 'checkbox-item__active'
										: 'checkbox-item__unactive',
								]"
							>
								{{ item.name }}
							</view>
						</label>
					</checkbox-group>
				</view>
			</view>
		</PrintItemBox>

		<!-- 打印回单 -->
		<PrintItemBox :isShowBottomLine="true" v-if="enablePrintReceipt">
			<view
				slot="title"
				:class="[
					'checkRow',
					selectedPrintReceipt ? 'checkRow--active' : 'checkRow--unactive',
				]"
				@click="selectedPrintReceipt = !selectedPrintReceipt"
			>
				<view
					:class="[
						'checkRow-box',
						selectedPrintReceipt ? 'checkRow-box--active' : 'checkRow-box--unactive',
					]"
				></view>
				<text class="checkRow-title">打印回单</text>
			</view>
			<view slot="right">
				<SelectPrinter
					:selectedPrinter="connectedPrinter.receiptPrinter"
					@selected="selectedBTPrinter(connectedPrinter.receiptPrinter, 'receipt')"
				/>
			</view>
			<view class="main">
				<LabelBox
					label="打印份数"
					:checked="printReceiptChecked"
					@checked="printReceiptChecked = !printReceiptChecked"
				>
					<NumberBox
						:value="printReceiptNum"
						:min="0"
						:max="9000"
						@input="printReceiptNum = $event"
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
			<view class="alertBox_item" v-if="wayBillCode">
				当前运单：{{ wayBillCode }}；O097={{ parameterO097 }}；O098={{ parameterO098 }}；zoneId={{ zoneId }}
			</view>
		</view>

		<!-- 设备信息弹层（蓝牙实例仅在本页持有，组件只收 props / 发事件） -->
		<DeviceInfoPopup
			:visible="openPrintListPop"
			:title="devicePopTitle"
			:module-state="moduleState"
			:search-state="searchState"
			:device-list="deviceList"
			:searching="searching"
			:scanning="scanning"
			:connecting-id="connectingId"
			@update:visible="onPopOpenChange"
			@open-search="openBluetoothAndSearch"
			@research="reSearchNearByBlueTooth"
			@restart="restartOpenBluetoothAdapter"
			@scan-join="scanJoinDevice"
			@device-connect="onDeviceConnect"
			@device-disconnect="onDeviceDisconnect"
			@disconnect-all="disconnectAllDevices"
			@toggle-search="toggleContinuousSearch"
			@clear-search="clearSearchResults"
			@brand-bind="onBrandBind"
		/>

		<ConnectHistoryPopup
			:visible="openHistoryPopup"
			:connecting-id="connectingId"
			@update:visible="openHistoryPopup = $event"
			@device-connect="onHistoryConnect"
			@preview="onPrintTaskPreview"
			@clear="onHistoryClear"
		/>

		<PrintTasksPopup
			:visible="openPrintTasksPopup"
			:tasks="pendingPrintTasks"
			@update:visible="openPrintTasksPopup = $event"
			@preview="onPrintTaskPreview"
		/>

		<PreviewPopup
			:visible="previewVisible"
			:title="previewTitle"
			:ops="previewOps"
			@update:visible="previewVisible = $event"
		/>

		<PrintSettingsPopup
			:visible="openSettingsPopup"
			:platform-name="platformName"
			:device-name="deviceName"
			:config="printConfig"
			:platform-default-config="platformDefaultConfig"
			@update:visible="openSettingsPopup = $event"
			@update:config="onConfigUpdate"
			@apply="applyPrintConfig"
		/>

		<view class="footerBar">
			<PrintJobStatus
				:jobs="printJobList"
				:print-loading="printLoading"
			/>
			<view class="footerBtn-row">
				<button
					class="taskBtn"
					:disabled="printLoading"
					@click="openPendingPrintTasks"
				>
					打印任务
				</button>
				<button
					type="primary"
					class="printBtn"
					:disabled="printLoading"
					:loading="printLoading"
					@click="confirmPrinting"
				>
					{{ printLoading ? '打印中...' : '打印' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * 业务主页：深度对齐 kpsapp newPrint.vue 交互与打印队列
	 * BLE 走本项目 getBluetoothAdapter；模板走 template-comm 通用版式；接口走 mock
	 */
	import PrintItemBox from './components/PrintItemBox.vue'
	import SelectPrinter from './components/SelectPrinter.vue'
	import LabelBox from './components/LabelBox.vue'
	import NumberBox from './components/NumberBox.vue'
	import DeviceInfoPopup from './components/DeviceInfoPopup.vue'
	import BluetoothDeviceItem from './components/BluetoothDeviceItem.vue'
	import ConnectHistoryPopup from './components/ConnectHistoryPopup.vue'
	import PrintTasksPopup from './components/PrintTasksPopup.vue'
	import PrintSettingsPopup from './components/PrintSettingsPopup.vue'
	import PrintJobStatus from './components/PrintJobStatus.vue'
	import { ALERT_TEXT_LIST } from './help/index.js'
	import { getBluetoothAdapter } from './ble/index.js'
	import {
		resolvePrinterBrandInfo,
		resolveOsVersion,
	} from './ble/config.js'
	import { showMsg, convertNumber, isNotEmptyArr, showModal, getSystemInfoCompat } from './comm/utils.js'
	import {
		resolveLabelTemplate,
		resolveWaybillTemplate,
		resolveReceiptTemplate,
	} from './template-comm/index.js'
	import { cpclToOps } from './template-comm/builder/cpclToOps.js'
	import PreviewPopup from './template-comm/preivew/PreviewPopup.vue'
	import {
		getListParamValue,
		queryTrackByWayBillCode,
		getFaceOrderReport,
		receiptTask as receiptTaskApi,
		DEFAULT_WAY_BILL_CODE,
	} from '../../mock/api.js'

	function resolveLabelTemplateName(ctx) {
		const parameterO098 = String((ctx && ctx.parameterO098) == null ? '0' : ctx.parameterO098)
		const zoneId = Number((ctx && ctx.zoneId) || 0)
		if (parameterO098 === '1') return '浩运标签'
		if (parameterO098 === '2') return '配军标签'
		if (zoneId === 23) return '战区标签'
		return '德坤普通标签'
	}

	function resolveWaybillTemplateName(ctx) {
		const parameterO097 = String((ctx && ctx.parameterO097) == null ? '0' : ctx.parameterO097)
		const zoneId = Number((ctx && ctx.zoneId) || 0)
		const isMulti = !!(ctx && ctx.isMulti)
		const multiType = (ctx && ctx.multiType) || ''
		if (isMulti) {
			if (parameterO097 === '2' && multiType === '托运客户联') return '配军运单/回单'
			return multiType ? '多联运单-' + multiType : '多联运单'
		}
		if (zoneId === 23) return '战区标签'
		return '普通运单'
	}

	function resolveReceiptTemplateName(ctx) {
		const parameterO097 = String((ctx && ctx.parameterO097) == null ? '0' : ctx.parameterO097)
		const zoneId = Number((ctx && ctx.zoneId) || 0)
		if (parameterO097 === '2') return '配军运单/回单'
		if (zoneId === 23) return '德坤回单'
		return '浩运回单'
	}

	export default {
		name: 'PrintIndex',
		components: {
			PrintItemBox,
			SelectPrinter,
			LabelBox,
			NumberBox,
			DeviceInfoPopup,
			BluetoothDeviceItem,
			ConnectHistoryPopup,
			PrintTasksPopup,
			PrintSettingsPopup,
			PrintJobStatus,
			PreviewPopup,
		},
		data() {
			return {
				platformName: '其它',
				osVersion: '',
				deviceName: '未知设备',
				printConfig: {},
				platformDefaultConfig: {},
				userInfo: {},
				zoneId: 0,
				labelPrintChecked: true,
				bqValue: 0,
				assignBqValueStart: 0,
				assignBqValueEnd: 1,
				ydValue: 1,
				printReceiptNum: 1,
				openPrintListPop: false,
				openHistoryPopup: false,
				openPrintTasksPopup: false,
				pendingPrintTasks: [],
				openSettingsPopup: false,
				previewVisible: false,
				previewTitle: '',
				previewOps: [],
				printLoading: false,
				/** 按打印类型拆分的任务状态：waybill / label / receipt */
				printJobs: {},
				activePrintType: '',
				printJobVersion: 0,
				selectedPrinterType: '',
				cusBModuleInstance: null,
				printReceiptChecked: true,
				/** 共用打印机：标签/运单/回单共用一台，默认勾选 */
				sharePrinter: true,
				/** 是否打印该模板：默认不勾选 */
				selectedPrintLabel: false,
				selectedPrintWaybill: false,
				selectedPrintReceipt: false,
				// O097：0普通运单；1多联；2多联且托运客户联/回单用配军模板
				parameterO097: '0',
				parameterO098: '0',
				multiSelectList: [],
				multiList: [
					{ name: '托运客户联', value: '3', checked: false },
					{ name: '收货客户联', value: '4', checked: false },
					{ name: '记账联', value: '1', checked: false },
					{ name: '存根联', value: '2', checked: false },
				],
				waybillInfo: {},
				wayBillCode: '',
				enablePrintReceipt: false,
				alertTextList: ALERT_TEXT_LIST,
				btVersion: 0,
				moduleState: 'notStarted',
				searchState: 'notSearched',
				searchCount: 0,
				deviceList: [],
				searching: false,
				scanning: false,
				connectingId: '',
				_btStateHandler: null,
				pendingClosePromise: null,
			}
		},
		computed: {
			printJobList() {
				void this.printJobVersion
				const jobs = this.printJobs || {}
				const order = ['waybill', 'label', 'receipt']
				const list = []
				for (let i = 0; i < order.length; i++) {
					const key = order[i]
					if (jobs[key]) {
						list.push(jobs[key])
					}
				}
				return list
			},
			devicePopTitle() {
				if (this.sharePrinter || this.selectedPrinterType === 'shared') {
					return '选择共用打印机'
				}
				if (this.selectedPrinterType === 'label') return '选择标签打印机'
				if (this.selectedPrinterType === 'waybill') return '选择运单打印机'
				if (this.selectedPrinterType === 'receipt') return '选择回单打印机'
				return '选择打印机'
			},
			connectedList() {
				return (this.deviceList || []).filter(function (item) {
					return !!(item && item.isConnect && item.deviceId)
				})
			},
			/** 共用模式下只展示一台已连接打印机 */
			sharedPrinter() {
				void this.btVersion
				const list = this.connectedList || []
				if (!list.length) return {}
				const shared = list.find(function (ele) {
					return ele && ele.printType === 'shared'
				})
				return shared || list[0] || {}
			},
			displayConnectedList() {
				if (!this.sharePrinter) {
					return this.connectedList
				}
				const p = this.sharedPrinter
				if (!p || !p.deviceId) return []
				return [
					Object.assign({}, p, {
						printType: 'shared',
					}),
				]
			},
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
			connectedPrinter() {
				void this.btVersion
				const obj = {
					labelPrinter: {},
					waybillPrinter: {},
					receiptPrinter: {},
				}
				// 必须从 _connectedDevicesList 取完整设备（含 serviceId / characteristicId），
				// 不可用 mapDeviceForView 后的展示对象，否则打印任务会缺写入特征值而空转
				const cList =
					(this.cusBModuleInstance &&
						this.cusBModuleInstance._connectedDevicesList) ||
					[]
				if (!isNotEmptyArr(cList)) {
					return obj
				}
				if (this.sharePrinter) {
					const shared =
						cList.find(function (ele) {
							return ele && ele.printType === 'shared'
						}) || cList[0]
					if (shared && shared.deviceId) {
						obj.labelPrinter = shared
						obj.waybillPrinter = shared
						if (this.enablePrintReceipt) {
							obj.receiptPrinter = shared
						}
					}
					return obj
				}
				cList.forEach((ele) => {
					const printType = ele.printType
					if (printType === 'label') {
						obj.labelPrinter = ele
					} else if (printType === 'waybill') {
						obj.waybillPrinter = ele
					} else if (printType === 'receipt' && this.enablePrintReceipt) {
						obj.receiptPrinter = ele
					}
				})
				return obj
			},
		},
		onLoad(options) {
			this.initDeviceInfo()
			this.loadUserInfo(options || {})
			this.initPage(options || {})
		},
		onShow() {
			uni.setKeepScreenOn({ keepScreenOn: true })
			this.initBlueTooth()
		},
		onHide() {
			uni.setKeepScreenOn({ keepScreenOn: false })
			this.teardownBlueTooth()
		},
		onUnload() {
			uni.setKeepScreenOn({ keepScreenOn: false })
			this.teardownBlueTooth()
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
					const systemInfo = getSystemInfoCompat()
					this.platformName = this.resolvePlatformName(systemInfo)
					this.osVersion = resolveOsVersion(systemInfo)
					this.deviceName = this.resolveDeviceName(systemInfo)
				} catch (e) {
					this.platformName = '其它'
					this.osVersion = ''
					this.deviceName = '未知设备'
				}
			},
			loadUserInfo(options) {
				try {
					const raw = uni.getStorageSync('userInfo')
					if (raw) {
						this.userInfo = typeof raw === 'string' ? JSON.parse(raw) : raw
						const z =
							(this.userInfo.userinfo && this.userInfo.userinfo.zoneId) ||
							this.userInfo.zoneId
						if (z != null && z !== '') {
							this.zoneId = Number(z) || 0
						}
					}
				} catch (e) {
					this.userInfo = {}
				}
				if (options.zoneId != null && options.zoneId !== '') {
					this.zoneId = Number(options.zoneId) || 0
				}
			},
			goDebugPage() {
				uni.navigateTo({
					url: '/pages/print/debugPage/index',
				})
			},
			bumpBtVersion() {
				this.btVersion += 1
				this.syncDeviceViewFromBt()
				this.syncConfigFromBt()
				if (this.cusBModuleInstance && this.cusBModuleInstance._continuousDiscovering) {
					this.searching = true
				}
			},
			syncOptimalTransferToBt(bt) {
				const target = bt || this.cusBModuleInstance
				if (!target) return
				const cfg = this.printConfig || {}
				const enabled = cfg.useOptimalTransfer !== false
				target._useOptimalTransfer = enabled
			},
			syncConfigFromBt() {
				const bt = this.cusBModuleInstance
				if (!bt) return
				if (bt.getPlatformDisplayName) {
					this.platformName = bt.getPlatformDisplayName() || this.platformName
				}
				if (bt.getOsVersionDisplay) {
					this.osVersion = bt.getOsVersionDisplay() || this.osVersion
				}
				if (bt.getDeviceDisplayName) {
					this.deviceName = bt.getDeviceDisplayName() || this.deviceName
				}
				if (bt.getPlatformDefaultConfig) {
					this.platformDefaultConfig = bt.getPlatformDefaultConfig() || {}
				}
				if (bt.getPrintConfig) {
					this.printConfig = bt.getPrintConfig() || {}
				}
				this.syncOptimalTransferToBt(bt)
			},
			onConfigUpdate(cfg) {
				this.printConfig = Object.assign({}, cfg)
				this.syncOptimalTransferToBt()
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
			async onHistoryConnect(payload) {
				const item = this.resolveDeviceItem(payload)
				if (!item || !item.deviceId) {
					showMsg('设备信息不完整')
					return
				}
				const bt = await this.initBlueTooth()
				const existsInSearch = (bt._searchDevicesResultList || []).some(function (ele) {
					return ele && ele.deviceId === item.deviceId
				})
				if (!existsInSearch) {
					bt._searchDevicesResultList.push(Object.assign({}, item, {
						isConnect: false,
						connectState: 'notConnected',
					}))
				}
				await this.connectPrinter({
					item: item,
					type: this.sharePrinter ? 'shared' : (this.selectedPrinterType || 'shared'),
				})
			},
			onHistoryClear() {
				const bt = this.cusBModuleInstance
				if (bt) {
					bt._historyPrintDeviceList = []
					if (typeof bt.refreshHistoryDevicesFromTasks === 'function') {
						bt.refreshHistoryDevicesFromTasks()
					}
				}
				showMsg('已清空历史记录', 'success')
			},
			onPrintTaskPreview(task) {
				const raw =
					(task && (task.printDataStr || task.cpcl)) || ''
				const cpcl =
					typeof raw === 'string'
						? raw
						: (raw && raw.cpcl) || ''
				if (!cpcl) {
					showMsg('该任务无预览数据')
					return
				}
				const brandInfo = resolvePrinterBrandInfo(
					(task && (task.name || task.localName)) || '',
					(task && task.deviceId) || ''
				)
				const brand = (brandInfo && brandInfo.brand) || 'CC3'
				const ops = cpclToOps(cpcl, brand)
				if (!ops || !ops.length) {
					showMsg('预览数据为空')
					return
				}
				this.previewTitle = (task && task.templateName) || '打印预览'
				this.previewOps = ops
				this.previewVisible = true
			},
			/** 打开待执行打印任务弹窗 */
			async openPendingPrintTasks() {
				const errLog = this.validateForm()
				if (errLog.length) {
					showMsg(errLog.join(';'))
					return
				}
				uni.showLoading({
					title: '生成任务...',
					mask: true,
				})
				try {
					this.pendingPrintTasks = await this.buildPendingPrintTasks()
					if (!this.pendingPrintTasks.length) {
						showMsg('暂无待打印任务')
						return
					}
					this.openPrintTasksPopup = true
				} catch (err) {
					showMsg((err && err.message) || '生成打印任务失败')
				} finally {
					uni.hideLoading()
				}
			},
			/**
			 * 按当前页面选项组装「即将打印」任务（不执行写入）
			 * 顺序与正式打印一致：运单 → 标签 → 回单
			 */
			async buildPendingPrintTasks() {
				const that = this
				const { labelPrinter, waybillPrinter, receiptPrinter } =
					that.connectedPrinter
				const now = Date.now()
				const result = []
				let seq = 0

				const appendItems = function (device, items) {
					;(items || []).forEach(function (item) {
						seq += 1
						const rawCpcl = item && (item.cpcl || item.printDataStr)
						const cpclText =
							typeof rawCpcl === 'string'
								? rawCpcl
								: (rawCpcl && rawCpcl.cpcl) || ''
						const task = that.createPrintTask(device, cpclText, {
							templateName: (item && item.templateName) || '打印任务',
							printType: (item && item.printType) || '',
							printTime: now,
						})
						task.id = 'pending_' + seq
						result.push(task)
					})
				}

				if (that.selectedPrintWaybill && waybillPrinter.deviceId) {
					const items = await that.collectCpclItems(waybillPrinter, {
						waybillCopies: that.ydValue,
						waybillInfo: that.waybillInfo,
						parameterO097: that.parameterO097,
						multiSelectList: that.dealMultiSelectList(),
						parameterO098: that.parameterO098,
					})
					appendItems(waybillPrinter, items)
				}

				if (that.selectedPrintLabel && labelPrinter.deviceId) {
					const items = await that.collectCpclItems(labelPrinter, {
						copiesState: that.labelPrintChecked,
						assignState: !that.labelPrintChecked,
						labelCopies: that.bqValue,
						assignBqValueStartValue: that.assignBqValueStart,
						assignBqValueEndValue: that.assignBqValueEnd,
						waybillInfo: that.waybillInfo,
						parameterO097: that.parameterO097,
						parameterO098: that.parameterO098,
					})
					appendItems(labelPrinter, items)
				}

				if (
					that.enablePrintReceipt &&
					that.selectedPrintReceipt &&
					receiptPrinter.deviceId &&
					that.printReceiptChecked
				) {
					const items = await that.collectReceiptItems(receiptPrinter)
					appendItems(receiptPrinter, items)
				}

				return result
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
					this.searchCount = 0
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
				this.searchCount = this.deviceList.length
				if (bt.getPlatformDisplayName) {
					this.platformName = bt.getPlatformDisplayName() || this.platformName
				}
				if (bt.getOsVersionDisplay) {
					this.osVersion = bt.getOsVersionDisplay() || this.osVersion
				}
				if (bt.getDeviceDisplayName) {
					this.deviceName = bt.getDeviceDisplayName() || this.deviceName
				}
			},

			// ─── 页面初始化（对齐 newPrint.initPage） ───
			initPage(options) {
				uni.hideLoading()
				this.getListParamValue()
				if (options.waybillInfo) {
					try {
						this.waybillInfo = JSON.parse(
							decodeURIComponent(decodeURIComponent(options.waybillInfo))
						)
						this.applyWaybillInfo(this.waybillInfo)
					} catch (e) {
						this.goBack('运单参数解析失败')
					}
				} else if (options.wayBillCode) {
					this.getWaybillInfo(options.wayBillCode)
				} else {
					// 独立演示页：无入参时使用 Mock 默认运单
					this.getWaybillInfo(DEFAULT_WAY_BILL_CODE)
				}
			},
			applyWaybillInfo(nData) {
				this.waybillInfo = nData || {}
				this.wayBillCode =
					nData.wayBillCode ||
					(nData.appletWayBillCodeInfoVO && nData.appletWayBillCodeInfoVO.code) ||
					''
				const quantity = convertNumber(
					nData &&
						nData.appletWayBillCodeInfoVO &&
						nData.appletWayBillCodeInfoVO.quantity
				)
				this.bqValue = quantity < 50 ? quantity : 50
				const isReceiptRequirement = Boolean(
					nData &&
						nData.appletWayBillCodeInfoVO &&
						nData.appletWayBillCodeInfoVO.receiptRequirement
				)
				this.enablePrintReceipt = isReceiptRequirement
				this.printReceiptChecked = isReceiptRequirement
			},
			async getWaybillInfo(wayBillCode) {
				const that = this
				uni.showLoading({ title: '加载中...' })
				try {
					const res = await queryTrackByWayBillCode({ wayBillCode: wayBillCode })
					uni.hideLoading()
					if (res && res.code == 200) {
						that.applyWaybillInfo(
							Object.assign({}, res.data, { wayBillCode: wayBillCode })
						)
					} else {
						that.goBack('未获取到运单参数')
					}
				} catch (e) {
					uni.hideLoading()
					that.goBack('未获取到运单参数')
				}
			},
			goBack(text) {
				showMsg(text || '参数缺失')
				// 演示页无上级栈时不强制返回
				const pages = getCurrentPages && getCurrentPages()
				if (pages && pages.length > 1) {
					setTimeout(function () {
						uni.navigateBack({ delta: 1 })
					}, 2500)
				}
			},

			// ─── 蓝牙（对齐 newPrint：进入启动并连历史，离开关闭） ───
			teardownBlueTooth() {
				const bt = this.cusBModuleInstance
				if (!bt) return
				this.searching = false
				if (this._btStateHandler) {
					bt.off('stateChange', this._btStateHandler)
					this._btStateHandler = null
				}
				this.cusBModuleInstance = null
				this.bumpBtVersion()
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
					const instance = getBluetoothAdapter()
					if (this._btStateHandler) {
						instance.off('stateChange', this._btStateHandler)
					}
					if (this._btProgressHandler) {
						instance.off('printProgress', this._btProgressHandler)
					}
					this._btStateHandler = function () {
						that.bumpBtVersion()
					}
					this._btProgressHandler = function () {
						that.syncPrintJobFromBt()
					}
					instance.on('stateChange', this._btStateHandler)
					instance.on('printProgress', this._btProgressHandler)
					this.cusBModuleInstance = instance
				}
				if (this.cusBModuleInstance) {
					this.syncOptimalTransferToBt(this.cusBModuleInstance)
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
			async restartOpenBluetoothAdapter() {
				const bt = await this.initBlueTooth()
				if (bt && bt.restartOpenBluetoothAdapter) {
					await bt.restartOpenBluetoothAdapter()
				}
				this.bumpBtVersion()
			},
			async reSearchNearByBlueTooth() {
				try {
					this.searching = true
					const bt = await this.initBlueTooth()
					if (bt && bt.reSearchNearByBlueTooth) {
						await bt.reSearchNearByBlueTooth()
					} else if (bt && bt.searchNearByBlueTooth) {
						await bt.searchNearByBlueTooth('finded', 'refresh')
					}
					this.bumpBtVersion()
				} catch (err) {
					showMsg((err && err.message) || '搜索失败')
				} finally {
					this.searching = !!(
						this.cusBModuleInstance && this.cusBModuleInstance._continuousDiscovering
					)
				}
			},

			// ─── 参数管控 O097 / O098 ───
			async getListParamValue() {
				try {
					const res = await getListParamValue(['O097', 'O098'])
					if (res && res.code == 200 && isNotEmptyArr(res.data)) {
						res.data.forEach((item) => {
							if (item.parameterType == 'O097') {
								this.parameterO097 = item.parameterValue
							}
							if (item.parameterType == 'O098') {
								this.parameterO098 = item.parameterValue
							}
						})
						this.initMultiListByO097()
					}
				} catch (e) {
					console.log('getListParamValue error', e)
				}
			},
			// O097=0 不展示多联；O097=1 四联默认不勾选；O097=2 仅托运客户联且默认勾选
			initMultiListByO097() {
				const allList = [
					{ name: '托运客户联', value: '3', checked: false },
					{ name: '收货客户联', value: '4', checked: false },
					{ name: '记账联', value: '1', checked: false },
					{ name: '存根联', value: '2', checked: false },
				]
				if (this.parameterO097 == '2') {
					this.multiList = [{ ...allList[0], checked: true }]
					this.multiSelectList = ['托运客户联']
				} else if (this.parameterO097 == '1') {
					this.multiList = allList
					this.multiSelectList = []
				} else {
					this.multiList = allList
					this.multiSelectList = []
				}
			},
			multiCheckboxChange(e) {
				const values = (e.detail && e.detail.value) || []
				this.multiList.forEach((item) => {
					item.checked = values.indexOf(item.name) !== -1
				})
				this.multiSelectList = values
			},
			dealMultiSelectList() {
				const cList = []
				const that = this
				that.multiList.forEach((ele) => {
					if (that.multiSelectList.indexOf(ele.name) !== -1) {
						cList.push(ele.name)
					}
				})
				return cList
			},

			// ─── 打印机选择 / 连接 ───
			jumpOldPage() {
				this.selectedBTPrinter({}, this.sharePrinter ? 'shared' : 'label')
			},
			async toggleSharePrinter() {
				const next = !this.sharePrinter
				this.sharePrinter = next
				if (!this.cusBModuleInstance) {
					this.bumpBtVersion()
					return
				}
				const list = (this.cusBModuleInstance._connectedDevicesList || []).slice()
				if (next) {
					// 共用模式：只保留一台，并标记为 shared
					if (list.length > 1) {
						const keep = list[0]
						for (let i = 1; i < list.length; i++) {
							try {
								await this.cusBModuleInstance.closeBlueToothPrinter(list[i])
							} catch (e) {}
						}
						if (keep) keep.printType = 'shared'
					} else if (list.length === 1) {
						list[0].printType = 'shared'
					}
				}
				this.bumpBtVersion()
			},
			resolveConnectType(type) {
				if (this.sharePrinter) return 'shared'
				return type || ''
			},
			async selectedBTPrinter(item, type) {
				await this.initBlueTooth()
				this.openPrintListPopFun(this.resolveConnectType(type))
				// 已有搜索结果或已连接设备时不再自动搜索
				this.$nextTick(() => {
					const hasSearched = (this.deviceList || []).length > 0
					const hasConnected = (this.connectedList || []).length > 0
					if (hasSearched || hasConnected) return
					this.openBluetoothAndSearch()
				})
			},
			openPrintListPopFun(type) {
				if (this.cusBModuleInstance) {
					this.selectedPrinterType = type || ''
					this.openPrintListPop = true
					this.bumpBtVersion()
				} else {
					showMsg('请先启动蓝牙模块适配器')
				}
			},
			onPopOpenChange(val) {
				this.openPrintListPop = !!val
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
				this.connectPrinter({
					item: item,
					type: this.selectedPrinterType,
				})
			},
			onDeviceDisconnect(payload) {
				const item = this.resolveDeviceItem(payload)
				if (item) {
					this.closeConnect(item)
				}
			},
			onBrandBind() {
				this.bumpBtVersion()
			},
			async openBluetoothAndSearch() {
				try {
					this.searching = true
					const bt = await this.initBlueTooth()
					if (bt && bt.searchNearByBlueTooth) {
						await bt.searchNearByBlueTooth('finded', 'refresh')
					}
					this.bumpBtVersion()
				} catch (err) {
					showMsg((err && err.message) || '搜索蓝牙设备失败')
				} finally {
					this.searching = !!(
						this.cusBModuleInstance && this.cusBModuleInstance._continuousDiscovering
					)
				}
			},
			async toggleContinuousSearch() {
				try {
					const bt = await this.initBlueTooth()
					if (this.searching || bt._continuousDiscovering) {
						if (bt.stopContinuousDeviceDiscovery) {
							await bt.stopContinuousDeviceDiscovery()
						} else if (bt.stopBluetoothDevicesDiscovery) {
							await bt.stopBluetoothDevicesDiscovery()
						}
						this.searching = false
						this.bumpBtVersion()
						return
					}
					this.searching = true
					if (bt.startContinuousDeviceDiscovery) {
						const ok = await bt.startContinuousDeviceDiscovery('continue')
						if (!ok) {
							this.searching = false
						}
					} else if (bt.searchNearByBlueTooth) {
						await bt.searchNearByBlueTooth('finded', 'continue')
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
				if (bt._continuousDiscovering || this.searching) {
					try {
						if (bt.stopContinuousDeviceDiscovery) {
							await bt.stopContinuousDeviceDiscovery()
						} else if (bt.stopBluetoothDevicesDiscovery) {
							await bt.stopBluetoothDevicesDiscovery()
						}
					} catch (e) {}
					this.searching = false
				}
				if (bt.clearSearchDevicesResultList) {
					bt.clearSearchDevicesResultList()
				}
				this.bumpBtVersion()
			},
			async disconnectAllDevices() {
				try {
					const bt = await this.initBlueTooth()
					if (bt && bt.disconnectAllConnectedDevices) {
						await bt.disconnectAllConnectedDevices()
					}
					this.bumpBtVersion()
				} catch (err) {
					showMsg((err && err.message) || '全部中断失败')
				}
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
							if (bt && bt.searchNearByBlueTooth) {
								await bt.searchNearByBlueTooth('finded', 'refresh')
							}
							that.bumpBtVersion()
							const list = (bt && bt._searchDevicesResultList) || []
							const matched = list.find(function (ele) {
								const name = (ele && (ele.name || ele.localName)) || ''
								const deviceId = (ele && ele.deviceId) || ''
								return (
									deviceId === code ||
									name === code ||
									deviceId.toLowerCase() === code.toLowerCase() ||
									name.indexOf(code) !== -1 ||
									deviceId.indexOf(code) !== -1
								)
							})
							if (matched) {
								await that.connectPrinter({
									item: matched,
									type: that.selectedPrinterType,
								})
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
			async connectPrinter(options) {
				const { item } = options || {}
				let type = (options && options.type) || ''
				if (!item || !item.deviceId) {
					showMsg('设备信息不完整')
					return
				}
				type = this.resolveConnectType(type || this.selectedPrinterType)
				const bt = await this.initBlueTooth()
				try {
					this.connectingId = item.deviceId
					// 共用模式：连接前断开其它打印机，保证只保留一台
					if (this.sharePrinter || type === 'shared') {
						const others = (bt._connectedDevicesList || []).filter(function (ele) {
							return ele && ele.deviceId && ele.deviceId !== item.deviceId
						})
						for (let i = 0; i < others.length; i++) {
							try {
								await bt.closeBlueToothPrinter(others[i])
							} catch (e) {}
						}
					}
					const useOptimalTransfer =
						!this.printConfig || this.printConfig.useOptimalTransfer !== false
					const newItem = Object.assign({}, item, {
						printType: type,
						useOptimalTransfer: useOptimalTransfer,
					})
					if (newItem.isConnect) {
						const full =
							(bt._connectedDevicesList || []).find(function (ele) {
								return ele && ele.deviceId === item.deviceId
							}) || newItem
						await bt.closeBlueToothPrinter(full)
					} else {
						this.syncOptimalTransferToBt(bt)
						await bt.connectBlueToothPrinter(newItem)
						// 最优传输会回写 MTU / 间隔，同步到界面传输设置
						if (useOptimalTransfer && bt.getPrintConfig) {
							this.printConfig = Object.assign({}, bt.getPrintConfig())
						}
						// 确保已连接列表上的 printType 已更新为当前绑定类型
						const connected = (bt._connectedDevicesList || []).find(function (ele) {
							return ele && ele.deviceId === item.deviceId
						})
						if (connected) {
							connected.printType = type
						}
					}
					this.openPrintListPop = false
					this.openHistoryPopup = false
					this.bumpBtVersion()
				} catch (err) {
					showMsg((err && err.message) || '连接失败')
				} finally {
					this.connectingId = ''
					this.bumpBtVersion()
				}
			},
			onConnectedClose(payload) {
				// BluetoothDeviceItem 直接抛出 device；兼容旧事件结构
				const item =
					payload && payload.deviceId
						? payload
						: this.resolveDeviceItem(payload)
				if (item) {
					this.closeConnect(item)
				}
			},
			async closeConnect(item) {
				const deviceId = item && item.deviceId
				if (!deviceId) {
					showMsg('设备信息不完整')
					return
				}
				const res = await showModal({
					title: '温馨提示',
					content: '您确定断开该打印机连接？',
				})
				if (res && res.confirm && this.cusBModuleInstance) {
					const full =
						(this.cusBModuleInstance._connectedDevicesList || []).find(
							function (ele) {
								return ele && ele.deviceId === deviceId
							}
						) || item
					await this.cusBModuleInstance.closeBlueToothPrinter(full)
					this.bumpBtVersion()
				}
			},

			// ─── 打印前校验（对齐 newPrint.validateForm） ───
			validateForm() {
				const that = this
				const errLog = []
				const needLabel = that.selectedPrintLabel
				const needWaybill = that.selectedPrintWaybill
				const needReceipt =
					that.enablePrintReceipt && that.selectedPrintReceipt
				if (!needLabel && !needWaybill && !needReceipt) {
					errLog.push('请至少勾选一项要打印的模板')
					return errLog
				}
				const { labelPrinter, waybillPrinter, receiptPrinter } =
					that.connectedPrinter
				if (needLabel) {
					if (!labelPrinter.deviceId) {
						errLog.push(
							that.sharePrinter
								? '请先连接共用打印机'
								: '请先给打印标签绑定打印机'
						)
					} else if (that.labelPrintChecked) {
						if (convertNumber(that.bqValue) < 1) {
							errLog.push('打印标签打印份数至少为1张')
						}
					} else {
						const start = convertNumber(that.assignBqValueStart)
						const end = convertNumber(that.assignBqValueEnd)
						if (end < start) {
							errLog.push('打印标签结束份数不能小于开始份数')
						}
					}
				}
				if (needWaybill) {
					if (!waybillPrinter.deviceId) {
						errLog.push(
							that.sharePrinter
								? '请先连接共用打印机'
								: '请先给打印运单绑定打印机'
						)
					} else {
						if (convertNumber(that.ydValue) < 1) {
							errLog.push('打印运单打印份数至少为1张')
						}
						if (that.parameterO097 != '0') {
							const multiSelect = that.multiList
								.filter((item) => item.checked)
								.map((item) => item.value)
							if (!multiSelect.length) {
								errLog.push('打印运单请勾选要打印的多联单')
							}
						}
					}
				}
				if (needReceipt) {
					if (!receiptPrinter.deviceId) {
						errLog.push(
							that.sharePrinter
								? '请先连接共用打印机'
								: '请先给打印回单绑定打印机'
						)
					} else if (that.printReceiptChecked) {
						if (convertNumber(that.printReceiptNum) < 1) {
							errLog.push('打印回单打印份数至少为1张')
						}
					} else if (convertNumber(that.printReceiptNum) > 0) {
						errLog.push('请勾选打印回单份数')
					}
				}
				return errLog
			},

			async confirmPrinting() {
				const that = this
				const errLog = that.validateForm()
				if (errLog.length) {
					showMsg(errLog.join(';'))
					return
				}
				try {
					that.printLoading = true
					that.beginPrintJob()
					await that.buildPrintQueue()
					that.finishPrintJob('success')
				} catch (err) {
					that.finishPrintJob('fail')
					const errMsg = (err && err.message) || '打印失败'
					console.log('confirmPrinting-err=====>', errMsg)
					await showModal({
						title: '打印失败',
						content: String(errMsg),
						showCancel: false,
						confirmText: '知道了',
					})
				} finally {
					that.printLoading = false
				}
			},

			/** 打印机展示名 */
			resolvePrinterDisplayName(device) {
				const d = device || {}
				return d.name || d.localName || '未命名打印机'
			},

			calcWaybillJobCount() {
				if (!this.selectedPrintWaybill) return 0
				const copies = convertNumber(this.ydValue)
				const multiList = this.dealMultiSelectList() || []
				if (this.parameterO097 != '0' && multiList.length) {
					return copies * multiList.length
				}
				return copies
			},

			calcLabelJobCount() {
				if (!this.selectedPrintLabel) return 0
				if (this.labelPrintChecked) {
					return convertNumber(this.bqValue)
				}
				const start = convertNumber(this.assignBqValueStart)
				const end = convertNumber(this.assignBqValueEnd)
				return Math.max(0, end - start + 1)
			},

			calcReceiptJobCount() {
				if (
					!(
						this.enablePrintReceipt &&
						this.selectedPrintReceipt &&
						this.printReceiptChecked
					)
				) {
					return 0
				}
				return convertNumber(this.printReceiptNum)
			},

			createPrintTypeJob(printType, totalCount, printer) {
				const cfg = this.printConfig || {}
				return {
					printType: printType,
					printerName: this.resolvePrinterDisplayName(printer),
					finishedCount: 0,
					totalCount: Math.max(0, Number(totalCount) || 0),
					status: 'pending',
					estimatedSec: 0,
					printProgress: 0,
					transferProgress: 0,
					elapsedSec: 0,
					mtu: Number(cfg.mtu) || 0,
				}
			},

			patchPrintJob(printType, partial) {
				if (!printType) return
				const current = (this.printJobs && this.printJobs[printType]) || null
				if (!current) return
				this.printJobs = Object.assign({}, this.printJobs, {
					[printType]: Object.assign({}, current, partial || {}),
				})
				this.printJobVersion += 1
			},

			beginPrintJob() {
				const { labelPrinter, waybillPrinter, receiptPrinter } =
					this.connectedPrinter
				const jobs = {}
				if (this.selectedPrintWaybill && waybillPrinter && waybillPrinter.deviceId) {
					jobs.waybill = this.createPrintTypeJob(
						'waybill',
						this.calcWaybillJobCount(),
						waybillPrinter
					)
				}
				if (this.selectedPrintLabel && labelPrinter && labelPrinter.deviceId) {
					jobs.label = this.createPrintTypeJob(
						'label',
						this.calcLabelJobCount(),
						labelPrinter
					)
				}
				if (
					this.enablePrintReceipt &&
					this.selectedPrintReceipt &&
					this.printReceiptChecked &&
					receiptPrinter &&
					receiptPrinter.deviceId
				) {
					jobs.receipt = this.createPrintTypeJob(
						'receipt',
						this.calcReceiptJobCount(),
						receiptPrinter
					)
				}
				this.printJobs = jobs
				this.activePrintType = ''
				this.printJobVersion += 1
			},

			finishPrintJob(status) {
				const next = status === 'success' ? 'success' : 'fail'
				const jobs = Object.assign({}, this.printJobs || {})
				const keys = Object.keys(jobs)
				for (let i = 0; i < keys.length; i++) {
					const key = keys[i]
					const job = jobs[key]
					if (!job) continue
					if (next === 'success') {
						if (job.status === 'pending' || job.status === 'printing') {
							jobs[key] = Object.assign({}, job, {
								status: 'success',
								finishedCount: Number(job.totalCount || 0),
								printProgress: 100,
								transferProgress: 100,
							})
						}
					} else if (key === this.activePrintType || job.status === 'printing') {
						jobs[key] = Object.assign({}, job, {
							status: 'fail',
						})
					}
				}
				this.printJobs = jobs
				this.activePrintType = ''
				this.printJobVersion += 1
			},

			setPrintJobType(printType) {
				const type = printType || ''
				this.activePrintType = type
				if (!type) return
				this.patchPrintJob(type, {
					status: 'printing',
					finishedCount: 0,
					printProgress: 0,
					transferProgress: 0,
					elapsedSec: 0,
					estimatedSec: 0,
				})
			},

			markPrintBatchDone(printType, batchCount) {
				const type = printType || this.activePrintType
				if (!type) return
				const job = (this.printJobs && this.printJobs[type]) || null
				const total = job
					? Number(job.totalCount || 0)
					: Math.max(0, Number(batchCount) || 0)
				const finished = total > 0
					? total
					: Math.max(0, Number(batchCount) || 0)
				this.patchPrintJob(type, {
					status: 'success',
					finishedCount: finished,
					totalCount: total || finished,
					printProgress: 100,
					transferProgress: 100,
				})
				if (this.activePrintType === type) {
					this.activePrintType = ''
				}
			},

			syncPrintJobFromBt() {
				const bt = this.cusBModuleInstance
				if (!bt || !bt.getPrintProgress) return
				const type = this.activePrintType
				if (!type || !(this.printJobs && this.printJobs[type])) return
				const progress = bt.getPrintProgress() || {}
				const cfg = (bt.getPrintConfig && bt.getPrintConfig()) || this.printConfig || {}
				const job = this.printJobs[type]
				const total = Number(job.totalCount || 0)
				const finishedCount = Math.min(
					total || Number(progress.finishedTasks || 0),
					Number(progress.finishedTasks || 0)
				)
				let printProgress = Number(progress.printProgress || 0)
				if (total > 0) {
					const byCount = Math.round((finishedCount / total) * 100)
					printProgress = Math.max(byCount, Math.min(100, printProgress))
				}
				this.patchPrintJob(type, {
					finishedCount: finishedCount,
					estimatedSec: Number(progress.estimatedSec || 0),
					printProgress: printProgress,
					transferProgress: Number(progress.transferProgress || 0),
					elapsedSec: Number(progress.elapsedSec || 0),
					mtu: Number(cfg.mtu) || Number(job.mtu) || 0,
					status: this.printLoading ? 'printing' : (job.status || 'idle'),
				})
			},

			// ─── 建立打印队列（对齐 newPrint：先运单 → 标签 → 回单） ───
			async buildPrintQueue() {
				const that = this
				const { labelPrinter, waybillPrinter, receiptPrinter } =
					that.connectedPrinter

				if (that.selectedPrintWaybill && waybillPrinter.deviceId) {
					const printData = {
						waybillCopies: that.ydValue,
						waybillInfo: that.waybillInfo,
						parameterO097: that.parameterO097,
						multiSelectList: that.dealMultiSelectList(),
						parameterO098: that.parameterO098,
					}
					await that.doPrintTaskItem(waybillPrinter, printData, 'waybill')
				}

				if (that.selectedPrintLabel && labelPrinter.deviceId) {
					const printData = {
						copiesState: that.labelPrintChecked,
						assignState: !that.labelPrintChecked,
						labelCopies: that.bqValue,
						assignBqValueStartValue: that.assignBqValueStart,
						assignBqValueEndValue: that.assignBqValueEnd,
						waybillInfo: that.waybillInfo,
						parameterO097: that.parameterO097,
						parameterO098: that.parameterO098,
					}
					await that.doPrintTaskItem(labelPrinter, printData, 'label')
				}

				if (
					that.enablePrintReceipt &&
					that.selectedPrintReceipt &&
					receiptPrinter.deviceId &&
					that.printReceiptChecked
				) {
					await that.printReceiptTask(receiptPrinter)
				}

				showMsg('打印完成', 'success')
			},

			/** 从已连接列表补齐 BLE 写入字段，避免共用模式等场景丢 serviceId */
			resolvePrintDevice(device) {
				const bt = this.cusBModuleInstance
				const cList = (bt && bt._connectedDevicesList) || []
				const deviceId = device && device.deviceId
				if (!deviceId) return device || {}
				const full = cList.find(function (ele) {
					return ele && ele.deviceId === deviceId
				})
				if (!full) return device
				return Object.assign({}, device, {
					serviceId: device.serviceId || full.serviceId,
					characteristicId: device.characteristicId || full.characteristicId,
					writeType: device.writeType || full.writeType || '',
					name: device.name || full.name || '',
					localName: device.localName || full.localName || '',
				})
			},

			createPrintTask(device, printDataStr, meta) {
				const d = this.resolvePrintDevice(device)
				const m = meta || {}
				return {
					deviceId: d.deviceId,
					serviceId: d.serviceId,
					characteristicId: d.characteristicId,
					name: d.name || d.localName || '',
					localName: d.localName || '',
					writeType: d.writeType || '',
					printDataStr: printDataStr,
					templateName: m.templateName || '打印任务',
					printType: m.printType || '',
					sheetIndex: m.sheetIndex || 0,
					sheetTotal: m.sheetTotal || 0,
					printTime: m.printTime || Date.now(),
				}
			},

			/** 将 ble 失败信息格式化为「第几张 + 原因」 */
			formatPrintFailMessage(err, printTaskList) {
				const raw = String((err && err.message) || err || '蓝牙打印数据写入失败')
				const list = Array.isArray(printTaskList) ? printTaskList : []
				const typeMap = {
					label: '标签',
					waybill: '运单',
					receipt: '回单',
				}
				const matched = raw.match(/第【(\d+)】/)
				if (matched) {
					const seq = Number(matched[1])
					const task = list[seq - 1] || {}
					const typeName = typeMap[task.printType] || '打印'
					const tplName = task.templateName || typeName
					const total = task.sheetTotal || list.length || 0
					const sheetNo = task.sheetIndex || seq
					let reason = raw
						.replace(/^第【\d+】打印任务[，,：:]?/, '')
						.replace(/^失败[：:]?/, '')
						.trim()
					if (!reason) reason = raw
					const totalText = total > 0 ? '/' + total + '张' : ''
					return '第' + sheetNo + '张' + totalText + '（' + tplName + '）打印失败：' + reason
				}
				return '打印失败：' + raw
			},

			async printCpclList(device, pList) {
				if (!isNotEmptyArr(pList)) {
					throw new Error('未获取到打印数据')
				}
				const bt = this.cusBModuleInstance
				if (!bt) {
					throw new Error('请先启动蓝牙模块')
				}
				const printDevice = this.resolvePrintDevice(device)
				if (!printDevice.serviceId || !printDevice.characteristicId) {
					throw new Error('打印机未就绪，请重新连接后再打印')
				}
				const total = pList.length
				const printTaskList = pList.map((item, index) => {
					if (typeof item === 'string') {
						return this.createPrintTask(printDevice, item, {
							sheetIndex: index + 1,
							sheetTotal: total,
						})
					}
					return this.createPrintTask(
						printDevice,
						(item && (item.cpcl || item.printDataStr)) || '',
						{
							templateName: (item && item.templateName) || '打印任务',
							printType: (item && item.printType) || '',
							sheetIndex: (item && item.sheetIndex) || index + 1,
							sheetTotal: (item && item.sheetTotal) || total,
						}
					)
				})
				try {
					await bt.print(printTaskList)
				} catch (err) {
					throw new Error(this.formatPrintFailMessage(err, printTaskList))
				}
				return true
			},

			/** 按已连接打印机解析模板品牌（供 template-comm 方言适配） */
			resolvePrintTemplateCtx(device, baseCtx) {
				const d = this.resolvePrintDevice(device) || {}
				const deviceName = d.name || d.localName || ''
				const deviceId = d.deviceId || ''
				const brandInfo = resolvePrinterBrandInfo(deviceName, deviceId)
				return Object.assign({}, baseCtx || {}, {
					// 未知品牌默认芝柯方言，与历史主路径一致
					brand: (brandInfo && brandInfo.brand) || 'CC3',
					deviceName: deviceName,
					deviceId: deviceId,
				})
			},

			// 对齐 newPrint.doPrintTaskItem：按 options 组装标签/运单 CPCL 列表
			async doPrintTaskItem(device, options, printType) {
				try {
					this.setPrintJobType(printType || '')
					const pList = await this.collectCpclItems(device, options)
					await this.printCpclList(device, pList)
					this.markPrintBatchDone(printType || '', (pList && pList.length) || 0)
					return true
				} catch (err) {
					const errMsg = (err && err.message) || err || '蓝牙打印数据写入失败'
					console.log('doPrintTask-errMsg=====>', errMsg)
					throw (err instanceof Error ? err : new Error(String(errMsg)))
				}
			},

			/** 组装标签/运单 CPCL 项（不写入蓝牙） */
			async collectCpclItems(device, options) {
				const that = this
				const {
					copiesState,
					assignState,
					labelCopies,
					assignBqValueStartValue,
					assignBqValueEndValue,
					waybillCopies,
					waybillInfo,
					parameterO097,
					multiSelectList,
					parameterO098,
				} = options || {}

				let amountOfSheets = 0
				let whichOne = 1
				if (copiesState) {
					amountOfSheets = convertNumber(labelCopies)
					whichOne = 1
				}
				if (assignState) {
					amountOfSheets = convertNumber(assignBqValueEndValue)
					whichOne = convertNumber(assignBqValueStartValue)
				}

				const WayBillInfoVO =
					(waybillInfo && waybillInfo.appletWayBillCodeInfoVO) || {}
				const pList = []
				const tplCtx = that.resolvePrintTemplateCtx(device, {
					parameterO097: parameterO097,
					parameterO098: parameterO098,
					zoneId: that.zoneId,
				})

				if (amountOfSheets > 0) {
					const labelName = resolveLabelTemplateName(tplCtx)
					const labelTotal = amountOfSheets - whichOne + 1
					let labelSeq = 0
					for (let i = whichOne; i <= amountOfSheets; i++) {
						labelSeq += 1
						const data = Object.assign({}, WayBillInfoVO, {
							currentCopyCode: i,
						})
						if (data.startPoint == '盛聚拼多多项目部') {
							data.QRCode =
								i < 10
									? data.code + '000' + i.toString()
									: i >= 10
										? data.code + '00' + i.toString()
										: data.code + '0' + i.toString()
						} else {
							data.QRCode = data.code
						}
						pList.push({
							cpcl: resolveLabelTemplate(data, tplCtx),
							templateName: labelName,
							printType: 'label',
							sheetIndex: labelSeq,
							sheetTotal: labelTotal,
						})
					}
				}

				const waybillValue = convertNumber(waybillCopies)
				if (waybillValue > 0) {
					if (
						parameterO097 != '0' &&
						multiSelectList &&
						multiSelectList.length
					) {
						for (let m = 0; m < multiSelectList.length; m++) {
							const item = multiSelectList[m]
							const res = await getFaceOrderReport({
								codes: WayBillInfoVO.code,
								printType: item,
							})
							const table1 = (res && res.data && res.data.table1) || []
							const paramValue = table1[0] || {}
							const waybillCtx = Object.assign({}, tplCtx, {
								isMulti: true,
								multiType: item,
							})
							const tData = resolveWaybillTemplate(paramValue || {}, waybillCtx)
							const waybillName = resolveWaybillTemplateName(waybillCtx)
							for (let i = 0; i < waybillValue; i++) {
								pList.push({
									cpcl: tData,
									templateName: waybillName,
									printType: 'waybill',
									sheetIndex: i + 1,
									sheetTotal: waybillValue,
								})
							}
						}
					} else {
						const waybillCtx = Object.assign({}, tplCtx, {
							isMulti: false,
						})
						const tData = resolveWaybillTemplate(WayBillInfoVO, waybillCtx)
						const waybillName = resolveWaybillTemplateName(waybillCtx)
						for (let i = 0; i < waybillValue; i++) {
							pList.push({
								cpcl: tData,
								templateName: waybillName,
								printType: 'waybill',
								sheetIndex: i + 1,
								sheetTotal: waybillValue,
							})
						}
					}
				}

				return pList
			},

			/** 组装回单 CPCL 项（不写入蓝牙） */
			async collectReceiptItems(receiptPrinter) {
				const that = this
				const rows = await that.receiptTask()
				const receiptCtx = that.resolvePrintTemplateCtx(receiptPrinter, {
					parameterO097: that.parameterO097,
					zoneId: that.zoneId,
				})
				const receiptTpl = resolveReceiptTemplate(rows[0] || {}, receiptCtx)
				const receiptName = resolveReceiptTemplateName(receiptCtx)
				const pList = []
				const num = convertNumber(that.printReceiptNum)
				for (let index = 0; index < num; index++) {
					pList.push({
						cpcl: receiptTpl,
						templateName: receiptName,
						printType: 'receipt',
						sheetIndex: index + 1,
						sheetTotal: num,
					})
				}
				return pList
			},

			// 对齐 newPrint.printReceiptTask
			async printReceiptTask(receiptPrinter) {
				this.setPrintJobType('receipt')
				const pList = await this.collectReceiptItems(receiptPrinter)
				await this.printCpclList(receiptPrinter, pList)
				this.markPrintBatchDone('receipt', (pList && pList.length) || 0)
			},
			receiptTask() {
				const that = this
				return receiptTaskApi({
					codes: JSON.stringify(
						that.waybillInfo.wayBillCode || that.wayBillCode || DEFAULT_WAY_BILL_CODE
					),
				}).then(function (res) {
					if (res && res.code == 200) {
						return res.data || []
					}
					return []
				})
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import './comm/common.scss';

	.print {
		padding-bottom: 520rpx;
		background: $pr-page-bg;
		min-height: 100vh;
	}

	.deviceBar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
		padding: 16rpx 24rpx;
		background: #fff;
		border-bottom: 1rpx solid $pr-border-color;
		font-size: 26rpx;
		color: $pr-theme;
		box-sizing: border-box;
		width: 100%;

		&-left {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 8rpx;
			flex: 1;
			min-width: 0;
		}

		&-split {
			color: rgba(196, 132, 26, 0.45);
		}

		&-item {
			color: $pr-theme-text;
		}

		&-link {
			flex-shrink: 0;
			color: $pr-theme-text;
			font-size: 26rpx;
			font-weight: 600;
			padding: 4rpx 0;
		}
	}

	.alertBox {
		color: $pr-text-muted;
		font-size: 22rpx;
		line-height: 1.45;
		position: relative;
		padding: 20rpx 24rpx;

		&_item {
			margin-bottom: 4rpx;
		}
	}

	.checkRow {
		display: flex;
		align-items: center;
		gap: 12rpx;
		font-size: 28rpx;
		color: $pr-text-body;

		&-box {
			width: 32rpx;
			height: 32rpx;
			border-radius: 6rpx;
			box-sizing: border-box;
			flex-shrink: 0;
			position: relative;

			&--unactive {
				border: 2rpx solid #cbbfae;
				background: #fff;
			}

			&--active {
				border: 2rpx solid $pr-theme;
				background: $pr-theme;

				&::after {
					content: '';
					position: absolute;
					left: 10rpx;
					top: 4rpx;
					width: 8rpx;
					height: 16rpx;
					border: solid #fff;
					border-width: 0 3rpx 3rpx 0;
					transform: rotate(45deg);
					box-sizing: border-box;
				}
			}
		}

		&-title {
			font-size: 32rpx;
			font-weight: 700;
			line-height: 1.3;
		}

		&--unactive &-title {
			color: $pr-text-main;
		}

		&--active &-title {
			color: $pr-theme-text;
		}

		&--unactive .sharePrinterRow-text {
			color: $pr-text-body;
		}

		&--active .sharePrinterRow-text {
			color: $pr-theme-text;
		}
	}

	.checkbox {
		padding: 20rpx 0;

		&-group {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 20rpx;
		}

		&-item {
			display: flex;
			align-items: center;
			justify-content: flex-start;

			&__active {
				color: $pr-theme-text;
				font-weight: 600;
			}

			&__unactive {
				color: $pr-text-body;
			}
		}
	}

	.pBox {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 20rpx;
	}

	.main {
		padding: 8rpx 0;
	}

	.btBox {
		&-link {
			padding: 4rpx 12rpx;
			border-radius: 8rpx;
			background: $pr-theme-soft-strong;
			color: $pr-theme-text;
			font-size: 22rpx;
			font-weight: 600;
			line-height: 1.4;
		}

		&-start {
			margin-left: 4rpx;
		}
	}

	.sharePrinterRow {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx 0 12rpx;
		flex-wrap: wrap;

		&-text {
			font-size: 28rpx;
			color: $pr-text-body;
			font-weight: 600;
		}

		&-tip {
			font-size: 22rpx;
			color: $pr-text-muted;
			margin-left: 4rpx;
		}
	}

	.cPClose {
		width: 52rpx;
		height: 52rpx;
		line-height: 48rpx;
		text-align: center;
		font-size: 36rpx;
		color: $pr-text-muted;
		border-radius: 50%;
		background: #fff;
		border: 1rpx solid $pr-border-color;
		box-sizing: border-box;
	}

	.footerBtn-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.taskBtn {
		flex: 0 0 220rpx;
		margin: 0;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 16rpx;
		font-weight: 700;
		font-size: 28rpx;
		color: $pr-theme-text !important;
		background: $pr-theme-soft !important;
		border: 2rpx solid $pr-theme;

		&::after {
			border: none;
		}

		&[disabled] {
			opacity: 0.7;
		}
	}

	.footerBtn-row .printBtn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
	}
</style>
