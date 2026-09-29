/**
 * @file harmonyClassicBlueTooth.js
 * 华为 / 鸿蒙 App 经典蓝牙（SPP）适配器
 *
 * 在 ClassicBlueTooth 之上针对鸿蒙协议栈做隔离优化，避免：
 * 1. 主线程阻塞 socket.connect() 导致界面卡死 / ANR 闪退（基类已后台线程）
 * 2. 搜索未停干净就配对连接失败
 * 3. 配对弹窗与 RFCOMM 抢占导致原生崩溃
 * 4. 大包写入触发缓冲溢出
 *
 * 普通安卓仍走 ClassicBlueTooth；本类仅在华为/荣耀/鸿蒙机型启用。
 * 非 APP-PLUS 编译产物不会引入本文件中的 plus.android 调用路径。
 */
import { ClassicBlueTooth, CLASSIC_SPP_UUID } from './classicBlueTooth.js'
import {
	formatBluetoothError,
} from './config.js'
import {
	convertNumber,
	showMsg,
	sleep,
} from '../comm/utils.js'

/** 取消搜索后等待协议栈稳定的时间（毫秒）——鸿蒙略长 */
const HM_AFTER_CANCEL_DISCOVERY_MS = 800
/** 配对成功后再连 SPP 的缓冲（毫秒） */
const HM_AFTER_BOND_MS = 600
/** 并发连接互斥：鸿蒙上多路 createBond/connect 极易闪退 */
let _hmConnectLock = Promise.resolve()

/**
 * 是否华为 / 荣耀 / 鸿蒙机型（含仍上报 android 的兼容层）
 * @param {Object} systemInfo
 * @returns {boolean}
 */
export function isHuaweiHarmonyDevice(systemInfo = {}) {
	const osName = String(systemInfo.osName || '').toLowerCase()
	const platform = String(systemInfo.platform || '').toLowerCase()
	const system = String(systemInfo.system || '').toLowerCase()
	const romName = String(systemInfo.romName || '').toLowerCase()
	const brand = String(systemInfo.brand || systemInfo.deviceBrand || '').toLowerCase()
	const manufacturer = String(systemInfo.manufacturer || '').toLowerCase()
	const model = String(systemInfo.model || systemInfo.deviceModel || '').toLowerCase()

	const isHarmony =
		osName.includes('harmony') ||
		platform === 'harmony' ||
		platform.includes('harmony') ||
		system.includes('harmony') ||
		romName.includes('harmony') ||
		romName.includes('emui') ||
		romName.includes('magic')

	const isHuaweiFamily =
		brand.includes('huawei') ||
		brand.includes('honor') ||
		brand.includes('华为') ||
		brand.includes('荣耀') ||
		manufacturer.includes('huawei') ||
		manufacturer.includes('honor') ||
		model.startsWith('hwa-') ||
		model.startsWith('hbp-') ||
		model.includes('pura') ||
		model.includes('mate')

	return isHarmony || isHuaweiFamily
}

/**
 * 华为鸿蒙经典蓝牙适配器
 */
export class HarmonyClassicBlueTooth extends ClassicBlueTooth {
	constructor() {
		super()
		/** @type {'classic'} */
		this._btMode = 'classic'
		this._harmonyClassic = true
		// 华为机型即使系统信息未带 harmony 字样，也按鸿蒙策略走传输参数
		this._isHarmonyOS = true
		/** 搜索结果合并节流定时器 */
		this._discoveryEmitTimer = null
		/** 最近一次搜索结果推送时间 */
		this._lastDiscoveryEmitAt = 0
	}

	getBluetoothMode() {
		return 'classic'
	}

	getPlatformDisplayName() {
		return '鸿蒙(经典蓝牙)'
	}

	getPlatformDefaultConfig() {
		const base = super.getPlatformDefaultConfig()
		// 鸿蒙经典蓝牙缓冲弱：中等分包 + 略长间隔，兼顾吞吐与稳定性
		return {
			...base,
			useOptimalTransfer: false,
			mtu: 256,
			mtuStep: 32,
			packetIntervalMs: 40,
			retryIntervalMs: 80,
			maxPacketRetry: 3,
		}
	}

	/** 单包大小：鸿蒙经典蓝牙默认 256，上限 512 */
	getWriteChunkSize(totalLength = 0) {
		void totalLength
		const cfgMtu = convertNumber(this.getPrintConfig().mtu) || this._mtu || 256
		return Math.min(Math.max(cfgMtu, 64), 512)
	}

	/**
	 * 按鸿蒙更稳的顺序尝试 RFCOMM：
	 * insecure → secure → 反射 channel 1
	 * （部分华为机型 secure 通道会直接阻塞或抛 SecurityException）
	 */
	async _tryCreateAndConnectSocket(remote, sppUuid) {
		const that = this
		// #ifdef APP-PLUS
		const attempts = [
			{
				name: 'insecure',
				create: () => remote.createInsecureRfcommSocketToServiceRecord(sppUuid),
			},
			{
				name: 'secure',
				create: () => remote.createRfcommSocketToServiceRecord(sppUuid),
			},
			{
				name: 'reflect-1',
				create: () => plus.android.invoke(remote, 'createRfcommSocket', 1),
			},
		]

		let lastErr = null
		for (let i = 0; i < attempts.length; i++) {
			const item = attempts[i]
			let socket = null
			try {
				socket = item.create()
				plus.android.importClass(socket)
				await that._connectSocketWithTimeout(socket)
				that.log('harmony spp connect ok via', item.name)
				return socket
			} catch (err) {
				lastErr = err
				that.log('harmony spp connect fail via', item.name, err)
				try {
					if (socket) {
						plus.android.importClass(socket)
						socket.close()
					}
				} catch (e) {}
				await sleep(0.25)
			}
		}
		throw (lastErr instanceof Error
			? lastErr
			: new Error(formatBluetoothError(lastErr, '连接失败')))
		// #endif
		// #ifndef APP-PLUS
		throw new Error('经典蓝牙仅支持 App 端 Android')
		// #endif
	}

