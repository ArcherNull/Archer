/**
 * 汉印 — 回单模板
 * - receiptTemplateJson：德坤回单（zoneId=23）
 * - HYReceiptTemplate：浩运回单（默认）
 * 布局对齐 CC3/receiptTemplate，指令走 PrinterCpcl
 */
import { LOGO_EG_DATA } from './logo.js'
import {
	buildCpcl,
	page,
	raw,
	setMag,
	setBold,
	logoEg,
	vt,
	line,
	formPrint,
} from './cpclHelper.js'

/** 竖排二维码 VB QR（回单专用，对齐 CC3） */
function vbQr(P, x, y, m, u, data) {
	raw(P, `VB QR ${x} ${y} M ${m} U ${u}`)
	raw(P, `MA,${data || ''}`)
	raw(P, 'ENDQR')
}

export function receiptTemplateJson(params) {
	const p = params || {}
	return buildCpcl((P) => {
		page(P, 815)
		setMag(P, 1, 1)
		setBold(P, 1)
		logoEg(P, 8, 58, 15, 650, LOGO_EG_DATA)
		vbQr(P, 10, 630, 4, 4, p.运单号)
		line(P, 168, 128, 168, 128, 1)
		line(P, 168, 272, 168, 272, 1)
		vt(P, 8, 0, 80, 700, '德坤')
		setMag(P, 2, 2)
		vt(P, 8, 0, 40, 450, p.回单编号 || '')
		setMag(P, 1, 1)
		vt(P, 8, 0, 150, 700, `${p.开单网点简称 || ''}->${p.中转地 || ''}/${p.路由目的地 || ''}`)
		vt(
			P,
			3,
			0,
			210,
			700,
			`货物信息：${p.品名 || ''}/${p.计费重量 || 0}KG/${p.计费体积 || 0}方/${p.件数 || 0}件`
		)
		vt(
			P,
			3,
			0,
			250,
			700,
			`回单要求：${p.回单要求 || ''}/${p.回单份数 || 0}份/${p.签名要求 || 0}`
		)
		vt(P, 3, 0, 290, 700, `发货信息：${p.发货人 || ''}/${p.发货单位 || ''}`)
		const address = `${p.收货人 ? p.收货人 : p.收货单位 || ''}/${p.收货地址 || ''}`
		vt(P, 3, 0, 330, 700, `收货信息：${address.substring(0, 22)}`)
		vt(P, 3, 0, 370, 590, address.substring(22, 44))
		vt(P, 3, 0, 410, 590, address.substring(44, address.length))
		formPrint(P)
	})
}

export function HYReceiptTemplate(params) {
	const p = params || {}
	return buildCpcl((P) => {
		page(P, 730)
		raw(P, 'GAP-SENSE')
		setMag(P, 1, 1)
		setBold(P, 1)
		logoEg(P, 8, 58, 15, 600, LOGO_EG_DATA)
		vbQr(P, 10, 100, 3, 3, p.运单号)
		line(P, 168, 128, 168, 128, 1)
		line(P, 168, 272, 168, 272, 1)
		vt(P, 8, 0, 80, 650, '德坤')
		setMag(P, 2, 2)
		vt(P, 8, 0, 40, 480, p.回单编号 || '')
		setMag(P, 1, 1)
		vt(P, 8, 0, 150, 660, `${p.开单网点简称 || ''}->${p.中转地 || ''}/${p.路由目的地 || ''}`)
		vt(
			P,
			3,
			0,
			210,
			660,
			`货物信息：${p.品名}/${p.计费重量 || 0}KG/${p.计费体积 || 0}方/${p.件数 || 0}件`
		)
		vt(
			P,
			3,
			0,
			250,
			660,
			`回单要求：${p.回单要求 || ''}/${p.回单份数 || 0}份/${p.签名要求 || ''}`
		)
		vt(P, 3, 0, 290, 660, `发货信息：${p.发货人 || ''}/${p.发货单位 || ''}`)
		const address = `${p.收货人 ? p.收货人 : p.收货单位 || ''}/${p.收货地址 || ''}`
		vt(P, 3, 0, 330, 660, `收货信息：${address.substring(0, 20)}`)
		vt(P, 3, 0, 370, 550, address.substring(20, 40))
		vt(P, 3, 0, 410, 550, address.substring(40, address.length))
		formPrint(P)
		raw(P, 'FEED 1')
		raw(P, 'PRINTFEED 1')
		raw(P, 'CUT')
	})
}
