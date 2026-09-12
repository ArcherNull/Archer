/**
 * @file classicBlueTooth.js
 * Android App 经典蓝牙（SPP / RFCOMM）适配器
 * 对外 API 与 BleBlueTooth 对齐，页面无需感知底层差异
 * 微信小程序仍走 BLE；本类仅用于 APP-PLUS Android
 */
import { BleBlueTooth } from './bleBlueTooth.js'
import {
	BLUETOOTH_MODULE_SEARCH_STATE,
	CPCL_DEVICE_NAME_PREFIXES,
	GBK_DEVICE_NAME_PREFIXES,
	formatBluetoothError,
} from './config.js'
import {
	convertNumber,
	showMsg,
	showModal,
	sleep,
} from '../comm/utils.js'

/** 标准串口服务 UUID（打印机 SPP） */
export const CLASSIC_SPP_UUID = '00001101-0000-1000-8000-00805F9B34FB'
/** 占位服务 / 特征值，满足 validatePrintTask 与页面连接态展示 */
export const CLASSIC_SPP_SERVICE_ID = CLASSIC_SPP_UUID
export const CLASSIC_SPP_CHARACTERISTIC_ID = 'RFCOMM'
/** BluetoothClass.Device.Major.IMAGING（含打印机） */
const MAJOR_IMAGING = 1536

/**
 * 经典蓝牙打印机适配器（Android SPP）
 * 继承 BleBlueTooth：复用打印队列、进度、历史、配置；覆写连接 / 搜索 / 写入
 */
export class ClassicBlueTooth extends BleBlueTooth {
	constructor() {
		super()
		/** @type {'classic'} */
		this._btMode = 'classic'
		/** Android BluetoothAdapter */
		this._btAdapter = null
		/** Activity */
		this._mainActivity = null
		/** 搜索广播接收器 */
		this._discoveryReceiver = null
		/** deviceId(MAC) → { socket, outputStream } */
		this._socketMap = new Map()
		/** 搜索期间原始设备（MAC 去重） */
		this._discoveredRawMap = new Map()
		/** 是否已注册适配器状态广播 */
		this._adapterStateListening = false
	}

	getBluetoothMode() {
		return 'classic'
	}

	getPlatformDisplayName() {
		const base = super.getPlatformDisplayName()
		return base === '安卓' ? '安卓(经典蓝牙)' : base
	}

	getPlatformDefaultConfig() {
		const base = super.getPlatformDefaultConfig()
		// 经典蓝牙无 ATT MTU，用较大分包 + 较短间隔提高吞吐
		return {
			...base,
			useOptimalTransfer: false,
			mtu: 512,
			mtuStep: 64,
			packetIntervalMs: 20,
			retryIntervalMs: 50,
			maxPacketRetry: 2,
		}
	}

	/** 单包大小：经典蓝牙按配置 mtu，默认 512 */
	getWriteChunkSize(totalLength = 0) {
		const cfgMtu = convertNumber(this.getPrintConfig().mtu) || this._mtu || 512
		return Math.min(Math.max(cfgMtu, 64), 1024)
	}

	ensureNativeReady() {
		// #ifdef APP-PLUS
		if (typeof plus === 'undefined' || !plus.android) {
			throw new Error('经典蓝牙仅支持 App 端 Android')
		}
		if (this._btAdapter) return true
		this._mainActivity = plus.android.runtimeMainActivity()
		const BluetoothAdapter = plus.android.importClass('android.bluetooth.BluetoothAdapter')
		this._btAdapter = BluetoothAdapter.getDefaultAdapter()
		if (!this._btAdapter) {
			throw new Error('当前设备不支持蓝牙')
		}
		return true
		// #endif
		// #ifndef APP-PLUS
		throw new Error('经典蓝牙仅支持 App 端 Android')
		// #endif
	}

