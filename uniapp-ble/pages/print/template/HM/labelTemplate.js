/** 汉印 — 德坤普通标签（委托 template-comm） */
import { getLabelTemplate as getCommon } from '../../template-comm/template/labelTemplate.js'

export function getLabelTemplate(data) {
	return getCommon(data, { brand: 'HM' })
}
