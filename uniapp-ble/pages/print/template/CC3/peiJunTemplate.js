/** 芝柯 — 配军运单/回单（委托 template-comm，固定 brand=CC3） */
import {
	mapBizToPeijun,
	buildPeijunTemplate as buildCommon,
	peijunTemplateJson as jsonCommon,
} from '../../template-comm/template/peiJunTemplate.js'

export { mapBizToPeijun }

export function peijunTemplateJson(params, options = {}) {
	return jsonCommon(params, { ...options, brand: 'CC3' })
}

export function buildPeijunTemplate(biz, options = {}) {
	return buildCommon(biz, { ...options, brand: 'CC3' })
}
