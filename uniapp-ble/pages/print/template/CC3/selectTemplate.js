/**
 * 按 O097 / O098 / zoneId 选择 CC3 业务模板
 * 对齐 kpsapp newPrint.vue + Common.newPrint / doPrintTaskItem / printReceiptTask
 */
import { getLabelTemplate } from './labelTemplate.js'
import { getHYLabelTemplate } from './hyLabelTemplate.js'
import { getJCLabelTemplate } from './jcLabelTemplate.js'
import { getZoneIdLabelTemplate } from './zoneIdLabelTemplate.js'
import { getWaybillTemplate } from './waybillTemplate.js'
import { getMultiWaybillTemplate } from './multiWaybillTemplate.js'
import { buildPeiJunLabelTemplate } from './peiJunLabelTemplate.js'
import { buildPeijunTemplate } from './peiJunTemplate.js'
import { receiptTemplateJson, HYReceiptTemplate } from './receiptTemplate.js'

/**
 * 标签模板选择
 * O098=1 浩运；O098=2 配军；否则 zoneId=23 战区客制化，其它德坤普通标签
 * @param {Object} data appletWayBillCodeInfoVO + currentCopyCode / QRCode
 * @param {{ parameterO098?: string, zoneId?: string|number }} ctx
 */
export function resolveLabelTemplate(data, ctx = {}) {
	const parameterO098 = String(ctx.parameterO098 == null ? '0' : ctx.parameterO098)
	const zoneId = Number(ctx.zoneId || 0)

	if (parameterO098 === '1') {
		return getHYLabelTemplate(data)
	}
	if (parameterO098 === '2') {
		return buildPeiJunLabelTemplate(data)
	}
	if (zoneId === 23) {
		return getZoneIdLabelTemplate(data)
	}
	return getLabelTemplate(data)
}

/**
 * 运单模板选择（单份 CPCL 字符串）
 * - 多联：O097=2 且「托运客户联」→ 配军；其余联 → 多联模板
 * - 普通：zoneId=23 → 战区标签版式兼运单；否则普通运单
 * @param {Object} paramValue faceOrderReport.table1[0] 或 appletWayBillCodeInfoVO
 * @param {{ parameterO097?: string, multiType?: string, isMulti?: boolean, zoneId?: string|number }} ctx
 */
export function resolveWaybillTemplate(paramValue, ctx = {}) {
	const parameterO097 = String(ctx.parameterO097 == null ? '0' : ctx.parameterO097)
	const zoneId = Number(ctx.zoneId || 0)
	const isMulti = !!ctx.isMulti
	const multiType = ctx.multiType || ''

	if (isMulti) {
		if (parameterO097 === '2' && multiType === '托运客户联') {
			return buildPeijunTemplate(paramValue)
		}
		return getMultiWaybillTemplate(paramValue, multiType)
	}

	if (zoneId === 23) {
		return getZoneIdLabelTemplate(paramValue)
	}
	return getWaybillTemplate(paramValue)
}

/**
 * 回单模板选择
 * O097=2 → 配军；zoneId=23 → 德坤回单；否则浩运回单
 * @param {Object} receiptRow receiptTask data[0]
 * @param {{ parameterO097?: string, zoneId?: string|number }} ctx
 */
export function resolveReceiptTemplate(receiptRow, ctx = {}) {
	const parameterO097 = String(ctx.parameterO097 == null ? '0' : ctx.parameterO097)
	const zoneId = Number(ctx.zoneId || 0)

	if (parameterO097 === '2') {
		return buildPeijunTemplate(receiptRow)
	}
	if (zoneId === 23) {
		return receiptTemplateJson(receiptRow)
	}
	return HYReceiptTemplate(receiptRow)
}

export {
	getLabelTemplate,
	getHYLabelTemplate,
	getJCLabelTemplate,
	getZoneIdLabelTemplate,
	getWaybillTemplate,
	getMultiWaybillTemplate,
	buildPeiJunLabelTemplate,
	buildPeijunTemplate,
	receiptTemplateJson,
	HYReceiptTemplate,
}
