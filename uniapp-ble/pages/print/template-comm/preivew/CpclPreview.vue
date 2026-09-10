<template>
	<view class="cpclPreview">
		<view class="cpclPreview-paper" :style="paperStyleStr">
			<view
				v-for="(op, index) in renderOps"
				:key="index"
				:class="'cpclPreview-op cpclPreview-op--' + op.type + (op.vertical ? ' is-vertical' : '')"
				:style="op.styleStr"
			>
				<text v-if="op.type === 'text'" class="cpclPreview-text" :style="op.textStyleStr">{{ op.content }}</text>

				<!-- 横/纵条码：灰底实线框，仅展示「条形码：内容」 -->
				<view
					v-else-if="op.type === 'barcode'"
					:class="['cpclPreview-codeBox', op.vertical ? 'cpclPreview-codeBox--v' : '']"
				>
					<text :class="['cpclPreview-codeLabel', op.vertical ? 'cpclPreview-codeLabel--v' : '']">
						{{ op.content }}
					</text>
				</view>

				<!-- 二维码：灰底实线框，中间「二维码：内容」，无图案 -->
				<view v-else-if="op.type === 'qr'" class="cpclPreview-codeBox cpclPreview-codeBox--qr">
					<text class="cpclPreview-codeLabel cpclPreview-codeLabel--qr">{{ op.content }}</text>
				</view>

				<view v-else-if="op.type === 'logo'" class="cpclPreview-logoInner">
					<text class="cpclPreview-logoText">LOGO</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	/** 预览纸面显示宽度（px） */
	const PREVIEW_PAPER_WIDTH_PX = 300

	const FONT_DOT_MAP = {
		0: 12,
		1: 12,
		2: 8,
		3: 20,
		4: 32,
		7: 24,
		8: 24,
		20: 16,
		24: 24,
		55: 16,
	}

	function resolveFontPx(font, size, mag, scale) {
		const f = Number(font)
		const sz = Number(size)
		const m = Math.max(Number(mag) || 1, 1)
		let baseDots = 24
		if (sz > 0) {
			baseDots = sz
		} else if (FONT_DOT_MAP[f] != null) {
			baseDots = FONT_DOT_MAP[f]
		}
		return Math.max(8, Math.round(baseDots * m * scale * 0.72))
	}

	function truncateLabel(str, maxLen) {
		const s = String(str == null ? '' : str)
		if (s.length <= maxLen) return s
		return s.slice(0, Math.max(1, maxLen - 1)) + '…'
	}

	/**
	 * Code128 符号长度估算（dot）
	 * 约：(数据长度 + 起始终止校验) × 11 modules × moduleWidth + 静区
	 */
	function estimateCode128RunDots(data, moduleWidth) {
		const mw = Math.max(Number(moduleWidth) || 2, 1)
		const len = Math.max(String(data || '').length, 1)
		return Math.max(160, (len + 3) * 11 * mw + 20)
	}

	/** 粗估文本宽度（px），用于 CENTER / RIGHT 预览 */
	function estimateTextWidthPx(str, fs) {
		const s = String(str == null ? '' : str)
		let w = 0
		for (let i = 0; i < s.length; i++) {
			const code = s.charCodeAt(i)
			w += code > 0x7f ? fs : fs * 0.55
		}
		return Math.max(fs * 0.5, w)
	}

	/**
	 * CPCL 对齐：LEFT 以 x 为左缘；CENTER 以 pageW/2+x 为基准；RIGHT 以 x(0=纸右) 为右缘
	 * @param {{ anchor?: 'start'|'center' }} [opts] logo 用 start（x 为左缘相对纸心偏移）
	 */
	function resolveAlignedLeftPx(align, xDots, widthDots, pageWDots, scale, opts) {
		const a = String(align || 'LEFT').toUpperCase()
		const x = Number(xDots) || 0
		const w = Math.max(0, Number(widthDots) || 0)
		const pageW = Number(pageWDots) || 576
		const anchor = (opts && opts.anchor) || 'center'
		let leftDots = x
		if (a === 'CENTER') {
			leftDots = anchor === 'start' ? pageW / 2 + x : pageW / 2 + x - w / 2
		} else if (a === 'RIGHT') {
			const rightEdge = x <= 0 ? pageW : x
			leftDots = rightEdge - w
		}
		return Math.round(leftDots * scale)
	}

	/** 纵条码预览占位最大长度（px），过长会导致 y 变化不明显 */
	const PREVIEW_VBAR_MAX_RUN_PX = 168

	/**
	 * 是否为「纸向竖排」模板（VTEXT/VT 占主导）
	 * 这类模板打印后需顺时针看 90° 才是人眼阅读方向，预览需同步旋转
	 */
	function detectRotate90(ops) {
		let v = 0
		let h = 0
		;(ops || []).forEach(function (op) {
			if (!op || op.type !== 'text') return
			if (op.vertical) v += 1
			else h += 1
		})
		const total = v + h
		if (total <= 0) return false
		return v >= Math.max(1, Math.ceil(total * 0.5))
	}

	/**
	 * CPCL 坐标 → 预览阅读坐标（顺时针 90°）
	 * 纸面左缘变为预览顶边：newX = pageH - y, newY = x
	 * 旋转后纸宽 = 原 pageH，纸高 = 原 pageW
	 */
	function rotCw90(x, y, pageH) {
		return {
			x: pageH - (Number(y) || 0),
			y: Number(x) || 0,
		}
	}

	function rotRectCw90(x1, y1, x2, y2, pageH) {
		const a = rotCw90(x1, y1, pageH)
		const b = rotCw90(x2, y1, pageH)
		const c = rotCw90(x1, y2, pageH)
		const d = rotCw90(x2, y2, pageH)
		const xs = [a.x, b.x, c.x, d.x]
		const ys = [a.y, b.y, c.y, d.y]
		return {
			x1: Math.min.apply(null, xs),
			y1: Math.min.apply(null, ys),
			x2: Math.max.apply(null, xs),
			y2: Math.max.apply(null, ys),
		}
	}

	export default {
		name: 'CpclPreview',
		props: {
			ops: {
				type: Array,
				default: function () {
					return []
				},
			},
		},
		computed: {
			pageMeta() {
				let width = 576
				let height = 400
				;(this.ops || []).forEach(function (op) {
					if (!op) return
					if (op.type === 'pageWidth' && op.width) width = Number(op.width) || width
					if (op.type === 'page' && op.height) height = Number(op.height) || height
					if (op.type === 'page' && op.width) width = Number(op.width) || width
				})
				return {
					width: width > 0 ? width : 576,
					height: height > 0 ? height : 400,
				}
			},
			/** 竖排主导模板：预览按阅读方向旋转 90° */
			rotate90() {
				return detectRotate90(this.ops)
			},
			/** 预览坐标系下的纸面宽高（dot） */
			displayMeta() {
				const m = this.pageMeta
				if (this.rotate90) {
					return { width: m.height, height: m.width }
				}
				return { width: m.width, height: m.height }
			},
			scale() {
				return PREVIEW_PAPER_WIDTH_PX / this.displayMeta.width
			},
			paperPx() {
				const s = this.scale
				return {
					w: PREVIEW_PAPER_WIDTH_PX,
					h: Math.max(200, Math.round(this.displayMeta.height * s)),
				}
			},
			paperStyleStr() {
				const p = this.paperPx
				return 'width:' + p.w + 'px;height:' + p.h + 'px;min-height:' + p.h + 'px;'
			},
			renderOps() {
				const s = this.scale
				const rotate = this.rotate90
				const pageH = this.pageMeta.height
				const pageWDots = this.displayMeta.width
				const paperW = this.paperPx.w
				const paperHpx = this.paperPx.h
				let mag = 1
				let bold = 0
				let align = 'LEFT'
				const list = []

				function mapPt(x, y) {
					if (!rotate) return { x: Number(x) || 0, y: Number(y) || 0 }
					return rotCw90(x, y, pageH)
				}

				;(this.ops || []).forEach(function (op) {
					if (!op || !op.type) return
					if (op.type === 'align') {
						const d = String(op.dir || 'LEFT').toUpperCase()
						align = d === 'CENTER' || d === 'RIGHT' ? d : 'LEFT'
						return
					}
					if (op.type === 'setMag') {
						mag = Math.max(Number(op.w) || 1, Number(op.h) || 1, 1)
						return
					}
					if (op.type === 'setBold') {
						bold = Number(op.n) || 0
						return
					}
					if (op.type === 'text') {
						const fs = resolveFontPx(op.font, op.size, mag, s)
						const weight = bold > 0 || mag >= 2 ? (bold >= 2 ? '800' : '700') : '400'
						const pt = mapPt(op.x, op.y)
						const rot = Number(op.rotate) || 0
						const vertical = rotate ? false : !!op.vertical && !rot
						const textAlign = op.align || align
						const textWDots = vertical
							? fs / s
							: estimateTextWidthPx(op.content || '', fs) / s
						const left = rotate
							? Math.round(pt.x * s)
							: resolveAlignedLeftPx(textAlign, pt.x, textWDots, pageWDots, s)
						let textStyle =
							'font-size:' + fs + 'px;font-weight:' + weight + ';'
						if (vertical) {
							textStyle += 'writing-mode:vertical-rl;'
						} else if (rot === 90 || rot === 180 || rot === 270) {
							textStyle +=
								'transform:rotate(' +
								rot +
								'deg);transform-origin:left top;display:inline-block;'
						}
						list.push({
							type: 'text',
							content: op.content || '',
							vertical: vertical,
							styleStr: 'left:' + left + 'px;top:' + Math.round(pt.y * s) + 'px;',
							textStyleStr: textStyle,
						})
						return
					}
					if (op.type === 'line') {
						let x1 = Number(op.x1) || 0
						let y1 = Number(op.y1) || 0
						let x2 = Number(op.x2) || 0
						let y2 = Number(op.y2) || 0
						if (rotate) {
							const r = rotRectCw90(x1, y1, x2, y2, pageH)
							x1 = r.x1
							y1 = r.y1
							x2 = r.x2
							y2 = r.y2
						}
						const w = Math.max(Number(op.w) || 1, 1)
						const horizontal = Math.abs(y2 - y1) <= Math.abs(x2 - x1)
						if (horizontal) {
							list.push({
								type: 'line',
								styleStr:
									'left:' + Math.round(Math.min(x1, x2) * s) +
									'px;top:' + Math.round(y1 * s) +
									'px;width:' + Math.max(1, Math.round(Math.abs(x2 - x1) * s)) +
									'px;height:' + Math.max(1, Math.round(w * s)) +
									'px;background-color:#222;',
							})
						} else {
							list.push({
								type: 'line',
								styleStr:
									'left:' + Math.round(x1 * s) +
									'px;top:' + Math.round(Math.min(y1, y2) * s) +
									'px;width:' + Math.max(1, Math.round(w * s)) +
									'px;height:' + Math.max(1, Math.round(Math.abs(y2 - y1) * s)) +
									'px;background-color:#222;',
							})
						}
						return
					}
					if (op.type === 'box') {
						let x1 = Number(op.x1) || 0
						let y1 = Number(op.y1) || 0
						let x2 = Number(op.x2) || 0
						let y2 = Number(op.y2) || 0
						if (rotate) {
							const r = rotRectCw90(x1, y1, x2, y2, pageH)
							x1 = r.x1
							y1 = r.y1
							x2 = r.x2
							y2 = r.y2
						}
						const bw = Math.max(1, Math.round((Number(op.w) || 1) * s))
						list.push({
							type: 'box',
							styleStr:
								'left:' + Math.round(Math.min(x1, x2) * s) +
								'px;top:' + Math.round(Math.min(y1, y2) * s) +
								'px;width:' + Math.max(1, Math.round(Math.abs(x2 - x1) * s)) +
								'px;height:' + Math.max(1, Math.round(Math.abs(y2 - y1) * s)) +
								'px;border:' + bw + 'px solid #222;box-sizing:border-box;',
						})
						return
					}
					if (op.type === 'barcode') {
						const data = op.data || ''
						const barHDots = Number(op.height) || 50
						const runDots = estimateCode128RunDots(data, op.moduleWidth)
						const runPx = Math.round(runDots * s)
						const thickPx = Math.max(18, Math.round(barHDots * s))
						let isV = op.orient === 'v'
						const pt = mapPt(op.x, op.y)
						if (rotate) {
							isV = op.orient === 'h'
						}
						let left = Math.round(pt.x * s)
						let boxW
						let boxH
						let styleStr
						if (isV) {
							boxW = thickPx
							boxH = Math.min(runPx, PREVIEW_VBAR_MAX_RUN_PX)
							const anchorY = Math.round(pt.y * s)
							const bottom = Math.max(0, paperHpx - anchorY)
							if (boxH > anchorY) boxH = Math.max(12, anchorY)
							styleStr =
								'left:' + left +
								'px;bottom:' + bottom +
								'px;width:' + boxW + 'px;height:' + boxH + 'px;'
						} else {
							boxW = runPx
							boxH = thickPx
							let top = Math.round(pt.y * s)
							if (left + boxW > paperW) {
								boxW = Math.max(thickPx, paperW - left - 4)
							}
							styleStr =
								'left:' + left + 'px;top:' + top +
								'px;width:' + boxW + 'px;height:' + boxH + 'px;'
						}
						list.push({
							type: 'barcode',
							vertical: isV,
							content: '条形码：' + truncateLabel(data, isV ? 16 : 24),
							styleStr: styleStr,
						})
						return
					}
					if (op.type === 'qr') {
						const sizeDots = Number(op.size) || 80
						const data = op.data || ''
						const isV = op.orient === 'v'
						let x = Number(op.x) || 0
						let y = Number(op.y) || 0
						// 横 QR：自 (x,y) 向 +x/+y；竖 QR(VBARCODE QR)：自锚点向 -y 延伸（与 VBARCODE 一致）
						let x1 = x
						let y1 = isV ? y - sizeDots : y
						let x2 = x + sizeDots
						let y2 = isV ? y : y + sizeDots
						if (rotate) {
							const r = rotRectCw90(x1, y1, x2, y2, pageH)
							x1 = r.x1
							y1 = r.y1
							x2 = r.x2
							y2 = r.y2
						}
						const boxW = Math.abs(x2 - x1)
						const boxH = Math.abs(y2 - y1)
						const size = Math.max(36, Math.round(Math.min(boxW, boxH) * s))
						list.push({
							type: 'qr',
							content: '二维码：' + truncateLabel(data, 20),
							styleStr:
								'left:' + Math.round(Math.min(x1, x2) * s) +
								'px;top:' + Math.round(Math.min(y1, y2) * s) +
								'px;width:' + size + 'px;height:' + size + 'px;',
						})
						return
					}
					if (op.type === 'logo') {
						const lw = Number(op.w) || 64
						const lh = Number(op.h) || 58
						let x = Number(op.x) || 0
						let y = Number(op.y) || 0
						let bw = lw
						let bh = lh
						const logoAlign = op.align || align
						if (rotate) {
							const r = rotRectCw90(x, y, x + lw, y + lh, pageH)
							x = r.x1
							y = r.y1
							bw = r.x2 - r.x1
							bh = r.y2 - r.y1
						}
						const left = rotate
							? Math.round(x * s)
							: resolveAlignedLeftPx(logoAlign, x, bw, pageWDots, s, {
									anchor: 'start',
								})
						list.push({
							type: 'logo',
							styleStr:
								'left:' + left +
								'px;top:' + Math.round(y * s) +
								'px;width:' + Math.max(20, Math.round(bw * s)) +
								'px;height:' + Math.max(20, Math.round(bh * s)) + 'px;',
						})
					}
				})
				return list
			},
		},
	}
