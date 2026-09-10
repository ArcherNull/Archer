<template>
	<view class="dock">
		<!-- 第一行：纸张摘要 + 预览/指令/打印 -->
		<view class="dock-row dock-row--top">
			<view class="paperBtn" @click="$emit('paper')">
				<text class="paperBtn-icon">▤</text>
				<text class="paperBtn-text">{{ paperSummary }}</text>
			</view>
			<view class="actionIcons">
				<view class="iconBtn" @click="$emit('preview')">
					<text class="iconBtn-glyph">👁</text>
					<text class="iconBtn-label">预览</text>
				</view>
				<view class="iconBtn" @click="$emit('command')">
					<text class="iconBtn-glyph">{ }</text>
					<text class="iconBtn-label">指令</text>
				</view>
				<view class="iconBtn" :class="{ 'iconBtn--busy': printing }" @click="$emit('print')">
					<text class="iconBtn-glyph">⎙</text>
					<text class="iconBtn-label">{{ printing ? '打印中' : '试打' }}</text>
				</view>
			</view>
		</view>

		<!-- 第二行：添加元素 -->
		<view class="dock-row dock-row--tools">
			<view
				v-for="item in types"
				:key="item.type"
				class="toolBtn"
				@click="$emit('add', item.type)"
			>
				<text class="toolBtn-icon">{{ item.icon }}</text>
				<text class="toolBtn-label">{{ item.label }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { ELEMENT_TYPES, formatPaperSummary } from '../utils/elementTypes.js'

	export default {
		name: 'BottomDock',
		props: {
			paper: {
				type: Object,
				required: true,
			},
			printing: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				types: ELEMENT_TYPES,
			}
		},
		computed: {
			paperSummary() {
				return formatPaperSummary(this.paper)
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.dock {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 50;
		background: rgba(255, 252, 247, 0.98);
		border-top: 1rpx solid $pr-border-color;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
		padding: 12rpx 16rpx calc(12rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.dock-row {
		display: flex;
		align-items: center;

		&--top {
			justify-content: space-between;
			gap: 12rpx;
			margin-bottom: 12rpx;
		}

		&--tools {
			justify-content: space-between;
			gap: 4rpx;
		}
	}

	.paperBtn {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 12rpx 16rpx;
		background: $pr-surface-warm;
		border: 1rpx solid $pr-border-color;
		border-radius: 12rpx;

		&:active {
			background: $pr-theme-soft;
			border-color: $pr-theme;
		}

		&-icon {
			font-size: 28rpx;
			color: $pr-theme-text;
			flex-shrink: 0;
		}

		&-text {
			font-size: 24rpx;
			font-weight: 600;
			color: $pr-text-main;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.actionIcons {
		display: flex;
		align-items: center;
		gap: 4rpx;
		flex-shrink: 0;
	}

	.iconBtn {
		width: 88rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rpx;
		padding: 6rpx 0;

		&:active {
			opacity: 0.7;
		}

		&--busy {
			opacity: 0.55;
		}

		&-glyph {
			font-size: 30rpx;
			line-height: 1.2;
			color: $pr-theme-text;
		}

		&-label {
			font-size: 18rpx;
			color: $pr-text-sub;
		}
	}

	.toolBtn {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4rpx;
		padding: 10rpx 0;
		border-radius: 10rpx;

		&:active {
			background: $pr-theme-soft;
		}

		&-icon {
			width: 44rpx;
			height: 44rpx;
			line-height: 44rpx;
			text-align: center;
			font-size: 28rpx;
			font-weight: 700;
			color: $pr-theme-text;
			background: $pr-theme-soft;
			border-radius: 10rpx;
		}

		&-label {
			font-size: 18rpx;
			color: $pr-text-sub;
			transform: scale(0.95);
		}
	}
</style>
