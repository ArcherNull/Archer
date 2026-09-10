<!--
  蓝牙打印页面（极简白风格）
  功能：蓝牙设备连接、图片打印、采购清单打印、配送清单打印
  支持平台：H5、小程序、App
-->
<script setup lang="ts">
import {
  checkH5BluetoothSupport,
  clearConnectedDevice,
  closeBLEConnection,
  closeBluetoothAdapter,
  connectBluetoothDevice,
  getBLEDeviceRSSI,
  getBluetoothDevicesList,
  getIsConnecting,
  isDeviceConnected,
  setConnectedDeviceId,
  setIsConnecting,
  setMaxMTU,
} from "@/utils/bluetoothprint/bluetooth"
import { usePrint } from "@/utils/bluetoothprint/usePrint"
import { getCurrentInstance, ref, computed } from "vue"
import { onLoad, onUnload } from "@dcloudio/uni-app"

const instance = getCurrentInstance()!

interface BlueDeviceItem {
  deviceName: string
  deviceId: string
  status: 0 | 1 | 2 // 0:未连接、1:已连接、2:连接中
  rssi?: number // 信号强度
}

const deviceId = ref("")
const serviceId = ref("")
const characteristicId = ref("")
const blueDeviceList = ref<BlueDeviceItem[]>([])
const reconnectTimer = ref<null | ReturnType<typeof setTimeout>>(null) // 重连定时器
const reconnectCount = ref(0) // 重连次数
const maxReconnectCount = 3 // 最大重连次数
const reconnectingDeviceId = ref<string>("") // 当前正在重连的设备ID，用于防止重连竞争
const tempImgPath = ref("")
const printData = ref<any>(null) // 存储传递过来的打印数据
const printerWidth = ref(80) // 默认 80mm 打印机
const isMonitoringBLEState = ref(false) // 是否已注册蓝牙状态监听

const {
  onPrintTempImg,
  onPrintPurchaseOrder,
  onPrintDistributionOrder,
  setSingleDataSize,
  canvasWidth,
  canvasHeight,
  stopPrint: stopPrintFromUsePrint,
  isPrinting,
} = usePrint({
  deviceId,
  serviceId,
  characteristicId,
  instance,
  printerWidth,
})

/** 重新搜索蓝牙设备 */
function reSearch() {
  // #ifdef H5
  // H5 端直接获取设备列表，不调用 closeBluetoothAdapter
  getDeviceList()
  // #endif

  // #ifndef H5
  closeBluetoothAdapter().then(() => {
    getDeviceList()
  })
  // #endif
}

/** 获取蓝牙列表 */
function getDeviceList(loadingText?: string) {
  uni.showLoading({
    title: loadingText || "搜索蓝牙设备",
    mask: true,
  })
  getBluetoothDevicesList()
    .then((result) => {
      uni.hideLoading()
      blueDeviceList.value = []
      console.log("获取蓝牙列表", result)
      result.forEach((item) => {
        if (item.name && item.name !== "未知设备") {
          blueDeviceList.value.push({
            deviceName: item.name,
            deviceId: item.deviceId,
            status: 0,
          })
        }
      })
    })
    .catch((err) => {
      console.log(err)
      uni.showToast({
        title: "获取蓝牙列表失败",
        icon: "none",
      })
      blueDeviceList.value = []
    })
}

/** 处理选中蓝牙操作 */
function handleConnect(data: BlueDeviceItem) {
  if (data.status === 1) {
    uni.showToast({
      title: "该设备已连接",
      icon: "none",
    })
    return
  }
  if (data.status === 2) {
    uni.showToast({
      title: "有设备连接中，请耐心等待",
      icon: "none",
      mask: true,
    })
    return
  }
  // 使用全局锁防止快速点击
  if (getIsConnecting()) {
    uni.showToast({
      title: "正在连接中，请稍候",
      icon: "none",
    })
    return
  }

  // 如果正在重连其他设备，取消重连
  if (reconnectingDeviceId.value && reconnectingDeviceId.value !== data.deviceId) {
    console.log(`取消对设备 ${reconnectingDeviceId.value} 的重连，开始连接新设备 ${data.deviceId}`)
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }
    reconnectCount.value = 0
    reconnectingDeviceId.value = ""
  }

  const blueDevice = blueDeviceList.value.find(item => item.deviceId === data.deviceId)
  if (blueDevice) {
    blueDevice.status = 2
  }
  connectDevice(data.deviceId).catch(() => {
    // 连接失败，重置状态
    if (blueDevice) {
      blueDevice.status = 0
    }
  })
}

