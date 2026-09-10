<template>
	<view class="page">
		<!-- 画布区（除底部外占满） -->
		<view class="canvasArea">
			<CanvasBoard
				:paper="paper"
				:elements="elements"
				:selected-id="selectedId"
				:zoom="canvasZoom"
				@select="onSelectElement"
				@remove="onRemoveElement"
				@change="onElementChange"
				@settings="onOpenElementSettings"
			/>

			<!-- 右下角（底部操作栏上方）：拖拽 / 缩放 / 清空 / 折叠 -->
			<view
				v-if="!floatOpsCollapsed"
				class="floatOps"
				:style="floatOpsStyle"
				@touchmove.stop.prevent="onFloatOpsTouchMove"
				@touchend="onFloatOpsTouchEnd"
				@touchcancel="onFloatOpsTouchEnd"
			>
				<view
					class="floatOps-btn floatOps-btn--drag"
					@touchstart.stop="onFloatOpsDragStart"
				>
					<image class="floatOps-img" :src="icons.move" mode="aspectFit" />
				</view>
				<view class="floatOps-btn" @click="onZoomOut">
					<image class="floatOps-img" :src="icons.zoomOut" mode="aspectFit" />
				</view>
				<view class="floatOps-zoom" @click="onZoomReset">{{ zoomPercent }}</view>
				<view class="floatOps-btn" @click="onZoomIn">
					<image class="floatOps-img" :src="icons.zoomIn" mode="aspectFit" />
				</view>
				<view class="floatOps-btn" @click="onClearCanvas">
					<image class="floatOps-img" :src="icons.delete" mode="aspectFit" />
				</view>
				<view class="floatOps-btn floatOps-btn--fold" @click="onCollapseFloatOps">
					<image class="floatOps-img" :src="icons.fold" mode="aspectFit" />
				</view>
			</view>
		</view>

		<!-- 底部固定栏 -->
		<BottomDock
			:paper="paper"
			:printing="printLoading"
			:tools-collapsed="floatOpsCollapsed"
			@paper="paperPopupVisible = true"
			@add="onAddElement"
			@open-import="onOpenImportPopup"
			@list="elementListVisible = true"
			@preview="onPreview"
			@command="onViewCommand"
			@print="onOpenPrintPopup"
			@expand-tools="onExpandFloatOps"
		/>

		<PaperSettingsPopup
			:visible="paperPopupVisible"
			:paper="paper"
			@update:visible="paperPopupVisible = $event"
			@change="onPaperChange"
		/>

		<ImportCommandPopup
			:visible="importPopupVisible"
			@update:visible="importPopupVisible = $event"
			@confirm="onImportCommand"
		/>

		<ElementEditorPopup
			:visible="editorPopupVisible"
			:element="selectedElement"
			@update:visible="editorPopupVisible = $event"
			@change="onElementChange"
		/>

		<ElementListPopup
			:visible="elementListVisible"
			:elements="elements"
			:selected-id="selectedId"
			@update:visible="elementListVisible = $event"
			@select="onSelectElement"
			@remove="onRemoveElement"
			@settings="onOpenElementSettingsFromList"
		/>

		<PrintDevicePopup
			:visible="printPopupVisible"
			:module-state="moduleState"
			:search-state="searchState"
			:device-list="deviceList"
			:searching="searching"
			:scanning="scanning"
			:connecting-id="connectingId"
			:printing="printLoading"
			@update:visible="printPopupVisible = $event"
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
			@confirm-print="onConfirmPrint"
		/>

		<PreviewPopup
			:visible="previewVisible"
			:title="previewTitle"
			:ops="previewOps"
			@update:visible="previewVisible = $event"
			@close="previewVisible = false"
		/>

		<CommandPopup
			:visible="commandVisible"
			title="模板指令"
			:command-text="commandText"
			:show-brand-tabs="true"
			:commands-by-brand="commandByBrand"
			@update:visible="commandVisible = $event"
			@close="commandVisible = false"
		/>

		<!-- 图片解析回退 canvas（完全隐藏） -->
		<canvas
			canvas-id="templateImageCanvas"
			id="templateImageCanvas"
			class="templateImageCanvas"
			:width="imageCanvasWidth"
			:height="imageCanvasHeight"
			:style="{
				width: imageCanvasWidth + 'px',
				height: imageCanvasHeight + 'px',
			}"
		></canvas>
	</view>
