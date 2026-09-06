/**
 * 芝柯 CC3 / 优博讯 K319 业务打印模板入口
 *
 * 标签：
 * - labelTemplate          德坤普通（O098=0）
 * - hyLabelTemplate        浩运（O098=1）
 * - jcLabelTemplate        军城旧版（保留）
 * - zoneIdLabelTemplate    深圳战区 zoneId=23
 * - peiJunLabelTemplate    配军（O098=2）
 *
 * 运单：
 * - waybillTemplate        普通运单（O097=0）
 * - multiWaybillTemplate   多联（O097=1 / O097=2 非托运）
 * - peiJunTemplate         配军运单（O097=2 托运客户联）
 *
 * 回单：
 * - receiptTemplate        德坤 / 浩运回单
 * - peiJunTemplate         O097=2 回单亦用配军
 *
 * 选择器：selectTemplate.resolveLabelTemplate / resolveWaybillTemplate / resolveReceiptTemplate
 */
export { LOGO_EG_DATA } from './logo.js'

export { getLabelTemplate } from './labelTemplate.js'
export { getHYLabelTemplate } from './hyLabelTemplate.js'
export { getJCLabelTemplate } from './jcLabelTemplate.js'
export { getZoneIdLabelTemplate } from './zoneIdLabelTemplate.js'
export { getWaybillTemplate } from './waybillTemplate.js'
export { getMultiWaybillTemplate } from './multiWaybillTemplate.js'
export {
	buildPeiJunLabelTemplate,
	mapBizToPeiJunLabel,
	peiJunLabelTemplateJson,
	getPeiJunLabelTemplate,
} from './peiJunLabelTemplate.js'
export {
	buildPeijunTemplate,
	mapBizToPeijun,
	peijunTemplateJson,
} from './peiJunTemplate.js'
export { receiptTemplateJson, HYReceiptTemplate } from './receiptTemplate.js'
export {
	resolveLabelTemplate,
	resolveWaybillTemplate,
	resolveReceiptTemplate,
} from './selectTemplate.js'
