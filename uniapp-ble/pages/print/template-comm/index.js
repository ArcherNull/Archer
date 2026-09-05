/**
 * @file template-comm/index.js
 * @desc CC3 / 汉印共用模板入口（cpclBuilder + 通用版式 + 预览 + mock）
 */

export {
	createCpclBuilder,
	normalizeTextFont,
	fitBarcode128,
	estimateCode128Width,
} from './builder/cpclBuilder.js'
export {
	COMMON_TEMPLATE_OPTIONS,
	buildCommonTemplate,
	getCommonTemplateCpcl,
	buildPeiJunLabel,
	buildSimpleLabel,
	getLabelTemplate,
	getHYLabelTemplate,
	getJCLabelTemplate,
	getZoneIdLabelTemplate,
	getWaybillTemplate,
	getMultiWaybillTemplate,
	buildPeiJunLabelTemplate,
	buildPeijunTemplate,
	receiptTemplateJson,
	HYReceiptTemplate,
	resolveLabelTemplate,
	resolveWaybillTemplate,
	resolveReceiptTemplate,
} from './template/index.js'
export { getMockByTemplateKey, MOCK_MAP } from './mock/index.js'
