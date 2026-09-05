/**
 * 汉印 — CPCL 配军模板（托运客户联 / 回单 O097=2）
 * 布局对齐 CC3/peiJunTemplate（Archer buildTemplate2），指令走 PrinterCpcl
 */
import {
	buildCpcl,
	page,
	raw,
	alignCenter,
	alignLeft,
	setBold,
	setMag,
	text,
	box,
	line,
	qr,
	formPrint,
} from './cpclHelper.js'

export { mapBizToPeijun } from '../CC3/peiJunTemplate.js'
import { mapBizToPeijun } from '../CC3/peiJunTemplate.js'

// ─── 文本工具 ───────────────────────────────────────────

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

/** 竖排文字：逐字 TEXT */
function verticalText(P, font, size, x, startY, lineHeight, chars) {
	String(chars)
		.split('')
		.forEach((ch, i) => {
			text(P, font, size, x, startY + i * lineHeight, ch)
		})
}

/** 加粗横线（双线叠加） */
function hLine(P, x1, x2, y, lineW) {
	line(P, x1, y, x2, y, lineW)
	line(P, x1, y + 1, x2, y + 1, lineW)
}

function maxCharsByWidth(startX, endX, pad, charW) {
	return Math.max(4, Math.floor((endX - startX - pad) / charW))
}

function buildGoodsLines(goodsName, goodsQty, packType, goodsDate, maxLen = 26) {
	const dateStr = String(goodsDate || '')
	const prefix = `${goodsName}  ${goodsQty}  ${packType}`
	const dateSuffix = dateStr ? `  ${dateStr}` : ''
	const full = prefix + dateSuffix

	if (full.length <= maxLen) {
		return [full]
	}

	if (!dateStr) {
		return wrapText(full, maxLen, 2)
	}

	if (prefix.length <= maxLen) {
		return [prefix, dateStr]
	}

	const line1 = prefix.slice(0, maxLen)
	const prefixRemain = prefix.slice(maxLen)
	const line2Gap = prefixRemain ? '  ' : ''
	const line2MaxPrefix = maxLen - dateStr.length - line2Gap.length

	if (line2MaxPrefix >= 0) {
		const line2Prefix =
			prefixRemain.length > line2MaxPrefix
				? truncate(prefixRemain, line2MaxPrefix)
				: prefixRemain
		return [line1, `${line2Prefix}${line2Gap}${dateStr}`]
	}

	return [truncate(prefix, maxLen), dateStr]
}

// ─── 布局常量（70mm × 80mm @ 203dpi） ─────────────────

const DOTS_PER_MM = 8
const PAGE_W = 70 * DOTS_PER_MM
const M = 10
const M_TOP = 2 * DOTS_PER_MM
const LABEL_W = 48
const PICKUP_W = 84
const BOX_BOTTOM_MARGIN = 8

const QR_U = 4
const QR_MODULES = 37
const QR_DISPLAY = QR_MODULES * QR_U
const QR_CELL_PAD = 1 * DOTS_PER_MM
const QR_W = QR_DISPLAY + QR_CELL_PAD * 2

const FONT_BODY = 24
const FONT_TITLE = 28
const CHAR_W = 24
const TEXT_LINE_GAP = 30
const CELL_PAD_Y = 14
const VCHAR_GAP = 20
const WRAP_CHARS = 26
const DELIVERY_CHARS = 3

const xLeft = M
const xLabel = M + LABEL_W
const xPickup = PAGE_W - M - PICKUP_W
const xRight = PAGE_W - M
const xQR = PAGE_W - M - QR_W
const xContent = xLabel + 6

const Y_SHIFT = 5 * DOTS_PER_MM
const yOrderNo = Math.max(2, M_TOP - FONT_TITLE) + Y_SHIFT
const yBoxTop = yOrderNo + FONT_TITLE + 4

const ROW1_TOP_H = 66
const ROW1_BOT_H = 74
const ROW1_H = ROW1_TOP_H + ROW1_BOT_H
const ROW2_H = 128
const ROW3_H = 70
const ROW4_H = 74

