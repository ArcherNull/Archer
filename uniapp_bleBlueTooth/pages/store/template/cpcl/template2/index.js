/**
 * CPCL 配军模板
 * 纸张：700×800（0.1mm 单位，即 70mm × 80mm）
 * DPI 203，约 8 dots/mm → PAGE-WIDTH 560，页高 640
 */

// ─── 文本工具 ───────────────────────────────────────────

/** 截断超长文本，末尾加省略号 */
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

/** 竖排文字：逐字输出 T 指令 */
function verticalText(font, x, startY, lineHeight, chars) {
	return chars.split('').map((ch, i) => `T ${font} ${x} ${startY + i * lineHeight} ${ch}`).join('\n')
}

/** 绘制加粗横线（双线叠加，与竖线视觉粗细一致） */
function hLine(x1, x2, y, lineW) {
	return [`L ${x1} ${y} ${x2} ${y} ${lineW}`, `L ${x1} ${y + 1} ${x2} ${y + 1} ${lineW}`].join('\n')
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

	// 两行：日期完整保留在第二行
	if (prefix.length <= maxLen) {
		return [prefix, dateStr]
	}

	const line1 = prefix.slice(0, maxLen)
	const prefixRemain = prefix.slice(maxLen)
	const line2Gap = prefixRemain ? '  ' : ''
	const line2MaxPrefix = maxLen - dateStr.length - line2Gap.length

	if (line2MaxPrefix >= 0) {
		const line2Prefix = prefixRemain.length > line2MaxPrefix
			? truncate(prefixRemain, line2MaxPrefix)
			: prefixRemain
		return [line1, `${line2Prefix}${line2Gap}${dateStr}`]
	}

	return [truncate(prefix, maxLen), dateStr]
}

// ─── 布局常量（70mm × 80mm @ 203dpi） ─────────────────

const DOTS_PER_MM = 8 // 203dpi ≈ 8 dots/mm
const PAGE_W = 70 * DOTS_PER_MM // 560
const PAGE_H = 80 * DOTS_PER_MM // 640
const M = 10 // 左右/下边距
const M_TOP = 2 * DOTS_PER_MM // 上边距参考（框顶由单号高度决定，避免与公司名重叠）
const LABEL_W = 48 // 左侧竖排标签列宽
const PICKUP_W = 84 // 自提列宽
const QR_U = 5 // 二维码模块大小（保持原先大小）
const QR_DISPLAY = 125 // U5 时约 125 dots 边长
const QR_PAD_X = 12 // 二维码与竖线间距
const QR_W = QR_PAD_X + QR_DISPLAY + 10 // 二维码列宽（贴合二维码，减少空白）

const FONT_BODY = 24 // 正文字号
const FONT_TITLE = 28 // 单号字号
const CHAR_W = 24 // 24 号汉字约宽
const TEXT_LINE_GAP = 30 // 换行行距
const CELL_PAD_Y = 14 // 单元格内上下留白
const VCHAR_GAP = 20 // 竖排字间距
const WRAP_CHARS = 26 // 收货人/货物等字段换行字符数
const DELIVERY_CHARS = 3 // 自提/配送方式每行 3 字换行

const xLeft = M
const xLabel = M + LABEL_W
const xPickup = PAGE_W - M - PICKUP_W // 自提列左边界
const xRight = PAGE_W - M
const xQR = PAGE_W - M - QR_W // 二维码列左边界
const xContent = xLabel + 6

// 单号在框上方，整体下移 5mm
const Y_SHIFT = 5 * DOTS_PER_MM
const yOrderNo = Math.max(2, M_TOP - FONT_TITLE) + Y_SHIFT
const yBoxTop = yOrderNo + FONT_TITLE + 4
const yBoxBottom = PAGE_H - 6

// 各行高度（按 80mm 纸高重新分配）
const ROW1_TOP_H = 70 // 公司名最多两行，高度减一行（原 100）
const ROW1_BOT_H = 80 // 联系人
const ROW1_H = ROW1_TOP_H + ROW1_BOT_H
const ROW2_H = 140 // 收货信息
const ROW3_H = 72 // 货物（两行）
const ROW4_H = 80 // 运费（费用合计+代收款，无中间横线）

const yRow1End = yBoxTop + ROW1_H
const yRow1Mid = yBoxTop + ROW1_TOP_H
const yRow2End = yRow1End + ROW2_H
const yRow2Mid = yRow1End + ROW2_H / 2
const yRow3End = yRow2End + ROW3_H
const yRow4End = yRow3End + ROW4_H
const ROW5_H = yBoxBottom - yRow4End

const LINE_W = 3 // 线宽
const HLINE_W = 3 // 横线线宽（双线叠加）

