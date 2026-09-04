<template>
	<PrintItemBox title="打印设置" :isShowBottomLine="true">
		<view slot="subTitle">
			<view class="platformTag">
				<text>平台：{{ platformName }}</text>
				<text class="platformTag-split">|</text>
				<text>设备：{{ deviceName }}</text>
			</view>
		</view>

		<view class="form">
			<view class="form-row">
				<view class="form-label required">打印任务超时时间</view>
				<view class="form-field">
					<input
						class="form-input"
						type="number"
						:value="localConfig.printTimeoutSec"
						@input="onNumberInput('printTimeoutSec', $event, 10, 100)"
					/>
					<text class="form-unit">s</text>
				</view>
			</view>
			<view class="form-tip">范围 10–100，默认 40；超时将中断打印任务</view>

			<view class="form-row">
				<label class="checkRow" @click="toggleRecursive">
					<checkbox
						color="#f9ae3d"
						style="transform: scale(0.7)"
						:checked="localConfig.enableRecursivePrint"
					/>
					<text>是否开启递归打印</text>
				</label>
			</view>

			<view class="sectionTitle">设备初始配置</view>

			<view class="form-row pair">
				<view class="pair-item">
					<view class="form-label required">MTU设置</view>
					<view class="form-field">
						<input
							class="form-input"
							type="number"
							:disabled="mtuReadonly"
							:value="localConfig.mtu"
							@input="onNumberInput('mtu', $event, 20, 512)"
						/>
						<text class="form-unit">字节</text>
					</view>
				</view>
				<view class="pair-item">
					<view class="form-label required">步进值</view>
					<view class="form-field">
						<input
							class="form-input form-input--step"
							type="number"
							:disabled="mtuReadonly"
							:value="localConfig.mtuStep"
							@input="onNumberInput('mtuStep', $event, 10, 100)"
						/>
						<text class="form-unit">字节</text>
						<view class="stepOps">
							<text
								:class="['stepOps-btn', (!canMtuStepSub || mtuReadonly) ? 'stepOps-btn--disabled' : '']"
								@click="!mtuReadonly && canMtuStepSub && stepAdjust('mtu', 'sub')"
							>-</text>
							<text
								:class="['stepOps-btn', mtuReadonly ? 'stepOps-btn--disabled' : '']"
								@click="!mtuReadonly && stepAdjust('mtu', 'add')"
							>+</text>
						</view>
					</view>
				</view>
			</view>
			<view class="form-tip">{{ mtuTipText }}</view>

			<view class="form-row pair">
				<view class="pair-item">
					<view class="form-label required">包间隔时间</view>
					<view class="form-field">
						<input
							class="form-input"
							type="number"
							:value="localConfig.packetIntervalMs"
							@input="onNumberInput('packetIntervalMs', $event, 20, 300)"
						/>
						<text class="form-unit">ms</text>
					</view>
				</view>
				<view class="pair-item">
					<view class="form-label required">步进值</view>
					<view class="form-field">
						<input
							class="form-input form-input--step"
							type="number"
							:value="localConfig.packetStepMs"
							@input="onNumberInput('packetStepMs', $event, 10, 100)"
						/>
						<text class="form-unit">ms</text>
						<view class="stepOps">
							<text
								:class="['stepOps-btn', !canPacketStepSub ? 'stepOps-btn--disabled' : '']"
								@click="canPacketStepSub && stepAdjust('packet', 'sub')"
							>-</text>
							<text class="stepOps-btn" @click="stepAdjust('packet', 'add')">+</text>
						</view>
					</view>
				</view>
			</view>
			<view class="form-tip">包间隔 20–300；步进 10–100；右侧加减按步进调整包间隔</view>

			<view class="form-row pair">
				<view class="pair-item">
					<view class="form-label required">重试间隔时间</view>
					<view class="form-field">
						<input
							class="form-input"
							type="number"
							:value="localConfig.retryIntervalMs"
							@input="onNumberInput('retryIntervalMs', $event, 20, 300)"
						/>
						<text class="form-unit">ms</text>
					</view>
				</view>
				<view class="pair-item">
					<view class="form-label required">步进值</view>
					<view class="form-field">
						<input
							class="form-input form-input--step"
							type="number"
							:value="localConfig.retryStepMs"
							@input="onNumberInput('retryStepMs', $event, 10, 200)"
						/>
						<text class="form-unit">ms</text>
						<view class="stepOps">
							<text
								:class="['stepOps-btn', !canRetryStepSub ? 'stepOps-btn--disabled' : '']"
								@click="canRetryStepSub && stepAdjust('retry', 'sub')"
							>-</text>
							<text class="stepOps-btn" @click="stepAdjust('retry', 'add')">+</text>
						</view>
					</view>
				</view>
			</view>
			<view class="form-tip">重试间隔 20–300；步进 10–200；右侧加减按步进调整重试间隔</view>

			<view class="form-row">
				<view class="form-label required">单包传输失败最大重试次数</view>
				<view class="form-field">
					<input
						class="form-input"
						type="number"
						:value="localConfig.maxPacketRetry"
						@input="onNumberInput('maxPacketRetry', $event, 0, 6)"
					/>
					<text class="form-unit">次</text>
				</view>
			</view>
			<view class="form-tip">范围 0–6</view>

			<view class="form-actions">
				<button
					size="mini"
					class="action-btn action-btn--ghost"
					@click="resetPlatformDefault"
				>恢复平台默认</button>
				<button
					size="mini"
					type="primary"
					class="action-btn action-btn--primary"
					@click="applyConfig"
				>应用配置</button>
			</view>
		</view>
	</PrintItemBox>
