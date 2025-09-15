// 当蓝牙模块通过后，才是蓝牙设备， 一个蓝牙模块对应多个蓝牙设备，并且启动心跳检测每个设备的连接状态

// 是非空数组
export function isNotEmptyArr(arr) {
	return Array.isArray(arr) && arr.length
}

// 转换为数字
export function convertNumber(str) {
	const val = Number(str)
	return isNaN(val) ? 0 : val
}

// 信息提示
export function showMsg(text, icon = 'none', duration = 2500) {
	uni.showToast({
		title: text,
		icon: icon,
		duration
	})
}

// 模态框展示
export function showModal(props) {
	console.log('模态框展示')
	return new Promise((resolve, reject) => {
		let defaultProps = {
			title: '提示',
			confirmText: '确定',
			cancelText: '取消'
		}

		if (props) {
			if (typeof props === 'string') {
				defaultProps.content = props
			} else {
				defaultProps = Object.assign(defaultProps, props)
			}
		}

		uni.showModal({
			...defaultProps,
			success: typeof defaultProps?.success === 'function' ? defaultProps.success : resolve,
			fail: typeof defaultProps?.fail === 'function' ? defaultProps.fail : reject
		})
	})

}

function sleep(time) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(true)
		}, time * 1000);
	})
}

// 错误码
const ERROR_CODE = {
	'0': '正常',
	'-1': '已连接',
	'10000': '未初始化蓝牙适配器',
	'10001': '当前蓝牙适配器不可用，请检查是否打开蓝牙',
	'10002': '没有找到指定设备',
	'10003': '连接失败',
	'10004': '没有找到指定服务',
	'10005': '没有找到指定特征值',
	'10006': '当前连接已断开',
	'10007': '当前特征值不支持此操作',
	'10008': '其余所有系统上报的异常',
	'10009': 'Android 系统特有，系统版本低于 4.3 不支持 BLE',
	'10010': '已连接',
	'10011': '配对设备需要配对码',
	'10012': '连接超时',
	'10013': '连接 deviceId 为空或者是格式不正确',
}

// 自定义蓝牙模块类
export class CusBluetoothModuleClass {
	// 区分苹果 / 安卓
	_osName

	// 重启蓝牙模块次数
	_restartBlueToothCount = 0
	// 重启蓝牙模块最大次数
	_restartBlueToothMaxCount = 3

	// 等待蓝牙模块启动次数
	_waitBlueToothCount = 0
	// 等待蓝牙模块启动最大次数
	_waitBlueToothMaxCount = 3

	// 蓝牙模块适配器状态
	_bluetoothAdapterState = {
		available: false,
		discovering: false,
	}

	// 用户授权蓝牙是否通过
	_isAuthSettingBluetooth = false
	// 蓝牙模块状态， 未启动 notStarted ;  已启动 started ; 正在启动  starting
	_bluetoothModuleState = 'notStarted'
	// 蓝牙模块搜索蓝牙设备状态， 未搜索 notSearched ;  已搜索 searched ; 正在搜索  searching
	_bluetoothModuleSearchState = 'notSearched'
	// 搜索设备结果列表
	_searchDevicesResultList = []
	// 已经连接蓝牙设备列表
	_connectedDevicesList = []
	// 正在连接的设备信息
	_operationDevicesInfo = {}

	// 打印模式， 同步 sync  异步 async
	_printMode = 'sync'
	// 打印任务列表
	_printTaskList = []
	// 同步打印最大并发执行次数， 也就是说3个打印任务可以同时执行，超出则等待
	_doPrintTaskMaxCount = 3

	// 本地化存储打印机的键值
	_storageKey = 'kps-history-print-devices'
	// 历史连接列表
	_historyPrintDeviceList = []

	constructor() {
		this.init()
	}

	init() {
		this.getSystemInfoSync()
		this.getHistoryPrintDevices()
		this.initEvents()
	}

	// 获取历史打印机
	getHistoryPrintDevices() {
		const pStr = uni.getStorageSync(this._storageKey)
		if (pStr) {
			const pList = JSON.parse(pStr)
			this._historyPrintDeviceList = pList
		}
	}

