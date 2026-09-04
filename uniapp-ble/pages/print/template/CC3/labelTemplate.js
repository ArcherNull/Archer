/** 德坤普通标签模板（O098=0，非 zoneId=23）来源：Common.getLabelTemplate */

import { LOGO_EG_DATA } from './logo.js'

export function getLabelTemplate(data) {

		var json = data
		var labelTemplate = ''
		// 标签
		labelTemplate += '! 0 200 200 490 1\r\n'
		labelTemplate += 'GAP-SENSE\r\n'

		// labelTemplate += 'VB QR 10 430 M 2 U 2\r\n'
		// labelTemplate += `MA,${json.QRCode}\r\n`
		// labelTemplate += 'ENDQR\r\n'

		// labelTemplate += `EG 8 58 7 380 ${url}\r\n`
		labelTemplate += `EG 8 58 7 380 ${LOGO_EG_DATA}\r\n`

		labelTemplate += `VBARCODE 128 2 1 50 10 370 ${json.QRCode}-${json.currentCopyCode}\r\n`
		labelTemplate += 'BOX 65 0 520 440 1 \r\n'

		labelTemplate += 'SETMAG 2 2\r\n'
		labelTemplate += 'SETBOLD 2\r\n'
		labelTemplate += `VTEXT 3 1 80 325 ${json.code}-${json.currentCopyCode}\r\n`
		labelTemplate += 'SETBOLD 0\r\n'
		labelTemplate += 'SETMAG 0 0\r\n'

		if (json.startPoint == '盛聚拼多多项目部') {
			labelTemplate += 'SETMAG 2 2\r\n'
			labelTemplate += 'SETBOLD 2\r\n'
			labelTemplate += `VTEXT 55 0 88 80 -${json.currentCopyCode}\r\n`
			labelTemplate += 'SETBOLD 0\r\n'
			labelTemplate += 'SETMAG 0 0\r\n'
		}

		labelTemplate += 'VTEXT 3 0 91 425 运单号\r\n'
		labelTemplate += `VTEXT 3 1 157 105 ${json.quantity}件\r\n`
		labelTemplate += `VTEXT 3 0 157 275 ${json.shipMan}\r\n`
		labelTemplate += 'VTEXT 3 0 157 410 发货\r\n'
		if (json.startPoint == '盛聚拼多多项目部') {
			labelTemplate += `VTEXT 3 0 221 350 ${json.transitStationName}${json.transitStationName ? '-' : ''}\r\n`
			labelTemplate += 'SETMAG 2 2\r\n'
			labelTemplate += 'SETBOLD 2\r\n'
			labelTemplate += `VTEXT 55 0 215 270 ${json.receivedCompany}\r\n`
			labelTemplate += 'SETBOLD 0\r\n'
			labelTemplate += 'SETMAG 0 0\r\n'
		} else {
			labelTemplate += `VTEXT 3 0 221 260 ${json.transitStationName}\r\n`
		}
		labelTemplate += 'VTEXT 3 0 221 410 目的\r\n'
		labelTemplate += `VTEXT 3 0 285 100 ${json.packUnits}\r\n`
		labelTemplate += 'VTEXT 3 0 285 180 包装\r\n'
		labelTemplate += `VTEXT 3 0 285 315 ${json.itemNames}\r\n`
		labelTemplate += 'VTEXT 3 0 285 410 品名\r\n'
		labelTemplate += `VTEXT 3 1 349 100 ${json.volume}\r\n`
		labelTemplate += 'VTEXT 3 0 349 175 计体\r\n'
		labelTemplate += `VTEXT 3 1 349 330 ${json.weight}\r\n`
		labelTemplate += 'VTEXT 3 0 349 410 计重\r\n'
		labelTemplate += `VTEXT 3 0 413 100 ${json.handoverMode}\r\n`
		labelTemplate += `VTEXT 3 0 413 280 ${json.receivedMan}\r\n`
		labelTemplate += 'VTEXT 3 0 413 410 收货\r\n'
		labelTemplate += `VTEXT 3 0 477 285 ${json.destinationPoint}\r\n`
		labelTemplate += 'VTEXT 3 0 477 410 终端\r\n'
		labelTemplate += 'LINE 136 0 136 440 1\r\n'
		labelTemplate += 'LINE 200 0 200 440 1\r\n'
		labelTemplate += 'LINE 264 0 264 440 1\r\n'
		labelTemplate += 'LINE 328 0 328 440 1\r\n'
		labelTemplate += 'LINE 392 0 392 440 1\r\n'
		labelTemplate += 'LINE 456 0 456 440 1\r\n'
		labelTemplate += 'LINE 65 350 136 350 1\r\n'
		labelTemplate += 'LINE 136 125 200 125 1\r\n'
		labelTemplate += 'LINE 264 115 456 115 1\r\n'
		labelTemplate += 'LINE 264 195 392 195 1\r\n'
		labelTemplate += 'LINE 136 350 520 350 1\r\n'
		//   labelTemplate += `TEXT 3 0 544 410  ${json.startPoint}\r\n`
		labelTemplate += `VTEXT 3 0 524 445  ${json.startPoint || ''}\r\n`
		//   labelTemplate += `VTEXT 3 0 544 410  ${json.time}\r\n`
		if (json.startPoint == '盛聚拼多多项目部') {
			labelTemplate += 'SETMAG 3 3\r\n'
			labelTemplate += 'SETBOLD 2\r\n'
			labelTemplate += `VTEXT 55 0 525 121 德坤\r\n`
			labelTemplate += 'SETBOLD 0\r\n'
			labelTemplate += 'SETMAG 0 0\r\n'
		}
		labelTemplate += `VTEXT 3 0 552 445  ${json.time || ''}\r\n`
		labelTemplate += 'FORM\r\n'
		labelTemplate += 'PRINT\r\n'
		return labelTemplate
	
}
