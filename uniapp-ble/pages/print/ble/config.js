import { showMsg, showModal } from '../comm/utils.js'

// 各操作系统平台打印机配置

// 错误码（含微信隐私协议相关 errno）
export const ERROR_CODE = {
    '0': '正常',
    '-1': '已连接',
    '10000': '未初始化蓝牙适配器',
    '10001': '当前蓝牙适配器不可用，请检查是否打开蓝牙',
    '10002': '没有找到指定设备',
    '10003': '连接失败',
    '10004': '没有找到指定服务',
    '10005': '没有找到指定特征值',
    '10006': '当前连接已断开',
    '10007': '当前特征值不支持此操作',
    '10008': '其余所有系统上报的异常',
    '10009': 'Android 系统特有，系统版本低于 4.3 不支持 BLE',
    '10010': '已连接',
    '10011': '配对设备需要配对码',
    '10012': '连接超时',
    '10013': '连接 deviceId 为空或者是格式不正确',
    '103': '用户拒绝隐私授权',
    '104': '用户未同意隐私协议',
    '112': '未在微信小程序后台声明蓝牙隐私接口，请到「设置-服务内容声明-用户隐私保护指引」勾选蓝牙相关能力（约5分钟生效）',
}

// 蓝牙模块状态：未启动 / 正在启动 / 已启动
export const BLUETOOTH_MODULE_STATE = {
    NOT_STARTED: 'notStarted',
    STARTING: 'starting',
    STARTED: 'started',
}

// 蓝牙模块搜索设备状态：未搜索 / 正在搜索 / 已搜索
export const BLUETOOTH_MODULE_SEARCH_STATE = {
    NOT_SEARCHED: 'notSearched',
    SEARCHING: 'searching',
    SEARCHED: 'searched',
}

// 本地存储键
/** @deprecated 已废弃：历史设备改从打印任务中提取 */
export const STORAGE_KEY_LEGACY_DEVICES = 'kps-history-print-devices'
/** 一周内打印任务缓存 */
export const STORAGE_KEY = 'kps-history-print-tasks'
export const STORAGE_PRINT_TASKS_KEY = STORAGE_KEY
export const STORAGE_SYSTEM_CONFIG_KEY = 'kps-system-config'
// 未识别设备手动绑定品牌（按 deviceId）
export const STORAGE_DEVICE_BRAND_BIND_KEY = 'kps-device-brand-bindings'

/** 打印任务保留时长：7 天 */
export const PRINT_TASK_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

/**
 * 读取一周内打印任务列表（新→旧）
 * @returns {Array<Object>}
 */
export function loadPrintTasks() {
	try {
		const raw = uni.getStorageSync(STORAGE_PRINT_TASKS_KEY)
		if (!raw) return []
		const list = typeof raw === 'string' ? JSON.parse(raw) : raw
		if (!Array.isArray(list)) return []
		const minTs = Date.now() - PRINT_TASK_RETENTION_MS
		return list
			.filter(function (item) {
				const t = Number(item && item.printTime) || 0
				return t >= minTs
			})
			.sort(function (a, b) {
				return (Number(b.printTime) || 0) - (Number(a.printTime) || 0)
			})
	} catch (e) {
		return []
	}
}

/**
 * 写入打印任务列表（自动裁剪一周外数据）
 * @param {Array<Object>} list
 */
export function savePrintTasks(list) {
	const minTs = Date.now() - PRINT_TASK_RETENTION_MS
	const next = (Array.isArray(list) ? list : [])
		.filter(function (item) {
			const t = Number(item && item.printTime) || 0
			return t >= minTs
		})
		.sort(function (a, b) {
			return (Number(b.printTime) || 0) - (Number(a.printTime) || 0)
		})
		.slice(0, 200)
	try {
		uni.setStorageSync(STORAGE_PRINT_TASKS_KEY, JSON.stringify(next))
	} catch (e) {}
	// 清理旧键，避免继续读写历史设备列表
	try {
		uni.removeStorageSync(STORAGE_KEY_LEGACY_DEVICES)
	} catch (e) {}
	return next
}

