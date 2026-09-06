/**
 * 模板6（配军标签 - 动态生成）
 * 布局参考 template5，适配优博讯 K319（CPCL + GBK）
 */

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

/** 输出多行 T 指令 */
function textLines(x, startY, lineGap, lines, font = '0 24') {
	return lines.map((line, i) => `T ${font} ${x} ${startY + i * lineGap} ${line}`).join('\n')
}

/** 二维码内容：去掉空格，# → %23 */
function encodeQrContent(url) {
	if (!url) return ''
	return String(url).replace(/\s+/g, '').replace(/#/g, '%23')
}

// ─── 布局常量（对齐 template5） ─────────────────────────

const PAGE_W = 576
const PAGE_H = 760
const LINE_W = 3
const BODY_GAP = 28
const SMALL_GAP = 26

/** Logo EG（与 template5 相同） */
const LOGO_EG =
	'EG 8 58 10 2 0000000000000000000000000000000000000000000000000000003F00000000000000FFC0000000000001FFE0000000000003FFF0000000000007FFF800000000000FFFFC00000000001FFFFE00000000003FFFFF00000000007FFFFF8000000000FFFFFFC000000000FFF3FFC0000000007FE1FF80000000003FC0FF000000000C3F807F0C0000001C4F003C9E0000003F8600187F0000007F8000007F800000FFC00000FFC00001FFE00001FFE00003FFE00001FFF00007FFC00000FFF8000FFF8000007FFC000FFF0000003FFC001FFE0000001FFE001FFC0000000FFE001FF800000007FE001FF800000007FE001FFC0000000FFE001FFE0000001FFE000FFF0000003FFC000FFF8000007FFC0007FFC00000FFF80003FFE00001FFF00001FFE00001FFE00000FFC00000FFC000007F8000007F8000003F8600187F0000001E4F003C9E0000000C3F807F0C000000003FC0FF00000000007FE1FF8000000000FFF3FFC000000000FFFFFFC0000000007FFFFF80000000003FFFFF00000000001FFFFE00000000000FFFFC000000000007FFF8000000000003FFF0000000000001FFE0000000000000FFC00000000000003F00000000000000000000000000000000000000000000000000000000'

// ─── 假数据 ─────────────────────────────────────────────

export const template6DummyData = {
	orderNo: 'DK202603010001-1',
	transportType: '汽运',
	transferHub: '郑州中转',
	destArea: '长沙-雨花区',
	destOutlet: '长沙雨花网点',
	qrcode: 'http://tms.dekuncn.com:9011/#/home?customerCode=DK202603010001',
	goodsName: '汽车配件',
	goodsQty: '10件',
	packType: '纸箱',
	weightVolume: '125.5 KG / 2.3 F',
	receiverName: '李明',
	receiverPhone: '13800138000',
	receiverAddress: '湖南省长沙市雨花区万家丽中路88号汽配城A区15栋203室',
	deliveryType: '送货上门',
	payType: '提付',
	senderAddress: '紫光郑州名优汽配',
	senderName: '张三五',
	senderPhone: '13266895574',
	valueAdded: '增值服务：进仓装卸上楼',
	footerOutlet: '郑州中心网点',
	printDate: '2026-03-01',
	promiseTime: '兑现时间:2026-03-03 18:00',
}

// ─── 模板构建 ───────────────────────────────────────────

/**
 * 动态生成配军标签 CPCL
 * @param {Object} data 打印数据，缺省字段使用假数据
 * @returns {string} CPCL 指令字符串
 */
export function buildTemplate6(data = {}) {
	const d = { ...template6DummyData, ...data }
	const lines = []

	// 目的地区 / 网点：加粗，>10 字换行
	const destAreaLines = wrapText(d.destArea, 10, 3)
	const destOutletLines = wrapText(d.destOutlet, 10, 3)

	// 收件：姓名、电话分行；地址 >10 换行，最多两行
	const receiverAddrLines = wrapText(d.receiverAddress, 10, 2)

	// 寄件：姓名、电话分行；地址 >10 换行，最多两行
	const senderAddrLines = wrapText(d.senderAddress, 10, 2)

	// 送货方式 / 付款：小一号加粗，>6 换行
	const deliveryLines = wrapText(d.deliveryType, 6, 3)
	const payTypeLines = wrapText(d.payType, 6, 2)

	// 增值服务：>7 换行
	const valueAddedLines = wrapText(d.valueAdded, 7, 4)

	const orderNo = String(d.orderNo || '')
	const qrContent = encodeQrContent(d.qrcode)

	// ── 页头 ──
	lines.push(`! 0 200 200 ${PAGE_H} 1`)
	lines.push(`PAGE-WIDTH ${PAGE_W}`)
	lines.push(LOGO_EG)
	lines.push(`B 128 2 1 50 82 5 ${orderNo}`)
	lines.push('SETMAG 1 1')
	lines.push(`T 0 24 82 60 ${orderNo}`)
	lines.push(`VB 128 2 1 50 510 600 ${orderNo}`)
	lines.push(`BOX 5 100 500 600 ${LINE_W}`)

	// ── 运输方式 / 中转 ──
	lines.push('SETMAG 2 2')
	lines.push(`T 0 24 20 115 ${d.transportType}`)
	lines.push('SETBOLD 1')
	lines.push(`T 0 24 280 115 ${d.transferHub}`)
	lines.push('SETBOLD 0')
	lines.push('SETMAG 1 1')

	// ── 目的地区 / 网点（加粗，超 10 换行）──
	let yDest = 175
	lines.push('SETBOLD 1')
	lines.push(textLines(15, yDest, BODY_GAP, destAreaLines))
	yDest += destAreaLines.length * BODY_GAP
	// 网点与地区之间留一点间距
	const yOutlet = Math.max(yDest + 4, 220)
	lines.push(textLines(15, yOutlet, BODY_GAP, destOutletLines))
	lines.push('SETBOLD 0')

	// ── 二维码 ──
	lines.push('B QR 336 169 M 4 U 4')
	lines.push(`MA,${qrContent}`)
	lines.push('ENDQR')

	// ── 货物 ──
	lines.push(`T 0 24 20 285 ${d.goodsName}`)
	lines.push(`T 0 24 130 285 ${d.goodsQty}`)
	lines.push(`T 0 24 230 285 ${d.packType}`)
	lines.push('SETMAG 1 1')
	lines.push(`T 0 24 20 330 ${d.weightVolume}`)

	// ── 收件区：姓名 / 电话分行，地址最多两行 ──
	lines.push('SETMAG 2 2')
	lines.push('T 0 24 15 380 收')
	lines.push('SETMAG 1 1')
	let yRecv = 375
	lines.push(`T 0 24 70 ${yRecv} ${d.receiverName}`)
	yRecv += BODY_GAP
	lines.push(`T 0 24 70 ${yRecv} ${d.receiverPhone}`)
	yRecv += BODY_GAP
	lines.push(textLines(70, yRecv, BODY_GAP, receiverAddrLines))

	// ── 送货上门 / 提付：小一号加粗，超 6 换行 ──
	lines.push('SETBOLD 1')
	lines.push('SETMAG 1 1')
	let yDelivery = 375
	lines.push(textLines(340, yDelivery, SMALL_GAP, deliveryLines))
	yDelivery += deliveryLines.length * SMALL_GAP + 8
	lines.push(textLines(340, yDelivery, SMALL_GAP, payTypeLines))
	lines.push('SETBOLD 0')

	// ── 寄件区：地址最多两行，姓名 / 电话分行 ──
	lines.push('SETMAG 2 2')
	lines.push('T 0 24 15 510 寄')
	lines.push('SETMAG 1 1')
	let ySend = 505
	lines.push(textLines(70, ySend, BODY_GAP, senderAddrLines))
	ySend += senderAddrLines.length * BODY_GAP
	lines.push(`T 0 24 70 ${ySend} ${d.senderName}`)
	ySend += BODY_GAP
	lines.push(`T 0 24 70 ${ySend} ${d.senderPhone}`)

	// ── 增值服务：超 7 换行 ──
	lines.push(textLines(328, 500, SMALL_GAP, valueAddedLines))

	// ── 分隔线（加粗）──
	lines.push(`L 5 160 500 160 ${LINE_W}`)
	lines.push(`L 5 270 325 270 ${LINE_W}`)
	lines.push(`L 5 315 325 315 ${LINE_W}`)
	lines.push(`L 325 315 500 315 ${LINE_W}`)
	lines.push(`L 5 360 500 360 ${LINE_W}`)
	lines.push(`L 5 490 500 490 ${LINE_W}`)
	lines.push(`L 250 100 250 160 ${LINE_W}`)
	lines.push(`L 325 160 325 315 ${LINE_W}`)
	lines.push(`L 320 360 320 600 ${LINE_W}`)

	// ── 页脚 ──
	lines.push(`T 0 24 5 615 ${d.footerOutlet}`)
	lines.push(`T 0 24 320 615 ${d.printDate}`)
	lines.push(`T 0 24 5 655 ${d.promiseTime}`)
	lines.push('GAP-SENSE')
	lines.push('FORM')
	lines.push('PRINT')

	return lines.join('\n') + '\n'
}

/** 预填充假数据的模板（直接用于打印测试） */
export const template6 = buildTemplate6()