const yRow1End = yBoxTop + ROW1_H
const yRow1Mid = yBoxTop + ROW1_TOP_H
const yRow2End = yRow1End + ROW2_H
const yRow2Mid = yRow1End + ROW2_H / 2
const yRow3End = yRow2End + ROW3_H
const yRow4End = yRow3End + ROW4_H

const ROW5_H = QR_DISPLAY + QR_CELL_PAD * 2
const yBoxBottom = yRow4End + ROW5_H
const PAGE_H = yBoxBottom + BOX_BOTTOM_MARGIN

const LINE_W = 3
const HLINE_W = 3

function verticalLabelY(rowTop, rowH, charCount) {
	return Math.round(rowTop + (rowH - charCount * VCHAR_GAP) / 2)
}

const peijunEmptyData = {
	orderNo: '',
	senderCompany: '',
	senderName: '',
	senderPhone: '',
	deliveryType: '',
	receiverCity: '',
	receiverInfo: '',
	goodsName: '',
	goodsQty: '',
	packType: '',
	goodsDate: '',
	totalFee: '',
	payType: '',
	collectAmount: '',
	remark: '',
	qrcode: '',
}

/**
 * 业务数据直接生成配军 CPCL
 * @param {Object} biz 多联面单 / 回单原始数据
 */
export function buildPeijunTemplate(biz = {}) {
	console.log('buildPeijunTemplate', biz)
	return peijunTemplateJson(mapBizToPeijun(biz))
}

/**
 * 构建配军 CPCL 模板（对应 Archer buildTemplate2）
 * @param {Object} params 已映射的打印字段
 */
