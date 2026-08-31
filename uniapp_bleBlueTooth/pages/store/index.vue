<template>
	<DKPageContent :loadingType="loadingType">
		<view class="print">
			<!-- 手机蓝牙模块 -->
			<PrintItemBox title="手机蓝牙模块" :isShowBottomLine="true">
				<template #right>
					<view class="btBox" v-if="cusBModuleInstance">
						<view @click="cusBModuleInstance.restartOpenBluetoothAdapter()"
							:class="['btBox-start', cusBModuleInstance._bluetoothModuleState === 'started' ? 'activeCss' : cusBModuleInstance._bluetoothModuleState === 'starting' ? 'activeingCss' : 'unactiveCss']">
							{{ cusBModuleInstance._bluetoothModuleState === 'started' ? '已启动' : cusBModuleInstance._bluetoothModuleState === 'starting' ? '正在启动...' : '未启动' }}
						</view>
						<view @click="cusBModuleInstance.reSearchNearByBlueTooth()"
							:class="['btBox-search', cusBModuleInstance._bluetoothModuleSearchState === 'searched' ? 'activeCss' : cusBModuleInstance._bluetoothModuleSearchState === 'searching' ? 'activeingCss' : 'unactiveCss']">
							{{ cusBModuleInstance._bluetoothModuleSearchState === 'searched' ? '已搜索' : cusBModuleInstance._bluetoothModuleSearchState === 'searching' ? '正在搜索...' : '未搜索' }}
						</view>
						<view @click="openPrintListPopFun()"
							v-if="cusBModuleInstance._bluetoothModuleState === 'started'">
							已搜索{{ cusBModuleInstance._searchDevicesResultList.length }}设备
						</view>
					</view>
					<view class="unactiveCss" v-else @click="initBlueTooth()">
						未启动
					</view>
				</template>

				<view class="cPBox">
					<view class="cPList"
						v-if="cusBModuleInstance && cusBModuleInstance._connectedDevicesList && cusBModuleInstance._connectedDevicesList.length">
						<view class="cPList-item" v-for="(item,index) in cusBModuleInstance._connectedDevicesList"
							:key="index">
							{{ item.name }}
						</view>
					</view>
					<view class="noMoreBox" v-else>
						暂无连接蓝牙打印机
					</view>
				</view>
			</PrintItemBox>

			<!-- 打印标签 -->
			<PrintItemBox title="打印标签" :isShowBottomLine="true">
				<template #right>
					<SelectPrinter :selectedPrinter="connectedPrinter.labelPrinter"
						@selected="selectedBTPrinter(connectedPrinter.labelPrinter, 'label')">
					</SelectPrinter>
				</template>
				<view class="main">
					<LabelBox label="打印份数" :checked="labelPrintChecked"
						@checked="labelPrintChecked = !labelPrintChecked">
						<NumberBox v-model="plValue"></NumberBox>
					</LabelBox>
					<LabelBox label="打印指定页码" :checked="!labelPrintChecked"
						@checked="labelPrintChecked = !labelPrintChecked">
						<view class="pBox" v-if="!labelPrintChecked">
							<NumberBox v-model="plStart"></NumberBox>
							<view>
								至
							</view>
							<NumberBox v-model="plEnd"></NumberBox>
						</view>
					</LabelBox>
				</view>
			</PrintItemBox>

			<!-- 打印运单 -->
			<PrintItemBox title="打印运单" :isShowBottomLine="true">
				<template #right>
					<SelectPrinter :selectedPrinter="connectedPrinter.waybillPrinter"
						@selected="selectedBTPrinter(connectedPrinter.waybillPrinter, 'waybill')">
					</SelectPrinter>
				</template>
				<view class="main">
					<LabelBox label="打印份数">
						<NumberBox v-model="ydValue"></NumberBox>
					</LabelBox>

					<view class="checkbox">
						<checkbox-group @change="multiCheckboxChange" class="checkbox-group">
							<label class="checkbox-item" v-for="item in multiList" :key="item.value">
								<view>
									<checkbox color="#FF9407" style="transform: scale(0.7)" :value="item.name"
										:checked="item.checked" />
								</view>
								<view :class="[item.checked ? 'checkbox-item__active': 'checkbox-item__unactive']">
									{{ item.name }}
								</view>
							</label>
						</checkbox-group>
					</view>
				</view>
			</PrintItemBox>

			<!-- 提示 -->
			<view class="alertText">
				若未打印，请重连蓝牙打印机
			</view>
			<view class="alertText">
				打印机设备处于休眠状态时，第一次连接存在连接不上的情况，需要重新连接
			</view>

			<!-- 搜索得到的蓝牙打印机列表 -->
			<PrintListPop ref="printListPopRef" :openPop="openPrintListPop" :type="selectedPrinterType"
				@connect="connectPrinter" @closePop="openPrintListPop = false">
			</PrintListPop>

			<view class="footerBtn">
				<button type="primary" class="primary-btn" @click="confirmPrinting" :disabled="printLoading">
					{{ printLoading ? '打印中...' : '打印' }}
				</button>
			</view>
		</view>
	</DKPageContent>
