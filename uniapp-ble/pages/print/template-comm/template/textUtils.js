/** 模板共用文本工具 */

const EMPTY_VALS = [undefined, '', null]

export function getVal(json, field) {
	if (!field) return ''
	const val = json && json[field]
	return EMPTY_VALS.includes(val) ? '' : val
}

export function createGetVal(json) {
	return (field) => getVal(json, field)
}

export function resolveBrand(options = {}) {
	if (options && options.brand) return options.brand
	if (options && options.ctx && options.ctx.brand) return options.ctx.brand
	return 'common'
}

/** 页首 GAP-SENSE：汉印不写（endPage 已按品牌收尾） */
export function maybeStartGapSense(b, brand) {
	if (String(brand || '').toUpperCase() !== 'HM') {
		b.gapSense()
	}
}

export function truncate(str, maxLen) {
	if (!str) return ''
	const s = String(str)
	if (s.length <= maxLen) return s
	return s.slice(0, Math.max(1, maxLen - 1)) + '…'
}

export function wrapText(str, maxLen, maxLines = 2) {
	if (!str) return ['']
	const s = String(str)
	const lines = []
	let rest = s
	while (rest.length > 0 && lines.length < maxLines) {
		if (rest.length <= maxLen) {
			lines.push(rest)
			break
		}
		lines.push(rest.slice(0, maxLen))
		rest = rest.slice(maxLen)
	}
	if (rest.length > 0 && lines.length === maxLines) {
		lines[maxLines - 1] = truncate(lines[maxLines - 1], maxLen)
	}
	return lines.length ? lines : ['']
}
