/**
 * @file template-comm/builder/cpclToOps.js
 * @desc 将 CPCL 指令文本解析为预览用 ops（供未走 cpclBuilder 的模板使用）
 */

/**
 * @param {string} cpcl
 * @param {string} [brand]
 * @returns {Array<Record<string, any>>}
 */
export function cpclToOps(cpcl, brand = 'common') {
	const ops = []
	const lines = String(cpcl || '').split(/\r?\n/)
	let i = 0
	let currentAlign = 'LEFT'

	function push(op) {
		ops.push(Object.assign({ brand: brand }, op))
	}

	while (i < lines.length) {
		const raw = String(lines[i] || '').trim()
		i += 1
		if (!raw) continue

		let m = raw.match(/^!\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/)
		if (m) {
			push({
				type: 'page',
				width: 576,
				height: Number(m[4]) || 0,
				qty: Number(m[5]) || 1,
			})
			continue
		}

		m = raw.match(/^(?:PAGE-WIDTH|PW)\s+(\d+)/i)
		if (m) {
			const width = Number(m[1]) || 576
			push({ type: 'pageWidth', width: width })
			for (let j = ops.length - 1; j >= 0; j--) {
				if (ops[j].type === 'page') {
					ops[j].width = width
					break
				}
			}
			continue
		}

		m = raw.match(/^;TEXT-AREA\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/i)
		if (m) {
			const w = Number(m[3]) || 0
			const h = Number(m[4]) || 0
			push({
				type: 'textArea',
				x: Number(m[1]) || 0,
				y: Number(m[2]) || 0,
				w: w,
				h: h,
				widthMm: Math.round((w / 8) * 10) / 10,
				heightMm: Math.round((h / 8) * 10) / 10,
			})
			continue
		}

		m = raw.match(/^SETMAG\s+(\S+)\s+(\S+)/i)
		if (m) {
			const mw = Number(m[1])
			const mh = Number(m[2])
			push({
				type: 'setMag',
				w: isNaN(mw) ? 1 : mw,
				h: isNaN(mh) ? 1 : mh,
			})
			continue
		}

		m = raw.match(/^SETBOLD\s+(\S+)/i)
		if (m) {
			push({ type: 'setBold', n: Number(m[1]) || 0 })
			continue
		}

		m = raw.match(/^(CENTER|LEFT|RIGHT)$/i)
		if (m) {
			const d = m[1].toUpperCase()
			currentAlign = d === 'CENTER' || d === 'RIGHT' ? d : 'LEFT'
			push({ type: 'align', dir: currentAlign })
			continue
		}

		m = raw.match(/^BOX\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/i)
		if (m) {
			push({
				type: 'box',
				x1: Number(m[1]) || 0,
				y1: Number(m[2]) || 0,
				x2: Number(m[3]) || 0,
				y2: Number(m[4]) || 0,
				w: Number(m[5]) || 1,
			})
			continue
		}

		m = raw.match(/^(?:L|LINE)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/i)
		if (m) {
			push({
				type: 'line',
				x1: Number(m[1]) || 0,
				y1: Number(m[2]) || 0,
				x2: Number(m[3]) || 0,
				y2: Number(m[4]) || 0,
				w: Number(m[5]) || 1,
			})
			continue
		}

		m = raw.match(
			/^(B|BARCODE|VB|VBARCODE)\s+QR\s+(\S+)\s+(\S+)\s+M\s+(\S+)\s+U\s+(\S+)/i
		)
		if (m) {
			let data = ''
			while (i < lines.length) {
				const next = String(lines[i] || '').trim()
				i += 1
				if (/^ENDQR$/i.test(next)) break
				const ma = next.match(/^MA,?(.*)$/i)
				if (ma) data = ma[1] || ''
			}
			const unit = Number(m[5]) || 4
			const level = Number(m[4]) || 2
			const cmd = m[1].toUpperCase()
			const isV = cmd === 'VB' || cmd === 'VBARCODE'
			const modules = (() => {
				const len = String(data || '').length
				const ecc = Math.max(0, Math.min(3, level))
				const caps = [
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
				for (let v = 0; v < caps.length; v++) {
					if (len <= caps[v][ecc]) return 21 + v * 4
				}
				return 57
			})()
			const quiet = 0
			push({
				type: 'qr',
				orient: isV ? 'v' : 'h',
				x: Number(m[2]) || 0,
				y: Number(m[3]) || 0,
				level: level,
				unit: unit,
				size: (modules + quiet * 2) * unit,
				data: data,
			})
			continue
		}

		m = raw.match(
			/^(B|BARCODE|VB|VBARCODE)\s+128\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.*)$/i
		)
		if (m) {
			const cmd = m[1].toUpperCase()
			const isV = cmd === 'VB' || cmd === 'VBARCODE'
			push({
				type: 'barcode',
				orient: isV ? 'v' : 'h',
				moduleWidth: Number(m[2]) || 2,
				ratio: Number(m[3]) || 1,
				height: Number(m[4]) || 40,
				x: Number(m[5]) || 0,
				y: Number(m[6]) || 0,
				data: m[7] || '',
			})
			continue
		}

		m = raw.match(/^EG\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s*(.*)$/i)
		if (m) {
			const byteW = Number(m[1]) || 8
			const height = Number(m[2]) || 58
			const hex = String(m[5] || '')
				.replace(/\s+/g, '')
				.trim()
			push({
				type: 'logo',
				x: Number(m[3]) || 0,
				y: Number(m[4]) || 0,
				w: byteW * 8,
				h: height,
				byteWidth: byteW,
				hex: hex,
				align: currentAlign,
			})
			continue
		}

		m = raw.match(/^(TEXT270|TEXT180|TEXT90|VTEXT|VT|TEXT|T)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)(?:\s+(.*))?$/i)
		if (m) {
			const cmd = m[1].toUpperCase()
			let rotate = 0
			if (cmd === 'TEXT90' || cmd === 'VTEXT' || cmd === 'VT') rotate = 90
			else if (cmd === 'TEXT180') rotate = 180
			else if (cmd === 'TEXT270') rotate = 270
			const vertical = rotate === 90 || rotate === 270
			push({
				type: 'text',
				font: m[2],
				size: Number(m[3]) || 0,
				x: Number(m[4]) || 0,
				y: Number(m[5]) || 0,
				content: m[6] || '',
				vertical: vertical,
				rotate: rotate,
				align: currentAlign,
			})
			continue
		}

		if (/^GAP-SENSE$/i.test(raw)) {
			push({ type: 'gapSense' })
			continue
		}
		if (/^FORM$/i.test(raw)) {
			push({ type: 'form' })
			continue
		}
		if (/^PRINT$/i.test(raw)) {
			push({ type: 'print' })
			continue
		}
		if (/^PREFEED\s+/i.test(raw)) {
			const n = raw.match(/^PREFEED\s+(\S+)/i)
			push({ type: 'prefeed', n: n ? Number(n[1]) || 0 : 0 })
			continue
		}

		push({ type: 'raw', cmd: raw })
	}

	return ops
}

export default cpclToOps