	// 初始化发布订阅事件
	initEvents() {
		this.eventMap = new Map()
		// 蓝牙模块断开事件以及蓝牙模块搜索蓝牙设备事件
		this.eventMap.set('stateChange', new Set([]))

		this.on = (event, handler) => {
			this.eventMap.get(event).add(handler)
		}

		this.off = (event, handler) => {
			this.eventMap.get(event).delete(handler)
		}

		this.emit = (event) => {
			this.eventMap.get(event).forEach(h => {
				h.call(this, this)
			});
		}
	}

	// 处理错误信息
	dealFailRes(res, reject, text = '初始化蓝牙模块失败') {
		const {
			errCode,
			errMsg
		} = res || {}
		const eMsg = errCode !== undefined ? (ERROR_CODE[errCode] || errMsg) :
			errMsg
		console.log('错误提示=====>', eMsg)
		reject(new Error(eMsg || text))
	}

	// 启动蓝牙
	async setupBlueTooth() {
		try {
			const that = this
			uni.showLoading({
				title: '启动中...'
			})

			that._bluetoothModuleState = 'starting'
			await that.checkAndRequestPermissions()
			await that.openBluetoothAdapter()
			const aRes = await that.getBluetoothAdapterState()
			that._bluetoothModuleState = 'started'
			showMsg('蓝牙启动成功', 'success')
			// 异步蓝牙适配器状态变化
			that.onBluetoothAdapterStateChange()
			return aRes
		} catch (err) {
			uni.hideLoading()
			this._bluetoothModuleState = 'notStarted'
			showMsg(err?.message || '启动蓝牙失败')
		} finally {
			uni.hideLoading()
		}
	}

	// 重新搜索结果
	async reSearchNearByBlueTooth() {
		const that = this
		const mFun = () => {
			that._connectedDevicesList = []
			that._searchDevicesResultList = []
			that._operationDevicesInfo = {}
			that.searchNearByBlueTooth()
		}

		if (that._searchDevicesResultList.length) {
			const res = await showModal({
				title: "温馨提示",
				content: `您确定重新刷新蓝牙搜索结果？`,
			});
			res?.confirm && mFun()
		} else {
			mFun()
		}
	}

	// 搜索附近蓝牙设备, type两种搜索模式， finded 获取已搜索过后的结果， finding 持续搜素
	// findResultType 找到结果类型 ， refresh 表示重新刷新，continue 表示在原有的基础上查找
	async searchNearByBlueTooth(type = "finded", findResultType = 'refresh') {
		const that = this
		const searchTime = 6
		try {
			if (findResultType === 'refresh') {
				that._searchDevicesResultList = []
			}
			if (that._bluetoothModuleState === 'starting') {
				showMsg('蓝牙模块正在启动中，请耐心等待')
				return
			} else if (that._bluetoothModuleState === 'notStarted') {
				await that.setupBlueTooth()
			}
			uni.showLoading({
				title: `搜索中${searchTime}s...`
			})
			const isSearch = await that.startBluetoothDevicesDiscovery()
			if (isSearch) {
				let dList = []
				if (type === 'finded') {
					// 搜索6s
					await sleep(searchTime)
					that.stopBluetoothDevicesDiscovery()
					// 第一种方式直接获取
					dList = await that.recGetBluetoothDevices()
				} else {
					const startTime = new Date().getTime()
					const endTime = startTime + searchTime * 1000
					const callback = (res) => {
						const nTime = new Date().getTime()
						let bool = false
						const list = res?.devices || []
						console.log('接收到信息', res?.devices)
						dList.push(...list)
						if (nTime > endTime) {
							bool = true
						}
						return bool
					}
					// 第二种方式通过监听, 持续查找
					await that.onBluetoothDeviceFound(callback)
				}

				const nList = []
				dList.forEach(item => {
					const name = item?.name || item?.localName
					const deviceId = item?.deviceId
					if (name && deviceId && item.connectable && isNotEmptyArr(item?.advertisServiceUUIDs)) {
						const findItem = that._connectedDevicesList.find(ele => ele.deviceId === item
							.deviceId)

						const obj = {
							...item,
							services: [],
							isConnect: findItem ? true : false,
							name,
							...findItem,
						}
						if (findResultType === 'continue') {
							const findIndex = that._searchDevicesResultList.findIndex(ele => ele
								.deviceId ===
								item
								.deviceId)
							findIndex === -1 && nList.push(obj)
						} else {
							nList.push(obj)
						}
					}
				})

				console.log('nList========>', nList)
				if (findResultType === 'continue') {
					that._searchDevicesResultList.push(...nList)
				} else {
					that._searchDevicesResultList = nList
				}
				return nList
			} else {
				showMsg('未开启搜索蓝牙设备')
			}
		} catch (err) {
			uni.hideLoading()
			showMsg(err?.message || '搜索附近蓝牙设备失败')
		} finally {
			uni.hideLoading()
			that.stopBluetoothDevicesDiscovery()
		}
	}

