/**
 * @file template-comm/template/peiJunLabel.js
 * @desc 配军标签 — CC3 / 汉印共用（cpclBuilder）
 */

import { createCpclBuilder } from '../builder/cpclBuilder.js'
import {
	LOGO_EG_DATA,
	LOGO_EG_BYTE_W,
	LOGO_EG_HEIGHT,
} from '../assets/logo.js'

function truncate(str, maxLen) {
	if (!str) return ''
	const s = String(str)
	if (s.length <= maxLen) return s
	return s.slice(0, Math.max(1, maxLen - 1)) + '…'
}

function wrapText(str, maxLen, maxLines = 2) {
	if (!str) return ['']
	const s = String(str)
	const lines = []
	let rest = s
	while (rest.length > 0 && lines.length < maxLines) {
		if (rest.length <= maxLen) {
			lines.push(rest)
			break
		}
		lines.push(rest.slice(0, maxLen))
		rest = rest.slice(maxLen)
	}
	if (rest.length > 0 && lines.length === maxLines) {
		lines[maxLines - 1] = truncate(lines[maxLines - 1], maxLen)
	}
	return lines.length ? lines : ['']
}

const PAGE_W = 576
const Y_RECV_TOP = 360
const Y_SEND_TOP = 490
const Y_BOX_BOTTOM = 620
const PAGE_H = 780
const LINE_W = 3
const BODY_GAP = 28
const SMALL_GAP = 26

const EMPTY = {
	orderNo: '',
	transportType: '',
	transferHub: '',
	destArea: '',
	destOutlet: '',
	qrcode: '',
	goodsName: '',
	goodsQty: '',
	packType: '',
	weightVolume: '',
	receiverName: '',
	receiverPhone: '',
	receiverAddress: '',
	deliveryType: '',
	payType: '',
	senderAddress: '',
	senderName: '',
	senderPhone: '',
	valueAdded: '增值服务：',
	customerCode: '',
	footerOutlet: '',
	printDate: '',
	promiseTime: '兑现时间：',
}

function textLines(b, x, startY, gap, arr) {
	arr.forEach(function (line, i) {
		b.text(0, 24, x, startY + i * gap, line)
	})
}

/**
 * @param {Object} data 已映射字段
 * @param {{ brand?: string }} options
 * @returns {{ cpcl: string, ops: Array, brand: string }}
 */
export function buildPeiJunLabel(data = {}, options = {}) {
	const d = Object.assign({}, EMPTY, data || {})
	const b = createCpclBuilder({ brand: options.brand || 'common' })

	const destAreaLines = wrapText(d.destArea, 10, 3)
	const destOutletLines = wrapText(d.destOutlet, 10, 3)
	const receiverAddrLines = wrapText(d.receiverAddress, 10, 2)
	const senderAddrLines = wrapText(d.senderAddress, 10, 2)
	const deliveryLines = wrapText(d.deliveryType, 6, 3)
	const payTypeLines = wrapText(d.payType, 6, 2)
	const valueAddedLines = wrapText(d.valueAdded, 7, 3)
	const customerCodeLines = wrapText(d.customerCode, 12, 2)
	const orderNo = String(d.orderNo || '')

	b.page(PAGE_H, 1)
	b.pageWidth(PAGE_W)
	b.logoEg(LOGO_EG_BYTE_W, LOGO_EG_HEIGHT, 10, 2, LOGO_EG_DATA)
	b.barcode128(2, 1, 50, 82, 5, orderNo)
	b.setMag(2, 2)
	b.setBold(1)
	// 与品牌模板一致：font 3 size 0（汉印=20x20 字库；芝柯=T 3 0）
	b.text(3, 0, 182, 60, orderNo)
	b.setBold(0)
	b.setMag(1, 1)
	b.vbarcode128(2, 1, 50, 510, Y_BOX_BOTTOM, orderNo)
	b.box(5, 100, 500, Y_BOX_BOTTOM, LINE_W)

	b.setMag(2, 2)
	b.text(0, 24, 20, 115, d.transportType)
	b.setBold(1)
	b.text(0, 24, 280, 115, d.transferHub)
	b.setBold(0)
	b.setMag(1, 1)

	let yDest = 175
	b.setBold(1)
	textLines(b, 15, yDest, BODY_GAP, destAreaLines)
	yDest += destAreaLines.length * BODY_GAP
	const yOutlet = Math.max(yDest + 4, 220)
	textLines(b, 15, yOutlet, BODY_GAP, destOutletLines)
	b.setBold(0)

	b.qr(336, 169, 4, 4, d.qrcode)

	b.text(0, 24, 20, 285, d.goodsName)
	b.text(0, 24, 130, 285, d.goodsQty)
	b.text(0, 24, 230, 285, d.packType)
	b.setMag(1, 1)
	b.text(0, 24, 20, 330, d.weightVolume)

	b.setMag(2, 2)
	b.text(0, 24, 15, 380, '收')
	b.setMag(1, 1)
	let yRecv = 375
	b.text(0, 24, 70, yRecv, d.receiverName)
	yRecv += BODY_GAP
	b.text(0, 24, 70, yRecv, d.receiverPhone)
	yRecv += BODY_GAP
	textLines(b, 70, yRecv, BODY_GAP, receiverAddrLines)

	b.setBold(1)
	b.setMag(1, 1)
	let yDelivery = 375
	textLines(b, 340, yDelivery, SMALL_GAP, deliveryLines)
	yDelivery += deliveryLines.length * SMALL_GAP + 8
	textLines(b, 340, yDelivery, SMALL_GAP, payTypeLines)
	b.setBold(0)

	const ySendLabel = Y_SEND_TOP + 20
	const ySendContent = Y_SEND_TOP + 15
	b.setMag(2, 2)
	b.text(0, 24, 15, ySendLabel, '寄')
	b.setMag(1, 1)
	let ySend = ySendContent
	b.text(0, 24, 70, ySend, d.senderName)
	ySend += BODY_GAP
	b.text(0, 24, 70, ySend, d.senderPhone)
	ySend += BODY_GAP
	textLines(b, 70, ySend, BODY_GAP, senderAddrLines)

	textLines(b, 328, ySendContent, SMALL_GAP, valueAddedLines)
	const yCustomerCode = ySendContent + valueAddedLines.length * SMALL_GAP
	textLines(b, 328, yCustomerCode, SMALL_GAP, customerCodeLines)

	b.line(5, 160, 500, 160, LINE_W)
	b.line(5, 270, 325, 270, LINE_W)
	b.line(5, 315, 325, 315, LINE_W)
	b.line(325, 315, 500, 315, LINE_W)
	b.line(5, Y_RECV_TOP, 500, Y_RECV_TOP, LINE_W)
	b.line(5, Y_SEND_TOP, 500, Y_SEND_TOP, LINE_W)
	b.line(250, 100, 250, 160, LINE_W)
	b.line(325, 160, 325, 315, LINE_W)
	b.line(320, Y_RECV_TOP, 320, Y_BOX_BOTTOM, LINE_W)

	const yFooter1 = Y_BOX_BOTTOM + 15
	const yFooter2 = Y_BOX_BOTTOM + 40
	b.text(0, 24, 5, yFooter1, d.footerOutlet)
	b.text(0, 24, 320, yFooter1, d.printDate)
	b.text(0, 24, 5, yFooter2, d.promiseTime)
	b.endPage()

	return b.build()
}

export function peiJunLabelCpcl(data, options) {
	return buildPeiJunLabel(data, options).cpcl
}
