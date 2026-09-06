/**
 * @file template-comm/template/zoneIdLabelTemplate.js
 * @desc 深圳战区客制化标签（zoneId=23）— CC3 / 汉印共用
 */

import { createCpclBuilder, fitBarcode128 } from '../builder/cpclBuilder.js'
import {
	LOGO_EG_DATA,
	LOGO_EG_BYTE_W,
	LOGO_EG_HEIGHT,
} from '../assets/logo.js'
import { beginLabel, createGetVal, resolveBrand } from './_helpers.js'

/** 203dpi ≈ 8 dots/mm */
const DOTS_PER_MM = 8
const PAGE_W = 576
/** 顶部横条码右侧留白约 2mm */
const TOP_BARCODE_RIGHT_MARGIN = Math.round(2 * DOTS_PER_MM)

/**
 * @param {Object} data
 * @param {{ brand?: string }} options
 */
export function buildZoneIdLabelTemplate(data = {}, options = {}) {
	const json = data || {}
	const getVal = createGetVal(json)
	const b = createCpclBuilder({ brand: resolveBrand(options) })
	beginLabel(b, 790, { prefeed: 10 })

	b.logoEg(LOGO_EG_BYTE_W, LOGO_EG_HEIGHT, 10, 2, LOGO_EG_DATA)
	b.text(3, 0, 75, 10, '德坤')
	b.text(7, 0, 70, 30, 'DeKun')
	b.setMag(3, 3)
	b.text(3, 0, 10, 55, getVal('beMustShip'))
	b.setMag(0, 0)

	// 顶部横条码：右侧留约 2mm；长单号自动收窄模块，避免超纸宽
	const topBarcodeData = `${getVal('code')}-${getVal('currentCopyCode')}`
	const topBc = fitBarcode128(topBarcodeData, {
		pageW: PAGE_W,
		preferredX: 170,
		minX: 82,
		rightMargin: TOP_BARCODE_RIGHT_MARGIN,
		height: 50,
		ratio: 1,
	})
	b.barcode128(topBc.moduleWidth, topBc.ratio, topBc.height, topBc.x, 5, topBarcodeData)
	// 纵向条码相对初始 y=540 下移 110 点
	b.vbarcode128(2, 1, 50, 510, 650, topBarcodeData)

	const codeOffset = String(getVal('code') || '').length * 25
	b.setMag(2, 2)
	b.text(3, 0, 170, 70, getVal('code'))
	b.setMag(0, 0)
	b.text(3, 0, 170 + codeOffset, 85, `-${getVal('currentCopyCode')}`)

	b.text(3, 0, 15, 160, `终端部门：${getVal('destinationPoint')}`)
	b.setMag(2, 2)
	b.text(3, 0, 50, 220, getVal('transitStationName'))
	b.setMag(0, 0)
	b.text(3, 0, 330, 235, getVal('transitMode'))
	b.setMag(2, 2)
	b.text(3, 0, 15, 300, '收')
	b.setMag(0, 0)
	b.text(0, 20, 70, 295, getVal('receivedManMasked'))
	b.text(0, 20, 70, 325, getVal('receivedManPhoneMasked'))

	const street = String(getVal('receiveStreet') || '')
	const addr = String(getVal('receivedAddress') || '')
	if (street) {
		if (street.length > 16) {
			b.text(0, 20, 10, 355, street.substring(0, 16))
			b.text(0, 20, 10, 375, street.substring(16, 32))
			if (addr.length > 14) {
				b.text(0, 20, 10, 400, addr.substring(0, 14))
				b.text(0, 20, 10, 425, addr.substring(14, 28))
			} else {
				b.text(0, 20, 10, 375, addr)
			}
		} else {
			b.text(0, 20, 10, 355, street)
			if (addr.length > 14) {
				b.text(0, 20, 10, 375, addr.substring(0, 14))
				b.text(0, 20, 10, 400, addr.substring(14, 28))
			} else {
				b.text(0, 20, 10, 375, addr)
			}
		}
	} else {
		b.text(0, 20, 10, 355, addr.substring(0, 14))
		b.text(0, 20, 10, 375, addr.substring(14, 28))
	}

	b.qr(320, 283, 4, 5, `http://tms.dekuncn.com:9011/#/home?customerCode=${getVal('code')}`)
	b.setMag(2, 2)
	b.text(3, 0, 15, 460, '寄')
	b.setMag(0, 0)

	const shipCompany = String(getVal('shipCompany') || '')
	if (shipCompany) {
		if (shipCompany.length > 11) {
			b.text(0, 20, 70, 455, shipCompany.substring(0, 11))
			b.text(0, 20, 70, 475, shipCompany.substring(11, 22))
			b.text(0, 20, 70, 500, `*${getVal('shipManMasked')}`)
			b.text(0, 20, 70, 525, getVal('shipManPhoneMasked'))
		} else {
			b.text(0, 20, 70, 460, shipCompany)
			b.text(0, 20, 70, 490, `*${getVal('shipManMasked')}`)
			b.text(0, 20, 70, 520, getVal('shipManPhoneMasked'))
		}
	}

	b.text(
		0,
		20,
		310,
		475,
		`${getVal('beWarehouse') == '1' ? '进仓' : ''} ${getVal('beLoading') == '1' ? '装卸' : ''}`
	)
	b.text(0, 20, 310, 505, getVal('isUpfloor'))
	b.text(3, 0, 20, 585, '货物')
	b.text(3, 0, 20, 615, '信息')
	b.text(0, 20, 120, 575, `品名：${getVal('itemNames')}`)
	b.text(0, 20, 120, 605, `件数：${getVal('quantity')}`)
	b.text(0, 20, 120, 635, `包装：${getVal('packUnits')}`)
	b.text(0, 20, 310, 575, `交接方式：${getVal('handoverMode')}`)
	b.text(
		0,
		20,
		310,
		605,
		`${getVal('weight') ? getVal('weight') + 'KG' : ''}/${getVal('volume') ? getVal('volume') + 'F' : ''}`
	)
	b.text(0, 20, 310, 635, `付款方式：${getVal('paymentMethod')}`)
	b.text(24, 0, 5, 685, getVal('startPoint'))
	b.text(24, 0, 310, 685, getVal('orderDate'))
	b.text(24, 0, 5, 725, `兑现时间:${getVal('lastArrivedTime')}`)
	b.box(5, 130, 500, 675, 1)
	b.line(5, 210, 500, 210, 1)
	b.line(5, 280, 500, 280, 1)
	b.line(5, 450, 500, 450, 1)
	b.line(5, 555, 500, 555, 1)
	b.line(300, 210, 300, 675, 1)
	b.line(100, 555, 100, 675, 1)
	b.endPage()
	return b.build()
}

export function getZoneIdLabelTemplate(data, options) {
	return buildZoneIdLabelTemplate(data, options).cpcl
}