/** 竖排标签在指定行内垂直居中 */
function verticalLabelY(rowTop, rowH, charCount) {
	return Math.round(rowTop + (rowH - charCount * VCHAR_GAP) / 2)
}

// ─── 假数据（尽可能填充，用于测试换行/截断） ───────────

export const template2DummyData = {
	orderNo: 'DK435575-1',
	senderCompany: '浩运郑州名优汽配配件贸易有限责任公司',
	senderName: '张世豪',
	senderPhone: '13266895574',
	deliveryType: '自提自提自提自提自提',
	receiverCity: '安庆',
	receiverInfo: '张世豪VIP超级白金钻石客户 18888888888',
	goodsName: '配件配件配件',
	goodsQty: '10285件',
	packType: '纸箱纸箱纸箱',
	goodsDate: '2026-08-28',
	totalFee: '706.88',
	payType: '提付',
	collectAmount: '500',
	remark: '请轻拿轻放，易碎物品，送货前电话联系收货人确认地址，请轻拿轻放，易碎物品，送货前电话联系收货人确认地址',
	qrcode: 'DK435575-1123123',
}

// ─── 模板构建 ───────────────────────────────────────────

/**
 * 构建配军 CPCL 模板
 * @param {Object} data 打印数据，缺省字段使用假数据
 */
