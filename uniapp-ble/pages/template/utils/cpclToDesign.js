/**
 * 蓝牙 CPCL 指令 → 模板设计稿（纸张 + 元素），用于导入回显
 */

import { DOTS_PER_MM } from '../../print/ble/imagePrint.js'
import { cpclToOps } from '../../print/template-comm/builder/cpclToOps.js'
import {
	estimateCode128Width,
	estimateCode128RunDots,
} from '../../print/template-comm/builder/cpclBuilder.js'
import {
	PAPER_LIMITS,
	createDefaultPaper,
	createElementId,
	estimateTextWidthMm,
	normalizeElementRotate,
	qrSideMmFromUnit,
	textCharHeightMm,
	normalizeTextMag,
} from './elementTypes.js'

function clamp(n, min, max) {
	var v = Number(n)
	if (isNaN(v)) return min
	if (v < min) return min
	if (v > max) return max
	return v
}

function dotsToMm(dots) {
	return Math.round(((Number(dots) || 0) / (DOTS_PER_MM || 8)) * 10) / 10
}

function mapAlign(dir) {
	var s = String(dir || '').toUpperCase()
	if (s === 'CENTER') return 'center'
	if (s === 'RIGHT') return 'right'
	return 'left'
}

/**
 * CPCL LEFT/CENTER/RIGHT → 设计稿左缘 x（dot）
 * LEFT：x 为左缘；CENTER：纸心+x 为中心（或 start 时为左缘相对纸心）；RIGHT：x≤0 以纸右为右缘，否则 x 为右缘
 */
function resolveCpclAlignedLeftDots(align, xDots, contentWDots, pageWDots, opts) {
	var a = String(align || 'LEFT').toUpperCase()
	var x = Number(xDots) || 0
	var w = Math.max(0, Number(contentWDots) || 0)
	var pageW = Number(pageWDots) || 576
	var anchor = (opts && opts.anchor) || 'center'
	if (a === 'CENTER') {
		return Math.round(anchor === 'start' ? pageW / 2 + x : pageW / 2 + x - w / 2)
	}
	if (a === 'RIGHT') {
		var rightEdge = x <= 0 ? pageW : x
		return Math.round(rightEdge - w)
	}
	return Math.round(x)
}

/**
 * @param {string} cpcl
 * @param {{ brand?: string }} [options]
 * @returns {{ paper: object, elements: array, ops: array }}
 */
