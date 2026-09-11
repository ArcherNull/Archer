/**
 * 模板设计元素类型与默认值（坐标单位：mm）
 */

// 默认 CPCL 字号点阵（芝柯 T 0 24 / 汉印 24x24）；203dpi 下约 3mm
var TEXT_BASE_DOTS = 24
var TEXT_CHAR_MM = 3

/**
 * 字库 ID → 点阵高度（与 CpclPreview / 汉印说明对齐）
 * size>0 时以 size 为准；size=0 时看 font
 */
export var FONT_DOT_MAP = {
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

export { TEXT_BASE_DOTS, TEXT_CHAR_MM }

/** 解析文字基础点阵高度 */
export function resolveTextBaseDots(font, size) {
	var sz = Number(size)
	if (!isNaN(sz) && sz > 0) return sz
	var f = Number(font)
	if (FONT_DOT_MAP[f] != null) return FONT_DOT_MAP[f]
	return TEXT_BASE_DOTS || 24
}

/** 文字放大（SETMAG）：0~6，默认 1 */
export var TEXT_MAG_MIN = 0
export var TEXT_MAG_MAX = 6
export var TEXT_MAG_DEFAULT = 1
/** 画布 zoom=100% 时 pxPerMm（与 CanvasBoard 一致） */
export var TEXT_PREVIEW_PX_PER_MM = 4

export function normalizeTextMag(mag) {
	if (mag == null || mag === '') return TEXT_MAG_DEFAULT
	var n = Math.round(Number(mag))
	if (isNaN(n)) return TEXT_MAG_DEFAULT
	if (n < TEXT_MAG_MIN) return TEXT_MAG_MIN
	if (n > TEXT_MAG_MAX) return TEXT_MAG_MAX
	return n
}

/**
 * 画布 100% 缩放时的展示字号(px)
 * 0→8，1→10，2→24，3→36，4→48，5→60，6→72（对应 SETMAG n n）
 */
export function textMagToPreviewPx(mag) {
	var m = normalizeTextMag(mag)
	if (m === 0) return 8
	if (m === 1) return 10
	return 12 * m
}

/** 画布实际字号 = 100%基准 × zoom */
export function textPreviewFontPx(el, zoom) {
	var z = Number(zoom)
	if (isNaN(z) || z <= 0) z = 1
	return Math.max(8, Math.round(textMagToPreviewPx(el && el.mag) * z))
}

/** 二维码边长：模块数 × 单元大小 / 8dot≈1mm */
export var QR_DOTS_PER_MM = 8
/**
 * 画布/占位相对 byte 模式估算的缩放。
 * 实测：单元=3 时估算约 20mm，打印机约 15mm → 15/20=0.75
 */
export var QR_SIDE_PRINT_SCALE = 0.75

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

/**
 * 画布占位边长（mm），按打印机实测缩放，避免比实物偏大
 * 单元=3 → 约 15mm（不再显示成 20mm）
 */
export function qrSideMmFromUnit(unit, data, level) {
	var u = Math.max(1, Math.min(16, Number(unit) || 4))
	var modules = estimateQrModules(data, level)
	var scale = Number(QR_SIDE_PRINT_SCALE)
	if (!(scale > 0) || scale > 1) scale = 0.75
	var side = ((modules * u) / (QR_DOTS_PER_MM || 8)) * scale
	// 下限：约 unit×2.5mm，避免过小难选中
	var minSide = Math.round(u * 2.5 * 10) / 10
	return Math.max(minSide, Math.round(side * 10) / 10)
}

export function qrSideMmFromElement(el) {
	if (!el) return qrSideMmFromUnit(4, '', 2)
	return qrSideMmFromUnit(el.unit, el.data, el.level)
}

export function qrUnitFromSideMm(sideMm, data, level) {
	var side = Math.max(1, Number(sideMm) || 0)
	var modules = Math.max(21, estimateQrModules(data, level))
	var scale = Number(QR_SIDE_PRINT_SCALE)
	if (!(scale > 0) || scale > 1) scale = 0.75
	// side ≈ modules * unit / 8 * scale  →  unit ≈ side * 8 / (modules * scale)
	return Math.max(
		1,
		Math.min(16, Math.round((side * (QR_DOTS_PER_MM || 8)) / (modules * scale)))
	)
}

/** 文字旋转可选角度 */
export var TEXT_ROTATE_OPTIONS = [
	{ value: 0, label: '0°' },
	{ value: 90, label: '90°' },
	{ value: 180, label: '180°' },
	{ value: 270, label: '270°' },
]

/**
 * 条码 / 二维码方向（CPCL 无独立旋转参数）
 * 横向 → BARCODE / BARCODE QR
 * 纵向 → VBARCODE / VBARCODE QR（等同旋转 90°）
 */
export var CODE_ORIENT_OPTIONS = [
	{ value: 0, label: '横向', cmd: 'BARCODE' },
	{ value: 90, label: '纵向', cmd: 'VBARCODE' },
]

export function normalizeElementRotate(rotate) {
	var n = Number(rotate)
	if (n === 90 || n === 180 || n === 270) return n
	return 0
}

/** 条码/二维码仅支持横/纵：非 0 一律视为纵向(90) */
export function normalizeCodeOrient(rotate) {
	var n = Number(rotate)
	if (n === 90 || n === 270) return 90
	return 0
}

/** 画布元素层叠：0 最底（仍在画布上），默认 1，最大 1000 */
export var Z_INDEX_MIN = 0
export var Z_INDEX_MAX = 1000
export var Z_INDEX_DEFAULT = 1

export function normalizeZIndex(z) {
	if (z == null || z === '') return Z_INDEX_DEFAULT
	var n = Math.round(Number(z))
	if (isNaN(n)) return Z_INDEX_DEFAULT
	if (n < Z_INDEX_MIN) return Z_INDEX_MIN
	if (n > Z_INDEX_MAX) return Z_INDEX_MAX
	return n
}

/**
 * 画布占位是否相对模型宽高对调（纵向条码 / 文字 90°·270° 等）
 * 拖拽缩放时：屏幕上的 w/h 需换算回模型 widthMm/heightMm
 */
export function isElementDisplaySizeSwapped(el) {
	if (!el) return false
	var type = el.type || ''
	if (type === 'barcode' || type === 'qrcode') {
		return normalizeCodeOrient(el.rotate) === 90
	}
	if (type === 'text') {
		var tr = normalizeElementRotate(el.rotate)
		return tr === 90 || tr === 270
	}
	var r = normalizeElementRotate(el.rotate)
	return r === 90 || r === 270
}

/** 横向/纵向条码走向长度（widthMm）下限 */
export var BARCODE_RUN_MIN_MM = 15

/**
 * 将画布展示宽高转为模型 widthMm/heightMm（纵向/旋转时对调）
 */
export function displaySizeToModelSize(el, displayW, displayH) {
	var w = Number(displayW)
	var h = Number(displayH)
	if (isElementDisplaySizeSwapped(el)) {
		return { widthMm: h, heightMm: w }
	}
	return { widthMm: w, heightMm: h }
}

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
	undo: '/static/icon/上一步.png',
	redo: '/static/icon/下一步.png',
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
		/** 画布层叠：0 最底，默认 1，最大 1000 */
		zIndex: 1,
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
				ellipsisLines: 2,
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
				rotate: 0,
				widthMm: 40,
				heightMm: 8,
			})
		case 'qrcode':
			return Object.assign(base, {
				name: '二维码',
				data: 'https://example.com',
				level: 2,
				unit: 4,
				rotate: 0,
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
	return Math.max(cell * 0.55, Math.round(units * cell * 10) / 10)
}

/** 文本占位“格数”（中文 1，ASCII 0.55） */
export function estimateTextUnits(content) {
	var s = String(content == null ? '' : content)
	var units = 0
	for (var i = 0; i < s.length; i++) {
		units += s.charCodeAt(i) > 0x7f ? 1 : 0.55
	}
	return units
}

/**
 * 按容器宽度估算最大格数（与字号 mm 挂钩）
 * @param {number} widthMm
 * @param {number} [mag] 放大倍数 1~4（旧调用）
 * @param {number} [charMm] 若传入则优先按字号 mm 计算
 */
export function estimateTextMaxChars(widthMm, mag, charMm) {
	var cell
	if (charMm != null && !isNaN(Number(charMm)) && Number(charMm) > 0) {
		cell = Math.max(0.5, Number(charMm))
	} else {
		cell = textMagToPreviewPx(mag) / TEXT_PREVIEW_PX_PER_MM
	}
	var w = Math.max(cell * 0.55, Number(widthMm) || cell)
	return Math.max(1, Math.floor((w / cell) * 100) / 100)
}

/**
 * 按容器宽度换行（支持手动换行符；按中/英格数计量）
 * 供画布与打印共用
 */
export function wrapDesignText(str, maxUnits, maxLines) {
	var limit = Math.max(0.55, Number(maxUnits) || 1)
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
			var units = 0
			var cut = 0
			for (; cut < rest.length; cut++) {
				var u = rest.charCodeAt(cut) > 0x7f ? 1 : 0.55
				if (units + u > limit && cut > 0) break
				units += u
			}
			if (cut <= 0) cut = 1
			lines.push(rest.slice(0, cut))
			rest = rest.slice(cut)
		}
		if (lines.length >= max) break
	}
	return lines.length ? lines : ['']
}

