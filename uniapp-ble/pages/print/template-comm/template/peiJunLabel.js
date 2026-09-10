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
const BARCODE_H = 50
const Y_BARCODE = TOP_PAD
const Y_ORDER_TEXT = Y_BARCODE + BARCODE_H + 4 // 70
const Y_BOX_TOP = 110

const Y_RECV_TOP = 380
const Y_SEND_TOP = 510
const LINE_W = 3
const BODY_GAP = 28
const SMALL_GAP = 26
/** 毫米 → dots（203dpi ≈ 8 dots/mm） */
const UP_04 = Math.round(0.4 * DOTS_PER_MM) // 3：条码下运单号
const UP_08 = Math.round(0.8 * DOTS_PER_MM) // 6
const UP_05 = Math.round(0.5 * DOTS_PER_MM) // 4
/** 二维码单元格左线右移 2mm（框宽缩小），二维码同步右移 2mm */
const QR_COL_SHIFT = Math.round(2 * DOTS_PER_MM) // 16
const QR_COL_X = 325 + QR_COL_SHIFT // 341
const QR_X = 336 + QR_COL_SHIFT // 352
const QR_UNIT = 4
const QR_SIZE = 37 * QR_UNIT // 148
const QR_EDGE_PAD = 2
/** 页脚相对底横线：紧贴横线下方 */
const FOOTER_GAP1 = 7
const FOOTER_GAP2 = 28
const FOOTER_TEXT_H = 24
/** 底框：为页脚让位（不再预留底部 2mm 空白） */
const Y_BOX_BOTTOM = PAGE_H - FOOTER_GAP2 - FOOTER_TEXT_H // 628

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
	/** 汉印/其它品牌统一底框，不再预留底部 2mm */
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

	// 页头：顶留 2mm → Logo / 条码 / 运单号（运单号上移 0.4mm）
	b.logoEg(LOGO_EG_BYTE_W, LOGO_EG_HEIGHT, 10, TOP_PAD, LOGO_EG_DATA)
	b.barcode128(2, 1, BARCODE_H, 82, Y_BARCODE, orderNo)
	b.setMag(2, 2)
	b.setBold(1)
	b.text(3, 0, 182, Y_ORDER_TEXT - UP_04, orderNo)
	b.setBold(0)
	b.setMag(1, 1)
	b.vbarcode128(2, 1, 50, 510, boxBottom, orderNo)
	b.box(5, Y_BOX_TOP, 500, boxBottom, LINE_W)

	// 品名行上移腾出的 0.8mm：收/寄分区线上移，空间落到寄件地址下方（底框不动）
	const yRecvTop = Y_RECV_TOP - UP_08
	const ySendTop = Y_SEND_TOP - UP_08

	const yTransport = Y_BOX_TOP + 15 - UP_08
	b.setMag(2, 2)
	b.text(0, 24, 20, yTransport, d.transportType)
	b.setBold(1)
	b.text(0, 24, 280, yTransport, d.transferHub)
	b.setBold(0)
	b.setMag(1, 1)

	const yLine1 = Y_BOX_TOP + 60
	let yDest = Y_BOX_TOP + 75 - UP_08
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
	const yOutlet = Math.max(yDest + 4, Y_BOX_TOP + 120 - UP_08)
	b.setBold(1)
	textLines(b, 15, yOutlet, BODY_GAP, destOutletLines)
	b.setBold(0)

	// 品名 / 件数 / 包装：整体上移 0.8mm
	const yGoods = Y_BOX_TOP + 185 - UP_08
	const yWeightLine = Y_BOX_TOP + 238 - UP_08
	const yWeight = Y_BOX_TOP + 248 - UP_08

	// 二维码：尺寸不变；单元格左线/二维码右移 2mm；贴底消除约 3mm 下空白
	const qrY = yWeightLine - QR_SIZE - QR_EDGE_PAD
	b.qr(QR_X, qrY, QR_UNIT, QR_UNIT, d.qrcode)

	b.text(0, 24, 15, yGoods + 10, truncate(d.goodsName, 6))
	b.setMag(2, 2)
	b.setBold(1)
	b.text(3, 0, 130, yGoods, truncate(d.goodsQty, 6))
	b.setBold(0)
	b.setMag(1, 1)
	b.text(0, 24, 270, yGoods + 10, truncate(d.packType, 4))
	b.text(0, 24, 20, yWeight, d.weightVolume)

	// 收件：姓名/电话/地址整体再上移 0.5mm
	b.setMag(2, 2)
	b.text(0, 24, 15, yRecvTop + 22 - UP_05, '收')
	b.setBold(1)
	b.text(3, 0, 70, yRecvTop + 12 - UP_05, truncate(d.receiverName, 6))
	b.setBold(0)
	b.setMag(1, 1)
	let yRecv = yRecvTop + 58 - UP_05
	b.text(0, 24, 70, yRecv, d.receiverPhone)
	yRecv += BODY_GAP
	textLines(b, 70, yRecv, BODY_GAP, receiverAddrLines)

	b.setBold(1)
	b.setMag(1, 1)
	let yDelivery = yRecvTop + 15
	textLines(b, 340, yDelivery, SMALL_GAP, deliveryLines)
	yDelivery += deliveryLines.length * SMALL_GAP + 8
	textLines(b, 340, yDelivery, SMALL_GAP, payTypeLines)
	b.setBold(0)

	// 寄件：内容整体上移 0.5mm；分区因品名行上移已抬高，地址下方多出空间
	const ySendLabel = ySendTop + 20 - UP_05
	const ySendContent = ySendTop + 15 - UP_05
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
	b.line(5, yGoods - 15, QR_COL_X, yGoods - 15, LINE_W)
	b.line(5, yWeightLine, QR_COL_X, yWeightLine, LINE_W)
	b.line(QR_COL_X, yWeightLine, 500, yWeightLine, LINE_W)
	b.line(5, yRecvTop, 500, yRecvTop, LINE_W)
	b.line(5, ySendTop, 500, ySendTop, LINE_W)
	b.line(250, Y_BOX_TOP, 250, yLine1, LINE_W)
	b.line(QR_COL_X, yLine1, QR_COL_X, yWeightLine, LINE_W)
	b.line(320, yRecvTop, 320, boxBottom, LINE_W)

	// 页脚：紧贴底横线
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
