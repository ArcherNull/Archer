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
				<textarea
					class="field-textarea"
					:value="element.content"
					placeholder="请输入文字"
					:auto-height="true"
					:maxlength="-1"
					@input="onContent"
				/>
			</view>
			<view class="row">
				<text class="row-label">宽 (mm)</text>
				<NumberBox :value="element.widthMm" :min="2" :max="80" @input="onWidthMm" />
			</view>
			<view class="row">
				<text class="row-label">高 (mm)</text>
				<NumberBox :value="element.heightMm" :min="1" :max="1000" @input="onHeightMm" />
			</view>
			<view class="row">
				<text class="row-label">放大</text>
				<NumberBox :value="element.mag" :min="1" :max="4" @input="onMag" />
			</view>
			<view class="field">
				<text class="field-label">旋转</text>
				<view class="rotateRow">
					<view
						v-for="item in rotateOptions"
						:key="item.value"
						:class="[
							'rotateChip',
							Number(element.rotate) === item.value ? 'rotateChip--on' : '',
						]"
						@click="onRotate(item.value)"
					>{{ item.label }}</view>
				</view>
			</view>
			<view class="field">
				<text class="field-label">水平对齐</text>
				<view class="rotateRow">
					<view
						v-for="item in alignHOptions"
						:key="item.value"
						:class="alignHChipClass(item.value)"
						@click="onAlignH(item.value)"
					>{{ item.label }}</view>
				</view>
			</view>
			<view class="field">
				<text class="field-label">垂直对齐</text>
				<view class="rotateRow">
					<view
						v-for="item in alignVOptions"
						:key="item.value"
						:class="alignVChipClass(item.value)"
						@click="onAlignV(item.value)"
					>{{ item.label }}</view>
				</view>
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
			<view
				:class="['checkRow', element.wrap ? 'checkRow--active' : '']"
				@click="onToggleWrap"
			>
				<view
					:class="[
						'checkRow-box',
						element.wrap ? 'checkRow-box--active' : 'checkRow-box--unactive',
					]"
				></view>
				<text class="checkRow-text">换行</text>
			</view>
			<view
				:class="['checkRow', element.ellipsis ? 'checkRow--active' : '']"
				@click="onToggleEllipsis"
			>
				<view
					:class="[
						'checkRow-box',
						element.ellipsis ? 'checkRow-box--active' : 'checkRow-box--unactive',
					]"
				></view>
				<text class="checkRow-text">内容超出省略</text>
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
			<view class="imgPanel-size">
				<view class="imgPanel-sizeTitle">图片尺寸（毫米）</view>
				<view class="row">
					<text class="row-label">宽 (mm)</text>
					<NumberBox :value="element.widthMm" :min="2" :max="80" @input="onWidthMm" />
				</view>
				<view class="row">
					<text class="row-label">高 (mm)</text>
					<NumberBox :value="element.heightMm" :min="2" :max="80" @input="onHeightMm" />
				</view>
				<view class="imgPanel-sizeHint">默认 10×10mm；可自行修改宽高</view>
			</view>

			<view class="imgPanel-quick" v-if="staticImages.length">
				<view class="imgPanel-quickTitle">快捷选图</view>
				<scroll-view class="imgPanel-quickScroll" scroll-x="true">
					<view class="imgPanel-quickList">
						<view
							v-for="item in staticImages"
							:key="item.key"
							:class="[
								'imgPanel-quickItem',
								currentImagePath === item.path ? 'imgPanel-quickItem--on' : '',
							]"
							@click="onPickStatic(item)"
						>
							<image class="imgPanel-quickThumb" :src="item.path" mode="aspectFit" />
							<text class="imgPanel-quickName">{{ item.label }}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<view v-if="currentImagePath" class="imgPanel-preview">
				<image class="imgPanel-img" :src="currentImagePath" mode="aspectFit" />
				<view class="imgPanel-meta">
					{{ element.widthMm }}×{{ element.heightMm }} mm
					<text v-if="currentImageLabel"> · {{ currentImageLabel }}</text>
				</view>
				<view class="imgPanel-actions">
					<view class="imgPanel-action" @click="onChooseAlbum">相册上传</view>
					<view class="imgPanel-action imgPanel-action--danger" @click="onClearImage"
						>清除</view
					>
				</view>
			</view>
			<view v-else class="imgPanel-empty" @click="onChooseAlbum">
				<view class="imgPanel-emptyTitle">点击上传图片</view>
				<view class="imgPanel-emptyHint"
					>仅支持 png / jpg，且不超过 100KB；也可上方快捷选图</view
				>
			</view>
		</template>
	</view>