</template>

<script>
	import CommandPopup from '../print/components/CommandPopup.vue'
	import PreviewPopup from '../print/template-comm/preivew/PreviewPopup.vue'
	import { getBluetoothAdapter } from '../print/ble/index.js'
	import { resolvePrinterBrandInfo } from '../print/ble/config.js'
	import { showMsg, showModal, isNotEmptyArr, getWindowInfoSafe } from '../print/comm/utils.js'

	import CanvasBoard from './components/CanvasBoard.vue'
	import BottomDock from './components/BottomDock.vue'
	import PaperSettingsPopup from './components/PaperSettingsPopup.vue'
	import ElementEditorPopup from './components/ElementEditorPopup.vue'
	import ElementListPopup from './components/ElementListPopup.vue'
	import ImportCommandPopup from './components/ImportCommandPopup.vue'
	import PrintDevicePopup from './components/PrintDevicePopup.vue'

	import { createDefaultPaper, createDefaultElement, TEMPLATE_ICONS } from './utils/elementTypes.js'
	import { cpclToDesign } from './utils/cpclToDesign.js'
	import {
		buildDesignTemplateAsync,
		buildDesignCommandsByBrandAsync,
	} from './utils/templateBuilder.js'

	const ZOOM_MIN = 0.5
	const ZOOM_MAX = 2
	const ZOOM_STEP = 0.25
	const TEMPLATE_IMAGE_CANVAS_ID = 'templateImageCanvas'

	export default {
		name: 'TemplateDesignPage',
		components: {
			CommandPopup,
			PreviewPopup,
			CanvasBoard,
			BottomDock,
			PaperSettingsPopup,
			ElementEditorPopup,
			ElementListPopup,
			ImportCommandPopup,
			PrintDevicePopup,
		},
		data() {
			return {
				paper: createDefaultPaper(),
				elements: [],
				selectedId: '',
				canvasZoom: 1,

				paperPopupVisible: false,
				editorPopupVisible: false,
				elementListVisible: false,
				importPopupVisible: false,
				printPopupVisible: false,

				cusBModuleInstance: null,
				btVersion: 0,
				moduleState: 'notStarted',
				searchState: 'notSearched',
				deviceList: [],
				searching: false,
				scanning: false,
				connectingId: '',
				pendingClosePromise: null,

				previewVisible: false,
				previewTitle: '模板预览',
				previewOps: [],

				commandVisible: false,
				commandText: '',
				commandByBrand: {
					CC3: '',
					HM: '',
				},

				printLoading: false,

				imageCanvasWidth: 80,
				imageCanvasHeight: 80,

				floatOpsLeft: null,
				floatOpsTop: null,
				floatOpsDrag: null,
				floatOpsCollapsed: false,
				icons: TEMPLATE_ICONS,
			}
		},
		computed: {
			selectedElement() {
				const id = this.selectedId
				if (!id) return null
				return (
					this.elements.find(function (item) {
						return item.id === id
					}) || null
				)
			},
			connectedBtDevice() {
				void this.btVersion
				const list =
					(this.cusBModuleInstance && this.cusBModuleInstance._connectedDevicesList) ||
					[]
				return list[0] || null
			},
			designModel() {
				return {
					paper: this.paper,
					elements: this.elements,
				}
			},
			zoomPercent() {
				return Math.round((Number(this.canvasZoom) || 1) * 100) + '%'
			},
			floatOpsStyle() {
				if (this.floatOpsLeft == null || this.floatOpsTop == null) return ''
				return (
					'left:' +
					this.floatOpsLeft +
					'px;top:' +
					this.floatOpsTop +
					'px;right:auto;bottom:auto;'
				)
			},
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
			onPaperChange(next) {
				this.paper = Object.assign({}, next)
			},
			onAddElement(type) {
				const margin = Number(this.paper.marginLeft) || 0.5
				const top = Number(this.paper.marginTop) || 0.5
				const offset = this.elements.length * 3
				const el = createDefaultElement(type, {
					x: margin,
					y: Math.min(top + offset, Math.max(0, (Number(this.paper.heightMm) || 100) - 10)),
				})
				this.elements = this.elements.concat([el])
				this.selectedId = el.id
			},
			onSelectElement(id) {
				this.selectedId = id || ''
			},
			onRemoveElement(id) {
				this.elements = this.elements.filter(function (item) {
					return item.id !== id
				})
				if (this.selectedId === id) {
					this.selectedId = ''
					this.editorPopupVisible = false
				}
			},
			onElementChange(next) {
				if (!next || !next.id) return
				this.elements = this.elements.map(function (item) {
					return item.id === next.id ? next : item
				})
			},
			onOpenElementSettings(id) {
				this.selectedId = id || this.selectedId
				if (!this.selectedId) return
				this.editorPopupVisible = true
			},
			onOpenElementSettingsFromList(id) {
				this.selectedId = id || this.selectedId
				if (!this.selectedId) return
				this.elementListVisible = false
				this.editorPopupVisible = true
			},

			getTouchPoint(e) {
				const t =
					(e.touches && e.touches[0]) ||
					(e.changedTouches && e.changedTouches[0]) ||
					null
				if (!t) return null
				return {
					x: t.clientX != null ? t.clientX : t.pageX,
					y: t.clientY != null ? t.clientY : t.pageY,
				}
			},
			onFloatOpsDragStart(e) {
				const touch = this.getTouchPoint(e)
				if (!touch) return
				const that = this
				const query = uni.createSelectorQuery().in(this)
				query
					.select('.floatOps')
					.boundingClientRect(function (rect) {
						if (!rect) return
						that.floatOpsLeft = rect.left
						that.floatOpsTop = rect.top
						that.floatOpsDrag = {
							startX: touch.x,
							startY: touch.y,
							originLeft: rect.left,
							originTop: rect.top,
						}
					})
					.exec()
			},
			onFloatOpsTouchMove(e) {
				if (!this.floatOpsDrag) return
				const touch = this.getTouchPoint(e)
				if (!touch) return
				const dx = touch.x - this.floatOpsDrag.startX
				const dy = touch.y - this.floatOpsDrag.startY
				let left = this.floatOpsDrag.originLeft + dx
				let top = this.floatOpsDrag.originTop + dy
				try {
					const sys = getWindowInfoSafe()
					const maxL = Math.max(0, (sys.windowWidth || 375) - 200)
					const maxT = Math.max(0, (sys.windowHeight || 667) - 80)
					left = Math.max(8, Math.min(maxL, left))
					top = Math.max(8, Math.min(maxT, top))
				} catch (err) {}
				this.floatOpsLeft = left
				this.floatOpsTop = top
			},
			onFloatOpsTouchEnd() {
				this.floatOpsDrag = null
			},
			onCollapseFloatOps() {
				this.floatOpsDrag = null
				this.floatOpsCollapsed = true
			},
			onExpandFloatOps() {
				this.floatOpsCollapsed = false
			},

			onZoomIn() {
				this.canvasZoom = Math.min(
					ZOOM_MAX,
					Math.round((this.canvasZoom + ZOOM_STEP) * 100) / 100
				)
			},
			onZoomOut() {
				this.canvasZoom = Math.max(
					ZOOM_MIN,
					Math.round((this.canvasZoom - ZOOM_STEP) * 100) / 100
				)
			},
			onZoomReset() {
				this.canvasZoom = 1
			},
			async onClearCanvas() {
				if (!this.elements.length) {
					showMsg('画布已为空')
					return
				}
				try {
					const res = await showModal({
						title: '清空画布',
						content: '确认清空画布上的全部元素？此操作不可恢复。',
						confirmText: '清空',
						confirmColor: '#dd524d',
					})
					if (res && res.confirm) {
						this.elements = []
						this.selectedId = ''
						this.editorPopupVisible = false
						showMsg('已清空', 'success')
					}
				} catch (e) {}
			},

			async onImportCommand(cpcl) {
				const text = String(cpcl || '').trim()
				if (!text) {
					showMsg('请输入蓝牙指令')
					return
				}
				try {
					if (this.elements.length) {
						const res = await showModal({
							title: '导入指令',
							content: '将覆盖当前画布内容，是否继续？',
							confirmText: '导入',
						})
						if (!(res && res.confirm)) return
					}
					const design = cpclToDesign(text)
					this.paper = Object.assign(createDefaultPaper(), design.paper || {})
					this.elements = (design.elements || []).slice()
					this.selectedId = ''
					this.editorPopupVisible = false
					this.importPopupVisible = false
					showMsg(
						'已回显 ' + ((design.elements && design.elements.length) || 0) + ' 个元素',
						'success'
					)
				} catch (err) {
					showMsg((err && err.message) || '导入失败')
				}
			},
			onOpenImportPopup() {
				this.importPopupVisible = true
			},

			resolveConnectedBrand() {
				const btDevice = this.connectedBtDevice
				if (!btDevice) return 'common'
				const deviceName = btDevice.name || btDevice.localName || ''
				const brandInfo = resolvePrinterBrandInfo(deviceName, btDevice.deviceId || '')
				if (brandInfo.brand) return brandInfo.brand
				const bt = this.cusBModuleInstance
				if (
					bt &&
					typeof bt.isGbkPrinter === 'function' &&
					bt.isGbkPrinter(deviceName, btDevice.deviceId || '')
				) {
					return 'CC3'
				}
				return 'HM'
			},

			getImageBuildOptions() {
				const that = this
				return {
					canvasId: TEMPLATE_IMAGE_CANVAS_ID,
					component: this,
					onCanvasSize: function (w, h) {
						that.imageCanvasWidth = Math.max(8, Number(w) || 80)
						that.imageCanvasHeight = Math.max(8, Number(h) || 80)
						return that.$nextTick()
					},
				}
			},

			async onPreview() {
				uni.showLoading({ title: '解析图片...', mask: true })
				try {
					const brand = this.resolveConnectedBrand()
					const built = await buildDesignTemplateAsync(
						this.designModel,
						Object.assign({ brand: brand }, this.getImageBuildOptions())
					)
					if (!built || !built.ops || !built.ops.length) {
						showMsg('预览数据为空')
						return
					}
					this.previewTitle =
						'模板预览 ' + this.paper.widthMm + '×' + this.paper.heightMm + 'mm'
					this.previewOps = built.ops
					this.previewVisible = true
				} catch (err) {
					showMsg((err && err.message) || '预览失败')
				} finally {
					uni.hideLoading()
				}
			},

			async onViewCommand() {
				uni.showLoading({ title: '解析图片...', mask: true })
				try {
					const byBrand = await buildDesignCommandsByBrandAsync(
						this.designModel,
						this.getImageBuildOptions()
					)
					this.commandByBrand = {
						CC3: byBrand.CC3 || '',
						HM: byBrand.HM || '',
					}
					const brand = this.resolveConnectedBrand()
					this.commandText =
						brand === 'HM' ? byBrand.HM : brand === 'CC3' ? byBrand.CC3 : byBrand.CC3
					this.commandVisible = true
				} catch (err) {
					showMsg((err && err.message) || '生成指令失败')
				} finally {
					uni.hideLoading()
				}
			},

			async onOpenPrintPopup() {
				this.printPopupVisible = true
				try {
					await this.initBlueTooth()
				} catch (e) {}
			},

			async onConfirmPrint() {
				const bt = this.cusBModuleInstance
				const list = (bt && bt._connectedDevicesList) || []
				if (!isNotEmptyArr(list)) {
					showMsg('请先连接蓝牙打印机')
					return
				}

				const brand = this.resolveConnectedBrand()
				const printBrand = brand === 'common' ? 'CC3' : brand

				this.printLoading = true
				uni.showLoading({ title: '解析图片...', mask: true })
				try {
					const built = await buildDesignTemplateAsync(
						this.designModel,
						Object.assign({ brand: printBrand }, this.getImageBuildOptions())
					)
					if (!built || !built.cpcl) {
						showMsg('生成打印指令失败')
						return
					}

					const device = list[0]
					const printTaskList = [
						{
							deviceId: device.deviceId,
							serviceId: device.serviceId,
							characteristicId: device.characteristicId,
							name: device.name || device.localName || '',
							localName: device.localName || '',
							writeType: device.writeType || '',
							printDataStr: built.cpcl,
							dataFormat: 'text',
							templateName: '模板试打',
						},
					]

					uni.showLoading({ title: '打印中...', mask: true })
					await bt.print(printTaskList)
					showMsg('打印完成', 'success')
					this.printPopupVisible = false
				} catch (err) {
					showMsg((err && err.message) || '打印失败')
				} finally {
					uni.hideLoading()
					this.printLoading = false
					this.bumpBtVersion()
				}
			},

			/* ========== 蓝牙 ========== */
			bumpBtVersion() {
				this.btVersion += 1
				this.syncDeviceViewFromBt()
			},
			mapDeviceForView(item, connectedIds) {
				if (!item || !item.deviceId) return null
				const deviceId = item.deviceId
				const isConnect =
					!!item.isConnect ||
					(connectedIds && connectedIds.indexOf(deviceId) !== -1)
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
			teardownBlueTooth() {
				const bt = this.cusBModuleInstance
				if (!bt) return
				this.searching = false
				if (this._btStateHandler) {
					bt.off('stateChange', this._btStateHandler)
					this._btStateHandler = null
				}
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
					this._btStateHandler = function () {
						that.bumpBtVersion()
					}
					instance.on('stateChange', this._btStateHandler)
					this.cusBModuleInstance = instance
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
			async openBluetoothAndSearch() {
				try {
					this.searching = true
					const bt = await this.initBlueTooth()
					await bt.searchNearByBlueTooth('finded', 'refresh')
					this.bumpBtVersion()
				} catch (err) {
					showMsg((err && err.message) || '搜索蓝牙设备失败')
				} finally {
					this.searching = !!(
						this.cusBModuleInstance && this.cusBModuleInstance._continuousDiscovering
					)
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
					this.searching = !!(
						this.cusBModuleInstance && this.cusBModuleInstance._continuousDiscovering
					)
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
					const ok = await bt.startContinuousDeviceDiscovery('continue')
					if (!ok) this.searching = false
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
								return (
									deviceId === code ||
									name === code ||
									deviceId.toLowerCase() === code.toLowerCase() ||
									name.indexOf(code) !== -1 ||
									deviceId.indexOf(code) !== -1
								)
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
			onBrandBind() {
				this.bumpBtVersion()
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
				const item =
					(bt._searchDevicesResultList || []).find(function (ele) {
						return ele && ele.deviceId === deviceId
					}) ||
					(bt._connectedDevicesList || []).find(function (ele) {
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
		},
	}
</script>

<style lang="scss" scoped>
	@import '../print/comm/common.scss';

	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #e8e0d4;
		box-sizing: border-box;
		overflow: hidden;
	}

	.canvasArea {
		flex: 1;
		min-height: 0;
		position: relative;
		/* 为底部 dock 留空：约两行工具 + safe area */
		padding-bottom: calc(220rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.floatOps {
		position: absolute;
		right: 20rpx;
		bottom: calc(220rpx + env(safe-area-inset-bottom) + 16rpx);
		top: auto;
		z-index: 30;
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx;
		background: rgba(255, 252, 247, 0.95);
		border: 1rpx solid $pr-border-color;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

		&-btn {
			width: 56rpx;
			height: 56rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f5f2ec;
			border-radius: 12rpx;

			&:active {
				opacity: 0.75;
			}

			&--drag,
			&--fold {
				background: #efe8dc;
			}
		}

		&-img {
			width: 32rpx;
			height: 32rpx;
		}

		&-zoom {
			min-width: 72rpx;
			padding: 0 8rpx;
			height: 56rpx;
			line-height: 56rpx;
			text-align: center;
			font-size: 22rpx;
			font-weight: 600;
			color: #2c2c2c;
		}
	}

	.templateImageCanvas {
		position: fixed;
		left: -9999px;
		top: -9999px;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}
</style>
