<template>
	<view
		v-if="visible"
		class="deviceMask deviceMask--elevated"
		@click="onMask"
		@touchmove.stop.prevent
	>
		<view class="devicePanel devicePanel--solid importPanel" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">导入指令</view>
				<view class="devicePanel-close" @click="close">×</view>
			</view>
			<view class="importBody">
				<text class="importHint">粘贴蓝牙 CPCL 指令，确定后回显为画布模板</text>
				<textarea
					class="importInput"
					:value="localText"
					placeholder="在此粘贴或输入蓝牙指令…"
					:maxlength="-1"
					:auto-height="false"
					@input="onInput"
				/>
			</view>
			<view class="devicePanel-footer">
				<button class="action-btn action-btn--lg action-btn--ghost" @click="close">取消</button>
				<button class="action-btn action-btn--lg action-btn--primary" @click="onConfirm">
					确定
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'ImportCommandPopup',
		props: {
			visible: { type: Boolean, default: false },
			value: { type: String, default: '' },
		},
		data() {
			return {
				localText: '',
			}
		},
		watch: {
			visible: function (v) {
				if (v) this.localText = this.value || ''
			},
		},
		methods: {
			onMask() {
				this.close()
			},
			close() {
				this.$emit('update:visible', false)
				this.$emit('close')
			},
			onInput(e) {
				this.localText = e && e.detail ? e.detail.value : ''
			},
			onConfirm() {
				this.$emit('confirm', String(this.localText || '').trim())
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.importPanel {
		max-height: 78vh;
		display: flex;
		flex-direction: column;
	}

	.importBody {
		padding: 8rpx 24rpx 16rpx;
		box-sizing: border-box;
	}

	.importHint {
		display: block;
		font-size: 24rpx;
		color: $pr-text-muted;
		margin-bottom: 16rpx;
		line-height: 1.4;
	}

	.importInput {
		width: 100%;
		min-height: 360rpx;
		max-height: 52vh;
		padding: 20rpx;
		font-size: 24rpx;
		line-height: 1.45;
		color: $pr-text-main;
		background: #f7f7f7;
		border-radius: 12rpx;
		box-sizing: border-box;
	}

	.devicePanel-footer {
		display: flex;
		gap: 16rpx;
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));

		.action-btn {
			flex: 1;
		}
	}
</style>
