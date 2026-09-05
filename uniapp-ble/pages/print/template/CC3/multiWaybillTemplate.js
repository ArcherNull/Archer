/** 芝柯 — 多联运单（委托 template-comm） */
import { getMultiWaybillTemplate as getCommon } from '../../template-comm/template/multiWaybillTemplate.js'

export function getMultiWaybillTemplate(wybillData, type) {
	return getCommon(wybillData, type, { brand: 'CC3' })
}
