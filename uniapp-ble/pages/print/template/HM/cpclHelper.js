/**
 * 汉印 CPCL 构建封装 — 对齐 sdk/HM/print.js 的 cpcl() 写法
 * 基于 PrinterHelperCpcl 单例，每次构建前必须 reset。
 */
import PrinterCpcl from '../../sdk/HM/PrinterHelperCpcl.js'

const EMPTY_VALS = [undefined, '', null]

/** 读取业务字段，空值归一为 '' */
export function getVal(json, field) {
	if (!field) return ''
	const val = json && json[field]
	return EMPTY_VALS.includes(val) ? '' : val
}

export function createGetVal(json) {
	return (field) => getVal(json, field)
}

/** 重置并执行构建，返回 CPCL 指令字符串（供 hexStringToBuff / GBK 写入） */
export function buildCpcl(builder) {
	PrinterCpcl.data = ''
	builder(PrinterCpcl)
	return PrinterCpcl.data
}

/** 追加原始指令行（GAP-SENSE 等无封装方法时使用） */
export function raw(P, line) {
	const s = String(line == null ? '' : line)
	if (!s) {
		P.data += '\r\n'
		return
	}
	P.data += s.endsWith('\r\n') ? s : s.replace(/\n/g, '\r\n') + (s.endsWith('\n') ? '' : '\r\n')
}

export function page(P, height, qty = '1') {
	P.PrintAreaSize('0', '200', '200', String(height), String(qty))
}

export function pageWidth(P, w) {
	P.PageWidth(String(w))
}

export function text(P, font, size, x, y, content) {
	P.Text(P.text, String(font), String(size), String(x), String(y), String(content == null ? '' : content))
}

/** 竖排 TEXT90 */
export function text90(P, font, size, x, y, content) {
	P.Text(P.text90, String(font), String(size), String(x), String(y), String(content == null ? '' : content))
}

/** VTEXT（芝柯竖排兼容写法） */
export function vtext(P, font, size, x, y, content) {
	P.Text('VTEXT', String(font), String(size), String(x), String(y), String(content == null ? '' : content))
}

/** VT 竖排简写 */
export function vt(P, font, size, x, y, content) {
	P.Text('VT', String(font), String(size), String(x), String(y), String(content == null ? '' : content))
}

export function setMag(P, w, h) {
	P.SetMag(String(w), String(h == null ? w : h))
}

export function setBold(P, n) {
	P.SetBold(String(n))
}

export function line(P, x1, y1, x2, y2, w = 1) {
	P.Line(String(x1), String(y1), String(x2), String(y2), String(w))
}

export function box(P, x1, y1, x2, y2, w = 1) {
	P.Box(String(x1), String(y1), String(x2), String(y2), String(w))
}

export function barcode128(P, width, ratio, height, x, y, data) {
	P.Barcode(P.barcode, '128', String(width), String(ratio), String(height), String(x), String(y), String(data || ''))
}

export function vbarcode128(P, width, ratio, height, x, y, data) {
	P.Barcode(P.vbarcode, '128', String(width), String(ratio), String(height), String(x), String(y), String(data || ''))
}

/** B 128 简写（部分机型） */
export function b128(P, width, ratio, height, x, y, data) {
	P.Barcode('B', '128', String(width), String(ratio), String(height), String(x), String(y), String(data || ''))
}

export function vb128(P, width, ratio, height, x, y, data) {
	P.Barcode('VB', '128', String(width), String(ratio), String(height), String(x), String(y), String(data || ''))
}

export function qr(P, x, y, m, u, data) {
	P.PrintQR(P.barcode, String(x), String(y), String(m), String(u), String(data || ''))
}

export function logoEg(P, byteW, height, x, y, egData) {
	P.PrintImg(String(byteW), String(height), String(x), String(y), String(egData || ''))
}

export function formPrint(P) {
	P.Form()
	P.Print()
}

export function alignLeft(P) {
	P.Align(P.left)
}

export function alignCenter(P) {
	P.Align(P.center)
}

export function alignRight(P) {
	P.Align(P.right)
}

export function prefeed(P, n = 10) {
	P.Prefeed(String(n))
}
