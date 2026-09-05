/**
 * @file template-comm/mock/index.js
 * @desc 通用模板 mock 注册表
 */

import peiJunLabelMock from './peiJunLabel.js'
import simpleLabelMock from './simpleLabel.js'
import labelTemplateMock from './labelTemplate.js'
import hyLabelTemplateMock from './hyLabelTemplate.js'
import jcLabelTemplateMock from './jcLabelTemplate.js'
import zoneIdLabelTemplateMock from './zoneIdLabelTemplate.js'
import peiJunLabelTemplateMock from './peiJunLabelTemplate.js'
import waybillTemplateMock from './waybillTemplate.js'
import multiWaybillTemplateMock from './multiWaybillTemplate.js'
import peiJunTemplateMock from './peiJunTemplate.js'
import receiptTemplateMock from './receiptTemplate.js'

export const MOCK_MAP = {
	peiJunLabel: peiJunLabelMock,
	simpleLabel: simpleLabelMock,
	labelTemplate: labelTemplateMock,
	hyLabelTemplate: hyLabelTemplateMock,
	jcLabelTemplate: jcLabelTemplateMock,
	zoneIdLabelTemplate: zoneIdLabelTemplateMock,
	peiJunLabelTemplate: peiJunLabelTemplateMock,
	waybillTemplate: waybillTemplateMock,
	multiWaybillTemplate: multiWaybillTemplateMock,
	peiJunTemplate: peiJunTemplateMock,
	receiptTemplate: receiptTemplateMock,
}

export function getMockByTemplateKey(key) {
	return MOCK_MAP[key] || null
}

export {
	peiJunLabelMock,
	simpleLabelMock,
	labelTemplateMock,
	hyLabelTemplateMock,
	jcLabelTemplateMock,
	zoneIdLabelTemplateMock,
	peiJunLabelTemplateMock,
	waybillTemplateMock,
	multiWaybillTemplateMock,
	peiJunTemplateMock,
	receiptTemplateMock,
}