/** 连接蓝牙设备 */
async function connectDevice(_deviceId: string) {
// 连接前检查
  if (getIsConnecting()) {
    console.log("正在连接中，请稍候")
    uni.showToast({
      title: "正在连接中，请稍候",
      icon: "none",
    })
    return Promise.reject(new Error("正在连接中"))
  }

  // 检查是否已连接该设备（优先检查全局状态）
  if (isDeviceConnected(_deviceId)) {
    console.log("设备已连接，跳过连接")
    // 同步局部状态
    if (deviceId.value !== _deviceId) {
      deviceId.value = _deviceId
    }
    return Promise.resolve({ serviceId: serviceId.value, characteristicId: characteristicId.value })
  }

  // 检查是否正在连接其他设备
  if (deviceId.value && deviceId.value !== _deviceId) {
    console.log("正在连接其他设备，先断开当前连接")
    await disconnectDevice()
  }

  // 加锁
  setIsConnecting(true)

  try {
    console.log("开始连接设备: ", _deviceId)
    const result = await connectBluetoothDevice(_deviceId, (size: number) => {
      setSingleDataSize(size)
    })

    // 设置全局连接状态
    setConnectedDeviceId(_deviceId)
    console.log("设备连接成功: ", _deviceId)

    uni.setStorageSync("deviceId", _deviceId)
    uni.showToast({
      title: "蓝牙连接成功",
      icon: "none",
    })
    const blueDevice = blueDeviceList.value.find(item => item.deviceId === _deviceId)
    if (blueDevice) {
      blueDevice.status = 1
      console.log("设备状态已更新为已连接: ", _deviceId)
    }
    const { serviceId: _serviceId, characteristicId: _characteristicId } = result
    deviceId.value = _deviceId
    serviceId.value = _serviceId
    characteristicId.value = _characteristicId
    console.log("连接参数已更新: ", { deviceId: _deviceId, serviceId: _serviceId, characteristicId: _characteristicId })

    // 存储 serviceId 和 characteristicId
    uni.setStorageSync("serviceId", _serviceId)
    uni.setStorageSync("characteristicId", _characteristicId)

    // 获取信号强度
    try {
      const rssiResult = await getBLEDeviceRSSI(_deviceId)
      if (blueDevice) {
        blueDevice.rssi = rssiResult.rssi
        console.log("信号强度已更新: ", rssiResult.rssi)
      }
    }
    catch (error) {
      console.log("获取信号强度失败", error)
    }

    // 重置重连计数和重连设备ID
    reconnectCount.value = 0
    reconnectingDeviceId.value = "" // 连接成功，清除重连设备ID
    console.log("重连计数和重连设备ID已重置")

    // 执行连接成功后的通用流程
    await handleConnectionSuccess(_deviceId, _serviceId, _characteristicId, blueDevice)

    return result
  }
  catch (err) {
    console.error("连接设备失败: ", err)
    uni.showToast({
      title: "连接失败",
      icon: "none",
    })
    const blueDevice = blueDeviceList.value.find(item => item.deviceId === _deviceId)
    if (blueDevice) {
      blueDevice.status = 0
      console.log("设备状态已更新为未连接: ", _deviceId)
    }

    // 清理重连定时器（如果存在）
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
      console.log("已清理重连定时器")
    }

    // 先清理局部状态，再清理全局状态
    deviceId.value = ""
    serviceId.value = ""
    characteristicId.value = ""
    clearConnectedDevice()
    console.log("连接参数已清除")

    // 自动重连前检查是否正在连接
    if (getIsConnecting()) {
      console.log("正在连接中，取消重连")
      return Promise.reject(err)
    }

    // 自动重连
    if (reconnectCount.value < maxReconnectCount) {
      reconnectCount.value++
      reconnectingDeviceId.value = _deviceId // 记录正在重连的设备ID
      console.log(`开始第${reconnectCount.value}次重连: `, _deviceId)
      uni.showToast({
        title: `正在尝试第${reconnectCount.value}次重连`,
        icon: "none",
      })
      reconnectTimer.value = setTimeout(async () => {
        // 检查是否仍然是同一个设备需要重连
        if (reconnectingDeviceId.value !== _deviceId) {
          console.log(`重连设备已改变，取消对 ${_deviceId} 的重连`)
          reconnectCount.value = 0
          return
        }

        // 重连前再次检查状态
        if (!getIsConnecting() && !isDeviceConnected(_deviceId)) {
          // 检查当前是否已连接其他设备
          if (deviceId.value && deviceId.value !== _deviceId) {
            console.log("已连接其他设备，取消重连: ", _deviceId)
            reconnectingDeviceId.value = "" // 清除重连设备ID
            reconnectCount.value = 0 // 重置重连计数
            return
          }

          // 检查是否仍然需要重连（避免状态已改变）
          if (reconnectCount.value === 0) {
            console.log("重连计数已重置，取消重连: ", _deviceId)
            reconnectingDeviceId.value = "" // 清除重连设备ID
            return
          }

          console.log(`执行第${reconnectCount.value}次重连: `, _deviceId)
          try {
            await connectDevice(_deviceId)
          }
          catch (e) {
            console.log(`第${reconnectCount.value}次重连失败: `, e)
          }
        }
        else {
          console.log("设备已连接或正在连接中，取消重连: ", _deviceId)
          reconnectingDeviceId.value = "" // 清除重连设备ID
          reconnectCount.value = 0 // 重置重连计数
        }
      }, 2000)
    }
    else {
      console.log("重连失败，请手动重试: ", _deviceId)
      uni.showToast({
        title: "重连失败，请手动重试",
        icon: "none",
      })
      reconnectingDeviceId.value = "" // 清除重连设备ID
      reconnectCount.value = 0
    }

    return Promise.reject(err)
  }
  finally {
    // 解锁
    setIsConnecting(false)
    console.log("连接锁已释放")
  }
}

