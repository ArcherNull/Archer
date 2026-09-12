<template>
	<view class="plainWrap">
		<view class="sectionTip">常用尺寸（点击快速填充）</view>
		<view class="presetTags">
			<view
				v-for="item in presets"
				:key="item.label"
				:class="['presetTag', isPresetActive(item) ? 'presetTag--on' : '']"
				@click="onPreset(item)"
			>
				{{ item.label }}
			</view>
		</view>

		<view class="row">
			<text class="row-label">宽度 (mm)</text>
			<NumberBox
				:value="local.widthMm"
				:min="limits.widthMin"
				:max="limits.widthMax"
				@input="onNumWidth"
			/>
		</view>
		<view class="row">
			<text class="row-label">高度 (mm)</text>
			<NumberBox
				:value="local.heightMm"
				:min="limits.heightMin"
				:max="limits.heightMax"
				@input="onNumHeight"
			/>
		</view>

		<view class="sectionTip">上下左右偏移（默认 0.5mm）</view>
		<view class="marginGrid">
			<view class="row">
				<text class="row-label">上</text>
				<NumberBox
					:value="local.marginTop"
					:min="limits.marginMin"
					:max="limits.marginMax"
					@input="onNumMarginTop"
				/>
			</view>
			<view class="row">
				<text class="row-label">下</text>
				<NumberBox
					:value="local.marginBottom"
					:min="limits.marginMin"
					:max="limits.marginMax"
					@input="onNumMarginBottom"
				/>
			</view>
			<view class="row">
				<text class="row-label">左</text>
				<NumberBox
					:value="local.marginLeft"
					:min="limits.marginMin"
					:max="limits.marginMax"
					@input="onNumMarginLeft"
				/>
			</view>
			<view class="row">
				<text class="row-label">右</text>
				<NumberBox
					:value="local.marginRight"
					:min="limits.marginMin"
					:max="limits.marginMax"
					@input="onNumMarginRight"
				/>
			</view>
		</view>

		<view
			:class="[
				'checkRow',
				local.useGapSense ? 'checkRow--active' : 'checkRow--unactive',
			]"
			@click="toggleGap"
		>
			<view
				:class="[
					'checkRow-box',
					local.useGapSense ? 'checkRow-box--active' : 'checkRow-box--unactive',
				]"
			></view>
			<view class="gapText">
				<text class="gapText-title">标签缝定位</text>
				<text class="gapText-tip">默认开启（GAP-SENSE / SETFF）</text>
			</view>
		</view>

		<view
			:class="[
				'checkRow',
				snapAlignOn ? 'checkRow--active' : 'checkRow--unactive',
			]"
			@click="toggleSnapAlign"
		>
			<view
				:class="[
					'checkRow-box',
					snapAlignOn ? 'checkRow-box--active' : 'checkRow-box--unactive',
				]"
			></view>
			<view class="gapText">
				<text class="gapText-title">智能参考线吸附</text>
				<text class="gapText-tip">拖拽时对齐纸张与其他元素（默认开启）</text>
			</view>
		</view>
	</view>
</template>

<script>
	import NumberBox from '../../print/components/NumberBox.vue'
	import { PAPER_LIMITS, PAPER_PRESETS } from '../utils/elementTypes.js'

	export default {
		name: 'PaperSettings',
		components: { NumberBox },
		props: {
			paper: {
				type: Object,
				required: true,
			},
		},
		data() {
			return {
				limits: PAPER_LIMITS,
				presets: PAPER_PRESETS,
			}
		},
		computed: {
			local() {
				return this.paper || {}
			},
			/** 未设置时默认开启 */
			snapAlignOn() {
				return this.local.snapAlign !== false
			},
		},
		methods: {
			emitPatch(patch) {
				this.$emit('change', Object.assign({}, this.local, patch))
			},
			onNumWidth(val) {
				this.emitPatch({ widthMm: Number(val) })
			},
			onNumHeight(val) {
				this.emitPatch({ heightMm: Number(val) })
			},
			onNumMarginTop(val) {
				this.emitPatch({ marginTop: Number(val) })
			},
			onNumMarginBottom(val) {
				this.emitPatch({ marginBottom: Number(val) })
			},
			onNumMarginLeft(val) {
				this.emitPatch({ marginLeft: Number(val) })
			},
			onNumMarginRight(val) {
				this.emitPatch({ marginRight: Number(val) })
			},
			isPresetActive(item) {
				return (
					Number(this.local.widthMm) === Number(item.widthMm) &&
					Number(this.local.heightMm) === Number(item.heightMm)
				)
			},
			onPreset(item) {
				if (!item) return
				this.emitPatch({
					widthMm: Number(item.widthMm),
					heightMm: Number(item.heightMm),
				})
			},
			toggleGap() {
				this.emitPatch({ useGapSense: !this.local.useGapSense })
			},
			toggleSnapAlign() {
				this.emitPatch({ snapAlign: !this.snapAlignOn })
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.plainWrap {
		padding: 8rpx 16rpx 24rpx;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12rpx 0;
		gap: 16rpx;

		&-label {
			font-size: 28rpx;
			color: $pr-text-main;
			min-width: 160rpx;
		}
	}

	.sectionTip {
		margin-top: 8rpx;
		padding: 12rpx 0 4rpx;
		font-size: 24rpx;
		color: $pr-text-muted;
	}

	.presetTags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		padding: 4rpx 0 16rpx;
	}

	.presetTag {
		padding: 10rpx 20rpx;
		font-size: 24rpx;
		line-height: 1.3;
		color: $pr-text-main;
		background: $pr-surface-warm;
		border: 1rpx solid $pr-border-color;
		border-radius: 10rpx;

		&:active {
			opacity: 0.85;
		}

		&--on {
			color: $pr-theme-text;
			background: $pr-theme-soft;
			border-color: $pr-theme;
			font-weight: 600;
		}
	}

	.marginGrid {
		display: flex;
		flex-direction: column;
	}

	.checkRow {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-top: 20rpx;
		padding: 16rpx 0 4rpx;

		&-box {
			width: 32rpx;
			height: 32rpx;
			border-radius: 8rpx;
			box-sizing: border-box;
			flex-shrink: 0;

			&--active {
				border: 2rpx solid $pr-theme;
				background: $pr-theme;
				position: relative;

				&::after {
					content: '';
					position: absolute;
					left: 8rpx;
					top: 3rpx;
					width: 10rpx;
					height: 16rpx;
					border: 3rpx solid #fff;
					border-top: 0;
					border-left: 0;
					transform: rotate(45deg);
				}
			}

			&--unactive {
				border: 2rpx solid #cbbfae;
				background: #fff;
			}
		}
	}

	.gapText {
		display: flex;
		flex-direction: column;
		gap: 4rpx;

		&-title {
			font-size: 28rpx;
			color: $pr-text-main;
			font-weight: 600;
		}

		&-tip {
			font-size: 22rpx;
			color: $pr-text-muted;
		}
	}
</style>
