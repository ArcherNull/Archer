/** 普通运单模板（O097=0）来源：Common.getWaybillTemplate */

export function getWaybillTemplate(wybillData) {

		var json = wybillData

		const limitValList = [undefined, '', null]
		// 读取json中的值
		const getVal = (field) => {
			if (field) {
				const val = json[field]
				return limitValList.includes(val) ? '' : val
			} else {
				return ''
			}
		}

		var waybillTemplate = ''
		// 运单
		waybillTemplate += '! 0 200 200 1100 1\r\n'
		waybillTemplate += 'PAGE-WIDTH 760 \r\n'
		waybillTemplate += 'BOX 1 60 570 1030 1\r\n'
		waybillTemplate += 'SETMAG 2 2\r\n'
		waybillTemplate += `TEXT 55 0 0 6 德坤 ${getVal("companyname")}\r\n`
		waybillTemplate += 'SETBOLD 2\r\n'
		waybillTemplate += `TEXT 3 0 70 75 ${getVal("startStation")}\r\n`
		waybillTemplate += 'SETBOLD 0\r\n'
		waybillTemplate += 'TEXT 3 0 272 75 至\r\n'
		waybillTemplate += 'SETBOLD 2\r\n'
		waybillTemplate += `TEXT 3 0 364 75 ${getVal("desitiantionSataion")}\r\n`
		waybillTemplate += 'SETBOLD 0\r\n'

		waybillTemplate += 'TEXT 3 0 0 122 开单网点：\r\n'
		waybillTemplate += `TEXT 3 0 121 122 ${getVal("startPoint")}\r\n`
		waybillTemplate += 'TEXT 3 0 330 122 电话：\r\n'
		waybillTemplate += `TEXT 3 0 400 122 ${getVal("startPointPhone")}\r\n`

		waybillTemplate += 'TEXT 3 0 0 168 目的网点：\r\n'
		waybillTemplate += `TEXT 3 0 121 168 ${getVal("destinationPoint")}\r\n`
		waybillTemplate += 'TEXT 3 0 330 168 电话：\r\n'
		waybillTemplate += `TEXT 3 0 400 168 ${getVal("destinationPhone")}\r\n`

		waybillTemplate += 'TEXT 3 0 0 214 提货地址：\r\n'
		waybillTemplate += `TEXT 3 0 121 214 ${getVal("takeAddress")}\r\n`

		waybillTemplate += 'TEXT 3 0 0 260 运输方式：\r\n'
		waybillTemplate += `TEXT 3 0 121 260 ${getVal("transportMode")}\r\n`

		waybillTemplate += 'TEXT 3 0 220 260 运单号\r\n'
		waybillTemplate += 'SETMAG 2 2\r\n'
		waybillTemplate += `TEXT 3 0 305 246 ${getVal("code")}\r\n`

		waybillTemplate += 'SETMAG 1 1\r\n'
		waybillTemplate += 'TEXT 3 0 12 300 收\r\n'
		waybillTemplate += 'TEXT 3 0 12 346 货\r\n'
		waybillTemplate += 'TEXT 3 0 12 392 方\r\n'

		waybillTemplate += 'TEXT 3 0 50 444 发货人：\r\n'
		waybillTemplate += `TEXT 3 0 161 444 ${getVal("shipMan")}\r\n`
		waybillTemplate += 'TEXT 3 0 50 490 电话：\r\n'
		waybillTemplate += `TEXT 3 0 130 490 ${getVal("shipManPhone")}\r\n`

		waybillTemplate += 'TEXT 3 0 12 668 费\r\n'
		waybillTemplate += 'TEXT 3 0 12 714 用\r\n'
		waybillTemplate += 'TEXT 3 0 12 760 信\r\n'
		waybillTemplate += 'TEXT 3 0 12 806 息\r\n'

		waybillTemplate += 'TEXT 3 0 50 536 品名：\r\n'
		waybillTemplate += `TEXT 3 0 130 536 ${getVal("itemNames")}\r\n`
		waybillTemplate += 'TEXT 3 0 263 536 包装：\r\n'
		waybillTemplate += `TEXT 3 0 343 536 ${getVal("packUnits")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 582 重量：\r\n'
		waybillTemplate += `TEXT 3 0 130 582 ${getVal("weight")}\r\n`
		waybillTemplate += 'TEXT 3 0 225 582 体积：\r\n'
		waybillTemplate += `TEXT 3 0 305 582 ${getVal("volume")}\n`
		waybillTemplate += 'TEXT 3 0 400 582 件数：\r\n'
		waybillTemplate += `TEXT 3 0 480 582 ${getVal("quantity")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 628 运费：\r\n'
		waybillTemplate += `TEXT 3 0 130 628 ${getVal("receivedTransferFee")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 674 代收货款：\r\n'
		waybillTemplate += `TEXT 3 0 171 674 ${getVal("collectionGoodsFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 225 674 手续费：\r\n'
		waybillTemplate += `TEXT 3 0 336 674 ${getVal("collectionProceduresFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 400 674 其他费：\r\n'
		waybillTemplate += `TEXT 3 0 511 674 ${getVal("otherFee")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 720 折扣折让：\r\n'
		waybillTemplate += `TEXT 3 0 171 720 ${getVal("disCountFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 225 720 送货费：\r\n'
		waybillTemplate += `TEXT 3 0 336 720 ${getVal("deliveryFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 400 720 接货费：\r\n'
		waybillTemplate += `TEXT 3 0 511 720 ${getVal("pickUpFee")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 766 声明价值：\r\n'
		waybillTemplate += `TEXT 3 0 171 766 ${getVal("declareValue")}\r\n`
		waybillTemplate += 'TEXT 3 0 225 766 保价费：\r\n'
		waybillTemplate += `TEXT 3 0 336 766 ${getVal("guaranteedFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 400 766 回单费：\r\n'
		waybillTemplate += `TEXT 3 0 511 766 ${getVal("receiptFee")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 812 装卸费：\r\n'
		waybillTemplate += `TEXT 3 0 161 812 ${getVal("loadingUnloadingFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 225 812 进仓费：\r\n'
		waybillTemplate += `TEXT 3 0 336 812 ${getVal("entryFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 400 812 上楼费：\r\n'
		waybillTemplate += `TEXT 3 0 511 812 ${getVal("upStairFee")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 858 付款方式：\r\n'
		waybillTemplate += `TEXT 3 0 171 858 ${getVal("paymentMethod")}${getVal("totalShipFee")}元\r\n`

		waybillTemplate += 'TEXT 3 0 50 904 交接方式：\r\n'
		waybillTemplate += `TEXT 3 0 171 904 ${getVal("handoverMode")}\r\n`

		waybillTemplate += 'TEXT 3 0 263 904 回单要求：\r\n'
		waybillTemplate += `TEXT 3 0 384 904 ${getVal("receiptRequirement")}${getVal("receiptQty")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 950 备注：\r\n'
		waybillTemplate += `TEXT 3 0 130 950 ${getVal("remarks")}\r\n`

		waybillTemplate += 'TEXT 3 0 0 996 开单日期：\r\n'
		waybillTemplate += `TEXT 3 0 121 996 ${getVal("orderDate")}\r\n`
		waybillTemplate += 'TEXT 3 0 360 996 制单人：\r\n'
		waybillTemplate += `TEXT 3 0 471 996 ${getVal("orderMan")}\r\n`

		waybillTemplate += 'LINE 0 110 570 110 1\r\n'
		waybillTemplate += 'LINE 0 156 570 156 1\r\n'
		waybillTemplate += 'LINE 0 202 570 202 1\r\n'
		waybillTemplate += 'LINE 0 248 570 248 1\r\n'
		waybillTemplate += 'LINE 0 294 570 294 1\r\n'

		waybillTemplate += 'LINE 50 386 570 386 1\r\n'
		waybillTemplate += 'LINE 0 432 570 432 1\r\n'

		waybillTemplate += 'LINE 0 524 570 524 1\r\n'
		waybillTemplate += 'LINE 50 570 570 570 1\r\n'
		waybillTemplate += 'LINE 50 616 570 616 1\r\n'
		waybillTemplate += 'LINE 50 662 570 662 1\r\n'
		waybillTemplate += 'LINE 50 708 570 708 1\r\n'
		waybillTemplate += 'LINE 50 754 570 754 1\r\n'
		waybillTemplate += 'LINE 50 800 570 800 1\r\n'
		waybillTemplate += 'LINE 50 846 570 846 1\r\n'
		waybillTemplate += 'LINE 50 892 570 892 1\r\n'
		waybillTemplate += 'LINE 50 938 570 938 1\r\n'
		waybillTemplate += 'LINE 0 984 570 984 1\r\n'

		waybillTemplate += 'LINE 0 984 570 984 1\r\n'

		waybillTemplate += 'LINE 262 60 262 110 1\r\n'
		waybillTemplate += 'LINE 314 60 314 110 1\r\n'

		waybillTemplate += 'LINE 220 248 220  294 1\r\n'

		waybillTemplate += 'LINE 50 294 50  984 1\r\n'
		waybillTemplate += 'PRINT\r\n'
		return waybillTemplate
	
}
