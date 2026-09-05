/**
 * 汉印 — 浩运标签（O098=1）
 * 布局对齐 CC3/hyLabelTemplate，指令走 PrinterCpcl
 */
import { LOGO_EG_DATA } from './logo.js'
import {
	buildCpcl,
	createGetVal,
	raw,
	page,
	prefeed,
	logoEg,
	barcode128,
	box,
	text,
	setMag,
	line,
	formPrint,
} from './cpclHelper.js'

export function getHYLabelTemplate(data) {
	const getVal = createGetVal(data || {})
	return buildCpcl((P) => {
		page(P, 700)
		raw(P, 'GAP-SENSE')
		prefeed(P, 10)
		logoEg(P, 8, 58, 15, 5, LOGO_EG_DATA)
		barcode128(P, 2, 1, 50, 100, 10, getVal('QRCode'))
		box(P, 10, 70, 440, 490, 1)

		text(P, 3, 0, 25, 90, '运单号')
		setMag(P, 2, 2)
		text(P, 3, 0, 130, 75, getVal('code'))
		setMag(P, 0, 0)
		text(P, 3, 0, 35, 150, '发货')
		text(P, 3, 0, 130, 150, getVal('shipMan'))
		text(P, 3, 0, 360, 150, `${getVal('quantity')}件`)
		text(P, 3, 0, 35, 210, '目的')
		text(P, 3, 0, 130, 210, `${getVal('desitiantionSataion')}--${getVal('shortNetworkDestination')}`)
		text(P, 3, 0, 35, 270, '品名')
		text(P, 3, 0, 130, 270, getVal('itemNames'))
		text(P, 3, 0, 35, 330, '计重')
		text(P, 3, 0, 130, 330, getVal('weight'))
		text(P, 3, 0, 35, 390, '收货')
		text(P, 3, 0, 130, 390, getVal('receivedMan'))
		text(P, 3, 0, 35, 450, '终端')
		text(P, 3, 0, 130, 450, getVal('destinationPoint'))
		text(P, 3, 0, 275, 270, '包装')
		text(P, 3, 0, 360, 270, getVal('packUnits'))
		text(P, 3, 0, 275, 330, '计体')
		text(P, 3, 0, 360, 330, getVal('volume'))
		text(P, 3, 0, 360, 390, getVal('handoverMode'))
		text(P, 3, 0, 20, 500, getVal('startPoint'))
		text(P, 3, 0, 20, 525, getVal('orderDate'))

		line(P, 0, 130, 440, 130, 1)
		line(P, 0, 190, 440, 190, 1)
		line(P, 0, 250, 440, 250, 1)
		line(P, 0, 310, 440, 310, 1)
		line(P, 0, 370, 440, 370, 1)
		line(P, 0, 430, 440, 430, 1)
		line(P, 100, 70, 100, 490, 1)
		line(P, 340, 130, 340, 190, 1)
		line(P, 250, 250, 250, 370, 1)
		line(P, 340, 250, 340, 430, 1)
		formPrint(P)
	})
}
