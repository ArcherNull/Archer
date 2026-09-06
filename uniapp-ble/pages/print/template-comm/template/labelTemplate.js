/**
 * @file template-comm/template/labelTemplate.js
 * @desc 德坤普通标签（O098=0）— CC3 / 汉印共用
 */

import { createCpclBuilder } from '../builder/cpclBuilder.js'
import {
	LOGO_EG_DATA,
	LOGO_EG_BYTE_W,
	LOGO_EG_HEIGHT,
} from '../assets/logo.js'
import { beginLabel, resolveBrand } from './_helpers.js'

/**
 * @param {Object} data
 * @param {{ brand?: string }} options
 * @returns {{ cpcl: string, ops: Array, brand: string }}
 */
export function buildLabelTemplate(data = {}, options = {}) {
	const json = data || {}
	const b = createCpclBuilder({ brand: resolveBrand(options) })
	beginLabel(b, 490)
	b.logoEg(LOGO_EG_BYTE_W, LOGO_EG_HEIGHT, 7, 380, LOGO_EG_DATA)
	b.vbarcode128(
		2,
		1,
		50,
		10,
		370,
		`${json.QRCode || ''}-${json.currentCopyCode || ''}`
	)
	b.box(65, 0, 520, 440, 1)

	b.setMag(2, 2)
	b.setBold(2)
	b.vtext(3, 1, 80, 325, `${json.code || ''}-${json.currentCopyCode || ''}`)
	b.setBold(0)
	b.setMag(0, 0)

	if (json.startPoint == '盛聚拼多多项目部') {
		b.setMag(2, 2)
		b.setBold(2)
		b.vtext(55, 0, 88, 80, `-${json.currentCopyCode || ''}`)
		b.setBold(0)
		b.setMag(0, 0)
	}

	b.vtext(3, 0, 91, 425, '运单号')
	b.vtext(3, 1, 157, 105, `${json.quantity || ''}件`)
	b.vtext(3, 0, 157, 275, json.shipMan || '')
	b.vtext(3, 0, 157, 410, '发货')

	if (json.startPoint == '盛聚拼多多项目部') {
		b.vtext(
			3,
			0,
			221,
			350,
			`${json.transitStationName || ''}${json.transitStationName ? '-' : ''}`
		)
		b.setMag(2, 2)
		b.setBold(2)
		b.vtext(55, 0, 215, 270, json.receivedCompany || '')
		b.setBold(0)
		b.setMag(0, 0)
	} else {
		b.vtext(3, 0, 221, 260, json.transitStationName || '')
	}

	b.vtext(3, 0, 221, 410, '目的')
	b.vtext(3, 0, 285, 100, json.packUnits || '')
	b.vtext(3, 0, 285, 180, '包装')
	b.vtext(3, 0, 285, 315, json.itemNames || '')
	b.vtext(3, 0, 285, 410, '品名')
	b.vtext(3, 1, 349, 100, json.volume || '')
	b.vtext(3, 0, 349, 175, '计体')
	b.vtext(3, 1, 349, 330, json.weight || '')
	b.vtext(3, 0, 349, 410, '计重')
	b.vtext(3, 0, 413, 100, json.handoverMode || '')
	b.vtext(3, 0, 413, 280, json.receivedMan || '')
	b.vtext(3, 0, 413, 410, '收货')
	b.vtext(3, 0, 477, 285, json.destinationPoint || '')
	b.vtext(3, 0, 477, 410, '终端')

	b.line(136, 0, 136, 440, 1)
	b.line(200, 0, 200, 440, 1)
	b.line(264, 0, 264, 440, 1)
	b.line(328, 0, 328, 440, 1)
	b.line(392, 0, 392, 440, 1)
	b.line(456, 0, 456, 440, 1)
	b.line(65, 350, 136, 350, 1)
	b.line(136, 125, 200, 125, 1)
	b.line(264, 115, 456, 115, 1)
	b.line(264, 195, 392, 195, 1)
	b.line(136, 350, 520, 350, 1)

	b.vtext(3, 0, 524, 445, ` ${json.startPoint || ''}`)
	if (json.startPoint == '盛聚拼多多项目部') {
		b.setMag(3, 3)
		b.setBold(2)
		b.vtext(55, 0, 525, 121, '德坤')
		b.setBold(0)
		b.setMag(0, 0)
	}
	b.vtext(3, 0, 552, 445, ` ${json.time || ''}`)
	b.endPage()
	return b.build()
}

/** @returns {string} */
export function getLabelTemplate(data, options) {
	return buildLabelTemplate(data, options).cpcl
}