</template>

<script>
	import PrintItemBox from './PrintItemBox.vue'
	import { convertNumber, showMsg } from '../comm/utils.js'

	export default {
		name: 'PrintSettings',
		components: {
			PrintItemBox,
		},
		props: {
			platformName: {
				type: String,
				default: '其它',
			},
			deviceName: {
				type: String,
				default: '未知设备',
			},
			config: {
				type: Object,
				default: function () {
					return {}
				},
			},
			platformDefaultConfig: {
				type: Object,
				default: function () {
					return {}
				},
			},
		},
		data() {
			return {
				localConfig: {
					printTimeoutSec: 40,
					enableRecursivePrint: true,
					mtu: 23,
					mtuStep: 20,
					packetIntervalMs: 20,
					packetStepMs: 20,
					retryIntervalMs: 50,
					retryStepMs: 30,
					maxPacketRetry: 2,
				},
			}
		},
		computed: {
			mtuReadonly() {
				return this.platformName === 'iOS'
			},
			mtuTipText() {
				if (this.platformName === 'iOS') {
					return 'iOS 不可设置 MTU，由系统默认分配'
				}
				if (this.platformName === '鸿蒙') {
					return 'MTU 20–512，默认 23；步进 10–100；鸿蒙单包约 23 字节，过大易乱码'
				}
				if (this.platformName === '安卓') {
					return 'MTU 20–512，默认 512；步进 10–100；安卓单包传输速率默认 512 字节'
				}
				return 'MTU 20–512，默认 23；步进 10–100；右侧加减按步进调整 MTU'
			},
			canMtuStepSub() {
				return convertNumber(this.localConfig.mtu) > 20
			},
			canPacketStepSub() {
				return convertNumber(this.localConfig.packetIntervalMs) > 20
			},
			canRetryStepSub() {
				return convertNumber(this.localConfig.retryIntervalMs) > 20
			},
		},
		watch: {
			config: {
				immediate: true,
				deep: true,
				handler: function (val) {
					if (!val) return
					this.localConfig = Object.assign({}, this.localConfig, val)
				},
			},
		},
		methods: {
			clamp(val, min, max, def) {
				const n = convertNumber(val)
				if (!n && n !== 0) return def
				return Math.min(max, Math.max(min, Math.round(n)))
			},
			emitConfig() {
				this.$emit('update:config', Object.assign({}, this.localConfig))
			},
			onNumberInput(key, e, min, max) {
				if ((key === 'mtu' || key === 'mtuStep') && this.mtuReadonly) return
				const detail = e && e.detail
				const target = e && e.target
				const raw = (detail && detail.value !== undefined) ? detail.value : (target && target.value)
				this.$set(this.localConfig, key, this.clamp(raw, min, max, this.localConfig[key]))
				this.emitConfig()
			},
			stepAdjust(type, op) {
				if (type === 'mtu') {
					if (this.mtuReadonly) return
					const step = this.clamp(this.localConfig.mtuStep, 10, 100, 20)
					const current = this.clamp(this.localConfig.mtu, 20, 512, 23)
					const next = op === 'add' ? current + step : current - step
					this.localConfig.mtu = this.clamp(next, 20, 512, current)
					this.localConfig.mtuStep = step
				} else if (type === 'packet') {
					const step = this.clamp(this.localConfig.packetStepMs, 10, 100, 20)
					const current = this.clamp(this.localConfig.packetIntervalMs, 20, 300, 20)
					const next = op === 'add' ? current + step : current - step
					this.localConfig.packetIntervalMs = this.clamp(next, 20, 300, current)
					this.localConfig.packetStepMs = step
				} else if (type === 'retry') {
					const step = this.clamp(this.localConfig.retryStepMs, 10, 200, 30)
					const current = this.clamp(this.localConfig.retryIntervalMs, 20, 300, 50)
					const next = op === 'add' ? current + step : current - step
					this.localConfig.retryIntervalMs = this.clamp(next, 20, 300, current)
					this.localConfig.retryStepMs = step
				}
				this.emitConfig()
			},
			toggleRecursive() {
				this.localConfig.enableRecursivePrint = !this.localConfig.enableRecursivePrint
				this.emitConfig()
			},
			resetPlatformDefault() {
				this.localConfig = Object.assign({}, this.localConfig, this.platformDefaultConfig || {})
				this.emitConfig()
				this.$emit('apply', Object.assign({}, this.localConfig))
				showMsg('已恢复平台默认配置', 'success')
			},
			applyConfig() {
				const next = {
					printTimeoutSec: this.clamp(this.localConfig.printTimeoutSec, 10, 100, 40),
					enableRecursivePrint: this.localConfig.enableRecursivePrint !== false,
					mtu: this.clamp(this.localConfig.mtu, 20, 512, 23),
					mtuStep: this.clamp(this.localConfig.mtuStep, 10, 100, 20),
					packetIntervalMs: this.clamp(this.localConfig.packetIntervalMs, 20, 300, 20),
					packetStepMs: this.clamp(this.localConfig.packetStepMs, 10, 100, 20),
					retryIntervalMs: this.clamp(this.localConfig.retryIntervalMs, 20, 300, 50),
					retryStepMs: this.clamp(this.localConfig.retryStepMs, 10, 200, 30),
					maxPacketRetry: this.clamp(this.localConfig.maxPacketRetry, 0, 6, 2),
				}
				this.localConfig = Object.assign({}, next)
				this.$emit('update:config', next)
				this.$emit('apply', next)
				showMsg('打印配置已应用', 'success')
			},
		},
	}