	// 连接历史设备
	async connectHistoryPrintDevices() {
		const that = this
		try {
			if (isNotEmptyArr(that._historyPrintDeviceList)) {
				that._searchDevicesResultList.push(...that._historyPrintDeviceList)
				console.log('that._bluetoothModuleState', that._bluetoothModuleState)
				if (that._bluetoothModuleState === 'started') {
					const mList = that._historyPrintDeviceList.map(ele => {
						return that.connectBlueToothPrinter(ele)
					})
					await Promise.race(mList)
				} else {
					throw new Error('蓝牙模块未启动，历史打印机连接失败')
				}
			}
		} catch (err) {
			showMsg(err?.message || '历史打印机连接失败')
		}
	}


	// 平台是否支持蓝牙
	getSystemInfoSync() {
		const systemInfo = uni.getSystemInfoSync()
		this._osName = systemInfo?.osName
	}

	// 蓝牙是否授权
	checkAndRequestPermissions() {
		return new Promise((resolve, reject) => {
			if (this._isAuthSettingBluetooth === true) {
				// #ifndef APP-PLUS || H5
				const that = this
				uni.getSetting({
					success: (res) => {
						console.log('蓝牙是否授权res', res)
						const isPers = res.authSetting['scope.bluetooth']
						//非初始化进入该页面,且未授权
						if (isPers != undefined && isPers != true) {
							showModal({
								title: '是否授权蓝牙连接',
								content: '需要获取您的蓝牙模块，用于连接蓝牙打印机',
								success: function(res) {
									if (res.cancel) {
										reject(new Error('授权失败'))
									}
									if (res.confirm) {
										uni.openSetting({
											success: function(res) {
												const isPass = res
													.authSetting[
														"scope.bluetooth"
													] == true
												if (isPass) {
													showMsg('授权成功',
														'success')
													resolve(true)
												} else {
													reject(new Error(
														'授权失败'))
												}
											}
										})
									}
								}
							})
						} else if (isPers == undefined) {
							resolve(true)
						} else {
							//授权后默认加载
							resolve(true)
						}
					},
					fail: (err) => {
						reject(new Error('蓝牙授权失败,' + err?.toString()))
					}
				})
				// #endif
				// #ifdef APP-PLUS || H5
				resolve(true)
				// #endif
			} else {
				resolve(true)
			}
		})
	}

	// 重置蓝牙参数
	resetBTParams() {
		const that = this
		that._connectedDevicesList = []
		that._searchDevicesResultList = []
		that._operationDevicesInfo = {}
		that._bluetoothModuleState = 'notStarted'
		that._bluetoothModuleSearchState = 'notSearched'
		that._restartBlueToothCount = 0
		that._waitBlueToothCount = 0
	}

	// 初始化蓝牙模块， 校验蓝牙是否正常
	openBluetoothAdapter() {
		const that = this
		that._bluetoothModuleState = 'starting'
		return new Promise((resolve, reject) => {
			that.resetBTParams()
			uni.openBluetoothAdapter({
				success: function(res) {
					console.log('openBluetoothAdapter-success=====>', res)
					if (res?.errMsg === 'openBluetoothAdapter:ok') {
						that._bluetoothModuleState = 'started'
						resolve(true)
					} else {
						reject(new Error('蓝牙启动失败'))
						that._bluetoothModuleState = 'notStarted'
					}
				},
				fail: function(res) {
					console.log('openBluetoothAdapter-fail=====>', res)
					that._bluetoothModuleState = 'notStarted'
					that.dealFailRes(res, reject, '初始化蓝牙模块失败')
					// setTimeout(() => {
					// 	that.restartOpenBluetoothAdapter()
					// }, 2000)
				}
			});
		})
	}

