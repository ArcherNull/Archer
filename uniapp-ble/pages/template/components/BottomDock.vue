<template>
	<view class="dock">
		<!-- 第一行：纸张摘要 + 预览/指令/打印 -->
		<view class="dock-row dock-row--top">
			<view class="paperBtn" @click="$emit('paper')">
				<image class="paperBtn-iconImg" :src="icons.settings" mode="aspectFit" />
				<text class="paperBtn-text">{{ paperSummary }}</text>
			</view>
			<view class="actionIcons">
				<view
					v-if="toolsCollapsed"
					class="iconBtn iconBtn--tools"
					@click="$emit('expand-tools')"
				>
					<image class="iconBtn-img" :src="icons.expand" mode="aspectFit" />
					<text class="iconBtn-label">工具</text>
				</view>
				<view class="iconBtn" @click="onImportTap">
					<image class="iconBtn-img" :src="icons.importIcon" mode="aspectFit" />
					<text class="iconBtn-label">导入</text>
				</view>
				<view class="iconBtn" @click="$emit('list')">
					<image class="iconBtn-img" :src="icons.list" mode="aspectFit" />
					<text class="iconBtn-label">列表</text>
				</view>
				<view class="iconBtn" @click="$emit('preview')">
					<image class="iconBtn-img" :src="icons.preview" mode="aspectFit" />
					<text class="iconBtn-label">预览</text>
				</view>
				<view class="iconBtn" @click="$emit('command')">
					<image class="iconBtn-img" :src="icons.command" mode="aspectFit" />
					<text class="iconBtn-label">指令</text>
				</view>
				<view class="iconBtn" :class="{ 'iconBtn--busy': printing }" @click="$emit('print')">
					<image class="iconBtn-img" :src="icons.print" mode="aspectFit" />
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
				<image
					v-if="item.iconSrc"
					class="toolBtn-img"
					:src="item.iconSrc"
					mode="aspectFit"
				/>
				<text v-else class="toolBtn-icon">{{ item.icon }}</text>
				<text class="toolBtn-label">{{ item.label }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		ELEMENT_TYPES,
		TEMPLATE_ICONS,
		formatPaperSummary,
	} from '../utils/elementTypes.js'

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
			toolsCollapsed: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				types: ELEMENT_TYPES,
				icons: TEMPLATE_ICONS,
			}
		},
		computed: {
			paperSummary() {
				return formatPaperSummary(this.paper)
			},
		},
		methods: {
			onImportTap() {
				this.$emit('open-import')
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.dock {
		position: relative;
		flex-shrink: 0;
		width: 100%;
		z-index: 50;
		background: rgba(255, 252, 247, 0.98);
		border-top: 1rpx solid $pr-border-color;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
		padding: 12rpx 16rpx;
		box-sizing: border-box;
		margin: 0;
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

		&-iconImg {
			width: 36rpx;
			height: 36rpx;
			flex-shrink: 0;
		}

		&-text {
			font-size: 24rpx;
			font-weight: 600;
			color: #2c2c2c;
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
		gap: 4rpx;
		padding: 6rpx 0;

		&:active {
			opacity: 0.7;
		}

		&--busy {
			opacity: 0.55;
		}

		&-img {
			width: 40rpx;
			height: 40rpx;
		}

		&-label {
			font-size: 18rpx;
			color: #2c2c2c;
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

		&-img {
			width: 44rpx;
			height: 44rpx;
		}

		&-icon {
			width: 44rpx;
			height: 44rpx;
			line-height: 44rpx;
			text-align: center;
			font-size: 28rpx;
			font-weight: 700;
			color: #2c2c2c;
			background: $pr-theme-soft;
			border-radius: 10rpx;
		}

		&-label {
			font-size: 18rpx;
			color: #2c2c2c;
			transform: scale(0.95);
		}
	}
</style>
