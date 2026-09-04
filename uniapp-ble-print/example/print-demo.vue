<template>
	<view class="page">
		<view class="status-bar">
			<text class="status-text">{{ statusText }}</text>
			<text v-if="connected" class="status-dot ok" />
			<text v-else class="status-dot" />
		</view>

		<view class="btn-row">
			<button type="primary" size="mini" :loading="scanning" @tap="handleScan">
				{{ scanning ? '扫描中...' : '扫描打印机' }}
			</button>
			<button type="warn" size="mini" :disabled="!connected" @tap="handleDisconnect">断开</button>
		</view>

		<view v-if="progress > 0 && progress < 100" class="progress">
			<progress :percent="progress" show-info stroke-width="4" />
		</view>

		<view class="device-list">
			<view v-for="item in devices" :key="item.deviceId" class="device-item"
				:class="{ active: item.deviceId === currentId }" @tap="handleConnect(item)">
				<view class="device-main">
					<text class="device-name">{{ item.name }}</text>
					<text class="device-rssi">信号 {{ item.RSSI }}dBm</text>
				</view>
				<text class="device-id">{{ item.deviceId }}</text>
			</view>
			<view v-if="!devices.length && !scanning" class="empty">暂无设备,点击上方按钮扫描</view>
		</view>

		<view class="btn-row">
			<button size="mini" :disabled="!connected" @tap="printTest">打印自检页</button>
			<button size="mini" :disabled="!connected" @tap="printReceipt">打印小票</button>
			<button size="mini" :disabled="!connected" @tap="printWithQr">含二维码</button>
		</view>

		<scroll-view class="log" scroll-y>
			<text v-for="(l, i) in logs" :key="i" class="log-line">{{ l }}</text>
		</scroll-view>
	</view>
</template>

<script>
import BlePrinter from '@/utils/ble-print/ble-adapter.js';
import { EscPosBuilder, buildReceipt } from '@/utils/ble-print/escpos.js';

const CACHE_KEY = 'last_printer';

