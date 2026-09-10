<template>
	<view
		v-if="visible"
		class="deviceMask deviceMask--elevated"
		@click="onMaskClick"
		@touchmove.stop.prevent
	>
		<view class="devicePanel devicePanel--solid cmdPanel" :style="panelStyle" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">{{ title || '查看指令' }}</view>
				<view class="devicePanel-close" @click="close">×</view>
			</view>

			<view v-if="showBrandTabs" class="brandTabs">
				<view
					v-for="item in brandTabList"
					:key="item.key"
					:class="['brandTabs-item', activeBrand === item.key ? 'brandTabs-item--on' : '']"
					@click="setBrand(item.key)"
				>{{ item.label }}</view>
			</view>

			<scroll-view class="cmdBody" scroll-y>
				<view class="cmdBody-inner">
					<text v-if="displayCommandText" class="cmdText" selectable user-select>{{ displayCommandText }}</text>
					<view v-else class="cmdEmpty">暂无打印指令</view>
				</view>
			</scroll-view>

			<view class="devicePanel-footer cmdFooter">
				<button
					class="action-btn action-btn--lg action-btn--primary copyBtn"
					:disabled="!displayCommandText"
					@click="onCopy"
				>
					复制
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { showMsg, getWindowInfoSafe } from '../comm/utils.js'

	const BRAND_TAB_LIST = [
		{ key: 'CC3', label: 'CC3' },
		{ key: 'HM', label: 'HM' },
	]

	function getWindowHeight() {
		try {
			const info = getWindowInfoSafe()
			return Number(info.windowHeight) || Number(info.screenHeight) || 667
		} catch (e) {
			return 667
		}
	}

	export default {
		name: 'CommandPopup',
		props: {
			visible: {
				type: Boolean,
				default: false,
			},
			title: {
				type: String,
				default: '',
			},
			/** 品牌模板等单份指令 */
			commandText: {
				type: String,
				default: '',
			},
			/** 通用模板：是否展示 CC3 / HM 切换 */
			showBrandTabs: {
				type: Boolean,
				default: false,
			},
			/** 通用模板各品牌指令，如 { CC3: '...', HM: '...' } */
			commandsByBrand: {
				type: Object,
				default: function () {
					return {}
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
				activeBrand: 'CC3',
				brandTabList: BRAND_TAB_LIST,
			}
		},
		computed: {
			displayCommandText() {
				if (this.showBrandTabs) {
					const map = this.commandsByBrand || {}
					return String(map[this.activeBrand] || '')
				}
				return String(this.commandText || '')
			},
			panelStyle() {
				const h = Math.round(this.winH * 0.78)
				return 'height:' + h + 'px;max-height:' + h + 'px;'
			},
		},
		watch: {
			visible: {
				immediate: true,
				handler: function (val) {
					if (val) {
						this.winH = getWindowHeight()
						this.activeBrand = 'CC3'
					}
				},
			},
		},
		methods: {
			setBrand(brand) {
				const next = brand === 'HM' ? 'HM' : 'CC3'
				if (next === this.activeBrand) return
				this.activeBrand = next
			},
			onMaskClick() {
				if (this.closeOnMask) this.close()
			},
			close() {
				this.$emit('update:visible', false)
				this.$emit('close')
			},
			onCopy() {
				const text = String(this.displayCommandText || '')
				if (!text) {
					showMsg('暂无指令可复制')
					return
				}
				uni.setClipboardData({
					data: text,
					success: function () {
						showMsg('已复制到剪贴板', 'success')
					},
					fail: function () {
						showMsg('复制失败')
					},
				})
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../comm/common.scss';

	.cmdPanel {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		/* 覆盖 devicePanel--solid 的底部 padding，避免按钮下多出一截空白 */
		padding-bottom: 0 !important;
	}

	.brandTabs {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 12rpx 28rpx 8rpx;
		background: #fff;
		border-bottom: 1rpx solid $pr-border-light;
		flex-shrink: 0;

		&-item {
			min-width: 96rpx;
			padding: 10rpx 24rpx;
			border-radius: 999rpx;
			text-align: center;
			font-size: 24rpx;
			font-weight: 600;
			color: $pr-text-muted;
			background: $pr-theme-soft;

			&--on {
				background: $pr-theme;
				color: #fff;
			}
		}
	}

	.cmdBody {
		flex: 1;
		height: 0;
		width: 100%;
		box-sizing: border-box;
		background: $pr-page-bg;
	}

	.cmdBody-inner {
		padding: 24rpx 24rpx 32rpx;
		box-sizing: border-box;
		min-height: 200px;
	}

	.cmdText {
		display: block;
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 22rpx;
		border-radius: 12rpx;
		background: #1e1e1e;
		color: #d4d4d4;
		font-size: 22rpx;
		line-height: 1.55;
		font-family: Consolas, Monaco, 'Courier New', monospace;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.cmdEmpty {
		padding: 80rpx 0;
		text-align: center;
		color: $pr-text-muted;
		font-size: 26rpx;
	}

	.cmdFooter {
		justify-content: stretch;
		padding: 20rpx 28rpx calc(20rpx + env(safe-area-inset-bottom));
	}

	.copyBtn {
		width: 100%;
		margin: 0;
	}
</style>
