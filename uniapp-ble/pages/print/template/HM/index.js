/**
 * 汉印 HM-A300 / HM-A300L 业务打印模板入口
 * 指令构建对齐 sdk/HM/print.js → PrinterHelperCpcl
 *
 * 标签 / 运单 / 回单选择逻辑见 selectTemplate.js（与 CC3 一致）
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
