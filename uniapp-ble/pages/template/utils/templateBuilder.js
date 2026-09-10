/**
 * 设计稿 → CPCL（与打印预览同源 ops）
 */

import { createCpclBuilder } from '../../print/template-comm/builder/cpclBuilder.js'
import {
	DOTS_PER_MM,
	mmToDots,
	STATIC_PRINT_IMAGES,
	imagePathToEgBitmap,
	calcPrintSizeByMm,
} from '../../print/ble/imagePrint.js'
import {
	PAPER_LIMITS,
	estimateTextMaxChars,
	estimateTextWidthMm,
	wrapDesignText,
	truncateDesignText,
	normalizeElementRotate,
	normalizeAlignH,
	normalizeAlignV,
	textCharHeightMm,
} from './elementTypes.js'

function clamp(n, min, max) {
	const v = Number(n)
	if (isNaN(v)) return min
	if (v < min) return min
	if (v > max) return max
	return v
}

function mmToDot(mm, align8) {
	return mmToDots(mm, {
		align8: align8 !== false,
		min: 8,
		max: 20000,
	})
}

/**
 * 纸张毫米尺寸 → 点
 * @param {Record<string, any>} paper
 */
export function paperToDots(paper) {
	const widthMm = clamp(
		paper && paper.widthMm,
		PAPER_LIMITS.widthMin,
		PAPER_LIMITS.widthMax
	)
	const heightMm = clamp(
		paper && paper.heightMm,
		PAPER_LIMITS.heightMin,
		PAPER_LIMITS.heightMax
	)
	const marginTop = clamp(paper && paper.marginTop, PAPER_LIMITS.marginMin, PAPER_LIMITS.marginMax)
	const marginRight = clamp(
		paper && paper.marginRight,
		PAPER_LIMITS.marginMin,
		PAPER_LIMITS.marginMax
	)
	const marginBottom = clamp(
		paper && paper.marginBottom,
		PAPER_LIMITS.marginMin,
		PAPER_LIMITS.marginMax
	)
	const marginLeft = clamp(
		paper && paper.marginLeft,
		PAPER_LIMITS.marginMin,
		PAPER_LIMITS.marginMax
	)

	return {
		widthMm,
		heightMm,
		marginTop,
		marginRight,
		marginBottom,
		marginLeft,
		useGapSense: paper && paper.useGapSense !== false,
		pageW: mmToDot(widthMm, true),
		pageH: Math.round(heightMm * DOTS_PER_MM),
		mTop: Math.round(marginTop * DOTS_PER_MM),
		mRight: Math.round(marginRight * DOTS_PER_MM),
		mBottom: Math.round(marginBottom * DOTS_PER_MM),
		mLeft: Math.round(marginLeft * DOTS_PER_MM),
	}
}

/** 解析图片元素的实际路径 */
export function resolveElementImagePath(el) {
	if (!el || el.type !== 'image') return ''
	if (el.imagePath) return String(el.imagePath)
	const key = el.imageKey || ''
	if (!key) return ''
	const found = STATIC_PRINT_IMAGES.find(function (item) {
		return item.key === key
	})
	return (found && found.path) || ''
}

/**
 * 将设计稿中的图片元素经 imagePrint 转为 EG 位图后写回
 * @param {{ paper: object, elements: array }} design
 * @param {{ canvasId?: string, component?: any, onProgress?: Function }} options
 */