/** 主动断开连接 */
async function disconnectDevice() {
  if (!deviceId.value) {
    uni.showToast({
      title: "当前没有连接的设备",
      icon: "none",
    })
    return
  }

  const currentDeviceId = deviceId.value

  try {
    await closeBLEConnection(currentDeviceId)
    const blueDevice = blueDeviceList.value.find(item => item.deviceId === currentDeviceId)
    if (blueDevice) {
      blueDevice.status = 0
      blueDevice.rssi = undefined
    }

    // 清除重连定时器
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }

    // 先清理局部状态，再清理全局状态
    deviceId.value = ""
    serviceId.value = ""
    characteristicId.value = ""
    reconnectCount.value = 0
    clearConnectedDevice()

    uni.showToast({
      title: "已断开连接",
      icon: "none",
    })
  }
  catch (error) {
    console.log("断开连接失败", error)
    // 即使断开失败，也要清理状态（先局部后全局）
    deviceId.value = ""
    serviceId.value = ""
    characteristicId.value = ""
    reconnectCount.value = 0
    clearConnectedDevice()
    uni.showToast({
      title: "断开连接失败",
      icon: "none",
    })
  }
}

/** 检查蓝牙状态并扫描 */
function checkBluetoothAndScan() {
  // #ifdef H5
  if (!checkH5BluetoothSupport()) {
    uni.showToast({
      title: "当前浏览器不支持蓝牙功能",
      icon: "none",
    })
    return
  }
  reSearch()
  // #endif

  // #ifndef H5
  try {
    uni.openBluetoothAdapter({
      success() {
        reSearch()
      },
      fail() {
        uni.showToast({
          title: "请开启蓝牙",
          icon: "none",
        })
      },
    })
  }
  catch (e) {
    uni.showToast({
      title: "不支持使用该功能",
      icon: "none",
    })
  }
  // #endif
}

/** 转换 RSSI 数值为文本描述 */
function getRssiDescription(rssi: number): string {
  if (rssi >= -30) {
    return "极强"
  }
  else if (rssi >= -50) {
    return "强"
  }
  else if (rssi >= -70) {
    return "中等"
  }
  else if (rssi >= -90) {
    return "弱"
  }
  else {
    return "极弱"
  }
}

/** 获取信号强度等级（用于彩色圆点） */
function getRssiLevel(rssi?: number): 'strong' | 'medium' | 'weak' | 'none' {
  if (rssi === undefined) return 'none'
  if (rssi >= -50) return 'strong'
  if (rssi >= -70) return 'medium'
  return 'weak'
}

/** 计算当前步骤进度 */
const currentStep = computed(() => {
  if (deviceId.value && (tempImgPath.value || printData.value)) return 3
  if (deviceId.value) return 2
  return 1
})

/** 检查连接状态并打印临时图片 */
function checkConnectionAndPrint() {
  if (!deviceId.value) {
    uni.showToast({
      title: "请先连接蓝牙设备",
      icon: "none",
    })
    return
  }
  if (!tempImgPath.value) {
    uni.showToast({
      title: "暂无打印图片",
      icon: "none",
    })
    return
  }
  // 不再需要手动设置 isPrinting，usePrint 内部会自动设置
  onPrintTempImg(tempImgPath.value)
}

