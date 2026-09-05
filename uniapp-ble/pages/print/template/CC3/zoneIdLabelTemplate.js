/** 芝柯 — 战区标签（委托 template-comm） */
import { getZoneIdLabelTemplate as getCommon } from '../../template-comm/template/zoneIdLabelTemplate.js'

export function getZoneIdLabelTemplate(data) {
	return getCommon(data, { brand: 'CC3' })
}
