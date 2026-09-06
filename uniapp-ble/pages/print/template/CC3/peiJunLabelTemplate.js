/** 芝柯 — 配军标签（委托 template-comm，固定 brand=CC3） */
import {
	mapBizToPeiJunLabel,
	peiJunLabelTemplateJson as jsonCommon,
	buildPeiJunLabelTemplate as buildCommon,
	getPeiJunLabelTemplate as getCommon,
} from '../../template-comm/template/peiJunLabelTemplate.js'

export { mapBizToPeiJunLabel }

export function peiJunLabelTemplateJson(params, options = {}) {
	return jsonCommon(params, { ...options, brand: 'CC3' })
}

export function buildPeiJunLabelTemplate(biz, options = {}) {
	return buildCommon(biz, { ...options, brand: 'CC3' })
}

export function getPeiJunLabelTemplate(data, options = {}) {
	return getCommon(data, { ...options, brand: 'CC3' })
}