</template>

<script setup name="Store">
	import {
		ref,
		getCurrentInstance,
		computed,
		toRaw
	} from 'vue'
	import {
		onLoad,
		onShow,
		onHide
	} from '@dcloudio/uni-app';
	import DKPageContent from '@/components/DKPageContent/index.vue'
	import PrintItemBox from './components/PrintItemBox.vue'
	import SelectPrinter from './components/SelectPrinter.vue'
	import LabelBox from './components/LabelBox.vue'
	import PrintListPop from './components/PrintListPop.vue'
	import NumberBox from './components/NumberBox.vue'

	import {
		CusBluetoothModuleClass,
		showMsg,
		convertNumber,
		isNotEmptyArr
	} from './comm/cusBluetooth.js'
	import {
		template1,
		template2
	} from './comm/template.js'

	const loadingType = ref('normal')
	const labelPrintChecked = ref(true)
	const plValue = ref(1)
	const plStart = ref(0)
	const plEnd = ref(1)
	const ydValue = ref(1)
	const openPrintListPop = ref(false)

	const printLoading = ref(false)
	const selectedPrinterType = ref(undefined)
	const cusBModuleInstance = ref(null)
	const waybillInfo = ref(null)
	const printListPopRef = ref(null)
	const multiList = ref([{
			name: "油卡",
			value: "1",
			checked: false
		},
		{
			name: "发票",
			value: "2",
			checked: false
		},
		{
			name: "理赔",
			value: "3",
			checked: false
		},
		{
			name: "测试",
			value: "4",
			checked: false
		}
	])

	const connectedPrinter = computed(() => {
		const obj = {
			labelPrinter: {},
			waybillPrinter: {}
		}
		if (cusBModuleInstance.value) {
			const cList = cusBModuleInstance.value._connectedDevicesList
			if (isNotEmptyArr(cList)) {
				cList.forEach(ele => {
					const {
						printType
					} = ele
					if (printType === 'label') {
						obj.labelPrinter = ele
					} else if (printType === 'waybill') {
						obj.waybillPrinter = ele
					}
				})
			}
		}
		return obj
	})

	onLoad((options) => {
		initPage(options)
	})

	onShow(() => {
		initBlueTooth()
	})

	onHide(() => {
		// 界面退出时，关闭蓝牙链接
		cusBModuleInstance.value.closeBluetoothAdapter()
		cusBModuleInstance.value = null
	})

	function initPage(options) {
		const code = options?.wayBillCode || '123456'
		if (code) {
			getWaybillInfo(code)
		} else {
			goBack('未获取到运单参数')
		}
	}

	// 获取运单信息
	function getWaybillInfo(wayBillCode) {
		const that = this
		uni.showLoading({
			title: '加载中...'
		})

		setTimeout(() => {
			waybillInfo.value = {}
			uni.hideLoading()
		}, 500)
	}

	function goBack(text) {
		showMsg(text || '参数缺失')
		setTimeout(() => {
			uni.navigateBack({
				delta: 1
			})
		}, 2500)
	}
	// 初始化蓝牙
	async function initBlueTooth() {
		if (!cusBModuleInstance.value) {
			cusBModuleInstance.value = new CusBluetoothModuleClass()
			await cusBModuleInstance.value.setupBlueTooth()
			await cusBModuleInstance.value.connectHistoryPrintDevices()
		}
		return cusBModuleInstance.value
	}

	function multiCheckboxChange(e) {
		const values = e.detail.value;
		multiList.value.forEach((item) => {
			item.checked = values.includes(item.name);
		});
		multiSelectList.value = values;
	}

	// 打印前校验
	function validateForm() {
		const errLog = []
		const {
			labelPrinter,
			waybillPrinter
		} = connectedPrinter.value
		if (labelPrinter.deviceId || waybillPrinter.deviceId) {
			// 打印标签
			if (labelPrinter.deviceId) {
				if (labelPrintChecked.value) {
					const plValueVal = convertNumber(plValue.value)
					if (plValueVal < 1) {
						errLog.push('打印标签打印份数至少为1张')
					}
				} else {
					const plStartVal = convertNumber(plStart.value)
					const plEndVal = convertNumber(plEnd.value)

					if (plEndVal < plStartVal) {
						errLog.push("打印标签结束份数不能小于开始份数");
					}
				}
			}

			// 打印运单校验
			if (waybillPrinter.deviceId) {
				const ydValueVal = convertNumber(ydValue.value)
				if (ydValueVal < 1) {
					errLog.push('打印运单打印份数至少为1张')
				}
			}
		} else {
			errLog.push("请先给打印标签或打印运单绑定打印机")
		}
		return errLog
	}

	// 确认打印
	async function confirmPrinting() {
		const errLog = validateForm()
		if (errLog.length) {
			showMsg(errLog.join(';'))
		} else {
			printLoading.value = true
			await buildPrintQueue()
			printLoading.value = false
		}
	}
	// 建立打印队列
	async function buildPrintQueue() {
		const {
			labelPrinter,
			waybillPrinter
		} = toRaw(connectedPrinter.value)
		const osName = cusBModuleInstance.value._osName
		const printTaskList = []

		console.log('labelPrinter', labelPrinter)
		if (labelPrinter.deviceId) {
			let pCount
			if (labelPrintChecked.value) {
				pCount = plValue.value
			} else {
				pCount = convertNumber(plEnd.value - plStart.value)
			}

			if (pCount > 0) {
				const pData = {
					deviceId: labelPrinter.deviceId,
					serviceId: labelPrinter.serviceId,
					characteristicId: labelPrinter.characteristicId,
					name: labelPrinter.name || labelPrinter.localName || '',
					localName: labelPrinter.localName || '',
					writeType: labelPrinter.writeType || '',
					printDataStr: template2
				}
				for (let i = 0; i < pCount; i++) {
					printTaskList.push(pData)
				}
			}
		}
		
		console.log('waybillPrinter', waybillPrinter)
		if (waybillPrinter.deviceId) {
			let ydCount = ydValue.value
			if (ydCount > 0) {
				const pData = {
					deviceId: waybillPrinter.deviceId,
					serviceId: waybillPrinter.serviceId,
					characteristicId: waybillPrinter.characteristicId,
					name: waybillPrinter.name || waybillPrinter.localName || '',
					localName: waybillPrinter.localName || '',
					writeType: waybillPrinter.writeType || '',
					printDataStr: template1
				}
				for (let i = 0; i < ydCount; i++) {
					printTaskList.push(pData)
				}
			}
		}
		
		console.log('printTaskList=====>', printTaskList)
		await cusBModuleInstance.value.print(printTaskList)
	}

	// 选择标签打印机 / 运单打印机
	async function selectedBTPrinter(item, type) {
		const instance = await initBlueTooth()
		if (instance._bluetoothModuleState === 'started' && !instance._searchDevicesResultList?.length) {
			await instance.searchNearByBlueTooth('finded')
		}
		openPrintListPopFun(type)
	}

	// 打开搜索蓝牙结果列表
	function openPrintListPopFun(type) {
		if (cusBModuleInstance.value?._bluetoothModuleState === 'started') {
			selectedPrinterType.value = type
			printListPopRef.value.cusBModuleInstance = cusBModuleInstance.value
			openPrintListPop.value = true
		} else {
			showMsg('请先启动蓝牙模块适配器')
		}
	}

	// 连接蓝牙打印机
	async function connectPrinter(options) {
		console.log('连接蓝牙打印机', options)
		const {
			item,
			type
		} = options

		console.log('连接蓝牙打印机')

		let newItem = {
			...item,
			printType: type
		}
		// 如果已经连接了
		if (newItem?.isConnect) {
			await cusBModuleInstance.value.closeBlueToothPrinter(newItem)
		} else {
			await cusBModuleInstance.value.connectBlueToothPrinter(newItem)
		}
		openPrintListPop.value = false
	}
</script>

<style lang="scss" scoped>
	.alertText {
		color: #999;
		font-size: 28rpx;
		position: relative;
		padding: 20rpx 40rpx;

		&::after {
			content: '*';
			color: red;
			position: absolute;
			z-index: 1;
			left: 20rpx;
			top: 20rpx;
		}
	}

	.checkbox {
		padding: 20rpx;

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
				color: $uni-color-primary;
			}

			&__unactive {
				color: #333;
			}
		}
	}

	.footerBtn {
		position: fixed;
		z-index: 100;
		left: 0;
		bottom: 0;
		width: 100vw;
		padding: 20rpx;
		background-color: #fff;
		box-shadow: 4rpx 12rpx 10rpx rgba(0, 0, 0, 0.5);
	}

	.pBox {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 20rpx;
	}

	.btBox {
		display: flex;
		gap: 12rpx;

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

	.cPList {
		display: flex;
		gap: 20rpx;
		justify-content: flex-start;

		&-item {
			padding: 10rpx 20rpx;
			border: solid 1px $uni-color-primary;
			border-radius: 6rpx;
		}

		display: flex;
	}

	.noMoreBox {
		height: 120rpx;
		display: flex;
		align-items: center;
		color: #999;
		justify-content: center;
	}
</style>