/**
 * 追加一条打印任务
 * @param {Object} task
 */
export function appendPrintTask(task) {
	if (!task || !task.deviceId) return loadPrintTasks()
	const list = loadPrintTasks()
	list.unshift(
		Object.assign(
			{
				id: '',
				templateName: '打印任务',
				printTime: Date.now(),
				printDataStr: '',
			},
			task,
			{
				id: task.id || String(Date.now()) + '_' + Math.floor(Math.random() * 10000),
				printTime: Number(task.printTime) || Date.now(),
			}
		)
	)
	return savePrintTasks(list)
}

/**
 * 从打印任务中提取历史设备（按 deviceId 去重，保留最近一次）
 * @returns {Array<Object>}
 */
export function extractDevicesFromPrintTasks(taskList) {
	const list = Array.isArray(taskList) ? taskList : loadPrintTasks()
	const map = {}
	const order = []
	list.forEach(function (task) {
		if (!task || !task.deviceId) return
		const id = String(task.deviceId)
		if (!map[id]) {
			order.push(id)
			map[id] = {
				deviceId: id,
				name: task.name || '',
				localName: task.localName || '',
				serviceId: task.serviceId || '',
				characteristicId: task.characteristicId || '',
				writeType: task.writeType || '',
				isConnect: false,
				connectState: 'notConnected',
				lastPrintTime: Number(task.printTime) || 0,
			}
		} else {
			const t = Number(task.printTime) || 0
			if (t > (map[id].lastPrintTime || 0)) {
				map[id].name = task.name || map[id].name
				map[id].localName = task.localName || map[id].localName
				map[id].serviceId = task.serviceId || map[id].serviceId
				map[id].characteristicId = task.characteristicId || map[id].characteristicId
				map[id].writeType = task.writeType || map[id].writeType
				map[id].lastPrintTime = t
			}
		}
	})
	return order.map(function (id) {
		return map[id]
	})
}

// 汉印 CPCL 设备名称前缀
export const CPCL_DEVICE_NAME_PREFIXES = ['HM-', 'HPRT', 'HM-A300', 'HM-A300L']

// 芝柯 / 优博讯 GBK 设备名称前缀
export const GBK_DEVICE_NAME_PREFIXES = ['CC3_', 'CC3', 'K319']

// 常见打印机可写服务 UUID 关键词
export const PREFERRED_WRITE_SERVICE_KEYWORDS = ['FF00', 'FFE0', 'FFF0', '49535343', '18F0', 'EEE0']

// 支持的打印机机型
export const SUPPORTED_PRINTER_MODELS = {
    'HM-A300': {
        brand: 'HM',
        brandName: '汉印',
        model: 'HM-A300',
        protocol: 'cpcl',
        image: 'https://ArcherNull.github.io/images/HM-A300.png',
    },
    'HM-A300L': {
        brand: 'HM',
        brandName: '汉印',
        model: 'HM-A300L',
        protocol: 'cpcl',
        image: 'https://ArcherNull.github.io/images/HM-A300L.png',
    },
    CC3: {
        brand: 'CC3',
        brandName: '芝柯',
        model: 'CC3',
        protocol: 'cpcl',
        image: 'https://ArcherNull.github.io/images/CC3.png',
    },
    K319: {
        brand: 'CC3',
        brandName: '芝柯',
        model: 'K319',
        protocol: 'cpcl',
        image: 'https://ArcherNull.github.io/images/K319.png',
    },
}

/**
 * 将 SUPPORTED_PRINTER_MODELS 按品牌分组
 * @returns {Array<{ brand: string, brandName: string, models: Array }>}
 */
