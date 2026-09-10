/**
 * 蓝牙连接管理模块
 * 功能：蓝牙设备扫描、连接、断开、状态监听
 * 支持平台：H5、小程序、App
 */
// 全局连接状态管理
let globalConnectedDeviceId = ""
let globalIsConnecting = false

// 蓝牙连接状态监听管理
let isListeningBLEState = false // 是否已注册监听
type BLEConnectionChangeCallback = (deviceId: string, connected: boolean) => void
const bleConnectionChangeCallbacks: Set<BLEConnectionChangeCallback> = new Set()

// Web Bluetooth API 类型声明
declare interface Navigator {
  bluetooth?: {
    requestDevice: (options: {
      filters?: Array<{
        services?: string[]
      }>
      optionalServices?: string[]
    }) => Promise<BluetoothDevice>
  }
}

declare interface BluetoothDevice {
  id: string
  name: string | null
  gatt: {
    connect: () => Promise<BluetoothRemoteGATTServer>
    disconnect: () => void
  }
}

declare interface BluetoothRemoteGATTServer {
  getPrimaryService: (service: string) => Promise<BluetoothRemoteGATTService>
  disconnect: () => void
}

declare interface BluetoothRemoteGATTService {
  uuid: string
  getCharacteristic: (characteristic: string) => Promise<BluetoothRemoteGATTCharacteristic>
}

declare interface BluetoothRemoteGATTCharacteristic {
  uuid: string
  writeValue: (value: ArrayBuffer) => Promise<void>
  startNotifications: () => Promise<void>
  stopNotifications: () => Promise<void>
  addEventListener: (type: string, listener: EventListener) => void
  removeEventListener: (type: string, listener: EventListener) => void
}

// H5 端设备存储
const scannedDevices = new Map<string, BluetoothDevice>()
const connectedDevices = new Map<string, {
  device: BluetoothDevice
  characteristics: Map<string, BluetoothRemoteGATTCharacteristic>
}>()

/** 获取已连接的设备ID */
export function getConnectedDeviceId(): string {
  return globalConnectedDeviceId
}

/** 设置已连接的设备ID */
export function setConnectedDeviceId(deviceId: string) {
  globalConnectedDeviceId = deviceId
  console.log("全局连接状态已更新: ", deviceId)
}

/** 清除已连接的设备ID */
export function clearConnectedDevice() {
  globalConnectedDeviceId = ""
  console.log("全局连接状态已清除")
}

/** 检查设备是否已连接 */
export function isDeviceConnected(deviceId: string): boolean {
  return globalConnectedDeviceId === deviceId
}

/** 获取连接状态 */
export function getIsConnecting(): boolean {
  return globalIsConnecting
}

/** 监听蓝牙连接状态变化 - 避免重复注册 */
export function startBLEConnectionStateMonitor() {
  // #ifdef H5
  // H5 端不需要注册全局监听，设备断开时会自动触发
  console.log("H5 端蓝牙连接状态监听已注册")
  // #endif

  // #ifndef H5
  if (isListeningBLEState) {
    console.log("蓝牙连接状态监听已注册，跳过")
    return
  }
  isListeningBLEState = true

  uni.onBLEConnectionStateChange((res) => {
    console.log("蓝牙连接状态变化:", res)
    if (!res.connected) {
      console.log("蓝牙已断开:", res.deviceId)
      // 清除全局连接状态
      if (globalConnectedDeviceId === res.deviceId) {
        globalConnectedDeviceId = ""
        console.log("全局连接状态已清除（监听触发）")
      }
    }
    // 通知所有回调函数
    bleConnectionChangeCallbacks.forEach((callback) => {
      callback(res.deviceId, res.connected)
    })
  })
  console.log("蓝牙连接状态监听已注册")
  // #endif
}

/** 添加蓝牙连接状态变化回调 */
export function addBLEConnectionChangeListener(callback: BLEConnectionChangeCallback) {
  bleConnectionChangeCallbacks.add(callback)
  console.log("添加蓝牙连接状态变化回调，当前回调数量:", bleConnectionChangeCallbacks.size)
}

/** 移除蓝牙连接状态变化回调 */
export function removeBLEConnectionChangeListener(callback: BLEConnectionChangeCallback) {
  bleConnectionChangeCallbacks.delete(callback)
  console.log("移除蓝牙连接状态变化回调，当前回调数量:", bleConnectionChangeCallbacks.size)
}

/** 设置连接状态 */
export function setIsConnecting(isConnecting: boolean) {
  globalIsConnecting = isConnecting
  console.log("全局连接中状态已更新: ", isConnecting)
}

