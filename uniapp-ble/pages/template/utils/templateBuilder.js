/**
 * 设计稿 → CPCL（与打印预览同源 ops）
 */

import { createCpclBuilder } from '../../print/template-comm/builder/cpclBuilder.js'
import { DOTS_PER_MM, mmToDots } from '../../print/ble/imagePrint.js'
import {
	LOGO_EG_DATA,
	LOGO_EG_BYTE_W,
	LOGO_EG_HEIGHT,
} from '../../print/template-comm/assets/logo.js'
import { PAPER_LIMITS } from './elementTypes.js'

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

function appendElement(b, el, paperDots) {
	if (!el || !el.type) return
	const x = Math.round(Number(el.x) * DOTS_PER_MM) || 0
	const y = Math.round(Number(el.y) * DOTS_PER_MM) || 0

	switch (el.type) {
		case 'text': {
			const mag = Math.max(1, Math.min(4, Number(el.mag) || 1))
			if (mag > 1) b.setMag(mag, mag)
			if (el.bold) b.setBold(1)
			b.text(el.font != null ? el.font : 0, el.size != null ? el.size : 24, x, y, el.content || '')
			if (el.bold) b.setBold(0)
			if (mag > 1) b.setMag(1, 1)
			break
		}
		case 'image': {
			// 当前内置 Logo EG；宽高由位图本身决定
			b.logoEg(LOGO_EG_BYTE_W, LOGO_EG_HEIGHT, x, y, LOGO_EG_DATA)
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
