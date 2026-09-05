/**
 * @file template-comm/template/hyLabelTemplate.js
 * @desc 浩运标签（O098=1）— CC3 / 汉印共用
 */

import { createCpclBuilder } from '../builder/cpclBuilder.js'
import {
	LOGO_EG_DATA,
	LOGO_EG_BYTE_W,
	LOGO_EG_HEIGHT,
} from '../assets/logo.js'
import { beginLabel, createGetVal, resolveBrand } from './_helpers.js'

/**
 * @param {Object} data
 * @param {{ brand?: string }} options
 */
export function buildHYLabelTemplate(data = {}, options = {}) {
	const getVal = createGetVal(data)
	const b = createCpclBuilder({ brand: resolveBrand(options) })
	beginLabel(b, 700, { prefeed: 10 })
	b.logoEg(LOGO_EG_BYTE_W, LOGO_EG_HEIGHT, 15, 5, LOGO_EG_DATA)
	b.barcode128(2, 1, 50, 100, 10, getVal('QRCode'))
	b.box(10, 70, 440, 490, 1)

	b.text(3, 0, 25, 90, '运单号')
	b.setMag(2, 2)
	b.text(3, 0, 130, 75, getVal('code'))
	b.setMag(0, 0)
	b.text(3, 0, 35, 150, '发货')
	b.text(3, 0, 130, 150, getVal('shipMan'))
	b.text(3, 0, 360, 150, `${getVal('quantity')}件`)
	b.text(3, 0, 35, 210, '目的')
	b.text(
		3,
		0,
		130,
		210,
		`${getVal('desitiantionSataion')}--${getVal('shortNetworkDestination')}`
	)
	b.text(3, 0, 35, 270, '品名')
	b.text(3, 0, 130, 270, getVal('itemNames'))
	b.text(3, 0, 35, 330, '计重')
	b.text(3, 0, 130, 330, getVal('weight'))
	b.text(3, 0, 35, 390, '收货')
	b.text(3, 0, 130, 390, getVal('receivedMan'))
	b.text(3, 0, 35, 450, '终端')
	b.text(3, 0, 130, 450, getVal('destinationPoint'))
	b.text(3, 0, 275, 270, '包装')
	b.text(3, 0, 360, 270, getVal('packUnits'))
	b.text(3, 0, 275, 330, '计体')
	b.text(3, 0, 360, 330, getVal('volume'))
	b.text(3, 0, 360, 390, getVal('handoverMode'))
	b.text(3, 0, 20, 500, getVal('startPoint'))
	b.text(3, 0, 20, 525, getVal('orderDate'))

	b.line(0, 130, 440, 130, 1)
	b.line(0, 190, 440, 190, 1)
	b.line(0, 250, 440, 250, 1)
	b.line(0, 310, 440, 310, 1)
	b.line(0, 370, 440, 370, 1)
	b.line(0, 430, 440, 430, 1)
	b.line(100, 70, 100, 490, 1)
	b.line(340, 130, 340, 190, 1)
	b.line(250, 250, 250, 370, 1)
	b.line(340, 250, 340, 430, 1)

	b.endPage()
	return b.build()
}

export function getHYLabelTemplate(data, options) {
	return buildHYLabelTemplate(data, options).cpcl
}
