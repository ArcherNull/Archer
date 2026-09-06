/**
 * @file template-comm/template/multiWaybillTemplate.js
 * @desc 多联运单 — CC3 / 汉印共用
 */

import { createCpclBuilder } from '../builder/cpclBuilder.js'
import {
	LOGO_EG_DATA,
	LOGO_EG_BYTE_W,
	LOGO_EG_HEIGHT,
} from '../assets/logo.js'
import { createGetVal, resolveBrand } from './_helpers.js'

const DOTS_PER_MM = 8
const PAGE_W = 575
/** 「扫一扫查单」相对原位置下移 2mm，避免与二维码重叠 */
const SCAN_TIP_SHIFT_Y = Math.round(2 * DOTS_PER_MM)
/** Logo 上移 1mm */
const LOGO_SHIFT_UP = Math.round(1 * DOTS_PER_MM)
/** 汉印 Logo 额外右移 10mm */
const HM_LOGO_SHIFT_RIGHT = Math.round(10 * DOTS_PER_MM)

/**
 * @param {Object} wybillData
 * @param {string} type 联次名称
 * @param {{ brand?: string }} options
 */
export function buildMultiWaybillTemplate(wybillData = {}, type = '', options = {}) {
	const getVal = createGetVal(wybillData)
	const brand = resolveBrand(options)
	const b = createCpclBuilder({ brand: brand })
	const pageCenterX = Math.floor(PAGE_W / 2)
	// 芝柯 CENTER + x=-235 等价于绝对 x = pageCenter - 235；汉印 EG 居中易与标题重叠，改绝对坐标
	const logoXBase = pageCenterX - 235
	const logoY = Math.max(0, 20 - LOGO_SHIFT_UP)

	b.page(1200, 1)
	b.pageWidth(PAGE_W)
	b.prefeed(10)

	if (brand === 'HM') {
		b.align('LEFT')
		b.logoEg(
			LOGO_EG_BYTE_W,
			LOGO_EG_HEIGHT,
			logoXBase + HM_LOGO_SHIFT_RIGHT,
			logoY,
			LOGO_EG_DATA
		)
		b.align('CENTER')
	} else {
		b.align('CENTER')
		b.logoEg(LOGO_EG_BYTE_W, LOGO_EG_HEIGHT, -235, logoY, LOGO_EG_DATA)
	}
	b.setBold(2)
	b.setMag(2, 2)
	b.text(3, 0, 0, 10, '德坤浩运')
	b.setMag(0, 0)
	b.setMag(2, 2)
	b.text(7, 0, 0, 60, 'DeKun LOGISTICS')
	b.setMag(0, 0)
	b.setBold(0)
	b.align('RIGHT')

	b.text(3, 0, 0, 80, type)
	b.text(55, 0, 470, 145, `第${getVal('打印次数')}次打印`)
	b.text(3, 0, 0, 205, `电话：${getVal('发货人电话')}`)
	b.text(3, 0, 0, 235, `电话：${getVal('收货人电话')}`)
	b.text(3, 0, 0, 305, `件数：${getVal('件数')}`)
	b.text(3, 0, 0, 335, `回单：${getVal('回单')}`)
	b.text(
		3,
		0,
		0,
		365,
		`体积：${getVal(type === '托运客户联' ? '体积' : '计费体积')}`
	)
	b.text(3, 0, 0, 435, `合计应收：${getVal('合计应收')}`)
	b.text(3, 0, 0, 465, `交货方式：${getVal('交货方式')}`)
	if (type != '收货客户联') {
		b.text(3, 0, 0, 1060 + SCAN_TIP_SHIFT_Y, '扫一扫查单       ')
	} else {
		b.text(3, 0, 0, 1135 + SCAN_TIP_SHIFT_Y, '扫一扫查单       ')
	}

	b.align('LEFT')
	b.text(3, 0, 0, 110, `${getVal('开单网点简称')}--${getVal('中转地')}/${getVal('路由目的地')}`)
	b.text(3, 0, 0, 140, `运单号：${getVal('运单号')} `)
	b.text(3, 0, 0, 170, `运单时间：${getVal('开单日期')}`)
	b.text(3, 0, 0, 205, `发货人：${getVal('发货人')}`)
	b.text(3, 0, 0, 235, `收货人：${getVal('收货人')}`)
	b.text(3, 0, 0, 265, `地址：${getVal('收货地址')}`)
	b.text(3, 0, 0, 305, `品名：${getVal('货名')}`)
	b.text(3, 0, 0, 335, `包装：${getVal('包装')}`)
	b.text(
		3,
		0,
		0,
		365,
		`重量：${getVal(type === '托运客户联' ? '重量' : '计费重量')}Kg`
	)
	b.text(3, 0, 0, 405, getVal('付款运费'))
	b.text(3, 0, 0, 435, `代收：${getVal('代收')}`)
	b.text(3, 0, 0, 465, `付款方式：${getVal('付款方式')}`)
	b.text(3, 0, 0, 500, `备注：${getVal('备注')}`)

	b.text(55, 0, 10, 535, '托运人注意事项')
	const notices = [
		[555, '1.托运人不得托运易燃、易爆、易渗漏、有毒等危险货物，不得托运国家法律'],
		[575, '法规禁止运输的货物；托运人不接收和运输上述货物，若为隐报、错报，由此'],
		[595, '产生的全部责任、损失、人身伤害或财产损失均由托运人或第三方造成。'],
		[615, '2.托运人应如实告知托运货物的品名和性质，不得匿报或瞒报，因托运货物为'],
		[635, '危险品品发生爆燃、自爆等其他严重后果，均由托运人承担和赔偿。'],
		[655, '3.本运单所有内容均为承运人根据托运人申报的信息填写，托运人应当如实申'],
		[675, '报货物信息并在收到运单后查验无误，并承认对运单内容有异议的，应当立即'],
		[695, '提出；托运人对运单；托运人未提出异议的，视为确认本运单无误。'],
		[715, '4.托运人可以选择保价或者不保价运输。托运人选择不保价运输的，发生货损'],
		[735, '货差承运人最高按照运费三倍金额赔偿。托运人选择保价运输的，应当按照货'],
		[755, '物实际价值向承运人声明并支付声明价值费，托运人声明价值不得超过货物实'],
		[775, '际价值。声明价值的货物发生货损货差的，实际损失金额低于声明价值的，承'],
		[795, '运人按照实际损失金额赔偿；实际损失金额高于声明价值的，承运人按照声明'],
		[815, '价值赔偿。'],
		[835, '5.托运人同意确认，承运人可以将其托运的货物与其他货物进行集装后自行或'],
		[855, '者转委托第三方进行运输，托运人对此没有任何异议。'],
	]
	notices.forEach(function (row) {
		b.text(55, 0, 10, row[0], row[1])
	})

	if (type != '收货客户联') {
		b.text(3, 0, 10, 885, `打印操作员：${getVal('打印操作员')}`)
		b.text(3, 0, 10, 915, '查货电话：400-999-2089')
		b.text(3, 0, 10, 945, '客服电话：400-999-2089')
		if (type == '记账联' || type == '存根联') {
			b.text(3, 0, 10, 975, '货款电话：0371-53397802')
		} else {
			b.text(3, 0, 10, 975, `发站电话：${getVal('发站电话')}`)
			b.text(3, 0, 10, 1005, `到站电话：${getVal('到站电话')}`)
			b.text(3, 0, 10, 1035, '货款电话：0371-53397802')
		}
		b.qr(350, 890, 4, 5, `http://tms.dekuncn.com:9011/#/home?customerCode=${getVal('运单号')}`)
		b.line(0, 875, 820, 875, 2)
	} else {
		b.text(55, 0, 10, 875, '6.收货客户联签名必须为发货人指定的收货人，如果收货人是自然人，需要出')
		b.text(55, 0, 10, 895, '示身份证；如果收货人是公司，收货人需要出示授权委托书及身份证')
		b.text(3, 0, 10, 915, '收货人签名：')
		b.line(0, 945, 820, 945, 2)
		b.text(3, 0, 10, 955, `打印操作员：${getVal('打印操作员')}`)
		b.text(3, 0, 10, 985, '查货电话：400-999-2089')
		b.text(3, 0, 10, 1015, '客服电话：400-999-2089')
		b.text(3, 0, 10, 1045, `发站电话：${getVal('发站电话')}`)
		b.text(3, 0, 10, 1075, `到站电话：${getVal('到站电话')}`)
		b.text(3, 0, 10, 1105, '货款电话：0371-53397802')
		b.qr(350, 960, 4, 5, `http://tms.dekuncn.com:9011/#/home?customerCode=${getVal('运单号')}`)
	}

	b.line(0, 195, 820, 195, 2)
	b.line(0, 295, 820, 295, 2)
	b.line(0, 395, 820, 395, 2)
	b.line(0, 495, 820, 495, 2)
	b.line(0, 530, 820, 530, 2)
	// 多联历史：FORM + PRINT（无 GAP-SENSE）；汉印仅 PRINT
	b.endPage({ useGapSense: false })
	return b.build()
}

export function getMultiWaybillTemplate(wybillData, type, options) {
	return buildMultiWaybillTemplate(wybillData, type, options).cpcl
}
