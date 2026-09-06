/**
 * POST /systemParam/getListParamValue
 * body: ["O097","O098"]
 *
 * O097：0 普通运单；1 多联；2 多联且托运客户联/回单用配军模板
 * O098：0 德坤标签；1 浩运标签；2 配军标签
 */
export const listParamValueMock = [
	{
		id: null,
		createdTime: null,
		updateTime: null,
		creatorUnikey: null,
		creator: null,
		lastOperatorUnikey: null,
		lastOperator: null,
		beDelete: null,
		companyId: null,
		parameterDescribe: null,
		parameterType: 'O097',
		parameterValue: '1',
		webId: '5706',
		tradeOrganizationId: null,
	},
	{
		id: null,
		createdTime: null,
		updateTime: null,
		creatorUnikey: null,
		creator: null,
		lastOperatorUnikey: null,
		lastOperator: null,
		beDelete: null,
		companyId: null,
		parameterDescribe: null,
		parameterType: 'O098',
		parameterValue: '2',
		webId: '5706',
		tradeOrganizationId: null,
	},
]