export function getPrinterBrandsGrouped() {
    const brandMap = {}
    Object.keys(SUPPORTED_PRINTER_MODELS).forEach((key) => {
        const item = SUPPORTED_PRINTER_MODELS[key]
        if (!item || !item.brand) return
        if (!brandMap[item.brand]) {
            brandMap[item.brand] = {
                brand: item.brand,
                brandName: item.brandName || item.brand,
                models: [],
            }
        }
        brandMap[item.brand].models.push({
            key,
            ...item,
        })
    })
    return Object.keys(brandMap).map((brand) => brandMap[brand])
}

export function getDeviceBrandBindings() {
    try {
        const data = uni.getStorageSync(STORAGE_DEVICE_BRAND_BIND_KEY)
        return data && typeof data === 'object' ? data : {}
    } catch (e) {
        return {}
    }
}

/**
 * 保存未识别设备的品牌绑定
 * @param {string} deviceId
 * @param {string|Object} modelKeyOrInfo - 机型 key 或机型信息对象
 */
export function saveDeviceBrandBinding(deviceId, modelKeyOrInfo) {
    const id = String(deviceId || '').trim()
    if (!id) return null
    let info = null
    if (typeof modelKeyOrInfo === 'string') {
        info = SUPPORTED_PRINTER_MODELS[modelKeyOrInfo]
            ? { ...SUPPORTED_PRINTER_MODELS[modelKeyOrInfo], key: modelKeyOrInfo }
            : null
    } else if (modelKeyOrInfo && typeof modelKeyOrInfo === 'object') {
        info = { ...modelKeyOrInfo }
    }
    if (!info || !info.brand) return null
    const bindings = getDeviceBrandBindings()
    bindings[id] = {
        brand: info.brand,
        brandName: info.brandName,
        model: info.model,
        protocol: info.protocol || 'cpcl',
        image: info.image || '',
        key: info.key || info.model || '',
        boundAt: Date.now(),
    }
    try {
        uni.setStorageSync(STORAGE_DEVICE_BRAND_BIND_KEY, bindings)
    } catch (e) {}
    return bindings[id]
}

export function removeDeviceBrandBinding(deviceId) {
    const id = String(deviceId || '').trim()
    if (!id) return
    const bindings = getDeviceBrandBindings()
    if (!bindings[id]) return
    delete bindings[id]
    try {
        uni.setStorageSync(STORAGE_DEVICE_BRAND_BIND_KEY, bindings)
    } catch (e) {}
}

/**
 * 根据设备名称 / deviceId 解析品牌机型信息（优先使用手动绑定）
 * @param {string} deviceName
 * @param {string} [deviceId]
 */
export function resolvePrinterBrandInfo(deviceName = '', deviceId = '') {
    const id = String(deviceId || '').trim()
    if (id) {
        const bindings = getDeviceBrandBindings()
        if (bindings[id] && bindings[id].brand) {
            return { ...bindings[id] }
        }
    }
    const name = String(deviceName || '').trim().toUpperCase()
    if (!name) {
        return {
            brand: '',
            brandName: '未知品牌',
            model: '',
            protocol: 'cpcl',
            image: '',
        }
    }
    if (name.includes('HM-A300L') || name.includes('A300L')) {
        return { ...SUPPORTED_PRINTER_MODELS['HM-A300L'] }
    }
    if (name.includes('HM-A300') || name.startsWith('HM-') || name.includes('HPRT')) {
        return { ...SUPPORTED_PRINTER_MODELS['HM-A300'] }
    }
    if (name.includes('K319')) {
        return { ...SUPPORTED_PRINTER_MODELS.K319 }
    }
    if (name.includes('CC3')) {
        return { ...SUPPORTED_PRINTER_MODELS.CC3 }
    }
    return {
        brand: '',
        brandName: '未知品牌',
        model: name,
        protocol: 'cpcl',
        image: '',
    }
}

export function isUnrecognizedPrinterBrand(brandInfo) {
    return !brandInfo || !brandInfo.brand
}

