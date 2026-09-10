/**
 * 蓝牙 CPCL 指令 → 模板设计稿（纸张 + 元素），用于导入回显
 */

import { DOTS_PER_MM } from '../../print/ble/imagePrint.js'
import { cpclToOps } from '../../print/template-comm/builder/cpclToOps.js'
import {
	PAPER_LIMITS,
	createDefaultPaper,
	createElementId,
	estimateTextWidthMm,
	normalizeElementRotate,
	qrSideMmFromUnit,
	textCharHeightMm,
} from './elementTypes.js'

function clamp(n, min, max) {
	var v = Number(n)
	if (isNaN(v)) return min
	if (v < min) return min
	if (v > max) return max
	return v
}

function dotsToMm(dots) {
	return Math.round((Number(dots) || 0) / (DOTS_PER_MM || 8) * 10) / 10
}

function mapAlign(dir) {
	var s = String(dir || '').toUpperCase()
	if (s === 'CENTER') return 'center'
	if (s === 'RIGHT') return 'right'
	return 'left'
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
			mag = Math.max(1, Math.min(4, Number(op.w) || Number(op.h) || 1))
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
		if (op.type === 'align' || op.type === 'form' || op.type === 'print' || op.type === 'prefeed' || op.type === 'raw') {
			continue
		}

		if (op.type === 'text') {
			hasContent = true
			var size = Number(op.size) > 0 ? Number(op.size) : 24
			var rotate = normalizeElementRotate(op.rotate)
			var content = op.content != null ? String(op.content) : ''
			var elText = {
				id: createElementId('text'),
				type: 'text',
				name: '文字',
				x: dotsToMm(op.x),
				y: dotsToMm(op.y),
				content: content,
				font: op.font != null ? op.font : 0,
				size: size,
				mag: mag,
				bold: bold,
				wrap: false,
				ellipsis: true,
				rotate: rotate,
				alignH: mapAlign(op.align),
				alignV: 'top',
				widthMm: 30,
				heightMm: 3,
			}
			var charMm = textCharHeightMm(elText)
			elText.heightMm = Math.max(charMm, Math.round(charMm * 10) / 10)
			elText.widthMm = Math.max(
				charMm,
				estimateTextWidthMm(content || '文字', charMm)
			)
			elements.push(elText)
			continue
		}

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
			elements.push({
				id: createElementId('barcode'),
				type: 'barcode',
				name: '条形码',
				x: dotsToMm(op.x),
				y: dotsToMm(op.y),
				data: op.data != null ? String(op.data) : '',
				moduleWidth: Math.max(1, Math.min(4, Number(op.moduleWidth) || 2)),
				ratio: Math.max(1, Math.min(3, Number(op.ratio) || 1)),
				widthMm: 40,
				heightMm: Math.max(3, dotsToMm(op.height || 64)),
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
				widthMm: side,
				heightMm: side,
			})
			continue
		}

		if (op.type === 'logo') {
			hasContent = true
			elements.push({
				id: createElementId('image'),
				type: 'image',
				name: '图片',
				x: dotsToMm(op.x),
				y: dotsToMm(op.y),
				imageKey: '',
				imagePath: '',
				widthMm: Math.max(2, dotsToMm(op.w || 80)),
				heightMm: Math.max(2, dotsToMm(op.h || 80)),
			})
		}
	}

	if (pageWDots > 0) {
		paper.widthMm = clamp(
			dotsToMm(pageWDots),
			PAPER_LIMITS.widthMin,
			PAPER_LIMITS.widthMax
		)
	}
	if (pageHDots > 0) {
		paper.heightMm = clamp(
			dotsToMm(pageHDots),
			PAPER_LIMITS.heightMin,
			PAPER_LIMITS.heightMax
		)
	}

	if (!hasContent && !pageWDots && !pageHDots) {
		throw new Error('指令中未识别到可回显的模板内容')
	}

	return {
		paper: paper,
		elements: elements,
		ops: ops,
	}
}

export default cpclToDesign