export function peijunTemplateJson(params = {}) {
	console.log('配军模版接收', params)
	const d = { ...peijunEmptyData, ...params }

	const companyMaxChars = maxCharsByWidth(xContent, xPickup, 8, CHAR_W)
	const remarkMaxChars = maxCharsByWidth(xContent, xQR, 8, CHAR_W)
	const contentMaxChars = maxCharsByWidth(xContent, xRight, 8, CHAR_W)

	const senderCompanyLines = wrapText(d.senderCompany, companyMaxChars, 2)
	const senderContact = truncate(`${d.senderName} ${d.senderPhone}`, companyMaxChars)
	const deliveryTypeLines = wrapText(d.deliveryType, DELIVERY_CHARS, 4)
	const receiverCity = truncate(d.receiverCity, 8)
	const receiverInfoLines = wrapText(d.receiverInfo, WRAP_CHARS, 2)
	const goodsLines = buildGoodsLines(
		d.goodsName,
		d.goodsQty,
		d.packType,
		d.goodsDate,
		WRAP_CHARS
	)
	const feeLine = truncate(`费用合计：${d.totalFee}`, Math.floor(contentMaxChars * 0.65))
	const payType = truncate(d.payType, 4)
	const collectLine = truncate(`代收款：${d.collectAmount}`, contentMaxChars)

	const remarkMaxLines = Math.max(1, Math.floor((ROW5_H - CELL_PAD_Y * 2) / TEXT_LINE_GAP))
	const remarkLines = wrapText(d.remark, remarkMaxChars, remarkMaxLines)

	return buildCpcl((P) => {
		page(P, PAGE_H)
		raw(P, `PAGE-WIDTH ${PAGE_W}`)

		alignCenter(P)
		setBold(P, 1)
		text(P, 0, FONT_TITLE, 0, yOrderNo, d.orderNo)
		setBold(P, 0)
		alignLeft(P)

		box(P, xLeft, yBoxTop, xRight, yBoxBottom, LINE_W)

		hLine(P, xLeft, xRight, yRow1End, HLINE_W)
		hLine(P, xLeft, xRight, yRow2End, HLINE_W)
		hLine(P, xLeft, xRight, yRow3End, HLINE_W)
		hLine(P, xLeft, xRight, yRow4End, HLINE_W)

		hLine(P, xLabel, xPickup, yRow1Mid, HLINE_W)
		hLine(P, xLabel, xRight, yRow2Mid, HLINE_W)

		line(P, xLabel, yBoxTop, xLabel, yBoxBottom, LINE_W)
		line(P, xPickup, yBoxTop, xPickup, yRow1End, LINE_W)
		line(P, xQR, yRow4End, xQR, yBoxBottom, LINE_W)

		const row1LabelY = verticalLabelY(yBoxTop, ROW1_H, 4)
		verticalText(P, 0, FONT_BODY, 24, row1LabelY, VCHAR_GAP, '发货信息')
		setBold(P, 1)
		const companyBaseY = yBoxTop + CELL_PAD_Y
		senderCompanyLines.forEach((lineStr, i) => {
			text(P, 0, FONT_BODY, xContent, companyBaseY + i * TEXT_LINE_GAP, lineStr)
		})
		setBold(P, 0)
		text(P, 0, FONT_BODY, xContent, yRow1Mid + CELL_PAD_Y, senderContact)
		const pickupBaseY =
			yBoxTop + Math.round((ROW1_H - deliveryTypeLines.length * TEXT_LINE_GAP) / 2)
		deliveryTypeLines.forEach((lineStr, i) => {
			text(P, 0, FONT_BODY, xPickup + 8, pickupBaseY + i * TEXT_LINE_GAP, lineStr)
		})

		const row2LabelY = verticalLabelY(yRow1End, ROW2_H, 4)
		verticalText(P, 0, FONT_BODY, 24, row2LabelY, VCHAR_GAP, '收货信息')
		setBold(P, 1)
		setMag(P, 2, 2)
		text(P, 0, FONT_BODY, xContent, yRow1End + CELL_PAD_Y, receiverCity)
		setMag(P, 1, 1)
		setBold(P, 0)
		const receiverInfoBaseY = yRow2Mid + CELL_PAD_Y
		receiverInfoLines.forEach((lineStr, i) => {
			text(P, 0, FONT_BODY, xContent, receiverInfoBaseY + i * TEXT_LINE_GAP, lineStr)
		})

		const row3LabelY = verticalLabelY(yRow2End, ROW3_H, 2)
		verticalText(P, 0, FONT_BODY, 24, row3LabelY, VCHAR_GAP, '货物')
		const goodsBaseY = yRow2End + CELL_PAD_Y
		goodsLines.forEach((lineStr, i) => {
			text(P, 0, FONT_BODY, xContent, goodsBaseY + i * TEXT_LINE_GAP, lineStr)
		})

		const row4LabelY = verticalLabelY(yRow3End, ROW4_H, 2)
		verticalText(P, 0, FONT_BODY, 28, row4LabelY, VCHAR_GAP, '运费')
		const feeBaseY = yRow3End + CELL_PAD_Y
		text(P, 0, FONT_BODY, xContent, feeBaseY, feeLine)
		text(P, 0, FONT_BODY, xRight - 56, feeBaseY, payType)
		text(P, 0, FONT_BODY, xContent, feeBaseY + TEXT_LINE_GAP, collectLine)

		const row5LabelY = verticalLabelY(yRow4End, ROW5_H, 4)
		verticalText(P, 0, FONT_BODY, 24, row5LabelY, VCHAR_GAP, '开单备注')
		const remarkBaseY = yRow4End + CELL_PAD_Y
		remarkLines.forEach((lineStr, i) => {
			text(P, 0, FONT_BODY, xContent, remarkBaseY + i * TEXT_LINE_GAP, lineStr)
		})

		const qrX = xQR + QR_CELL_PAD
		const qrY = yRow4End + QR_CELL_PAD
		qr(P, qrX, qrY, 2, QR_U, d.qrcode)

		hLine(P, xLeft, xRight, yBoxBottom, HLINE_W)

		raw(P, 'GAP-SENSE')
		formPrint(P)
	})
}
