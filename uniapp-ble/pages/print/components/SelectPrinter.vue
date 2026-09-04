<template>
	<view class="spBox">
		<view
			:class="[
				'spBox-text',
				hasPrinter ? 'spBox-text__active' : 'spBox-text__unactive',
			]"
			@click="openPrinterListPop"
		>
			{{ displayName }}
			<text class="spBox-arrow">›</text>
		</view>
	</view>
</template>

<script>
	/**
	 * 对齐 kpsapp SelectPrinter：展示已绑定打印机 / 引导选择连接
	 */
	export default {
		name: 'SelectPrinter',
		props: {
			selectedPrinter: {
				type: Object,
				default: function () {
					return {}
				},
			},
		},
		computed: {
			hasPrinter() {
				const p = this.selectedPrinter || {}
				return !!(p.name || p.localName || p.deviceId)
			},
			displayName() {
				const p = this.selectedPrinter || {}
				return p.name || p.localName || '请选择并连接打印机'
			},
		},
		methods: {
			openPrinterListPop() {
				this.$emit('selected')
			},
		},
	}
</script>

<style lang="scss" scoped>
	.spBox {
		&-text {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 6rpx;
			font-size: 28rpx;

			&__active {
				color: #333;
			}

			&__unactive {
				color: #999;
			}
		}

		&-arrow {
			font-size: 32rpx;
			line-height: 1;
			color: inherit;
		}
	}
</style>
