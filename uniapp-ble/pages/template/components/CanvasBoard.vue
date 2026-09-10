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
			<view class="canvasInner" :style="innerStyle" @tap="onBlankTap" @click="onBlankTap">
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
					@tap.stop="onBlankTap"
					@click.stop="onBlankTap"
				>
					<view class="marginBox" :style="marginStyle"></view>

					<view
						v-for="item in viewElements"
						:key="item.id"
						:class="item.wrapClass"
						:style="elBoxStyle(item)"
						:data-id="item.id"
						@touchstart.stop="onElSelectStart"
						@tap.stop="onElClick"
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
							<view class="el-qr-grid"></view>
							<text class="el-qr-data">{{ item.data }}</text>
						</view>
						<view v-else-if="item.isImage" class="el-image">
							<image
								v-if="item.imagePath"
								class="el-image-img"
								:src="item.imagePath"
								mode="aspectFit"
							/>
							<text v-else class="el-caption">图</text>
						</view>
						<text
							v-else
							:class="item.textClass"
							:style="item.textStyle"
						>{{ item.content }}</text>

						<view v-if="item.selected" class="elOps" @touchstart.stop="noop" @tap.stop="noop">
							<view
								class="elOps-btn"
								@touchend.stop.prevent="onDeleteTap(item.id)"
								@click.stop="onDeleteTap(item.id)"
							>
								<image class="elOps-img" :src="icons.delete" mode="aspectFit" />
							</view>
							<view
								class="elOps-btn"
								:data-id="item.id"
								@touchstart.stop="onElMoveStart"
							>
								<image class="elOps-img" :src="icons.move" mode="aspectFit" />
							</view>
							<view
								class="elOps-btn"
								@touchend.stop.prevent="onSettingsTap(item.id)"
								@click.stop="onSettingsTap(item.id)"
							>
								<image class="elOps-img" :src="icons.settings" mode="aspectFit" />
							</view>
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
	import {
		applyElementSize,
		textCharHeightMm,
		estimateTextWidthMm,
		estimateTextMaxChars,
		wrapDesignText,
		truncateDesignText,
		normalizeElementRotate,
		normalizeAlignH,
		normalizeAlignV,
		qrSideMmFromUnit,
		TEMPLATE_ICONS,
	} from '../utils/elementTypes.js'
	import { STATIC_PRINT_IMAGES } from '../../print/ble/imagePrint.js'

	const RULER = 28

	function resolveImagePath(item) {
		if (!item) return ''
		if (item.imagePath) return item.imagePath
		const key = item.imageKey || ''
		if (!key) return ''
		const found = STATIC_PRINT_IMAGES.find(function (img) {
			return img.key === key
		})
		return (found && found.path) || ''
	}

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
				/** 拖拽中本地预览，避免每帧回写父级 elements */
				dragLive: null,
				icons: TEMPLATE_ICONS,
			}
		},
		computed: {
			pxPerMm() {
				return 4 * (Number(this.zoom) || 1)
			},
			paperW() {
				return Math.max(30, Number(this.paper.widthMm) || 80) * this.pxPerMm
			},
			paperH() {
				return Math.max(30, Number(this.paper.heightMm) || 100) * this.pxPerMm
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
				return this.buildTicks(Number(this.paper.widthMm) || 80, 'left')
			},
			yTicks() {
				return this.buildTicks(Number(this.paper.heightMm) || 100, 'top')
			},
			viewElements() {
				const that = this
				const list = this.elements || []
				return list.map(function (item) {
					const size = that.elSize(item)
					const s = that.pxPerMm
					const selected = that.selectedId === item.id
					const type = item.type || ''
					const mag = Math.max(1, Number(item.mag) || 1)
					const wrap = !!item.wrap
					const ellipsis = !!item.ellipsis
					const rotate = normalizeElementRotate(item.rotate)
					const alignH = normalizeAlignH(item.alignH)
					const alignV = normalizeAlignV(item.alignV)
					let textStyle = ''
					let textClass = 'el-text'
					let content = item.content || '文字'
					if (type === 'text') {
						const charMm = textCharHeightMm(item)
						const fontPx = Math.max(8, Math.round(charMm * s))
						const linePx = Math.max(fontPx, Math.round(charMm * s * 1.15))
						const boxW = Number(item.widthMm) || estimateTextWidthMm(content, charMm)
						const boxH = Number(item.heightMm) || charMm
						const maxChars = estimateTextMaxChars(boxW, mag)
						const lineHMm = charMm * 1.15
						if (wrap) {
							const maxLines = Math.max(1, Math.floor(boxH / lineHMm))
							const lines = wrapDesignText(content, maxChars, maxLines)
							if (ellipsis) {
								const full = wrapDesignText(content, maxChars, 40)
								if (full.length > maxLines && lines.length) {
									lines[lines.length - 1] = truncateDesignText(
										lines[lines.length - 1],
										maxChars
									)
								}
							}
							content = lines.join('\n')
						} else if (ellipsis) {
							content = truncateDesignText(
								String(content).replace(/\r?\n/g, ' '),
								maxChars
							)
						} else {
							content = String(content).replace(/\r?\n/g, ' ')
						}
						const justify =
							alignH === 'center'
								? 'center'
								: alignH === 'right'
									? 'flex-end'
									: 'flex-start'
						const alignItems =
							alignV === 'middle'
								? 'center'
								: alignV === 'bottom'
									? 'flex-end'
									: 'flex-start'
						textStyle =
							'font-size:' +
							fontPx +
							'px;line-height:' +
							linePx +
							'px;font-weight:' +
							(item.bold ? '700' : '400') +
							';justify-content:' +
							justify +
							';align-items:' +
							alignItems +
							';text-align:' +
							alignH +
							';'
						if (rotate) {
							textStyle +=
								'transform:rotate(' +
								rotate +
								'deg);transform-origin:center center;'
						}
						textClass = 'el-text'
						if (wrap) textClass += ' el-text--wrap'
						if (ellipsis) textClass += ' el-text--ellipsis'
						if (wrap) {
							textStyle +=
								'flex-direction:column;justify-content:' +
								alignItems +
								';align-items:stretch;'
						}
					}
					let imagePath = ''
					if (type === 'image') {
						imagePath = resolveImagePath(item)
					}
					return {
						id: item.id,
						type: type,
						data: item.data || '',
						content: content,
						selected: selected,
						mag: mag,
						wrap: wrap,
						textStyle: textStyle,
						textClass: textClass,
						imagePath: imagePath,
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
			this.cancelDragRaf()
			this.unbindDrag()
		},
		methods: {
			noop() {},
			elBoxStyle(item) {
				if (this.dragLive && item && this.dragLive.id === item.id) {
					return this.dragLive.style
				}
				return item.style
			},
			buildBoxStyle(xMm, yMm, wMm, hMm) {
				const s = this.pxPerMm
				return (
					'left:' +
					(Number(xMm) || 0) * s +
					'px;top:' +
					(Number(yMm) || 0) * s +
					'px;width:' +
					(Number(wMm) || 0) * s +
					'px;height:' +
					Math.max((Number(hMm) || 0) * s, 6) +
					'px;'
				)
			},
			cancelDragRaf() {
				if (this._dragRafId != null) {
					const cancel =
						typeof cancelAnimationFrame === 'function'
							? cancelAnimationFrame
							: clearTimeout
					cancel(this._dragRafId)
					this._dragRafId = null
				}
				this._dragRafScheduled = false
			},
			scheduleDragLive() {
				if (this._dragRafScheduled) return
				this._dragRafScheduled = true
				const that = this
				const raf =
					typeof requestAnimationFrame === 'function'
						? requestAnimationFrame
						: function (fn) {
								return setTimeout(fn, 16)
							}
				this._dragRafId = raf(function () {
					that._dragRafId = null
					that._dragRafScheduled = false
					that.applyDragLive()
				})
			},
			applyDragLive() {
				const drag = this.drag
				if (!drag || !drag.lastTouch) return
				const touch = drag.lastTouch
				const dxPx = touch.x - drag.startX
				const dyPx = touch.y - drag.startY
				if (!drag.moved && Math.abs(dxPx) + Math.abs(dyPx) < 4) return
				drag.moved = true
				if (drag.mode === 'pending') drag.mode = 'move'

				const s = this.pxPerMm
				const dx = dxPx / s
				const dy = dyPx / s

				if (drag.mode === 'move') {
					const maxX = Math.max(0, (Number(this.paper.widthMm) || 80) - 1)
					const maxY = Math.max(0, (Number(this.paper.heightMm) || 100) - 1)
					let nx = drag.originX + dx
					let ny = drag.originY + dy
					nx = Math.max(0, Math.min(maxX, Math.round(nx * 10) / 10))
					ny = Math.max(0, Math.min(maxY, Math.round(ny * 10) / 10))
					drag.liveX = nx
					drag.liveY = ny
					drag.liveW = drag.originW
					drag.liveH = drag.originH
					this.dragLive = {
						id: drag.id,
						style: this.buildBoxStyle(nx, ny, drag.originW, drag.originH),
					}
				} else if (drag.mode === 'resize') {
					const nw = Math.max(2, Math.round((drag.originW + dx) * 10) / 10)
					const nh = Math.max(1, Math.round((drag.originH + dy) * 10) / 10)
					drag.liveX = drag.originX
					drag.liveY = drag.originY
					drag.liveW = nw
					drag.liveH = nh
					this.dragLive = {
						id: drag.id,
						style: this.buildBoxStyle(drag.originX, drag.originY, nw, nh),
					}
				}
			},
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
					const charMm = textCharHeightMm(item)
					const content = String(item.content || '')
					const rotate = normalizeElementRotate(item.rotate)
					let boxW = Number(item.widthMm)
					if (!(boxW > 0)) boxW = estimateTextWidthMm(content, charMm)
					let boxH = Number(item.heightMm)
					if (!(boxH > 0)) boxH = charMm
					// 90°/270° 时交换占位宽高，便于选中框贴近旋转后的文字
					if (rotate === 90 || rotate === 270) {
						w = boxH
						h = boxW
					} else {
						w = boxW
						h = boxH
					}
				} else if (item.type === 'qrcode') {
					const side = qrSideMmFromUnit(item.unit, item.data, item.level)
					w = side
					h = side
				} else if (item.type === 'barcode') {
					w = w || 40
					h = h || 8
				} else if (item.type === 'image') {
					w = w || 10
					h = h || 10
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
			onBlankTap() {
				if (this._suppressSelectClear || this.drag) return
				this.$emit('select', '')
			},
			onElClick(e) {
				const id = this.getDatasetId(e)
				if (id) this.$emit('select', id)
			},
			onDeleteTap(id) {
				const nextId = id || this.selectedId
				if (!nextId || this._opsLock) return
				this._opsLock = true
				this.$emit('remove', nextId)
				const that = this
				setTimeout(function () {
					that._opsLock = false
				}, 320)
			},
			onSettingsTap(id) {
				const nextId = id || this.selectedId
				if (!nextId || this._opsLock) return
				this._opsLock = true
				this.$emit('settings', nextId)
				const that = this
				setTimeout(function () {
					that._opsLock = false
				}, 320)
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
				this.cancelDragRaf()
				this.dragLive = null
				this.drag = {
					id: item.id,
					mode: mode === 'select' ? 'pending' : mode,
					startX: touch.x,
					startY: touch.y,
					originX: Number(item.x) || 0,
					originY: Number(item.y) || 0,
					originW: size.w,
					originH: size.h,
					liveX: Number(item.x) || 0,
					liveY: Number(item.y) || 0,
					liveW: size.w,
					liveH: size.h,
					lastTouch: touch,
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
				this.drag.lastTouch = touch
				if (e.cancelable && e.preventDefault) e.preventDefault()
				this.scheduleDragLive()
			},
			onDragEnd() {
				this.cancelDragRaf()
				// 末帧再算一次，避免丢最后位移
				if (this.drag && this.drag.lastTouch) this.applyDragLive()

				const drag = this.drag
				const moved = !!(drag && drag.moved)
				if (moved && drag) {
					const el = this.findElement(drag.id)
					if (el) {
						if (drag.mode === 'move') {
							this.$emit(
								'change',
								Object.assign({}, el, {
									x: drag.liveX,
									y: drag.liveY,
								})
							)
						} else if (drag.mode === 'resize') {
							this.$emit('change', applyElementSize(el, drag.liveW, drag.liveH))
						}
					}
				}

				this.unbindDrag()
				this.drag = null
				this.dragLive = null
				if (moved) {
					this._suppressSelectClear = true
					const that = this
					setTimeout(function () {
						that._suppressSelectClear = false
					}, 80)
				}
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
			padding: 0 2px;
			overflow: hidden;
			white-space: nowrap;
			display: flex;
			align-items: center;
			justify-content: flex-start;
			box-sizing: border-box;
			width: 100%;
			height: 100%;

			&--wrap {
				white-space: pre-wrap;
				word-break: break-all;
			}

			&--ellipsis {
				text-overflow: ellipsis;
			}
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

		&-qr {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: stretch;
			justify-content: flex-end;
			background: #f5f5f5;
			overflow: hidden;
			padding: 4px;
			box-sizing: border-box;

			&-grid {
				flex: 1;
				min-height: 12px;
				background: repeating-linear-gradient(
					45deg,
					#2c2c2c 0,
					#2c2c2c 4px,
					#fff 4px,
					#fff 8px
				);
				border: 1px solid rgba(44, 44, 44, 0.3);
				box-sizing: border-box;
			}

			&-data {
				margin-top: 4px;
				font-size: 9px;
				line-height: 1.2;
				color: $pr-text-main;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				width: 100%;
			}
		}

		&-image {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #eee;
			overflow: hidden;
		}

		&-image-img {
			width: 100%;
			height: 100%;
			display: block;
		}
	}

	.elOps {
		position: absolute;
		left: 0;
		top: -40px;
		display: flex;
		flex-direction: row;
		z-index: 6;

		&-btn {
			width: 28px;
			height: 28px;
			margin-right: 6px;
			border-radius: 6px;
			background: #fff;
			border: 1px solid #2c2c2c;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
			box-sizing: border-box;
		}

		&-img {
			width: 16px;
			height: 16px;
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