/** 检查 H5 端蓝牙支持 */
export function checkH5BluetoothSupport(): boolean {
  // #ifdef H5
  return typeof navigator !== "undefined" && "bluetooth" in navigator
  // #endif

  // #ifndef H5
  return true
  // #endif
}

// 关闭蓝牙
export function closeBluetoothAdapter() {
  return new Promise((resolve, reject) => {
    uni.closeBluetoothAdapter({
      success(res) {
        console.log("已关闭蓝牙模块", res)
        resolve(res)
      },
      fail(err) {
        console.log("已关闭蓝牙模块-失败", err)
        reject(err)
      },
    })
  })
}

/** 获取蓝牙设备信号强度 */
export function getBLEDeviceRSSI(deviceId: string) {
  return new Promise<{ rssi: number }>((resolve, reject) => {
    uni.getBLEDeviceRSSI({
      deviceId,
      success(res) {
        console.log("蓝牙设备信号强度", res)
        resolve({ rssi: res.RSSI })
      },
      fail(err) {
        console.log("获取蓝牙设备信号强度失败", err)
        reject(err)
      },
    })
  })
}

/** 断开低功耗蓝牙连接 */
export function closeBLEConnection(deviceId: string) {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    // H5 端实现
    const connection = connectedDevices.get(deviceId)
    if (connection) {
      connection.device.gatt.disconnect()
      connectedDevices.delete(deviceId)
      clearConnectedDevice()
      console.log("H5 蓝牙已断开")
      resolve(true)
    }
    else {
      resolve(true)
    }
    // #endif

    // #ifndef H5
    // 非 H5 端实现
    uni.closeBLEConnection({
      deviceId,
      success(res) {
        console.log("已断开低功耗蓝牙连接")
        resolve(true)
      },
      fail(res) {
        console.log("断开低功耗蓝牙连接失败", res)
        reject(new Error(res.errMsg || "断开蓝牙连接失败"))
      },
    })
    // #endif
  })
}

/** 获取蓝牙设备列表 */
export function getBluetoothDevicesList() {
  return new Promise<UniApp.BluetoothDeviceInfo[]>((resolve, reject) => {
    // #ifdef H5
    // H5 端实现
    const navigatorWithBluetooth = navigator as any
    if (!navigatorWithBluetooth.bluetooth) {
      uni.showModal({
        title: "提示",
        content: "当前浏览器不支持蓝牙功能",
        showCancel: false,
      })
      resolve([])
      return
    }

    navigatorWithBluetooth.bluetooth.requestDevice({
      filters: [
        { services: ["000018f0-0000-1000-8000-00805f9b34fb"] }, // 打印机服务 UUID
      ],
      optionalServices: ["00001800-0000-1000-8000-00805f9b34fb"],
    })
      .then((device: BluetoothDevice) => {
        scannedDevices.set(device.id, device)
        resolve([{
          deviceId: device.id,
          name: device.name || "未知设备",
          RSSI: 0,
          advertisData: [],
          advertisServiceUUIDs: [],
          localName: device.name || "",
          serviceData: [],
        }])
      })
      .catch((err: any) => {
        console.error("H5 蓝牙扫描失败:", err)
        resolve([])
      })
    // #endif

    // #ifndef H5
    // 非 H5 端实现
    openBluetooth()
      .then(() => getBluetoothAdapterState())
      .then(() => searchBluetooth())
      .then(() => getBluetoothDevices())
      .then((res: UniApp.GetBluetoothDevicesSuccess) => {
        console.log("蓝牙列表", res)

        // 无论是否有设备，都 resolve，避免 Promise 永远挂起
        if (res && res.devices) {
          resolve(res.devices)
        }
        else {
          resolve([])
        }
      })
      .catch((err) => {
        reject(err)
      })
    // #endif
  })
}

/** 获取本机蓝牙适配器状态 */
export function getBluetoothAdapterState() {
  return new Promise((resolve, reject) => {
    uni.getBluetoothAdapterState({
      success(res) {
        console.log("蓝牙状态", res)
        if (res.available) {
          if (res.discovering) {
            stopSearchBluetooth()
          }
          else {
            resolve(res)
          }
        }
        else {
          uni.showModal({
            title: "提示",
            content: "本机蓝牙不可用",
            showCancel: false,
          })
          reject(res)
        }
      },
      fail(err) {
        console.log("蓝牙状态-err", err)
        // console.log("blueTooth error= startBluetoothDevicesDiscovery", err);
        reject(err)
      },
    })
  })
}

/** 搜索蓝牙设备 */
export function searchBluetooth() {
  return new Promise((resolve, reject) => {
    uni.startBluetoothDevicesDiscovery({
      success: (res) => {
        console.log("searchBluetooth", res)

        setTimeout(() => {
          resolve(res)
        }, 10000)
      },
      fail: (err) => {
        console.log("searchBluetooth-err", err)

        // console.log("blueTooth error= startBluetoothDevicesDiscovery", err);
        reject(err)
      },
    })
  })
}

