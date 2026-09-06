<template>
	<PrintItemBox title="打印设置" :isShowBottomLine="true">
		<template #subTitle>
			<view class="platformTag">
				<text>平台：{{ platformName }}</text>
				<text class="platformTag-split">|</text>
				<text>设备：{{ deviceName }}</text>
			</view>
		</template>

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
						color="#FF9407"
						style="transform: scale(0.7)"
						:checked="localConfig.enableRecursivePrint"
					/>
					<text>是否开启递归打印（失败递进，成功记录）</text>
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
							<image
								v-if="canMtuStepSub && !mtuReadonly"
								class="stepOps-icon"
								src="/static/images/numCle.png"
								@click="stepAdjust('mtu', 'sub')"
							/>
							<image
								v-else
								class="stepOps-icon"
								src="/static/images/numCle1.png"
							/>
							<image
								v-if="!mtuReadonly"
								class="stepOps-icon"
								src="/static/images/numAdd.png"
								@click="stepAdjust('mtu', 'add')"
							/>
							<image
								v-else
								class="stepOps-icon"
								src="/static/images/numAdd.png"
								style="opacity: 0.35"
							/>
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
							<image
								v-if="canPacketStepSub"
								class="stepOps-icon"
								src="/static/images/numCle.png"
								@click="stepAdjust('packet', 'sub')"
							/>
							<image
								v-else
								class="stepOps-icon"
								src="/static/images/numCle1.png"
							/>
							<image
								class="stepOps-icon"
								src="/static/images/numAdd.png"
								@click="stepAdjust('packet', 'add')"
							/>
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
							<image
								v-if="canRetryStepSub"
								class="stepOps-icon"
								src="/static/images/numCle.png"
								@click="stepAdjust('retry', 'sub')"
							/>
							<image
								v-else
								class="stepOps-icon"
								src="/static/images/numCle1.png"
							/>
							<image
								class="stepOps-icon"
								src="/static/images/numAdd.png"
								@click="stepAdjust('retry', 'add')"
							/>
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
				<button size="mini" @click="resetPlatformDefault">恢复平台默认</button>
				<button size="mini" type="primary" class="primary-btn" @click="applyConfig">应用配置</button>
			</view>
		</view>
	</PrintItemBox>
</template>