/** 检查连接状态并打印采购清单 */
function checkConnectionAndPrintPurchaseOrder() {
  if (!deviceId.value) {
    uni.showToast({
      title: "请先连接蓝牙设备",
      icon: "none",
    })
    return
  }
  // 调用采购清单打印函数
  const testData = {
    orderData: {
      clientName: "测试客户",
      serialNo: "TEST001",
      createTime: new Date().toISOString(),
      content: [
        { name: "商品A", quantity: 2, price: 10.5 },
        { name: "商品B", quantity: 3, price: 20.0 },
        { name: "商品C", quantity: 1, price: 15.8 },
      ],
    },
    options: {
      title: "采购清单",
      isPaid: true,
      total: 78.3,
    },
  }
  onPrintPurchaseOrder(testData)
}

/** 选择图片 */
function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success(res) {
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        tempImgPath.value = res.tempFilePaths[0]
        uni.showToast({
          title: "图片选择成功",
          icon: "none",
        })
      }
    },
    fail(err) {
      console.log("选择图片失败", err)
      uni.showToast({
        title: "选择图片失败",
        icon: "none",
      })
    },
  })
}

/** 清除图片 */
function clearImage() {
  tempImgPath.value = ""
  uni.showToast({
    title: "图片已清除",
    icon: "none",
  })
}

/** 终止打印 */
function stopPrint() {
  // 调用 usePrint 中的 stopPrint，已经包含切纸逻辑和提示
  stopPrintFromUsePrint()
}

/** 监听蓝牙连接状态变化 */
function startBLEConnectionStateMonitor() {
  // 避免重复注册监听
  if (isMonitoringBLEState.value) {
    console.log("蓝牙状态监听已注册，跳过")
    return
  }
  isMonitoringBLEState.value = true

  // #ifdef H5
  console.log("H5 端不需要注册蓝牙状态监听")
  // #endif

  // #ifndef H5
  uni.onBLEConnectionStateChange((res) => {
    console.log("蓝牙连接状态变化:", res)
    if (!res.connected) {
      console.log("蓝牙已断开:", res.deviceId)
      // 如果断开的是当前连接的设备
      if (res.deviceId === deviceId.value) {
        // 清理重连定时器
        if (reconnectTimer.value) {
          clearTimeout(reconnectTimer.value)
          reconnectTimer.value = null
        }

        // 重置重连计数
        reconnectCount.value = 0

        // 清理设备列表中的状态
        const blueDevice = blueDeviceList.value.find(item => item.deviceId === res.deviceId)
        if (blueDevice) {
          blueDevice.status = 0
          blueDevice.rssi = undefined
        }

        // 先清理局部状态，再清理全局状态
        deviceId.value = ""
        serviceId.value = ""
        characteristicId.value = ""
        clearConnectedDevice()

        uni.showToast({
          title: "蓝牙已断开",
          icon: "none",
        })
      }
    }
  })
  // #endif
}

