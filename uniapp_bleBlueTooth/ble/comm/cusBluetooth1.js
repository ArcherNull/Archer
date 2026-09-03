// 当蓝牙模块通过后，才是蓝牙设备， 一个蓝牙模块对应多个蓝牙设备，并且启动心跳检测每个设备的连接状态
import * as gbk from './cpcl/printUtil-GBK.js';
import { tfmbuffer } from './cpcl/base64gb2312.js';

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

function sleepMs(ms) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(true), ms)
	})
}

// 错误码（含微信隐私协议相关 errno）
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
	'103': '用户拒绝隐私授权',
	'104': '用户未同意隐私协议',
	'112': '未在微信小程序后台声明蓝牙隐私接口，请到「设置-服务内容声明-用户隐私保护指引」勾选蓝牙相关能力（约5分钟生效）',
}

// 是否为后台未声明隐私接口（errno 112），此类错误不应占用重启次数
function isPrivacyScopeUndeclaredError(errOrRes) {
	const errno = errOrRes?.errno
	const msg = errOrRes?.errMsg || errOrRes?.message || ''
	return errno === 112 ||
		String(msg).includes('not declared in the privacy agreement') ||
		String(msg).includes('未在微信小程序后台声明蓝牙隐私接口')
}

function formatBluetoothError(res, fallback = '蓝牙操作失败') {
	const errno = res?.errno
	const errCode = res?.errCode
	if (errno !== undefined && ERROR_CODE[String(errno)]) {
		return ERROR_CODE[String(errno)]
	}
	if (errCode !== undefined && ERROR_CODE[String(errCode)]) {
		return ERROR_CODE[String(errCode)]
	}
	return res?.errMsg || fallback
}

async function tipBluetoothError(errOrMsg) {
	const msg = typeof errOrMsg === 'string' ? errOrMsg : (errOrMsg?.message || '蓝牙操作失败')
	if (isPrivacyScopeUndeclaredError(typeof errOrMsg === 'string' ? { message: errOrMsg } : errOrMsg) ||
		msg.includes('隐私')) {
		await showModal({
			title: '蓝牙不可用',
			content: msg,
			showCancel: false,
			confirmText: '知道了',
		})
		return
	}
	showMsg(msg)
}

// 自定义蓝牙模块类
export class CusBluetoothModuleClass {
	// 区分苹果 / 安卓 / 鸿蒙
	_osName
	// 是否鸿蒙（含 HarmonyOS Next / 卓易通兼容层）
	_isHarmonyOS = false
	// 设置蓝牙最大传输单元
	_mtu = 512
	// 实际协商后的 MTU（失败则回退默认分包）
	_negotiatedMtu = 0

	// 重启蓝牙模块次数
	_restartBlueToothCount = 0
	// 重启蓝牙模块最大次数
	_restartBlueToothMaxCount = 3
	// 是否正在执行重启流程（防连点）
	_isRestartingBlueTooth = false
	// 关闭适配器后再打开的间隔（部分机型需要短暂等待）
	_reopenDelayMs = 500

	// 蓝牙模块适配器状态
	_bluetoothAdapterState = {
		available: false,
		discovering: false,
	}

	// 是否校验蓝牙授权（微信小程序需开启；H5 可关闭）
	_isAuthSettingBluetooth = true
	// 蓝牙模块状态， 未启动 notStarted ;  已启动 started ; 正在启动  starting
	_bluetoothModuleState = 'notStarted'
	// 蓝牙模块搜索蓝牙设备状态， 未搜索 notSearched ;  已搜索 searched ; 正在搜索  searching
	_bluetoothModuleSearchState = 'notSearched'
	// 搜索设备结果列表
	_searchDevicesResultList = []
	// 已经连接蓝牙设备列表
	_connectedDevicesList = []
	// CPCL 打印设备名称前缀，设备名 startsWith 任一前缀即走 CPCL（如 HM-A300L、HM-A300-668B）；可手动追加
	_cpclDeviceNamePrefixes = ['HM-', 'HPRT']
	// GBK 打印设备名称前缀：芝柯 CC3_ / 优博讯 K319
	_gbkDeviceNamePrefixes = ['CC3_', 'K319']
	// 常见打印机可写服务 UUID 关键词（优先匹配，避免选到错误特征值）
	_preferredWriteServiceKeywords = ['FF00', 'FFE0', 'FFF0', '49535343', '18F0']
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
	// 是否输出调试日志
	_debugLogEnabled = false

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

	/** 开启/关闭蓝牙调试日志 */
	setDebugLogEnabled(enabled) {
		this._debugLogEnabled = !!enabled
	}

	/** 当前是否开启调试日志 */
	isDebugLogEnabled() {
		return this._debugLogEnabled
	}

