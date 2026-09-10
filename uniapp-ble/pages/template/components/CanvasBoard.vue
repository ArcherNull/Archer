<template>
	<view
		class="canvasRoot"
		@touchmove.stop.prevent="onRootTouchMove"
		@touchend="onRootTouchEnd"
		@touchcancel="onRootTouchEnd"
	>
		<scroll-view
			class="canvasScroll"
			scroll-x
			scroll-y
			:scroll-left="scrollLeft"
			:scroll-top="scrollTop"
		>
			<view class="canvasInner" :style="innerStyle">
				<view class="rulerCorner" :style="cornerStyle">mm</view>

				<view class="rulerX" :style="rulerXStyle">
					<view
						v-for="tick in xTicks"
						:key="tick.mm"
						class="tickX"
						:style="tick.style"
					>
						<view
							:class="tick.major ? 'tickX-line tickX-line--major' : 'tickX-line'"
						></view>
						<text v-if="tick.major" class="tickX-label">{{ tick.mm }}</text>
					</view>
				</view>

				<view class="rulerY" :style="rulerYStyle">
					<view
						v-for="tick in yTicks"
						:key="tick.mm"
						class="tickY"
						:style="tick.style"
					>
						<view
							:class="tick.major ? 'tickY-line tickY-line--major' : 'tickY-line'"
						></view>
						<text v-if="tick.major" class="tickY-label">{{ tick.mm }}</text>
					</view>
				</view>

				<view
					class="paper"
					:style="paperStyle"
					@click="onPaperClick"
					@touchstart.stop="onPaperTouchStart"
				>
					<view class="marginBox" :style="marginStyle"></view>

					<view
						v-for="item in viewElements"
						:key="item.id"
						:class="item.wrapClass"
						:style="item.style"
						:data-id="item.id"
						@touchstart.stop="onElSelectStart"
						@click.stop="onElClick"
					>
						<view v-if="item.isHline" class="el-hline"></view>
						<view v-else-if="item.isVline" class="el-vline"></view>
						<view v-else-if="item.isBox" class="el-box"></view>
						<view v-else-if="item.isBarcode" class="el-barcode">
							<view class="el-barcode-bars"></view>
							<text class="el-caption">{{ item.data }}</text>
						</view>
						<view v-else-if="item.isQrcode" class="el-qr">
							<text class="el-caption">QR</text>
						</view>
						<view v-else-if="item.isImage" class="el-image">
							<text class="el-caption">图</text>
						</view>
						<text v-else class="el-text">{{ item.content }}</text>

						<view v-if="item.selected" class="elOps" @touchstart.stop="noop" @click.stop="noop">
							<view class="elOps-btn" :data-id="item.id" @click.stop="onDeleteTap">⌫</view>
							<view
								class="elOps-btn"
								:data-id="item.id"
								@touchstart.stop="onElMoveStart"
							>✥</view>
							<view class="elOps-btn" :data-id="item.id" @click.stop="onSettingsTap">⚙</view>
						</view>
						<view
							v-if="item.selected"
							class="elHandle"
							:data-id="item.id"
							@touchstart.stop="onElResizeStart"
						></view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { applyElementSize } from '../utils/elementTypes.js'

	const RULER = 28

	export default {
		name: 'CanvasBoard',
		props: {
			paper: {
				type: Object,
				required: true,
			},
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
			zoom: {
				type: Number,
				default: 1,
			},
		},
		data() {
			return {
				scrollLeft: 0,
				scrollTop: 0,
				drag: null,
			}
		},
		computed: {
			pxPerMm() {
				return 4 * (Number(this.zoom) || 1)
			},
			paperW() {
				return Math.max(30, Number(this.paper.widthMm) || 75) * this.pxPerMm
			},
			paperH() {
				return Math.max(30, Number(this.paper.heightMm) || 90) * this.pxPerMm
			},
			innerStyle() {
				return (
					'width:' +
					(RULER + this.paperW + 40) +
					'px;height:' +
					(RULER + this.paperH + 40) +
					'px;'
				)
			},
			cornerStyle() {
				return 'width:' + RULER + 'px;height:' + RULER + 'px;'
			},
			rulerXStyle() {
				return (
					'left:' +
					RULER +
					'px;width:' +
					this.paperW +
					'px;height:' +
					RULER +
					'px;'
				)
			},
			rulerYStyle() {
				return (
					'top:' +
					RULER +
					'px;width:' +
					RULER +
					'px;height:' +
					this.paperH +
					'px;'
				)
			},
			paperStyle() {
				return (
					'left:' +
					RULER +
					'px;top:' +
					RULER +
					'px;width:' +
					this.paperW +
					'px;height:' +
					this.paperH +
					'px;'
				)
			},
			marginStyle() {
				const s = this.pxPerMm
				return (
					'top:' +
					(Number(this.paper.marginTop) || 0) * s +
					'px;right:' +
					(Number(this.paper.marginRight) || 0) * s +
					'px;bottom:' +
					(Number(this.paper.marginBottom) || 0) * s +
					'px;left:' +
					(Number(this.paper.marginLeft) || 0) * s +
					'px;'
				)
			},
			xTicks() {
				return this.buildTicks(Number(this.paper.widthMm) || 75, 'left')
			},
			yTicks() {
				return this.buildTicks(Number(this.paper.heightMm) || 90, 'top')
			},
			viewElements() {
				const that = this
				const list = this.elements || []
				return list.map(function (item) {
					const size = that.elSize(item)
					const s = that.pxPerMm
					const selected = that.selectedId === item.id
					const type = item.type || ''
					return {
						id: item.id,
						type: type,
						data: item.data || '',
						content: item.content || '文字',
						selected: selected,
						isHline: type === 'hline',
						isVline: type === 'vline',
						isBox: type === 'box',
						isBarcode: type === 'barcode',
						isQrcode: type === 'qrcode',
						isImage: type === 'image',
						wrapClass: selected ? 'el el--on' : 'el',
						style:
							'left:' +
							(Number(item.x) || 0) * s +
							'px;top:' +
							(Number(item.y) || 0) * s +
							'px;width:' +
							size.w * s +
							'px;height:' +
							Math.max(size.h * s, 6) +
							'px;',
					}
				})
			},
		},
		beforeDestroy() {
			this.unbindDrag()
		},
		methods: {
			noop() {},
			buildTicks(maxMm, axis) {
				const list = []
				const step = maxMm > 120 ? 10 : 5
				const minor = step === 10 ? 2 : 1
				const s = this.pxPerMm
				for (let mm = 0; mm <= maxMm; mm += minor) {
					const pos = mm * s
					list.push({
						mm: mm,
						major: mm % step === 0,
						style: axis === 'top' ? 'top:' + pos + 'px;' : 'left:' + pos + 'px;',
					})
				}
				return list
			},
			elSize(item) {
				let w = Number(item.widthMm)
				let h = Number(item.heightMm)
				if (item.type === 'hline') {
					w = Number(item.lengthMm) || w || 40
					h = Math.max(0.8, (Number(item.thickness) || 2) / 8)
				} else if (item.type === 'vline') {
					h = Number(item.lengthMm) || h || 20
					w = Math.max(0.8, (Number(item.thickness) || 2) / 8)
				} else if (item.type === 'text') {
					w = w || Math.max(20, String(item.content || '').length * 3)
					h = h || 5 * (Number(item.mag) || 1)
				} else if (item.type === 'qrcode') {
					const side = w || h || (Number(item.unit) || 4) * 4.625
					w = side
					h = side
				} else if (item.type === 'barcode') {
					w = w || 40
					h = h || 8
				} else if (item.type === 'image') {
					w = w || 8
					h = h || 7.25
				} else if (item.type === 'box') {
					w = w || 40
					h = h || 20
				}
				return { w: w, h: h }
			},
			getDatasetId(e) {
				const ds =
					(e && e.currentTarget && e.currentTarget.dataset) ||
					(e && e.target && e.target.dataset) ||
					{}
				return ds.id || ''
			},
			findElement(id) {
				if (!id) return null
				return (
					(this.elements || []).find(function (item) {
						return item.id === id
					}) || null
				)
			},
			onPaperClick() {
				this.$emit('select', '')
			},
			onPaperTouchStart() {},
			onElClick(e) {
				const id = this.getDatasetId(e)
				if (id) this.$emit('select', id)
			},
			onDeleteTap(e) {
				const id = this.getDatasetId(e)
				if (id) this.$emit('remove', id)
			},
			onSettingsTap(e) {
				const id = this.getDatasetId(e)
				if (id) this.$emit('settings', id)
			},
			getTouch(e) {
				const t =
					(e.touches && e.touches[0]) ||
					(e.changedTouches && e.changedTouches[0]) ||
					(e.detail && e.detail.touches && e.detail.touches[0])
				if (!t) return null
				return {
					x: t.clientX != null ? t.clientX : t.pageX,
					y: t.clientY != null ? t.clientY : t.pageY,
				}
			},
			startDrag(e, mode) {
				const id = this.getDatasetId(e)
				const item = this.findElement(id)
				const touch = this.getTouch(e)
				if (!touch || !item) return
				this.$emit('select', item.id)
				const size = this.elSize(item)
				this.drag = {
					id: item.id,
					mode: mode === 'select' ? 'pending' : mode,
					startX: touch.x,
					startY: touch.y,
					originX: Number(item.x) || 0,
					originY: Number(item.y) || 0,
					originW: size.w,
					originH: size.h,
					moved: false,
				}
				this.bindDrag()
			},
			onElSelectStart(e) {
				this.startDrag(e, 'select')
			},
			onElMoveStart(e) {
				this.startDrag(e, 'move')
			},
			onElResizeStart(e) {
				this.startDrag(e, 'resize')
			},
			onRootTouchMove(e) {
				if (this.drag) this.onDragMove(e)
			},
			onRootTouchEnd(e) {
				if (this.drag) this.onDragEnd(e)
			},
			bindDrag() {
				this.unbindDrag()
				const that = this
				this._onMove = function (ev) {
					that.onDragMove(ev)
				}
				this._onEnd = function (ev) {
					that.onDragEnd(ev)
				}
				// #ifdef H5
				if (typeof document !== 'undefined') {
					document.addEventListener('touchmove', this._onMove, { passive: false })
					document.addEventListener('touchend', this._onEnd)
					document.addEventListener('touchcancel', this._onEnd)
				}
				// #endif
			},
			unbindDrag() {
				// #ifdef H5
				if (typeof document !== 'undefined' && this._onMove) {
					document.removeEventListener('touchmove', this._onMove)
					document.removeEventListener('touchend', this._onEnd)
					document.removeEventListener('touchcancel', this._onEnd)
				}
				// #endif
				this._onMove = null
				this._onEnd = null
			},
			onDragMove(e) {
				if (!this.drag) return
				const touch = this.getTouch(e)
				if (!touch) return
				const dxPx = touch.x - this.drag.startX
				const dyPx = touch.y - this.drag.startY
				if (!this.drag.moved && Math.abs(dxPx) + Math.abs(dyPx) < 4) return
				this.drag.moved = true
				if (this.drag.mode === 'pending') this.drag.mode = 'move'
				if (e.cancelable && e.preventDefault) e.preventDefault()

				const s = this.pxPerMm
				const dx = dxPx / s
				const dy = dyPx / s
				const el = this.findElement(this.drag.id)
				if (!el) return

				if (this.drag.mode === 'move') {
					const maxX = Math.max(0, (Number(this.paper.widthMm) || 75) - 1)
					const maxY = Math.max(0, (Number(this.paper.heightMm) || 90) - 1)
					let nx = this.drag.originX + dx
					let ny = this.drag.originY + dy
					nx = Math.max(0, Math.min(maxX, Math.round(nx * 10) / 10))
					ny = Math.max(0, Math.min(maxY, Math.round(ny * 10) / 10))
					this.$emit('change', Object.assign({}, el, { x: nx, y: ny }))
				} else if (this.drag.mode === 'resize') {
					const nw = Math.max(2, this.drag.originW + dx)
					const nh = Math.max(1, this.drag.originH + dy)
					this.$emit('change', applyElementSize(el, nw, nh))
				}
			},
			onDragEnd() {
				this.unbindDrag()
				this.drag = null
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.canvasRoot {
		flex: 1;
		min-height: 0;
		width: 100%;
		height: 100%;
		background: #e8e0d4;
		position: relative;
	}

	.canvasScroll {
		width: 100%;
		height: 100%;
	}

	.canvasInner {
		position: relative;
		box-sizing: border-box;
	}

	.rulerCorner {
		position: absolute;
		left: 0;
		top: 0;
		z-index: 3;
		background: #d9cfc0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		color: #8a7a64;
		box-sizing: border-box;
		border-right: 1px solid #cbbfae;
		border-bottom: 1px solid #cbbfae;
	}

	.rulerX {
		position: absolute;
		top: 0;
		z-index: 2;
		background: #efe8dc;
		border-bottom: 1px solid #cbbfae;
		overflow: hidden;
	}

	.tickX {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 0;

		&-line {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 1px;
			height: 6px;
			background: #a89880;

			&--major {
				height: 12px;
				background: #6d5e4a;
			}
		}

		&-label {
			position: absolute;
			top: 2px;
			left: 2px;
			font-size: 9px;
			color: #6d5e4a;
			white-space: nowrap;
		}
	}

	.rulerY {
		position: absolute;
		left: 0;
		z-index: 2;
		background: #efe8dc;
		border-right: 1px solid #cbbfae;
		overflow: hidden;
	}

	.tickY {
		position: absolute;
		left: 0;
		right: 0;
		height: 0;

		&-line {
			position: absolute;
			right: 0;
			top: 0;
			height: 1px;
			width: 6px;
			background: #a89880;

			&--major {
				width: 12px;
				background: #6d5e4a;
			}
		}

		&-label {
			position: absolute;
			left: 1px;
			top: 2px;
			font-size: 9px;
			color: #6d5e4a;
			transform: scale(0.9);
			transform-origin: left top;
		}
	}

	.paper {
		position: absolute;
		background: #fff;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		overflow: visible;
	}

	.marginBox {
		position: absolute;
		border: 1px dashed rgba(196, 132, 26, 0.45);
		pointer-events: none;
		box-sizing: border-box;
		z-index: 0;
	}

	.el {
		position: absolute;
		box-sizing: border-box;
		border: 1px solid rgba(44, 44, 44, 0.2);
		background: rgba(249, 174, 61, 0.1);
		overflow: visible;
		z-index: 1;

		&--on {
			border-color: $pr-theme;
			background: rgba(249, 174, 61, 0.22);
			z-index: 5;
		}

		&-text {
			font-size: 11px;
			color: $pr-text-main;
			padding: 2px 4px;
			overflow: hidden;
			white-space: nowrap;
			display: block;
		}

		&-caption {
			font-size: 9px;
			color: $pr-text-sub;
			overflow: hidden;
			white-space: nowrap;
		}

		&-hline {
			position: absolute;
			left: 0;
			right: 0;
			top: 50%;
			height: 2px;
			margin-top: -1px;
			background: #2c2c2c;
		}

		&-vline {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 50%;
			width: 2px;
			margin-left: -1px;
			background: #2c2c2c;
		}

		&-box {
			position: absolute;
			left: 0;
			top: 0;
			right: 0;
			bottom: 0;
			border: 2px solid #2c2c2c;
			box-sizing: border-box;
		}

		&-barcode {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: stretch;
			justify-content: flex-end;
			padding: 2px;
			box-sizing: border-box;

			&-bars {
				flex: 1;
				background: repeating-linear-gradient(
					90deg,
					#2c2c2c 0,
					#2c2c2c 2px,
					#fff 2px,
					#fff 4px
				);
				min-height: 8px;
			}
		}

		&-qr,
		&-image {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #eee;
		}
	}

	.elOps {
		position: absolute;
		left: 0;
		top: -36px;
		display: flex;
		flex-direction: row;
		z-index: 6;

		&-btn {
			width: 28px;
			height: 28px;
			margin-right: 6px;
			border-radius: 6px;
			background: #2c2c2c;
			color: #fff;
			font-size: 14px;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
		}
	}

	.elHandle {
		position: absolute;
		right: -8px;
		bottom: -8px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: $pr-theme;
		border: 2px solid #fff;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
		z-index: 6;
	}
</style>
