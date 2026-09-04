/** 多联运单模板（O097=1 或 O097=2 非托运客户联）来源：Common.getMultiWaybillTemplate */

export function getMultiWaybillTemplate(wybillData, type) {

		var json = wybillData;
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
		waybillTemplate += '! 0 200 200 1200 1\r\n'
		waybillTemplate += 'PAGE-WIDTH 575\r\n'
		waybillTemplate += 'PREFEED 10\r\n'
		waybillTemplate += 'CENTER\r\n'
		waybillTemplate +=
			'EG 8 58 -235 20 0000000000000000000000000000000000000000000000000000003F00000000000000FFC0000000000001FFE0000000000003FFF0000000000007FFF800000000000FFFFC00000000001FFFFE00000000003FFFFF00000000007FFFFF8000000000FFFFFFC000000000FFF3FFC0000000007FE1FF80000000003FC0FF000000000C3F807F0C0000001C4F003C9E0000003F8600187F0000007F8000007F800000FFC00000FFC00001FFE00001FFE00003FFE00001FFF00007FFC00000FFF8000FFF8000007FFC000FFF0000003FFC001FFE0000001FFE001FFC0000000FFE001FF800000007FE001FF800000007FE001FFC0000000FFE001FFE0000001FFE000FFF0000003FFC000FFF8000007FFC0007FFC00000FFF80003FFE00001FFF00001FFE00001FFE00000FFC00000FFC000007F8000007F8000003F8600187F0000001E4F003C9E0000000C3F807F0C000000003FC0FF00000000007FE1FF8000000000FFF3FFC000000000FFFFFFC0000000007FFFFF80000000003FFFFF00000000001FFFFE00000000000FFFFC000000000007FFF8000000000003FFF0000000000001FFE0000000000000FFC00000000000003F00000000000000000000000000000000000000000000000000000000\r\n'
		waybillTemplate += 'SETBOLD 2\r\n'
		waybillTemplate += 'SETMAG 2 2\r\n'
		waybillTemplate += 'TEXT 3 0 0 10 德坤浩运\r\n'
		waybillTemplate += 'SETMAG 0 0\r\n'
		waybillTemplate += 'SETMAG 2\r\n'
		waybillTemplate += 'TEXT 7 0 0 60 DeKun LOGISTICS\r\n'
		waybillTemplate += 'SETMAG 0\r\n'
		waybillTemplate += 'SETBOLD 0\r\n'
		waybillTemplate += 'RIGHT\r\n'

		waybillTemplate += `TEXT 3 0 0 80 ${type}\r\n`
		waybillTemplate += `TEXT 55 0 470 145 第${getVal('打印次数')}次打印\r\n`
		waybillTemplate += `TEXT 3 0 0 205 电话：${getVal("发货人电话")}\r\n`
		waybillTemplate += `TEXT 3 0 0 235 电话：${getVal("收货人电话")}\r\n`
		waybillTemplate += `TEXT 3 0 0 305 件数：${getVal("件数")}\r\n`
		waybillTemplate += `TEXT 3 0 0 335 回单：${getVal("回单")}\r\n`
		waybillTemplate += `TEXT 3 0 0 365 体积：${getVal(type === "托运客户联" ? "体积" : "计费体积")}\r\n`
		waybillTemplate += `TEXT 3 0 0 435 合计应收：${getVal("合计应收")}\r\n`
		waybillTemplate += `TEXT 3 0 0 465 交货方式：${getVal("交货方式")}\r\n`
		if (type != "收货客户联") {
			waybillTemplate += 'TEXT 3 0 0 1060 扫一扫查单       \r\n'
		} else {
			waybillTemplate += 'TEXT 3 0 0 1135 扫一扫查单       \r\n'
		}

		waybillTemplate += 'LEFT\r\n'
		// waybillTemplate += `TEXT 3 0 0 110 ${getVal("开单网点简称")}--${getVal("路由二级地址")}/${getVal("路由目的地")}\r\n`
		// waybillTemplate += `TEXT 3 0 0 110 ${getVal("目的网点所属站点" || "")}--${getVal("路由目的地" || "")}\r\n`
		waybillTemplate += `TEXT 3 0 0 110 ${getVal("开单网点简称")}--${getVal("中转地")}/${getVal("路由目的地")}\r\n`
		waybillTemplate += `TEXT 3 0 0 140 运单号：${getVal("运单号")} \r\n`
		waybillTemplate += `TEXT 3 0 0 170 运单时间：${getVal("开单日期")}\r\n`
		waybillTemplate += `TEXT 3 0 0 205 发货人：${getVal("发货人")}\r\n`
		waybillTemplate += `TEXT 3 0 0 235 收货人：${getVal("收货人")}\r\n`
		waybillTemplate += `TEXT 3 0 0 265 地址：${getVal("收货地址")}\r\n`
		waybillTemplate += `TEXT 3 0 0 305 品名：${getVal("货名")}\r\n`
		waybillTemplate += `TEXT 3 0 0 335 包装：${getVal("包装")}\r\n`
		waybillTemplate += `TEXT 3 0 0 365 重量：${getVal(type === "托运客户联" ? "重量" : "计费重量")}Kg\r\n`
		waybillTemplate += `TEXT 3 0 0 405 ${getVal("付款运费")}\r\n`
		waybillTemplate += `TEXT 3 0 0 435 代收：${getVal("代收")}\r\n`
		waybillTemplate += `TEXT 3 0 0 465 付款方式：${getVal("付款方式")}\r\n`
		waybillTemplate += `TEXT 3 0 0 500 备注：${getVal("备注")}\r\n`

		waybillTemplate += 'TEXT 55 0 10 535 托运人注意事项\r\n'
		waybillTemplate += 'TEXT 55 0 10 555 1.托运人不得托运易燃、易爆、易渗漏、有毒等危险货物，不得托运国家法律\r\n'
		waybillTemplate += 'TEXT 55 0 10 575 法规禁止运输的货物；托运人不接收和运输上述货物，若为隐报、错报，由此\r\n'
		waybillTemplate += 'TEXT 55 0 10 595 产生的全部责任、损失、人身伤害或财产损失均由托运人或第三方造成。\r\n'
		waybillTemplate += 'TEXT 55 0 10 615 2.托运人应如实告知托运货物的品名和性质，不得匿报或瞒报，因托运货物为\r\n'
		waybillTemplate += 'TEXT 55 0 10 635 危险品品发生爆燃、自爆等其他严重后果，均由托运人承担和赔偿。\r\n'
		waybillTemplate += 'TEXT 55 0 10 655 3.本运单所有内容均为承运人根据托运人申报的信息填写，托运人应当如实申\r\n'
		waybillTemplate += 'TEXT 55 0 10 675 报货物信息并在收到运单后查验无误，并承认对运单内容有异议的，应当立即\r\n'
		waybillTemplate += 'TEXT 55 0 10 695 提出；托运人对运单；托运人未提出异议的，视为确认本运单无误。\r\n'
		waybillTemplate += 'TEXT 55 0 10 715 4.托运人可以选择保价或者不保价运输。托运人选择不保价运输的，发生货损\r\n'
		waybillTemplate += 'TEXT 55 0 10 735 货差承运人最高按照运费三倍金额赔偿。托运人选择保价运输的，应当按照货\r\n'
		waybillTemplate += 'TEXT 55 0 10 755 物实际价值向承运人声明并支付声明价值费，托运人声明价值不得超过货物实\r\n'
		waybillTemplate += 'TEXT 55 0 10 775 际价值。声明价值的货物发生货损货差的，实际损失金额低于声明价值的，承\r\n'
		waybillTemplate += 'TEXT 55 0 10 795 运人按照实际损失金额赔偿；实际损失金额高于声明价值的，承运人按照声明\r\n'
		waybillTemplate += 'TEXT 55 0 10 815 价值赔偿。\r\n'
		waybillTemplate += 'TEXT 55 0 10 835 5.托运人同意确认，承运人可以将其托运的货物与其他货物进行集装后自行或\r\n'
		waybillTemplate += 'TEXT 55 0 10 855 者转委托第三方进行运输，托运人对此没有任何异议。\r\n'
		if (type != "收货客户联") {
			waybillTemplate += `TEXT 3 0 10 885 打印操作员：${getVal("打印操作员")}\r\n`
			waybillTemplate += 'TEXT 3 0 10 915 查货电话：400-999-2089\r\n'
			waybillTemplate += 'TEXT 3 0 10 945 客服电话：400-999-2089\r\n'
			if (type == "记账联" || type == "存根联") {
				waybillTemplate += 'TEXT 3 0 10 975 货款电话：0371-53397802\r\n'
			} else {
				waybillTemplate += `TEXT 3 0 10 975 发站电话：${getVal("发站电话")}\r\n`
				waybillTemplate += `TEXT 3 0 10 1005 到站电话：${getVal("到站电话")}\r\n`
				waybillTemplate += 'TEXT 3 0 10 1035 货款电话：0371-53397802\r\n'
			}
			waybillTemplate += 'B QR 350 890 M 4 U 5\r\n'
			waybillTemplate += `MA, http://tms.dekuncn.com:9011/#/home?customerCode=${getVal("运单号")} \r\n`
			waybillTemplate += 'ENDQR\r\n'
			waybillTemplate += 'LINE 0 875 820 875 2\r\n'
		} else {
			waybillTemplate += 'TEXT 55 0 10 875 6.收货客户联签名必须为发货人指定的收货人，如果收货人是自然人，需要出\r\n'
			waybillTemplate += 'TEXT 55 0 10 895 示身份证；如果收货人是公司，收货人需要出示授权委托书及身份证\r\n'
			waybillTemplate += 'TEXT 3 0 10 915 收货人签名：\r\n'
			waybillTemplate += 'LINE 0 945 820 945 2\r\n'
			waybillTemplate += `TEXT 3 0 10 955 打印操作员：${getVal("打印操作员")}\r\n`
			waybillTemplate += 'TEXT 3 0 10 985 查货电话：400-999-2089\r\n'
			waybillTemplate += 'TEXT 3 0 10 1015 客服电话：400-999-2089\r\n'
			waybillTemplate += `TEXT 3 0 10 1045 发站电话：${getVal("发站电话")}\r\n`
			waybillTemplate += `TEXT 3 0 10 1075 到站电话：${getVal("到站电话")}\r\n`
			waybillTemplate += 'TEXT 3 0 10 1105 货款电话：0371-53397802\r\n'
			waybillTemplate += 'B QR 350 960 M 4 U 5\r\n'
			waybillTemplate += `MA, http://tms.dekuncn.com:9011/#/home?customerCode=${getVal("运单号")} \r\n`
			waybillTemplate += 'ENDQR\r\n'
		}
		waybillTemplate += 'LINE 0 195 820 195 2\r\n'
		waybillTemplate += 'LINE 0 295 820 295 2\r\n'
		waybillTemplate += 'LINE 0 395 820 395 2\r\n'
		waybillTemplate += 'LINE 0 495 820 495 2\r\n'
		waybillTemplate += 'LINE 0 530 820 530 2\r\n'

		waybillTemplate += 'FORM\r\n'
		waybillTemplate += 'PRINT\r\n'

		console.log(JSON.parse(JSON.stringify(waybillTemplate)))
		return waybillTemplate
	
}
