/**
 * @file template-comm/template/index.js
 * @desc 通用模板注册表（调试页 / 业务可复用）
 */

import { buildPeiJunLabel, peiJunLabelCpcl } from './peiJunLabel.js'
import { buildSimpleLabel, simpleLabelCpcl } from './simpleLabel.js'
import { buildLabelTemplate, getLabelTemplate } from './labelTemplate.js'
import { buildHYLabelTemplate, getHYLabelTemplate } from './hyLabelTemplate.js'
import { buildJCLabelTemplate, getJCLabelTemplate } from './jcLabelTemplate.js'
import {
	buildZoneIdLabelTemplate,
	getZoneIdLabelTemplate,
} from './zoneIdLabelTemplate.js'
import {
	buildPeiJunLabelTemplate,
	mapBizToPeiJunLabel,
	peiJunLabelTemplateJson,
	getPeiJunLabelTemplate,
} from './peiJunLabelTemplate.js'
import { buildWaybillTemplate, getWaybillTemplate } from './waybillTemplate.js'
import {
	buildMultiWaybillTemplate,
	getMultiWaybillTemplate,
} from './multiWaybillTemplate.js'
import {
	buildPeijun,
	buildPeijunTemplate,
	mapBizToPeijun,
	peijunTemplateJson,
} from './peiJunTemplate.js'
import {
	buildReceiptTemplate,
	receiptTemplateJson,
	buildHYReceiptTemplate,
	HYReceiptTemplate,
} from './receiptTemplate.js'
import {
	resolveLabelTemplate,
	resolveWaybillTemplate,
	resolveReceiptTemplate,
} from './selectTemplate.js'

export const COMMON_TEMPLATE_OPTIONS = [
	{
		key: 'peiJunLabel',
		label: '配军标签（版式）',
		desc: '字段已映射的配军标签版式',
	},
	{
		key: 'simpleLabel',
		label: '简易标签',
		desc: '横版试打标签',
	},
	{
		key: 'labelTemplate',
		label: '德坤普通标签',
		desc: 'O098=0',
	},
	{
		key: 'hyLabelTemplate',
		label: '浩运标签',
		desc: 'O098=1',
	},
	{
		key: 'jcLabelTemplate',
		label: '军城旧标签',
		desc: '保留版式',
	},
	{
		key: 'zoneIdLabelTemplate',
		label: '战区标签',
		desc: 'zoneId=23',
	},
	{
		key: 'peiJunLabelTemplate',
		label: '配军标签（业务）',
		desc: 'O098=2，业务字段映射',
	},
	{
		key: 'waybillTemplate',
		label: '普通运单',
		desc: 'O097=0',
	},
	{
		key: 'multiWaybillTemplate',
		label: '多联运单',
		desc: '托运客户联试打',
	},
	{
		key: 'peiJunTemplate',
		label: '配军运单/回单',
		desc: 'O097=2',
	},
	{
		key: 'receiptTemplate',
		label: '德坤回单',
		desc: 'zoneId=23 回单',
	},
]

const builders = {
	peiJunLabel: buildPeiJunLabel,
	simpleLabel: buildSimpleLabel,
	labelTemplate: buildLabelTemplate,
	hyLabelTemplate: buildHYLabelTemplate,
	jcLabelTemplate: buildJCLabelTemplate,
	zoneIdLabelTemplate: buildZoneIdLabelTemplate,
	peiJunLabelTemplate: function (data, options) {
		return buildPeiJunLabel(mapBizToPeiJunLabel(data), options)
	},
	waybillTemplate: buildWaybillTemplate,
	multiWaybillTemplate: function (data, options) {
		const type = (options && options.multiType) || '托运客户联'
		return buildMultiWaybillTemplate(data, type, options)
	},
	peiJunTemplate: function (data, options) {
		return buildPeijun(mapBizToPeijun(data), options)
	},
	receiptTemplate: buildReceiptTemplate,
}

/**
 * 构建通用模板
 * @param {string} key
 * @param {Object} data
 * @param {{ brand?: string, multiType?: string }} options
 */
export function buildCommonTemplate(key, data, options = {}) {
	const fn = builders[key]
	if (!fn) return null
	return fn(data || {}, options)
}

export function getCommonTemplateCpcl(key, data, options = {}) {
	const built = buildCommonTemplate(key, data, options)
	return (built && built.cpcl) || ''
}

export {
	buildPeiJunLabel,
	peiJunLabelCpcl,
	buildSimpleLabel,
	simpleLabelCpcl,
	buildLabelTemplate,
	getLabelTemplate,
	buildHYLabelTemplate,
	getHYLabelTemplate,
	buildJCLabelTemplate,
	getJCLabelTemplate,
	buildZoneIdLabelTemplate,
	getZoneIdLabelTemplate,
	buildPeiJunLabelTemplate,
	mapBizToPeiJunLabel,
	peiJunLabelTemplateJson,
	getPeiJunLabelTemplate,
	buildWaybillTemplate,
	getWaybillTemplate,
	buildMultiWaybillTemplate,
	getMultiWaybillTemplate,
	buildPeijun,
	buildPeijunTemplate,
	mapBizToPeijun,
	peijunTemplateJson,
	buildReceiptTemplate,
	receiptTemplateJson,
	buildHYReceiptTemplate,
	HYReceiptTemplate,
	resolveLabelTemplate,
	resolveWaybillTemplate,
	resolveReceiptTemplate,
}
