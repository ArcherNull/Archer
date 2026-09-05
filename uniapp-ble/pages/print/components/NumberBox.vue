<template>
	<view class="numBox">
		<view
			class="numBox-btn"
			:class="{ 'numBox-btn--disabled': disabled || valueNum <= min }"
			@click="dec"
		>
			−
		</view>
		<input
			class="numBox-input"
			type="number"
			:disabled="disabled"
			:value="valueNum"
			@input="onInput"
			@blur="onBlur"
		/>
		<view
			class="numBox-btn"
			:class="{ 'numBox-btn--disabled': disabled || valueNum >= max }"
			@click="inc"
		>
			+
		</view>
	</view>
</template>

<script>
	/**
	 * 替代 u-number-box，对齐 newPrint 份数加减交互
	 */
	import { convertNumber } from '../comm/utils.js'

	export default {
		name: 'NumberBox',
		props: {
			value: {
				type: [Number, String],
				default: 0,
			},
			min: {
				type: Number,
				default: 0,
			},
			max: {
				type: Number,
				default: 9000,
			},
			disabled: {
				type: Boolean,
				default: false,
			},
		},
		computed: {
			valueNum() {
				return convertNumber(this.value)
			},
		},
		methods: {
			emitValue(val) {
				let n = convertNumber(val)
				if (n < this.min) n = this.min
				if (n > this.max) n = this.max
				this.$emit('input', n)
				this.$emit('update:value', n)
				this.$emit('change', n)
			},
			dec() {
				if (this.disabled || this.valueNum <= this.min) return
				this.emitValue(this.valueNum - 1)
			},
			inc() {
				if (this.disabled || this.valueNum >= this.max) return
				this.emitValue(this.valueNum + 1)
			},
			onInput(e) {
				const raw = e.detail && e.detail.value
				this.emitValue(raw)
			},
			onBlur() {
				this.emitValue(this.valueNum)
			},
		},
	}
</script>

<style lang="scss" scoped>
	$theme: #f9ae3d;
	$theme-soft: rgba(249, 174, 61, 0.12);

	.numBox {
		display: inline-flex;
		align-items: center;
		height: 56rpx;
		border: 1rpx solid #efe6d8;
		border-radius: 12rpx;
		overflow: hidden;
		background: #fffaf3;

		&-btn {
			width: 56rpx;
			height: 56rpx;
			line-height: 56rpx;
			text-align: center;
			font-size: 32rpx;
			color: #c4841a;
			background: $theme-soft;
			font-weight: 600;

			&--disabled {
				color: #cbbfae;
				background: #f3eee6;
			}
		}

		&-input {
			width: 90rpx;
			height: 56rpx;
			line-height: 56rpx;
			text-align: center;
			font-size: 28rpx;
			color: #2c2c2c;
			background: #fff;
		}
	}
</style>
