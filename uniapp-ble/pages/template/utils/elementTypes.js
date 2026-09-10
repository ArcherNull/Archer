/**
 * 模板设计元素类型与默认值（坐标单位：mm）
 */

export const PAPER_LIMITS = {
	widthMin: 30,
	widthMax: 80,
	heightMin: 30,
	heightMax: 1000,
	marginMin: 0,
	marginMax: 20,
	defaultWidth: 75,
	defaultHeight: 90,
	defaultMargin: 1,
}

/** 常用纸张尺寸快捷填充（宽×高 mm） */
export const PAPER_PRESETS = [
	{ label: '40×30', widthMm: 40, heightMm: 30 },
	{ label: '50×30', widthMm: 50, heightMm: 30 },
	{ label: '50×40', widthMm: 50, heightMm: 40 },
	{ label: '60×40', widthMm: 60, heightMm: 40 },
	{ label: '70×50', widthMm: 70, heightMm: 50 },
	{ label: '70×80', widthMm: 70, heightMm: 80 },
	{ label: '75×90', widthMm: 75, heightMm: 90 },
	{ label: '80×50', widthMm: 80, heightMm: 50 },
	{ label: '80×60', widthMm: 80, heightMm: 60 },
	{ label: '80×100', widthMm: 80, heightMm: 100 },
]

/** 底部添加工具：icon 为展示符号 */
export const ELEMENT_TYPES = [
	{ type: 'text', label: '文字', icon: 'T' },
	{ type: 'image', label: '图片', icon: '▣' },
	{ type: 'barcode', label: '条码', icon: '║' },
	{ type: 'qrcode', label: '二维码', icon: '▦' },
	{ type: 'hline', label: '横线', icon: '—' },
	{ type: 'vline', label: '竖线', icon: '│' },
	{ type: 'box', label: '方框', icon: '□' },
]

let _uid = 0

export function createElementId(type) {
	_uid += 1
	return (type || 'el') + '_' + Date.now().toString(36) + '_' + _uid
}

/**
 * @param {string} type
 * @param {{ x?: number, y?: number }} pos
 */
export function createDefaultElement(type, pos = {}) {
	const x = pos.x != null ? Number(pos.x) : 2
	const y = pos.y != null ? Number(pos.y) : 2
	const base = {
		id: createElementId(type),
		type,
		x,
		y,
		name: '',
	}

	switch (type) {
		case 'text':
			return Object.assign(base, {
				name: '文字',
				content: '示例文字',
				font: 0,
				size: 24,
				mag: 1,
				bold: false,
				widthMm: 30,
				heightMm: 6,
			})
		case 'image':
			return Object.assign(base, {
				name: '图片',
				imageKey: 'logo',
				widthMm: 8,
				heightMm: 7.25,
			})
		case 'barcode':
			return Object.assign(base, {
				name: '条形码',
				data: '1234567890',
				moduleWidth: 2,
				ratio: 1,
				widthMm: 40,
				heightMm: 8,
			})
		case 'qrcode':
			return Object.assign(base, {
				name: '二维码',
				data: 'https://example.com',
				level: 2,
				unit: 4,
				widthMm: 18.5,
				heightMm: 18.5,
			})
		case 'hline':
			return Object.assign(base, {
				name: '横线',
				lengthMm: 40,
				thickness: 2,
				widthMm: 40,
				heightMm: 1,
			})
		case 'vline':
			return Object.assign(base, {
				name: '竖线',
				lengthMm: 20,
				thickness: 2,
				widthMm: 1,
				heightMm: 20,
			})
		case 'box':
			return Object.assign(base, {
				name: '方框',
				widthMm: 40,
				heightMm: 20,
				thickness: 2,
			})
		default:
			return base
	}
}

export function getElementTypeLabel(type) {
	const found = ELEMENT_TYPES.find(function (item) {
		return item.type === type
	})
	return (found && found.label) || type
}

export function createDefaultPaper() {
	return {
		widthMm: PAPER_LIMITS.defaultWidth,
		heightMm: PAPER_LIMITS.defaultHeight,
		marginTop: PAPER_LIMITS.defaultMargin,
		marginRight: PAPER_LIMITS.defaultMargin,
		marginBottom: PAPER_LIMITS.defaultMargin,
		marginLeft: PAPER_LIMITS.defaultMargin,
		useGapSense: true,
	}
}

/** 底部纸张摘要：75×90 1111 */
export function formatPaperSummary(paper) {
	const p = paper || {}
	const w = Number(p.widthMm) || 0
	const h = Number(p.heightMm) || 0
	const t = Number(p.marginTop)
	const r = Number(p.marginRight)
	const b = Number(p.marginBottom)
	const l = Number(p.marginLeft)
	const mt = isNaN(t) ? 0 : t
	const mr = isNaN(r) ? 0 : r
	const mb = isNaN(b) ? 0 : b
	const ml = isNaN(l) ? 0 : l
	return w + 'X' + h + ' ' + mt + '' + mr + '' + mb + '' + ml
}

/**
 * 根据拖拽后的宽高回写元素属性
 */
export function applyElementSize(el, widthMm, heightMm) {
	if (!el) return el
	const next = Object.assign({}, el)
	const w = Math.max(1, Math.round(Number(widthMm) * 10) / 10)
	const h = Math.max(0.5, Math.round(Number(heightMm) * 10) / 10)
	next.widthMm = w
	next.heightMm = h
	if (next.type === 'hline') {
		next.lengthMm = w
	} else if (next.type === 'vline') {
		next.lengthMm = h
	} else if (next.type === 'qrcode') {
		const side = Math.max(w, h)
		next.widthMm = side
		next.heightMm = side
		next.unit = Math.max(1, Math.min(16, Math.round(side / 4.625)))
	} else if (next.type === 'barcode') {
		next.heightMm = h
	} else if (next.type === 'text') {
		next.mag = Math.max(1, Math.min(4, Math.round(h / 5)))
	}
	return next
}