/** 获取搜索到的蓝牙设备 */
export function getBluetoothDevices() {
  return new Promise<UniApp.GetBluetoothDevicesSuccess>((resolve, reject) => {
    uni.getBluetoothDevices({
      success: (res) => {
        console.log("getBluetoothDevices", res)

        resolve(res)
      },
      fail: (err) => {
        console.log("getBluetoothDevices-err", err)

        // console.log("blueTooth error= getBluetoothDevices", res);
        reject(err)
      },
    })
  })
}

// 初始化蓝牙连接
export function openBluetooth() {
  return new Promise((resolve, reject) => {
    uni.openBluetoothAdapter({
      success: (res) => {
        console.log("蓝牙模块初始成功", res)
        resolve(res)
      },
      fail: (err) => {
        // console.log("blueTooth error= openBluetoothAdapter", res);
        console.log("蓝牙模块初始化失败", err)
        reject(err)
      },
    })
  })
}

/** 停止搜索蓝牙 */
export function stopSearchBluetooth() {
  uni.stopBluetoothDevicesDiscovery({
    complete: (res) => {
      // console.log("stopBluetoothDevicesDiscovery", res);
    },
  })
}

/** 连接低功耗蓝牙 */
export function connectBLEDevice(deviceId: string, cb: (size: number) => void) {
  console.log("connectBLEDevice")
  return new Promise((resolve, reject) => {
    uni.createBLEConnection({
      deviceId,
      success: (res) => {
        console.log("createBLEConnection success", res)
        // 连接成功后获取MTU
        setMaxMTU(deviceId, 511, cb)
        resolve(deviceId)
      },
      fail: (err) => {
        console.log("createBLEConnection fail", err)
        reject(err)
      },
    })
  })
}

export function setMaxMTU(deviceId: string, maxMTU: number, cb?: (size: number) => void): Promise<number> {
  return new Promise((resolve, reject) => {
    // 使用二分查找算法找到最大可设置的MTU值
    binarySearchMaxMTU(deviceId, 20, maxMTU, cb)
      .then(resolve)
      .catch(reject)
  })
}

/** 使用二分查找算法找到最大可设置的MTU值 */
function binarySearchMaxMTU(
  deviceId: string,
  minMTU: number,
  maxMTU: number,
  cb?: (size: number) => void,
): Promise<number> {
  return new Promise((resolve, reject) => {
    // 基础MTU值（最小20）
    if (minMTU > maxMTU) {
      // 没有找到更大的值，返回当前最大值
      const size = maxMTU - 10
      if (cb)
        cb(size)
      resolve(size)
      return
    }

    // 取中间值
    const midMTU = Math.floor((minMTU + maxMTU) / 2)
    console.log(`尝试设置MTU: ${midMTU} (范围: ${minMTU}-${maxMTU})`)

    uni.setBLEMTU({
      deviceId,
      mtu: midMTU,
      success: (res) => {
        console.log("设置成功:", res)
        // 设置成功，尝试更大的值
        binarySearchMaxMTU(deviceId, midMTU + 1, maxMTU, cb)
          .then(resolve)
          .catch(reject)
      },
      fail: (err) => {
        console.log("设置失败:", err)
        // 设置失败，尝试更小的MTU值
        binarySearchMaxMTU(deviceId, minMTU, midMTU - 1, cb)
          .then(resolve)
          .catch(reject)
      },
    })
  })
}

