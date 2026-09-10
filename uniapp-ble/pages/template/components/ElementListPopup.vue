<template>
	<view v-if="visible" class="deviceMask deviceMask--elevated" @click="onMask" @touchmove.stop.prevent>
		<view class="devicePanel devicePanel--solid listPanel" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">元素列表{{ countText }}</view>
				<view class="devicePanel-close" @click="close">×</view>
			</view>
			<scroll-view class="listBody" scroll-y>
				<view v-if="!elements.length" class="empty">暂无元素，请从底部添加工具加入</view>
				<view v-else class="list">
					<view
						v-for="item in viewList"
						:key="item.id"
						:class="['item', selectedId === item.id ? 'item--on' : '']"
						@click="onSelect(item.id)"
					>
						<view class="item-main">
							<text class="item-type">{{ item.typeLabel }}</text>
							<text class="item-summary">{{ item.summary }}</text>
							<text class="item-pos">{{ item.posText }}</text>
						</view>
						<view class="item-ops" @click.stop>
							<view class="item-iconBtn" @click="onRemove(item.id)">
								<image class="item-iconImg" :src="icons.delete" mode="aspectFit" />
							</view>
							<view class="item-iconBtn" @click="onSettings(item.id)">
								<image class="item-iconImg" :src="icons.settings" mode="aspectFit" />
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			<view class="devicePanel-footer">
				<button class="action-btn action-btn--lg action-btn--primary" @click="close">完成</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { getElementTypeLabel, TEMPLATE_ICONS } from '../utils/elementTypes.js'

	export default {
		name: 'ElementListPopup',
		props: {
			visible: { type: Boolean, default: false },
			elements: {
				type: Array,
				default: function () {
					return []
				},
			},
			selectedId: { type: String, default: '' },
		},
		data() {
			return {
				icons: TEMPLATE_ICONS,
			}
		},
		computed: {
			countText() {
				const n = (this.elements && this.elements.length) || 0
				return n ? '（' + n + '）' : ''
			},
			viewList() {
				const list = this.elements || []
				return list.map(function (item) {
					return {
						id: item.id,
						typeLabel: getElementTypeLabel(item.type),
						summary: summarize(item),
						posText:
							'X ' +
							(Number(item.x) || 0) +
							'  Y ' +
							(Number(item.y) || 0) +
							' mm',
					}
				})
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
			onSelect(id) {
				this.$emit('select', id)
			},
			onRemove(id) {
				this.$emit('remove', id)
			},
			onSettings(id) {
				this.$emit('settings', id)
			},
		},
	}

	function summarize(item) {
		if (!item) return ''
		if (item.type === 'text') return item.content || '文字'
		if (item.type === 'barcode' || item.type === 'qrcode') return item.data || ''
		if (item.type === 'hline' || item.type === 'vline') {
			return (item.lengthMm || 0) + 'mm'
		}
		if (item.type === 'image') {
			return item.name || item.imageKey || '图片'
		}
		if (item.type === 'box') {
			return (item.widthMm || 0) + '×' + (item.heightMm || 0) + 'mm'
		}
		return item.name || ''
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.listPanel {
		max-height: 78vh;
		display: flex;
		flex-direction: column;
	}

	.listBody {
		max-height: 58vh;
		padding: 0 16rpx 16rpx;
		box-sizing: border-box;
	}

	.empty {
		padding: 48rpx 16rpx;
		text-align: center;
		font-size: 26rpx;
		color: $pr-text-muted;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.item {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 20rpx;
		border-radius: 14rpx;
		background: $pr-surface-warm;
		border: 1rpx solid $pr-border-color;
		box-sizing: border-box;

		&--on {
			border-color: $pr-theme;
			background: $pr-theme-soft;
		}

		&-main {
			flex: 1;
			min-width: 0;
			display: flex;
			flex-direction: column;
			gap: 6rpx;
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

		&-pos {
			font-size: 20rpx;
			color: $pr-text-muted;
		}

		&-ops {
			flex-shrink: 0;
			display: flex;
			flex-direction: row;
			gap: 12rpx;
		}

		&-iconBtn {
			width: 56rpx;
			height: 56rpx;
			border-radius: 12rpx;
			background: #fff;
			border: 1rpx solid #2c2c2c;
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
		}

		&-iconImg {
			width: 32rpx;
			height: 32rpx;
		}
	}

	.devicePanel-footer {
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
	}
</style>
