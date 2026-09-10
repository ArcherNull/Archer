/**
 * CPCL 配军运单/回单模板 — CC3 / 汉印共用（cpclBuilder）
 * 纸张基准：700×850（0.1mm，即 70mm × 85mm）
 * 汉印出纸依赖 page height，必须与物理纸高一致，避免下一张头印在上一张底
 * 经 createCpclBuilder 做字库/方言适配（汉印 TEXT 8 0，避免乱码）
 */

import { createCpclBuilder } from '../builder/cpclBuilder.js'
import { resolveBrand } from './_helpers.js'

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

/** 按像素宽度估算每行最大字符数 */
function maxCharsByWidth(startX, endX, pad, charW) {
	return Math.max(4, Math.floor((endX - startX - pad) / charW))
}

/** 货物两行展示，第二行保证 goodsDate 完整不省略 */
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

// ─── 布局常量（70mm × 85mm @ 203dpi） ─────────────────

const DOTS_PER_MM = 8
const PAGE_W = 70 * DOTS_PER_MM // 560
/** 物理纸高 85mm；汉印按此高度走纸，勿再按内容动态缩短 */
const PAGE_H = 85 * DOTS_PER_MM // 680
const M = 10
const M_TOP = 2 * DOTS_PER_MM
const LABEL_W = 48
const PICKUP_W = 84
/** 汉印底部预留约 2mm 空白 */
const BOTTOM_PAD = 2 * DOTS_PER_MM // 16
const BOX_BOTTOM_MARGIN = 8

const QR_U = 4
const QR_MODULES = 37
const QR_DISPLAY = QR_MODULES * QR_U // 148
const QR_CELL_PAD = 1 * DOTS_PER_MM
const QR_W = QR_DISPLAY + QR_CELL_PAD * 2 // 164

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
const LINE_W = 3
const HLINE_W = 3

function isHmBrand(brand) {
	const b = String(brand || '').toUpperCase()
	return b === 'HM' || b === 'HPRT'
}

function resolveBoxBottom(brand) {
	const pad = isHmBrand(brand) ? BOTTOM_PAD : BOX_BOTTOM_MARGIN
	return Math.min(yRow4End + ROW5_H, PAGE_H - pad)
}

function verticalLabelY(rowTop, rowH, charCount) {
	return Math.round(rowTop + (rowH - charCount * VCHAR_GAP) / 2)
}

/** 竖排文字：逐字输出（经 builder 做汉印字库映射） */
function verticalText(b, font, size, x, startY, lineHeight, chars) {
	String(chars || '')
		.split('')
		.forEach(function (ch, i) {
			b.text(font, size, x, startY + i * lineHeight, ch)
		})
}

/** 加粗横线（双线叠加） */
function hLine(b, x1, x2, y, lineW) {
	b.line(x1, y, x2, y, lineW)
	b.line(x1, y + 1, x2, y + 1, lineW)
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
	deliveryFee: '',
	remark: '',
	qrcode: '',
}

/**
 * 业务数据（多联面单 / 回单接口）拼装为配军模板字段
 */
export function mapBizToPeijun(biz = {}) {
	const qty = biz?.件数 || ''
	const qtyText = qty
		? String(qty).includes('件')
			? String(qty)
			: `${qty}件`
		: ''

	const orderNo = biz?.运单号 || ''
	const qrcode = orderNo
		? `http://tms.dekuncn.com:9011/#/home?customerCode=${orderNo}`
		: ''

	return {
		orderNo,
		senderCompany: biz?.开单网点简称 || biz?.开单网点 || biz?.发货单位 || '',
		senderName: biz?.发货人 || '',
		senderPhone: biz?.发货人电话 || biz?.发货人手机号 || '',
		deliveryType: [biz?.回单要求, biz?.交货方式 || biz?.提货方式]
			.filter(Boolean)
			.join(' '),
		receiverCity: biz?.路由目的地 || '',
		receiverInfo: [biz?.收货人, biz?.收货人电话 || biz?.收货人手机号, biz?.收货地址]
			.filter(Boolean)
			.join(' '),
		goodsName: biz?.货名 || biz?.品名 || '',
		goodsQty: qtyText,
		packType: biz?.包装 || '',
		goodsDate: biz?.开单日期 || biz?.日期 || '',
		totalFee: biz?.合计应收 || biz?.费用合计 || '',
		payType: biz?.付款方式 || '',
		collectAmount: biz?.代收 || biz?.代收款 || '',
		deliveryFee: biz?.送货费 || '',
		remark: biz?.备注 || biz?.开单备注 || '',
		qrcode,
	}
}

/**
 * 已映射字段 → CPCL（返回 { cpcl, ops, brand }）
 * @param {Object} data
 * @param {{ brand?: string }} options
 */
