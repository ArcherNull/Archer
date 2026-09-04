/** 浩运标签模板（O098=1）来源：Common.getHYLabelTemplate */

export function getHYLabelTemplate(data) {

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

		var labelTemplate = ''
		var url =
			'0000000000000000000000000000000000000000000000000000003F00000000000000FFC0000000000001FFE0000000000003FFF0000000000007FFF800000000000FFFFC00000000001FFFFE00000000003FFFFF00000000007FFFFF8000000000FFFFFFC000000000FFF3FFC0000000007FE1FF80000000003FC0FF000000000C3F807F0C0000001C4F003C9E0000003F8600187F0000007F8000007F800000FFC00000FFC00001FFE00001FFE00003FFE00001FFF00007FFC00000FFF8000FFF8000007FFC000FFF0000003FFC001FFE0000001FFE001FFC0000000FFE001FF800000007FE001FF800000007FE001FFC0000000FFE001FFE0000001FFE000FFF0000003FFC000FFF8000007FFC0007FFC00000FFF80003FFE00001FFF00001FFE00001FFE00000FFC00000FFC000007F8000007F8000003F8600187F0000001E4F003C9E0000000C3F807F0C000000003FC0FF00000000007FE1FF8000000000FFF3FFC000000000FFFFFFC0000000007FFFFF80000000003FFFFF00000000001FFFFE00000000000FFFFC000000000007FFF8000000000003FFF0000000000001FFE0000000000000FFC00000000000003F00000000000000000000000000000000000000000000000000000000'
		// 标签
		labelTemplate += '! 0 200 200 700 1\r\n'
		labelTemplate += 'GAP-SENSE\r\n'
		labelTemplate += 'PREFEED 10\r\n'

		labelTemplate += `EG 8 58 15 5 ${url}\r\n`
		labelTemplate += `BARCODE 128 2 1 50 100 10 ${getVal("QRCode")}\r\n`
		labelTemplate += 'BOX 10 70 440 490 1 \r\n'

		labelTemplate += 'TEXT 3 0 25 90 运单号\r\n'
		labelTemplate += 'SETMAG 2 2\r\n'
		labelTemplate += `TEXT 3 0 130 75 ${getVal("code")}\r\n`
		labelTemplate += 'SETMAG 0 0\r\n'
		labelTemplate += 'TEXT 3 0 35 150 发货\r\n'
		labelTemplate += `TEXT 3 0 130 150 ${getVal("shipMan")}\r\n`
		labelTemplate += `TEXT 3 0 360 150 ${getVal("quantity")}件\r\n`
		labelTemplate += 'TEXT 3 0 35 210 目的\r\n'
		labelTemplate += `TEXT 3 0 130 210 ${getVal("desitiantionSataion")}--${getVal("shortNetworkDestination")}\r\n`
		labelTemplate += 'TEXT 3 0 35 270 品名\r\n'
		labelTemplate += `TEXT 3 0 130 270 ${getVal("itemNames")}\r\n`
		labelTemplate += 'TEXT 3 0 35 330 计重\r\n'
		labelTemplate += `TEXT 3 0 130 330 ${getVal("weight")}\r\n`
		labelTemplate += 'TEXT 3 0 35 390 收货\r\n'
		labelTemplate += `TEXT 3 0 130 390 ${getVal("receivedMan")}\r\n`
		labelTemplate += 'TEXT 3 0 35 450 终端\r\n'
		labelTemplate += `TEXT 3 0 130 450 ${getVal("destinationPoint")}\r\n`
		labelTemplate += 'TEXT 3 0 275 270 包装\r\n'
		labelTemplate += `TEXT 3 0 360 270 ${getVal("packUnits")}\r\n`
		labelTemplate += 'TEXT 3 0 275 330 计体\r\n'
		labelTemplate += `TEXT 3 0 360 330 ${getVal("volume")}\r\n`
		labelTemplate += `TEXT 3 0 360 390 ${getVal("handoverMode")}\r\n`
		labelTemplate += `TEXT 3 0 20 500 ${getVal("startPoint")}\r\n`
		labelTemplate += `TEXT 3 0 20 525 ${getVal("orderDate")}\r\n`
		labelTemplate += 'LINE 0 130 440 130 1\r\n'
		labelTemplate += 'LINE 0 190 440 190 1\r\n'
		labelTemplate += 'LINE 0 250 440 250 1\r\n'
		labelTemplate += 'LINE 0 310 440 310 1\r\n'
		labelTemplate += 'LINE 0 370 440 370 1\r\n'
		labelTemplate += 'LINE 0 430 440 430 1\r\n'
		labelTemplate += 'LINE 100 70 100 490 1\r\n'
		labelTemplate += 'LINE 340 130 340 190 1\r\n'
		labelTemplate += 'LINE 250 250 250 370 1\r\n'
		labelTemplate += 'LINE 340 250 340 430 1\r\n'

		labelTemplate += 'FORM\r\n'
		labelTemplate += 'PRINT\r\n'
		return labelTemplate
	
}