	// 重启蓝牙模块
	async restartOpenBluetoothAdapter() {
		try {
			const that = this
			uni.hideLoading()
			// 已经连接了
			if (that._bluetoothModuleState === 'started') {
				const res = await showModal({
					title: "温馨提示",
					content: `蓝牙模块已经启动并连接，您需要重新连接蓝牙模块吗？`,
				});
				if (res?.confirm) {
					console.log('手动终止蓝牙模块连接=======>')
					const cRes = await that.closeBluetoothAdapter()
					cRes && (await that.openBluetoothAdapter())
				}

			} else if (that._bluetoothModuleState === 'starting') {
				if (this._waitBlueToothCount >= this._waitBlueToothMaxCount) {
					const res = await showModal({
						title: "温馨提示",
						content: `蓝牙模块长时间无反应，您是否终止连接？`,
					});
					if (res?.confirm) {
						console.log('手动终止蓝牙模块连接=======>')
						that.closeBluetoothAdapter()
					}
				} else {
					showMsg(`蓝牙模块正在启动中，请耐心等待...`)
				}
				that._waitBlueToothCount++
			} else {
				if (that._restartBlueToothCount < that._restartBlueToothMaxCount) {
					const res = await showModal({
						title: "温馨提示",
						content: `您确定重新启动蓝牙模块？`,
					});
					if (res?.confirm) {
						that._restartBlueToothCount++
						await that.openBluetoothAdapter();
					}
					if (res?.cancel) {
						that._restartBlueToothCount = that._restartBlueToothMaxCount
					}

				} else {
					showMsg(`重新启动蓝牙模块已超出最大次数${that._restartBlueToothMaxCount}次`)
				}
			}

		} catch (err) {
			showMsg(err?.message || '重启蓝牙模块失败')
		}
	}

	// 获取本机蓝牙适配器状态
	getBluetoothAdapterState() {
		const that = this
		return new Promise((resolve, reject) => {
			uni.getBluetoothAdapterState({
				success: (res) => {
					console.log('getBluetoothAdapterState-success=====>', res)
					const available = res?.available
					const discovering = res?.discovering
					if (res?.errMsg === 'getBluetoothAdapterState:ok' && available ===
						true) {
						if (res?.discovering) {
							that.stopBluetoothDevicesDiscovery()
						}

						that._bluetoothAdapterState.available = available
						that._bluetoothAdapterState.discovering = discovering
						resolve({
							available,
							discovering
						})
					} else {
						reject(new Error('蓝牙适配器不可用，请检查蓝牙模块是否打开，蓝牙权限是否打开'))
						that._bluetoothModuleState = 'notStarted'
					}
				},
				fail: (res) => {
					console.log('getBluetoothAdapterState-fail=====>', res)
					that._bluetoothModuleState = 'notStarted'
					that.dealFailRes(res, reject, '蓝牙适配器不可用')
				},
			})
		})
	}

	// 保存已连接的蓝牙打印机
	saveConnectedDevices() {
		if (isNotEmptyArr(this._connectedDevicesList)) {
			const cNList = this._connectedDevicesList.map(ele => {
				ele.isConnect = false
				return ele
			})
			const cListJson = JSON.stringify(cNList)
			uni.setStorageSync(this._storageKey, cListJson)
		}else{
			uni.setStorageSync(this._storageKey, "")
		}
	}

	// 关闭蓝牙模块
	closeBluetoothAdapter() {
		// uni.closeBluetoothAdapter(OBJECT)
		const that = this
		return new Promise((resolve, reject) => {
			// 保存已连接的蓝牙打印机
			that.saveConnectedDevices()
			uni.closeBluetoothAdapter({
				success: (res) => {
					console.log('closeBluetoothAdapter-success=====>', res)
					that._restartBlueToothCount = 0
					that._waitBlueToothCount = 0
					that._bluetoothModuleState = 'notStarted'
					that._bluetoothModuleSearchState = 'notSearched'
					that._searchDevicesResultList = []
					that._connectedDevicesList = []
					resolve(res)
				},
				fail: (res) => {
					console.log('closeBluetoothAdapter-fail=====>', res)
					that.dealFailRes(res, reject, '关闭蓝牙模块失败')
				}
			})
		})
	}