export function buildPeijun(data = {}, options = {}) {
	const d = Object.assign({}, peijunEmptyData, data || {})
	const brand = resolveBrand(options)
	const b = createCpclBuilder({ brand: brand })
	const yBoxBottom = resolveBoxBottom(brand)

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
	const collectLine = truncate(`代收款：${d.collectAmount}`, Math.floor(contentMaxChars * 0.55))
	const deliveryFeeLine = truncate(`送货费：${d.deliveryFee}`, Math.floor(contentMaxChars * 0.4))

	const remarkMaxLines = Math.max(1, Math.floor((ROW5_H - CELL_PAD_Y * 2) / TEXT_LINE_GAP))
	const remarkLines = wrapText(d.remark, remarkMaxChars, remarkMaxLines)

	b.page(PAGE_H, 1)
	b.pageWidth(PAGE_W)

	// 单号（居中）
	b.align('CENTER')
	b.setBold(1)
	b.text(0, FONT_TITLE, 0, yOrderNo, d.orderNo)
	b.setBold(0)
	b.align('LEFT')

	b.box(xLeft, yBoxTop, xRight, yBoxBottom, LINE_W)

	hLine(b, xLeft, xRight, yRow1End, HLINE_W)
	hLine(b, xLeft, xRight, yRow2End, HLINE_W)
	hLine(b, xLeft, xRight, yRow3End, HLINE_W)
	hLine(b, xLeft, xRight, yRow4End, HLINE_W)
	hLine(b, xLabel, xPickup, yRow1Mid, HLINE_W)
	hLine(b, xLabel, xRight, yRow2Mid, HLINE_W)

	b.line(xLabel, yBoxTop, xLabel, yBoxBottom, LINE_W)
	b.line(xPickup, yBoxTop, xPickup, yRow1End, LINE_W)
	b.line(xQR, yRow4End, xQR, yBoxBottom, LINE_W)

	// 发货信息
	verticalText(
		b,
		0,
		FONT_BODY,
		24,
		verticalLabelY(yBoxTop, ROW1_H, 4),
		VCHAR_GAP,
		'发货信息'
	)
	b.setBold(1)
	const companyBaseY = yBoxTop + CELL_PAD_Y
	senderCompanyLines.forEach(function (line, i) {
		b.text(0, FONT_BODY, xContent, companyBaseY + i * TEXT_LINE_GAP, line)
	})
	b.setBold(0)
	b.text(0, FONT_BODY, xContent, yRow1Mid + CELL_PAD_Y, senderContact)

	const pickupBaseY =
		yBoxTop + Math.round((ROW1_H - deliveryTypeLines.length * TEXT_LINE_GAP) / 2)
	deliveryTypeLines.forEach(function (line, i) {
		b.text(0, FONT_BODY, xPickup + 8, pickupBaseY + i * TEXT_LINE_GAP, line)
	})

	// 收货信息
	verticalText(
		b,
		0,
		FONT_BODY,
		24,
		verticalLabelY(yRow1End, ROW2_H, 4),
		VCHAR_GAP,
		'收货信息'
	)
	b.setBold(1)
	b.setMag(2, 2)
	b.text(0, FONT_BODY, xContent, yRow1End + CELL_PAD_Y, receiverCity)
	b.setMag(1, 1)
	b.setBold(0)
	const receiverInfoBaseY = yRow2Mid + CELL_PAD_Y
	receiverInfoLines.forEach(function (line, i) {
		b.text(0, FONT_BODY, xContent, receiverInfoBaseY + i * TEXT_LINE_GAP, line)
	})

	// 货物
	verticalText(
		b,
		0,
		FONT_BODY,
		24,
		verticalLabelY(yRow2End, ROW3_H, 2),
		VCHAR_GAP,
		'货物'
	)
	const goodsBaseY = yRow2End + CELL_PAD_Y
	goodsLines.forEach(function (line, i) {
		b.text(0, FONT_BODY, xContent, goodsBaseY + i * TEXT_LINE_GAP, line)
	})

	// 运费
	verticalText(
		b,
		0,
		FONT_BODY,
		28,
		verticalLabelY(yRow3End, ROW4_H, 2),
		VCHAR_GAP,
		'运费'
	)
	const feeBaseY = yRow3End + CELL_PAD_Y
	b.text(0, FONT_BODY, xContent, feeBaseY, feeLine)
	b.text(0, FONT_BODY, xRight - 56, feeBaseY, payType)
	b.text(0, FONT_BODY, xContent, feeBaseY + TEXT_LINE_GAP, collectLine)
	b.text(0, FONT_BODY, xRight - 160, feeBaseY + TEXT_LINE_GAP, deliveryFeeLine)

	// 开单备注
	verticalText(
		b,
		0,
		FONT_BODY,
		24,
		verticalLabelY(yRow4End, ROW5_H, 4),
		VCHAR_GAP,
		'开单备注'
	)
	const remarkBaseY = yRow4End + CELL_PAD_Y
	remarkLines.forEach(function (line, i) {
		b.text(0, FONT_BODY, xContent, remarkBaseY + i * TEXT_LINE_GAP, line)
	})

	// 二维码（M2 U4；四周 1mm）
	b.qr(xQR + QR_CELL_PAD, yRow4End + QR_CELL_PAD, 2, QR_U, d.qrcode)

	// 底横线放在二维码之后重绘
	hLine(b, xLeft, xRight, yBoxBottom, HLINE_W)

	// 芝柯 / 汉印：默认 useGapSense，完整吐到下一缝
	b.endPage()

	return b.build()
}

/**
 * 已映射字段 → CPCL 字符串
 * @param {Object} params
 * @param {{ brand?: string }} options
 */
export function peijunTemplateJson(params = {}, options = {}) {
	return buildPeijun(params, options).cpcl
}

/**
 * 业务数据直接生成配军 CPCL 字符串
 * @param {Object} biz
 * @param {{ brand?: string }} options
 */
export function buildPeijunTemplate(biz = {}, options = {}) {
	return peijunTemplateJson(mapBizToPeijun(biz), options)
}
