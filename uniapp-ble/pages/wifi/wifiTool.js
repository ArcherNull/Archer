/**
 * WiFi 连接 + TCP 数据传输工具
 * - 小程序：wx WiFi API + createTCPSocket
 * - App(Android)：plus.android Socket
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
	return false
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
	}

	startWifi() {
		const api = getWxApi()
		return new Promise((resolve, reject) => {
			if (!api || typeof api.startWifi !== 'function') {
				reject(new Error('当前端不支持 WiFi API'))
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
	}

	stopWifi() {
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
	}

	ensureWifiStarted() {
		if (this._wifiStarted) return Promise.resolve(true)
		return this.startWifi()
	}

	onGetWifiList(handler) {
		const api = getWxApi()
		if (!api || typeof api.onGetWifiList !== 'function') return
		if (this._listHandler && typeof api.offGetWifiList === 'function') {
			api.offGetWifiList(this._listHandler)
		}
		this._listHandler = function (res) {
			handler && handler(res)
		}
		api.onGetWifiList(this._listHandler)
	}

	onWifiConnected(handler) {
		const api = getWxApi()
		if (!api || typeof api.onWifiConnected !== 'function') return
		if (this._connectedHandler && typeof api.offWifiConnected === 'function') {
			api.offWifiConnected(this._connectedHandler)
		}
		this._connectedHandler = function (res) {
			handler && handler(res)
		}
		api.onWifiConnected(this._connectedHandler)
	}

	offWifiEvents() {
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
	}

	getWifiList() {
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
	}

	connectWifi(ssid, password, options) {
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
	}

	getConnectedWifi() {
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
			if (isAppPlus()) {
				return this._connectTcpApp(address, p)
			}
			return this._connectTcpMp(address, p)
		})
	}

	_connectTcpMp(address, port) {
		const api = getWxApi()
		const createFn =
			(api && typeof api.createTCPSocket === 'function' && api.createTCPSocket.bind(api)) ||
			(typeof uni !== 'undefined' && typeof uni.createTCPSocket === 'function' && uni.createTCPSocket.bind(uni)) ||
			null
		if (!createFn) {
			return Promise.reject(new Error('当前端不支持 TCPSocket，请使用微信小程序或 App'))
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
		return new Promise((resolve, reject) => {
			try {
				const Socket = plus.android.importClass('java.net.Socket')
				const StrictMode = plus.android.importClass('android.os.StrictMode')
				const Build = plus.android.importClass('android.os.Build')
				if (Build.VERSION.SDK_INT > 9) {
					const policy = new StrictMode.ThreadPolicy.Builder().permitAll().build()
					StrictMode.setThreadPolicy(policy)
				}
				const socket = new Socket(address, port)
				socket.setKeepAlive(true)
				const outputStream = socket.getOutputStream()
				plus.android.importClass(outputStream)
				this._appSocket = socket
				this._appOutput = outputStream
				this._connectedHost = address
				this._connectedPort = port
				resolve({ address, port })
			} catch (e) {
				this._appSocket = null
				this._appOutput = null
				this._connectedHost = ''
				this._connectedPort = 0
				reject(e || new Error('TCP 连接失败'))
			}
		})
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
		if (this._appOutput) {
			try {
				const u8 = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer)
				const BufferedOutputStream = plus.android.importClass('java.io.BufferedOutputStream')
				const bos = new BufferedOutputStream(this._appOutput)
				for (let i = 0; i < u8.length; i++) {
					bos.write(u8[i] & 0xff)
				}
				bos.flush()
				return Promise.resolve(true)
			} catch (e) {
				return Promise.reject(e || new Error('发送失败'))
			}
		}
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
			const socket = this._appSocket
			this._appSocket = null
			this._appOutput = null
			if (socket) {
				try {
					plus.android.importClass(socket)
					socket.close()
				} catch (e) {}
			}
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
}