	// 搜索附近可用蓝牙设备
	startBluetoothDevicesDiscovery() {
		const that = this
		return new Promise((resolve, reject) => {
			that._bluetoothModuleSearchState = 'searching'
			uni.startBluetoothDevicesDiscovery({
				allowDuplicatesKey: false,
				interval: 0,
				powerLevel: "high",
				success: function(res) {
					console.log('startBluetoothDevicesDiscovery-success=====>', res)
					if (res?.errMsg === 'startBluetoothDevicesDiscovery:ok' && res
						?.isDiscovering === true) {
						resolve(true)
					} else {
						reject(new Error('搜索附近蓝牙设备失败，请检查蓝牙模块是否开启检测蓝牙设备功能'))
						that._bluetoothModuleSearchState = 'notStarted'
						that.stopBluetoothDevicesDiscovery()
					}
				},
				fail: (res) => {
					that._bluetoothModuleSearchState = 'notSearched'
					that.stopBluetoothDevicesDiscovery()
					console.log('startBluetoothDevicesDiscovery-fail=====>', res)
					that.dealFailRes(res, reject, '搜索附近可用蓝牙设备失败')
				}
			})
		})
	}

	// 停止搜索附近可用蓝牙设备
	stopBluetoothDevicesDiscovery() {
		const that = this
		return new Promise((resolve, reject) => {
			uni.hideLoading()
			uni.stopBluetoothDevicesDiscovery({
				success: (res) => {
					console.log('stopBluetoothDevicesDiscovery-success=====>', res)
					if (res?.errMsg === 'stopBluetoothDevicesDiscovery:ok' && res
						?.isDiscovering === false) {
						that._bluetoothModuleSearchState = 'notSearched'
						resolve(true)
					} else {
						reject(new Error('停止搜索附近可用蓝牙设备失败'))
					}
				},
				fail: (res) => {
					console.log('stopBluetoothDevicesDiscovery-fail=====>', res)
					that._bluetoothModuleSearchState = 'notSearched'
					that.dealFailRes(res, reject, '停止搜索附近可用蓝牙设备失败')
				},
			})
		})
	}

	// 递归获取设备列表
	async recGetBluetoothDevices(count) {
		console.log('递归获取设备列表', count)
		const that = this
		const maxCount = 2
		let cCount = count || 0

		if (cCount < maxCount) {
			cCount++
			const list = await that.getBluetoothDevices(cCount)
			if (isNotEmptyArr(list)) {
				return list
			} else {
				return await that.recGetBluetoothDevices(cCount)
			}
		} else {
			return []
		}
	}

	// 获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备。在停止搜索后获取
	getBluetoothDevices() {
		return new Promise((resolve, reject) => {
			uni.getBluetoothDevices({
				success: async function(res) {
					console.log('getBluetoothDevices蓝牙列表', res)
					const list = res?.devices || []
					resolve(list)
				},
				fail: function(res) {
					console.log("搜索蓝牙设备失败")
					that.dealFailRes(res, reject, '搜索附近可用蓝牙设备失败')
				}
			})
		})
	}

	// 根据 uuid 获取处于已连接状态的设备。
	getConnectedBluetoothDevices() {
		// uni.getConnectedBluetoothDevices(OBJECT)
		return new Promise((resolve, reject) => {
			uni.getConnectedBluetoothDevices({
				success: (res) => {
					console.log('getConnectedBluetoothDevices-success=====>', res)
					const devices = res?.devices || []
					resolve(devices)
				},
				fail: (res) => {
					console.log('getConnectedBluetoothDevices-fail=====>', res)
					that.dealFailRes(res, reject, '获取已连接的蓝牙设备失败')
				}
			})
		})
	}