/** 单行按格数截断（打印/画布共用；末尾 …） */
export function truncateDesignText(str, maxUnits) {
	var s = String(str == null ? '' : str)
	var limit = Math.max(0.55, Number(maxUnits) || 1)
	var ellipsisUnits = 1
	if (estimateTextUnits(s) <= limit) return s
	if (limit <= ellipsisUnits) return '…'
	var budget = limit - ellipsisUnits
	var units = 0
	var cut = 0
	for (; cut < s.length; cut++) {
		var u = s.charCodeAt(cut) > 0x7f ? 1 : 0.55
		if (units + u > budget) break
		units += u
	}
	if (cut <= 0) return '…'
	return s.slice(0, cut) + '…'
}

/** 换行+省略时的最大行数，最小 2 */
export function normalizeEllipsisLines(n) {
	var v = Math.floor(Number(n) || 2)
	if (isNaN(v) || v < 2) v = 2
	if (v > 50) v = 50
	return v
}

/**
 * 按元素宽/换行/省略规则解析为最终行列表（画布预览与打印指令同源）
 * @returns {string[]}
 */
export function resolveDesignTextLines(el) {
	var content = el && el.content != null ? String(el.content) : ''
	var wrap = !!(el && el.wrap)
	var ellipsis = !!(el && el.ellipsis)
	var charMm = textCharHeightMm(el)
	var boxW = Number(el && el.widthMm)
	if (!(boxW > 0)) boxW = 30
	var boxH = Number(el && el.heightMm)
	if (!(boxH > 0)) boxH = charMm
	var maxUnits = estimateTextMaxChars(boxW, 1, charMm)
	var lineHMm = Math.max(0.5, charMm)

	if (wrap) {
		var maxLines
		if (ellipsis) {
			maxLines = normalizeEllipsisLines(el && el.ellipsisLines)
		} else {
			maxLines = Math.max(1, Math.floor(boxH / lineHMm) || 1)
		}
		var lines = wrapDesignText(content, maxUnits, maxLines)
		if (ellipsis) {
			var all = wrapDesignText(content, maxUnits, 200)
			if (all.length > maxLines && lines.length) {
				lines[lines.length - 1] = truncateDesignText(lines[lines.length - 1], maxUnits)
			}
		}
		return lines
	}

	var line = content.replace(/\r?\n/g, ' ')
	if (ellipsis) line = truncateDesignText(line, maxUnits)
	return [line]
}

/** 文字元素字高（mm）：与画布 100% 字号对齐，便于占位/换行 */
export function textCharHeightMm(el) {
	return textMagToPreviewPx(el && el.mag) / TEXT_PREVIEW_PX_PER_MM
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
		// widthMm=条码走向长度，heightMm=条高（与横/纵无关，展示层自行对调）
		next.widthMm = Math.max(BARCODE_RUN_MIN_MM, w)
		next.heightMm = Math.max(3, h)
	}
	// text：只改区域宽高，不改 mag
	return next
}
