/**
 * 汉印 — 德坤普通标签（O098=0）
 * 布局对齐 CC3/labelTemplate，指令走 PrinterCpcl
 */
import { LOGO_EG_DATA } from './logo.js'
import {
	buildCpcl,
	raw,
	page,
	logoEg,
	vbarcode128,
	box,
	setMag,
	setBold,
	vtext,
	line,
	formPrint,
} from './cpclHelper.js'

export function getLabelTemplate(data) {
	const json = data || {}
	return buildCpcl((P) => {
		page(P, 490)
		raw(P, 'GAP-SENSE')
		logoEg(P, 8, 58, 7, 380, LOGO_EG_DATA)
		vbarcode128(P, 2, 1, 50, 10, 370, `${json.QRCode || ''}-${json.currentCopyCode || ''}`)
		box(P, 65, 0, 520, 440, 1)

		setMag(P, 2, 2)
		setBold(P, 2)
		vtext(P, 3, 1, 80, 325, `${json.code || ''}-${json.currentCopyCode || ''}`)
		setBold(P, 0)
		setMag(P, 0, 0)

		if (json.startPoint == '盛聚拼多多项目部') {
			setMag(P, 2, 2)
			setBold(P, 2)
			vtext(P, 55, 0, 88, 80, `-${json.currentCopyCode || ''}`)
			setBold(P, 0)
			setMag(P, 0, 0)
		}

		vtext(P, 3, 0, 91, 425, '运单号')
		vtext(P, 3, 1, 157, 105, `${json.quantity || ''}件`)
		vtext(P, 3, 0, 157, 275, json.shipMan || '')
		vtext(P, 3, 0, 157, 410, '发货')

		if (json.startPoint == '盛聚拼多多项目部') {
			vtext(
				P,
				3,
				0,
				221,
				350,
				`${json.transitStationName || ''}${json.transitStationName ? '-' : ''}`
			)
			setMag(P, 2, 2)
			setBold(P, 2)
			vtext(P, 55, 0, 215, 270, json.receivedCompany || '')
			setBold(P, 0)
			setMag(P, 0, 0)
		} else {
			vtext(P, 3, 0, 221, 260, json.transitStationName || '')
		}

		vtext(P, 3, 0, 221, 410, '目的')
		vtext(P, 3, 0, 285, 100, json.packUnits || '')
		vtext(P, 3, 0, 285, 180, '包装')
		vtext(P, 3, 0, 285, 315, json.itemNames || '')
		vtext(P, 3, 0, 285, 410, '品名')
		vtext(P, 3, 1, 349, 100, json.volume || '')
		vtext(P, 3, 0, 349, 175, '计体')
		vtext(P, 3, 1, 349, 330, json.weight || '')
		vtext(P, 3, 0, 349, 410, '计重')
		vtext(P, 3, 0, 413, 100, json.handoverMode || '')
		vtext(P, 3, 0, 413, 280, json.receivedMan || '')
		vtext(P, 3, 0, 413, 410, '收货')
		vtext(P, 3, 0, 477, 285, json.destinationPoint || '')
		vtext(P, 3, 0, 477, 410, '终端')

		line(P, 136, 0, 136, 440, 1)
		line(P, 200, 0, 200, 440, 1)
		line(P, 264, 0, 264, 440, 1)
		line(P, 328, 0, 328, 440, 1)
		line(P, 392, 0, 392, 440, 1)
		line(P, 456, 0, 456, 440, 1)
		line(P, 65, 350, 136, 350, 1)
		line(P, 136, 125, 200, 125, 1)
		line(P, 264, 115, 456, 115, 1)
		line(P, 264, 195, 392, 195, 1)
		line(P, 136, 350, 520, 350, 1)

		vtext(P, 3, 0, 524, 445, ` ${json.startPoint || ''}`)
		if (json.startPoint == '盛聚拼多多项目部') {
			setMag(P, 3, 3)
			setBold(P, 2)
			vtext(P, 55, 0, 525, 121, '德坤')
			setBold(P, 0)
			setMag(P, 0, 0)
		}
		vtext(P, 3, 0, 552, 445, ` ${json.time || ''}`)
		formPrint(P)
	})
}