export default {
	data() {
		return {
			printer: null,
			devices: [],
			currentId: '',
			connected: false,
			scanning: false,
			progress: 0,
			statusText: '未连接',
			logs: [],
		};
	},
	onLoad() {
		this.printer = new BlePrinter({
			debug: true,
			mtu: 256,
			chunkDelay: 25,
		});

		// 断连自动清理状态,避免"假连接"导致后续写入全部失败
		this.printer.onDisconnect = () => {
			this.connected = false;
			this.statusText = '连接已断开';
			this.log('打印机断连');
		};

		// 上次连过的设备一键重连,省去每次扫描
		const cached = uni.getStorageSync(CACHE_KEY);
		if (cached) {
			this.currentId = cached;
			this.statusText = '正在重连上次打印机...';
			this.reconnect(cached);
		}
	},
	onUnload() {
		this.printer && this.printer.close();
	},
	methods: {
		log(msg) {
			const t = new Date().toTimeString().slice(0, 8);
			this.logs.unshift(`${t} ${msg}`);
			if (this.logs.length > 60) this.logs.pop();
		},

		async handleScan() {
			this.scanning = true;
			this.devices = [];
			this.statusText = '扫描中...';
			try {
				const list = await this.printer.startScan(
					(d) => {
						// 实时追加,用户体验比等 8 秒后一次性出现好
						if (!this.devices.find((x) => x.deviceId === d.deviceId)) {
							this.devices.push(d);
						}
					},
					{
						duration: 8000,
						// 只想看到打印机时,可按名称过滤,减少 30+ 个干扰设备
						// filter: (d) => /Printer|Printer_|POS|GP-|XP-|TSPL/i.test(d.name || '')
					}
				);
				this.devices = list;
				this.statusText = list.length ? `发现 ${list.length} 个设备` : '未发现设备';
				this.log(`扫描完成,共 ${list.length} 个`);
			} catch (e) {
				this.statusText = '扫描失败';
				uni.showToast({ title: e.message, icon: 'none' });
				this.log('扫描失败:' + e.message);
			} finally {
				this.scanning = false;
			}
		},

		async handleConnect(item) {
			uni.showLoading({ title: '连接中' });
			this.statusText = `连接 ${item.name}...`;
			try {
				await this.connectDevice(item.deviceId);
				uni.setStorageSync(CACHE_KEY, item.deviceId);
			} finally {
				uni.hideLoading();
			}
		},

		async reconnect(deviceId) {
			try {
				await this.connectDevice(deviceId);
			} catch (e) {
				this.statusText = '重连失败,请手动扫描';
				this.log('重连失败:' + e.message);
			}
		},

		async connectDevice(deviceId) {
			const info = await this.printer.connect(deviceId, { timeout: 12000 });
			this.currentId = deviceId;
			this.connected = true;
			this.statusText = `已连接 (MTU ${info.mtu})`;
			this.log(`连接成功 service=${info.serviceId} char=${info.characteristicId} mtu=${info.mtu}`);
			return info;
		},

		async handleDisconnect() {
			await this.printer.disconnect();
			this.connected = false;
			this.statusText = '已断开';
			uni.removeStorageSync(CACHE_KEY);
		},

		/** 自检页:先打这个确认通道通不通,再调业务内容 */
		async printTest() {
			const cmd = new EscPosBuilder({ paperWidth: 58 })
				.init()
				.alignCenter()
				.bold(true)
				.size(1, 1)
				.line('打印自检')
				.size(0, 0)
				.bold(false)
				.alignLeft()
				.divider()
				.line('连接通道:正常')
				.line(`MTU:${this.printer.actualMtu} 分包:${this.printer.chunkSize}B`)
				.line(`服务:${this.printer.serviceId.slice(0, 8)}...`)
				.line(`特征:${this.printer.characteristicId.slice(0, 8)}...`)
				.divider()
				.alignCenter()
				.barcode('TEST123456', { type: 'CODE128', height: 60 })
				.feed(2)
				.cut();
			await this.send(cmd);
		},

		async printReceipt() {
			const cmd = buildReceipt(
				{
					items: [
						{ name: '冰镇可乐', qty: 2, price: 3.5 },
						{ name: '奥尔良鸡腿堡', qty: 1, price: 18.0 },
						{ name: '香辣鸡翅(中份)', qty: 1, price: 12.0 },
					],
					total: 37.0,
					no: 'NO.20260901000123',
					time: '2026-09-01 12:30:45',
				},
				{ shopName: '元宝便利店(示范店)', paperWidth: 58 }
			);
			await this.send(cmd);
		},

		async printWithQr() {
			const cmd = new EscPosBuilder({ paperWidth: 58 })
				.init()
				.alignCenter()
				.size(1, 1)
				.line('取餐凭证')
				.size(0, 0)
				.alignLeft()
				.divider()
				.row('取餐号', 'A018')
				.row('门店', '南宁万象城店')
				.divider()
				.alignCenter()
				.line('请出示二维码取餐')
				.qrcode('https://example.com/order/A018', { size: 10, ecl: 'M' })
				.feed(2)
				.cut();
			await this.send(cmd);
		},

		async send(builder) {
			this.progress = 1;
			uni.showLoading({ title: '打印中' });
			try {
				await this.printer.print(builder, {
					onProgress: (p) => (this.progress = p),
				});
				this.log('打印完成');
				uni.showToast({ title: '已发送', icon: 'success' });
			} catch (e) {
				this.log('打印失败:' + e.message + ` (code=${e.errCode || '-'})`);
				this.handlePrintError(e);
			} finally {
				uni.hideLoading();
				setTimeout(() => (this.progress = 0), 500);
			}
		},

		/** 常见故障的自动兜底 */
		async handlePrintError(e) {
			// 10008:MTU/分包问题,降低分包大小重试一次
			if (e.errCode === 10008) {
				this.log('检测到 10008,尝试改用 20 字节小包重发');
				try {
					await this.printer.write(this.printer._lastData || [], { chunk: 20, delay: 40 });
					uni.showToast({ title: '小包重试成功', icon: 'success' });
					return;
				} catch (_) { /* 落到下面统一提示 */ }
			}
			// 10007/10005:特征值选错了,换下一个候选
			if ((e.errCode === 10007 || e.errCode === 10005) && this.printer.useNextCandidate()) {
				uni.showModal({ title: '提示', content: '已切换写入通道,请重试打印', showCancel: false });
				return;
			}
			uni.showModal({ title: '打印失败', content: e.message, showCancel: false });
		},
	},
};
</script>

<style>
.page { padding: 24rpx; }
.status-bar { display: flex; align-items: center; padding: 16rpx 0; }
.status-text { font-size: 30rpx; font-weight: 600; }
.status-dot { width: 20rpx; height: 20rpx; border-radius: 50%; background: #ddd; margin-left: 16rpx; }
.status-dot.ok { background: #07c160; }
.btn-row { display: flex; gap: 16rpx; flex-wrap: wrap; margin: 16rpx 0; }
.device-list { margin: 16rpx 0; min-height: 200rpx; }
.device-item { padding: 20rpx; border-bottom: 1px solid #f0f0f0; border-radius: 8rpx; }
.device-item.active { background: #eaf7ef; }
.device-main { display: flex; justify-content: space-between; }
.device-name { font-size: 30rpx; }
.device-rssi { font-size: 24rpx; color: #999; }
.device-id { font-size: 22rpx; color: #bbb; }
.empty { text-align: center; color: #999; padding: 60rpx 0; font-size: 26rpx; }
.progress { margin: 12rpx 0; }
.log { height: 360rpx; background: #1e1e1e; border-radius: 12rpx; padding: 16rpx; margin-top: 20rpx; }
.log-line { display: block; color: #0f0; font-size: 22rpx; font-family: monospace; line-height: 1.6; }
</style>