	checkAndRequestPermissions() {
		const that = this
		return new Promise((resolve, reject) => {
			// #ifdef APP-PLUS
			try {
				that.ensureNativeReady()
			} catch (e) {
				reject(e)
				return
			}
			const permissions = [
				'android.permission.ACCESS_FINE_LOCATION',
				'android.permission.ACCESS_COARSE_LOCATION',
				'android.permission.BLUETOOTH_SCAN',
				'android.permission.BLUETOOTH_CONNECT',
			]
			plus.android.requestPermissions(
				permissions,
				(result) => {
					const denied = (result && result.deniedAlways) || []
					const deniedPresent = (result && result.deniedPresent) || []
					if ((denied && denied.length) || (deniedPresent && deniedPresent.length)) {
						showModal({
							title: '需要蓝牙权限',
							content: '请在系统设置中允许蓝牙与定位权限，用于搜索并连接经典蓝牙打印机',
						}).then((modalRes) => {
							if (modalRes && modalRes.confirm) {
								reject(new Error('蓝牙授权失败，请在设置中开启权限后重试'))
							} else {
								reject(new Error('蓝牙授权失败'))
							}
						}).catch(() => reject(new Error('蓝牙授权失败')))
						return
					}
					resolve(true)
				},
				() => reject(new Error('蓝牙授权失败'))
			)
			// #endif
			// #ifndef APP-PLUS
			resolve(true)
			// #endif
		})
	}

	/** 请求系统打开蓝牙（经典蓝牙） */
	async ensureBluetoothEnabled() {
		this.ensureNativeReady()
		if (this._btAdapter.isEnabled()) {
			return true
		}
		const modalRes = await showModal({
			title: '提示',
			content: '蓝牙未开启，是否打开蓝牙？',
		})
		if (!modalRes || !modalRes.confirm) {
			throw new Error('请先打开手机蓝牙')
		}
		const ok = this._btAdapter.enable()
		if (!ok) {
			throw new Error('打开蓝牙失败，请手动开启')
		}
		// enable 异步，短暂等待
		for (let i = 0; i < 20; i++) {
			await sleep(0.25)
			if (this._btAdapter.isEnabled()) {
				return true
			}
		}
		if (!this._btAdapter.isEnabled()) {
			throw new Error('打开蓝牙超时，请手动开启后重试')
		}
		return true
	}

	openBluetoothAdapter() {
		const that = this
		return new Promise(async (resolve, reject) => {
			try {
				that.clearDeviceLists()
				that.ensureNativeReady()
				await that.ensureBluetoothEnabled()
				that._bluetoothAdapterState.available = true
				that._bluetoothAdapterState.discovering = false
				resolve(true)
			} catch (err) {
				that._bluetoothModuleState = 'notStarted'
				reject(err instanceof Error ? err : new Error(String(err)))
			}
		})
	}

	getBluetoothAdapterState() {
		const that = this
		return new Promise((resolve, reject) => {
			try {
				that.ensureNativeReady()
				const available = !!that._btAdapter.isEnabled()
				const discovering = !!that._btAdapter.isDiscovering()
				that._bluetoothAdapterState.available = available
				that._bluetoothAdapterState.discovering = discovering
				if (!available) {
					that._bluetoothModuleState = 'notStarted'
					reject(new Error('蓝牙适配器不可用，请检查是否打开蓝牙'))
					return
				}
				if (discovering) {
					that.stopBluetoothDevicesDiscovery().catch(() => {})
				}
				resolve({ available, discovering })
			} catch (err) {
				that._bluetoothModuleState = 'notStarted'
				reject(err instanceof Error ? err : new Error('蓝牙适配器不可用'))
			}
		})
	}

