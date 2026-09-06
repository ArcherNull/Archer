<template>
	<view class="footerStatus">
		<view class="footerStatus-chips">
			<text class="chip">{{ statusInfo.platformName }}</text>
			<text class="chip">{{ statusInfo.deviceName }}</text>
			<text class="chip chip--accent">蓝牙 {{ statusInfo.btDeviceName }}</text>
			<text class="chip">信号 {{ statusInfo.btRssi }}dBm</text>
			<text class="chip">MTU {{ statusInfo.mtu }}</text>
			<text class="chip">包 {{ statusInfo.packetIntervalMs }}ms</text>
			<text class="chip">重试 {{ statusInfo.retryIntervalMs }}ms</text>
		</view>
		<view class="footerStatus-meta">
			<text>预计 {{ progressView.estimatedSec }}s</text>
			<text>进度 {{ progressView.printProgress }}%</text>
			<text>传输 {{ progressView.transferProgress }}%</text>
			<text>耗时 {{ progressView.elapsedSec }}s</text>
		</view>
		<view class="footerProgress" v-if="printLoading || progressView.printProgress > 0">
			<view
				class="footerProgress-bar"
				:style="{ width: Math.min(100, progressView.printProgress) + '%' }"
			/>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'PrintTaskStatus',
		props: {
			printStatusInfo: {
				type: Object,
				default: function () {
					return {}
				},
			},
			printProgressView: {
				type: Object,
				default: function () {
					return {}
				},
			},
			printLoading: {
				type: Boolean,
				default: false,
			},
		},
		computed: {
			statusInfo() {
				const info = this.printStatusInfo || {}
				return {
					platformName: info.platformName || '其它',
					deviceName: info.deviceName || '未知设备',
					btDeviceName: info.btDeviceName || '未连接',
					btRssi: (info.btRssi === 0 || (info.btRssi !== undefined && info.btRssi !== null))
						? info.btRssi
						: '--',
					mtu: Number(info.mtu) || 0,
					packetIntervalMs: Number(info.packetIntervalMs) || 0,
					retryIntervalMs: Number(info.retryIntervalMs) || 0,
				}
			},
			progressView() {
				const view = this.printProgressView || {}
				return {
					estimatedSec: Number(view.estimatedSec || 0),
					printProgress: Number(view.printProgress || 0),
					transferProgress: Number(view.transferProgress || 0),
					elapsedSec: Number(view.elapsedSec || 0),
				}
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../comm/common.scss';

	.footerStatus {
		&-chips {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
		}

		&-meta {
			display: flex;
			flex-wrap: wrap;
			gap: 8rpx 20rpx;
			margin-top: 12rpx;
			color: $pr-text-sub;
			font-size: 22rpx;
		}
	}

	.chip {
		padding: 6rpx 14rpx;
		border-radius: 999rpx;
		background: #f3eee6;
		color: #666;
		font-size: 20rpx;
		line-height: 1.4;

		&--accent {
			background: $pr-theme-soft-strong;
			color: $pr-theme-text;
			font-weight: 600;
		}
	}

	.footerProgress {
		margin-top: 14rpx;
		height: 10rpx;
		border-radius: 999rpx;
		background: #f0e6d6;
		overflow: hidden;

		&-bar {
			height: 100%;
			border-radius: 999rpx;
			background: linear-gradient(90deg, $pr-theme, $pr-theme-dark);
			transition: width 0.25s ease;
		}
	}
</style>
