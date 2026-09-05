/**
 * 业务打印模板总入口：按蓝牙打印机品牌分发
 * - CC3 / K319 → template/CC3（芝柯，字符串拼 CPCL）
 * - HM → template/HM（汉印，PrinterHelperCpcl 构建，对齐 sdk/HM/print.js）
 *
 * ctx.brand 优先；也可传 deviceName / deviceId，内部用 resolvePrinterBrandInfo 推断
 */
import { resolvePrinterBrandInfo } from '../ble/config.js'
import * as CC3 from './CC3/index.js'
import * as HM from './HM/index.js'

/**
 * @param {{ brand?: string, deviceName?: string, deviceId?: string }} ctx
 * @returns {'CC3'|'HM'}
 */
export function resolveTemplateBrand(ctx = {}) {
	const explicit = String(ctx.brand || '').trim().toUpperCase()
	if (explicit === 'HM' || explicit === 'HPRT') return 'HM'
	if (explicit === 'CC3' || explicit === 'K319') return 'CC3'

	const info = resolvePrinterBrandInfo(ctx.deviceName || '', ctx.deviceId || '')
	if (info && info.brand === 'HM') return 'HM'
	if (info && info.brand === 'CC3') return 'CC3'
	// 默认芝柯（历史业务主路径）
	return 'CC3'
}

function pickBrandApi(ctx) {
	return resolveTemplateBrand(ctx) === 'HM' ? HM : CC3
}

/**
 * 标签模板
 * @param {Object} data
 * @param {{ parameterO098?: string, zoneId?: string|number, brand?: string, deviceName?: string, deviceId?: string }} ctx
 */
export function resolveLabelTemplate(data, ctx = {}) {
	return pickBrandApi(ctx).resolveLabelTemplate(data, ctx)
}

/**
 * 运单模板
 * @param {Object} paramValue
 * @param {{ parameterO097?: string, multiType?: string, isMulti?: boolean, zoneId?: string|number, brand?: string, deviceName?: string, deviceId?: string }} ctx
 */
export function resolveWaybillTemplate(paramValue, ctx = {}) {
	return pickBrandApi(ctx).resolveWaybillTemplate(paramValue, ctx)
}

/**
 * 回单模板
 * @param {Object} receiptRow
 * @param {{ parameterO097?: string, zoneId?: string|number, brand?: string, deviceName?: string, deviceId?: string }} ctx
 */
export function resolveReceiptTemplate(receiptRow, ctx = {}) {
	return pickBrandApi(ctx).resolveReceiptTemplate(receiptRow, ctx)
}

export { CC3, HM }