<script setup>
	import {
		reactive,
		watch,
		computed
	} from 'vue'
	import PrintItemBox from './PrintItemBox.vue'
	import {
		convertNumber,
		showMsg
	} from '@/ble/comm/cusBluetooth.js'

	const props = defineProps({
		platformName: {
			type: String,
			default: '其它'
		},
		deviceName: {
			type: String,
			default: '未知设备'
		},
		config: {
			type: Object,
			default: () => ({})
		},
		platformDefaultConfig: {
			type: Object,
			default: () => ({})
		}
	})

	const emits = defineEmits(['update:config', 'apply'])

	const localConfig = reactive({
		printTimeoutSec: 40,
		enableRecursivePrint: true,
		mtu: 23,
		mtuStep: 20,
		packetIntervalMs: 20,
		packetStepMs: 20,
		retryIntervalMs: 50,
		retryStepMs: 30,
		maxPacketRetry: 2,
	})

	// iOS 由系统分配 MTU，界面只展示不可改
	const mtuReadonly = computed(() => props.platformName === 'iOS')

	const mtuTipText = computed(() => {
		if (props.platformName === 'iOS') {
			return 'iOS 不可设置 MTU，由系统默认分配'
		}
		if (props.platformName === '鸿蒙') {
			return 'MTU 20–512，默认 23；步进 10–100；鸿蒙单包约 23 字节，过大易乱码'
		}
		if (props.platformName === '安卓') {
			return 'MTU 20–512，默认 512；步进 10–100；安卓单包传输速率默认 512 字节'
		}
		return 'MTU 20–512，默认 23；步进 10–100；右侧加减按步进调整 MTU'
	})

	const canMtuStepSub = computed(() => {
		return convertNumber(localConfig.mtu) > 20
	})

	const canPacketStepSub = computed(() => {
		return convertNumber(localConfig.packetIntervalMs) > 20
	})

	const canRetryStepSub = computed(() => {
		return convertNumber(localConfig.retryIntervalMs) > 20
	})

	watch(
		() => props.config,
		(val) => {
			if (!val) return
			Object.assign(localConfig, val)
		}, {
			immediate: true,
			deep: true
		}
	)

	function clamp(val, min, max, def) {
		const n = convertNumber(val)
		if (!n && n !== 0) return def
		return Math.min(max, Math.max(min, Math.round(n)))
	}

	function emitConfig() {
		emits('update:config', {
			...localConfig
		})
	}

	function onNumberInput(key, e, min, max) {
		if ((key === 'mtu' || key === 'mtuStep') && mtuReadonly.value) return
		const raw = e?.detail?.value ?? e?.target?.value
		localConfig[key] = clamp(raw, min, max, localConfig[key])
		emitConfig()
	}

	// 按步进值增减：add => value + step；sub => value - step
	function stepAdjust(type, op) {
		if (type === 'mtu') {
			if (mtuReadonly.value) return
			const step = clamp(localConfig.mtuStep, 10, 100, 20)
			const current = clamp(localConfig.mtu, 20, 512, 23)
			const next = op === 'add' ? current + step : current - step
			localConfig.mtu = clamp(next, 20, 512, current)
			localConfig.mtuStep = step
		} else if (type === 'packet') {
			const step = clamp(localConfig.packetStepMs, 10, 100, 20)
			const current = clamp(localConfig.packetIntervalMs, 20, 300, 20)
			const next = op === 'add' ? current + step : current - step
			localConfig.packetIntervalMs = clamp(next, 20, 300, current)
			localConfig.packetStepMs = step
		} else if (type === 'retry') {
			const step = clamp(localConfig.retryStepMs, 10, 200, 30)
			const current = clamp(localConfig.retryIntervalMs, 20, 300, 50)
			const next = op === 'add' ? current + step : current - step
			localConfig.retryIntervalMs = clamp(next, 20, 300, current)
			localConfig.retryStepMs = step
		}
		emitConfig()
	}

	function toggleRecursive() {
		localConfig.enableRecursivePrint = !localConfig.enableRecursivePrint
		emitConfig()
	}

	function resetPlatformDefault() {
		Object.assign(localConfig, props.platformDefaultConfig || {})
		emitConfig()
		emits('apply', {
			...localConfig
		})
		showMsg('已恢复平台默认配置', 'success')
	}

	function applyConfig() {
		const next = {
			printTimeoutSec: clamp(localConfig.printTimeoutSec, 10, 100, 40),
			enableRecursivePrint: localConfig.enableRecursivePrint !== false,
			mtu: clamp(localConfig.mtu, 20, 512, 23),
			mtuStep: clamp(localConfig.mtuStep, 10, 100, 20),
			packetIntervalMs: clamp(localConfig.packetIntervalMs, 20, 300, 20),
			packetStepMs: clamp(localConfig.packetStepMs, 10, 100, 20),
			retryIntervalMs: clamp(localConfig.retryIntervalMs, 20, 300, 50),
			retryStepMs: clamp(localConfig.retryStepMs, 10, 200, 30),
			maxPacketRetry: clamp(localConfig.maxPacketRetry, 0, 6, 2),
		}
		Object.assign(localConfig, next)
		emits('update:config', next)
		emits('apply', next)
		showMsg('打印配置已应用', 'success')
	}
</script>

<style lang="scss" scoped>
	.platformTag {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8rpx;
		color: $uni-color-primary;
		font-size: 26rpx;

		&-split {
			color: #ccc;
		}
	}

	.form {
		padding: 8rpx 0 12rpx;
	}

	.sectionTitle {
		margin: 20rpx 0 12rpx;
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.form-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
		padding: 14rpx 0;
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
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		border: 1rpx solid #e3e3e3;
		border-radius: 8rpx;
		background: #fafafa;
		font-size: 28rpx;

		&--step {
			width: 100rpx;
		}

		&[disabled] {
			opacity: 0.55;
			color: #999;
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
		gap: 6rpx;
		margin-left: 4rpx;

		&-icon {
			width: 46rpx;
			height: 46rpx;
		}
	}

	.form-tip {
		color: #999;
		font-size: 22rpx;
		padding-bottom: 8rpx;
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
		gap: 16rpx;
		margin-top: 16rpx;
	}
</style>