	/** 蓝牙模块调试日志（受 _debugLogEnabled 控制） */
	log(...args) {
		if (!this._debugLogEnabled) return
		console.log('[Bluetooth]', ...args)
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
		const eMsg = formatBluetoothError(res, text)
		this.log('错误提示=====>', eMsg, res)
		showMsg(eMsg)
		const err = new Error(eMsg || text)
		err.errno = res?.errno
		err.errCode = res?.errCode
		reject(err)
	}

	// 启动蓝牙
	async setupBlueTooth({ silent = false } = {}) {
		const that = this
		try {
			if (that._bluetoothModuleState === 'starting') {
				!silent && showMsg('蓝牙模块正在启动中，请耐心等待')
				return null
			}

			!silent && uni.showLoading({
				title: '启动中...'
			})

			that._bluetoothModuleState = 'starting'
			that.emit('stateChange')
			// 微信：先隐私协议，再蓝牙授权，最后打开适配器
			await that.ensurePrivacyAuthorize()
			await that.checkAndRequestPermissions()
			await that.openBluetoothAdapter()
			const aRes = await that.getBluetoothAdapterState()
			that._bluetoothModuleState = 'started'
			that._restartBlueToothCount = 0
			!silent && showMsg('蓝牙启动成功', 'success')
			// 异步蓝牙适配器状态变化
			that.onBluetoothAdapterStateChange()
			that.emit('stateChange')
			return aRes
		} catch (err) {
			that._bluetoothModuleState = 'notStarted'
			that.emit('stateChange')
			!silent && await tipBluetoothError(err?.message || '启动蓝牙失败')
			throw err
		} finally {
			uni.hideLoading()
		}
	}

