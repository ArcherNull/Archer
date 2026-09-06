/**
 * @file template-comm/template/waybillTemplate.js
 * @desc 普通运单（O097=0）— CC3 / 汉印共用
 * 注意：运单结尾仅 PRINT（无 FORM），与历史 CC3 一致
 */

import { createCpclBuilder } from '../builder/cpclBuilder.js'
import { createGetVal, resolveBrand } from './_helpers.js'

/**
 * @param {Object} wybillData
 * @param {{ brand?: string }} options
 */
export function buildWaybillTemplate(wybillData = {}, options = {}) {
	const getVal = createGetVal(wybillData)
	const b = createCpclBuilder({ brand: resolveBrand(options) })

	b.page(1100, 1)
	b.pageWidth(760)
	b.box(1, 60, 570, 1030, 1)
	b.setMag(2, 2)
	b.text(55, 0, 0, 6, `德坤 ${getVal('companyname')}`)
	// 始发/至/目的：上移，避免与 y=110 分隔线重叠（单元格 60–110）
	b.setBold(2)
	b.text(3, 0, 70, 66, getVal('startStation'))
	b.setBold(0)
	b.text(3, 0, 272, 66, '至')
	b.setBold(2)
	b.text(3, 0, 364, 66, getVal('desitiantionSataion'))
	b.setBold(0)

	// 开单网点～运单号：复位字号并加粗
	b.setMag(1, 1)
	b.setBold(1)
	b.text(3, 0, 0, 122, '开单网点：')
	b.text(3, 0, 121, 122, getVal('startPoint'))
	b.text(3, 0, 330, 122, '电话：')
	b.text(3, 0, 400, 122, getVal('startPointPhone'))

	b.text(3, 0, 0, 168, '目的网点：')
	b.text(3, 0, 121, 168, getVal('destinationPoint'))
	b.text(3, 0, 330, 168, '电话：')
	b.text(3, 0, 400, 168, getVal('destinationPhone'))

	b.text(3, 0, 0, 214, '提货地址：')
	b.text(3, 0, 121, 214, getVal('takeAddress'))

	b.text(3, 0, 0, 260, '运输方式：')
	b.text(3, 0, 121, 260, getVal('transportMode'))

	b.text(3, 0, 220, 260, '运单号')
	// 运单号值与文案同一基线
	b.text(3, 0, 305, 260, getVal('code'))
	b.setBold(0)

	b.text(3, 0, 12, 300, '收')
	b.text(3, 0, 12, 346, '货')
	b.text(3, 0, 12, 392, '方')

	b.text(3, 0, 50, 444, '发货人：')
	b.text(3, 0, 161, 444, getVal('shipMan'))
	b.text(3, 0, 50, 490, '电话：')
	b.text(3, 0, 130, 490, getVal('shipManPhone'))

	b.text(3, 0, 12, 668, '费')
	b.text(3, 0, 12, 714, '用')
	b.text(3, 0, 12, 760, '信')
	b.text(3, 0, 12, 806, '息')

	b.text(3, 0, 50, 536, '品名：')
	b.text(3, 0, 130, 536, getVal('itemNames'))
	b.text(3, 0, 263, 536, '包装：')
	b.text(3, 0, 343, 536, getVal('packUnits'))

	b.text(3, 0, 50, 582, '重量：')
	b.text(3, 0, 130, 582, getVal('weight'))
	b.text(3, 0, 225, 582, '体积：')
	b.text(3, 0, 305, 582, getVal('volume'))
	b.text(3, 0, 400, 582, '件数：')
	b.text(3, 0, 480, 582, getVal('quantity'))

	b.text(3, 0, 50, 628, '运费：')
	b.text(3, 0, 130, 628, getVal('receivedTransferFee'))

	b.text(3, 0, 50, 674, '代收货款：')
	b.text(3, 0, 171, 674, getVal('collectionGoodsFee'))
	b.text(3, 0, 225, 674, '手续费：')
	b.text(3, 0, 336, 674, getVal('collectionProceduresFee'))
	b.text(3, 0, 400, 674, '其他费：')
	b.text(3, 0, 511, 674, getVal('otherFee'))

	b.text(3, 0, 50, 720, '折扣折让：')
	b.text(3, 0, 171, 720, getVal('disCountFee'))
	b.text(3, 0, 225, 720, '送货费：')
	b.text(3, 0, 336, 720, getVal('deliveryFee'))
	b.text(3, 0, 400, 720, '接货费：')
	b.text(3, 0, 511, 720, getVal('pickUpFee'))

	b.text(3, 0, 50, 766, '声明价值：')
	b.text(3, 0, 171, 766, getVal('declareValue'))
	b.text(3, 0, 225, 766, '保价费：')
	b.text(3, 0, 336, 766, getVal('guaranteedFee'))
	b.text(3, 0, 400, 766, '回单费：')
	b.text(3, 0, 511, 766, getVal('receiptFee'))

	b.text(3, 0, 50, 812, '装卸费：')
	b.text(3, 0, 161, 812, getVal('loadingUnloadingFee'))
	b.text(3, 0, 225, 812, '进仓费：')
	b.text(3, 0, 336, 812, getVal('entryFee'))
	b.text(3, 0, 400, 812, '上楼费：')
	b.text(3, 0, 511, 812, getVal('upStairFee'))

	b.text(3, 0, 50, 858, '付款方式：')
	b.text(3, 0, 171, 858, `${getVal('paymentMethod')}${getVal('totalShipFee')}元`)

	b.text(3, 0, 50, 904, '交接方式：')
	b.text(3, 0, 171, 904, getVal('handoverMode'))

	b.text(3, 0, 263, 904, '回单要求：')
	b.text(3, 0, 384, 904, `${getVal('receiptRequirement')}${getVal('receiptQty')}`)

	b.text(3, 0, 50, 950, '备注：')
	b.text(3, 0, 130, 950, getVal('remarks'))

	b.text(3, 0, 0, 996, '开单日期：')
	b.text(3, 0, 121, 996, getVal('orderDate'))
	b.text(3, 0, 360, 996, '制单人：')
	b.text(3, 0, 471, 996, getVal('orderMan'))

	b.line(0, 110, 570, 110, 1)
	b.line(0, 156, 570, 156, 1)
	b.line(0, 202, 570, 202, 1)
	b.line(0, 248, 570, 248, 1)
	b.line(0, 294, 570, 294, 1)
	b.line(50, 386, 570, 386, 1)
	b.line(0, 432, 570, 432, 1)
	b.line(0, 524, 570, 524, 1)
	b.line(50, 570, 570, 570, 1)
	b.line(50, 616, 570, 616, 1)
	b.line(50, 662, 570, 662, 1)
	b.line(50, 708, 570, 708, 1)
	b.line(50, 754, 570, 754, 1)
	b.line(50, 800, 570, 800, 1)
	b.line(50, 846, 570, 846, 1)
	b.line(50, 892, 570, 892, 1)
	b.line(50, 938, 570, 938, 1)
	b.line(0, 984, 570, 984, 1)
	b.line(262, 60, 262, 110, 1)
	b.line(314, 60, 314, 110, 1)
	b.line(220, 248, 220, 294, 1)
	b.line(50, 294, 50, 984, 1)
	// 运单历史仅 PRINT
	b.print()
	return b.build()
}

export function getWaybillTemplate(wybillData, options) {
	return buildWaybillTemplate(wybillData, options).cpcl
}