</script>

<style lang="scss" scoped>
	.cpclPreview {
		width: 100%;
		display: flex;
		justify-content: center;

		&-paper {
			position: relative;
			width: 300px;
			min-height: 200px;
			background: #fffef8;
			border: 1px solid #d8d0c4;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
			overflow: hidden;
			flex-shrink: 0;
		}

		&-op {
			position: absolute;
			color: #1a1a1a;
			line-height: 1.15;
			pointer-events: none;
			box-sizing: border-box;

			&--barcode,
			&--qr {
				overflow: hidden;
			}

			&--logo {
				overflow: hidden;
			}
		}

		&-text {
			display: inline-block;
			color: #111;
			white-space: pre;
			line-height: 1.2;
		}

		&-codeBox {
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			border: 1px solid #222;
			background: #d8d8d8;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 4px;
			overflow: hidden;

			&--v {
				padding: 6px 2px;
			}

			&--qr {
				padding: 6px;
			}
		}

		&-codeLabel {
			font-size: 10px;
			line-height: 1.25;
			color: #222;
			text-align: center;
			word-break: break-all;
			overflow: hidden;

			&--v {
				writing-mode: vertical-rl;
				text-orientation: mixed;
				letter-spacing: 1px;
				font-size: 9px;
				max-height: 100%;
			}

			&--qr {
				font-size: 9px;
				padding: 0 2px;
			}
		}

		&-logoInner {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f0ebe3;
			border: 1px solid #999;
			box-sizing: border-box;
		}

		&-logoText {
			font-size: 10px;
			font-weight: 700;
			color: #666;
		}
	}
</style>
