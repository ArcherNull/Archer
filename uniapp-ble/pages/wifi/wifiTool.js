/**
 * WiFi 连接 + TCP 数据传输工具
 * - 微信小程序：wx / uni WiFi API + createTCPSocket
 * - App(Android)：WifiManager 扫网/读当前 + Socket TCP
 *   （Android 10+ 连热点走系统确认弹窗）
 */

import { strToGBKByte } from '../print/sdk/CC3/printUtil-GBK.js'

function getWxApi() {
	// #ifdef MP-WEIXIN
	if (typeof wx !== 'undefined') return wx
	// #endif
	return typeof uni !== 'undefined' ? uni : null
}

function isAppPlus() {
	// #ifdef APP-PLUS
	return true
	// #endif
	// #ifndef APP-PLUS
	return false
	// #endif
}

function utf8ToArrayBuffer(str) {
	const s = String(str || '')
	if (typeof TextEncoder !== 'undefined') {
		return new TextEncoder().encode(s).buffer
	}
	const arr = []
	for (let i = 0; i < s.length; i++) {
		let code = s.charCodeAt(i)
		if (code < 0x80) {
			arr.push(code)
		} else if (code < 0x800) {
			arr.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
		} else if (code >= 0xd800 && code <= 0xdbff && i + 1 < s.length) {
			const next = s.charCodeAt(++i)
			const u = 0x10000 + (((code & 0x3ff) << 10) | (next & 0x3ff))
			arr.push(
				0xf0 | (u >> 18),
				0x80 | ((u >> 12) & 0x3f),
				0x80 | ((u >> 6) & 0x3f),
				0x80 | (u & 0x3f)
			)
		} else {
			arr.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
		}
	}
	return new Uint8Array(arr).buffer
}

export function textToBuffer(text, encoding) {
	const enc = String(encoding || 'gbk').toLowerCase()
	if (enc === 'utf8' || enc === 'utf-8') {
		return utf8ToArrayBuffer(text)
	}
	return strToGBKByte(String(text || ''))
}

export function bufferToHexPreview(buffer, maxLen) {
	const u8 = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer || [])
	const n = Math.min(u8.length, maxLen == null ? 64 : maxLen)
	const parts = []
	for (let i = 0; i < n; i++) {
		parts.push(('0' + u8[i].toString(16)).slice(-2))
	}
	const more = u8.length > n ? ' ...' : ''
	return parts.join(' ') + more + ' (' + u8.length + ' bytes)'
}

function stripSsidQuotes(ssid) {
	const s = String(ssid || '')
	if (s.length >= 2 && s.charAt(0) === '"' && s.charAt(s.length - 1) === '"') {
		return s.slice(1, -1)
	}
	return s
}

class WifiTool {
	constructor() {
		this._wifiStarted = false
		this._tcp = null
		this._appSocket = null
		this._appOutput = null
		this._connectedHost = ''
		this._connectedPort = 0
		this._onMessage = null
		this._onClose = null
		this._onError = null
		this._listHandler = null
		this._connectedHandler = null
		/** @type {Function|null} App 扫网广播回调 */
		this._appScanReceiver = null
		/** @type {Object|null} App ConnectivityManager 网络回调 */
		this._appNetworkCallback = null
	}

	// ─── App Android 原生 WiFi ───

	_getMainActivity() {
		// #ifdef APP-PLUS
		return plus.android.runtimeMainActivity()
		// #endif
		// #ifndef APP-PLUS
		return null
		// #endif
	}

	_getWifiManager() {
		// #ifdef APP-PLUS
		const main = this._getMainActivity()
		const Context = plus.android.importClass('android.content.Context')
		const wifiManager = main.getSystemService(Context.WIFI_SERVICE)
		plus.android.importClass(wifiManager)
		return wifiManager
		// #endif
		// #ifndef APP-PLUS
		return null
		// #endif
	}

	_androidSdkInt() {
		// #ifdef APP-PLUS
		try {
			const VERSION = plus.android.importClass('android.os.Build$VERSION')
			const sdk = Number(VERSION && VERSION.SDK_INT)
			if (sdk > 0) return sdk
		} catch (e) {}
		// #endif
		return 0
	}

