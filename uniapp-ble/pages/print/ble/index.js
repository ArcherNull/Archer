import { BleBlueTooth } from './bleBlueTooth.js'

/**
 * 蓝牙打印模块入口（全局唯一适配器实例）
 * 连接与打印任务均由 BleBlueTooth 实现
 */
export class BluetoothPrintModule {
    constructor() {
        this.ble = new BleBlueTooth()
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
 * 获取全局唯一 BLE 适配器实例（页面统一入口）
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
    return new BleBlueTooth()
}

export { BleBlueTooth }