export function buildTemplate2(data = {}) {
	const d = { ...template2DummyData, ...data }

	// 按单元格像素宽度限制字符，防止跨入自提列 / 二维码列
	const companyMaxChars = maxCharsByWidth(xContent, xPickup, 8, CHAR_W)
	const remarkMaxChars = maxCharsByWidth(xContent, xQR, 8, CHAR_W)
	const contentMaxChars = maxCharsByWidth(xContent, xRight, 8, CHAR_W)

	// 公司名固定两行，宽度限制在自提列左边界之前
	const senderCompanyLines = wrapText(d.senderCompany, companyMaxChars, 2)
	const senderContact = truncate(`${d.senderName} ${d.senderPhone}`, companyMaxChars)
	const deliveryTypeLines = wrapText(d.deliveryType, DELIVERY_CHARS, 4)
	const receiverCity = truncate(d.receiverCity, 8)
	const receiverInfoLines = wrapText(d.receiverInfo, WRAP_CHARS, 2)
	const goodsLines = buildGoodsLines(d.goodsName, d.goodsQty, d.packType, d.goodsDate, WRAP_CHARS)
	const feeLine = truncate(`费用合计：${d.totalFee}`, Math.floor(contentMaxChars * 0.65))
	const payType = truncate(d.payType, 4)
	const collectLine = truncate(`代收款：${d.collectAmount}`, contentMaxChars)

	// 备注行数：限制在备注列宽度内，且不超出备注区高度
	const remarkMaxLines = Math.max(1, Math.floor((ROW5_H - CELL_PAD_Y * 2) / TEXT_LINE_GAP))
	const remarkLines = wrapText(d.remark, remarkMaxChars, remarkMaxLines)

	const lines = []

	// 页头
	lines.push(`! 0 200 200 ${PAGE_H} 1`)
	lines.push(`PAGE-WIDTH ${PAGE_W}`)

	// 单号（居中）
	lines.push('CENTER')
	lines.push('SETBOLD 1')
	lines.push(`T 0 ${FONT_TITLE} 0 ${yOrderNo} ${d.orderNo}`)
	lines.push('SETBOLD 0')
	lines.push('LEFT')

	// ── 外框 ──
	lines.push(`BOX ${xLeft} ${yBoxTop} ${xRight} ${yBoxBottom} ${LINE_W}`)

	// ── 主横线（加粗，与竖线同粗细） ──
	lines.push(hLine(xLeft, xRight, yRow1End, HLINE_W))
	lines.push(hLine(xLeft, xRight, yRow2End, HLINE_W))
	lines.push(hLine(xLeft, xRight, yRow3End, HLINE_W))
	lines.push(hLine(xLeft, xRight, yRow4End, HLINE_W))

	// ── 区内横线（运费区费用合计/代收款之间不画横线） ──
	lines.push(hLine(xLabel, xPickup, yRow1Mid, HLINE_W)) // 发货：公司/联系人
	lines.push(hLine(xLabel, xRight, yRow2Mid, HLINE_W)) // 收货：城市/收货人

	// ── 竖线 ──
	lines.push(`L ${xLabel} ${yBoxTop} ${xLabel} ${yBoxBottom} ${LINE_W}`)
	lines.push(`L ${xPickup} ${yBoxTop} ${xPickup} ${yRow1End} ${LINE_W}`)
	lines.push(`L ${xQR} ${yRow4End} ${xQR} ${yBoxBottom} ${LINE_W}`)

	// ── 发货信息 ──
	const row1LabelY = verticalLabelY(yBoxTop, ROW1_H, 4)
	lines.push(verticalText(`0 ${FONT_BODY}`, 24, row1LabelY, VCHAR_GAP, '发货信息'))
	// 公司名：固定占两行，内容区 xContent ~ xPickup
	lines.push('SETBOLD 1')
	const companyBaseY = yBoxTop + CELL_PAD_Y
	senderCompanyLines.forEach((line, i) => {
		lines.push(`T 0 ${FONT_BODY} ${xContent} ${companyBaseY + i * TEXT_LINE_GAP} ${line}`)
	})
	lines.push('SETBOLD 0')
	lines.push(`T 0 ${FONT_BODY} ${xContent} ${yRow1Mid + CELL_PAD_Y} ${senderContact}`)
	// 自提/配送方式：自提列内最多 4 行换行，垂直居中
	const pickupBaseY = yBoxTop + Math.round((ROW1_H - deliveryTypeLines.length * TEXT_LINE_GAP) / 2)
	deliveryTypeLines.forEach((line, i) => {
		lines.push(`T 0 ${FONT_BODY} ${xPickup + 8} ${pickupBaseY + i * TEXT_LINE_GAP} ${line}`)
	})

	// ── 收货信息 ──
	const row2LabelY = verticalLabelY(yRow1End, ROW2_H, 4)
	lines.push(verticalText(`0 ${FONT_BODY}`, 24, row2LabelY, VCHAR_GAP, '收货信息'))
	lines.push('SETBOLD 1')
	lines.push('SETMAG 2 2')
	lines.push(`T 0 ${FONT_BODY} ${xContent} ${yRow1End + CELL_PAD_Y} ${receiverCity}`)
	lines.push('SETMAG 1 1')
	lines.push('SETBOLD 0')
	const receiverInfoBaseY = yRow2Mid + CELL_PAD_Y
	receiverInfoLines.forEach((line, i) => {
		lines.push(`T 0 ${FONT_BODY} ${xContent} ${receiverInfoBaseY + i * TEXT_LINE_GAP} ${line}`)
	})

	// ── 货物（两行，26 字换行，日期不省略） ──
	const row3LabelY = verticalLabelY(yRow2End, ROW3_H, 2)
	lines.push(verticalText(`0 ${FONT_BODY}`, 24, row3LabelY, VCHAR_GAP, '货物'))
	const goodsBaseY = yRow2End + CELL_PAD_Y
	goodsLines.forEach((line, i) => {
		lines.push(`T 0 ${FONT_BODY} ${xContent} ${goodsBaseY + i * TEXT_LINE_GAP} ${line}`)
	})

	// ── 运费（费用合计、代收款同区，无分隔横线） ──
	const row4LabelY = verticalLabelY(yRow3End, ROW4_H, 2)
	lines.push(verticalText(`0 ${FONT_BODY}`, 28, row4LabelY, VCHAR_GAP, '运费'))
	const feeBaseY = yRow3End + CELL_PAD_Y
	lines.push(`T 0 ${FONT_BODY} ${xContent} ${feeBaseY} ${feeLine}`)
	lines.push(`T 0 ${FONT_BODY} ${xRight - 56} ${feeBaseY} ${payType}`)
	lines.push(`T 0 ${FONT_BODY} ${xContent} ${feeBaseY + TEXT_LINE_GAP} ${collectLine}`)

	// ── 开单备注（固定文案竖排于左侧单元格，动态内容上移） ──
	const row5LabelY = verticalLabelY(yRow4End, ROW5_H, 4)
	lines.push(verticalText(`0 ${FONT_BODY}`, 24, row5LabelY, VCHAR_GAP, '开单备注'))
	const remarkBaseY = yRow4End + CELL_PAD_Y
	remarkLines.forEach((line, i) => {
		lines.push(`T 0 ${FONT_BODY} ${xContent} ${remarkBaseY + i * TEXT_LINE_GAP} ${line}`)
	})

	// ── 二维码（U5 保持原大小，列宽贴合减少空白） ──
	const qrX = xQR + QR_PAD_X
	const qrY = yRow4End + Math.round((ROW5_H - QR_DISPLAY) / 2)
	lines.push(`B QR ${qrX} ${qrY} M 2 U ${QR_U}`)
	lines.push(`MA,${d.qrcode}`)
	lines.push('ENDQR')

	lines.push('GAP-SENSE')
	lines.push('FORM')
	lines.push('PRINT')

	return lines.join('\n') + '\n'
}

/** 预填充假数据的模板（直接用于打印测试） */
export const template2 = buildTemplate2()
