/**
 * 汉印 — CPCL 配军标签模板
 * 布局对齐 CC3/peiJunLabelTemplate（Archer buildTemplate6），指令走 PrinterCpcl
 */
import { LOGO_EG_DATA } from './logo.js'
import {
	buildCpcl,
	page,
	raw,
	logoEg,
	b128,
	vb128,
	box,
	setMag,
	setBold,
	text,
	qr,
	line,
	formPrint,
} from './cpclHelper.js'

export { mapBizToPeiJunLabel } from '../CC3/peiJunLabelTemplate.js'
import { mapBizToPeiJunLabel } from '../CC3/peiJunLabelTemplate.js'

// ─── 文本工具 ───────────────────────────────────────────

function truncate(str, maxLen) {
	if (!str) return ''
	const s = String(str)
	if (s.length <= maxLen) return s
	return s.slice(0, Math.max(1, maxLen - 1)) + '…'
}

/** 按字符数换行，超出 maxLines 时末行截断 */
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

/** 输出多行 T 0 24 */
function textLines(P, x, startY, lineGap, lines) {
	lines.forEach((line, i) => {
		text(P, 0, 24, x, startY + i * lineGap, line)
	})
}

// ─── 布局常量（对齐 Archer template6 / CC3） ─────────────

const PAGE_W = 576
const Y_RECV_TOP = 360
const Y_SEND_TOP = 490
const Y_BOX_BOTTOM = 620
const PAGE_H = 780
const LINE_W = 3
const BODY_GAP = 28
const SMALL_GAP = 26

const peiJunLabelEmptyData = {
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
	customerCode: '客户单号：',
	footerOutlet: '',
	printDate: '',
	promiseTime: '兑现时间：',
}

/**
 * 业务数据直接生成配军标签 CPCL
 * @param {Object} biz 与 getJCLabelTemplate 相同的打印数据
 */
export function buildPeiJunLabelTemplate(biz = {}) {
	console.log('buildPeiJunLabelTemplate', biz)
	return peiJunLabelTemplateJson(mapBizToPeiJunLabel(biz))
}

/** @deprecated 兼容旧命名 */
export function getPeiJunLabelTemplate(data) {
	return buildPeiJunLabelTemplate(data)
}

/**
 * 构建配军标签 CPCL
 * @param {Object} params 已映射的打印字段
 */
export function peiJunLabelTemplateJson(params = {}) {
	const d = { ...peiJunLabelEmptyData, ...params }

	const destAreaLines = wrapText(d.destArea, 10, 3)
	const destOutletLines = wrapText(d.destOutlet, 10, 3)
	const receiverAddrLines = wrapText(d.receiverAddress, 10, 2)
	const senderAddrLines = wrapText(d.senderAddress, 10, 2)
	const deliveryLines = wrapText(d.deliveryType, 6, 3)
	const payTypeLines = wrapText(d.payType, 6, 2)
	const valueAddedLines = wrapText(d.valueAdded, 7, 3)
	const customerCodeLines = wrapText(d.customerCode, 12, 2)

	const orderNo = String(d.orderNo || '')
	const qrContent = d.qrcode

	return buildCpcl((P) => {
		page(P, PAGE_H)
		raw(P, `PAGE-WIDTH ${PAGE_W}`)
		logoEg(P, 8, 58, 10, 2, LOGO_EG_DATA)
		b128(P, 2, 1, 50, 82, 5, orderNo)
		setMag(P, 2, 2)
		setBold(P, 1)
		text(P, 3, 0, 182, 60, orderNo)
		setBold(P, 0)
		setMag(P, 1, 1)
		vb128(P, 2, 1, 50, 510, Y_BOX_BOTTOM, orderNo)
		box(P, 5, 100, 500, Y_BOX_BOTTOM, LINE_W)

		setMag(P, 2, 2)
		text(P, 0, 24, 20, 115, d.transportType)
		setBold(P, 1)
		text(P, 0, 24, 280, 115, d.transferHub)
		setBold(P, 0)
		setMag(P, 1, 1)

		let yDest = 175
		setBold(P, 1)
		textLines(P, 15, yDest, BODY_GAP, destAreaLines)
		yDest += destAreaLines.length * BODY_GAP
		const yOutlet = Math.max(yDest + 4, 220)
		textLines(P, 15, yOutlet, BODY_GAP, destOutletLines)
		setBold(P, 0)

		qr(P, 336, 169, 4, 4, qrContent)

		text(P, 0, 24, 20, 285, d.goodsName)
		text(P, 0, 24, 130, 285, d.goodsQty)
		text(P, 0, 24, 230, 285, d.packType)
		setMag(P, 1, 1)
		text(P, 0, 24, 20, 330, d.weightVolume)

		setMag(P, 2, 2)
		text(P, 0, 24, 15, 380, '收')
		setMag(P, 1, 1)
		let yRecv = 375
		text(P, 0, 24, 70, yRecv, d.receiverName)
		yRecv += BODY_GAP
		text(P, 0, 24, 70, yRecv, d.receiverPhone)
		yRecv += BODY_GAP
		textLines(P, 70, yRecv, BODY_GAP, receiverAddrLines)

		setBold(P, 1)
		setMag(P, 1, 1)
		let yDelivery = 375
		textLines(P, 340, yDelivery, SMALL_GAP, deliveryLines)
		yDelivery += deliveryLines.length * SMALL_GAP + 8
		textLines(P, 340, yDelivery, SMALL_GAP, payTypeLines)
		setBold(P, 0)

		const ySendLabel = Y_SEND_TOP + 20
		const ySendContent = Y_SEND_TOP + 15
		setMag(P, 2, 2)
		text(P, 0, 24, 15, ySendLabel, '寄')
		setMag(P, 1, 1)
		let ySend = ySendContent
		text(P, 0, 24, 70, ySend, d.senderName)
		ySend += BODY_GAP
		text(P, 0, 24, 70, ySend, d.senderPhone)
		ySend += BODY_GAP
		textLines(P, 70, ySend, BODY_GAP, senderAddrLines)

		textLines(P, 328, ySendContent, SMALL_GAP, valueAddedLines)
		const yCustomerCode = ySendContent + valueAddedLines.length * SMALL_GAP
		textLines(P, 328, yCustomerCode, SMALL_GAP, customerCodeLines)

		line(P, 5, 160, 500, 160, LINE_W)
		line(P, 5, 270, 325, 270, LINE_W)
		line(P, 5, 315, 325, 315, LINE_W)
		line(P, 325, 315, 500, 315, LINE_W)
		line(P, 5, Y_RECV_TOP, 500, Y_RECV_TOP, LINE_W)
		line(P, 5, Y_SEND_TOP, 500, Y_SEND_TOP, LINE_W)
		line(P, 250, 100, 250, 160, LINE_W)
		line(P, 325, 160, 325, 315, LINE_W)
		line(P, 320, Y_RECV_TOP, 320, Y_BOX_BOTTOM, LINE_W)

		const yFooter1 = Y_BOX_BOTTOM + 15
		const yFooter2 = Y_BOX_BOTTOM + 40
		text(P, 0, 24, 5, yFooter1, d.footerOutlet)
		text(P, 0, 24, 320, yFooter1, d.printDate)
		text(P, 0, 24, 5, yFooter2, d.promiseTime)
		raw(P, 'GAP-SENSE')
		formPrint(P)
	})
}
