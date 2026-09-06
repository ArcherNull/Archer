/**
 * 打印页 Mock API（本地假数据，不走真实网络）
 * 对应接口：
 * - POST /systemParam/getListParamValue
 * - GET  /applet/queryTrackByWayBillCode
 * - POST /report-item/faceOrderReport
 * - POST /report-item/receiptTask
 */
import { listParamValueMock } from './data/systemParam.js'
import {
	DEFAULT_WAY_BILL_CODE,
	trackByWayBillMock,
} from './data/waybillTrack.js'
import { faceOrderReportMock } from './data/faceOrderReport.js'
import { receiptTaskMock } from './data/receiptTask.js'

const MOCK_DELAY_MS = 200

function sleep(ms) {
	return new Promise(function (resolve) {
		setTimeout(resolve, ms)
	})
}

function ok(data) {
	return {
		success: true,
		code: 200,
		msg: '操作成功',
		data: data,
	}
}

/**
 * 系统参数 O097 / O098
 * @param {string[]} _types
 */
export async function getListParamValue(_types) {
	await sleep(MOCK_DELAY_MS)
	return ok(listParamValueMock)
}

/**
 * 按运单号查轨迹/详情
 * @param {{ wayBillCode: string }} params
 */
export async function queryTrackByWayBillCode(params) {
	await sleep(MOCK_DELAY_MS)
	const wayBillCode =
		(params && params.wayBillCode) || DEFAULT_WAY_BILL_CODE
	const vo = Object.assign({}, trackByWayBillMock.appletWayBillCodeInfoVO, {
		code: wayBillCode,
		customerOrderNumber: wayBillCode,
	})
	return ok(
		Object.assign({}, trackByWayBillMock, {
			wayBillCode: wayBillCode,
			appletWayBillCodeInfoVO: vo,
		})
	)
}

/**
 * 多联面单报表
 * @param {{ codes: string, printType: string }} params
 */
export async function getFaceOrderReport(params) {
	await sleep(MOCK_DELAY_MS)
	const codes = (params && params.codes) || faceOrderReportMock.运单号
	const printType = (params && params.printType) || '托运客户联'
	const row = Object.assign({}, faceOrderReportMock, {
		运单号: codes,
		printType: printType,
	})
	return ok({
		table1: [row],
	})
}

/**
 * 回单任务数据
 * @param {{ codes: string }} params
 */
export async function receiptTask(params) {
	await sleep(MOCK_DELAY_MS)
	let code = DEFAULT_WAY_BILL_CODE
	if (params && params.codes) {
		try {
			const parsed = JSON.parse(params.codes)
			code = parsed || code
		} catch (e) {
			code = String(params.codes).replace(/^"|"$/g, '') || code
		}
	}
	const row = Object.assign({}, receiptTaskMock[0], {
		运单号: code,
		回单编号: code,
	})
	return ok([row])
}

export { DEFAULT_WAY_BILL_CODE }
