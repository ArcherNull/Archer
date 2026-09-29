import { BleBlueTooth } from './bleBlueTooth.js'
// #ifdef APP-PLUS
import { ClassicBlueTooth } from './classicBlueTooth.js'
import {
	HarmonyClassicBlueTooth,
	isHuaweiHarmonyDevice,
} from './harmonyClassicBlueTooth.js'
// #endif

/**
 * 是否使用经典蓝牙（Android App）
 * 微信小程序等非 App 端始终走 BLE
 */
export function shouldUseClassicBluetooth() {
	// #ifdef APP-PLUS
	try {
		const info = uni.getSystemInfoSync() || {}
		const platform = String(info.platform || info.osName || '').toLowerCase()
		// 鸿蒙兼容层可能上报 harmony / android
		return platform === 'android' || platform.includes('harmony')
	} catch (e) {
		return false
	}
	// #endif
	// #ifndef APP-PLUS
	return false
	// #endif
}

/**
 * 是否使用华为/鸿蒙优化版经典蓝牙
 */
export function shouldUseHarmonyClassicBluetooth() {
	// #ifdef APP-PLUS
	try {
		const info = uni.getSystemInfoSync() || {}
		return isHuaweiHarmonyDevice(info)
	} catch (e) {
		return false
	}
	// #endif
	// #ifndef APP-PLUS
	return false
	// #endif
}

/**
 * 按平台创建适配器：
 * - 微信小程序：BLE
 * - 华为/鸿蒙 App：HarmonyClassicBlueTooth（经典蓝牙优化）
 * - 其它 Android App：ClassicBlueTooth
 * @returns {BleBlueTooth}
 */
export function createAdapterByPlatform() {
	// #ifdef APP-PLUS
	if (shouldUseClassicBluetooth()) {
		if (shouldUseHarmonyClassicBluetooth()) {
			return new HarmonyClassicBlueTooth()
		}
		return new ClassicBlueTooth()
	}
	// #endif
	return new BleBlueTooth()
}

/**
 * 蓝牙打印模块入口（全局唯一适配器实例）
 * 微信小程序：BleBlueTooth
 * 华为/鸿蒙 App：HarmonyClassicBlueTooth
 * 其它 Android App：ClassicBlueTooth
 */
export class BluetoothPrintModule {
	constructor() {
		this.ble = createAdapterByPlatform()
	}

	/** 页面统一访问的适配器实例 */
	get adapter() {
		return this.ble
	}
}

let _instance = null

/**
 * 获取全局唯一蓝牙打印模块
 * @returns {BluetoothPrintModule}
 */
export function getBluetoothPrintModule() {
	if (!_instance) {
		_instance = new BluetoothPrintModule()
	}
	return _instance
}

/**
 * 获取全局唯一蓝牙适配器实例（页面统一入口）
 * @returns {BleBlueTooth}
 */
export function getBluetoothAdapter() {
	return getBluetoothPrintModule().adapter
}

/**
 * 创建新的适配器实例（调试页按生命周期创建/销毁时使用）
 * @returns {BleBlueTooth}
 */
export function createBluetoothAdapter() {
	return createAdapterByPlatform()
}

export { BleBlueTooth }
// #ifdef APP-PLUS
export { ClassicBlueTooth }
export { HarmonyClassicBlueTooth, isHuaweiHarmonyDevice }
// #endif

export {
	DEFAULT_PAGE_WIDTH_DOTS,
	DEFAULT_THRESHOLD,
	DOTS_PER_MM,
	DEFAULT_PRINT_WIDTH_MM,
	DEFAULT_PRINT_HEIGHT_MM,
	MAX_IMAGE_BYTES,
	ALLOWED_IMAGE_EXTS,
	STATIC_PRINT_IMAGES,
	mmToDots,
	calcPrintSizeByMm,
	getImageExt,
	isAllowedImageType,
	getFileSizeAsync,
	validatePrintImage,
	rgbaToEgBitmap,
	buildImageCpcl,
	buildHmCpclImageHex,
	compressMonoToHex,
	isHmImageHexPayload,
	getImageInfoAsync,
	resolveDrawableImagePath,
	materializeLocalImagePath,
	loadImagePixels,
	imagePathToCpcl,
	imagePathToEgBitmap,
	choosePrintImage,
} from './imagePrint.js'
