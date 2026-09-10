<template>
	<PrintItemBox title="元素列表" :isShowBottomLine="true" :tag="countTag">
		<view v-if="!elements.length" class="empty">点击上方按钮添加打印元素</view>
		<view v-else class="list">
			<view
				v-for="(item, index) in elements"
				:key="item.id"
				:class="['item', selectedId === item.id ? 'item--on' : '']"
				@click="onSelect(item.id)"
			>
				<view class="item-main">
					<text class="item-type">{{ typeLabel(item.type) }}</text>
					<text class="item-summary">{{ summary(item) }}</text>
				</view>
				<view class="item-ops" @click.stop>
					<text
						class="item-op"
						:class="{ 'item-op--off': index === 0 }"
						@click="onMove(index, -1)"
					>上移</text>
					<text
						class="item-op"
						:class="{ 'item-op--off': index === elements.length - 1 }"
						@click="onMove(index, 1)"
					>下移</text>
					<text class="item-op item-op--danger" @click="onRemove(item.id)">删除</text>
				</view>
			</view>
		</view>
	</PrintItemBox>
</template>

<script>
	import PrintItemBox from '../../print/components/PrintItemBox.vue'
	import { getElementTypeLabel } from '../utils/elementTypes.js'

	export default {
		name: 'ElementList',
		components: { PrintItemBox },
		props: {
			elements: {
				type: Array,
				default: function () {
					return []
				},
			},
			selectedId: {
				type: String,
				default: '',
			},
		},
		computed: {
			countTag() {
				const n = (this.elements && this.elements.length) || 0
				return n ? String(n) : ''
			},
		},
		methods: {
			typeLabel(type) {
				return getElementTypeLabel(type)
			},
			summary(item) {
				if (!item) return ''
				if (item.type === 'text') return item.content || ''
				if (item.type === 'barcode' || item.type === 'qrcode') return item.data || ''
				if (item.type === 'hline' || item.type === 'vline') {
					return (item.lengthMm || 0) + 'mm'
				}
				if (item.type === 'image') return item.imageKey || 'logo'
				return item.name || ''
			},
			onSelect(id) {
				this.$emit('select', id)
			},
			onRemove(id) {
				this.$emit('remove', id)
			},
			onMove(index, delta) {
				this.$emit('move', { index: index, delta: delta })
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.empty {
		padding: 32rpx 0 16rpx;
		text-align: center;
		font-size: 26rpx;
		color: $pr-text-muted;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		padding-top: 8rpx;
	}

	.item {
		padding: 16rpx 20rpx;
		border-radius: 12rpx;
		background: $pr-surface-warm;
		border: 1rpx solid $pr-border-color;

		&--on {
			border-color: $pr-theme;
			background: $pr-theme-soft;
		}

		&-main {
			display: flex;
			flex-direction: column;
			gap: 6rpx;
			min-width: 0;
		}

		&-type {
			font-size: 28rpx;
			font-weight: 700;
			color: $pr-text-main;
		}

		&-summary {
			font-size: 24rpx;
			color: $pr-text-sub;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&-ops {
			display: flex;
			justify-content: flex-end;
			gap: 20rpx;
			margin-top: 12rpx;
		}

		&-op {
			font-size: 24rpx;
			color: $pr-theme-text;

			&--danger {
				color: $pr-danger;
			}

			&--off {
				color: #cbbfae;
				pointer-events: none;
			}
		}
	}
</style>