	_startWifiApp() {
		// #ifdef APP-PLUS
		return new Promise((resolve, reject) => {
			try {
				const wifiManager = this._getWifiManager()
				if (!wifiManager) {
					reject(new Error('无法获取 WifiManager'))
					return
				}
				try {
					if (!wifiManager.isWifiEnabled()) {
						// Android 10+ 可能无法静默开启，失败则引导用户
						const ok = wifiManager.setWifiEnabled(true)
						if (!ok && !wifiManager.isWifiEnabled()) {
							reject(new Error('请先打开手机 WiFi 开关'))
							return
						}
					}
				} catch (e) {
					if (!wifiManager.isWifiEnabled()) {
						reject(new Error('请先打开手机 WiFi 开关'))
						return
					}
				}
				this._wifiStarted = true
				resolve(true)
			} catch (e) {
				reject(e || new Error('启动 WiFi 失败'))
			}
		})
		// #endif
		// #ifndef APP-PLUS
		return Promise.reject(new Error('非 App 端'))
		// #endif
	}

	_unregisterAppScanReceiver() {
		// #ifdef APP-PLUS
		if (!this._appScanReceiver) return
		try {
			const main = this._getMainActivity()
			main.unregisterReceiver(this._appScanReceiver)
		} catch (e) {}
		this._appScanReceiver = null
		// #endif
	}

	/** 兼容 plus.android 读取 Java 对象字段 / 方法 */
	_javaGet(obj, name) {
		// #ifdef APP-PLUS
		if (!obj) return null
		try {
			if (obj[name] != null && typeof obj[name] !== 'function') return obj[name]
		} catch (e) {}
		try {
			const v = plus.android.getAttribute(obj, name)
			if (v != null) return v
		} catch (e) {}
		try {
			return plus.android.invoke(obj, name)
		} catch (e) {}
		try {
			return plus.android.invoke(obj, 'get' + name.charAt(0).toUpperCase() + name.slice(1))
		} catch (e) {}
		return null
		// #endif
		// #ifndef APP-PLUS
		return null
		// #endif
	}

	_readAppScanResults() {
		// #ifdef APP-PLUS
		const wifiManager = this._getWifiManager()
		let results = null
		try {
			results = wifiManager.getScanResults()
		} catch (e) {
			return []
		}
		if (!results) return []
		plus.android.importClass(results)

		let size = 0
		try {
			size = Number(results.size())
		} catch (e) {
			try {
				size = Number(plus.android.invoke(results, 'size'))
			} catch (e2) {
				size = 0
			}
		}
		if (!size || size < 1) return []

		const list = []
		const seen = new Set()
		for (let i = 0; i < size; i++) {
			let item = null
			try {
				item = results.get(i)
			} catch (e) {
				try {
					item = plus.android.invoke(results, 'get', i)
				} catch (e2) {
					item = null
				}
			}
			if (!item) continue
			try {
				plus.android.importClass(item)
			} catch (e) {}

			let ssid = stripSsidQuotes(String(this._javaGet(item, 'SSID') || ''))
			let bssid = String(this._javaGet(item, 'BSSID') || '')
			let level = Number(this._javaGet(item, 'level'))
			let capabilities = String(this._javaGet(item, 'capabilities') || '')

			// 隐藏网络：SSID 为空但有 BSSID，仍保留
			const key = (ssid || bssid || ('idx-' + i)).toUpperCase()
			if (seen.has(key)) continue
			seen.add(key)

			const secure = /WEP|WPA|PSK|EAP|SAE|OWE/i.test(capabilities)
			list.push({
				SSID: ssid,
				BSSID: bssid,
				secure: secure,
				signalStrength: isNaN(level) ? 0 : level,
			})
		}
		list.sort(function (a, b) {
			return (Number(b.signalStrength) || 0) - (Number(a.signalStrength) || 0)
		})
		return list
		// #endif
		// #ifndef APP-PLUS
		return []
		// #endif
	}

	_emitWifiList(list) {
		if (typeof this._listHandler === 'function') {
			this._listHandler({ wifiList: list || [] })
		}
	}