/** 处理连接成功后的通用流程 */
async function handleConnectionSuccess(
  _deviceId: string,
  _serviceId: string,
  _characteristicId: string,
  blueDevice: BlueDeviceItem | undefined,
) {
  // #ifdef H5
  // H5 端使用默认 MTU
  console.log("H5 端使用默认 MTU")
  setSingleDataSize(512) // H5 端默认 MTU
  // #endif

  // #ifndef H5
  // 设置MTU（退出重进后需要重新设置）- 使用 await 确保同步完成
  console.log("开始设置MTU")
  try {
    const size = await setMaxMTU(_deviceId, 511)
    console.log("MTU设置完成，单次发送大小:", size)
    setSingleDataSize(size)
  }
  catch (error) {
    console.log("MTU设置失败:", error)
    // 使用默认大小
    setSingleDataSize(20)
  }
  // #endif

  // 自动打印逻辑 - 使用更严格的竞争保护
  if (tempImgPath.value) {
    console.log("有临时图片，准备自动打印")

    // 立即检查打印状态，避免与手动打印竞争
    if (isPrinting.value) {
      console.log("正在打印中，跳过自动打印")
      uni.showToast({
        title: "正在打印中，跳过自动打印",
        icon: "none",
      })
    }
    else {
      // 延迟执行打印
      setTimeout(() => {
        // 再次检查打印状态（可能在此期间用户手动开始打印）
        if (isPrinting.value) {
          console.log("延迟后检测到正在打印，跳过自动打印")
          return
        }

        // 检查设备是否仍然连接
        if (!isDeviceConnected(_deviceId)) {
          console.log("设备已断开，取消自动打印")
          uni.showToast({
            title: "蓝牙已断开，无法自动打印",
            icon: "none",
          })
          return
        }

        // 检查设备参数是否有效
        if (!deviceId.value || !serviceId.value || !characteristicId.value) {
          console.log("设备参数无效，取消自动打印")
          uni.showToast({
            title: "蓝牙连接异常，无法自动打印",
            icon: "none",
          })
          return
        }

        console.log("开始自动打印")
        uni.showToast({
          title: "开始自动打印",
          icon: "none",
        })
        onPrintTempImg(tempImgPath.value)
      }, 1000)
    }
  }

  // 自动打印采购清单
  else if (printData.value) {
    console.log("有采购清单数据，准备自动打印")

    // 立即检查打印状态，避免与手动打印竞争
    if (isPrinting.value) {
      console.log("正在打印中")
      uni.showToast({
        title: "正在打印中",
        icon: "none",
      })
    }
    else {
      // 延迟执行打印
      setTimeout(() => {
        // 再次检查打印状态（可能在此期间用户手动开始打印）
        if (isPrinting.value) {
          console.log("延迟后检测到正在打印，跳过自动打印")
          return
        }

        // 检查设备是否仍然连接
        if (!isDeviceConnected(_deviceId)) {
          console.log("设备已断开，取消自动打印")
          uni.showToast({
            title: "蓝牙已断开，无法自动打印",
            icon: "none",
          })
          return
        }

        // 检查设备参数是否有效
        if (!deviceId.value || !serviceId.value || !characteristicId.value) {
          console.log("设备参数无效，取消自动打印")
          uni.showToast({
            title: "蓝牙连接异常，无法自动打印",
            icon: "none",
          })
          return
        }

        // 根据数据类型判断调用哪个打印方法
        const isDistributionOrder = printData.value?.options?.title.indexOf("打点") !== -1
        const printTitle = printData.value?.options?.title || "单据"
        console.log("开始自动打印", printTitle)
        uni.showToast({
          title: `开始自动打印${printTitle}`,
          icon: "none",
        })
        if (isDistributionOrder) {
          onPrintDistributionOrder(printData.value)
        }
        else {
          onPrintPurchaseOrder(printData.value)
        }
      }, 1000)
    }
  }
}

onLoad((options) => {
  // 启动蓝牙连接状态监听
  startBLEConnectionStateMonitor()

  if (options?.tempImgPath) {
    tempImgPath.value = options.tempImgPath
  }

  if (options?.printData) {
    try {
      printData.value = JSON.parse(decodeURIComponent(options.printData))
      console.log("接收到打印数据:", printData.value)
    }
    catch (error) {
      console.log("解析打印数据失败:", error)
    }
  }
  const savedDeviceId = uni.getStorageSync("deviceId")
  const savedServiceId = uni.getStorageSync("serviceId")
  const savedCharacteristicId = uni.getStorageSync("characteristicId")

  // #ifdef H5
  // H5 端不自动连接存储的设备，需要用户手动扫描
  console.log("H5 端不自动连接存储的设备")
  // #endif

  // #ifndef H5
  if (savedDeviceId && savedDeviceId !== "") {
    // 先检查是否正在连接，避免干扰其他页面的连接流程
    if (getIsConnecting()) {
      console.log("正在连接中，跳过自动连接和状态恢复")
      return
    }

    // 检查是否已连接
    if (isDeviceConnected(savedDeviceId)) {
      console.log("设备已连接，恢复连接状态并执行后续流程")
      // 先恢复局部状态
      deviceId.value = savedDeviceId
      if (savedServiceId) {
        serviceId.value = savedServiceId
      }
      if (savedCharacteristicId) {
        characteristicId.value = savedCharacteristicId
      }
      // 再恢复全局状态
      setConnectedDeviceId(savedDeviceId)

      // 执行连接成功后的通用流程（包括自动打印等）
      handleConnectionSuccess(savedDeviceId, serviceId.value, characteristicId.value, undefined)
      return
    }

    // 尝试自动连接
    uni.openBluetoothAdapter({
      success() {
        connectDevice(savedDeviceId)
      },
      fail() {
        uni.showToast({
          title: "请开启蓝牙",
          icon: "none",
        })
      },
    })
  }
  // #endif
})

