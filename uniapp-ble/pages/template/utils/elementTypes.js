/**
 * 模板设计元素类型与默认值（坐标单位：mm）
 */

// 默认 CPCL 字号点阵（芝柯 T 0 24 / 汉印 24x24）；203dpi 下约 3mm
var TEXT_BASE_DOTS = 24
var TEXT_CHAR_MM = 3

export { TEXT_BASE_DOTS, TEXT_CHAR_MM }

/** 二维码边长：模块数 × 单元大小 / 8dot≈1mm（模块数随内容估算，避免固定 37 偏大） */
export var QR_DOTS_PER_MM = 8

/**
 * 按数据长度与纠错等级估算 QR 模块边长（byte 模式近似）
 * level: 0=L 1=M 2=Q 3=H（与 CPCL M 参数一致）
 */
export function estimateQrModules(data, level) {
	var len = String(data == null ? '' : data).length
	var ecc = Math.max(0, Math.min(3, Number(level) || 2))
	// 各版本 byte 容量 [L, M, Q, H]，modules = 21 + (version-1)*4
	var caps = [
		[17, 14, 11, 7],
		[32, 26, 20, 14],
		[53, 42, 32, 24],
		[78, 62, 46, 34],
		[106, 84, 60, 44],
		[134, 106, 74, 58],
		[154, 122, 86, 64],
		[192, 152, 108, 84],
		[230, 180, 130, 98],
		[271, 213, 151, 119],
	]
	for (var v = 0; v < caps.length; v++) {
		if (len <= caps[v][ecc]) return 21 + v * 4
	}
	return 21 + (caps.length - 1) * 4
}

export function qrSideMmFromUnit(unit, data, level) {
	var u = Math.max(1, Math.min(16, Number(unit) || 4))
	var modules = estimateQrModules(data, level)
	return Math.round((modules * u) / (QR_DOTS_PER_MM || 8) * 10) / 10
}

export function qrSideMmFromElement(el) {
	if (!el) return qrSideMmFromUnit(4, '', 2)
	return qrSideMmFromUnit(el.unit, el.data, el.level)
}

export function qrUnitFromSideMm(sideMm, data, level) {
	var side = Math.max(1, Number(sideMm) || 0)
	var modules = Math.max(21, estimateQrModules(data, level))
	return Math.max(
		1,
		Math.min(16, Math.round((side * (QR_DOTS_PER_MM || 8)) / modules))
	)
}

/** 文字旋转可选角度 */
export var TEXT_ROTATE_OPTIONS = [
	{ value: 0, label: '0°' },
	{ value: 90, label: '90°' },
	{ value: 180, label: '180°' },
	{ value: 270, label: '270°' },
]

export var TEXT_ALIGN_H_OPTIONS = [
	{ value: 'left', label: '居左' },
	{ value: 'center', label: '居中' },
	{ value: 'right', label: '居右' },
]

export var TEXT_ALIGN_V_OPTIONS = [
	{ value: 'top', label: '居上' },
	{ value: 'middle', label: '居中' },
	{ value: 'bottom', label: '居下' },
]

export function normalizeElementRotate(rotate) {
	var n = Number(rotate)
	if (n === 90 || n === 180 || n === 270) return n
	return 0
}

export function normalizeAlignH(v) {
	var s = String(v || '').toLowerCase()
	if (s === 'center' || s === 'right') return s
	return 'left'
}

export function normalizeAlignV(v) {
	var s = String(v || '').toLowerCase()
	if (s === 'middle' || s === 'bottom') return s
	return 'top'
}

export var PAPER_LIMITS = {
	widthMin: 30,
	widthMax: 80,
	heightMin: 30,
	heightMax: 1000,
	marginMin: 0,
	marginMax: 20,
	defaultWidth: 80,
	defaultHeight: 100,
	defaultMargin: 0,
}