</script>

<style lang="scss" scoped>
	$theme: #f9ae3d;
	$theme-soft: rgba(249, 174, 61, 0.12);

	.platformTag {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8rpx;
		padding: 6rpx 14rpx;
		border-radius: 999rpx;
		background: $theme-soft;
		color: #c4841a;
		font-size: 24rpx;

		&-split {
			color: rgba(196, 132, 26, 0.45);
		}
	}

	.form {
		padding: 8rpx 0 4rpx;
	}

	.sectionTitle {
		margin: 24rpx 0 8rpx;
		padding-top: 16rpx;
		border-top: 1rpx dashed #f0e6d6;
		font-size: 28rpx;
		font-weight: 700;
		color: #2c2c2c;
	}

	.form-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
		padding: 16rpx 0;
		flex-wrap: wrap;
	}

	.form-label {
		color: #333;
		font-size: 28rpx;

		&.required::before {
			content: '*';
			color: #f56c6c;
			margin-right: 6rpx;
		}
	}

	.form-field {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.form-input {
		width: 140rpx;
		height: 64rpx;
		line-height: 64rpx;
		text-align: center;
		border: 1rpx solid #eadfce;
		border-radius: 12rpx;
		background: #fffaf3;
		font-size: 28rpx;
		color: #333;

		&--step {
			width: 100rpx;
		}

		&[disabled] {
			opacity: 0.55;
			color: #999;
			background: #f5f5f5;
		}
	}

	.form-unit {
		color: #999;
		font-size: 24rpx;
		min-width: 40rpx;
	}

	.stepOps {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-left: 4rpx;

		&-icon {
			width: 48rpx;
			height: 48rpx;
		}

		&-btn {
			width: 48rpx;
			height: 48rpx;
			line-height: 48rpx;
			text-align: center;
			border-radius: 12rpx;
			background: $theme;
			color: #fff;
			font-size: 30rpx;
			font-weight: 600;

			&--disabled {
				background: #e8e0d4;
				color: #aaa;
			}
		}
	}

	.form-tip {
		color: #a89880;
		font-size: 22rpx;
		line-height: 1.4;
		padding: 0 0 8rpx;
	}

	.pair {
		align-items: flex-start;

		.pair-item {
			flex: 1;
			min-width: 280rpx;
		}
	}

	.checkRow {
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-size: 28rpx;
		color: #333;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f3eee6;
	}

	.action-btn {
		margin: 0;
		padding: 0 28rpx;
		height: 64rpx;
		line-height: 64rpx;
		font-size: 26rpx;
		font-weight: 600;
		border-radius: 999rpx;
		border: none;
		box-sizing: border-box;

		&::after {
			border: none;
		}

		&--ghost {
			min-width: 200rpx;
			color: #c4841a;
			background: $theme-soft;
		}

		&--primary {
			min-width: 168rpx;
			color: #fff !important;
			background: $theme !important;
			box-shadow: 0 6rpx 16rpx rgba(249, 174, 61, 0.35);
		}
	}
</style>
