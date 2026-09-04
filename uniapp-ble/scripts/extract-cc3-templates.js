/**
 * 从 kpsapp Common.js / layoutModule.js 抽取打印模板到 uniapp-ble template/CC3
 * 只读源项目，不修改 F:\project\kpsapp
 */
const fs = require('fs')
const path = require('path')

const COMMON = 'F:/project/kpsapp/utils/Common.js'
const LAYOUT = 'F:/project/kpsapp/pages-subPage/paint/comm/template/layoutModule.js'
const OUT = 'E:/blqc-project/Archer/uniapp-ble/pages/print/template/CC3'

const common = fs.readFileSync(COMMON, 'utf8')
const layout = fs.readFileSync(LAYOUT, 'utf8')

const logoMatch = common.match(/let logoUrl = '([^']+)'/)
if (!logoMatch) throw new Error('logoUrl not found')
const LOGO = logoMatch[1]

function extractMethod(name) {
	const start = common.indexOf(`\t${name}(`)
	if (start < 0) throw new Error('method not found: ' + name)
	// find opening brace of method body
	const braceStart = common.indexOf('{', start)
	let depth = 0
	let end = -1
	for (let i = braceStart; i < common.length; i++) {
		const ch = common[i]
		if (ch === '{') depth++
		else if (ch === '}') {
			depth--
			if (depth === 0) {
				end = i
				break
			}
		}
	}
	if (end < 0) throw new Error('brace end not found: ' + name)
	const body = common.slice(braceStart + 1, end)
	return body
}

function wrapExport(fnName, params, body, headerComment) {
	// replace logoUrl with LOGO_EG_DATA
	let b = body.replace(/\blogoUrl\b/g, 'LOGO_EG_DATA')
	return `${headerComment}
import { LOGO_EG_DATA } from './logo.js'

const limitValList = [undefined, '', null]

function createGetVal(json) {
	return function (field) {
		if (!field) return ''
		const val = json[field]
		return limitValList.indexOf(val) !== -1 ? '' : val
	}
}

export function ${fnName}(${params}) {
${b}
}
`
}

// Some methods already define getVal/limitValList inside - keep body as-is after logo replace
function wrapExportRaw(fnName, params, body, headerComment, useLogo) {
	let b = body.replace(/\blogoUrl\b/g, 'LOGO_EG_DATA')
	const importLine = useLogo ? "import { LOGO_EG_DATA } from './logo.js'\n\n" : ''
	return `${headerComment}
${importLine}export function ${fnName}(${params}) {
${b}
}
`
}

fs.writeFileSync(
	path.join(OUT, 'logo.js'),
	`/** 德坤 Logo EG 位图数据（与 kpsapp Common.js logoUrl 一致） */\nexport const LOGO_EG_DATA = '${LOGO}'\n`
)

const methods = [
	{
		src: 'getLabelTemplate',
		file: 'labelTemplate.js',
		fn: 'getLabelTemplate',
		params: 'data',
		comment: '/** 德坤普通标签模板（O098=0，非 zoneId=23）来源：Common.getLabelTemplate */\n',
		useLogo: true,
	},
	{
		src: 'getHYLabelTemplate',
		file: 'hyLabelTemplate.js',
		fn: 'getHYLabelTemplate',
		params: 'data',
		comment: '/** 浩运标签模板（O098=1）来源：Common.getHYLabelTemplate */\n',
		useLogo: false,
	},
	{
		src: 'getJCLabelTemplate',
		file: 'jcLabelTemplate.js',
		fn: 'getJCLabelTemplate',
		params: 'data',
		comment: '/** 军城标签模板（历史 O098=2 旧版）来源：Common.getJCLabelTemplate；现业务多用配军 peiJunLabel */\n',
		useLogo: true,
	},
	{
		src: 'getZoneIdLabelTemplate',
		file: 'zoneIdLabelTemplate.js',
		fn: 'getZoneIdLabelTemplate',
		params: 'data',
		comment: '/** 深圳战区客制化标签（zoneId=23）来源：Common.getZoneIdLabelTemplate */\n',
		useLogo: true,
	},
	{
		src: 'getWaybillTemplate',
		file: 'waybillTemplate.js',
		fn: 'getWaybillTemplate',
		params: 'wybillData',
		comment: '/** 普通运单模板（O097=0）来源：Common.getWaybillTemplate */\n',
		useLogo: false,
	},
	{
		src: 'getMultiWaybillTemplate',
		file: 'multiWaybillTemplate.js',
		fn: 'getMultiWaybillTemplate',
		params: 'wybillData, type',
		comment: '/** 多联运单模板（O097=1 或 O097=2 非托运客户联）来源：Common.getMultiWaybillTemplate */\n',
		useLogo: false,
	},
]

for (const m of methods) {
	const body = extractMethod(m.src)
	const content = wrapExportRaw(m.fn, m.params, body, m.comment, m.useLogo)
	fs.writeFileSync(path.join(OUT, m.file), content)
	console.log('wrote', m.file, 'bytes', content.length)
}

// layoutModule → receiptTemplate.js
fs.writeFileSync(
	path.join(OUT, 'receiptTemplate.js'),
	`/**
 * 回单模板
 * - receiptTemplateJson：德坤回单（zoneId=23）
 * - HYReceiptTemplate：浩运回单（默认）
 * 来源：kpsapp layoutModule.js
 */
${layout}
`
)
console.log('wrote receiptTemplate.js')

console.log('done')
