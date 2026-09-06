/**
 * @file template-comm/template/_helpers.js
 * @desc 通用模板字段读取等小工具
 */

const EMPTY_VALS = [undefined, '', null]

export function createGetVal(json) {
	const data = json || {}
	return function getVal(field) {
		if (!field) return ''
		const val = data[field]
		return EMPTY_VALS.includes(val) ? '' : val
	}
}

export function resolveBrand(options) {
	if (options && options.brand) return options.brand
	if (options && options.ctx && options.ctx.brand) return options.ctx.brand
	return 'common'
}

/** 页头：芝柯可加 GAP-SENSE；汉印不加（避免多走纸） */
export function beginLabel(b, height, opts = {}) {
	b.page(height, 1)
	if (opts.pageWidth) b.pageWidth(opts.pageWidth)
	if (b.brand !== 'HM') {
		b.gapSense()
	}
	if (opts.prefeed) b.prefeed(opts.prefeed)
	return b
}