	/**
	 * App 扫网：广播 + 轮询双通道（uni-app BroadcastReceiver 在部分机型收不到）
	 * 需：定位权限、定位开关、WiFi 开关
	 */
	_getWifiListApp() {
		// #ifdef APP-PLUS
		const that = this
		return this.ensureWifiStarted().then(() => {
			return new Promise((resolve, reject) => {
				try {
					const wifiManager = that._getWifiManager()
					const WifiManager = plus.android.importClass('android.net.wifi.WifiManager')
					const IntentFilter = plus.android.importClass('android.content.IntentFilter')
					const main = that._getMainActivity()

					that._unregisterAppScanReceiver()

					let settled = false
					let pollTimer = null
					let pollCount = 0
					const maxPoll = 12

					const cleanup = () => {
						if (pollTimer) {
							clearInterval(pollTimer)
							pollTimer = null
						}
						clearTimeout(hardTimer)
						that._unregisterAppScanReceiver()
					}

					const finish = (list) => {
						if (settled) return
						settled = true
						cleanup()
						const arr = Array.isArray(list) ? list : []
						that._emitWifiList(arr)
						resolve({ wifiList: arr })
					}

					const tryRead = (forceFinish) => {
						try {
							const list = that._readAppScanResults()
							if (list.length > 0) {
								finish(list)
								return true
							}
							if (forceFinish) {
								finish([])
								return true
							}
						} catch (e) {
							if (forceFinish) {
								settled = true
								cleanup()
								reject(e || new Error('读取扫网结果失败'))
								return true
							}
						}
						return false
					}

					// 1) 注册广播（部分机型可靠）
					try {
						const receiver = plus.android.implements(
							'io.dcloud.android.content.BroadcastReceiver',
							{
								onReceive(context, intent) {
									try {
										plus.android.importClass(intent)
										const action = intent.getAction()
										if (action !== WifiManager.SCAN_RESULTS_AVAILABLE_ACTION) return
										// EXTRA_RESULTS_UPDATED=false 时仍尝试读缓存
										tryRead(false)
									} catch (e) {}
								},
							}
						)
						that._appScanReceiver = receiver
						const filter = new IntentFilter()
						filter.addAction(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)
						const sdk = that._androidSdkInt()
						if (sdk >= 33) {
							const Context = plus.android.importClass('android.content.Context')
							const flag = Context.RECEIVER_EXPORTED != null ? Context.RECEIVER_EXPORTED : 2
							main.registerReceiver(receiver, filter, flag)
						} else {
							main.registerReceiver(receiver, filter)
						}
					} catch (e) {
						// 广播注册失败则完全依赖轮询
					}

					// 2) 先读一次缓存（系统设置里刚扫过时往往有数据）
					if (tryRead(false)) return

					// 3) 发起扫描（可能因节流返回 false，仍继续轮询）
					let started = false
					try {
						started = !!wifiManager.startScan()
					} catch (e) {
						started = false
					}

					// 4) 轮询 getScanResults（兼容 BroadcastReceiver 不回调的机型）
					pollTimer = setInterval(() => {
						if (settled) return
						pollCount += 1
						if (tryRead(false)) return
						if (pollCount >= maxPoll) {
							tryRead(true)
						}
					}, 500)

					const hardTimer = setTimeout(() => {
						if (!settled) tryRead(true)
					}, started ? 6500 : 5000)
				} catch (e) {
					reject(e || new Error('getWifiList 失败'))
				}
			})
		})
		// #endif
		// #ifndef APP-PLUS
		return Promise.reject(new Error('非 App 端'))
		// #endif
	}

	_getConnectedWifiApp() {
		// #ifdef APP-PLUS
		return this.ensureWifiStarted().then(() => {
			try {
				const wifiManager = this._getWifiManager()
				const info = wifiManager.getConnectionInfo()
				plus.android.importClass(info)
				const ssid = stripSsidQuotes(info.getSSID ? info.getSSID() : '')
				const bssid = info.getBSSID ? String(info.getBSSID() || '') : ''
				const rssi = info.getRssi ? Number(info.getRssi()) : 0
				if (!ssid || ssid === '<unknown ssid>') {
					return { wifi: {} }
				}
				const wifi = {
					SSID: ssid,
					BSSID: bssid,
					secure: true,
					signalStrength: isNaN(rssi) ? 0 : rssi,
				}
				if (typeof this._connectedHandler === 'function') {
					this._connectedHandler({ wifi })
				}
				return { wifi }
			} catch (e) {
				throw e || new Error('getConnectedWifi 失败')
			}
		})
		// #endif
		// #ifndef APP-PLUS
		return Promise.reject(new Error('非 App 端'))
		// #endif
	}

	_openSystemWifiSettings() {
		// #ifdef APP-PLUS
		try {
			const Intent = plus.android.importClass('android.content.Intent')
			const Settings = plus.android.importClass('android.provider.Settings')
			const main = this._getMainActivity()
			main.startActivity(new Intent(Settings.ACTION_WIFI_SETTINGS))
		} catch (e) {}
		// #endif
	}

