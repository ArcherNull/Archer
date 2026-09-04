<template>
	<view class="print">
		<!-- 顶部手机设备信息（本项目扩展，便于联调） -->
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
				<view class="btBox" v-if="cusBModuleInstance">
					<view
						@click="restartOpenBluetoothAdapter"
						:class="['btBox-start', moduleStateClass]"
					>
						{{ moduleStateText }}
					</view>
					<view
						@click="reSearchNearByBlueTooth"
						:class="['btBox-search', searchStateClass]"
					>
						{{ searchStateText }}
					</view>
					<view v-if="moduleState === 'started'">
						已搜索{{ searchCount }}设备
					</view>
				</view>
				<view class="unactiveCss" v-else @click="initBlueTooth">未启动</view>
			</view>

			<view class="cPBox">
				<view
					class="cPList"
					v-if="cusBModuleInstance && connectedList.length"
				>
					<view
						class="cPList-item"
						v-for="(item, index) in connectedList"
						:key="item.deviceId || index"
						@click="closeConnect(item)"
					>
						{{ item.name || item.localName || '已连接设备' }}
					</view>
				</view>
				<view class="noMoreBox" v-else @click="jumpOldPage">
					暂无连接蓝牙打印机
				</view>
			</view>
		</PrintItemBox>

		<!-- 打印标签 -->
		<PrintItemBox title="打印标签" :isShowBottomLine="true">
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
		<PrintItemBox title="打印运单" :isShowBottomLine="true">
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
									color="#FF9407"
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
		<PrintItemBox
			title="打印回单"
			:isShowBottomLine="true"
			v-if="enablePrintReceipt"
		>
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

		<!-- 搜索得到的蓝牙打印机列表 -->
		<PrintListPop
			ref="printListPopRef"
			:openPop="openPrintListPop"
			:type="selectedPrinterType"
			:printInstance="cusBModuleInstance"
			:connectingId="connectingId"
			@update:openPop="onPopOpenChange"
			@connect="connectPrinter"
			@research="onPopResearch"
			@continue-search="onPopContinueSearch"
			@stop-search="onPopStopSearch"
		/>

		<view class="footerBtn">
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
</template>

