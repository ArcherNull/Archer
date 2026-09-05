/**
 * 芝柯业务模板选择器（委托 template-comm，固定 brand=CC3）
 */
import {
	resolveLabelTemplate as resolveLabelCommon,
	resolveWaybillTemplate as resolveWaybillCommon,
	resolveReceiptTemplate as resolveReceiptCommon,
} from '../../template-comm/template/selectTemplate.js'

export { getLabelTemplate } from './labelTemplate.js'
export { getHYLabelTemplate } from './hyLabelTemplate.js'
export { getJCLabelTemplate } from './jcLabelTemplate.js'
export { getZoneIdLabelTemplate } from './zoneIdLabelTemplate.js'
export { getWaybillTemplate } from './waybillTemplate.js'
export { getMultiWaybillTemplate } from './multiWaybillTemplate.js'
export { buildPeiJunLabelTemplate } from './peiJunLabelTemplate.js'
export { buildPeijunTemplate } from './peiJunTemplate.js'
export { receiptTemplateJson, HYReceiptTemplate } from './receiptTemplate.js'

export function resolveLabelTemplate(data, ctx = {}) {
	return resolveLabelCommon(data, { ...ctx, brand: 'CC3' })
}

export function resolveWaybillTemplate(paramValue, ctx = {}) {
	return resolveWaybillCommon(paramValue, { ...ctx, brand: 'CC3' })
}

export function resolveReceiptTemplate(receiptRow, ctx = {}) {
	return resolveReceiptCommon(receiptRow, { ...ctx, brand: 'CC3' })
}
