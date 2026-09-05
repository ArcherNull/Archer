/**
 * @file template-comm/builder/cpclBuilder.js
 * @desc 汉印 / 芝柯共用 CPCL 指令构建器
 * - 默认输出通用指令（TEXT / LINE / BARCODE / PAGE-WIDTH）
 * - brand=CC3|HM 时对双方差异做方言适配
 * - 同时收集 ops 供预览渲染（与打印指令同源）
 */

/**
 * @typedef {'common'|'CC3'|'HM'} CpclBrand
 * @typedef {{ brand?: CpclBrand, dpi?: number }} CpclBuilderOptions
 */

function normalizeBrand(brand) {
	const b = String(brand || 'common').trim().toUpperCase()
	if (b === 'CC3' || b === 'K319') return 'CC3'
	if (b === 'HM' || b === 'HPRT') return 'HM'
	return 'common'
}

function esc(v) {
	return String(v == null ? '' : v)
}

/**
 * 文本字号方言：
 * - 芝柯：常用 T 0 24（font=0, size=24）
 * - 汉印：size 被屏蔽须传 0；font 为字库 ID
 *   0=12x24、3=20x20、4=32x32、8/7/24=24x24、55=16x16
 *   若把芝柯的 0 24 原样发给汉印，会按 12x24 点阵再 SETMAG 放大 → 发虚模糊
 *
 * @param {CpclBrand} brand
 * @param {string|number} font
 * @param {string|number} size
 * @returns {{ font: string, size: string }}
 */
export function normalizeTextFont(brand, font, size) {
	const b = normalizeBrand(brand)
	let f = esc(font)
	let s = esc(size)
	if (b !== 'HM') {
		return { font: f, size: s }
	}
	const fontNum = Number(f)
	const sizeNum = Number(s)
	// 芝柯风格：font 0 + size 24 → 汉印 24x24 字库
	if (fontNum === 0 && (sizeNum === 24 || s === '24')) {
		return { font: '8', size: '0' }
	}
	// 其它「font0 + 非零 size」按中文正文字库处理，避免小点阵被放大
	if (fontNum === 0 && sizeNum > 0) {
		return { font: '8', size: '0' }
	}
	// 汉印 size 统一置 0（官方说明：该功能被屏蔽）
	return { font: f, size: '0' }
}

/**
 * Code128 符号宽度估算（dot）
 * @param {string} data
 * @param {number} moduleWidth 窄条单位宽
 */
export function estimateCode128Width(data, moduleWidth) {
	const len = Math.max(String(data || '').length, 1)
	const mw = Math.max(Number(moduleWidth) || 1, 1)
	return (len + 2) * 11 * mw + 13 * mw + 24
}

/**
 * 横条码落版：超纸宽时自动 moduleWidth 2→1，并左移起点
 * 汉印等机型 Code128 实测往往比理论值更宽，故加安全系数
 * @param {string} data
 * @param {{ pageW?: number, preferredX?: number, minX?: number, rightMargin?: number, height?: number, ratio?: number, safety?: number }} options
 */
export function fitBarcode128(data, options = {}) {
	const pageW = Number(options.pageW) || 576
	const rightMargin =
		options.rightMargin != null ? Math.max(0, Number(options.rightMargin)) : 24
	const maxRight = pageW - rightMargin
	const minX = options.minX != null ? Number(options.minX) : 70
	const safety = options.safety != null ? Number(options.safety) : 1.25
	const dataLen = String(data || '').length
	// 长单号直接用窄模块，避免顶部条码被裁切扫不出
	let moduleWidth = dataLen > 12 ? 1 : 2
	let x = options.preferredX != null ? Number(options.preferredX) : 82
	let w = estimateCode128Width(data, moduleWidth)
	if (x + w * safety > maxRight && moduleWidth > 1) {
		moduleWidth = 1
		w = estimateCode128Width(data, moduleWidth)
	}
	if (x + w * safety > maxRight) {
		x = Math.max(minX, Math.floor(maxRight - w * safety))
	}
	return {
		x: x,
		moduleWidth: moduleWidth,
		ratio: options.ratio != null ? Number(options.ratio) : 1,
		height: options.height != null ? Number(options.height) : 50,
	}
}

/**
 * 创建 CPCL 构建器
 * @param {CpclBuilderOptions} options
 */