	// 重新搜索结果（先重启蓝牙模块，再搜索）
	async reSearchNearByBlueTooth() {
		const that = this
		const mFun = async () => {
			that._connectedDevicesList = []
			that._searchDevicesResultList = []
			that._operationDevicesInfo = {}
			try {
				if (that._bluetoothModuleState === 'starting') {
					showMsg('蓝牙模块正在启动中，请耐心等待')
					return
				}
				if (that._isRestartingBlueTooth) {
					showMsg('蓝牙模块正在重启中，请稍候')
					return
				}
				that._isRestartingBlueTooth = true
				uni.showLoading({
					title: '重启中...'
				})
				// 有搜索先停，再关适配器，再重新启动后搜索
				if (that._bluetoothModuleSearchState === 'searching') {
					try {
						await that.stopBluetoothDevicesDiscovery()
					} catch (e) {
						that.log('重新搜索前停止搜索忽略=====>', e)
					}
				}
				await that.safeCloseBluetoothAdapter()
				await sleep(that._reopenDelayMs / 1000)
				await that.setupBlueTooth({
					silent: true
				})
				await that.searchNearByBlueTooth()
			} catch (err) {
				await tipBluetoothError(err?.message || '重新搜索失败')
			} finally {
				that._isRestartingBlueTooth = false
				uni.hideLoading()
			}
		}

		if (that._searchDevicesResultList.length) {
			const res = await showModal({
				title: "温馨提示",
				content: `您确定重新刷新蓝牙搜索结果？`,
			});
			res?.confirm && await mFun()
		} else {
			await mFun()
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
						this.log('接收到信息', res?.devices)
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
					let bool = false
					// #ifdef MP-WEIXIN
					bool = name && deviceId && item.connectable && isNotEmptyArr(item?.advertisServiceUUIDs)
					// #endif
					// #ifndef MP-WEIXIN
					bool = name && deviceId && isNotEmptyArr(item?.advertisServiceUUIDs)
					// #endif
					if (bool) {
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

				this.log('nList========>', nList)
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
				that.log('that._bluetoothModuleState', that._bluetoothModuleState)
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
		const systemInfo = uni.getSystemInfoSync() || {}
		this._osName = systemInfo.osName || systemInfo.platform || ''
		this._isHarmonyOS = this.detectHarmonyOS(systemInfo)
		this.log('bluetooth-os=====>', {
			osName: this._osName,
			platform: systemInfo.platform,
			system: systemInfo.system,
			romName: systemInfo.romName,
			isHarmonyOS: this._isHarmonyOS,
		})
	}

	// 识别鸿蒙（纯血 / 兼容 Android 层 / 卓易通）
	detectHarmonyOS(systemInfo = {}) {
		const osName = String(systemInfo.osName || '').toLowerCase()
		const platform = String(systemInfo.platform || '').toLowerCase()
		const system = String(systemInfo.system || '').toLowerCase()
		const romName = String(systemInfo.romName || '').toLowerCase()
		return osName.includes('harmony') ||
			platform === 'harmony' ||
			platform.includes('harmony') ||
			system.includes('harmony') ||
			romName.includes('harmony')
	}

	// 单次写入分包大小（ATT 有效载荷 = MTU - 3）
	getWriteChunkSize(totalLength = 0) {
		if (this._osName === 'ios') {
			return totalLength || 20
		}
		if (this._isHarmonyOS) {
			// 鸿蒙协议栈缓冲弱：小包更稳；协商成功也不超过 50（过大易整单丢包）
			const mtu = this._negotiatedMtu || 23
			return Math.max(20, Math.min(mtu - 3, 50))
		}
		const mtu = this._negotiatedMtu || this._mtu || 20
		return Math.min(Math.max(mtu - 3, 20), 180)
	}

	// 包间隔（秒）
	getWriteIntervalSec(writeType) {
		if (this._isHarmonyOS) {
			// 旧版 80ms 过慢；带响应 write 已有流控，20ms 足够稳且明显更快
			return writeType === 'writeNoResponse' ? 0.04 : 0.02
		}
		if (writeType === 'writeNoResponse') {
			return 0.005
		}
		return 0.01
	}

	// 鸿蒙优先带响应写（流控可靠）；仅当特征值只支持无响应时才用 writeNoResponse
	resolveWriteType(preferredWriteType) {
		if (this._isHarmonyOS) {
			return preferredWriteType || 'write'
		}
		return preferredWriteType || 'writeNoResponse'
	}

	// 微信小程序：确保用户已同意隐私协议（未声明后台接口时仍会报 errno 112）
	ensurePrivacyAuthorize() {
		return new Promise((resolve, reject) => {
			// #ifdef MP-WEIXIN
			if (typeof uni.getPrivacySetting !== 'function') {
				resolve(true)
				return
			}
			uni.getPrivacySetting({
				success: (res) => {
					this.log('getPrivacySetting=====>', res)
					if (!res?.needAuthorization) {
						resolve(true)
						return
					}
					if (typeof uni.requirePrivacyAuthorize !== 'function') {
						// 交由系统官方弹窗处理
						resolve(true)
						return
					}
					uni.requirePrivacyAuthorize({
						success: () => resolve(true),
						fail: (err) => {
							this.log('requirePrivacyAuthorize-fail=====>', err)
							if (isPrivacyScopeUndeclaredError(err)) {
								reject(new Error(ERROR_CODE['112']))
								return
							}
							reject(new Error(formatBluetoothError(err, '请先同意隐私协议后再使用蓝牙')))
						}
					})
				},
				fail: (err) => {
					this.log('getPrivacySetting-fail=====>', err)
					// 低版本基础库可能无此能力，继续后续流程
					resolve(true)
				}
			})
			// #endif
			// #ifndef MP-WEIXIN
			resolve(true)
			// #endif
		})
	}

	// 蓝牙是否授权
	checkAndRequestPermissions() {
		const that = this
		return new Promise((resolve, reject) => {
			if (!that._isAuthSettingBluetooth) {
				resolve(true)
				return
			}

			// #ifdef MP-WEIXIN
			uni.getSetting({
				success: (res) => {
					that.log('蓝牙是否授权res', res)
					const isPers = res?.authSetting?.['scope.bluetooth']
					if (isPers === true) {
						resolve(true)
						return
					}
					if (isPers === false) {
						showModal({
							title: '是否授权蓝牙连接',
							content: '需要获取您的蓝牙模块，用于连接蓝牙打印机',
						}).then((modalRes) => {
							if (!modalRes?.confirm) {
								reject(new Error('授权失败'))
								return
							}
							uni.openSetting({
								success: (settingRes) => {
									const isPass = settingRes?.authSetting?.['scope.bluetooth'] === true
									if (isPass) {
										showMsg('授权成功', 'success')
										resolve(true)
									} else {
										reject(new Error('授权失败'))
									}
								},
								fail: () => reject(new Error('打开设置失败'))
							})
						}).catch(() => reject(new Error('授权失败')))
						return
					}
					// undefined：尚未询问，主动拉起授权
					uni.authorize({
						scope: 'scope.bluetooth',
						success: () => resolve(true),
						fail: () => {
							showModal({
								title: '是否授权蓝牙连接',
								content: '需要获取您的蓝牙模块，用于连接蓝牙打印机',
							}).then((modalRes) => {
								if (!modalRes?.confirm) {
									reject(new Error('授权失败'))
									return
								}
								uni.openSetting({
									success: (settingRes) => {
										const isPass = settingRes?.authSetting?.['scope.bluetooth'] === true
										if (isPass) {
											showMsg('授权成功', 'success')
											resolve(true)
										} else {
											reject(new Error('授权失败'))
										}
									},
									fail: () => reject(new Error('打开设置失败'))
								})
							}).catch(() => reject(new Error('授权失败')))
						}
					})
				},
				fail: (err) => {
					reject(new Error('蓝牙授权失败,' + (err?.errMsg || String(err))))
				}
			})
			// #endif

			// #ifdef APP-PLUS
			const permissions = [
				'android.permission.BLUETOOTH',
				'android.permission.BLUETOOTH_ADMIN',
				'android.permission.BLUETOOTH_SCAN',
				'android.permission.BLUETOOTH_CONNECT',
				'android.permission.ACCESS_FINE_LOCATION',
			]
			if (typeof uni.requestAndroidPermissions === 'function') {
				uni.requestAndroidPermissions({
					permissions,
					success(res) {
						if (res.all === true) {
							resolve(true)
						} else {
							reject(new Error('蓝牙授权失败'))
						}
					},
					fail: () => reject(new Error('蓝牙授权失败'))
				})
			} else {
				resolve(true)
			}
			// #endif

			// #ifdef H5
			resolve(true)
			// #endif

			// #ifndef MP-WEIXIN || APP-PLUS || H5
			resolve(true)
			// #endif
		})
	}

	// 清空设备相关缓存（不改模块启停状态）
	clearDeviceLists() {
		this._connectedDevicesList = []
		this._searchDevicesResultList = []
		this._operationDevicesInfo = {}
		this._bluetoothModuleSearchState = 'notSearched'
	}

	// 重置蓝牙参数
	resetBTParams() {
		this.clearDeviceLists()
		this._bluetoothModuleState = 'notStarted'
		this._bluetoothAdapterState = {
			available: false,
			discovering: false,
		}
		this._restartBlueToothCount = 0
		this._isRestartingBlueTooth = false
	}

	// 初始化蓝牙模块， 校验蓝牙是否正常
	openBluetoothAdapter() {
		const that = this
		return new Promise((resolve, reject) => {
			// 仅清空设备列表，避免把 starting 状态冲成 notStarted
			that.clearDeviceLists()
			uni.openBluetoothAdapter({
				success: function(res) {
					that.log('openBluetoothAdapter-success=====>', res)
					if (res?.errMsg === 'openBluetoothAdapter:ok') {
						resolve(true)
					} else {
						that._bluetoothModuleState = 'notStarted'
						reject(new Error('蓝牙启动失败'))
					}
				},
				fail: function(res) {
					that.log('openBluetoothAdapter-fail=====>', res)
					const errCode = res?.errCode
					const errMsg = res?.errMsg || ''
					// 部分端上重复 open 会报已打开，视为可用
					if (errCode === 0 || errMsg.includes('already opened') || errMsg.includes('已经打开')) {
						resolve(true)
						return
					}
					that._bluetoothModuleState = 'notStarted'
					if (isPrivacyScopeUndeclaredError(res)) {
						const err = new Error(ERROR_CODE['112'])
						err.errno = 112
						reject(err)
						return
					}
					that.dealFailRes(res, reject, '初始化蓝牙模块失败')
				}
			});
		})
	}

	// 安全关闭蓝牙模块（未启动时也视为成功，避免重启链路中断）
	safeCloseBluetoothAdapter() {
		const that = this
		return new Promise((resolve) => {
			that.saveConnectedDevices()
			uni.closeBluetoothAdapter({
				success: (res) => {
					that.log('closeBluetoothAdapter-success=====>', res)
					that.clearDeviceLists()
					that._bluetoothModuleState = 'notStarted'
					that._bluetoothAdapterState = {
						available: false,
						discovering: false,
					}
					that.emit('stateChange')
					resolve(true)
				},
				fail: (res) => {
					that.log('closeBluetoothAdapter-fail=====>', res)
					// 未初始化时关闭失败可忽略，保证重启流程可继续
					that.clearDeviceLists()
					that._bluetoothModuleState = 'notStarted'
					that.emit('stateChange')
					resolve(false)
				}
			})
		})
	}

	// 重启蓝牙模块：先关闭再完整走 setupBlueTooth
	async restartOpenBluetoothAdapter() {
		const that = this
		let consumedRestartQuota = false
		try {
			if (that._isRestartingBlueTooth) {
				showMsg('蓝牙模块正在重启中，请稍候')
				return
			}

			if (that._bluetoothModuleState === 'starting') {
				showMsg('蓝牙模块正在启动中，请耐心等待...')
				return
			}

			if (that._restartBlueToothCount >= that._restartBlueToothMaxCount) {
				showMsg(`重新启动蓝牙模块已超出最大次数${that._restartBlueToothMaxCount}次`)
				return
			}

			const isStarted = that._bluetoothModuleState === 'started'
			const modalRes = await showModal({
				title: '温馨提示',
				content: isStarted ?
					'蓝牙模块已启动，重新启动将断开已连接设备，是否继续？' :
					'您确定重新启动蓝牙模块？',
			})
			if (!modalRes?.confirm) {
				return
			}

			that._isRestartingBlueTooth = true
			that._restartBlueToothCount++
			consumedRestartQuota = true
			uni.hideLoading()
			uni.showLoading({
				title: '重启中...'
			})

			// 有搜索先停，再关适配器，再短暂等待后完整启动
			if (that._bluetoothModuleSearchState === 'searching') {
				try {
					await that.stopBluetoothDevicesDiscovery()
				} catch (e) {
					this.log('重启前停止搜索忽略=====>', e)
				}
			}

			await that.safeCloseBluetoothAdapter()
			await sleep(that._reopenDelayMs / 1000)
			await that.setupBlueTooth({
				silent: true
			})
			showMsg('蓝牙重启成功', 'success')
			that.emit('stateChange')
		} catch (err) {
			that._bluetoothModuleState = 'notStarted'
			that.emit('stateChange')
			// 配置类错误（未声明隐私接口）不占用重启次数
			if (consumedRestartQuota && isPrivacyScopeUndeclaredError(err)) {
				that._restartBlueToothCount = Math.max(0, that._restartBlueToothCount - 1)
			}
			await tipBluetoothError(err?.message || '重启蓝牙模块失败')
		} finally {
			that._isRestartingBlueTooth = false
			uni.hideLoading()
		}
	}

	// 获取本机蓝牙适配器状态
	getBluetoothAdapterState() {
		const that = this
		return new Promise((resolve, reject) => {
			uni.getBluetoothAdapterState({
				success: (res) => {
					that.log('getBluetoothAdapterState-success=====>', res)
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
					that.log('getBluetoothAdapterState-fail=====>', res)
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
		} else {
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
					that.log('closeBluetoothAdapter-success=====>', res)
					that._restartBlueToothCount = 0
					that._waitBlueToothCount = 0
					that._bluetoothModuleState = 'notStarted'
					that._bluetoothModuleSearchState = 'notSearched'
					that._searchDevicesResultList = []
					that._connectedDevicesList = []
					resolve(res)
				},
				fail: (res) => {
					that.log('closeBluetoothAdapter-fail=====>', res)
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
					that.log('startBluetoothDevicesDiscovery-success=====>', res)
					if (res?.errMsg === 'startBluetoothDevicesDiscovery:ok') {
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
					that.log('startBluetoothDevicesDiscovery-fail=====>', res)
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
					that.log('stopBluetoothDevicesDiscovery-success=====>', res)
					if (res?.errMsg === 'stopBluetoothDevicesDiscovery:ok' && res
						?.isDiscovering === false) {
						that._bluetoothModuleSearchState = 'notSearched'
						resolve(true)
					} else {
						reject(new Error('停止搜索附近可用蓝牙设备失败'))
					}
				},
				fail: (res) => {
					that.log('stopBluetoothDevicesDiscovery-fail=====>', res)
					that._bluetoothModuleSearchState = 'notSearched'
					that.dealFailRes(res, reject, '停止搜索附近可用蓝牙设备失败')
				},
			})
		})
	}

	// 递归获取设备列表
	async recGetBluetoothDevices(count) {
		const that = this
		that.log('递归获取设备列表', count)
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
		const that = this
		return new Promise((resolve, reject) => {
			uni.getBluetoothDevices({
				success: async function(res) {
					that.log('getBluetoothDevices蓝牙列表', res)
					const list = res?.devices || []
					resolve(list)
				},
				fail: function(res) {
					that.log('搜索蓝牙设备失败')
					that.dealFailRes(res, reject, '搜索附近可用蓝牙设备失败')
				}
			})
		})
	}

	// 根据 uuid 获取处于已连接状态的设备。
	getConnectedBluetoothDevices() {
		const that = this
		return new Promise((resolve, reject) => {
			uni.getConnectedBluetoothDevices({
				success: (res) => {
					that.log('getConnectedBluetoothDevices-success=====>', res)
					const devices = res?.devices || []
					resolve(devices)
				},
				fail: (res) => {
					that.log('getConnectedBluetoothDevices-fail=====>', res)
					that.dealFailRes(res, reject, '获取已连接的蓝牙设备失败')
				}
			})
		})
	}

	// 监听寻找到新设备的事件
	onBluetoothDeviceFound(callback) {
		const that = this
		return new Promise((resolve, reject) => {
			uni.onBluetoothDeviceFound(function(devices) {
				that.log('onBluetoothDeviceFound', devices)
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
		this.log('监听蓝牙适配器状态变化事件')
		const that = this
		return new Promise((resolve, reject) => {
			uni.onBluetoothAdapterStateChange(function(res) {
				that.log('监听蓝牙适配器状态变化事件', res)
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
		this.log('新增连接的设备', item)
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
			that._negotiatedMtu = 0
			await that.createBLEConnection(device)
			await that.setBLEMTU(device.deviceId)
			const dealRes = await that.dealServicesAndCharacteristics(device)
			that.log('dealRes=======>', dealRes)
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
						that.log("createBLEConnection-success=====>", res);
						if (res.errMsg == "createBLEConnection:ok") {
							showMsg(`设备${name}连接成功`)
							resolve(true)
						} else {
							reject(new Error('连接蓝牙设备失败'))
						}
					},
					fail: (res) => {
						that.log("createBLEConnection-fail=====>", res);
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
						that.log(res)
						showMsg('断开与低功耗蓝牙设备的连接成功')
						resolve(true)
					},
					fail: (res) => {
						that.log("closeBLEConnection-fail=====>", res);
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
			let preferred = null
			let fallback = null
			for (let i = 0; i < sRes.length; i++) {
				let sId = sRes[i].uuid
				if (!sId) continue
				const characteristics = await that.getBLEDeviceCharacteristics({
					...device,
					serviceId: sId
				})
				const sIdUpper = String(sId).toUpperCase()
				const isPreferredService = that._preferredWriteServiceKeywords.some(k => sIdUpper.includes(k))
				for (let j = 0; j < characteristics.length; j++) {
					const cItem = characteristics[j]
					const props = cItem.properties || {}
					const canWrite = props.write === true || props.writeNoResponse === true
					if (!canWrite) continue
					// 鸿蒙：优先 write（有 ATT 响应，便于流控）；其它平台：优先 writeNoResponse
					let writeType
					if (that._isHarmonyOS) {
						writeType = props.write ? 'write' : 'writeNoResponse'
					} else {
						writeType = props.writeNoResponse ? 'writeNoResponse' : 'write'
					}
					const candidate = {
						characteristicId: cItem.uuid,
						serviceId: sId,
						writeType
					}
					const preferCandidate = (current) => {
						if (!current) return true
						if (that._isHarmonyOS) {
							return candidate.writeType === 'write' && current.writeType !== 'write'
						}
						return candidate.writeType === 'writeNoResponse' && current.writeType !== 'writeNoResponse'
					}
					if (isPreferredService) {
						if (preferCandidate(preferred)) {
							preferred = candidate
						}
					} else if (preferCandidate(fallback)) {
						fallback = candidate
					}
				}
			}
			const selected = preferred || fallback
			if (selected) {
				const nObj = {
					characteristicId: selected.characteristicId,
					serviceId: selected.serviceId,
					writeType: selected.writeType,
					services: [{
						characteristicId: selected.characteristicId,
						serviceId: selected.serviceId,
					}]
				}
				const ndObj = that.changeConnectState(nObj, 'connected')
				const newDevice = Object.assign(device, ndObj)
				return newDevice
			} else {
				throw new Error('蓝牙打印机服务ID和特征值ID获取失败')
			}
		} catch (err) {
			that.log('err======>123123', err)
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
						that.log("getBLEDeviceServices-success=====>", res);
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
						that.log("getBLEDeviceServices-fail=====>", res);
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
						that.log("getBLEDeviceCharacteristics-success=====>", res);
						const cRes = JSON.parse(JSON.stringify(res));
						if (isNotEmptyArr(cRes.characteristics)) {
							resolve(cRes.characteristics)
						} else {
							reject(new Error(`取蓝牙设备【${name}】某个服务【${serviceId}】中所有特征值失败`))
						}
					},
					fail: (res) => {
						that.log("getBLEDeviceCharacteristics-fail=====>", res);
						that.dealFailRes(res, reject,
							`取蓝牙设备【${name}】某个服务【${serviceId}】中所有特征值失败`)
					},
				})
			} else {
				reject(new Error(`取蓝牙设备【${name}】缺失服务ID和设备ID`))
			}
		})
	}

	// 校验打印任务
	validatePrintTask(pTask) {
		const {
			deviceId,
			serviceId,
			characteristicId,
			printDataStr
		} = pTask || {}

		const errLog = []
		if (!printDataStr) {
			errLog.push('打印数据不能为空')
		}

		if (!deviceId) {
			errLog.push('打印设备ID不能为空')
		}

		if (!serviceId) {
			errLog.push('打印设备服务ID不能为空')
		}

		if (!characteristicId) {
			errLog.push('打印设备特征值ID不能为空')
		}

		return errLog
	}

	// 设置 CPCL 打印设备名称前缀列表（完全替换）
	setCpclDeviceNamePrefixes(prefixes) {
		if (Array.isArray(prefixes) && prefixes.length) {
			this._cpclDeviceNamePrefixes = prefixes
		}
	}

	// 追加 CPCL 打印设备名称前缀
	addCpclDeviceNamePrefix(prefix) {
		if (prefix && !this._cpclDeviceNamePrefixes.includes(prefix)) {
			this._cpclDeviceNamePrefixes.push(prefix)
		}
	}

	// 获取打印机设备名称（优先任务中的 name，否则从已连接列表查找）
	getPrinterDeviceName(deviceId, taskName, taskLocalName) {
		if (taskName) return taskName
		if (taskLocalName) return taskLocalName
		const device = this._connectedDevicesList.find(d => d.deviceId === deviceId)
		return device?.name || device?.localName || ''
	}

	// 根据设备名称前缀判断是否为 CPCL 打印设备（startsWith / includes）
	isCpclPrinter(deviceName) {
		if (!deviceName) return false
		const name = String(deviceName).trim().toUpperCase()
		return this._cpclDeviceNamePrefixes.some(prefix => {
			const p = String(prefix).trim().toUpperCase()
			return p && (name.startsWith(p) || name.includes(p))
		})
	}

	// 根据设备名称前缀判断是否为 GBK 打印设备（芝柯 CC3_ / 优博讯 K319）
	isGbkPrinter(deviceName) {
		if (!deviceName) return false
		const name = String(deviceName).trim().toUpperCase()
		return this._gbkDeviceNamePrefixes.some(prefix => {
			const p = String(prefix).trim().toUpperCase()
			return p && (name.startsWith(p) || name.includes(p))
		})
	}

	// CPCL 指令通常以 "! " 开头，可作为设备名缺失时的兜底判断
	isCpclPrintData(printDataStr) {
		if (!printDataStr || typeof printDataStr !== 'string') return false
		return /^\s*!/.test(printDataStr)
	}

	// 打印， printTaskList 打印任务列表
	async print(printTaskList) {
		const that = this
		try {
			if (isNotEmptyArr(printTaskList)) {
				for (let i = 0; i < printTaskList.length; i++) {
					const pTask = printTaskList[i]
					const errLog = that.validatePrintTask(pTask)
					if (errLog.length) {
						throw new Error(`第【${i + 1}】打印任务，${errLog.join(';')}`)
					} else {
						await that.printTaskItem(pTask)
					}
				}
			} else {
				showMsg('打印任务列表不能为空')
			}
		} catch (err) {
			showMsg(err?.message || '打印失败')
		}
	}

	// 打印任务项：芝柯/优博讯优先 GBK，其余（含汉印）走 CPCL
	async printTaskItem(pTask) {
		const that = this
		try {
			const { deviceId, name, localName, printDataStr } = pTask
			const deviceName = that.getPrinterDeviceName(deviceId, name, localName)
			// 1. 优先：芝柯（CC3_）/ 优博讯（K319）→ GBK
			if (that.isGbkPrinter(deviceName)) {
				await that.printGbkTaskItem(pTask)
			} else if (that.isCpclPrinter(deviceName) || that.isCpclPrintData(printDataStr)) {
				// 2. 汉印（_cpclDeviceNamePrefixes）或 CPCL 指令数据 → CPCL
				await that.printCpclTaskItem(pTask)
			} else {
				// 3. 其余情况 → CPCL
				await that.printCpclTaskItem(pTask)
			}
		} catch (err) {
			showMsg(err?.message || '打印任务执行失败')
		}
	}

	// 将 ArrayBuffer 按 MTU 切分为包列表
	splitBufferToChunks(buffer, chunkSize) {
		const chunks = []
		const length = buffer.byteLength
		for (let i = 0; i < length; i += chunkSize) {
			chunks.push(buffer.slice(i, Math.min(i + chunkSize, length)))
		}
		return chunks
	}

	// 统一 BLE 分包发送：顺序 await（鸿蒙禁止并发，否则易整单丢包不打印）
	async sendBufferInChunks(options) {
		const that = this
		const { deviceId, serviceId, characteristicId, buffer, writeType } = options
		const chunkSize = that.getWriteChunkSize(buffer.byteLength)
		const chunks = that.splitBufferToChunks(buffer, chunkSize)
		const finalWriteType = that.resolveWriteType(writeType)
		const writeIntervalMs = Math.round(that.getWriteIntervalSec(finalWriteType) * 1000)

		that.log('sendBufferInChunks=====>', {
			byteLength: buffer.byteLength,
			chunkSize,
			chunks: chunks.length,
			writeType: finalWriteType,
			writeIntervalMs,
			isHarmonyOS: that._isHarmonyOS,
			negotiatedMtu: that._negotiatedMtu,
		})

		for (let i = 0; i < chunks.length; i++) {
			await that.writeBLECharacteristicValue({
				deviceId,
				serviceId,
				characteristicId,
				buffer: chunks[i],
				writeType: finalWriteType
			})
			if (writeIntervalMs > 0 && i < chunks.length - 1) {
				await sleepMs(writeIntervalMs)
			}
		}
	}

	// CPCL 打印（汉印 HM-A300L/HM-A300E/HM-A300-668B 等）
	async printCpclTaskItem(pTask) {
		const that = this
		const { deviceId, serviceId, characteristicId, printDataStr, writeType } = pTask
		const bufferList = tfmbuffer(printDataStr)
		for (let c = 0; c < bufferList.length; c++) {
			await that.sendBufferInChunks({
				deviceId,
				serviceId,
				characteristicId,
				buffer: bufferList[c],
				writeType
			})
		}
	}

	// GBK 打印（芝柯 CC3 / 优博讯 K319 等）
	async printGbkTaskItem(pTask) {
		const that = this
		const { deviceId, serviceId, characteristicId, printDataStr, writeType } = pTask
		const buffer = that.getBuffer(printDataStr)
		await that.sendBufferInChunks({
			deviceId,
			serviceId,
			characteristicId,
			buffer,
			writeType
		})
	}

	// 获取buffer,二进制数据
	getBuffer(templateStr) {
		let buffer = gbk.strToGBKByte(templateStr);
		return buffer
	}

	// 连接成功后设置 MTU（安卓/鸿蒙有效）；失败不阻断打印
	setBLEMTU(deviceId) {
		const that = this
		return new Promise((resolve) => {
			if (!deviceId || that._osName === 'ios') {
				resolve(false)
				return
			}
			// 鸿蒙大 MTU 常名不副实，请求 128 更稳；失败回退默认 23
			const requestMtu = that._isHarmonyOS ? 128 : that._mtu
			uni.setBLEMTU({
				deviceId,
				mtu: requestMtu,
				success(res) {
					that.log('setBLEMTU-success======>', res)
					const mtu = Number(res?.mtu)
					if (!isNaN(mtu) && mtu > 0) {
						that._negotiatedMtu = mtu
					} else if (that._isHarmonyOS) {
						that._negotiatedMtu = 23
					} else {
						that._negotiatedMtu = requestMtu
					}
					resolve(true)
				},
				fail(res) {
					that.log('setBLEMTU-fail======>', res)
					that._negotiatedMtu = that._isHarmonyOS ? 23 : 0
					resolve(false)
				}
			})
		})
	}

	// 向打印机设备写入二进制数据（失败重试，避免静默丢包导致“打一下就停”）
	writeBLECharacteristicValue(options) {
		const that = this
		const maxRetry = that._isHarmonyOS ? 3 : 2
		const doWrite = (writeType, retriedType, retryCount) => new Promise((resolve, reject) => {
			const {
				deviceId,
				serviceId,
				characteristicId,
				buffer
			} = options
			const writeOpts = {
				deviceId,
				serviceId,
				characteristicId,
				value: buffer,
				success(res) {
					resolve(true)
				},
				fail(res) {
					that.log('writeBLECharacteristicValue-fail======>', res, {
						writeType,
						retryCount,
						byteLength: buffer?.byteLength
					})
					// 鸿蒙：仅允许 write → writeNoResponse 单向回退；其它平台可双向切换
					if (!retriedType && writeType) {
						if (that._isHarmonyOS) {
							if (writeType === 'write') {
								doWrite('writeNoResponse', true, retryCount).then(resolve).catch(reject)
								return
							}
						} else {
							const altType = writeType === 'writeNoResponse' ? 'write' : 'writeNoResponse'
							doWrite(altType, true, retryCount).then(resolve).catch(reject)
							return
						}
					}
					// 再按次数重试（鸿蒙常见 10008 拥塞）
					if (retryCount < maxRetry) {
						const delayMs = that._isHarmonyOS ? 80 : 25
						sleepMs(delayMs).then(() => {
							doWrite(writeType, retriedType, retryCount + 1).then(resolve).catch(reject)
						})
						return
					}
					reject(new Error(formatBluetoothError(res, '蓝牙写入失败')))
				}
			}
			if (writeType) {
				writeOpts.writeType = writeType
			}
			uni.writeBLECharacteristicValue(writeOpts)
		})
		return doWrite(options.writeType, false, 0)
	}
}