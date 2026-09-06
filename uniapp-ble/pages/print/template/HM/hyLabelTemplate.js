/** 汉印 — 浩运标签（委托 template-comm） */
import { getHYLabelTemplate as getCommon } from '../../template-comm/template/hyLabelTemplate.js'

export function getHYLabelTemplate(data) {
	return getCommon(data, { brand: 'HM' })
}