	onBluetoothAdapterStateChange() {
		const that = this
		// #ifdef APP-PLUS
		if (that._adapterStateListening) {
			return Promise.resolve(true)
		}
		try {
			that.ensureNativeReady()
			const IntentFilter = plus.android.importClass('android.content.IntentFilter')
			const BluetoothAdapter = plus.android.importClass('android.bluetooth.BluetoothAdapter')
			const filter = new IntentFilter()
			filter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED)
			const receiver = plus.android.implements(
				'io.dcloud.android.content.BroadcastReceiver',
				{
					onReceive(context, intent) {
						try {
							plus.android.importClass(intent)
							const state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, -1)
							if (state === BluetoothAdapter.STATE_OFF) {
								that._closeAllSocketsSilent()
								that.resetBTParams()
								showMsg('蓝牙模块已断开，请重新开启蓝牙')
								that.emit('stateChange')
							} else if (state === BluetoothAdapter.STATE_ON) {
								that._bluetoothAdapterState.available = true
								that.emit('stateChange')
							}
						} catch (e) {
							that.log('classic adapter state change fail', e)
						}
					},
				}
			)
			that._mainActivity.registerReceiver(receiver, filter)
			that._adapterStateListening = true
			that._adapterStateReceiver = receiver
		} catch (e) {
			that.log('onBluetoothAdapterStateChange classic fail', e)
		}
		// #endif
		return Promise.resolve(true)
	}

	safeCloseBluetoothAdapter() {
		const that = this
		return new Promise(async (resolve) => {
			try {
				that.saveConnectedDevices()
				await that.stopBluetoothDevicesDiscovery().catch(() => {})
				that._closeAllSocketsSilent()
				that.clearDeviceLists()
				that._bluetoothModuleState = 'notStarted'
				that._bluetoothAdapterState = {
					available: false,
					discovering: false,
				}
				that.emit('stateChange')
				resolve(true)
			} catch (e) {
				that.clearDeviceLists()
				that._bluetoothModuleState = 'notStarted'
				that.emit('stateChange')
				resolve(false)
			}
		})
	}

	closeBluetoothAdapter() {
		const that = this
		return new Promise(async (resolve, reject) => {
			try {
				await that.safeCloseBluetoothAdapter()
				that._restartBlueToothCount = 0
				resolve(true)
			} catch (err) {
				that.dealFailRes(err, reject, '关闭蓝牙模块失败')
			}
		})
	}

	/**
	 * 经典蓝牙设备过滤：名称前缀 / Imaging 大类 / 已配对打印机
	 */
	filterPrint(list = [], excludeDeviceIds = []) {
		const printList = []
		const exclude = new Set((excludeDeviceIds || []).map((id) => String(id)))
		const prefixes = CPCL_DEVICE_NAME_PREFIXES.concat(GBK_DEVICE_NAME_PREFIXES)
		for (let i = 0; i < list.length; i++) {
			const item = list[i]
			if (!item || exclude.has(String(item.deviceId))) continue
			const name = String(item.name || item.localName || '').trim()
			const nameUpper = name.toUpperCase()
			const matchName = prefixes.some((prefix) => {
				const p = String(prefix).trim().toUpperCase()
				return p && (nameUpper.startsWith(p) || nameUpper.includes(p))
			})
			const majorOk = Number(item.majorClass) === MAJOR_IMAGING
			// 已配对设备：仍需名称前缀或 Imaging 大类，避免耳机等干扰
			if (matchName || majorOk) {
				printList.push({
					...item,
					address: item.address || item.deviceId || '',
				})
			}
		}
		return printList
	}

	_normalizeDevice(raw = {}) {
		const deviceId = String(raw.deviceId || raw.address || raw.mac || '').toUpperCase()
		const name = String(raw.name || raw.localName || '').trim() || deviceId
		return {
			deviceId,
			address: deviceId,
			name,
			localName: name,
			RSSI: raw.RSSI || 0,
			connectable: true,
			bonded: !!raw.bonded,
			majorClass: raw.majorClass || 0,
			btType: 'classic',
		}
	}

	_collectBondedDevices() {
		const list = []
		// #ifdef APP-PLUS
		try {
			this.ensureNativeReady()
			const bonded = this._btAdapter.getBondedDevices()
			plus.android.importClass(bonded)
			const iterator = bonded.iterator()
			plus.android.importClass(iterator)
			while (iterator.hasNext()) {
				const d = iterator.next()
				plus.android.importClass(d)
				let majorClass = 0
				try {
					const btClass = d.getBluetoothClass()
					plus.android.importClass(btClass)
					majorClass = btClass.getMajorDeviceClass()
				} catch (e) {}
				const name = d.getName() || ''
				const address = String(d.getAddress() || '').toUpperCase()
				if (!address) continue
				list.push(this._normalizeDevice({
					deviceId: address,
					name,
					bonded: true,
					majorClass,
				}))
			}
		} catch (e) {
			this.log('collectBondedDevices fail', e)
		}
		// #endif
		return list
	}

	startBluetoothDevicesDiscovery(options = {}) {
		const that = this
		void options
		return new Promise((resolve, reject) => {
			// #ifdef APP-PLUS
			try {
				that.ensureNativeReady()
				if (!that._btAdapter.isEnabled()) {
					reject(new Error('请先打开手机蓝牙'))
					return
				}
				that._bluetoothModuleSearchState = 'searching'
				that._discoveredRawMap = new Map()
				// 先塞入已配对设备，避免仅依赖扫描
				that._collectBondedDevices().forEach((d) => {
					that._discoveredRawMap.set(d.deviceId, d)
				})

				if (that._btAdapter.isDiscovering()) {
					that._btAdapter.cancelDiscovery()
				}

				const BluetoothDevice = plus.android.importClass('android.bluetooth.BluetoothDevice')
				const BluetoothAdapter = plus.android.importClass('android.bluetooth.BluetoothAdapter')
				const IntentFilter = plus.android.importClass('android.content.IntentFilter')
				const filter = new IntentFilter()
				filter.addAction(BluetoothDevice.ACTION_FOUND)
				filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED)
				filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED)

				that._unregisterDiscoveryReceiver()
				const receiver = plus.android.implements(
					'io.dcloud.android.content.BroadcastReceiver',
					{
						onReceive(context, intent) {
							try {
								plus.android.importClass(intent)
								const action = intent.getAction()
								if (action === BluetoothAdapter.ACTION_DISCOVERY_FINISHED) {
									that._bluetoothModuleSearchState = that._discoveredRawMap.size
										? BLUETOOTH_MODULE_SEARCH_STATE.SEARCHED
										: BLUETOOTH_MODULE_SEARCH_STATE.NOT_SEARCHED
									that._bluetoothAdapterState.discovering = false
									that._unregisterDiscoveryReceiver()
									that.emit('stateChange')
									return
								}
								if (action !== BluetoothDevice.ACTION_FOUND) return
								const device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
								if (!device) return
								plus.android.importClass(device)
								const address = String(device.getAddress() || '').toUpperCase()
								if (!address) return
								let majorClass = 0
								try {
									const btClass = device.getBluetoothClass()
									plus.android.importClass(btClass)
									majorClass = btClass.getMajorDeviceClass()
								} catch (e) {}
								const name = device.getName() || ''
								const bonded = device.getBondState() === BluetoothDevice.BOND_BONDED
								const normalized = that._normalizeDevice({
									deviceId: address,
									name,
									bonded,
									majorClass,
								})
								that._discoveredRawMap.set(address, normalized)
								if (that._continuousDiscovering) {
									that._mergeDiscoveredDevices([normalized], 'continue')
									that.emit('stateChange')
								}
							} catch (e) {
								that.log('classic discovery onReceive fail', e)
							}
						},
					}
				)
				that._discoveryReceiver = receiver
				that._mainActivity.registerReceiver(receiver, filter)
				const started = that._btAdapter.startDiscovery()
				if (!started) {
					that._bluetoothModuleSearchState = 'notSearched'
					that._unregisterDiscoveryReceiver()
					reject(new Error('搜索附近可用蓝牙设备失败'))
					return
				}
				that._bluetoothAdapterState.discovering = true
				resolve(true)
			} catch (err) {
				that._bluetoothModuleSearchState = 'notSearched'
				reject(err instanceof Error ? err : new Error('搜索附近可用蓝牙设备失败'))
			}
			// #endif
			// #ifndef APP-PLUS
			reject(new Error('经典蓝牙仅支持 App 端 Android'))
			// #endif
		})
	}

	_unregisterDiscoveryReceiver() {
		// #ifdef APP-PLUS
		if (this._discoveryReceiver && this._mainActivity) {
			try {
				this._mainActivity.unregisterReceiver(this._discoveryReceiver)
			} catch (e) {}
		}
		this._discoveryReceiver = null
		// #endif
	}

	stopBluetoothDevicesDiscovery() {
		const that = this
		return new Promise((resolve) => {
			uni.hideLoading()
			// #ifdef APP-PLUS
			try {
				if (that._btAdapter && that._btAdapter.isDiscovering()) {
					that._btAdapter.cancelDiscovery()
				}
			} catch (e) {}
			that._unregisterDiscoveryReceiver()
			// #endif
			that._bluetoothAdapterState.discovering = false
			that._bluetoothModuleSearchState = that._discoveredRawMap && that._discoveredRawMap.size
				? BLUETOOTH_MODULE_SEARCH_STATE.SEARCHED
				: (that._searchDevicesResultList.length
					? BLUETOOTH_MODULE_SEARCH_STATE.SEARCHED
					: BLUETOOTH_MODULE_SEARCH_STATE.NOT_SEARCHED)
			resolve(true)
		})
	}

	getBluetoothDevices() {
		const that = this
		return new Promise((resolve) => {
			const map = new Map()
			that._collectBondedDevices().forEach((d) => map.set(d.deviceId, d))
			if (that._discoveredRawMap) {
				that._discoveredRawMap.forEach((d, id) => map.set(id, d))
			}
			resolve(Array.from(map.values()))
		})
	}

	getConnectedBluetoothDevices() {
		return Promise.resolve(
			(this._connectedDevicesList || []).map((d) => ({
				deviceId: d.deviceId,
				name: d.name || d.localName || '',
			}))
		)
	}

	onBluetoothDeviceFound(callback) {
		const that = this
		return new Promise(async (resolve) => {
			const start = Date.now()
			const end = start + 6000
			const tick = async () => {
				const list = await that.getBluetoothDevices()
				const stop = typeof callback === 'function'
					? callback({ devices: list })
					: true
				if (stop || Date.now() > end) {
					resolve(true)
					return
				}
				await sleep(0.4)
				tick()
			}
			tick()
		})
	}

	/**
	 * 经典蓝牙必须先配对（BOND_BONDED）再 RFCOMM 连接
	 * 汉印 HM-A300 等机型走系统「确认配对」，不要自动 setPin(0000/1234)，否则会报 PIN/通行密钥不正确
	 */
	_ensureBonded(remoteDevice, timeoutMs = 45000) {
		const that = this
		return new Promise((resolve, reject) => {
			// #ifdef APP-PLUS
			try {
				that.ensureNativeReady()
				const BluetoothDevice = plus.android.importClass('android.bluetooth.BluetoothDevice')
				plus.android.importClass(remoteDevice)
				const bondState = remoteDevice.getBondState()
				if (bondState === BluetoothDevice.BOND_BONDED) {
					resolve(true)
					return
				}

				uni.showLoading({ title: '请在系统弹窗确认配对' })
				showMsg('请点击系统蓝牙弹窗中的「配对/确认」')

				const IntentFilter = plus.android.importClass('android.content.IntentFilter')
				const filter = new IntentFilter()
				filter.addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED)
				filter.addAction(BluetoothDevice.ACTION_PAIRING_REQUEST)

				let settled = false
				let receiver = null
				const cleanup = () => {
					if (receiver && that._mainActivity) {
						try {
							that._mainActivity.unregisterReceiver(receiver)
						} catch (e) {}
					}
					receiver = null
				}
				const finishOk = () => {
					if (settled) return
					settled = true
					clearTimeout(timer)
					cleanup()
					resolve(true)
				}
				const finishFail = (msg) => {
					if (settled) return
					settled = true
					clearTimeout(timer)
					cleanup()
					reject(new Error(msg || '蓝牙配对失败'))
				}
				const timer = setTimeout(() => {
					finishFail('蓝牙配对超时。请到「设置 → 蓝牙」中找到打印机点配对，成功后再回 App 连接')
				}, timeoutMs)

				receiver = plus.android.implements(
					'io.dcloud.android.content.BroadcastReceiver',
					{
						onReceive(context, intent) {
							try {
								plus.android.importClass(intent)
								const action = intent.getAction()
								// 仅自动确认「同意配对」，绝不写入 PIN（HM 等机型写错 PIN 会直接配对失败）
								if (action === BluetoothDevice.ACTION_PAIRING_REQUEST) {
									const pairDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
									const variant = intent.getIntExtra(BluetoothDevice.EXTRA_PAIRING_VARIANT, -1)
									that.log('classic pairing request variant', variant)
									// 0=PIN, 7=16位PIN：交给系统弹窗，不代填
									const needsPin = variant === 0 || variant === 7
									if (!needsPin) {
										try {
											const target = pairDevice || remoteDevice
											plus.android.importClass(target)
											plus.android.invoke(target, 'setPairingConfirmation', true)
										} catch (e) {
											that.log('setPairingConfirmation fail', e)
										}
									}
									return
								}
								if (action !== BluetoothDevice.ACTION_BOND_STATE_CHANGED) return
								const state = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, -1)
								const prev = intent.getIntExtra(BluetoothDevice.EXTRA_PREVIOUS_BOND_STATE, -1)
								that.log('classic bond state', { state, prev })
								if (state === BluetoothDevice.BOND_BONDED) {
									finishOk()
									return
								}
								if (state === BluetoothDevice.BOND_NONE && prev === BluetoothDevice.BOND_BONDING) {
									finishFail('配对失败。请先在系统蓝牙中「忽略/取消配对」该打印机，再重新连接并在弹窗点确认（不要输入 0000）')
								}
							} catch (e) {
								that.log('classic bond receiver fail', e)
							}
						},
					}
				)
				that._mainActivity.registerReceiver(receiver, filter)

				const current = remoteDevice.getBondState()
				if (current === BluetoothDevice.BOND_BONDING) {
					return
				}
				const started = remoteDevice.createBond()
				if (!started && remoteDevice.getBondState() !== BluetoothDevice.BOND_BONDING) {
					finishFail('无法发起配对。请到手机「设置 → 蓝牙」中手动配对打印机后再回来连接')
				}
			} catch (err) {
				reject(err instanceof Error ? err : new Error(formatBluetoothError(err, '蓝牙配对失败')))
			}
			// #endif
			// #ifndef APP-PLUS
			reject(new Error('经典蓝牙仅支持 App 端 Android'))
			// #endif
		})
	}

	async connectBlueToothPrinter(options) {
		const that = this
		try {
			const device = that.validateBluetoothDevices(options)
			uni.showLoading({ title: '连接中...' })
			that.changeConnectState(device, 'connecting')
			that._negotiatedMtu = convertNumber(that.getPrintConfig().mtu) || 512
			await that.createBLEConnection(device)
			const dealRes = await that.dealServicesAndCharacteristics(device)
			that.operationConnectDevice(dealRes)
			return dealRes
		} catch (err) {
			uni.hideLoading()
			that.changeConnectState(that._operationDevicesInfo, 'notConnected')
			showMsg((err && err.message) || '连接蓝牙打印机失败')
		} finally {
			uni.hideLoading()
		}
	}

	createBLEConnection(device) {
		const that = this
		return new Promise(async (resolve, reject) => {
			// #ifdef APP-PLUS
			try {
				that.ensureNativeReady()
				const deviceId = String((device && device.deviceId) || '').toUpperCase()
				const name = (device && device.name) || deviceId
				if (!deviceId) {
					reject(new Error('设备ID参数缺失'))
					return
				}
				// 搜索未停干净时 connect 极易失败
				if (that._btAdapter.isDiscovering()) {
					that._btAdapter.cancelDiscovery()
					await sleep(0.5)
				}
				await that._closeSocketById(deviceId)

				const UUID = plus.android.importClass('java.util.UUID')
				const sppUuid = UUID.fromString(CLASSIC_SPP_UUID)
				const remote = that._btAdapter.getRemoteDevice(deviceId)
				plus.android.importClass(remote)

				// 关键原因：多数安卓机必须先配对，再 SPP 连接
				await that._ensureBonded(remote)
				uni.showLoading({ title: '连接中...' })
				await sleep(0.3)

				let socket = null
				const tryConnect = (creator) => {
					const s = creator()
					plus.android.importClass(s)
					s.connect()
					return s
				}

				try {
					socket = tryConnect(() => remote.createRfcommSocketToServiceRecord(sppUuid))
				} catch (e1) {
					that.log('createRfcommSocketToServiceRecord fail, try insecure', e1)
					try {
						socket = tryConnect(() => remote.createInsecureRfcommSocketToServiceRecord(sppUuid))
					} catch (e2) {
						that.log('insecure fail, try reflection channel 1', e2)
						try {
							// 部分国产打印机仅接受反射通道 1
							socket = plus.android.invoke(remote, 'createRfcommSocket', 1)
							plus.android.importClass(socket)
							socket.connect()
						} catch (e3) {
							reject(new Error(
								formatBluetoothError(e3, '连接失败') +
								'。请确认打印机已开机且已在系统蓝牙中配对成功'
							))
							return
						}
					}
				}

				if (!socket || !socket.isConnected()) {
					reject(new Error('连接经典蓝牙设备失败，请先在系统蓝牙设置中完成配对'))
					return
				}
				const outputStream = socket.getOutputStream()
				plus.android.importClass(outputStream)
				that._socketMap.set(deviceId, { socket, outputStream })
				showMsg(`设备${name}连接成功`)
				resolve(true)
			} catch (err) {
				reject(err instanceof Error ? err : new Error(formatBluetoothError(err, '连接经典蓝牙设备失败')))
			}
			// #endif
			// #ifndef APP-PLUS
			reject(new Error('经典蓝牙仅支持 App 端 Android'))
			// #endif
		})
	}

	closeBLEConnection(device) {
		const that = this
		return new Promise(async (resolve, reject) => {
			try {
				const deviceId = String((device && device.deviceId) || '').toUpperCase()
				if (!deviceId) {
					reject(new Error('设备ID参数缺失'))
					return
				}
				await that._closeSocketById(deviceId)
				showMsg('断开经典蓝牙设备连接成功')
				resolve(true)
			} catch (err) {
				reject(err instanceof Error ? err : new Error('断开经典蓝牙设备连接失败'))
			}
		})
	}

	async dealServicesAndCharacteristics(device = {}) {
		const nObj = {
			characteristicId: CLASSIC_SPP_CHARACTERISTIC_ID,
			serviceId: CLASSIC_SPP_SERVICE_ID,
			writeType: 'write',
			btType: 'classic',
			services: [{
				characteristicId: CLASSIC_SPP_CHARACTERISTIC_ID,
				serviceId: CLASSIC_SPP_SERVICE_ID,
			}],
		}
		const ndObj = this.changeConnectState(nObj, 'connected')
		return Object.assign(device, ndObj)
	}

	async disconnectAllConnectedDevices() {
		const that = this
		const list = (that._connectedDevicesList || []).slice()
		if (!list.length) {
			that._connectedDevicesList = []
			that.emit('stateChange')
			showMsg('当前没有已连接设备')
			return true
		}
		uni.showLoading({ title: '全部中断中...' })
		try {
			for (let i = 0; i < list.length; i++) {
				const device = list[i]
				if (!device || !device.deviceId) continue
				await that._closeSocketById(device.deviceId)
			}
			that._connectedDevicesList = []
			that._searchDevicesResultList = (that._searchDevicesResultList || []).map((ele) => ({
				...ele,
				isConnect: false,
				connectState: 'notConnected',
			}))
			that.emit('stateChange')
			showMsg('已全部中断连接', 'success')
			return true
		} finally {
			uni.hideLoading()
		}
	}

	requestBLEMTU() {
		return Promise.resolve({ ok: true, mtu: this.getWriteChunkSize() })
	}

	async findMaxSettableMTU() {
		return this.getWriteChunkSize()
	}

	async applyOptimalTransferAfterConnect() {
		const mtu = this.getWriteChunkSize()
		this._mtu = mtu
		this._negotiatedMtu = mtu
		return mtu
	}

	async setBLEMTU() {
		this._negotiatedMtu = this.getWriteChunkSize()
		return true
	}

	async startContinuousDeviceDiscovery(findResultType = 'continue') {
		const that = this
		try {
			if (that._bluetoothModuleState === 'starting') {
				showMsg('蓝牙模块正在启动中，请耐心等待')
				return false
			}
			if (that._bluetoothModuleState === 'notStarted') {
				await that.setupBlueTooth()
			}
			if (findResultType === 'refresh') {
				that._searchDevicesResultList = []
			}
			if (that._continuousDiscovering) {
				await that._pullCachedDevicesIntoSearchList()
				return true
			}
			if (that._bluetoothModuleSearchState === 'searching') {
				try {
					await that.stopBluetoothDevicesDiscovery()
				} catch (e) {}
			}
			const isSearch = await that.startBluetoothDevicesDiscovery()
			if (!isSearch) {
				showMsg('未开启搜索蓝牙设备')
				return false
			}
			that._continuousDiscovering = true
			await that._pullCachedDevicesIntoSearchList()
			that.emit('stateChange')
			return true
		} catch (err) {
			that._continuousDiscovering = false
			showMsg((err && err.message) || '持续搜索蓝牙设备失败')
			return false
		}
	}

	async stopContinuousDeviceDiscovery() {
		const that = this
		that._continuousDiscovering = false
		try {
			if (that._bluetoothModuleSearchState === 'searching') {
				await that.stopBluetoothDevicesDiscovery()
			}
		} catch (e) {
			that._bluetoothModuleSearchState = that._searchDevicesResultList.length
				? BLUETOOTH_MODULE_SEARCH_STATE.SEARCHED
				: BLUETOOTH_MODULE_SEARCH_STATE.NOT_SEARCHED
		}
		if (that._searchDevicesResultList.length) {
			that._bluetoothModuleSearchState = BLUETOOTH_MODULE_SEARCH_STATE.SEARCHED
		}
		that.emit('stateChange')
		return true
	}

	_arrayBufferToJavaBytes(buffer) {
		// #ifdef APP-PLUS
		const base64 = uni.arrayBufferToBase64(buffer)
		const Base64 = plus.android.importClass('android.util.Base64')
		return Base64.decode(base64, Base64.DEFAULT)
		// #endif
		// #ifndef APP-PLUS
		return null
		// #endif
	}

	writeBLECharacteristicValue(options) {
		const that = this
		const maxRetry = that.getMaxPacketRetry()
		const doWrite = (retryCount) => new Promise((resolve, reject) => {
			try {
				that.ensurePrintNotAborted()
			} catch (abortErr) {
				reject(abortErr)
				return
			}
			const deviceId = String((options && options.deviceId) || '').toUpperCase()
			const buffer = options && options.buffer
			const entry = that._socketMap.get(deviceId)
			if (!entry || !entry.outputStream) {
				reject(new Error('蓝牙连接已断开，请重新连接打印机'))
				return
			}
			try {
				const bytes = that._arrayBufferToJavaBytes(buffer)
				const outputStream = entry.outputStream
				plus.android.importClass(outputStream)
				outputStream.write(bytes)
				outputStream.flush()
				resolve(true)
			} catch (err) {
				that.log('classic write fail', err, { retryCount, byteLength: buffer && buffer.byteLength })
				if (retryCount < maxRetry) {
					const cfg = that.getPrintConfig()
					if (cfg.enableRecursivePrint) {
						that.progressiveBumpPrintConfig()
					}
					sleep(that.getRetryIntervalSec()).then(() => {
						doWrite(retryCount + 1).then(resolve).catch(reject)
					})
					return
				}
				reject(new Error(formatBluetoothError(err, '蓝牙写入失败')))
			}
		})
		return doWrite(0)
	}

	async _closeSocketById(deviceId) {
		const id = String(deviceId || '').toUpperCase()
		const entry = this._socketMap.get(id)
		if (!entry) return
		try {
			if (entry.outputStream) {
				plus.android.importClass(entry.outputStream)
				entry.outputStream.close()
			}
		} catch (e) {}
		try {
			if (entry.socket) {
				plus.android.importClass(entry.socket)
				entry.socket.close()
			}
		} catch (e) {}
		this._socketMap.delete(id)
	}

	_closeAllSocketsSilent() {
		const ids = Array.from(this._socketMap.keys())
		ids.forEach((id) => {
			this._closeSocketById(id)
		})
	}

	clearDeviceLists() {
		this._closeAllSocketsSilent()
		this._discoveredRawMap = new Map()
		super.clearDeviceLists()
	}
}