export async function prepareDesignImages(design, options = {}) {
	const paper = (design && design.paper) || {}
	const elements = (design && design.elements) || []
	const list = []
	const imageEls = elements.filter(function (el) {
		return el && el.type === 'image'
	})
	let done = 0

	for (let i = 0; i < elements.length; i++) {
		const el = elements[i]
		if (!el || el.type !== 'image') {
			list.push(el)
			continue
		}
		const path = resolveElementImagePath(el)
		if (!path) {
			throw new Error('有图片元素未选择图片，请先在设置中选图')
		}
		const widthMm = Number(el.widthMm) || 10
		const heightMm = Number(el.heightMm) || 10
		const size = calcPrintSizeByMm(widthMm, heightMm)

		if (typeof options.onCanvasSize === 'function') {
			await Promise.resolve(options.onCanvasSize(size.width, size.height))
		}
		// 等页面 canvas 尺寸生效（回退路径需要）
		await new Promise(function (resolve) {
			setTimeout(resolve, 200)
		})

		const bmp = await imagePathToEgBitmap(path, {
			widthMm: widthMm,
			heightMm: heightMm,
			canvasId: options.canvasId,
			component: options.component,
			skipValidate: /\/?static\//.test(String(path)),
		})
		done += 1
		if (typeof options.onProgress === 'function') {
			options.onProgress(done, imageEls.length)
		}
		list.push(
			Object.assign({}, el, {
				egBitmap: {
					hex: bmp.hex,
					byteWidth: bmp.byteWidth,
					height: bmp.height,
					width: bmp.width,
				},
			})
		)
	}

	return {
		paper: paper,
		elements: list,
	}
}

function appendElement(b, el, paperDots) {
	if (!el || !el.type) return
	const x = Math.round(Number(el.x) * DOTS_PER_MM) || 0
	const y = Math.round(Number(el.y) * DOTS_PER_MM) || 0

	switch (el.type) {
		case 'text': {
			const mag = Math.max(1, Math.min(4, Number(el.mag) || 1))
			const font = el.font != null ? el.font : 0
			const size = el.size != null ? el.size : 24
			const content = el.content || ''
			const rotate = normalizeElementRotate(el.rotate)
			const alignH = normalizeAlignH(el.alignH)
			const alignV = normalizeAlignV(el.alignV)
			const boxX = Number(el.x) || 0
			const boxY = Number(el.y) || 0
			const boxW = Number(el.widthMm) || 30
			const charMm = textCharHeightMm(el)
			const lineHMm = charMm * 1.15
			const boxH = Number(el.heightMm) > 0 ? Number(el.heightMm) : charMm
			const maxChars = estimateTextMaxChars(boxW, mag)
			const ellipsis = !!el.ellipsis

			let lines
			if (el.wrap) {
				const maxLines = Math.max(1, Math.floor(boxH / lineHMm))
				lines = wrapDesignText(content, maxChars, maxLines)
				if (ellipsis) {
					const full = wrapDesignText(content, maxChars, 40)
					if (full.length > maxLines && lines.length) {
						lines[lines.length - 1] = truncateDesignText(
							lines[lines.length - 1],
							maxChars
						)
					}
				}
			} else {
				let line = String(content).replace(/\r?\n/g, ' ')
				if (ellipsis) line = truncateDesignText(line, maxChars)
				lines = [line]
			}
			const contentH = Math.max(charMm, lines.length * lineHMm)

			let startY = boxY
			if (alignV === 'middle') {
				startY = boxY + Math.max(0, (boxH - contentH) / 2)
			} else if (alignV === 'bottom') {
				startY = boxY + Math.max(0, boxH - contentH)
			}

			if (mag > 1) b.setMag(mag, mag)
			if (el.bold) b.setBold(1)

			const lineHDots = Math.round(lineHMm * DOTS_PER_MM)
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i]
				const lineW = estimateTextWidthMm(line, charMm)
				let lx = boxX
				if (alignH === 'center') {
					lx = boxX + Math.max(0, (boxW - lineW) / 2)
				} else if (alignH === 'right') {
					lx = boxX + Math.max(0, boxW - lineW)
				}
				let ly = startY + i * lineHMm
				let px = Math.round(lx * DOTS_PER_MM) || 0
				let py = Math.round(ly * DOTS_PER_MM) || 0
				// 旋转 90/270 时，换行沿 X 方向推进
				if (el.wrap && (rotate === 90 || rotate === 270)) {
					px = Math.round(boxX * DOTS_PER_MM) + i * lineHDots
					py = Math.round(startY * DOTS_PER_MM) || 0
				}
				b.text(font, size, px, py, line, rotate)
			}

			if (el.bold) b.setBold(0)
			if (mag > 1) b.setMag(1, 1)
			break
		}
		case 'image': {
			const bmp = el.egBitmap
			if (bmp && bmp.hex && bmp.byteWidth && bmp.height) {
				b.logoEg(bmp.byteWidth, bmp.height, x, y, bmp.hex)
			}
			break
		}
		case 'barcode': {
			const height = Math.max(16, Math.round((Number(el.heightMm) || 8) * DOTS_PER_MM))
			const mw = Math.max(1, Math.min(4, Number(el.moduleWidth) || 2))
			const ratio = Math.max(1, Math.min(3, Number(el.ratio) || 1))
			b.barcode128(mw, ratio, height, x, y, el.data || '')
			break
		}
		case 'qrcode': {
			const level = Math.max(0, Math.min(3, Number(el.level) || 2))
			const unit = Math.max(1, Math.min(16, Number(el.unit) || 4))
			b.qr(x, y, level, unit, el.data || '')
			break
		}
		case 'hline': {
			const len = Math.max(1, Math.round((Number(el.lengthMm) || el.widthMm || 10) * DOTS_PER_MM))
			const w = Math.max(1, Number(el.thickness) || 1)
			const maxX = Math.max(x + 1, paperDots.pageW - paperDots.mRight)
			const x2 = Math.min(x + len, maxX)
			b.line(x, y, x2, y, w)
			break
		}
		case 'vline': {
			const len = Math.max(1, Math.round((Number(el.lengthMm) || el.heightMm || 10) * DOTS_PER_MM))
			const w = Math.max(1, Number(el.thickness) || 1)
			const maxY = Math.max(y + 1, paperDots.pageH - paperDots.mBottom)
			const y2 = Math.min(y + len, maxY)
			b.line(x, y, x, y2, w)
			break
		}
		case 'box': {
			const ww = Math.max(1, Math.round((Number(el.widthMm) || 10) * DOTS_PER_MM))
			const hh = Math.max(1, Math.round((Number(el.heightMm) || 10) * DOTS_PER_MM))
			const tw = Math.max(1, Number(el.thickness) || 1)
			b.box(x, y, x + ww, y + hh, tw)
			break
		}
		default:
			break
	}
}