/** 常用纸张尺寸快捷填充（宽x高 mm） */
export var PAPER_PRESETS = [
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

/** 模板页静态图标（/static/icon，主色 #2c2c2c） */
export var TEMPLATE_ICONS = {
	zoomIn: '/static/icon/放大.png',
	zoomOut: '/static/icon/缩小.png',
	delete: '/static/icon/删除.png',
	list: '/static/icon/清单.png',
	move: '/static/icon/移动.png',
	fold: '/static/icon/折叠.png',
	expand: '/static/icon/展开.png',
	preview: '/static/icon/预览.png',
	command: '/static/icon/代码.png',
	importIcon: '/static/icon/导入.png',
	print: '/static/icon/打印.png',
	settings: '/static/icon/设置.png',
	image: '/static/icon/图片.png',
	barcode: '/static/icon/条形码.png',
	qrcode: '/static/icon/二维码.png',
	text: '/static/icon/文字.png',
	hline: '/static/icon/横线.png',
	vline: '/static/icon/竖线.png',
	box: '/static/icon/方框.png',
	tip: '/static/icon/提示.png',
	help: '/static/icon/帮助.png',
	lock: '/static/icon/锁定.png',
	unlock: '/static/icon/解锁.png',
}

/** 底部添加工具 */
export var ELEMENT_TYPES = [
	{ type: 'text', label: '文字', icon: 'T', iconSrc: TEMPLATE_ICONS.text },
	{ type: 'image', label: '图片', icon: '▣', iconSrc: TEMPLATE_ICONS.image },
	{ type: 'barcode', label: '条码', icon: '║', iconSrc: TEMPLATE_ICONS.barcode },
	{ type: 'qrcode', label: '二维码', icon: '▦', iconSrc: TEMPLATE_ICONS.qrcode },
	{ type: 'hline', label: '横线', icon: '—', iconSrc: TEMPLATE_ICONS.hline },
	{ type: 'vline', label: '竖线', icon: '│', iconSrc: TEMPLATE_ICONS.vline },
	{ type: 'box', label: '方框', icon: '□', iconSrc: TEMPLATE_ICONS.box },
]

var _uid = 0

export function createElementId(type) {
	_uid += 1
	return (type || 'el') + '_' + Date.now().toString(36) + '_' + _uid
}

/**
 * @param {string} type
 * @param {{ x?: number, y?: number }} pos
 */
export function createDefaultElement(type, pos) {
	pos = pos || {}
	var x = pos.x != null ? Number(pos.x) : 2
	var y = pos.y != null ? Number(pos.y) : 2
	var base = {
		id: createElementId(type),
		type: type,
		x: x,
		y: y,
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
				wrap: false,
				ellipsis: false,
				rotate: 0,
				alignH: 'left',
				alignV: 'top',
				widthMm: 30,
				heightMm: 3,
			})
		case 'image':
			return Object.assign(base, {
				name: '图片',
				imageKey: 'weChat',
				imagePath: '/static/logo/weChat.png',
				widthMm: 10,
				heightMm: 10,
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
				widthMm: qrSideMmFromUnit(4, 'https://example.com', 2),
				heightMm: qrSideMmFromUnit(4, 'https://example.com', 2),
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
	var found = ELEMENT_TYPES.find(function (item) {
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

/** 估算单行文本宽度（mm），中文按满格、ASCII 约半格 */
export function estimateTextWidthMm(content, charMm) {
	var cell = Math.max(0.5, Number(charMm) || TEXT_CHAR_MM || 3)
	var s = String(content == null ? '' : content)
	var units = 0
	for (var i = 0; i < s.length; i++) {
		units += s.charCodeAt(i) > 0x7f ? 1 : 0.55
	}
	return Math.max(cell, Math.round(units * cell * 10) / 10)
}

/** 按元素宽度估算每行最大字符数（按中文满格计） */
export function estimateTextMaxChars(widthMm, mag) {
	var cell = (TEXT_CHAR_MM || 3) * Math.max(1, Number(mag) || 1)
	var w = Math.max(cell, Number(widthMm) || cell)
	return Math.max(1, Math.floor(w / cell))
}

/**
 * 按宽度换行（支持手动换行符），供画布与打印共用
 */
export function wrapDesignText(str, maxChars, maxLines) {
	var limit = Math.max(1, Number(maxChars) || 1)
	var max = Math.max(1, Number(maxLines) || 50)
	var raw = String(str == null ? '' : str)
	var paragraphs = raw.split(/\r?\n/)
	var lines = []
	for (var p = 0; p < paragraphs.length; p++) {
		var rest = paragraphs[p]
		if (rest === '' && p < paragraphs.length - 1) {
			lines.push('')
			if (lines.length >= max) break
			continue
		}
		while (rest.length > 0 && lines.length < max) {
			if (rest.length <= limit) {
				lines.push(rest)
				break
			}
			lines.push(rest.slice(0, limit))
			rest = rest.slice(limit)
		}
		if (lines.length >= max) break
	}
	return lines.length ? lines : ['']
}

/** 单行截断并加省略号（maxChars 按中文满格） */
export function truncateDesignText(str, maxChars) {
	var s = String(str == null ? '' : str)
	var limit = Math.max(1, Number(maxChars) || 1)
	if (s.length <= limit) return s
	if (limit <= 1) return '…'
	return s.slice(0, limit - 1) + '…'
}

/** 文字元素在画布/打印上的字号高度（mm） */
export function textCharHeightMm(el) {
	var mag = Math.max(1, Math.min(4, Number(el && el.mag) || 1))
	var sizeDots = Number(el && el.size) > 0 ? Number(el.size) : TEXT_BASE_DOTS || 24
	return (sizeDots / 8) * mag
}

/** 底部纸张摘要：80×100 */
export function formatPaperSummary(paper) {
	var p = paper || {}
	var w = Number(p.widthMm) || 0
	var h = Number(p.heightMm) || 0
	return w + '×' + h
}

/**
 * 根据拖拽后的宽高回写元素属性
 */
export function applyElementSize(el, widthMm, heightMm) {
	if (!el) return el
	var next = Object.assign({}, el)
	var w = Math.max(1, Math.round(Number(widthMm) * 10) / 10)
	var h = Math.max(0.5, Math.round(Number(heightMm) * 10) / 10)
	next.widthMm = w
	next.heightMm = h
	if (next.type === 'hline') {
		next.lengthMm = w
	} else if (next.type === 'vline') {
		next.lengthMm = h
	} else if (next.type === 'qrcode') {
		var side = Math.max(w, h)
		next.unit = qrUnitFromSideMm(side, next.data, next.level)
		side = qrSideMmFromUnit(next.unit, next.data, next.level)
		next.widthMm = side
		next.heightMm = side
	} else if (next.type === 'barcode') {
		next.heightMm = h
	}
	// text：只改区域宽高，不改 mag
	return next
}