export function cpclToDesign(cpcl, options) {
	options = options || {}
	var text = String(cpcl || '').trim()
	if (!text) {
		throw new Error('请输入蓝牙指令')
	}

	var ops = cpclToOps(text, options.brand || 'common')
	if (!ops || !ops.length) {
		throw new Error('未能解析指令')
	}

	var paper = createDefaultPaper()
	var elements = []
	var mag = 1
	var bold = false
	var pageWDots = 0
	var pageHDots = 0
	var hasContent = false
	var pendingTextArea = null

	for (var i = 0; i < ops.length; i++) {
		var op = ops[i]
		if (!op || !op.type) continue

		if (op.type === 'page') {
			pageHDots = Number(op.height) || pageHDots
			if (Number(op.width) > 0) pageWDots = Number(op.width)
			continue
		}
		if (op.type === 'pageWidth') {
			pageWDots = Number(op.width) || pageWDots
			continue
		}
		if (op.type === 'setMag') {
			var mw = Number(op.w)
			var mh = Number(op.h)
			if (isNaN(mw)) mw = 1
			if (isNaN(mh)) mh = 1
			mag = normalizeTextMag(Math.max(mw, mh))
			continue
		}
		if (op.type === 'setBold') {
			bold = Number(op.n) > 0
			continue
		}
		if (op.type === 'gapSense') {
			paper.useGapSense = true
			continue
		}
		if (op.type === 'textArea') {
			pendingTextArea = op
			continue
		}
		if (
			op.type === 'align' ||
			op.type === 'form' ||
			op.type === 'print' ||
			op.type === 'prefeed' ||
			op.type === 'raw'
		) {
			continue
		}

		if (op.type === 'text') {
			hasContent = true
			// 保留 size=0（配军大字 TEXT 3 0）；勿强制改成 24
			var size =
				op.size != null && op.size !== '' && !isNaN(Number(op.size))
					? Number(op.size)
					: 24
			if (size < 0) size = 24
			var rotate = normalizeElementRotate(op.rotate)
			// VTEXT/VT 可能只带 vertical；与 TEXT90 同为逆时针 90°
			if ((!rotate || rotate === 0) && op.vertical) rotate = 90
			var content = op.content != null ? String(op.content) : ''
			var area = pendingTextArea
			var hasExplicitBox =
				(op.boxW != null && Number(op.boxW) > 0) ||
				(area && Number(area.w) > 0)
			var boxWDots =
				(op.boxW != null && Number(op.boxW) > 0
					? Number(op.boxW)
					: area && Number(area.w) > 0
						? Number(area.w)
						: 0) || 0
			var boxHDots =
				(op.boxH != null && Number(op.boxH) > 0
					? Number(op.boxH)
					: area && Number(area.h) > 0
						? Number(area.h)
						: 0) || 0
			var boxXDots =
				op.boxX != null
					? Number(op.boxX)
					: area
						? Number(area.x) || 0
						: Number(op.x) || 0
			var boxYDots =
				op.boxY != null
					? Number(op.boxY)
					: area
						? Number(area.y) || 0
						: Number(op.y) || 0
			var areaKey =
				boxWDots > 0
					? [boxXDots, boxYDots, boxWDots, boxHDots, rotate, mag, bold].join('|')
					: ''

			// 同一文字区域多行 TEXT：合并为一个元素
			var prev = elements.length ? elements[elements.length - 1] : null
			if (
				prev &&
				prev.type === 'text' &&
				areaKey &&
				prev._areaKey === areaKey
			) {
				prev.content = (prev.content || '') + '\n' + content
				prev.wrap = true
				continue
			}

			var elText = {
				id: createElementId('text'),
				type: 'text',
				name: '文字',
				x: dotsToMm(boxXDots),
				y: dotsToMm(boxYDots),
				content: content,
				font: op.font != null ? op.font : 0,
				size: size,
				mag: mag,
				bold: bold,
				wrap: false,
				ellipsis: false,
				ellipsisLines: 2,
				rotate: rotate,
				alignH: mapAlign(op.align),
				alignV: 'top',
				widthMm: 30,
				heightMm: 3,
				_areaKey: areaKey,
			}
			var charMm = textCharHeightMm(elText)
			if (boxWDots > 0) {
				elText.widthMm =
					op.widthMm != null && Number(op.widthMm) > 0
						? Number(op.widthMm)
						: area && Number(area.widthMm) > 0
							? Number(area.widthMm)
							: Math.max(charMm, dotsToMm(boxWDots))
			} else {
				elText.widthMm = Math.max(charMm, estimateTextWidthMm(content || '文字', charMm))
			}
			if (boxHDots > 0) {
				elText.heightMm =
					op.heightMm != null && Number(op.heightMm) > 0
						? Number(op.heightMm)
						: area && Number(area.heightMm) > 0
							? Number(area.heightMm)
							: Math.max(charMm, dotsToMm(boxHDots))
			} else {
				elText.heightMm = Math.max(charMm, Math.round(charMm * 10) / 10)
			}
			// 无 TEXT-AREA 时：按 CPCL 对齐 + 旋转锚点还原包围盒左上
			// LEFT/CENTER/RIGHT 需换算为绝对左缘，否则 RIGHT/CENTER 的 x=0 会全部贴到左边
			// TEXT90/VTEXT 逆时针 90°，字串向 -Y 延伸 → 顶边 = y锚点 - 串长
			// TEXT180 逆时针 180°，向 -X 延伸 → 左边 = x锚点 - 串长
			if (!hasExplicitBox) {
				var runMm = Number(elText.widthMm) || 0
				var runDots = Math.max(1, Math.round(runMm * (DOTS_PER_MM || 8)))
				var anchorX = Number(op.x) || 0
				var anchorY = Number(op.y) || 0
				var alignRaw = String(op.align || 'LEFT').toUpperCase()
				if (rotate === 90) {
					elText.x = dotsToMm(anchorX)
					elText.y = Math.max(0, dotsToMm(anchorY) - runMm)
				} else if (rotate === 180) {
					elText.x = Math.max(0, dotsToMm(anchorX) - runMm)
					elText.y = dotsToMm(anchorY)
				} else if (rotate === 270) {
					elText.x = dotsToMm(anchorX)
					elText.y = dotsToMm(anchorY)
				} else {
					var leftDots = resolveCpclAlignedLeftDots(
						alignRaw,
						anchorX,
						runDots,
						pageWDots
					)
					elText.x = Math.max(0, dotsToMm(leftDots))
					elText.y = dotsToMm(anchorY)
				}
			}
			elements.push(elText)
			continue
		}

		// 非文字指令打断文字区域合并
		pendingTextArea = null

		if (op.type === 'line') {
			hasContent = true
			var x1 = Number(op.x1) || 0
			var y1 = Number(op.y1) || 0
			var x2 = Number(op.x2) || 0
			var y2 = Number(op.y2) || 0
			var tw = Math.max(1, Number(op.w) || 1)
			var dx = Math.abs(x2 - x1)
			var dy = Math.abs(y2 - y1)
			if (dy <= dx) {
				elements.push({
					id: createElementId('hline'),
					type: 'hline',
					name: '横线',
					x: dotsToMm(Math.min(x1, x2)),
					y: dotsToMm(y1),
					lengthMm: Math.max(1, dotsToMm(dx || 1)),
					thickness: tw,
					widthMm: Math.max(1, dotsToMm(dx || 1)),
					heightMm: Math.max(0.5, tw / (DOTS_PER_MM || 8)),
				})
			} else {
				elements.push({
					id: createElementId('vline'),
					type: 'vline',
					name: '竖线',
					x: dotsToMm(x1),
					y: dotsToMm(Math.min(y1, y2)),
					lengthMm: Math.max(1, dotsToMm(dy || 1)),
					thickness: tw,
					widthMm: Math.max(0.5, tw / (DOTS_PER_MM || 8)),
					heightMm: Math.max(1, dotsToMm(dy || 1)),
				})
			}
			continue
		}

		if (op.type === 'box') {
			hasContent = true
			var bx1 = Number(op.x1) || 0
			var by1 = Number(op.y1) || 0
			var bx2 = Number(op.x2) || 0
			var by2 = Number(op.y2) || 0
			elements.push({
				id: createElementId('box'),
				type: 'box',
				name: '方框',
				x: dotsToMm(Math.min(bx1, bx2)),
				y: dotsToMm(Math.min(by1, by2)),
				widthMm: Math.max(2, dotsToMm(Math.abs(bx2 - bx1))),
				heightMm: Math.max(2, dotsToMm(Math.abs(by2 - by1))),
				thickness: Math.max(1, Number(op.w) || 1),
			})
			continue
		}

		if (op.type === 'barcode') {
			hasContent = true
			var mw = Math.max(1, Math.min(4, Number(op.moduleWidth) || 2))
			var ratio = Math.max(1, Math.min(3, Number(op.ratio) || 1))
			var data = op.data != null ? String(op.data) : ''
			var thickDots = Math.max(16, Number(op.height) || 64)
			var isVertical = op.orient === 'v'
			var theoryDots = estimateCode128Width(data, mw)
			// 纵向：与导出相同的安全长度还原顶边；widthMm 仍用理论长度，占位不放大
			var runDots = isVertical ? estimateCode128RunDots(data, mw) : theoryDots
			var bx = Number(op.x) || 0
			var by = Number(op.y) || 0
			var topY = isVertical ? Math.max(0, by - runDots) : by
			elements.push({
				id: createElementId('barcode'),
				type: 'barcode',
				name: '条形码',
				x: dotsToMm(bx),
				y: dotsToMm(topY),
				data: data,
				moduleWidth: mw,
				ratio: ratio,
				rotate: isVertical ? 90 : 0,
				widthMm: Math.max(8, dotsToMm(theoryDots)),
				heightMm: Math.max(3, dotsToMm(thickDots)),
			})
			continue
		}

		if (op.type === 'qr') {
			hasContent = true
			var unit = Math.max(
				1,
				Math.min(16, Number(op.unit) || Math.round((Number(op.size) || 148) / 37) || 4)
			)
			var qrData = op.data != null ? String(op.data) : ''
			var qrLevel = Math.max(0, Math.min(3, Number(op.level) || 2))
			var side = qrSideMmFromUnit(unit, qrData, qrLevel)
			elements.push({
				id: createElementId('qrcode'),
				type: 'qrcode',
				name: '二维码',
				x: dotsToMm(op.x),
				y: dotsToMm(op.y),
				data: qrData,
				level: qrLevel,
				unit: unit,
				rotate: op.orient === 'v' ? 90 : 0,
				widthMm: side,
				heightMm: side,
			})
			continue
		}

		if (op.type === 'logo') {
			hasContent = true
			var logoWDots = Number(op.w) || 80
			var logoH = Math.max(2, dotsToMm(op.h || 80))
			var logoW = Math.max(2, dotsToMm(logoWDots))
			var logoAlign = String(op.align || 'LEFT').toUpperCase()
			var logoLeftDots = resolveCpclAlignedLeftDots(
				logoAlign,
				Number(op.x) || 0,
				logoWDots,
				pageWDots,
				{ anchor: 'start' }
			)
			var logoEl = {
				id: createElementId('image'),
				type: 'image',
				name: '图片',
				x: Math.max(0, dotsToMm(logoLeftDots)),
				y: dotsToMm(op.y),
				imageKey: '',
				imagePath: '',
				widthMm: logoW,
				heightMm: logoH,
			}
			// 保留指令中的 EG 位图，便于未换图时可直接打印；换图时需清掉
			if (op.hex && op.byteWidth && op.h) {
				logoEl.egBitmap = {
					hex: String(op.hex).replace(/\s+/g, ''),
					byteWidth: Number(op.byteWidth) || Math.ceil((Number(op.w) || 8) / 8),
					height: Number(op.h) || 0,
					width: Number(op.w) || 0,
				}
				logoEl.fromEgImport = true
			}
			elements.push(logoEl)
		}
	}

	if (pageWDots > 0) {
		paper.widthMm = clamp(dotsToMm(pageWDots), PAPER_LIMITS.widthMin, PAPER_LIMITS.widthMax)
	}
	if (pageHDots > 0) {
		paper.heightMm = clamp(dotsToMm(pageHDots), PAPER_LIMITS.heightMin, PAPER_LIMITS.heightMax)
	}

	if (!hasContent && !pageWDots && !pageHDots) {
		throw new Error('指令中未识别到可回显的模板内容')
	}

	for (var ei = 0; ei < elements.length; ei++) {
		if (elements[ei] && elements[ei]._areaKey != null) {
			delete elements[ei]._areaKey
		}
	}

	return {
		paper: paper,
		elements: elements,
		ops: ops,
	}
}

export default cpclToDesign