	/** App：打开系统 WiFi 设置（供页面按钮调用） */
	openSystemWifiSettings() {
		this._openSystemWifiSettings()
	}

	_connectWifiAppLegacy(ssid, password) {
		// #ifdef APP-PLUS
		const wifiManager = this._getWifiManager()
		const WifiConfiguration = plus.android.importClass('android.net.wifi.WifiConfiguration')
		const conf = new WifiConfiguration()
		conf.SSID = '"' + ssid + '"'
		if (password) {
			conf.preSharedKey = '"' + password + '"'
		} else {
			conf.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.NONE)
		}
		let netId = wifiManager.addNetwork(conf)
		if (netId === -1) {
			// 已存在配置时尝试匹配
			const configs = wifiManager.getConfiguredNetworks()
			plus.android.importClass(configs)
			const size = configs.size()
			for (let i = 0; i < size; i++) {
				const c = configs.get(i)
				plus.android.importClass(c)
				if (stripSsidQuotes(c.SSID) === ssid) {
					netId = c.networkId
					break
				}
			}
		}
		if (netId === -1) {
			throw new Error('添加 WiFi 配置失败')
		}
		wifiManager.disconnect()
		const enabled = wifiManager.enableNetwork(netId, true)
		wifiManager.reconnect()
		if (!enabled) {
			throw new Error('启用 WiFi 网络失败')
		}
		return { errMsg: 'connectWifi:ok' }
		// #endif
		// #ifndef APP-PLUS
		throw new Error('非 App 端')
		// #endif
	}

	_connectWifiAppQ(ssid, password) {
		// #ifdef APP-PLUS
		const that = this
		return new Promise((resolve, reject) => {
			try {
				const main = that._getMainActivity()
				const Context = plus.android.importClass('android.content.Context')
				const ConnectivityManager = plus.android.importClass('android.net.ConnectivityManager')
				const NetworkRequest = plus.android.importClass('android.net.NetworkRequest')
				const NetworkCapabilities = plus.android.importClass('android.net.NetworkCapabilities')
				const WifiNetworkSpecifier = plus.android.importClass('android.net.wifi.WifiNetworkSpecifier')

				const builder = new WifiNetworkSpecifier.Builder()
				builder.setSsid(ssid)
				if (password) {
					builder.setWpa2Passphrase(password)
				}
				const specifier = builder.build()
				const requestBuilder = new NetworkRequest.Builder()
				requestBuilder.addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
				requestBuilder.removeCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
				requestBuilder.setNetworkSpecifier(specifier)
				const request = requestBuilder.build()

				const cm = main.getSystemService(Context.CONNECTIVITY_SERVICE)
				plus.android.importClass(cm)

				let settled = false
				const finishOk = () => {
					if (settled) return
					settled = true
					clearTimeout(timer)
					resolve({ errMsg: 'connectWifi:ok' })
					if (typeof that._connectedHandler === 'function') {
						that._connectedHandler({ wifi: { SSID: ssid } })
					}
				}
				const finishFail = (msg) => {
					if (settled) return
					settled = true
					clearTimeout(timer)
					try {
						if (that._appNetworkCallback) {
							cm.unregisterNetworkCallback(that._appNetworkCallback)
						}
					} catch (e) {}
					that._appNetworkCallback = null
					reject(new Error(msg || '连接 WiFi 失败或已取消'))
				}

				const callback = plus.android.implements(
					'android.net.ConnectivityManager$NetworkCallback',
					{
						onAvailable(network) {
							try {
								// 绑定进程到该 WiFi，便于后续 TCP 走打印机热点
								plus.android.invoke(cm, 'bindProcessToNetwork', network)
							} catch (e) {}
							finishOk()
						},
						onUnavailable() {
							finishFail('未选择网络或连接不可用，请在系统弹窗中确认')
						},
						onLost(network) {
							void network
						},
					}
				)
				that._appNetworkCallback = callback
				cm.requestNetwork(request, callback)

				const timer = setTimeout(() => {
					finishFail('连接超时：请在系统弹窗中选择目标 WiFi，或到系统设置手动连接')
				}, 45000)
			} catch (e) {
				// 回退：打开系统 WiFi 设置
				that._openSystemWifiSettings()
				reject(
					e ||
						new Error(
							'当前系统限制 App 直连 WiFi，已打开系统设置，请手动连接后再回来建立 TCP'
						)
				)
			}
		})
		// #endif
		// #ifndef APP-PLUS
		return Promise.reject(new Error('非 App 端'))
		// #endif
	}

	_connectWifiApp(ssid, password) {
		// #ifdef APP-PLUS
		return this.ensureWifiStarted().then(() => {
			const name = String(ssid || '').trim()
			if (!name) return Promise.reject(new Error('请填写 SSID'))
			const pwd = String(password || '')
			const sdk = this._androidSdkInt()
			if (sdk >= 29) {
				return this._connectWifiAppQ(name, pwd)
			}
			try {
				const res = this._connectWifiAppLegacy(name, pwd)
				if (typeof this._connectedHandler === 'function') {
					this._connectedHandler({ wifi: { SSID: name } })
				}
				return res
			} catch (e) {
				this._openSystemWifiSettings()
				return Promise.reject(
					e || new Error('连接失败，已打开系统 WiFi 设置，请手动连接')
				)
			}
		})
		// #endif
		// #ifndef APP-PLUS
		return Promise.reject(new Error('非 App 端'))
		// #endif
	}

	// ─── 对外 WiFi API（按端分流）───

	startWifi() {
		// #ifdef APP-PLUS
		return this._startWifiApp()
		// #endif
		// #ifndef APP-PLUS
		const api = getWxApi()
		return new Promise((resolve, reject) => {
			if (!api || typeof api.startWifi !== 'function') {
				reject(new Error('当前端不支持 WiFi API（请使用微信小程序或 Android App）'))
				return
			}
			api.startWifi({
				success: () => {
					this._wifiStarted = true
					resolve(true)
				},
				fail: (err) => reject(err || new Error('startWifi 失败')),
			})
		})
		// #endif
	}

	stopWifi() {
		// #ifdef APP-PLUS
		this._unregisterAppScanReceiver()
		this._wifiStarted = false
		return Promise.resolve(true)
		// #endif
		// #ifndef APP-PLUS
		const api = getWxApi()
		return new Promise((resolve) => {
			this.offWifiEvents()
			if (!api || typeof api.stopWifi !== 'function') {
				this._wifiStarted = false
				resolve(true)
				return
			}
			api.stopWifi({
				complete: () => {
					this._wifiStarted = false
					resolve(true)
				},
			})
		})
		// #endif
	}

	ensureWifiStarted() {
		if (this._wifiStarted) return Promise.resolve(true)
		return this.startWifi()
	}

	onGetWifiList(handler) {
		this._listHandler = typeof handler === 'function' ? handler : null
		// #ifndef APP-PLUS
		const api = getWxApi()
		if (!api || typeof api.onGetWifiList !== 'function') return
		if (this._listHandler && typeof api.offGetWifiList === 'function') {
			// 先解绑旧的再绑新的：此处 _listHandler 已是新函数，无法解绑旧引用；页面只绑一次
		}
		const wrapped = function (res) {
			handler && handler(res)
		}
		this._listHandler = wrapped
		api.onGetWifiList(wrapped)
		// #endif
	}

	onWifiConnected(handler) {
		this._connectedHandler = typeof handler === 'function' ? handler : null
		// #ifndef APP-PLUS
		const api = getWxApi()
		if (!api || typeof api.onWifiConnected !== 'function') return
		const wrapped = function (res) {
			handler && handler(res)
		}
		this._connectedHandler = wrapped
		api.onWifiConnected(wrapped)
		// #endif
	}

	offWifiEvents() {
		// #ifdef APP-PLUS
		this._unregisterAppScanReceiver()
		this._listHandler = null
		this._connectedHandler = null
		return
		// #endif
		// #ifndef APP-PLUS
		const api = getWxApi()
		if (!api) return
		if (this._listHandler && typeof api.offGetWifiList === 'function') {
			api.offGetWifiList(this._listHandler)
		}
		if (this._connectedHandler && typeof api.offWifiConnected === 'function') {
			api.offWifiConnected(this._connectedHandler)
		}
		this._listHandler = null
		this._connectedHandler = null
		// #endif
	}

	getWifiList() {
		// #ifdef APP-PLUS
		return this._getWifiListApp()
		// #endif
		// #ifndef APP-PLUS
		const api = getWxApi()
		return this.ensureWifiStarted().then(() => {
			return new Promise((resolve, reject) => {
				if (!api || typeof api.getWifiList !== 'function') {
					reject(new Error('当前端不支持 getWifiList'))
					return
				}
				api.getWifiList({
					success: (res) => resolve(res || {}),
					fail: (err) => reject(err || new Error('getWifiList 失败')),
				})
			})
		})
		// #endif
	}

	connectWifi(ssid, password, options) {
		// #ifdef APP-PLUS
		void options
		return this._connectWifiApp(ssid, password)
		// #endif
		// #ifndef APP-PLUS
		const api = getWxApi()
		const opts = options || {}
		return this.ensureWifiStarted().then(() => {
			return new Promise((resolve, reject) => {
				if (!api || typeof api.connectWifi !== 'function') {
					reject(new Error('当前端不支持 connectWifi'))
					return
				}
				const payload = {
					SSID: String(ssid || ''),
					password: String(password || ''),
				}
				if (opts.BSSID) payload.BSSID = opts.BSSID
				if (opts.maunal != null) payload.maunal = !!opts.maunal
				if (opts.partialInfo != null) payload.partialInfo = !!opts.partialInfo
				api.connectWifi({
					...payload,
					success: (res) => resolve(res || {}),
					fail: (err) => reject(err || new Error('connectWifi 失败')),
				})
			})
		})
		// #endif
	}

	getConnectedWifi() {
		// #ifdef APP-PLUS
		return this._getConnectedWifiApp()
		// #endif
		// #ifndef APP-PLUS
		const api = getWxApi()
		return this.ensureWifiStarted().then(() => {
			return new Promise((resolve, reject) => {
				if (!api || typeof api.getConnectedWifi !== 'function') {
					reject(new Error('当前端不支持 getConnectedWifi'))
					return
				}
				api.getConnectedWifi({
					success: (res) => resolve(res || {}),
					fail: (err) => reject(err || new Error('getConnectedWifi 失败')),
				})
			})
		})
		// #endif
	}

	get isTcpConnected() {
		if (this._tcp) return true
		if (this._appSocket) {
			try {
				return !!this._appSocket.isConnected()
			} catch (e) {
				return false
			}
		}
		return false
	}

	get tcpEndpoint() {
		if (!this.isTcpConnected) return ''
		return this._connectedHost + ':' + this._connectedPort
	}

	setMessageHandler(fn) {
		this._onMessage = typeof fn === 'function' ? fn : null
	}

	setCloseHandler(fn) {
		this._onClose = typeof fn === 'function' ? fn : null
	}

	setErrorHandler(fn) {
		this._onError = typeof fn === 'function' ? fn : null
	}

	connectTcp(host, port) {
		const address = String(host || '').trim()
		const p = Number(port)
		if (!address) return Promise.reject(new Error('请填写打印机 IP'))
		if (!p || p < 1 || p > 65535) return Promise.reject(new Error('端口无效'))

		return this.closeTcp().then(() => {
			// #ifdef APP-PLUS
			return this._connectTcpApp(address, p)
			// #endif
			// #ifndef APP-PLUS
			return this._connectTcpMp(address, p)
			// #endif
		})
	}

	_connectTcpMp(address, port) {
		const api = getWxApi()
		const createFn =
			(api && typeof api.createTCPSocket === 'function' && api.createTCPSocket.bind(api)) ||
			(typeof uni !== 'undefined' && typeof uni.createTCPSocket === 'function' && uni.createTCPSocket.bind(uni)) ||
			null
		if (!createFn) {
			return Promise.reject(new Error('当前端不支持 TCPSocket，请使用微信小程序或 Android App'))
		}

		return new Promise((resolve, reject) => {
			let settled = false
			const tcp = createFn()
			this._tcp = tcp
			this._connectedHost = address
			this._connectedPort = port

			const fail = (err) => {
				if (settled) return
				settled = true
				this._tcp = null
				this._connectedHost = ''
				this._connectedPort = 0
				try {
					tcp.close && tcp.close()
				} catch (e) {}
				reject(err || new Error('TCP 连接失败'))
			}

			tcp.onConnect(() => {
				if (settled) return
				settled = true
				resolve({ address, port })
			})
			tcp.onError((err) => {
				if (!settled) {
					fail(err)
					return
				}
				this._onError && this._onError(err)
			})
			tcp.onClose(() => {
				this._tcp = null
				this._connectedHost = ''
				this._connectedPort = 0
				this._onClose && this._onClose()
			})
			tcp.onMessage((res) => {
				this._onMessage && this._onMessage(res)
			})

			try {
				tcp.connect({ address, port })
			} catch (e) {
				fail(e)
			}

			setTimeout(() => {
				if (!settled) fail(new Error('TCP 连接超时'))
			}, 8000)
		})
	}

	_connectTcpApp(address, port) {
		// #ifdef APP-PLUS
		const that = this
		return new Promise((resolve, reject) => {
			try {
				const Socket = plus.android.importClass('java.net.Socket')
				const InetSocketAddress = plus.android.importClass('java.net.InetSocketAddress')
				const StrictMode = plus.android.importClass('android.os.StrictMode')
				const Build = plus.android.importClass('android.os.Build')
				if (Build.VERSION.SDK_INT > 9) {
					const policy = new StrictMode.ThreadPolicy.Builder().permitAll().build()
					StrictMode.setThreadPolicy(policy)
				}
				const socket = new Socket()
				socket.connect(new InetSocketAddress(address, port), 8000)
				socket.setKeepAlive(true)
				socket.setTcpNoDelay(true)
				const outputStream = socket.getOutputStream()
				plus.android.importClass(outputStream)
				that._appSocket = socket
				that._appOutput = outputStream
				that._connectedHost = address
				that._connectedPort = port
				resolve({ address, port })
			} catch (e) {
				that._appSocket = null
				that._appOutput = null
				that._connectedHost = ''
				that._connectedPort = 0
				reject(e || new Error('TCP 连接失败'))
			}
		})
		// #endif
		// #ifndef APP-PLUS
		return Promise.reject(new Error('非 App 端'))
		// #endif
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

	sendBuffer(buffer) {
		if (!buffer) return Promise.reject(new Error('无数据可发送'))
		if (this._tcp) {
			try {
				this._tcp.write(buffer)
				return Promise.resolve(true)
			} catch (e) {
				return Promise.reject(e || new Error('发送失败'))
			}
		}
		// #ifdef APP-PLUS
		if (this._appOutput) {
			try {
				const ab =
					buffer instanceof ArrayBuffer
						? buffer
						: buffer.buffer
							? buffer.buffer.slice(
									buffer.byteOffset || 0,
									(buffer.byteOffset || 0) + buffer.byteLength
								)
							: null
				if (!ab) return Promise.reject(new Error('数据格式无效'))
				const bytes = this._arrayBufferToJavaBytes(ab)
				const outputStream = this._appOutput
				plus.android.importClass(outputStream)
				outputStream.write(bytes)
				outputStream.flush()
				return Promise.resolve(true)
			} catch (e) {
				return Promise.reject(e || new Error('发送失败'))
			}
		}
		// #endif
		return Promise.reject(new Error('尚未建立 TCP 连接'))
	}

	sendText(text, encoding) {
		const buf = textToBuffer(text, encoding)
		return this.sendBuffer(buf).then(() => buf)
	}

	closeTcp() {
		return new Promise((resolve) => {
			const tcp = this._tcp
			this._tcp = null
			if (tcp) {
				try {
					tcp.close && tcp.close()
				} catch (e) {}
			}
			// #ifdef APP-PLUS
			try {
				if (this._appNetworkCallback) {
					const main = this._getMainActivity()
					const Context = plus.android.importClass('android.content.Context')
					const cm = main.getSystemService(Context.CONNECTIVITY_SERVICE)
					plus.android.importClass(cm)
					cm.unregisterNetworkCallback(this._appNetworkCallback)
					plus.android.invoke(cm, 'bindProcessToNetwork', null)
				}
			} catch (e) {}
			this._appNetworkCallback = null
			const socket = this._appSocket
			this._appSocket = null
			this._appOutput = null
			if (socket) {
				try {
					plus.android.importClass(socket)
					socket.close()
				} catch (e) {}
			}
			// #endif
			this._connectedHost = ''
			this._connectedPort = 0
			resolve(true)
		})
	}

	destroy() {
		this.offWifiEvents()
		this._onMessage = null
		this._onClose = null
		this._onError = null
		return Promise.all([this.closeTcp(), this.stopWifi()])
	}
}

export function createWifiTool() {
	return new WifiTool()
}

export default {
	createWifiTool,
	textToBuffer,
	bufferToHexPreview,
	isAppPlus,
}