export function isPrivacyScopeUndeclaredError(errOrRes) {
    const errno = errOrRes?.errno
    const msg = errOrRes?.errMsg || errOrRes?.message || ''
    return errno === 112 ||
        String(msg).includes('not declared in the privacy agreement') ||
        String(msg).includes('未在微信小程序后台声明蓝牙隐私接口')
}

export function formatBluetoothError(res, fallback = '蓝牙操作失败') {
    const errno = res?.errno
    const errCode = res?.errCode
    if (errno !== undefined && ERROR_CODE[String(errno)]) {
        return ERROR_CODE[String(errno)]
    }
    if (errCode !== undefined && ERROR_CODE[String(errCode)]) {
        return ERROR_CODE[String(errCode)]
    }
    return res?.errMsg || fallback
}

export async function tipBluetoothError(errOrMsg) {
    const msg = typeof errOrMsg === 'string' ? errOrMsg : (errOrMsg?.message || '蓝牙操作失败')
    if (isPrivacyScopeUndeclaredError(typeof errOrMsg === 'string' ? { message: errOrMsg } : errOrMsg) ||
        msg.includes('隐私')) {
        await showModal({
            title: '蓝牙不可用',
            content: msg,
            showCancel: false,
            confirmText: '知道了',
        })
        return
    }
    showMsg(msg)
}

export function getPlatformDefaultConfigByOs(osName, isHarmonyOS) {
    const base = {
        useOptimalTransfer: true,
        printTimeoutSec: 40,
        enableRecursivePrint: true,
        mtu: 23,
        mtuStep: 20,
        packetIntervalMs: 20,
        packetStepMs: 20,
        retryIntervalMs: 50,
        retryStepMs: 30,
        maxPacketRetry: 2,
    }
    if (isHarmonyOS) {
        return {
            ...base,
            mtu: 20,
            mtuStep: 20,
            packetIntervalMs: 80,
            packetStepMs: 20,
            retryIntervalMs: 120,
            retryStepMs: 30,
            maxPacketRetry: 3,
        }
    }
    if (osName === 'android') {
        return {
            ...base,
            mtu: 512,
            mtuStep: 20,
        }
    }
    return base
}

/**
 * 解析操作系统版本号（如 13 / 17.0 / 4.2.0）
 * @param {Object} systemInfo uni.getSystemInfoSync()
 * @returns {string}
 */
export function resolveOsVersion(systemInfo = {}) {
    const osVersion = String(systemInfo.osVersion || '').trim()
    if (osVersion) return osVersion
    const system = String(systemInfo.system || '').trim()
    if (!system) return ''
    const matched = system.match(/(\d+(?:\.\d+)*)/)
    return matched ? matched[1] : system
}

export function clampPrintConfigValues(cfg = {}) {
    const clamp = (v, min, max, def) => {
        const n = Number(v)
        if (isNaN(n)) return def
        return Math.min(max, Math.max(min, Math.round(n)))
    }
    cfg.printTimeoutSec = clamp(cfg.printTimeoutSec, 10, 100, 40)
    cfg.mtu = clamp(cfg.mtu, 20, 512, 23)
    cfg.mtuStep = clamp(cfg.mtuStep, 10, 100, 20)
    cfg.packetIntervalMs = clamp(cfg.packetIntervalMs, 20, 300, 20)
    cfg.packetStepMs = clamp(cfg.packetStepMs, 10, 100, 20)
    cfg.retryIntervalMs = clamp(cfg.retryIntervalMs, 20, 300, 50)
    cfg.retryStepMs = clamp(cfg.retryStepMs, 10, 200, 30)
    cfg.maxPacketRetry = clamp(cfg.maxPacketRetry, 0, 6, 2)
    cfg.enableRecursivePrint = cfg.enableRecursivePrint !== false
    cfg.useOptimalTransfer = cfg.useOptimalTransfer !== false
    return cfg
}