	/** 连接串行化，避免连点/历史重连并发闪退 */
	_withConnectLock(task) {
		const run = _hmConnectLock.then(() => task())
		_hmConnectLock = run.catch(() => {})
		return run
	}

	async connectBlueToothPrinter(options) {
		const that = this
		return that._withConnectLock(async () => {
			try {
				const device = that.validateBluetoothDevices(options)
				const deviceId = String((device && device.deviceId) || '').toUpperCase()
				if (that._connectingDeviceId && that._connectingDeviceId === deviceId) {
					showMsg('正在连接中，请稍候')
					return null
				}
				that._connectingDeviceId = deviceId
				uni.showLoading({ title: '连接中...', mask: true })
				that.changeConnectState(device, 'connecting')
				that._negotiatedMtu = convertNumber(that.getPrintConfig().mtu) || 256
				await that.createBLEConnection(device)
				const dealRes = await that.dealServicesAndCharacteristics(device)
				that.operationConnectDevice(dealRes)
				return dealRes
			} catch (err) {
				uni.hideLoading()
				that.changeConnectState(that._operationDevicesInfo, 'notConnected')
				showMsg((err && err.message) || '连接蓝牙打印机失败')
				return null
			} finally {
				that._connectingDeviceId = ''
				uni.hideLoading()
			}
		})
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

				// 1) 搜索必须停干净：鸿蒙上 discovery 与 connect 并发极易失败/卡死
				that._clearRediscoveryTimer()
				try {
					if (that._btAdapter.isDiscovering()) {
						that._btAdapter.cancelDiscovery()
					}
					await that.stopBluetoothDevicesDiscovery().catch(() => {})
					await sleep(HM_AFTER_CANCEL_DISCOVERY_MS / 1000)
				} catch (e) {
					that.log('harmony cancelDiscovery fail', e)
				}

				await that._closeSocketById(deviceId)

				const UUID = plus.android.importClass('java.util.UUID')
				const sppUuid = UUID.fromString(CLASSIC_SPP_UUID)
				const remote = that._btAdapter.getRemoteDevice(deviceId)
				plus.android.importClass(remote)

				// 2) 配对（系统弹窗确认）；配对超时略放宽
				uni.showLoading({ title: '请确认配对...', mask: true })
				await that._ensureBonded(remote, 60000)
				await sleep(HM_AFTER_BOND_MS / 1000)

				// 3) 再检一次：配对过程中系统可能又拉起扫描
				try {
					if (that._btAdapter.isDiscovering()) {
						that._btAdapter.cancelDiscovery()
						await sleep(0.4)
					}
				} catch (e) {}

				uni.showLoading({ title: '连接中...', mask: true })
				const socket = await that._tryCreateAndConnectSocket(remote, sppUuid)
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

	/**
	 * 历史设备逐个连接（禁止 Promise.race 并发），降低鸿蒙闪退概率
	 */
	async connectHistoryPrintDevices() {
		const that = this
		try {
			if (!that._historyPrintDeviceList || !that._historyPrintDeviceList.length) {
				return false
			}
			if (that._bluetoothModuleState !== 'started') {
				throw new Error('蓝牙模块未启动，历史打印机连接失败')
			}
			for (let i = 0; i < that._historyPrintDeviceList.length; i++) {
				const ele = that._historyPrintDeviceList[i]
				if (!ele || !ele.deviceId) continue
				try {
					await that.connectBlueToothPrinter(ele)
					if ((that._connectedDevicesList || []).length > 0) {
						return true
					}
				} catch (e) {
					that.log('harmony history connect one fail', e)
				}
				await sleep(0.3)
			}
			return (that._connectedDevicesList || []).length > 0
		} catch (err) {
			showMsg((err && err.message) || '历史打印机连接失败')
			return false
		}
	}

	/**
	 * 搜索广播节流：鸿蒙上 ACTION_FOUND 极密，频繁 emit 易导致界面卡顿
	 */
	_scheduleDiscoveryEmit() {
		const that = this
		const now = Date.now()
		const minGap = 400
		if (that._discoveryEmitTimer) return
		const delay = Math.max(0, minGap - (now - that._lastDiscoveryEmitAt))
		that._discoveryEmitTimer = setTimeout(() => {
			that._discoveryEmitTimer = null
			that._lastDiscoveryEmitAt = Date.now()
			that.emit('stateChange')
		}, delay)
	}

	_notifyDiscoveryStateChange() {
		this._scheduleDiscoveryEmit()
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
				// #ifdef APP-PLUS
				const bytes = that._arrayBufferToJavaBytes(buffer)
				const outputStream = entry.outputStream
				plus.android.importClass(outputStream)
				outputStream.write(bytes)
				outputStream.flush()
				resolve(true)
				// #endif
				// #ifndef APP-PLUS
				reject(new Error('经典蓝牙仅支持 App 端 Android'))
				// #endif
			} catch (err) {
				that.log('harmony classic write fail', err, {
					retryCount,
					byteLength: buffer && buffer.byteLength,
				})
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

	clearDeviceLists() {
		if (this._discoveryEmitTimer) {
			clearTimeout(this._discoveryEmitTimer)
			this._discoveryEmitTimer = null
		}
		super.clearDeviceLists()
	}
}