onUnload(async () => {
  // 清除重连定时器
  if (reconnectTimer.value) {
    clearTimeout(reconnectTimer.value)
    reconnectTimer.value = null
  }

  // 保留存储的设备ID，以便下次进入页面时可以自动连接
  // 不清除 storage，只在 disconnectDevice 中清除全局状态

  // 先重置页面状态（局部状态），但不清除全局连接状态
  // 因为蓝牙连接可能仍然存在，清除全局状态会导致下次进入时重新连接
  deviceId.value = ""
  serviceId.value = ""
  characteristicId.value = ""
  reconnectCount.value = 0
  blueDeviceList.value = []

  // 重置蓝牙状态监听标志，确保下次进入页面可以重新注册
  isMonitoringBLEState.value = false

  // 不清除全局连接状态，保留蓝牙连接

  console.log("页面退出，资源已清理（保持蓝牙连接）")
})
</script>

<template>
  <view class="page">
    <!-- 顶部步骤指示器 -->
    <view class="steps-bar">
      <view
        class="step-item"
        :class="{ 'step-active': currentStep >= 1, 'step-done': currentStep > 1 }"
      >
        <view class="step-circle">
          <text v-if="currentStep > 1" class="step-check">✓</text>
          <text v-else class="step-num">1</text>
        </view>
        <text class="step-label">搜索设备</text>
      </view>
      <view class="step-line" :class="{ 'step-line-done': currentStep > 1 }" />
      <view
        class="step-item"
        :class="{ 'step-active': currentStep >= 2, 'step-done': currentStep > 2 }"
      >
        <view class="step-circle">
          <text v-if="currentStep > 2" class="step-check">✓</text>
          <text v-else class="step-num">2</text>
        </view>
        <text class="step-label">连接设备</text>
      </view>
      <view class="step-line" :class="{ 'step-line-done': currentStep > 2 }" />
      <view
        class="step-item"
        :class="{ 'step-active': currentStep >= 3 }"
      >
        <view class="step-circle">
          <text class="step-num">3</text>
        </view>
        <text class="step-label">开始打印</text>
      </view>
    </view>

    <!-- 可滚动内容区 -->
    <view class="scroll-content">
      <!-- ====== 第1步：搜索与连接 ====== -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">搜索蓝牙设备</text>
          <text v-if="deviceId" class="section-badge connected-badge">已连接</text>
        </view>

        <!-- 扫描 + 当前状态 -->
        <view class="scan-bar">
          <view class="scan-status">
            <view
              class="status-dot"
              :class="deviceId ? 'dot-green' : 'dot-gray'"
            />
            <text class="status-text">{{ deviceId ? '蓝牙已连接' : '未连接设备' }}</text>
          </view>
          <wd-button size="small" custom-class="scan-btn" @click="checkBluetoothAndScan">
            {{ blueDeviceList.length ? '重新扫描' : '扫描设备' }}
          </wd-button>
        </view>

        <!-- 设备列表 -->
        <view v-if="blueDeviceList.length > 0" class="device-list">
          <view
            v-for="(item, index) in blueDeviceList"
            :key="index"
            class="device-card"
            :class="{ 'device-connected': item.status === 1 && deviceId === item.deviceId }"
            @click="handleConnect(item)"
          >
            <view class="device-left">
              <view class="device-icon">
                <text class="device-icon-text"></text>
              </view>
              <view class="device-info">
                <text class="device-name">{{ item.deviceName }}</text>
                <view class="device-meta">
                  <view class="signal-dot" :class="`signal-${getRssiLevel(item.rssi)}`" />
                  <text class="signal-text">
                    {{ item.rssi !== undefined ? getRssiDescription(item.rssi) : '等待信号' }}
                  </text>
                </view>
              </view>
            </view>
            <view class="device-right">
              <view v-if="item.status === 1 && deviceId === item.deviceId" class="device-status-tag tag-connected">
                已连接
              </view>
              <view v-else-if="item.status === 2" class="device-status-tag tag-connecting">
                <view class="spinner" />
                连接中
              </view>
              <view v-else class="device-action-tag">
                连接
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <view class="empty-icon">
            <text class="empty-icon-text">📡</text>
          </view>
          <text class="empty-title">暂未发现设备</text>
          <text class="empty-desc">请确保打印机已开启并靠近本设备</text>
        </view>

        <!-- 已连接设备的断开按钮 -->
        <view v-if="deviceId" class="disconnect-area">
          <wd-button plain size="small" custom-class="disconnect-btn" @click="disconnectDevice">
            断开连接
          </wd-button>
        </view>
      </view>

      <!-- ====== 第2步：打印设置 ====== -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">打印设置</text>
        </view>
        <view class="setting-row">
          <text class="setting-label">打印机宽度</text>
          <view class="setting-options">
            <view
              class="option-pill"
              :class="{ 'option-pill-active': printerWidth === 58 }"
              @click="printerWidth = 58"
            >
              58mm
            </view>
            <view
              class="option-pill"
              :class="{ 'option-pill-active': printerWidth === 80 }"
              @click="printerWidth = 80"
            >
              80mm
            </view>
          </view>
        </view>
      </view>

      <!-- ====== 第3步：图片打印 ====== -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">图片打印</text>
          <text class="section-sub">支持 JPG / PNG 格式</text>
        </view>

        <!-- 有图片时 -->
        <view v-if="tempImgPath" class="image-card">
          <image :src="tempImgPath" mode="aspectFit" class="image-preview" />
          <view class="image-actions">
            <wd-button size="small" custom-class="img-action-btn secondary-btn" @click="chooseImage">
              重新选择
            </wd-button>
            <wd-button size="small" custom-class="img-action-btn danger-btn" @click="clearImage">
              清除图片
            </wd-button>
          </view>
        </view>

        <!-- 无图片时 -->
        <view v-else class="image-upload-area" @click="chooseImage">
          <view class="upload-icon">
            <text class="upload-icon-text">+</text>
          </view>
          <text class="upload-text">点击选择图片</text>
          <text class="upload-hint">从相册选取或将图片打印到热敏纸</text>
        </view>

        <wd-button
          :disabled="!tempImgPath"
          custom-class="print-action-btn"
          @click="checkConnectionAndPrint"
        >
          打印图片
        </wd-button>
      </view>

      <!-- ====== 第4步：单据打印 ====== -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">单据打印</text>
          <text class="section-sub">采购清单 / 配送清单</text>
        </view>
        <wd-button custom-class="print-action-btn outline-btn" @click="checkConnectionAndPrintPurchaseOrder">
          打印采购清单（测试）
        </wd-button>
      </view>

      <!-- 底部留白，给安全区 -->
      <view class="bottom-spacer" />

      <!-- Canvas 隐藏，仅用于打印数据处理 -->
      <canvas
        class="imgCanvas" canvas-id="imgCanvas"
        :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
