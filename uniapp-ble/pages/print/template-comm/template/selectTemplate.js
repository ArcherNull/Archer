/**
 * @file template-comm/template/selectTemplate.js
 * @desc 按 O097 / O098 / zoneId 选择通用业务模板
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

function brandOpts(ctx) {
	return { brand: (ctx && ctx.brand) || 'common' }
}

/**
 * 标签模板选择
 * O098=1 浩运；O098=2 配军；否则 zoneId=23 战区客制化，其它德坤普通标签
 */
export function resolveLabelTemplate(data, ctx = {}) {
	const parameterO098 = String(ctx.parameterO098 == null ? '0' : ctx.parameterO098)
	const zoneId = Number(ctx.zoneId || 0)
	const opts = brandOpts(ctx)

	if (parameterO098 === '1') return getHYLabelTemplate(data, opts)
	if (parameterO098 === '2') return buildPeiJunLabelTemplate(data, opts)
	if (zoneId === 23) return getZoneIdLabelTemplate(data, opts)
	return getLabelTemplate(data, opts)
}

/**
 * 运单模板选择（单份 CPCL 字符串）
 */
export function resolveWaybillTemplate(paramValue, ctx = {}) {
	const parameterO097 = String(ctx.parameterO097 == null ? '0' : ctx.parameterO097)
	const zoneId = Number(ctx.zoneId || 0)
	const isMulti = !!ctx.isMulti
	const multiType = ctx.multiType || ''
	const opts = brandOpts(ctx)

	if (isMulti) {
		if (parameterO097 === '2' && multiType === '托运客户联') {
			return buildPeijunTemplate(paramValue, opts)
		}
		return getMultiWaybillTemplate(paramValue, multiType, opts)
	}
	if (zoneId === 23) return getZoneIdLabelTemplate(paramValue, opts)
	return getWaybillTemplate(paramValue, opts)
}

/**
 * 回单模板选择
 * O097=2 → 配军；zoneId=23 → 德坤回单；否则浩运回单
 */
export function resolveReceiptTemplate(receiptRow, ctx = {}) {
	const parameterO097 = String(ctx.parameterO097 == null ? '0' : ctx.parameterO097)
	const zoneId = Number(ctx.zoneId || 0)
	const opts = brandOpts(ctx)

	if (parameterO097 === '2') return buildPeijunTemplate(receiptRow, opts)
	if (zoneId === 23) return receiptTemplateJson(receiptRow, opts)
	return HYReceiptTemplate(receiptRow, opts)
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