	// 监听寻找到新设备的事件
	onBluetoothDeviceFound(callback) {
		return new Promise((resolve, reject) => {
			uni.onBluetoothDeviceFound(function(devices) {
				console.log('onBluetoothDeviceFound', devices)
				if (typeof callback === 'function') {
					const data = JSON.parse(JSON.stringify(devices));
					const res = callback(data)
					res && resolve(true)
				} else {
					resolve(true)
				}
			})
		})
	}

	// 监听蓝牙适配器状态变化事件
	onBluetoothAdapterStateChange() {
		console.log('监听蓝牙适配器状态变化事件')
		const that = this
		return new Promise((resolve, reject) => {
			uni.onBluetoothAdapterStateChange(function(res) {
				console.log('监听蓝牙适配器状态变化事件', res)
				const {
					available,
					discovering
				} = res || {}
				if (!available) {
					that.resetBTParams()
					showMsg('蓝牙模块已断开，请重新开启蓝牙')
				}
				that.emit('stateChange')
			})
		})
	}

	// 新增/减去连接的设备
	async operationConnectDevice(item) {
		console.log('新增连接的设备', item)
		if (item?.serviceId && item?.characteristicId) {
			const findInd = this._searchDevicesResultList.findIndex(ele => ele.deviceId === item.deviceId)
			if (findInd !== -1) {
				this._searchDevicesResultList.splice(findInd, 1, item)
				const hasInd = this._connectedDevicesList.findIndex(ele => ele.deviceId === item.deviceId)
				// 如果在已连接列表里存在，则添加
				if (hasInd === -1) {
					this._connectedDevicesList.push(item)
				} else {
					this._connectedDevicesList.splice(hasInd, 1)
				}
			} else {
				showMsg('未在搜索结果列表中找到该设备信息')
			}
		} else {
			showMsg('服务ID或特征ID缺失，请重新连接蓝牙打印机')
		}
	}

	// 校验蓝牙设备
	validateBluetoothDevices(options) {
		const deviceId = options?.deviceId
		if (deviceId) {
			this._operationDevicesInfo = options
			return options
		} else {
			throw new Error('当前设备无设备ID')
		}
	}

	// 更改连接设备状态
	changeConnectState(device = {}, type) {
		const typeList = ['connecting', 'notConnected', 'connected']
		if (typeList.includes(type)) {
			device.connectState = type
			device.isConnect = type === 'connected'
		}
		return device
	}

	// 连接蓝牙打印机
	async connectBlueToothPrinter(options) {
		const that = this
		try {
			const device = that.validateBluetoothDevices(options)
			uni.showLoading({
				title: '连接中...'
			})
			that.changeConnectState(device, 'connecting')
			await that.createBLEConnection(device)
			const dealRes = await that.dealServicesAndCharacteristics(device)
			console.log('dealRes=======>', dealRes)
			that.operationConnectDevice(dealRes)
			return dealRes
		} catch (err) {
			uni.hideLoading()
			that.changeConnectState(that._operationDevicesInfo, 'notConnected')
			showMsg(err?.message || '连接蓝牙打印机失败')
		} finally {
			uni.hideLoading()
		}
	}

	// 连接低功耗蓝牙设备
	createBLEConnection(device) {
		const that = this
		return new Promise((resolve, reject) => {
			const {
				deviceId,
				name
			} = device || {}
			if (deviceId) {
				uni.createBLEConnection({
					deviceId,
					success: (res) => {
						console.log("createBLEConnection-success=====>", res);
						if (res.errMsg == "createBLEConnection:ok") {
							showMsg(`设备${name}连接成功`)
							resolve(true)
						} else {
							reject(new Error('连接蓝牙设备失败'))
						}
					},
					fail: (res) => {
						console.log("createBLEConnection-fail=====>", res);
						that.dealFailRes(res, reject, '初始化蓝牙模块失败')
					},
				})
			} else {
				reject(new Error('设备ID参数缺失'))
			}
		})
	}

	// 断开设备
	async closeBlueToothPrinter(options) {
		const that = this
		try {
			const device = that.validateBluetoothDevices(options)
			uni.showLoading({
				title: '断开中...'
			})
			that.changeConnectState(device, 'connecting')
			await that.closeBLEConnection(device)
			that.operationConnectDevice(device)
		} catch (err) {
			uni.hideLoading()
			that.changeConnectState(device, 'connected')
			showMsg(err?.message || '断开蓝牙打印机失败')
		} finally {
			uni.hideLoading()
		}
	}

