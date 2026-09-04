/** 军城标签模板（历史 O098=2 旧版）来源：Common.getJCLabelTemplate；现业务多用配军 peiJunLabel */

import { LOGO_EG_DATA } from './logo.js'

export function getJCLabelTemplate(data) {

		var json = data
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

		var codeLength = '';
		var codeOffset = 0;
		var labelTemplate = ''
		labelTemplate += '! 0 200 200 790 1\r\n'
		labelTemplate += 'GAP-SENSE\r\n'
		labelTemplate += 'PREFEED 10\r\n'
		labelTemplate += `EG 8 58 10 2 ${LOGO_EG_DATA}\r\n`
		labelTemplate += `TEXT 3 0 75 10 德坤\r\n`
		labelTemplate += `TEXT 7 0 70 30 DeKun\r\n`
		labelTemplate += `SETMAG 3 3\r\n`
		// 坤速达-加急、必走货-快、坤铁运-铁  其他的不显示
		labelTemplate += `TEXT 3 0 10 55 ${getVal("beMustShip")}\r\n`
		labelTemplate += `SETMAG 0 0\r\n`
		labelTemplate += `B 128 2 1 50 170 5 ${getVal("code")}-${getVal('currentCopyCode')}\r\n`
		labelTemplate += `VB 128 2 1 50 510 540 ${getVal("code")}-${getVal('currentCopyCode')}\r\n`
		// labelTemplate += `TEXT 3 0 170 85 运单号\r\n`

		codeLength = getVal("code").length
		codeOffset = codeLength * 25
		labelTemplate += `SETMAG 2 2\r\n`
		// 如果放开运单号，X就是250
		labelTemplate += `TEXT 3 0 170 70 ${getVal("code")}\r\n`
		labelTemplate += `SETMAG 0 0 \r\n`
		labelTemplate += `TEXT 3 0 ${170 + codeOffset} 85 -${getVal('currentCopyCode')}\r\n`

		labelTemplate += `TEXT 3 0 15 160 终端部门：${getVal("destinationPoint")}\r\n`
		labelTemplate += `SETMAG 2 2\r\n`
		labelTemplate += `TEXT 3 0 50 220 ${getVal("transitStationName")}\r\n` // 中转地
		labelTemplate += `SETMAG 0 0\r\n`
		labelTemplate += `SETMAG 2 2\r\n`
		labelTemplate += `TEXT 3 0 330 220 ${getVal("transitMode")}\r\n` // 产品名称
		labelTemplate += `SETMAG 0 0\r\n`
		labelTemplate += `SETMAG 2 2\r\n`
		labelTemplate += `TEXT 3 0 15 300 收\r\n`
		labelTemplate += `SETMAG 0 0\r\n`
		labelTemplate += `TEXT 0 20 70 295 ${getVal("receivedManMasked")}\r\n` // *表示收件人姓名
		labelTemplate += `TEXT 0 20 70 325 ${getVal( "receivedManPhoneMasked" )}\r\n` // *表示收件人电话
		// 收件四级地址
		if(getVal("receiveStreet")) {
			if(getVal("receiveStreet").length > 16) {
				labelTemplate += `TEXT 0 20 10 355 ${getVal("receiveStreet").substring(0, 16)}\r\n`
				labelTemplate += `TEXT 0 20 10 375 ${getVal("receiveStreet").substring(16, 32)}\r\n`
				// 收件详细地址
				if(json.receivedAddress && json.receivedAddress.length > 14) {
					labelTemplate += `TEXT 0 20 10 400 ${getVal("receivedAddress").substring(0, 14)}\r\n`
					labelTemplate += `TEXT 0 20 10 425 ${getVal("receivedAddress").substring(14, 28)}\r\n`
				} else {
					labelTemplate += `TEXT 0 20 10 375 ${getVal("receivedAddress")}\r\n`
				}
			} else {
				labelTemplate += `TEXT 0 20 10 355 ${getVal("receiveStreet")}\r\n`
				// 收件详细地址
				if(json.receivedAddress && json.receivedAddress.length > 14) {
					labelTemplate += `TEXT 0 20 10 375 ${getVal("receivedAddress").substring(0, 14)}\r\n`
					labelTemplate += `TEXT 0 20 10 400 ${getVal("receivedAddress").substring(14, 28)}\r\n`
				} else {
					labelTemplate += `TEXT 0 20 10 375 ${getVal("receivedAddress")}\r\n`
				}
			}
		} else {
			// 收件详细地址
			labelTemplate += `TEXT 0 20 10 355 ${getVal("receivedAddress").substring(0, 14)}\r\n`
			labelTemplate += `TEXT 0 20 10 375 ${getVal("receivedAddress").substring(14, 28)}\r\n`
		}
		labelTemplate += `B QR 320 283 M 4 U 5\r\n`
		labelTemplate += `MA, http://tms.dekuncn.com:9011/#/home?customerCode=${getVal("code")}\r\n`
		labelTemplate += `ENDQR\r\n`
		labelTemplate += `SETMAG 2 2\r\n`
		labelTemplate += `TEXT 3 0 15 460 寄\r\n`
		labelTemplate += `SETMAG 0 0\r\n`
		if(getVal("shipCompany")) {
			if(getVal("shipCompany").length > 11) {
				labelTemplate += `TEXT 0 20 70 455 ${getVal("shipCompany").substring(0, 11)}\r\n`
				labelTemplate += `TEXT 0 20 70 475 ${getVal("shipCompany").substring(11, 22)}\r\n`
				labelTemplate += `TEXT 0 20 70 500 *${getVal("shipManMasked")}\r\n` // *表示收件人姓名
				labelTemplate += `TEXT 0 20 70 525 ${getVal("shipManPhoneMasked")}\r\n` // *表示收件人电话
			} else {
				labelTemplate += `TEXT 0 20 70 460 ${getVal("shipCompany")}\r\n`
				labelTemplate += `TEXT 0 20 70 490 *${getVal("shipManMasked")}\r\n` // *表示收件人姓名
				labelTemplate += `TEXT 0 20 70 520 ${getVal("shipManPhoneMasked")}\r\n` // *表示收件人电话
			}
		}
		
		// labelTemplate += `TEXT 0 20 310 455 ${getVal("vip")}\r\n`
		labelTemplate += `TEXT 0 20 310 475 ${getVal("beWarehouse") == '1' ? "进仓" : ""} ${getVal('beLoading') == "1" ? "装卸" : ""}\r\n`
		labelTemplate += `TEXT 0 20 310 505 ${getVal("isUpfloor")}\r\n`
		labelTemplate += `TEXT 3 0 20 585 货物\r\n`
		labelTemplate += `TEXT 3 0 20 615 信息\r\n`
		labelTemplate += `TEXT 3 0 120 565 品名：${getVal("itemNames")}\r\n`  // 品名
		labelTemplate += `TEXT 3 0 120 600 件数：${getVal("quantity")}\r\n`  // 件数
		labelTemplate += `TEXT 3 0 120 635 包装：${getVal("packUnits")}\r\n`  // 包装
		labelTemplate += `TEXT 0 20 310 565 交接方式：${getVal("handoverMode")}\r\n`  // 交接方式
		labelTemplate += `TEXT 3 0 310 600 ${getVal('weight') ?  getVal('weight') + 'KG' : ''}/${getVal("volume") ? getVal("volume") + 'F' : ''}\r\n`  // 重量/体积
		labelTemplate += `TEXT 0 20 310 640 付款方式：${getVal("paymentMethod")}\r\n`
		labelTemplate += `TEXT 24 0 5 685 ${getVal("startPoint")}\r\n` // 开单网点
		labelTemplate += `TEXT 24 0 310 685 ${getVal("orderDate")}\r\n` // 开单时间
		labelTemplate += `TEXT 24 0 5 725 兑现时间:${getVal("lastArrivedTime")}\r\n` // 开单时间
		labelTemplate += `BOX 5 130 500 675 1\r\n`
		labelTemplate += `LINE 5 210 500 210 1\r\n`
		labelTemplate += `LINE 5 280 500 280 1\r\n`
		labelTemplate += `LINE 5 450 500 450 1\r\n`
		labelTemplate += `LINE 5 555 500 555 1\r\n`
		labelTemplate += `LINE 300 210 300 675 1\r\n`
		labelTemplate += `LINE 100 555 100 675 1\r\n`
		labelTemplate += `FORM\r\n`
		labelTemplate += `PRINT\r\n`
		return labelTemplate
	
}
