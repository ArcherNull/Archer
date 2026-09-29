<template>
	<view class="page">
		<view class="section">
			<view class="section-title">WiFi 连接</view>
			<!-- #ifdef APP-PLUS -->
			<view class="section-desc">Android App：扫网需定位权限；Android 10+ 连接热点会弹出系统确认框。连上同一局域网后可用下方 TCP 发指令。</view>
			<!-- #endif -->
			<!-- #ifndef APP-PLUS -->
			<view class="section-desc">填写打印机热点或局域网 SSID / 密码后连接（微信小程序 WiFi API）</view>
			<!-- #endif -->

			<view class="field">
				<text class="field-label">SSID</text>
				<input
					class="field-input"
					v-model="ssid"
					placeholder="请输入 WiFi 名称"
					placeholder-class="ph"
				/>
			</view>
			<view class="field">
				<text class="field-label">密码</text>
				<input
					class="field-input"
					v-model="password"
					:password="!showPassword"
					placeholder="无密码可留空"
					placeholder-class="ph"
				/>
				<text class="field-eye" @click="toggleShowPassword">{{ showPassword ? '隐藏' : '显示' }}</text>
			</view>

			<view class="row-btns">
				<button class="btn btn--ghost" :loading="wifiBusy" :disabled="wifiBusy" @click="onRefreshWifiList">扫描列表</button>
				<button class="btn btn--primary" :loading="wifiBusy" :disabled="wifiBusy || !ssid" @click="onConnectWifi">连接 WiFi</button>
			</view>
			<button class="btn btn--block" :loading="wifiBusy" :disabled="wifiBusy" @click="onGetConnectedWifi">读取当前已连 WiFi</button>
			<!-- #ifdef APP-PLUS -->
			<button class="btn btn--block" :disabled="wifiBusy" @click="onOpenSystemWifi">打开系统 WiFi 设置</button>
			<!-- #endif -->

			<view v-if="connectedWifiText" class="status-box">
				<text class="status-label">当前连接</text>
				<text class="status-value" selectable user-select>{{ connectedWifiText }}</text>
			</view>
		</view>

		<view class="section">
			<view class="section-head">
				<view class="section-title">附近 WiFi</view>
				<text class="section-hint">{{ wifiListHint }}</text>
			</view>
			<scroll-view class="wifi-list" scroll-y>
				<view
					v-for="item in wifiList"
					:key="item._key"
					class="wifi-item"
					:class="{ 'wifi-item--on': item.SSID === ssid }"
					@click="onPickWifi(item)"
				>
					<view class="wifi-item-main">
						<text class="wifi-item-ssid">{{ item.displayName }}</text>
						<text class="wifi-item-meta">{{ item.metaText }}</text>
					</view>
					<text class="wifi-item-pick">选用</text>
				</view>
				<!-- #ifdef APP-PLUS -->
				<view v-if="!wifiList.length" class="empty">暂无列表：请允许定位权限并打开定位开关后再扫描</view>
				<!-- #endif -->
				<!-- #ifndef APP-PLUS -->
				<view v-if="!wifiList.length" class="empty">暂无列表，请先扫描（Android 需定位权限）</view>
				<!-- #endif -->
			</scroll-view>
		</view>

		<view class="section">
			<view class="section-title">TCP 数据传输</view>
			<view class="section-desc">连上同一局域网后，向打印机 IP:端口发送指令（常用 9100）</view>

			<view class="field">
				<text class="field-label">IP</text>
				<input
					class="field-input"
					v-model="host"
					placeholder="如 192.168.1.100"
					placeholder-class="ph"
				/>
			</view>
			<view class="field">
				<text class="field-label">端口</text>
				<input
					class="field-input"
					v-model="port"
					type="number"
					placeholder="9100"
					placeholder-class="ph"
				/>
			</view>

			<view class="row-btns">
				<button class="btn btn--primary" :loading="tcpBusy" :disabled="tcpBusy || tcpConnected" @click="onConnectTcp">建立 TCP</button>
				<button class="btn btn--ghost" :disabled="!tcpConnected" @click="onCloseTcp">断开</button>
			</view>
			<view class="status-box">
				<text class="status-label">TCP 状态</text>
				<text class="status-value">{{ tcpStatusText }}</text>
			</view>

			<view class="field field--col">
				<view class="field-top">
					<text class="field-label">发送内容</text>
					<view class="enc-tabs">
						<text
							:class="['enc-tab', encoding === 'gbk' ? 'enc-tab--on' : '']"
							@click="setEncoding('gbk')"
						>GBK</text>
						<text
							:class="['enc-tab', encoding === 'utf8' ? 'enc-tab--on' : '']"
							@click="setEncoding('utf8')"
						>UTF-8</text>
					</view>
				</view>
				<textarea
					class="field-textarea"
					v-model="payload"
					maxlength="10000"
					placeholder="输入要发送的文本 / CPCL 指令"
					placeholder-class="ph"
				/>
			</view>

			<view class="row-btns">
				<button class="btn btn--ghost" @click="fillTestCpcl">填入测试指令</button>
				<button
					class="btn btn--primary"
					:loading="sendBusy"
					:disabled="sendBusy || !tcpConnected || !payload"
					@click="onSend"
				>发送数据</button>
			</view>
		</view>

		<view class="section section--log">
			<view class="section-head">
				<view class="section-title">日志</view>
				<text class="section-hint" @click="clearLogs">清空</text>
			</view>
			<scroll-view class="log-box" scroll-y :scroll-top="logScrollTop">
				<text v-for="(line, i) in logs" :key="i" class="log-line">{{ line }}</text>
				<text v-if="!logs.length" class="empty">暂无日志</text>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import { showMsg } from '../print/comm/utils.js'
	import { createWifiTool, bufferToHexPreview } from './wifiTool.js'

	const STORAGE_KEY = 'wifi_debug_form_v1'

	const TEST_CPCL = [
		'! 0 200 200 240 1',
		'PAGE-WIDTH 400',
		'TEXT 4 0 24 40 WiFi TCP OK',
		'TEXT 4 0 24 100 Archer Print Test',
		'PRINT',
		'',
	].join('\n')

	export default {
		data() {
			return {
				tool: null,
				ssid: '',
				password: '',
				showPassword: false,
				wifiList: [],
				wifiBusy: false,
				connectedWifiText: '',
				host: '192.168.1.100',
				port: '9100',
				tcpConnected: false,
				tcpEndpoint: '',
				tcpBusy: false,
				sendBusy: false,
				encoding: 'gbk',
				payload: '',
				logs: [],
				logScrollTop: 0,
			}
		},
		computed: {
			wifiListHint() {
				const n = this.wifiList.length
				return n ? ('共 ' + n + ' 个') : '点击扫描获取'
			},
			tcpStatusText() {
				return this.tcpConnected ? ('已连接 ' + this.tcpEndpoint) : '未连接'
			},
		},
		onLoad() {
			this.tool = createWifiTool()
			this.restoreForm()
			this.bindWifiEvents()
			this.tool
				.startWifi()
				.then(() => {
					// #ifdef APP-PLUS
					this.pushLog('WiFi 模块已启动（Android App / WifiManager）')
					// #endif
					// #ifndef APP-PLUS
					this.pushLog('WiFi 模块已启动')
					// #endif
				})
				.catch((err) => this.pushLog('启动 WiFi 失败: ' + this.errText(err)))
		},
		onUnload() {
			if (this.tool) {
				this.tool.destroy()
				this.tool = null
			}
			this.saveForm()
		},
		onHide() {
			this.saveForm()
		},
		methods: {
			errText(err) {
				if (!err) return 'unknown'
				if (typeof err === 'string') return err
				return err.errMsg || err.message || JSON.stringify(err)
			},
			toggleShowPassword() {
				this.showPassword = !this.showPassword
			},
			setEncoding(enc) {
				this.encoding = enc === 'utf8' ? 'utf8' : 'gbk'
			},
			normalizeWifiList(list) {
				const arr = Array.isArray(list) ? list : []
				return arr
					.slice()
					.sort(function (a, b) {
						return (Number(b.signalStrength) || 0) - (Number(a.signalStrength) || 0)
					})
					.map(function (item, index) {
						const ssid = (item && item.SSID) || ''
						const bssid = (item && item.BSSID) || ''
						const signal = item && item.signalStrength != null ? item.signalStrength : '-'
						const secureText = item && item.secure ? '加密' : '开放'
						return Object.assign({}, item, {
							_key: (bssid || ssid || 'wifi') + '-' + index,
							displayName: ssid || '(隐藏网络)',
							metaText: '信号 ' + signal + ' · 安全 ' + secureText,
						})
					})
			},
			pushLog(msg) {
				const time = new Date()
				const hh = ('0' + time.getHours()).slice(-2)
				const mm = ('0' + time.getMinutes()).slice(-2)
				const ss = ('0' + time.getSeconds()).slice(-2)
				const line = '[' + hh + ':' + mm + ':' + ss + '] ' + msg
				this.logs = this.logs.concat([line]).slice(-200)
				this.$nextTick(() => {
					this.logScrollTop = this.logs.length * 40
				})
			},
			clearLogs() {
				this.logs = []
			},
			saveForm() {
				try {
					uni.setStorageSync(STORAGE_KEY, {
						ssid: this.ssid,
						password: this.password,
						host: this.host,
						port: this.port,
						encoding: this.encoding,
						payload: this.payload,
					})
				} catch (e) {}
			},
			restoreForm() {
				try {
					const data = uni.getStorageSync(STORAGE_KEY)
					if (!data || typeof data !== 'object') return
					if (data.ssid != null) this.ssid = String(data.ssid)
					if (data.password != null) this.password = String(data.password)
					if (data.host) this.host = String(data.host)
					if (data.port) this.port = String(data.port)
					if (data.encoding) this.encoding = data.encoding === 'utf8' ? 'utf8' : 'gbk'
					if (data.payload != null) this.payload = String(data.payload)
				} catch (e) {}
			},
			bindWifiEvents() {
				const tool = this.tool
				if (!tool) return
				tool.onGetWifiList((res) => {
					const list = this.normalizeWifiList((res && res.wifiList) || [])
					this.wifiList = list
					this.pushLog('收到 WiFi 列表: ' + list.length + ' 个')
				})
				tool.onWifiConnected((res) => {
					const wifi = (res && res.wifi) || {}
					this.connectedWifiText = this.formatWifi(wifi)
					this.pushLog('WiFi 已连接: ' + (wifi.SSID || ''))
					showMsg('WiFi 已连接', 'success')
				})
				tool.setMessageHandler((res) => {
					const buf = (res && res.message) || null
					this.pushLog('收到数据: ' + bufferToHexPreview(buf))
				})
				tool.setCloseHandler(() => {
					this.tcpConnected = false
					this.tcpEndpoint = ''
					this.pushLog('TCP 已断开')
				})
				tool.setErrorHandler((err) => {
					this.pushLog('TCP 错误: ' + this.errText(err))
				})
			},
			formatWifi(wifi) {
				if (!wifi || !wifi.SSID) return ''
				const parts = [wifi.SSID]
				if (wifi.BSSID) parts.push('BSSID ' + wifi.BSSID)
				if (wifi.signalStrength != null) parts.push('信号 ' + wifi.signalStrength)
				return parts.join(' · ')
			},
			async ensureLocationAuth() {
				// #ifdef MP-WEIXIN
				try {
					const setting = await new Promise((resolve, reject) => {
						uni.getSetting({
							success: resolve,
							fail: reject,
						})
					})
					const ok = setting && setting.authSetting && setting.authSetting['scope.userLocation']
					if (ok) return true
					await new Promise((resolve, reject) => {
						uni.authorize({
							scope: 'scope.userLocation',
							success: resolve,
							fail: reject,
						})
					})
					return true
				} catch (e) {
					this.pushLog('定位权限未授权，Android 扫网可能失败')
					return false
				}
				// #endif
				// #ifdef APP-PLUS
				return this.ensureAppLocationPermission()
				// #endif
				// #ifndef MP-WEIXIN || APP-PLUS
				return true
				// #endif
			},
			/** Android App：扫网需要定位权限 + 系统定位开关（Android 13+ 另需附近设备） */
			ensureAppLocationPermission() {
				// #ifdef APP-PLUS
				const that = this
				return new Promise((resolve) => {
					try {
						const main = plus.android.runtimeMainActivity()
						let sdk = 0
						try {
							const VERSION = plus.android.importClass('android.os.Build$VERSION')
							sdk = Number(VERSION && VERSION.SDK_INT) || 0
						} catch (e) {}

						const permissions = [
							'android.permission.ACCESS_FINE_LOCATION',
							'android.permission.ACCESS_COARSE_LOCATION',
						]
						// Android 13+：附近 WiFi 设备权限（与定位配合使用更稳）
						if (sdk >= 33) {
							permissions.push('android.permission.NEARBY_WIFI_DEVICES')
						}

						const isGranted = (p) => {
							try {
								return Number(plus.android.invoke(main, 'checkSelfPermission', p)) === 0
							} catch (e) {
								return false
							}
						}
						const missing = permissions.filter((p) => !isGranted(p))

						const finishCheckLocationService = () => {
							// 扫网结果为空的最常见原因：定位开关关闭
							try {
								const Context = plus.android.importClass('android.content.Context')
								const LocationManager = plus.android.importClass('android.location.LocationManager')
								const SettingsSecure = plus.android.importClass('android.provider.Settings$Secure')
								const lm = main.getSystemService(Context.LOCATION_SERVICE)
								plus.android.importClass(lm)
								let enabled = false
								try {
									if (typeof lm.isLocationEnabled === 'function') {
										enabled = !!lm.isLocationEnabled()
									}
								} catch (e) {}
								if (!enabled) {
									try {
										enabled = !!(
											lm.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
											lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
										)
									} catch (e) {}
								}
								if (!enabled) {
									try {
										const mode = Number(
											SettingsSecure.getInt(main.getContentResolver(), SettingsSecure.LOCATION_MODE)
										)
										enabled = mode > 0
									} catch (e) {}
								}
								if (!enabled) {
									that.pushLog('定位服务未开启：Android 规定未开定位时 getScanResults 恒为空')
									showMsg('请打开手机定位开关')
									try {
										const Intent = plus.android.importClass('android.content.Intent')
										const Settings = plus.android.importClass('android.provider.Settings')
										main.startActivity(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS))
									} catch (e) {}
									resolve(false)
									return
								}
							} catch (e) {
								that.pushLog('定位开关检查异常: ' + that.errText(e))
							}
							// 再确认细粒度定位已授权
							if (!isGranted('android.permission.ACCESS_FINE_LOCATION') && sdk >= 29) {
								that.pushLog('需要「精确位置」权限才能扫描 WiFi')
								showMsg('请允许精确位置权限')
								resolve(false)
								return
							}
							resolve(true)
						}

						if (!missing.length) {
							finishCheckLocationService()
							return
						}
						that.pushLog('申请权限: ' + missing.join(', '))
						plus.android.requestPermissions(
							missing,
							(result) => {
								const stillMissing = missing.filter((p) => !isGranted(p))
								if (stillMissing.length) {
									that.pushLog('权限未授予: ' + stillMissing.join(', '))
									showMsg('请允许定位/附近设备权限')
									resolve(false)
									return
								}
								void result
								finishCheckLocationService()
							},
							(err) => {
								that.pushLog('申请权限失败: ' + that.errText(err))
								resolve(false)
							}
						)
					} catch (e) {
						that.pushLog('定位权限检查异常: ' + that.errText(e))
						resolve(true)
					}
				})
				// #endif
				// #ifndef APP-PLUS
				return Promise.resolve(true)
				// #endif
			},
			onOpenSystemWifi() {
				// #ifdef APP-PLUS
				try {
					if (this.tool && this.tool.openSystemWifiSettings) {
						this.tool.openSystemWifiSettings()
					}
					this.pushLog('已打开系统 WiFi 设置')
				} catch (e) {
					this.pushLog('打开系统 WiFi 设置失败: ' + this.errText(e))
				}
				// #endif
			},
			async onRefreshWifiList() {
				if (!this.tool || this.wifiBusy) return
				this.wifiBusy = true
				try {
					const ok = await this.ensureLocationAuth()
					if (!ok) {
						// #ifdef APP-PLUS
						showMsg('需要定位权限才能扫描')
						// #endif
						return
					}
					// #ifdef APP-PLUS
					this.pushLog('开始扫描附近 WiFi…')
					showMsg('扫描中…')
					// #endif
					const res = await this.tool.getWifiList()
					// App 端 getWifiList 已同步返回列表；小程序多走 onGetWifiList 回调
					// #ifdef APP-PLUS
					const list = this.normalizeWifiList((res && res.wifiList) || [])
					this.wifiList = list
					this.pushLog('WiFi 列表: ' + list.length + ' 个')
					if (list.length) {
						showMsg('找到 ' + list.length + ' 个')
					} else {
						showMsg('未扫到 WiFi')
						this.pushLog(
							'仍为空时请确认：1)手机定位开关已开 2)已允许精确位置 3)WiFi 开关已开 4)到系统 WiFi 页先搜一次再回 App'
						)
					}
					// #endif
					// #ifndef APP-PLUS
					this.pushLog('已请求 WiFi 列表（iOS 可能跳转系统设置）')
					showMsg('正在获取列表')
					// #endif
				} catch (e) {
					this.pushLog('扫描失败: ' + this.errText(e))
					showMsg('扫描失败')
				} finally {
					this.wifiBusy = false
				}
			},
			onPickWifi(item) {
				if (!item) return
				this.ssid = item.SSID || ''
				this.pushLog('已选用 SSID: ' + this.ssid)
			},
			async onConnectWifi() {
				if (!this.tool || this.wifiBusy) return
				const ssid = String(this.ssid || '').trim()
				if (!ssid) {
					showMsg('请填写 SSID')
					return
				}
				this.wifiBusy = true
				this.saveForm()
				try {
					// #ifdef APP-PLUS
					this.pushLog('正在连接: ' + ssid + '（Android 10+ 请在系统弹窗中确认）')
					showMsg('请在系统弹窗确认…')
					// #endif
					await this.tool.connectWifi(ssid, this.password)
					this.pushLog('已发起连接: ' + ssid)
					showMsg('正在连接…')
				} catch (e) {
					this.pushLog('连接失败: ' + this.errText(e))
					showMsg('连接失败')
				} finally {
					this.wifiBusy = false
				}
			},
			async onGetConnectedWifi() {
				if (!this.tool || this.wifiBusy) return
				this.wifiBusy = true
				try {
					const res = await this.tool.getConnectedWifi()
					const wifi = (res && res.wifi) || {}
					this.connectedWifiText = this.formatWifi(wifi) || '无'
					if (wifi.SSID) this.ssid = wifi.SSID
					this.pushLog('当前 WiFi: ' + (this.connectedWifiText || '无'))
				} catch (e) {
					this.connectedWifiText = ''
					this.pushLog('读取失败: ' + this.errText(e))
					showMsg('读取失败')
				} finally {
					this.wifiBusy = false
				}
			},
			async onConnectTcp() {
				if (!this.tool || this.tcpBusy) return
				this.tcpBusy = true
				this.saveForm()
				try {
					const endpoint = await this.tool.connectTcp(this.host, this.port)
					this.tcpConnected = true
					this.tcpEndpoint = endpoint.address + ':' + endpoint.port
					this.pushLog('TCP 已连接 ' + this.tcpEndpoint)
					showMsg('TCP 已连接', 'success')
				} catch (e) {
					this.tcpConnected = false
					this.tcpEndpoint = ''
					this.pushLog('TCP 连接失败: ' + this.errText(e))
					showMsg('TCP 连接失败')
				} finally {
					this.tcpBusy = false
				}
			},
			async onCloseTcp() {
				if (!this.tool) return
				await this.tool.closeTcp()
				this.tcpConnected = false
				this.tcpEndpoint = ''
				this.pushLog('已主动断开 TCP')
			},
			fillTestCpcl() {
				this.payload = TEST_CPCL
				this.encoding = 'gbk'
				this.pushLog('已填入 CPCL 测试指令')
			},
			async onSend() {
				if (!this.tool || this.sendBusy || !this.tcpConnected) return
				const text = String(this.payload || '')
				if (!text) {
					showMsg('请填写发送内容')
					return
				}
				this.sendBusy = true
				this.saveForm()
				try {
					const buf = await this.tool.sendText(text, this.encoding)
					this.pushLog('已发送(' + this.encoding + '): ' + bufferToHexPreview(buf))
					showMsg('发送成功', 'success')
				} catch (e) {
					this.pushLog('发送失败: ' + this.errText(e))
					showMsg('发送失败')
				} finally {
					this.sendBusy = false
				}
			},
		},
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		padding: 24rpx 24rpx 48rpx;
		background: #faf6f0;
		box-sizing: border-box;
	}

	.section {
		margin-bottom: 24rpx;
		padding: 28rpx 24rpx;
		border-radius: 20rpx;
		background: #fff;
		box-shadow: 0 8rpx 24rpx rgba(44, 44, 44, 0.04);
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #2c2c2c;
	}

	.section-desc {
		margin-top: 10rpx;
		font-size: 24rpx;
		line-height: 1.5;
		color: #8a7a64;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-hint {
		font-size: 24rpx;
		color: #8a7a64;
	}

	.field {
		margin-top: 20rpx;
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		min-height: 80rpx;
		border-radius: 12rpx;
		background: #faf6f0;
	}

	.field--col {
		flex-direction: column;
		align-items: stretch;
		padding: 16rpx 20rpx 20rpx;
	}

	.field-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12rpx;
	}

	.field-label {
		width: 120rpx;
		flex-shrink: 0;
		font-size: 28rpx;
		color: #5c5346;
	}

	.field-input {
		flex: 1;
		height: 80rpx;
		font-size: 28rpx;
		color: #2c2c2c;
	}

	.field-eye {
		margin-left: 12rpx;
		font-size: 24rpx;
		color: #f9ae3d;
	}

	.field-textarea {
		width: 100%;
		min-height: 220rpx;
		font-size: 26rpx;
		line-height: 1.5;
		color: #2c2c2c;
	}

	.ph {
		color: #b5a894;
	}

	.row-btns {
		margin-top: 20rpx;
		display: flex;
		gap: 16rpx;
	}

	.btn {
		flex: 1;
		margin: 0;
		height: 76rpx;
		line-height: 76rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		border: none;
	}

	.btn::after {
		border: none;
	}

	.btn--primary {
		background: #f9ae3d;
		color: #fff;
	}

	.btn--ghost {
		background: #f3ebe0;
		color: #5c5346;
	}

	.btn--block {
		margin-top: 16rpx;
		width: 100%;
		background: #f3ebe0;
		color: #5c5346;
	}

	.btn[disabled] {
		opacity: 0.55;
	}

	.status-box {
		margin-top: 20rpx;
		padding: 16rpx 20rpx;
		border-radius: 12rpx;
		background: #fff8ec;
	}

	.status-label {
		display: block;
		font-size: 22rpx;
		color: #8a7a64;
	}

	.status-value {
		display: block;
		margin-top: 6rpx;
		font-size: 26rpx;
		color: #2c2c2c;
		word-break: break-all;
	}

	.wifi-list {
		margin-top: 16rpx;
		max-height: 360rpx;
	}

	.wifi-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18rpx 8rpx;
		border-bottom: 1rpx solid #f0e8dc;
	}

	.wifi-item--on {
		background: #fff8ec;
		margin: 0 -8rpx;
		padding-left: 16rpx;
		padding-right: 16rpx;
		border-radius: 10rpx;
	}

	.wifi-item-main {
		flex: 1;
		min-width: 0;
	}

	.wifi-item-ssid {
		display: block;
		font-size: 28rpx;
		color: #2c2c2c;
	}

	.wifi-item-meta {
		display: block;
		margin-top: 6rpx;
		font-size: 22rpx;
		color: #8a7a64;
	}

	.wifi-item-pick {
		margin-left: 16rpx;
		font-size: 24rpx;
		color: #f9ae3d;
	}

	.empty {
		padding: 24rpx 8rpx;
		font-size: 24rpx;
		color: #b5a894;
	}

	.enc-tabs {
		display: flex;
		gap: 8rpx;
	}

	.enc-tab {
		padding: 6rpx 16rpx;
		border-radius: 999rpx;
		font-size: 22rpx;
		color: #8a7a64;
		background: #f3ebe0;
	}

	.enc-tab--on {
		color: #fff;
		background: #f9ae3d;
	}

	.section--log .log-box {
		margin-top: 16rpx;
		max-height: 360rpx;
		padding: 12rpx 8rpx;
		border-radius: 12rpx;
		background: #2c2c2c;
	}

	.log-line {
		display: block;
		font-size: 22rpx;
		line-height: 1.55;
		color: #f3ebe0;
		word-break: break-all;
	}
</style>
