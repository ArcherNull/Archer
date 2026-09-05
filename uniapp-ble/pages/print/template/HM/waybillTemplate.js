/** 汉印 — 普通运单（委托 template-comm） */
import { getWaybillTemplate as getCommon } from '../../template-comm/template/waybillTemplate.js'

export function getWaybillTemplate(wybillData) {
	return getCommon(wybillData, { brand: 'HM' })
}