/** 获取蓝牙设备所有服务 */
export function getBLEDeviceServices(deviceId: string): Promise<{
  msg: string
  deviceId: string
  serviceId: string
}> {
  return new Promise((resolve, reject) => {
    uni.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log("getBLEDeviceServices", res)
        for (let i = 0; i < res.services.length; i++) {
          const item = res.services[i]
          if (item.isPrimary) {
            // this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid);
            resolve({
              msg: "获取蓝牙设备服务成功",
              deviceId,
              serviceId: item.uuid,
            })
            return
          }
        }
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/** 获取蓝牙设备某个服务中的特征值列表 */
export function getBLEDeviceCharacteristics({
  deviceId,
  serviceId,
}: {
  deviceId: string
  serviceId: string
}): Promise<{
    msg: string
    deviceId: string
    serviceId: string
    characteristicId: string
  }> {
  return new Promise((resolve, reject) => {
    uni.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        // console.log("getBLEDeviceCharacteristics success", res.characteristics);
        // 这里会存在特征值是支持write，写入成功但是没有任何反应的情况
        for (let i = 0; i < res.characteristics.length; i++) {
          const item = res.characteristics[i]
          if (item.properties.write) {
            resolve({
              msg: "获取蓝牙设备指定服务中所有特征值成功",
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
            break
          }
        }
        reject(new Error("该设备不可用"))
      },
      fail(err) {
        // console.error("getBLEDeviceCharacteristics", res);
        reject(err)
      },
    })
  })
}

/** 连接蓝牙 */
export function connectBluetoothDevice(
  deviceId: string,
  cb: (size: number) => void,
): Promise<{ msg: string, deviceId: string, serviceId: string, characteristicId: string }> {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    // H5 端实现
    const device = scannedDevices.get(deviceId)
    if (!device) {
      reject(new Error("设备未找到"))
      return
    }

    device.gatt.connect()
      .then((server) => {
        return server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb")
      })
      .then((service) => {
        return service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb")
      })
      .then((characteristic) => {
        const characteristics = new Map<string, BluetoothRemoteGATTCharacteristic>()
        characteristics.set(characteristic.uuid, characteristic)

        connectedDevices.set(deviceId, {
          device,
          characteristics,
        })

        setConnectedDeviceId(deviceId)
        cb(512) // H5 端默认 MTU

        resolve({
          msg: "连接成功",
          deviceId,
          serviceId: "000018f0-0000-1000-8000-00805f9b34fb",
          characteristicId: characteristic.uuid,
        })
      })
      .catch((err) => {
        console.error("H5 蓝牙连接失败:", err)
        reject(err)
      })
    // #endif

    // #ifndef H5
    // 非 H5 端实现
    stopSearchBluetooth()
    connectBLEDevice(deviceId, cb)
      .then(() => getBLEDeviceServices(deviceId))
      .then((res) => {
        return getBLEDeviceCharacteristics({
          deviceId: res.deviceId,
          serviceId: res.serviceId,
        })
      })
      .then((res) => {
        console.log("ppppp", res)
        resolve(res)
      })
      .catch((e) => {
        reject(e)
      })
    // #endif
  })
}

// 打印
export function bluetoothPrint(params: UniNamespace.WriteBLECharacteristicValueOptions) {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    // H5 端实现
    const { deviceId, characteristicId, value } = params
    const connection = connectedDevices.get(deviceId)

    if (!connection) {
      reject(new Error("设备未连接"))
      return
    }

    const characteristic = connection.characteristics.get(characteristicId)
    if (!characteristic) {
      reject(new Error("特征值未找到"))
      return
    }

    // 将 Uint8Array 转换为 ArrayBuffer
    let arrayBuffer: ArrayBuffer
    if (value instanceof ArrayBuffer) {
      arrayBuffer = value
    }
    else if (value instanceof Uint8Array) {
      arrayBuffer = value.buffer as ArrayBuffer
    }
    else {
      // 处理普通数组
      const uint8Array = new Uint8Array(value as any)
      arrayBuffer = uint8Array.buffer as ArrayBuffer
    }

    characteristic.writeValue(arrayBuffer)
      .then(() => {
        console.log("H5 蓝牙写入成功")
        resolve("success")
      })
      .catch((err: any) => {
        console.error("H5 蓝牙写入失败:", err)
        reject(new Error("写入蓝牙特征值失败"))
      })
    // #endif

    // #ifndef H5
    // 非 H5 端实现
    uni.writeBLECharacteristicValue({
      ...params,
      success(res) {
        console.log("writeBLECharacteristicValue success", res)
        resolve("success")
      },
      fail(res) {
        console.log("writeBLECharacteristicValue fail", res)
        reject(new Error(res.errMsg || "写入蓝牙特征值失败"))
      },
    })
    // #endif
  })
}

function getBLEMTU(deviceId: string): Promise<number> {
  return new Promise((resolve) => {
    // 1. 参数校验：设备ID为空直接返回默认值
    if (!deviceId) {
      console.warn("getBLEMTU: 设备ID为空，使用默认最大发送字节数20")
      resolve(20)
      return
    }

    // 2. 调用获取MTU API
    uni.getBLEMTU({
      deviceId,
      success(res) {
        // 3. 计算最大可发送字节数（MTU-5，协议开销）
        // 兜底：防止MTU过小导致负数，最小保留20字节
        const maxSize = Math.max(res.mtu - 5, 20)
        console.log("最大可发送字节数:", maxSize)
        resolve(maxSize)
      },
      // 4. 失败回调：兼容不支持getBLEMTU的设备/连接异常
      fail(err) {
        console.error("获取BLE MTU失败:", err.errMsg)
        // 失败时返回通用默认值20（兼容所有蓝牙打印机）
        resolve(20)
      },
    })
  })
}
