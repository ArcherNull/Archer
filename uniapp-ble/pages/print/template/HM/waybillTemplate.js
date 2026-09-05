/**
 * 汉印 — 普通运单模板（O097=0）
 * 布局对齐 CC3/waybillTemplate，指令走 PrinterCpcl
 * 注意：CC3 运单仅 PRINT、无 FORM
 */
import {
	buildCpcl,
	createGetVal,
	page,
	raw,
	box,
	text,
	setMag,
	setBold,
	line,
} from './cpclHelper.js'

export function getWaybillTemplate(wybillData) {
	const getVal = createGetVal(wybillData || {})
	return buildCpcl((P) => {
		page(P, 1100)
		raw(P, 'PAGE-WIDTH 760')
		box(P, 1, 60, 570, 1030, 1)
		setMag(P, 2, 2)
		text(P, 55, 0, 0, 6, `德坤 ${getVal('companyname')}`)
		setBold(P, 2)
		text(P, 3, 0, 70, 75, getVal('startStation'))
		setBold(P, 0)
		text(P, 3, 0, 272, 75, '至')
		setBold(P, 2)
		text(P, 3, 0, 364, 75, getVal('desitiantionSataion'))
		setBold(P, 0)

		text(P, 3, 0, 0, 122, '开单网点：')
		text(P, 3, 0, 121, 122, getVal('startPoint'))
		text(P, 3, 0, 330, 122, '电话：')
		text(P, 3, 0, 400, 122, getVal('startPointPhone'))

		text(P, 3, 0, 0, 168, '目的网点：')
		text(P, 3, 0, 121, 168, getVal('destinationPoint'))
		text(P, 3, 0, 330, 168, '电话：')
		text(P, 3, 0, 400, 168, getVal('destinationPhone'))

		text(P, 3, 0, 0, 214, '提货地址：')
		text(P, 3, 0, 121, 214, getVal('takeAddress'))

		text(P, 3, 0, 0, 260, '运输方式：')
		text(P, 3, 0, 121, 260, getVal('transportMode'))

		text(P, 3, 0, 220, 260, '运单号')
		setMag(P, 2, 2)
		text(P, 3, 0, 305, 246, getVal('code'))

		setMag(P, 1, 1)
		text(P, 3, 0, 12, 300, '收')
		text(P, 3, 0, 12, 346, '货')
		text(P, 3, 0, 12, 392, '方')

		text(P, 3, 0, 50, 444, '发货人：')
		text(P, 3, 0, 161, 444, getVal('shipMan'))
		text(P, 3, 0, 50, 490, '电话：')
		text(P, 3, 0, 130, 490, getVal('shipManPhone'))

		text(P, 3, 0, 12, 668, '费')
		text(P, 3, 0, 12, 714, '用')
		text(P, 3, 0, 12, 760, '信')
		text(P, 3, 0, 12, 806, '息')

		text(P, 3, 0, 50, 536, '品名：')
		text(P, 3, 0, 130, 536, getVal('itemNames'))
		text(P, 3, 0, 263, 536, '包装：')
		text(P, 3, 0, 343, 536, getVal('packUnits'))

		text(P, 3, 0, 50, 582, '重量：')
		text(P, 3, 0, 130, 582, getVal('weight'))
		text(P, 3, 0, 225, 582, '体积：')
		text(P, 3, 0, 305, 582, getVal('volume'))
		text(P, 3, 0, 400, 582, '件数：')
		text(P, 3, 0, 480, 582, getVal('quantity'))

		text(P, 3, 0, 50, 628, '运费：')
		text(P, 3, 0, 130, 628, getVal('receivedTransferFee'))

		text(P, 3, 0, 50, 674, '代收货款：')
		text(P, 3, 0, 171, 674, getVal('collectionGoodsFee'))
		text(P, 3, 0, 225, 674, '手续费：')
		text(P, 3, 0, 336, 674, getVal('collectionProceduresFee'))
		text(P, 3, 0, 400, 674, '其他费：')
		text(P, 3, 0, 511, 674, getVal('otherFee'))

		text(P, 3, 0, 50, 720, '折扣折让：')
		text(P, 3, 0, 171, 720, getVal('disCountFee'))
		text(P, 3, 0, 225, 720, '送货费：')
		text(P, 3, 0, 336, 720, getVal('deliveryFee'))
		text(P, 3, 0, 400, 720, '接货费：')
		text(P, 3, 0, 511, 720, getVal('pickUpFee'))

		text(P, 3, 0, 50, 766, '声明价值：')
		text(P, 3, 0, 171, 766, getVal('declareValue'))
		text(P, 3, 0, 225, 766, '保价费：')
		text(P, 3, 0, 336, 766, getVal('guaranteedFee'))
		text(P, 3, 0, 400, 766, '回单费：')
		text(P, 3, 0, 511, 766, getVal('receiptFee'))

		text(P, 3, 0, 50, 812, '装卸费：')
		text(P, 3, 0, 161, 812, getVal('loadingUnloadingFee'))
		text(P, 3, 0, 225, 812, '进仓费：')
		text(P, 3, 0, 336, 812, getVal('entryFee'))
		text(P, 3, 0, 400, 812, '上楼费：')
		text(P, 3, 0, 511, 812, getVal('upStairFee'))

		text(P, 3, 0, 50, 858, '付款方式：')
		text(P, 3, 0, 171, 858, `${getVal('paymentMethod')}${getVal('totalShipFee')}元`)

		text(P, 3, 0, 50, 904, '交接方式：')
		text(P, 3, 0, 171, 904, getVal('handoverMode'))

		text(P, 3, 0, 263, 904, '回单要求：')
		text(P, 3, 0, 384, 904, `${getVal('receiptRequirement')}${getVal('receiptQty')}`)

		text(P, 3, 0, 50, 950, '备注：')
		text(P, 3, 0, 130, 950, getVal('remarks'))

		text(P, 3, 0, 0, 996, '开单日期：')
		text(P, 3, 0, 121, 996, getVal('orderDate'))
		text(P, 3, 0, 360, 996, '制单人：')
		text(P, 3, 0, 471, 996, getVal('orderMan'))

		line(P, 0, 110, 570, 110, 1)
		line(P, 0, 156, 570, 156, 1)
		line(P, 0, 202, 570, 202, 1)
		line(P, 0, 248, 570, 248, 1)
		line(P, 0, 294, 570, 294, 1)

		line(P, 50, 386, 570, 386, 1)
		line(P, 0, 432, 570, 432, 1)

		line(P, 0, 524, 570, 524, 1)
		line(P, 50, 570, 570, 570, 1)
		line(P, 50, 616, 570, 616, 1)
		line(P, 50, 662, 570, 662, 1)
		line(P, 50, 708, 570, 708, 1)
		line(P, 50, 754, 570, 754, 1)
		line(P, 50, 800, 570, 800, 1)
		line(P, 50, 846, 570, 846, 1)
		line(P, 50, 892, 570, 892, 1)
		line(P, 50, 938, 570, 938, 1)
		line(P, 0, 984, 570, 984, 1)
		line(P, 0, 984, 570, 984, 1)

		line(P, 262, 60, 262, 110, 1)
		line(P, 314, 60, 314, 110, 1)
		line(P, 220, 248, 220, 294, 1)
		line(P, 50, 294, 50, 984, 1)

		P.Print()
	})
}