<script>
	/**
	 * 业务主页：深度对齐 kpsapp newPrint.vue 交互与打印队列
	 * BLE 走本项目 getBluetoothAdapter；模板走 template/CC3；接口走 mock
	 */
	import PrintItemBox from './components/PrintItemBox.vue'
	import SelectPrinter from './components/SelectPrinter.vue'
	import LabelBox from './components/LabelBox.vue'
	import NumberBox from './components/NumberBox.vue'
	import PrintListPop from './components/PrintListPop.vue'
	import { ALERT_TEXT_LIST } from './help/index.js'
	import { getBluetoothAdapter } from './ble/index.js'
	import { showMsg, convertNumber, isNotEmptyArr, showModal } from './comm/utils.js'
	import {
		resolveLabelTemplate,
		resolveWaybillTemplate,
		resolveReceiptTemplate,
	} from './template/CC3/index.js'
	import {
		getListParamValue,
		queryTrackByWayBillCode,
		getFaceOrderReport,
		receiptTask as receiptTaskApi,
		DEFAULT_WAY_BILL_CODE,
	} from '../../mock/api.js'

	export default {
		name: 'PrintIndex',
		components: {
			PrintItemBox,
			SelectPrinter,
			LabelBox,
			NumberBox,
			PrintListPop,
		},
		data() {
			return {
				platformName: '其它',
				deviceName: '未知设备',
				userInfo: {},
				zoneId: 0,
				labelPrintChecked: true,
				bqValue: 0,
				assignBqValueStart: 0,
				assignBqValueEnd: 1,
				ydValue: 1,
				printReceiptNum: 1,
				openPrintListPop: false,
				printLoading: false,
				selectedPrinterType: '',
				cusBModuleInstance: null,
				printReceiptChecked: true,
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
				connectedList: [],
				connectingId: '',
				_btStateHandler: null,
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
			connectedPrinter() {
				void this.btVersion
				const obj = {
					labelPrinter: {},
					waybillPrinter: {},
					receiptPrinter: {},
				}
				if (this.cusBModuleInstance) {
					const cList = this.cusBModuleInstance._connectedDevicesList
					if (isNotEmptyArr(cList)) {
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
					}
				}
				return obj
			},
		},
		onLoad(options) {
			this.initDeviceInfo()
			this.loadUserInfo(options || {})
			this.initPage(options || {})
		},
		onShow() {
			this.initBlueTooth()
		},
		onUnload() {
			// 业务页使用全局单例，仅解绑监听，不销毁适配器（调试页可继续复用）
			const bt = this.cusBModuleInstance
			if (bt && this._btStateHandler) {
				bt.off('stateChange', this._btStateHandler)
				this._btStateHandler = null
			}
			this.cusBModuleInstance = null
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
				if (this.openPrintListPop && this.$refs.printListPopRef) {
					this.$refs.printListPopRef.initCInstance(this.cusBModuleInstance)
				}
			},
			syncDeviceViewFromBt() {
				const bt = this.cusBModuleInstance
				if (!bt) {
					this.moduleState = 'notStarted'
					this.searchState = 'notSearched'
					this.searchCount = 0
					this.connectedList = []
					return
				}
				this.moduleState = bt._bluetoothModuleState || 'notStarted'
				this.searchState = bt._bluetoothModuleSearchState || 'notSearched'
				this.searchCount = (bt._searchDevicesResultList || []).length
				this.connectedList = (bt._connectedDevicesList || []).slice()
				if (bt.getPlatformDisplayName) {
					this.platformName = bt.getPlatformDisplayName() || this.platformName
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

			// ─── 蓝牙（对齐 newPrint，适配器为全局单例） ───
			async initBlueTooth() {
				const that = this
				if (!this.cusBModuleInstance) {
					const instance = getBluetoothAdapter()
					if (this._btStateHandler) {
						instance.off('stateChange', this._btStateHandler)
					}
					this._btStateHandler = function () {
						that.bumpBtVersion()
					}
					instance.on('stateChange', this._btStateHandler)
					this.cusBModuleInstance = instance
					await instance.setupBlueTooth()
					await instance.connectHistoryPrintDevices()
					this.bumpBtVersion()
				} else {
					this.bumpBtVersion()
				}
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
					const bt = await this.initBlueTooth()
					if (bt && bt.reSearchNearByBlueTooth) {
						await bt.reSearchNearByBlueTooth()
					} else if (bt && bt.searchNearByBlueTooth) {
						await bt.searchNearByBlueTooth('finded', 'refresh')
					}
					this.bumpBtVersion()
				} catch (err) {
					showMsg((err && err.message) || '搜索失败')
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
				this.selectedBTPrinter({}, 'label')
			},
			async selectedBTPrinter(item, type) {
				const instance = await this.initBlueTooth()
				if (
					instance._bluetoothModuleState === 'started' &&
					!(instance._searchDevicesResultList || []).length
				) {
					try {
						await instance.searchNearByBlueTooth('finded')
					} catch (e) {
						showMsg((e && e.message) || '搜索失败')
					}
					this.bumpBtVersion()
				}
				this.openPrintListPopFun(type)
			},
			openPrintListPopFun(type) {
				if (this.cusBModuleInstance) {
					this.selectedPrinterType = type || ''
					this.openPrintListPop = true
					this.$nextTick(() => {
						if (this.$refs.printListPopRef) {
							this.$refs.printListPopRef.initCInstance(this.cusBModuleInstance)
						}
					})
				} else {
					showMsg('请先启动蓝牙模块适配器')
				}
			},
			onPopOpenChange(val) {
				this.openPrintListPop = !!val
			},
			async connectPrinter(options) {
				const { item, type } = options || {}
				if (!item || !item.deviceId) {
					showMsg('设备信息不完整')
					return
				}
				const bt = await this.initBlueTooth()
				const newItem = Object.assign({}, item, { printType: type })
				try {
					this.connectingId = item.deviceId
					if (newItem.isConnect) {
						await bt.closeBlueToothPrinter(newItem)
					} else {
						await bt.connectBlueToothPrinter(newItem)
					}
					this.openPrintListPop = false
					this.bumpBtVersion()
				} catch (err) {
					showMsg((err && err.message) || '连接失败')
				} finally {
					this.connectingId = ''
					this.bumpBtVersion()
				}
			},
			async closeConnect(item) {
				const res = await showModal({
					title: '温馨提示',
					content: '您确定断开该打印机连接？',
				})
				if (res && res.confirm && this.cusBModuleInstance && item) {
					await this.cusBModuleInstance.closeBlueToothPrinter(item)
					this.bumpBtVersion()
				}
			},
			async onPopResearch() {
				await this.reSearchNearByBlueTooth()
			},
			async onPopContinueSearch() {
				this.bumpBtVersion()
			},
			async onPopStopSearch() {
				this.bumpBtVersion()
			},

			// ─── 打印前校验（对齐 newPrint.validateForm） ───
			validateForm() {
				const that = this
				const errLog = []
				const { labelPrinter, waybillPrinter, receiptPrinter } =
					that.connectedPrinter
				if (
					labelPrinter.deviceId ||
					waybillPrinter.deviceId ||
					receiptPrinter.deviceId
				) {
					if (labelPrinter.deviceId) {
						if (that.labelPrintChecked) {
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
					if (waybillPrinter.deviceId) {
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
					if (receiptPrinter.deviceId) {
						if (that.printReceiptChecked) {
							if (convertNumber(that.printReceiptNum) < 1) {
								errLog.push('打印回单打印份数至少为1张')
							}
						} else if (convertNumber(that.printReceiptNum) > 0) {
							errLog.push('请勾选打印回单份数')
						}
					}
				} else {
					errLog.push('请先给打印标签或打印运单绑定打印机')
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
					await that.buildPrintQueue()
					that.printLoading = false
					uni.hideLoading()
				} catch (err) {
					showMsg((err && err.message) || '打印失败')
					that.printLoading = false
				}
			},

			// ─── 建立打印队列（对齐 newPrint：先运单 → 标签 → 回单） ───
			async buildPrintQueue() {
				const that = this
				const { labelPrinter, waybillPrinter, receiptPrinter } =
					that.connectedPrinter
				const osName =
					(that.cusBModuleInstance && that.cusBModuleInstance._osName) || ''

				uni.showLoading({
					title: '打印中...',
					mask: true,
				})

				if (waybillPrinter.deviceId) {
					const printData = {
						waybillCopies: that.ydValue,
						waybillInfo: that.waybillInfo,
						parameterO097: that.parameterO097,
						multiSelectList: that.dealMultiSelectList(),
						parameterO098: that.parameterO098,
					}
					await that.doPrintTask(waybillPrinter, printData, osName)
				}

				if (labelPrinter.deviceId) {
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
					await that.doPrintTask(labelPrinter, printData, osName)
				}

				if (receiptPrinter.deviceId && that.printReceiptChecked) {
					await that.printReceiptTask(receiptPrinter)
				}

				uni.hideLoading()
				showMsg('打印完成', 'success')
			},

			/**
			 * 执行打印任务
			 * 原项目 CC3 走 $Common.newPrint，其它走 doPrintTaskItem；
			 * 本项目统一走 CC3 模板选择器 + ble.print
			 */
			async doPrintTask(device, options, osName) {
				await this.doPrintTaskItem(device, options, osName)
			},

			createPrintTask(device, printDataStr) {
				return {
					deviceId: device.deviceId,
					serviceId: device.serviceId,
					characteristicId: device.characteristicId,
					name: device.name || device.localName || '',
					localName: device.localName || '',
					writeType: device.writeType || '',
					printDataStr: printDataStr,
				}
			},

			async printCpclList(device, pList) {
				if (!isNotEmptyArr(pList)) {
					showMsg('未获取到打印数据')
					return false
				}
				const bt = this.cusBModuleInstance
				const printTaskList = pList.map((str) => this.createPrintTask(device, str))
				return bt.print(printTaskList)
			},

			// 对齐 newPrint.doPrintTaskItem：按 options 组装标签/运单 CPCL 列表
			async doPrintTaskItem(device, options) {
				const that = this
				try {
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
					const tplCtx = {
						parameterO097: parameterO097,
						parameterO098: parameterO098,
						zoneId: that.zoneId,
					}

					// 打印标签
					if (amountOfSheets > 0) {
						for (let i = whichOne; i <= amountOfSheets; i++) {
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
							pList.push(resolveLabelTemplate(data, tplCtx))
						}
					}

					// 打印运单
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
								const tData = resolveWaybillTemplate(paramValue, {
									...tplCtx,
									isMulti: true,
									multiType: item,
								})
								for (let i = 0; i < waybillValue; i++) {
									pList.push(tData)
								}
							}
						} else {
							const tData = resolveWaybillTemplate(WayBillInfoVO, {
								...tplCtx,
								isMulti: false,
							})
							for (let i = 0; i < waybillValue; i++) {
								pList.push(tData)
							}
						}
					}

					await that.printCpclList(device, pList)
					return true
				} catch (err) {
					const errMsg = (err && err.message) || err || '蓝牙打印数据写入失败'
					console.log('doPrintTask-errMsg=====>', errMsg)
					showMsg(String(errMsg))
				}
			},

			// 对齐 newPrint.printReceiptTask
			async printReceiptTask(receiptPrinter) {
				const that = this
				uni.showLoading({
					title: '打印中...',
					mask: true,
				})
				try {
					const rows = await that.receiptTask()
					const receiptTpl = resolveReceiptTemplate(rows[0] || {}, {
						parameterO097: that.parameterO097,
						zoneId: that.zoneId,
					})
					const pList = []
					const num = convertNumber(that.printReceiptNum)
					for (let index = 0; index < num; index++) {
						pList.push(receiptTpl)
					}
					await that.printCpclList(receiptPrinter, pList)
				} finally {
					uni.hideLoading()
				}
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
	$dk-color: #ff9407;
	$text-danger: #dd524d;
	$text-success: #4cd964;

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
		color: $dk-color;

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
			color: $dk-color;
			font-size: 26rpx;
			padding: 4rpx 0;
		}
	}

	.alertBox {
		color: #999;
		font-size: 24rpx;
		line-height: 32rpx;
		position: relative;
		padding: 20rpx;

		&_item {
			margin-bottom: 4rpx;
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
				color: $dk-color;
			}

			&__unactive {
				color: #333;
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
		display: flex;
		gap: 12rpx;
		flex-wrap: wrap;
		justify-content: flex-end;
		font-size: 26rpx;
	}

	.unactiveCss {
		color: $text-danger;
	}

	.activeingCss {
		color: $dk-color;
	}

	.activeCss {
		color: $text-success;
	}

	.cPList {
		display: flex;
		gap: 20rpx;
		justify-content: flex-start;
		flex-wrap: wrap;

		&-item {
			padding: 10rpx 20rpx;
			border: solid 1px $dk-color;
			border-radius: 6rpx;
			color: #333;
			font-size: 28rpx;
		}
	}

	.noMoreBox {
		display: flex;
		align-items: center;
		color: #999;
		justify-content: center;
		height: 100rpx;
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
		background: $dk-color;
		color: #fff;

		&[disabled] {
			opacity: 0.6;
		}
	}
</style>
