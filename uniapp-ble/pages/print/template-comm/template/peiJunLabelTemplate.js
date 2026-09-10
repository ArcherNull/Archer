/**
 * @file template-comm/template/peiJunLabelTemplate.js
 * @desc 配军标签（O098=2）— CC3 / 汉印共用
 */

import { buildPeiJunLabel } from './peiJunLabel.js'
import { createGetVal, resolveBrand } from './_helpers.js'

function buildCityDistrict(getVal) {
	return getVal('desitiantionSataion')
}

function buildWeightVolume(getVal) {
	const settle = getVal('settleWeight') || getVal('billingWeight')
	const vol = getVal('volume') || getVal('billingVolumn') || getVal('volumn')
	if (settle !== '') {
		return vol !== '' ? `${settle} KG / ${vol} F` : `${settle} KG`
	}
	const weight = getVal('weight')
	const w = weight !== '' ? `${weight} KG` : ''
	const v = vol !== '' ? `${vol} F` : ''
	if (w && v) return `${w} / ${v}`
	return w || v || ''
}

function buildValueAdded(getVal) {
	const direct =
		getVal('valueAddedServices') || getVal('addedService') || getVal('valueAdded')
	if (direct) {
		return String(direct).includes('增值服务')
			? String(direct)
			: `增值服务：${direct}`
	}
	const parts = []
	if (getVal('beWarehouse') == '1') parts.push('进仓')
	if (getVal('beLoading') == '1') parts.push('装卸')
	if (getVal('isUpfloor')) parts.push(getVal('isUpfloor'))
	return parts.length ? `增值服务：${parts.join('')}` : ''
}

function buildReceiverAddress(getVal) {
	const route = getVal('routeAddress') || getVal('receiveStreet') || ''
	const detail = getVal('receivedAddress') || ''
	return [route, detail].filter(Boolean).join('')
}

/** 业务数据 → 配军标签字段 */
export function mapBizToPeiJunLabel(biz = {}) {
	console.log('biz====>', biz)
	const getVal = createGetVal(biz || {})
	const code = getVal('code')
	const copy = getVal('currentCopyCode')
	const orderNo = copy !== '' ? `${code}-${copy}` : code
	const qty = getVal('quantity')
	const goodsQty =
		qty !== '' ? (String(qty).includes('件') ? String(qty) : `${qty}件`) : ''
	const lastArrived = getVal('lastArrivedTime')
	const customerOrderNumberVal = getVal('customerOrderNumber')

	return {
		orderNo,
		transportType: getVal('transitMode') || getVal('transportMode'),
		transferHub: getVal('transitStationName'),
		destArea: buildCityDistrict(getVal),
		destOutlet: getVal('labelName'),
		qrcode: code
			? `http://tms.dekuncn.com:9011/#/home?customerCode=${code}`
			: '',
		goodsName: getVal('itemNames'),
		goodsQty,
		packType: getVal('packUnits'),
		weightVolume: buildWeightVolume(getVal),
		receiverName: getVal('receivedManMasked') || getVal('receivedMan'),
		receiverPhone: getVal('receivedManPhoneMasked') || getVal('receivedManPhone'),
		receiverAddress: buildReceiverAddress(getVal),
		deliveryType: getVal('handoverMode'),
		payType: getVal('paymentMethod'),
		senderAddress: getVal('shipCompany') || getVal('shipAddress'),
		senderName: getVal('shipManMasked') || getVal('shipMan'),
		senderPhone: getVal('shipManPhoneMasked') || getVal('shipManPhone'),
		valueAdded: buildValueAdded(getVal),
		customerOrderNumber: customerOrderNumberVal ? `${customerOrderNumberVal}` : '',
		footerOutlet: getVal('orderLabelName'),
		printDate: getVal('orderDate'),
		promiseTime: lastArrived ? `兑现时间：${lastArrived}` : '兑现时间：',
	}
}

export function peiJunLabelTemplateJson(params = {}, options = {}) {
	return buildPeiJunLabel(params, { brand: resolveBrand(options) }).cpcl
}

export function buildPeiJunLabelTemplate(biz = {}, options = {}) {
	return peiJunLabelTemplateJson(mapBizToPeiJunLabel(biz), options)
}

export function getPeiJunLabelTemplate(data, options) {
	return buildPeiJunLabelTemplate(data, options)
}