// ========== 极简白风格 — 设计系统 ==========
// 主色: #007AFF  辅助: #34C759 / #FF3B30 / #FF9500
// 背景: #FFFFFF  卡片: #F8F9FA  分割: #E5E5EA
// 文字: #1C1C1E (主) / #8E8E93 (副) / #C7C7CC (占位)

.page {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

// ====== 步骤指示器 ======
.steps-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 40rpx 24rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.step-circle {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.step-num,
.step-check {
  font-size: 22rpx;
  font-weight: 600;
  color: #c7c7cc;
  transition: all 0.3s ease;
}

.step-check {
  font-size: 26rpx;
}

.step-label {
  font-size: 22rpx;
  color: #c7c7cc;
  transition: all 0.3s ease;
}

.step-active .step-circle {
  background: #007aff;
}
.step-active .step-num,
.step-active .step-check {
  color: #ffffff;
}
.step-active .step-label {
  color: #007aff;
  font-weight: 500;
}

.step-done .step-circle {
  background: #34c759;
}
.step-done .step-num,
.step-done .step-check {
  color: #ffffff;
}
.step-done .step-label {
  color: #34c759;
}

.step-line {
  width: 60rpx;
  height: 2rpx;
  background: #e5e5ea;
  margin: 0 12rpx;
  margin-bottom: 40rpx;
  transition: all 0.3s ease;
}

.step-line-done {
  background: #34c759;
}

// ====== 可滚动内容区 ======
.scroll-content {
  flex: 1;
  padding: 24rpx 32rpx;
  overflow-y: auto;
  padding-bottom: 40rpx;
}

// ====== 卡片 ======
.section-card {
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1c1c1e;
}

.section-sub {
  font-size: 22rpx;
  color: #8e8e93;
}

.section-badge {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

.connected-badge {
  background: #e8f8ee;
  color: #34c759;
}

// ====== 扫描栏 ======
.scan-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.scan-status {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.dot-green {
  background: #34c759;
  box-shadow: 0 0 8rpx rgba(52, 199, 89, 0.4);
}

.dot-gray {
  background: #c7c7cc;
}

.status-text {
  font-size: 26rpx;
  color: #8e8e93;
}

:deep(.scan-btn) {
  height: 56rpx !important;
  font-size: 24rpx !important;
  padding: 0 24rpx !important;
  border-radius: 28rpx !important;
}

// ====== 设备列表 ======
.device-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.device-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  border: 1rpx solid transparent;
}

.device-card:active {
  transform: scale(0.98);
  opacity: 0.8;
}

.device-connected {
  border-color: #34c759;
  background: #f9fdfa;
}

.device-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  min-width: 0;
}

.device-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: #f0f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-icon-text {
  font-size: 32rpx;
}

.device-info {
  flex: 1;
  min-width: 0;
}

.device-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #1c1c1e;
  display: block;
  line-height: 1.4;
}

