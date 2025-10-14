<template>
	<view class="spBox">
		<view :class="['spBox-text', selectedPrinter.name ? 'spBox-text__active' :'spBox-text__unactive']"
			@click="openPrinterListPop()">
			{{ selectedPrinter.name || '请选择打印机' }}
		</view>
	</view>
</template>

<script>
	export default {
		name: 'SelectPrinter',
		props: {
			// 当前选择的打印机名称
			selectedPrinter: {
				type: Object,
				default () {
					return {}
				}
			}
		},
		data() {
			return {

			}
		},
		methods: {
			// 打开打印机蓝牙列表
			openPrinterListPop() {
				this.$emit('selected')
			}
		}
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
	}
</style>