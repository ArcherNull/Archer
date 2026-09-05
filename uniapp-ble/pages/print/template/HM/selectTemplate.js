/**
 * 汉印业务模板选择器（O097 / O098 / zoneId）
 * 选择逻辑与 CC3/selectTemplate 一致，实现走 HM PrinterCpcl 模板
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
