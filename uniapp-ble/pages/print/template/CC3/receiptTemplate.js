/** 芝柯 — 回单（委托 template-comm，固定 brand=CC3） */
import {
	receiptTemplateJson as receiptCommon,
	HYReceiptTemplate as hyCommon,
} from '../../template-comm/template/receiptTemplate.js'

export function receiptTemplateJson(params, options = {}) {
	return receiptCommon(params, { ...options, brand: 'CC3' })
}

export function HYReceiptTemplate(params, options = {}) {
	return hyCommon(params, { ...options, brand: 'CC3' })
}