</template>

<script>
	import NumberBox from '../../print/components/NumberBox.vue'
	import {
		STATIC_PRINT_IMAGES,
		choosePrintImage,
	} from '../../print/ble/imagePrint.js'
	import { showMsg } from '../../print/comm/utils.js'
	import {
		TEXT_ROTATE_OPTIONS,
		TEXT_ALIGN_H_OPTIONS,
		TEXT_ALIGN_V_OPTIONS,
		normalizeAlignH,
		normalizeAlignV,
		qrSideMmFromUnit,
	} from '../utils/elementTypes.js'

	export default {
		name: 'ElementEditor',
		components: { NumberBox },
		props: {
			element: {
				type: Object,
				default: null,
			},
		},
		data() {
			return {
				staticImages: STATIC_PRINT_IMAGES.slice(),
				rotateOptions: TEXT_ROTATE_OPTIONS,
				alignHOptions: TEXT_ALIGN_H_OPTIONS,
				alignVOptions: TEXT_ALIGN_V_OPTIONS,
			}
		},
		computed: {
			currentAlignH() {
				return normalizeAlignH(this.element && this.element.alignH)
			},
			currentAlignV() {
				return normalizeAlignV(this.element && this.element.alignV)
			},
			currentImagePath() {
				const el = this.element
				if (!el || el.type !== 'image') return ''
				if (el.imagePath) return el.imagePath
				const key = el.imageKey || ''
				const found = this.staticImages.find(function (item) {
					return item.key === key
				})
				return (found && found.path) || ''
			},
			currentImageLabel() {
				const path = this.currentImagePath
				if (!path) return ''
				const found = this.staticImages.find(function (item) {
					return item.path === path
				})
				if (found) return found.label
				return this.element && this.element.imageKey === 'custom' ? '自定义' : ''
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
				const mag = Math.max(1, Math.min(4, Number(val) || 1))
				this.emitPatch({ mag: mag })
			},
			onToggleBold() {
				this.emitPatch({ bold: !this.element.bold })
			},
			onToggleWrap() {
				this.emitPatch({ wrap: !this.element.wrap })
			},
			onToggleEllipsis() {
				this.emitPatch({ ellipsis: !this.element.ellipsis })
			},
			onRotate(val) {
				this.emitPatch({ rotate: Number(val) || 0 })
			},
			onAlignH(val) {
				this.emitPatch({ alignH: normalizeAlignH(val) })
			},
			onAlignV(val) {
				this.emitPatch({ alignV: normalizeAlignV(val) })
			},
			alignHChipClass(val) {
				return this.currentAlignH === val ? 'rotateChip rotateChip--on' : 'rotateChip'
			},
			alignVChipClass(val) {
				return this.currentAlignV === val ? 'rotateChip rotateChip--on' : 'rotateChip'
			},
			onData(e) {
				const val = e && e.detail ? e.detail.value : ''
				if (this.element && this.element.type === 'qrcode') {
					const unit = Math.max(1, Math.min(16, Number(this.element.unit) || 4))
					const level = Number(this.element.level)
					const side = qrSideMmFromUnit(unit, val, level)
					this.emitPatch({
						data: val,
						widthMm: side,
						heightMm: side,
					})
					return
				}
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
				const unit = Math.max(1, Math.min(16, Number(val) || 4))
				const side = qrSideMmFromUnit(
					unit,
					this.element && this.element.data,
					this.element && this.element.level
				)
				this.emitPatch({
					unit: unit,
					widthMm: side,
					heightMm: side,
				})
			},
			onLevel(val) {
				const level = Number(val)
				if (this.element && this.element.type === 'qrcode') {
					const unit = Math.max(1, Math.min(16, Number(this.element.unit) || 4))
					const side = qrSideMmFromUnit(unit, this.element.data, level)
					this.emitPatch({
						level: level,
						widthMm: side,
						heightMm: side,
					})
					return
				}
				this.emitPatch({ level: level })
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
			onPickStatic(item) {
				if (!item || !item.path) return
				this.emitPatch({
					imageKey: item.key,
					imagePath: item.path,
					name: item.label || '图片',
				})
			},
			async onChooseAlbum() {
				try {
					const path = await choosePrintImage()
					if (!path) return
					this.emitPatch({
						imageKey: 'custom',
						imagePath: path,
						name: '自定义图片',
					})
				} catch (err) {
					const msg = (err && err.errMsg) || (err && err.message) || ''
					if (msg && /cancel|取消/i.test(msg)) return
					showMsg(msg || '选择图片失败')
				}
			},
			onClearImage() {
				this.emitPatch({
					imageKey: '',
					imagePath: '',
					name: '图片',
				})
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

	.field-textarea {
		min-height: 120rpx;
		width: 100%;
		padding: 16rpx 20rpx;
		border: 1rpx solid $pr-border-color;
		border-radius: 12rpx;
		background: #fff;
		font-size: 28rpx;
		color: $pr-text-main;
		box-sizing: border-box;
		line-height: 1.5;
	}

	.rotateRow {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.rotateChip {
		min-width: 88rpx;
		padding: 10rpx 16rpx;
		border-radius: 999rpx;
		border: 1rpx solid $pr-border-color;
		background: $pr-surface-warm;
		text-align: center;
		font-size: 24rpx;
		color: $pr-text-sub;
		font-weight: 600;

		&--on {
			border-color: $pr-theme;
			background: $pr-theme-soft;
			color: $pr-theme-text;
		}
	}

	.tip {
		padding: 16rpx 0;
		font-size: 24rpx;
		color: $pr-text-muted;
		line-height: 1.5;
	}

	.imgPanel-size {
		margin: 8rpx 0 16rpx;
		padding: 8rpx 0;
	}

	.imgPanel-sizeTitle {
		font-size: 26rpx;
		font-weight: 700;
		color: $pr-text-main;
		margin-bottom: 4rpx;
	}

	.imgPanel-sizeHint {
		margin-top: 4rpx;
		font-size: 22rpx;
		color: $pr-text-muted;
		line-height: 1.4;
	}

	.imgPanel-quick {
		margin-bottom: 16rpx;
	}

	.imgPanel-quickTitle {
		font-size: 26rpx;
		font-weight: 700;
		color: $pr-text-main;
		margin-bottom: 10rpx;
	}

	.imgPanel-quickScroll {
		width: 100%;
		white-space: nowrap;
	}

	.imgPanel-quickList {
		display: inline-flex;
		gap: 12rpx;
		padding-bottom: 4rpx;
	}

	.imgPanel-quickItem {
		width: 120rpx;
		padding: 10rpx;
		border-radius: 12rpx;
		border: 2rpx solid $pr-border-color;
		background: $pr-surface-warm;
		text-align: center;
		box-sizing: border-box;

		&--on {
			border-color: $pr-theme;
			background: $pr-theme-soft;
		}
	}

	.imgPanel-quickThumb {
		width: 72rpx;
		height: 72rpx;
		background: #fff;
		border-radius: 8rpx;
	}

	.imgPanel-quickName {
		display: block;
		margin-top: 6rpx;
		font-size: 20rpx;
		color: $pr-text-sub;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.imgPanel-empty {
		padding: 40rpx 28rpx;
		border: 2rpx dashed $pr-border-dashed;
		border-radius: 14rpx;
		background: $pr-surface-warm;
		text-align: center;
	}

	.imgPanel-emptyTitle {
		font-size: 28rpx;
		font-weight: 700;
		color: $pr-text-main;
	}

	.imgPanel-emptyHint {
		margin-top: 12rpx;
		font-size: 22rpx;
		color: $pr-text-muted;
		line-height: 1.5;
	}

	.imgPanel-preview {
		padding: 16rpx;
		border: 2rpx solid $pr-theme;
		border-radius: 14rpx;
		background: $pr-theme-soft;
	}

	.imgPanel-img {
		width: 100%;
		height: 220rpx;
		display: block;
		border-radius: 10rpx;
		background: #fff;
	}

	.imgPanel-meta {
		margin-top: 12rpx;
		font-size: 22rpx;
		color: $pr-text-sub;
		line-height: 1.4;
	}

	.imgPanel-actions {
		margin-top: 16rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.imgPanel-action {
		padding: 10rpx 18rpx;
		border-radius: 999rpx;
		background: #fff;
		border: 1rpx solid $pr-border-color;
		color: $pr-text-muted;
		font-size: 22rpx;
		font-weight: 600;
		white-space: nowrap;

		&--danger {
			border-color: rgba(221, 82, 77, 0.35);
			color: $pr-danger;
		}
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