.device-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 4rpx;
}

// 信号强度圆点
.signal-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
}

.signal-strong {
  background: #34c759;
}
.signal-medium {
  background: #ff9500;
}
.signal-weak {
  background: #ff3b30;
}
.signal-none {
  background: #c7c7cc;
}

.signal-text {
  font-size: 22rpx;
  color: #8e8e93;
}

// 右侧状态
.device-right {
  flex-shrink: 0;
  margin-left: 16rpx;
}

.device-status-tag {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.tag-connected {
  background: #e8f8ee;
  color: #34c759;
  font-weight: 500;
}

.tag-connecting {
  background: #fff4e5;
  color: #ff9500;
}

.device-action-tag {
  font-size: 24rpx;
  color: #007aff;
  font-weight: 500;
  padding: 6rpx 20rpx;
  border: 1rpx solid #007aff;
  border-radius: 20rpx;
}

// 连接中旋转动画
.spinner {
  width: 16rpx;
  height: 16rpx;
  border: 2rpx solid #ff9500;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// ====== 空状态 ======
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
}

.empty-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.empty-icon-text {
  font-size: 48rpx;
}

.empty-title {
  font-size: 28rpx;
  color: #1c1c1e;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #8e8e93;
  text-align: center;
}

// ====== 断开 ======
.disconnect-area {
  display: flex;
  justify-content: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #e5e5ea;
}

:deep(.disconnect-btn) {
  color: #ff3b30 !important;
  border-color: #ff3b30 !important;
  font-size: 24rpx !important;
  height: 56rpx !important;
  padding: 0 32rpx !important;
  border-radius: 28rpx !important;
}

// ====== 设置行 ======
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-label {
  font-size: 26rpx;
  color: #1c1c1e;
  font-weight: 500;
}

.setting-options {
  display: flex;
  gap: 12rpx;
}

.option-pill {
  padding: 10rpx 28rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #8e8e93;
  background: #ffffff;
  border: 1rpx solid #e5e5ea;
  transition: all 0.2s ease;
}

.option-pill:active {
  transform: scale(0.95);
}

.option-pill-active {
  background: #007aff;
  color: #ffffff;
  border-color: #007aff;
}

// ====== 图片卡片 ======
.image-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 20rpx;
}

.image-preview {
  width: 100%;
  height: 400rpx;
  display: block;
  object-fit: contain;
  background: #f8f9fa;
}

.image-actions {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  justify-content: flex-end;
  border-top: 1rpx solid #f0f0f0;
}

:deep(.img-action-btn) {
  height: 56rpx !important;
  font-size: 24rpx !important;
  padding: 0 24rpx !important;
  border-radius: 28rpx !important;
}

:deep(.secondary-btn) {
  background: #f0f0f0 !important;
  color: #1c1c1e !important;
  border: none !important;
}

:deep(.danger-btn) {
  background: #fff0ef !important;
  color: #ff3b30 !important;
  border: none !important;
}

// ====== 图片上传区域 ======
.image-upload-area {
  background: #ffffff;
  border: 2rpx dashed #e5e5ea;
  border-radius: 16rpx;
  padding: 48rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
  transition: all 0.2s ease;
}

.image-upload-area:active {
  background: #f8f9fa;
  border-color: #007aff;
}

.upload-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f0f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon-text {
  font-size: 40rpx;
  color: #007aff;
  font-weight: 300;
  line-height: 1;
}

.upload-text {
  font-size: 28rpx;
  color: #1c1c1e;
  font-weight: 500;
}

.upload-hint {
  font-size: 22rpx;
  color: #8e8e93;
}

// ====== 操作按钮 ======
:deep(.print-action-btn) {
  width: 100%;
  height: 80rpx !important;
  font-size: 28rpx !important;
  font-weight: 500 !important;
  border-radius: 40rpx !important;
  background: #007aff !important;
  color: #ffffff !important;
  border: none !important;
}

:deep(.print-action-btn[disabled]) {
  opacity: 0.4 !important;
}

:deep(.outline-btn) {
  background: #ffffff !important;
  color: #007aff !important;
  border: 1rpx solid #007aff !important;
}

// ====== 底部留白 ======
.bottom-spacer {
  height: 40rpx;
}

// ====== Canvas ======
.imgCanvas {
  position: absolute;
  left: -9999px;
  top: -9999px;
  visibility: hidden;
}
</style>
