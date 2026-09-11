<template>
	<view
		v-if="visible"
		class="deviceMask deviceMask--elevated"
		@click="onMaskClick"
		@touchmove="onMaskTouchMove"
	>
		<view
			class="devicePanel devicePanel--solid previewPanel"
			:style="panelStyle"
			@click.stop
			@touchmove.stop
		>
			<view class="devicePanel-header" @touchmove.stop.prevent>
				<view class="devicePanel-title">{{ title || '模板预览' }}</view>
				<view class="devicePanel-close" @click="close">×</view>
			</view>

			<view class="previewBody" :style="bodyStyle">
				<CanvasBoard
					v-if="hasPaper"
					:key="'preview-' + boardKey"
					:paper="paper"
					:elements="elements"
					:selected-id="''"
					:zoom="localZoom"
					:readonly="true"
					:viewport-height="bodyHeightPx"
				/>
				<view v-else class="previewEmpty">暂无预览数据</view>

				<view
					v-if="hasPaper"
					class="previewZoom"
					@click.stop
					@touchmove.stop.prevent
				>
					<view class="previewZoom-btn" @click="onZoomOut">
						<image class="previewZoom-img" :src="icons.zoomOut" mode="aspectFit" />
					</view>
					<view class="previewZoom-pct" @click="onZoomReset">{{ zoomPercent }}</view>
					<view class="previewZoom-btn" @click="onZoomIn">
						<image class="previewZoom-img" :src="icons.zoomIn" mode="aspectFit" />
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import CanvasBoard from './CanvasBoard.vue'
	import { TEMPLATE_ICONS } from '../utils/elementTypes.js'
	import { getWindowInfoSafe } from '../../print/comm/utils.js'

	const ZOOM_MIN = 0.5
	const ZOOM_MAX = 2
	const ZOOM_STEP = 0.25

	function getWindowHeight() {
		try {
			const info = getWindowInfoSafe()
			return Number(info.windowHeight) || Number(info.screenHeight) || 667
		} catch (e) {
			return 667
		}
	}

	function clampZoom(z) {
		const n = Number(z)
		if (isNaN(n) || n <= 0) return 0.75
		return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(n * 100) / 100))
	}

	export default {
		name: 'TemplatePreviewPopup',
		components: { CanvasBoard },
		props: {
			visible: {
				type: Boolean,
				default: false,
			},
			title: {
				type: String,
				default: '',
			},
			paper: {
				type: Object,
				default: null,
			},
			elements: {
				type: Array,
				default: function () {
					return []
				},
			},
			/** 打开预览时的初始缩放 */
			zoom: {
				type: Number,
				default: 0.75,
			},
			closeOnMask: {
				type: Boolean,
				default: true,
			},
		},
		data() {
			return {
				winH: 667,
				localZoom: 0.75,
				boardKey: 0,
				icons: TEMPLATE_ICONS,
			}
		},
		computed: {
			hasPaper() {
				return !!(this.paper && (this.paper.widthMm || this.paper.heightMm))
			},
			zoomPercent() {
				return Math.round((Number(this.localZoom) || 1) * 100) + '%'
			},
			panelHeightPx() {
				return Math.round(this.winH * 0.78)
			},
			bodyHeightPx() {
				return Math.max(280, this.panelHeightPx - 56)
			},
			panelStyle() {
				const h = this.panelHeightPx
				return 'height:' + h + 'px;max-height:' + h + 'px;'
			},
			bodyStyle() {
				return 'height:' + this.bodyHeightPx + 'px;width:100%;'
			},
		},
		watch: {
			visible: {
				immediate: true,
				handler: function (val) {
					if (val) {
						this.winH = getWindowHeight()
						this.localZoom = clampZoom(this.zoom)
						this.boardKey += 1
					}
				},
			},
		},
		methods: {
			onMaskClick() {
				if (this.closeOnMask) this.close()
			},
			/** 仅遮罩空白区禁滚；面板用 stop 拦住冒泡，避免 prevent 杀掉画布滚动 */
			onMaskTouchMove(e) {
				if (e && typeof e.preventDefault === 'function') e.preventDefault()
			},
			close() {
				this.$emit('update:visible', false)
				this.$emit('close')
			},
			onZoomIn() {
				this.localZoom = clampZoom(this.localZoom + ZOOM_STEP)
			},
			onZoomOut() {
				this.localZoom = clampZoom(this.localZoom - ZOOM_STEP)
			},
			onZoomReset() {
				this.localZoom = clampZoom(this.zoom)
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.previewPanel {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.previewBody {
		width: 100%;
		box-sizing: border-box;
		background: $pr-page-bg;
		min-height: 0;
		overflow: hidden;
		position: relative;
	}

	.previewEmpty {
		padding: 80rpx 0;
		text-align: center;
		color: $pr-text-muted;
		font-size: 26rpx;
	}

	.previewZoom {
		position: absolute;
		right: 20rpx;
		bottom: calc(20rpx + env(safe-area-inset-bottom));
		z-index: 20;
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx;
		background: rgba(255, 252, 247, 0.95);
		border: 1rpx solid $pr-border-color;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

		&-btn {
			width: 56rpx;
			height: 56rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f5f2ec;
			border-radius: 12rpx;

			&:active {
				opacity: 0.75;
			}
		}

		&-img {
			width: 32rpx;
			height: 32rpx;
		}

		&-pct {
			min-width: 72rpx;
			padding: 0 8rpx;
			height: 56rpx;
			line-height: 56rpx;
			text-align: center;
			font-size: 22rpx;
			color: $pr-text-sub;
			font-weight: 600;
		}
	}
</style>
