<template>
	<PrintItemBox title="添加元素" :isShowBottomLine="true">
		<view class="toolbar">
			<view
				v-for="item in types"
				:key="item.type"
				class="tool"
				@click="onAdd(item.type)"
			>
				<view class="tool-icon">{{ item.icon }}</view>
				<text class="tool-label">{{ item.label }}</text>
			</view>
		</view>
	</PrintItemBox>
</template>

<script>
	import PrintItemBox from '../../print/components/PrintItemBox.vue'
	import { ELEMENT_TYPES } from '../utils/elementTypes.js'

	export default {
		name: 'ElementToolbar',
		components: { PrintItemBox },
		data() {
			return {
				types: ELEMENT_TYPES,
			}
		},
		methods: {
			onAdd(type) {
				this.$emit('add', type)
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		padding-top: 8rpx;
	}

	.tool {
		width: calc(33.33% - 12rpx);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		padding: 20rpx 8rpx;
		background: $pr-surface-warm;
		border: 1rpx solid $pr-border-color;
		border-radius: 12rpx;

		&:active {
			background: $pr-theme-soft;
			border-color: $pr-theme;
		}

		&-icon {
			min-width: 56rpx;
			height: 40rpx;
			line-height: 40rpx;
			text-align: center;
			font-size: 24rpx;
			font-weight: 700;
			color: $pr-theme-text;
		}

		&-label {
			font-size: 24rpx;
			color: $pr-text-main;
		}
	}
</style>
