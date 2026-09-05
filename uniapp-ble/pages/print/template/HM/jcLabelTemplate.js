/**
 * 汉印 — 军城标签模板（历史 O098=2 旧版）
 * 布局对齐 CC3/jcLabelTemplate，指令走 PrinterCpcl
 */
import { LOGO_EG_DATA } from './logo.js'
import {
	buildCpcl,
	createGetVal,
	raw,
	page,
	prefeed,
	logoEg,
	text,
	setMag,
	b128,
	vb128,
	qr,
	box,
	line,
	formPrint,
} from './cpclHelper.js'

export function getJCLabelTemplate(data) {
	const json = data || {}
	const getVal = createGetVal(json)
	return buildCpcl((P) => {
		page(P, 790)
		raw(P, 'GAP-SENSE')
		prefeed(P, 10)
		logoEg(P, 8, 58, 10, 2, LOGO_EG_DATA)
		text(P, 3, 0, 75, 10, '德坤')
		text(P, 7, 0, 70, 30, 'DeKun')
		setMag(P, 3, 3)
		text(P, 3, 0, 10, 55, getVal('beMustShip'))
		setMag(P, 0, 0)
		b128(P, 2, 1, 50, 170, 5, `${getVal('code')}-${getVal('currentCopyCode')}`)
		vb128(P, 2, 1, 50, 510, 540, `${getVal('code')}-${getVal('currentCopyCode')}`)

		const codeLength = String(getVal('code') || '').length
		const codeOffset = codeLength * 25
		setMag(P, 2, 2)
		text(P, 3, 0, 170, 70, getVal('code'))
		setMag(P, 0, 0)
		text(P, 3, 0, 170 + codeOffset, 85, `-${getVal('currentCopyCode')}`)

		text(P, 3, 0, 15, 160, `终端部门：${getVal('destinationPoint')}`)
		setMag(P, 2, 2)
		text(P, 3, 0, 50, 220, getVal('transitStationName'))
		setMag(P, 0, 0)
		setMag(P, 2, 2)
		text(P, 3, 0, 330, 220, getVal('transitMode'))
		setMag(P, 0, 0)
		setMag(P, 2, 2)
		text(P, 3, 0, 15, 300, '收')
		setMag(P, 0, 0)
		text(P, 0, 20, 70, 295, getVal('receivedManMasked'))
		text(P, 0, 20, 70, 325, getVal('receivedManPhoneMasked'))

		const street = getVal('receiveStreet')
		const addr = getVal('receivedAddress')
		if (street) {
			if (street.length > 16) {
				text(P, 0, 20, 10, 355, street.substring(0, 16))
				text(P, 0, 20, 10, 375, street.substring(16, 32))
				if (addr && addr.length > 14) {
					text(P, 0, 20, 10, 400, addr.substring(0, 14))
					text(P, 0, 20, 10, 425, addr.substring(14, 28))
				} else {
					text(P, 0, 20, 10, 375, addr)
				}
			} else {
				text(P, 0, 20, 10, 355, street)
				if (addr && addr.length > 14) {
					text(P, 0, 20, 10, 375, addr.substring(0, 14))
					text(P, 0, 20, 10, 400, addr.substring(14, 28))
				} else {
					text(P, 0, 20, 10, 375, addr)
				}
			}
		} else {
			text(P, 0, 20, 10, 355, (addr || '').substring(0, 14))
			text(P, 0, 20, 10, 375, (addr || '').substring(14, 28))
		}

		qr(
			P,
			320,
			283,
			4,
			5,
			`http://tms.dekuncn.com:9011/#/home?customerCode=${getVal('code')}`
		)
		setMag(P, 2, 2)
		text(P, 3, 0, 15, 460, '寄')
		setMag(P, 0, 0)

		const shipCompany = getVal('shipCompany')
		if (shipCompany) {
			if (shipCompany.length > 11) {
				text(P, 0, 20, 70, 455, shipCompany.substring(0, 11))
				text(P, 0, 20, 70, 475, shipCompany.substring(11, 22))
				text(P, 0, 20, 70, 500, `*${getVal('shipManMasked')}`)
				text(P, 0, 20, 70, 525, getVal('shipManPhoneMasked'))
			} else {
				text(P, 0, 20, 70, 460, shipCompany)
				text(P, 0, 20, 70, 490, `*${getVal('shipManMasked')}`)
				text(P, 0, 20, 70, 520, getVal('shipManPhoneMasked'))
			}
		}

		text(
			P,
			0,
			20,
			310,
			475,
			`${getVal('beWarehouse') == '1' ? '进仓' : ''} ${getVal('beLoading') == '1' ? '装卸' : ''}`
		)
		text(P, 0, 20, 310, 505, getVal('isUpfloor'))
		text(P, 3, 0, 20, 585, '货物')
		text(P, 3, 0, 20, 615, '信息')
		text(P, 3, 0, 120, 565, `品名：${getVal('itemNames')}`)
		text(P, 3, 0, 120, 600, `件数：${getVal('quantity')}`)
		text(P, 3, 0, 120, 635, `包装：${getVal('packUnits')}`)
		text(P, 0, 20, 310, 565, `交接方式：${getVal('handoverMode')}`)
		text(
			P,
			3,
			0,
			310,
			600,
			`${getVal('weight') ? getVal('weight') + 'KG' : ''}/${getVal('volume') ? getVal('volume') + 'F' : ''}`
		)
		text(P, 0, 20, 310, 640, `付款方式：${getVal('paymentMethod')}`)
		text(P, 24, 0, 5, 685, getVal('startPoint'))
		text(P, 24, 0, 310, 685, getVal('orderDate'))
		text(P, 24, 0, 5, 725, `兑现时间:${getVal('lastArrivedTime')}`)
		box(P, 5, 130, 500, 675, 1)
		line(P, 5, 210, 500, 210, 1)
		line(P, 5, 280, 500, 280, 1)
		line(P, 5, 450, 500, 450, 1)
		line(P, 5, 555, 500, 555, 1)
		line(P, 300, 210, 300, 675, 1)
		line(P, 100, 555, 100, 675, 1)
		formPrint(P)
	})
}