export function createCpclBuilder(options = {}) {
	const brand = normalizeBrand(options.brand)
	const dpi = Number(options.dpi) || 200
	/** @type {string[]} */
	const lines = []
	/** @type {Array<Record<string, any>>} */
	const ops = []
	/** 当前对齐（预览 / 部分机型依赖） */
	let currentAlign = 'LEFT'

	const dialect = {
		// 芝柯历史模板多用 PAGE-WIDTH / T / L / B；汉印 Helper 多用 PW / TEXT / LINE / BARCODE
		pageWidthCmd: brand === 'HM' ? 'PW' : 'PAGE-WIDTH',
		textCmd: brand === 'CC3' ? 'T' : 'TEXT',
		lineCmd: brand === 'CC3' ? 'L' : 'LINE',
		barcodeCmd: brand === 'CC3' ? 'B' : 'BARCODE',
		vbarcodeCmd: brand === 'CC3' ? 'VB' : 'VBARCODE',
	}

	function pushLine(s) {
		const text = esc(s)
		if (!text) {
			lines.push('')
			return
		}
		lines.push(text.replace(/\r?\n/g, ''))
	}

	function pushOp(op) {
		ops.push(Object.assign({ brand }, op))
	}

	const api = {
		brand,
		dpi,
		dialect,

		/** 原始指令行 */
		raw(cmd) {
			pushLine(cmd)
			pushOp({ type: 'raw', cmd: esc(cmd) })
			return api
		},

		/**
		 * 标签页尺寸
		 * ! offset hRes vRes height qty
		 */
		page(height, qty = 1, offset = 0, hRes = dpi, vRes = dpi) {
			pushLine(`! ${offset} ${hRes} ${vRes} ${height} ${qty}`)
			pushOp({
				type: 'page',
				width: 576,
				height: Number(height) || 0,
				qty: Number(qty) || 1,
			})
			return api
		},

		pageWidth(w) {
			pushLine(`${dialect.pageWidthCmd} ${w}`)
			pushOp({ type: 'pageWidth', width: Number(w) || 576 })
			return api
		},

		gapSense() {
			pushLine('GAP-SENSE')
			pushOp({ type: 'gapSense' })
			return api
		},

		/**
		 * 结束一页并打印（推荐模板统一调用，勿再手写 gapSense+form+print）
		 *
		 * 品牌差异：
		 * - 芝柯：GAP-SENSE + FORM + PRINT
		 * - 汉印：仅 PRINT（对齐官方 demo / debug template8）
		 *   FORM 在部分汉印机型上会再定位走一格，出现「第一张有内容、第二张空白」
		 *
		 * @param {{ useGapSense?: boolean }} options 仅芝柯生效
		 */
		endPage(options = {}) {
			const useGapSense = options.useGapSense !== false
			if (brand === 'HM') {
				pushLine('PRINT')
				pushOp({ type: 'print' })
			} else {
				if (useGapSense) {
					pushLine('GAP-SENSE')
					pushOp({ type: 'gapSense' })
				}
				pushLine('FORM')
				pushOp({ type: 'form' })
				pushLine('PRINT')
				pushOp({ type: 'print' })
			}
			return api
		},

		prefeed(n = 10) {
			pushLine(`PREFEED ${n}`)
			pushOp({ type: 'prefeed', n: Number(n) || 0 })
			return api
		},

		setMag(w, h) {
			const ww = esc(w)
			const hh = h == null ? ww : esc(h)
			pushLine(`SETMAG ${ww} ${hh}`)
			pushOp({ type: 'setMag', w: Number(ww) || 1, h: Number(hh) || 1 })
			return api
		},

		setBold(n) {
			pushLine(`SETBOLD ${n}`)
			pushOp({ type: 'setBold', n: Number(n) || 0 })
			return api
		},

		align(dir) {
			const d = String(dir || 'LEFT').toUpperCase()
			currentAlign = d === 'CENTER' || d === 'RIGHT' ? d : 'LEFT'
			pushLine(currentAlign)
			pushOp({ type: 'align', dir: currentAlign })
			return api
		},

		/** 横排文本（内部按品牌映射字库，模板可统一写芝柯风格 0 24） */
		text(font, size, x, y, content) {
			const mapped = normalizeTextFont(brand, font, size)
			const c = esc(content)
			pushLine(`${dialect.textCmd} ${mapped.font} ${mapped.size} ${x} ${y} ${c}`)
			pushOp({
				type: 'text',
				font: mapped.font,
				size: Number(mapped.size) || 0,
				x: Number(x) || 0,
				y: Number(y) || 0,
				content: c,
				vertical: false,
				align: currentAlign,
			})
			return api
		},

		/** 竖排文本（通用用 VTEXT；汉印同样做字库映射） */
		vtext(font, size, x, y, content) {
			const mapped = normalizeTextFont(brand, font, size)
			const c = esc(content)
			pushLine(`VTEXT ${mapped.font} ${mapped.size} ${x} ${y} ${c}`)
			pushOp({
				type: 'text',
				font: mapped.font,
				size: Number(mapped.size) || 0,
				x: Number(x) || 0,
				y: Number(y) || 0,
				content: c,
				vertical: true,
				align: currentAlign,
			})
			return api
		},

		/** 竖排简写 VT（芝柯回单等）；汉印改发 VTEXT */
		vt(font, size, x, y, content) {
			const mapped = normalizeTextFont(brand, font, size)
			const c = esc(content)
			const cmd = brand === 'HM' ? 'VTEXT' : 'VT'
			pushLine(`${cmd} ${mapped.font} ${mapped.size} ${x} ${y} ${c}`)
			pushOp({
				type: 'text',
				font: mapped.font,
				size: Number(mapped.size) || 0,
				x: Number(x) || 0,
				y: Number(y) || 0,
				content: c,
				vertical: true,
				align: currentAlign,
			})
			return api
		},

		/** 竖向二维码 VB QR / VBARCODE QR */
		vqr(x, y, m, u, data) {
			const d = esc(data)
			const cmd = brand === 'CC3' ? 'VB' : 'VBARCODE'
			pushLine(`${cmd} QR ${x} ${y} M ${m} U ${u}`)
			pushLine(`MA,${d}`)
			pushLine('ENDQR')
			const unit = Number(u) || 4
			pushOp({
				type: 'qr',
				orient: 'v',
				x: Number(x) || 0,
				y: Number(y) || 0,
				size: 37 * unit,
				data: d,
			})
			return api
		},

		line(x1, y1, x2, y2, w = 1) {
			pushLine(`${dialect.lineCmd} ${x1} ${y1} ${x2} ${y2} ${w}`)
			pushOp({
				type: 'line',
				x1: Number(x1) || 0,
				y1: Number(y1) || 0,
				x2: Number(x2) || 0,
				y2: Number(y2) || 0,
				w: Number(w) || 1,
			})
			return api
		},

		box(x1, y1, x2, y2, w = 1) {
			pushLine(`BOX ${x1} ${y1} ${x2} ${y2} ${w}`)
			pushOp({
				type: 'box',
				x1: Number(x1) || 0,
				y1: Number(y1) || 0,
				x2: Number(x2) || 0,
				y2: Number(y2) || 0,
				w: Number(w) || 1,
			})
			return api
		},

		barcode128(width, ratio, height, x, y, data) {
			const d = esc(data)
			const mw = Number(width) || 2
			pushLine(
				`${dialect.barcodeCmd} 128 ${width} ${ratio} ${height} ${x} ${y} ${d}`
			)
			pushOp({
				type: 'barcode',
				orient: 'h',
				x: Number(x) || 0,
				y: Number(y) || 0,
				height: Number(height) || 40,
				moduleWidth: mw,
				ratio: Number(ratio) || 1,
				data: d,
			})
			return api
		},

		vbarcode128(width, ratio, height, x, y, data) {
			const d = esc(data)
			const mw = Number(width) || 2
			pushLine(
				`${dialect.vbarcodeCmd} 128 ${width} ${ratio} ${height} ${x} ${y} ${d}`
			)
			pushOp({
				type: 'barcode',
				orient: 'v',
				x: Number(x) || 0,
				y: Number(y) || 0,
				height: Number(height) || 40,
				moduleWidth: mw,
				ratio: Number(ratio) || 1,
				data: d,
			})
			return api
		},

		/**
		 * 二维码（通用 BARCODE QR；芝柯亦常用 B QR）
		 */
		qr(x, y, m, u, data) {
			const d = esc(data)
			const cmd = brand === 'CC3' ? 'B' : 'BARCODE'
			pushLine(`${cmd} QR ${x} ${y} M ${m} U ${u}`)
			pushLine(`MA,${d}`)
			pushLine('ENDQR')
			const unit = Number(u) || 4
			const size = 37 * unit
			pushOp({
				type: 'qr',
				orient: 'h',
				x: Number(x) || 0,
				y: Number(y) || 0,
				size,
				data: d,
			})
			return api
		},

		/** EG 位图 Logo */
		logoEg(byteW, height, x, y, egData) {
			const data = esc(egData)
			pushLine(`EG ${byteW} ${height} ${x} ${y} ${data}`)
			pushOp({
				type: 'logo',
				x: Number(x) || 0,
				y: Number(y) || 0,
				w: (Number(byteW) || 8) * 8,
				h: Number(height) || 58,
				align: currentAlign,
			})
			return api
		},

		form() {
			pushLine('FORM')
			pushOp({ type: 'form' })
			return api
		},

		print() {
			pushLine('PRINT')
			pushOp({ type: 'print' })
			return api
		},

		/** 汉印回单等偶发指令；芝柯可忽略 */
		brandFeed() {
			if (brand === 'HM') {
				pushLine('FEED 1')
				pushLine('PRINTFEED 1')
				pushOp({ type: 'feed' })
			}
			return api
		},

		getOps() {
			return ops.slice()
		},

		toString() {
			return lines.join('\r\n') + '\r\n'
		},

		/** { cpcl, ops } 便于打印 + 预览 */
		build() {
			return {
				cpcl: api.toString(),
				ops: api.getOps(),
				brand,
			}
		},
	}

	return api
}

export default createCpclBuilder