	// 断开与低功耗蓝牙设备的连接
	closeBLEConnection(device) {
		const that = this
		return new Promise((resolve, reject) => {
			const {
				deviceId
			} = device || {}
			if (deviceId) {
				uni.closeBLEConnection({
					deviceId,
					success: (res) => {
						console.log(res)
						showMsg('断开与低功耗蓝牙设备的连接成功')
						resolve(true)
					},
					fail: (res) => {
						console.log("closeBLEConnection-fail=====>", res);
						that.dealFailRes(res, reject, '断开与低功耗蓝牙设备的连接失败')
					},
				})
			} else {
				reject(new Error('设备ID参数缺失'))
			}
		})
	}

	// 处理服务以及获取设备特征值
	async dealServicesAndCharacteristics(device = {}) {
		const that = this
		try {
			const sRes = await that.getBLEDeviceServices(device)
			let characteristicId
			let serviceId
			for (let i = 0; i < sRes.length; i++) {
				let sId = sRes[i].uuid;
				if (sId) {
					const characteristics = await that.getBLEDeviceCharacteristics({
						...device,
						serviceId: sId
					})
					for (let j = 0; j < characteristics.length; j++) {
						const cItem = characteristics[j]
						if (cItem.properties.write == true) {
							const cUuid = cItem.uuid
							characteristicId = cUuid
							serviceId = sId

						}
					}
				}
			}
			if (characteristicId && serviceId) {
				const nObj = {
					characteristicId,
					serviceId,
					services: [{
						characteristicId,
						serviceId,
					}]
				}
				const ndObj = that.changeConnectState(nObj, 'connected')
				const newDevice = Object.assign(device, ndObj)
				return newDevice
			} else {
				throw new Error('蓝牙打印机服务ID和特征值ID获取失败')
			}
		} catch (err) {
			console.log('err======>123123', err)
			throw new Error(err?.message || '处理蓝牙打印机服务以及获取设备特征值失败')
		}
	}

	// 获取蓝牙设备所有服务(service)。
	getBLEDeviceServices(device) {
		const that = this
		return new Promise((resolve, reject) => {
			const {
				deviceId
			} = device || {}
			if (deviceId) {
				uni.getBLEDeviceServices({
					deviceId,
					success: (res) => {
						console.log("getBLEDeviceServices-success=====>", res);
						if (res?.errMsg === 'getBLEDeviceServices:ok') {
							if (isNotEmptyArr(res.services)) {
								resolve(res.services)
							} else {
								reject(new Error('获取蓝牙服务失败！请退出蓝牙重新连接'))
							}
						} else {
							reject(new Error('获取蓝牙服务失败！请退出蓝牙重新连接'))
						}
					},
					fail: (res) => {
						console.log("getBLEDeviceServices-fail=====>", res);
						that.dealFailRes(res, reject, '初始化蓝牙模块失败')
					},
				})
			} else {
				reject(new Error('设备ID参数缺失'))
			}
		})
	}

	// 获取蓝牙设备某个服务中所有特征值(characteristic)。
	getBLEDeviceCharacteristics(device) {
		const that = this
		return new Promise((resolve, reject) => {
			const {
				serviceId,
				deviceId,
				name
			} = device || {}
			if (serviceId && deviceId) {
				uni.getBLEDeviceCharacteristics({
					deviceId,
					serviceId,
					success(res) {
						console.log("getBLEDeviceCharacteristics-success=====>", res);
						const cRes = JSON.parse(JSON.stringify(res));
						if (isNotEmptyArr(cRes.characteristics)) {
							resolve(cRes.characteristics)
						} else {
							reject(new Error(`取蓝牙设备【${name}】某个服务【${serviceId}】中所有特征值失败`))
						}
					},
					fail: (res) => {
						console.log("getBLEDeviceCharacteristics-fail=====>", res);
						that.dealFailRes(res, reject,
							`取蓝牙设备【${name}】某个服务【${serviceId}】中所有特征值失败`)
					},
				})
			} else {
				reject(new Error(`取蓝牙设备【${name}】缺失服务ID和设备ID`))
			}
		})
	}
}