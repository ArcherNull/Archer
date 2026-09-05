/** 汉印 — 军城旧标签（委托 template-comm） */
import { getJCLabelTemplate as getCommon } from '../../template-comm/template/jcLabelTemplate.js'

export function getJCLabelTemplate(data) {
	return getCommon(data, { brand: 'HM' })
}
