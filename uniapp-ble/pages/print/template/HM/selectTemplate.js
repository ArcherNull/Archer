/**
 * 汉印业务模板选择器（委托 template-comm，固定 brand=HM）
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
	return resolveLabelCommon(data, { ...ctx, brand: 'HM' })
}

export function resolveWaybillTemplate(paramValue, ctx = {}) {
	return resolveWaybillCommon(paramValue, { ...ctx, brand: 'HM' })
}

export function resolveReceiptTemplate(receiptRow, ctx = {}) {
	return resolveReceiptCommon(receiptRow, { ...ctx, brand: 'HM' })
}
