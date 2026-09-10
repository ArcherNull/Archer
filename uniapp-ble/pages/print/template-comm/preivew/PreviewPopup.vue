<template>
	<view v-if="visible" class="deviceMask deviceMask--elevated" @click="onMaskClick" @touchmove.stop.prevent>
		<view class="devicePanel devicePanel--solid previewPanel" :style="panelStyle" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">{{ title || '模板预览' }}</view>
				<view class="devicePanel-close" @click="close">×</view>
			</view>

			<scroll-view class="previewBody" scroll-y :style="bodyStyle">
				<view class="previewBody-inner">
					<CpclPreview v-if="hasOps" :ops="ops" />
					<view v-else class="previewEmpty">暂无预览数据</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import CpclPreview from './CpclPreview.vue'
	import { getWindowInfoSafe } from '../../comm/utils.js'

	function getWindowHeight() {
		try {
			const info = getWindowInfoSafe()
			return Number(info.windowHeight) || Number(info.screenHeight) || 667
		} catch (e) {
			return 667
		}
	}

	export default {
		name: 'PreviewPopup',
		components: { CpclPreview },
		props: {
			visible: {
				type: Boolean,
				default: false,
			},
			title: {
				type: String,
				default: '',
			},
			ops: {
				type: Array,
				default: function () {
					return []
				},
			},
			closeOnMask: {
				type: Boolean,
				default: true,
			},
		},
		data() {
			return {
				winH: 667,
			}
		},
		computed: {
			hasOps() {
				return Array.isArray(this.ops) && this.ops.length > 0
			},
			panelStyle() {
				const h = Math.round(this.winH * 0.78)
				return 'height:' + h + 'px;max-height:' + h + 'px;'
			},
			bodyStyle() {
				// 面板高 - 约头部高度，给 scroll-view 明确 px 高度（小程序最稳）
				const h = Math.max(280, Math.round(this.winH * 0.78) - 56)
				return 'height:' + h + 'px;width:100%;'
			},
		},
		watch: {
			visible: {
				immediate: true,
				handler: function (val) {
					if (val) {
						this.winH = getWindowHeight()
					}
				},
			},
		},
		methods: {
			onMaskClick() {
				if (this.closeOnMask) this.close()
			},
			close() {
				this.$emit('update:visible', false)
				this.$emit('close')
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../comm/common.scss';

	.previewPanel {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.previewBody {
		width: 100%;
		box-sizing: border-box;
		background: $pr-page-bg;
	}

	.previewBody-inner {
		padding: 24rpx 24rpx 48rpx;
		box-sizing: border-box;
		min-height: 240px;
	}

	.previewEmpty {
		padding: 80rpx 0;
		text-align: center;
		color: $pr-text-muted;
		font-size: 26rpx;
	}
</style>
