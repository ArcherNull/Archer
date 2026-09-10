<template>
	<view v-if="element" class="plainWrap">
		<view class="row">
			<text class="row-label">X (mm)</text>
			<NumberBox :value="element.x" :min="0" :max="80" @input="onX" />
		</view>
		<view class="row">
			<text class="row-label">Y (mm)</text>
			<NumberBox :value="element.y" :min="0" :max="1000" @input="onY" />
		</view>

		<template v-if="element.type === 'text'">
			<view class="field">
				<text class="field-label">内容</text>
				<input
					class="field-input"
					:value="element.content"
					placeholder="请输入文字"
					@input="onContent"
				/>
			</view>
			<view class="row">
				<text class="row-label">放大</text>
				<NumberBox :value="element.mag" :min="1" :max="4" @input="onMag" />
			</view>
			<view
				:class="['checkRow', element.bold ? 'checkRow--active' : '']"
				@click="onToggleBold"
			>
				<view
					:class="[
						'checkRow-box',
						element.bold ? 'checkRow-box--active' : 'checkRow-box--unactive',
					]"
				></view>
				<text class="checkRow-text">加粗</text>
			</view>
		</template>

		<template v-else-if="element.type === 'barcode'">
			<view class="field">
				<text class="field-label">数据</text>
				<input
					class="field-input"
					:value="element.data"
					placeholder="条码内容"
					@input="onData"
				/>
			</view>
			<view class="row">
				<text class="row-label">高度 (mm)</text>
				<NumberBox :value="element.heightMm" :min="3" :max="40" @input="onHeightMm" />
			</view>
			<view class="row">
				<text class="row-label">模块宽</text>
				<NumberBox :value="element.moduleWidth" :min="1" :max="4" @input="onModuleWidth" />
			</view>
		</template>

		<template v-else-if="element.type === 'qrcode'">
			<view class="field">
				<text class="field-label">数据</text>
				<input
					class="field-input"
					:value="element.data"
					placeholder="二维码内容"
					@input="onData"
				/>
			</view>
			<view class="row">
				<text class="row-label">单元大小</text>
				<NumberBox :value="element.unit" :min="1" :max="16" @input="onUnit" />
			</view>
			<view class="row">
				<text class="row-label">纠错等级</text>
				<NumberBox :value="element.level" :min="0" :max="3" @input="onLevel" />
			</view>
		</template>

		<template v-else-if="element.type === 'hline' || element.type === 'vline'">
			<view class="row">
				<text class="row-label">长度 (mm)</text>
				<NumberBox :value="element.lengthMm" :min="1" :max="1000" @input="onLength" />
			</view>
			<view class="row">
				<text class="row-label">线宽 (dot)</text>
				<NumberBox :value="element.thickness" :min="1" :max="10" @input="onThickness" />
			</view>
		</template>

		<template v-else-if="element.type === 'box'">
			<view class="row">
				<text class="row-label">宽 (mm)</text>
				<NumberBox :value="element.widthMm" :min="2" :max="80" @input="onWidthMm" />
			</view>
			<view class="row">
				<text class="row-label">高 (mm)</text>
				<NumberBox :value="element.heightMm" :min="2" :max="1000" @input="onHeightMm" />
			</view>
			<view class="row">
				<text class="row-label">线宽 (dot)</text>
				<NumberBox :value="element.thickness" :min="1" :max="10" @input="onThickness" />
			</view>
		</template>

		<template v-else-if="element.type === 'image'">
			<view class="tip">当前使用内置 Logo 位图（EG），可调整坐标与缩放</view>
			<view class="row">
				<text class="row-label">宽 (mm)</text>
				<NumberBox :value="element.widthMm" :min="2" :max="80" @input="onWidthMm" />
			</view>
			<view class="row">
				<text class="row-label">高 (mm)</text>
				<NumberBox :value="element.heightMm" :min="2" :max="80" @input="onHeightMm" />
			</view>
		</template>
	</view>
</template>

<script>
	import NumberBox from '../../print/components/NumberBox.vue'

	export default {
		name: 'ElementEditor',
		components: { NumberBox },
		props: {
			element: {
				type: Object,
				default: null,
			},
		},
		methods: {
			emitPatch(patch) {
				if (!this.element) return
				this.$emit('change', Object.assign({}, this.element, patch))
			},
			onX(val) {
				this.emitPatch({ x: Number(val) })
			},
			onY(val) {
				this.emitPatch({ y: Number(val) })
			},
			onContent(e) {
				const val = e && e.detail ? e.detail.value : ''
				this.emitPatch({ content: val })
			},
			onMag(val) {
				this.emitPatch({ mag: Number(val) })
			},
			onToggleBold() {
				this.emitPatch({ bold: !this.element.bold })
			},
			onData(e) {
				const val = e && e.detail ? e.detail.value : ''
				this.emitPatch({ data: val })
			},
			onHeightMm(val) {
				this.emitPatch({ heightMm: Number(val) })
			},
			onWidthMm(val) {
				this.emitPatch({ widthMm: Number(val) })
			},
			onModuleWidth(val) {
				this.emitPatch({ moduleWidth: Number(val) })
			},
			onUnit(val) {
				this.emitPatch({ unit: Number(val) })
			},
			onLevel(val) {
				this.emitPatch({ level: Number(val) })
			},
			onLength(val) {
				const n = Number(val)
				const patch = { lengthMm: n }
				if (this.element.type === 'hline') patch.widthMm = n
				if (this.element.type === 'vline') patch.heightMm = n
				this.emitPatch(patch)
			},
			onThickness(val) {
				this.emitPatch({ thickness: Number(val) })
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

	.field {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		padding: 12rpx 0;

		&-label {
			font-size: 26rpx;
			color: $pr-text-sub;
		}

		&-input {
			height: 72rpx;
			padding: 0 20rpx;
			border: 1rpx solid $pr-border-color;
			border-radius: 12rpx;
			background: #fff;
			font-size: 28rpx;
			color: $pr-text-main;
		}
	}

	.tip {
		padding: 16rpx 0;
		font-size: 24rpx;
		color: $pr-text-muted;
		line-height: 1.5;
	}

	.checkRow {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 16rpx 0;

		&-box {
			width: 32rpx;
			height: 32rpx;
			border-radius: 8rpx;
			box-sizing: border-box;

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

		&-text {
			font-size: 28rpx;
			color: $pr-text-main;
		}
	}
</style>
