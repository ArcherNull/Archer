/**
 * @file template-comm/template/receiptTemplate.js
 * @desc 回单模板 — CC3 / 汉印共用
 */

import { createCpclBuilder } from '../builder/cpclBuilder.js'
import {
	LOGO_EG_DATA,
	LOGO_EG_BYTE_W,
	LOGO_EG_HEIGHT,
} from '../assets/logo.js'
import { resolveBrand } from './_helpers.js'

/**
 * 德坤回单（zoneId=23）
 * @param {Object} params
 * @param {{ brand?: string }} options
 */
export function buildReceiptTemplate(params = {}, options = {}) {
	const b = createCpclBuilder({ brand: resolveBrand(options) })
	b.page(815, 1)
	b.setMag(1, 1)
	b.setBold(1)
	b.logoEg(LOGO_EG_BYTE_W, LOGO_EG_HEIGHT, 15, 650, LOGO_EG_DATA)
	b.vqr(10, 630, 4, 4, params.运单号 || '')
	b.line(168, 128, 168, 128, 1)
	b.line(168, 272, 168, 272, 1)
	b.vt(8, 0, 80, 700, '德坤')
	b.setMag(2, 2)
	b.vt(8, 0, 40, 450, params.回单编号 || '')
	b.setMag(1, 1)
	b.vt(
		8,
		0,
		150,
		700,
		`${params.开单网点简称 || ''}->${params.中转地 || ''}/${params.路由目的地 || ''}`
	)
	b.vt(
		3,
		0,
		210,
		700,
		`货物信息：${params.品名 || ''}/${params.计费重量 || 0}KG/${params.计费体积 || 0}方/${params.件数 || 0}件`
	)
	b.vt(
		3,
		0,
		250,
		700,
		`回单要求：${params.回单要求 || ''}/${params.回单份数 || 0}份/${params.签名要求 || 0}`
	)
	b.vt(3, 0, 290, 700, `发货信息：${params.发货人 || ''}/${params.发货单位 || ''}`)
	const address = `${params.收货人 ? params.收货人 : params.收货单位 || ''}/${params.收货地址 || ''}`
	b.vt(3, 0, 330, 700, `收货信息：${address.substring(0, 22)}`)
	b.vt(3, 0, 370, 590, address.substring(22, 44))
	b.vt(3, 0, 410, 590, address.substring(44, address.length))
	// 德坤回单历史：FORM + PRINT（无 GAP-SENSE）
	b.endPage({ useGapSense: false })
	return b.build()
}

export function receiptTemplateJson(params, options) {
	return buildReceiptTemplate(params, options).cpcl
}

/**
 * 浩运回单
 * @param {Object} params
 * @param {{ brand?: string }} options
 */
export function buildHYReceiptTemplate(params = {}, options = {}) {
	const brand = resolveBrand(options)
	const b = createCpclBuilder({ brand: brand })
	b.page(730, 1)
	if (brand !== 'HM') b.gapSense()
	b.setMag(1, 1)
	b.setBold(1)
	b.logoEg(LOGO_EG_BYTE_W, LOGO_EG_HEIGHT, 15, 600, LOGO_EG_DATA)
	b.vqr(10, 100, 3, 3, params.运单号 || '')
	b.line(168, 128, 168, 128, 1)
	b.line(168, 272, 168, 272, 1)
	b.vt(8, 0, 80, 650, '德坤')
	b.setMag(2, 2)
	b.vt(8, 0, 40, 480, params.回单编号 || '')
	b.setMag(1, 1)
	b.vt(
		8,
		0,
		150,
		660,
		`${params.开单网点简称 || ''}->${params.中转地 || ''}/${params.路由目的地 || ''}`
	)
	b.vt(
		3,
		0,
		210,
		660,
		`货物信息：${params.品名}/${params.计费重量 || 0}KG/${params.计费体积 || 0}方/${params.件数 || 0}件`
	)
	b.vt(
		3,
		0,
		250,
		660,
		`回单要求：${params.回单要求 || ''}/${params.回单份数 || 0}份/${params.签名要求 || ''}`
	)
	b.vt(3, 0, 290, 660, `发货信息：${params.发货人 || ''}/${params.发货单位 || ''}`)
	const address = `${params.收货人 ? params.收货人 : params.收货单位 || ''}/${params.收货地址 || ''}`
	b.vt(3, 0, 330, 660, `收货信息：${address.substring(0, 20)}`)
	b.vt(3, 0, 370, 550, address.substring(20, 40))
	b.vt(3, 0, 410, 550, address.substring(40, address.length))
	// 浩运：页首已 GAP-SENSE（非汉印）；结尾 FORM+PRINT / 汉印仅 PRINT
	b.endPage({ useGapSense: false })
	if (brand === 'HM') {
		b.brandFeed()
		b.raw('CUT')
	}
	return b.build()
}

export function HYReceiptTemplate(params, options) {
	return buildHYReceiptTemplate(params, options).cpcl
}
