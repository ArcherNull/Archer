/**
 * @file template-comm/template/peiJunLabel.js
 * @desc 配军标签 — CC3 / 汉印共用（cpclBuilder）
 * 纸张：70mm × 85mm（700×850，0.1mm）@ 203dpi ≈ 560×680 dots
 * 汉印出纸依赖 page height，必须与物理纸高一致，避免多走/少走纸
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

// ─── 纸张（70mm × 85mm） ─────────────────────────────
const DOTS_PER_MM = 8
const PAGE_W = 70 * DOTS_PER_MM // 560
const PAGE_H = 85 * DOTS_PER_MM // 680
/** 顶部条码上方预留 2mm 空白 */
const TOP_PAD = 2 * DOTS_PER_MM // 16
/** 汉印底部预留约 2mm 空白，避免内容贴缝/顶到下一张 */
const BOTTOM_PAD = 2 * DOTS_PER_MM // 16
const BARCODE_H = 50
const Y_BARCODE = TOP_PAD
const Y_ORDER_TEXT = Y_BARCODE + BARCODE_H + 4 // 70
const Y_BOX_TOP = 110

const Y_RECV_TOP = 370
const Y_SEND_TOP = 500
const LINE_W = 3
const BODY_GAP = 28
const SMALL_GAP = 26
/** 页脚相对底横线：紧贴横线下方 */
const FOOTER_GAP1 = 7
const FOOTER_GAP2 = 28
const FOOTER_TEXT_H = 24
/** 底框：为页脚 + 底部 2mm 留白让位 */
const Y_BOX_BOTTOM = PAGE_H - BOTTOM_PAD - FOOTER_GAP2 - FOOTER_TEXT_H // 612

function isHmBrand(brand) {
	const b = String(brand || '').toUpperCase()
	return b === 'HM' || b === 'HPRT'
}

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
	customerOrderNumber: '客户单号：',
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
	const brand = options.brand || 'common'
	const b = createCpclBuilder({ brand: brand })
	/** 汉印底部 2mm 留白；其它品牌保持略紧凑 */
	const boxBottom = isHmBrand(brand) ? Y_BOX_BOTTOM : 620
	const footerGap1 = isHmBrand(brand) ? FOOTER_GAP1 : 7
	const footerGap2 = isHmBrand(brand) ? FOOTER_GAP2 : 32

	const destAreaLines = wrapText(d.destArea, 10, 3)
	const destOutletLines = wrapText(d.destOutlet, 10, 3)
	const receiverAddrLines = wrapText(d.receiverAddress, 10, 2)
	const senderAddrLines = wrapText(d.senderAddress, 10, 2)
	const deliveryLines = wrapText(d.deliveryType, 6, 3)
	const payTypeLines = wrapText(d.payType, 6, 2)
	const valueAddedLines = wrapText(d.valueAdded, 7, 3)
	const customerOrderNumberLines = wrapText(d.customerOrderNumber, 12, 2)
	const orderNo = String(d.orderNo || '')

	b.page(PAGE_H, 1)
	b.pageWidth(PAGE_W)

	// 页头：顶留 2mm → Logo / 条码 / 运单号
	b.logoEg(LOGO_EG_BYTE_W, LOGO_EG_HEIGHT, 10, TOP_PAD, LOGO_EG_DATA)
	b.barcode128(2, 1, BARCODE_H, 82, Y_BARCODE, orderNo)
	b.setMag(2, 2)
	b.setBold(1)
	b.text(3, 0, 182, Y_ORDER_TEXT, orderNo)
	b.setBold(0)
	b.setMag(1, 1)
	b.vbarcode128(2, 1, 50, 510, boxBottom, orderNo)
	b.box(5, Y_BOX_TOP, 500, boxBottom, LINE_W)

	const yTransport = Y_BOX_TOP + 15
	b.setMag(2, 2)
	b.text(0, 24, 20, yTransport, d.transportType)
	b.setBold(1)
	b.text(0, 24, 280, yTransport, d.transferHub)
	b.setBold(0)
	b.setMag(1, 1)

	const yLine1 = Y_BOX_TOP + 60
	let yDest = Y_BOX_TOP + 75
	// 目的地市+区：与条码下运单号同款（SETMAG 2 2 + TEXT 3 0 + 加粗）
	const destAreaGap = 40
	b.setMag(2, 2)
	b.setBold(1)
	destAreaLines.forEach(function (line, i) {
		b.text(3, 0, 15, yDest + i * destAreaGap, line)
	})
	b.setBold(0)
	b.setMag(1, 1)
	yDest += destAreaLines.length * destAreaGap
	const yOutlet = Math.max(yDest + 4, Y_BOX_TOP + 120)
	b.setBold(1)
	textLines(b, 15, yOutlet, BODY_GAP, destOutletLines)
	b.setBold(0)

	b.qr(336, Y_BOX_TOP + 69, 4, 4, d.qrcode)

	const yGoods = Y_BOX_TOP + 185
	const yWeightLine = Y_BOX_TOP + 215
	const yWeight = Y_BOX_TOP + 230
	b.text(0, 24, 20, yGoods, d.goodsName)
	b.setBold(1)
	b.text(0, 24, 130, yGoods, d.goodsQty)
	b.setBold(0)
	b.text(0, 24, 230, yGoods, d.packType)
	b.setMag(1, 1)
	b.text(0, 24, 20, yWeight, d.weightVolume)

	b.setMag(2, 2)
	b.text(0, 24, 15, Y_RECV_TOP + 20, '收')
	b.setMag(1, 1)
	let yRecv = Y_RECV_TOP + 15
	b.text(0, 24, 70, yRecv, d.receiverName)
	yRecv += BODY_GAP
	b.text(0, 24, 70, yRecv, d.receiverPhone)
	yRecv += BODY_GAP
	textLines(b, 70, yRecv, BODY_GAP, receiverAddrLines)

	b.setBold(1)
	b.setMag(1, 1)
	let yDelivery = Y_RECV_TOP + 15
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
	textLines(b, 328, yCustomerCode, SMALL_GAP, customerOrderNumberLines)

	b.line(5, yLine1, 500, yLine1, LINE_W)
	b.line(5, yGoods - 15, 325, yGoods - 15, LINE_W)
	b.line(5, yWeightLine, 325, yWeightLine, LINE_W)
	b.line(325, yWeightLine, 500, yWeightLine, LINE_W)
	b.line(5, Y_RECV_TOP, 500, Y_RECV_TOP, LINE_W)
	b.line(5, Y_SEND_TOP, 500, Y_SEND_TOP, LINE_W)
	b.line(250, Y_BOX_TOP, 250, yLine1, LINE_W)
	b.line(325, yLine1, 325, yWeightLine, LINE_W)
	b.line(320, Y_RECV_TOP, 320, boxBottom, LINE_W)

	// 页脚：紧贴底横线；汉印再保证页底约 2mm 空白
	const yFooter1 = boxBottom + footerGap1
	const yFooter2 = boxBottom + footerGap2
	b.text(0, 24, 5, yFooter1, d.footerOutlet)
	b.text(0, 24, 320, yFooter1, d.printDate)
	b.text(0, 24, 5, yFooter2, d.promiseTime)
	// 汉印/芝柯：默认 useGapSense，完整吐到下一缝
	b.endPage()

	return b.build()
}

export function peiJunLabelCpcl(data, options) {
	return buildPeiJunLabel(data, options).cpcl
}
