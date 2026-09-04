<template>
	<view class="selectPrinter" @click="onSelected">
		<text class="selectPrinter-text">{{ displayName }}</text>
		<text class="selectPrinter-arrow">›</text>
	</view>
</template>

<script>
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
			displayName() {
				const p = this.selectedPrinter || {}
				return p.name || p.localName || '选择打印机'
			},
		},
		methods: {
			onSelected() {
				this.$emit('selected')
			},
		},
	}
</script>

<style lang="scss" scoped>
	.selectPrinter {
		display: flex;
		align-items: center;
		gap: 8rpx;
		color: #ff9407;
		font-size: 26rpx;

		&-text {
			max-width: 280rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&-arrow {
			font-size: 32rpx;
			line-height: 1;
		}
	}
</style>
