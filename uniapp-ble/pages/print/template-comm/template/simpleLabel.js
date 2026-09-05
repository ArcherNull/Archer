/**
 * @file template-comm/template/simpleLabel.js
 * @desc 简易横版标签试打（通用 CPCL），演示品牌方言差异（PAGE-WIDTH / PW）
 */

import { createCpclBuilder, fitBarcode128 } from '../builder/cpclBuilder.js'
import {
	LOGO_EG_DATA,
	LOGO_EG_BYTE_W,
	LOGO_EG_HEIGHT,
} from '../assets/logo.js'

const EMPTY = {
	title: '',
	orderNo: '',
	fromName: '',
	toName: '',
	goods: '',
	remark: '',
}

/**
 * @param {Object} data
 * @param {{ brand?: string }} options
 */
export function buildSimpleLabel(data = {}, options = {}) {
	const d = Object.assign({}, EMPTY, data || {})
	const b = createCpclBuilder({ brand: options.brand || 'common' })
	const orderNo = String(d.orderNo || '')
	const bc = fitBarcode128(orderNo, {
		pageW: 576,
		preferredX: 40,
		minX: 20,
		height: 48,
	})

	b.page(400, 1)
	b.pageWidth(576)
	b.logoEg(LOGO_EG_BYTE_W, LOGO_EG_HEIGHT, 10, 8, LOGO_EG_DATA)
	b.setMag(2, 2)
	b.setBold(1)
	b.text(0, 24, 90, 18, d.title || '通用标签')
	b.setBold(0)
	b.setMag(1, 1)

	b.box(8, 80, 568, 360, 2)
	b.barcode128(bc.moduleWidth, bc.ratio, bc.height, bc.x, 95, orderNo)
	b.text(0, 24, bc.x, 155, '单号：' + orderNo)
	b.line(8, 190, 568, 190, 2)

	b.text(0, 24, 30, 210, '寄：' + (d.fromName || ''))
	b.text(0, 24, 30, 250, '收：' + (d.toName || ''))
	b.text(0, 24, 30, 290, '品名：' + (d.goods || ''))
	b.text(0, 24, 30, 330, d.remark || '')

	b.endPage()

	return b.build()
}

export function simpleLabelCpcl(data, options) {
	return buildSimpleLabel(data, options).cpcl
}