/**
 * @param {{ paper: object, elements: array }} design
 * @param {{ brand?: string, qty?: number }} options
 * @returns {{ cpcl: string, ops: array, brand: string, paperDots: object }}
 */
export function buildDesignTemplate(design, options = {}) {
	const paper = (design && design.paper) || {}
	const elements = (design && design.elements) || []
	const paperDots = paperToDots(paper)
	const brand = options.brand || 'common'
	const qty = Math.max(1, Number(options.qty) || 1)

	const b = createCpclBuilder({ brand })
	b.page(paperDots.pageH, qty, 0)
	b.pageWidth(paperDots.pageW)

	elements.forEach(function (el) {
		appendElement(b, el, paperDots)
	})

	b.endPage({ useGapSense: paperDots.useGapSense })

	const built = b.build()
	return {
		cpcl: built.cpcl,
		ops: built.ops,
		brand: built.brand,
		paperDots,
	}
}

/**
 * 准备图片后生成模板（打印 / 预览共用）
 */
export async function buildDesignTemplateAsync(design, options = {}) {
	const prepared = await prepareDesignImages(design, options)
	return buildDesignTemplate(prepared, options)
}

/**
 * 同时生成芝柯 / 汉印方言指令
 */
export function buildDesignCommandsByBrand(design, options = {}) {
	const cc3 = buildDesignTemplate(design, Object.assign({}, options, { brand: 'CC3' }))
	const hm = buildDesignTemplate(design, Object.assign({}, options, { brand: 'HM' }))
	return {
		CC3: cc3.cpcl,
		HM: hm.cpcl,
		opsCC3: cc3.ops,
		opsHM: hm.ops,
		paperDots: cc3.paperDots,
	}
}

/**
 * 异步：先解析图片再生成双品牌指令
 */
export async function buildDesignCommandsByBrandAsync(design, options = {}) {
	const prepared = await prepareDesignImages(design, options)
	return buildDesignCommandsByBrand(prepared, options)
}
