/**
 * 打印功能 Hook
 * 功能：图片打印、采购清单打印、配送清单打印
 * 支持平台：H5、小程序、App
 */
import type { ComponentInternalInstance, Ref } from "vue"
import { bluetoothPrint, isDeviceConnected, startBLEConnectionStateMonitor } from "@/utils/bluetoothprint/bluetooth"
import PrinterJobs from "@/utils/bluetoothprint/printerjobs"
import { MathUtils } from "@/utils/mathjs"
import dayjs from "dayjs"
import { ref } from "vue"

interface PrintOrderItem {
  name: string
  quantity?: number
  price?: number
  count?: number
  percent?: number
}

interface PrintOrderData {
  clientName: string
  serialNo: string
  createTime: string
  content: PrintOrderItem[]
}

interface PrintOptions {
  title: string
  isPaid?: boolean
  total?: number
  totalPercent?: number
  averagePrice?: number
  averageExceptDeathAndLossPrice?: number
  extraText?: string
}

interface IPrintPurchaseOrderData {
  orderData: PrintOrderData
  options: PrintOptions
}

interface IPrintDistributionOrderData {
  orderData: PrintOrderData
  options: PrintOptions
}

interface IOrderContentItem extends PrintOrderItem {
  quantity: number
  price: number
}

interface IDistributionContent extends PrintOrderItem {
  count: number
  percent: number
  price: number
}


export function usePrint(params: {
  deviceId: Ref<string>
  serviceId: Ref<string>
  characteristicId: Ref<string>
  instance: ComponentInternalInstance
  printerWidth: Ref<number>
}) {
  const { deviceId, serviceId, characteristicId, instance, printerWidth } = params

  // 注册蓝牙连接状态监听
  startBLEConnectionStateMonitor()

  const isPrinting = ref(false) // 打印锁，避免并发打印
  const canvasWidth = ref(0)
  const canvasHeight = ref(0)
  const singleDataSize = ref(20) // 每次循环的数据大小
  const sendTimer = ref<ReturnType<typeof setTimeout> | null>(null) // 打印发送定时器，用于终止打印时清理

  /** 设置单次发送数据大小 */
  function setSingleDataSize(size: number) {
    singleDataSize.value = size
  }

  interface ColumnConfig {
    text: string
    width?: number
    align?: 'left' | 'right'
  }

  /** 计算字符串宽度（中文字符占2个宽度） */
  function getStringWidth(str: string): number {
    if (!str)
      return 0
    let width = 0
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i)
      width += (charCode >= 0x4E00 && charCode <= 0x9FA5) ? 2 : 1
    }
    return width
  }

  /** 格式化表格行（通用方法） */
  function formatTableRowGeneral(columns: ColumnConfig[]): string {
    let result = ""
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]
      const text = column.text || ""
      const columnWidth = column.width || 0
      const align = column.align || 'left'
      const textWidth = getStringWidth(text)

      if (align === 'right' && i < columns.length - 1) {
        const space = Math.max(0, columnWidth - textWidth)
        result += `${" ".repeat(space)}${text}`
      }
      else if (align === 'right' && i === columns.length - 1) {
        result += text
      }
      else {
        result += text
        if (i < columns.length - 1) {
          const space = Math.max(0, columnWidth - textWidth)
          result += " ".repeat(space)
        }
      }
    }
    return result
  }

  /** 格式化表格行（4列） */
  function formatTableRow(col1: string, col2: string, col3: string, col4: string, col1Empth: number = 14, col2Empth: number = 14, col3Empth: number = 16): string {
    return formatTableRowGeneral([
      { text: col1, width: col1Empth },
      { text: col2, width: col2Empth },
      { text: col3, width: col3Empth },
      { text: col4, width: 0, align: 'right' }
    ])
  }

  /** 打印采购清单 */
  async function onPrintPurchaseOrder(cacheData: IPrintPurchaseOrderData) {
    if (isPrinting.value)
      return
    isPrinting.value = true

    // 缓存设备连接参数，避免打印过程中外部修改影响
    const cachedDeviceId = deviceId.value
    const cachedServiceId = serviceId.value
    const cachedCharacteristicId = characteristicId.value

    // 检查缓存的参数是否有效
    if (!cachedDeviceId || !cachedServiceId || !cachedCharacteristicId) {
      console.log("蓝牙连接参数无效，无法打印")
      uni.showToast({
        title: "蓝牙未连接",
        icon: "none",
      })
      isPrinting.value = false
      return
    }


    // 每个任务创建独立的 PrinterJobs 实例
    const printerJobs = new PrinterJobs()

    try {
      const { orderData, options } = cacheData

      printerJobs
        // 公司名称
        .setAlign("TXT_ALIGN_CT")
        .setFontSize(1, 1)
        .setBold(true)
        .println("Test Username")
        .println(options.title)
        .lineFeed(1)

        // 订单信息 - 第一行：订单id和开单人
        .setAlign("TXT_ALIGN_LT")
        .setFontSize(1, 1)
        .setBold(true)
        .println(formatTableRow("客户:", `${orderData.clientName || ""}`, "", `#${orderData.serialNo || ""}`, 0, 14, 19))
        // 第二行：开单时间#
        .println(`开单时间: ${orderData.createTime ? dayjs(orderData.createTime).format("YYYY年MM月DD日 HH:mm:ss") : ""}`)

        // 分隔线
        .println("------------------------------------------------")

        // 通过这种方式去了解一行最多有多少个字符
        // .println("111111111111111111111111111111111111111111111111")
        // .println("aAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaA")
        // .println(",.?!;'\][@#$%^&*()_+")
        // .println("我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我")

        // 表头
        .setBold(true)
        .println(formatTableRow("名称", "数量", "单价", "小计"))
        .setBold(true)

        .setLineSpacing(100)

      // 循环打印商品
      orderData.content.forEach((product: PrintOrderItem) => {
        // 格式化各列数据
        const name = product.name || ""
        const quantity = String(Number(product.quantity) || 0)
        const price = String(Number(product.price) || 0)
        const subtotal = String(Number(MathUtils.multiply(Number(product.price) || 0, Number(product.quantity) || 0)) || 0)

        // 使用格式化方法确保列对齐
        const formattedRow = formatTableRow(name, quantity, price, subtotal)
        printerJobs.println(formattedRow)
      })

      printerJobs
        .resetLineSpacing()
        .setBold(false)
        .println("------------------------------------------------")

        .addQRCode({
          text: "http://zg.xiexiebang.cn",
          size: 6,
        })
        .lineFeed(4)

        // 切纸
        .cutPaperPartial()

      // 等待打印完成
      await handlePrintAsync(printerJobs, cachedDeviceId, cachedServiceId, cachedCharacteristicId)
    }
    catch (error) {
      console.log("打印采购清单失败", error)
      uni.showToast({
        title: "打印失败",
        icon: "none",
      })
    }
    finally {
      isPrinting.value = false
    }
  }

  /** 打印打点单据 */
  async function onPrintDistributionOrder(cacheData: IPrintDistributionOrderData) {
    if (isPrinting.value)
      return
    isPrinting.value = true

    // 缓存设备连接参数，避免打印过程中外部修改影响
    const cachedDeviceId = deviceId.value
    const cachedServiceId = serviceId.value
    const cachedCharacteristicId = characteristicId.value

    // 检查缓存的参数是否有效
    if (!cachedDeviceId || !cachedServiceId || !cachedCharacteristicId) {
      console.log("蓝牙连接参数无效，无法打印")
      uni.showToast({
        title: "蓝牙未连接",
        icon: "none",
      })
      isPrinting.value = false
      return
    }


    // 每个任务创建独立的 PrinterJobs 实例
    const printerJobs = new PrinterJobs()

    try {
      const { orderData, options } = cacheData

      printerJobs
        // 公司名称
        .setAlign("TXT_ALIGN_CT")
        .setFontSize(1, 1)
        .setBold(true)
        .println("Test Username")
        .println(options.title)
        .lineFeed(1)

        // 订单信息 - 第一行：订单id和开单人
        .setAlign("TXT_ALIGN_LT")
        .setFontSize(1, 1)
        .setBold(true)
        .println(formatTableRow("客户:", `${orderData.clientName || ""}`, "", `#${orderData.serialNo || ""}`, 0, 14, 19))
        // 第二行：开单时间
        .println(`开单时间: ${orderData.createTime ? dayjs(orderData.createTime).format("YYYY年MM月DD日 HH:mm:ss") : ""}`)

        // 分隔线
        .println("------------------------------------------------")

        // 表头
        .setBold(true)
        .println(formatTableRow("规格", "数量", "比例", "打点价"))
        .setBold(true)

        .addQRCode({
          text: "http://zg.xiexiebang.cn",
          size: 6,
        })

        .setLineSpacing(100)

      // 循环打印商品
      orderData.content.forEach((product: PrintOrderItem) => {
        // 格式化各列数据
        const name = product.name || ""
        const count = String(Number(product.count) || 0)
        const percent = `${String(Number(product.percent) || 0)}%`
        const price = String(Number(product.price) || 0)

        // 使用格式化方法确保列对齐
        const formattedRow = formatTableRow(name, count, percent, price)
        printerJobs.println(formattedRow)
      })

      printerJobs
        .resetLineSpacing()
        // 分隔线
        .setBold(false)
        .println("------------------------------------------------")
        .setBold(true)
        .println(formatTableRow("数量合计:", String(options.total), "总比例:", `${String(options.totalPercent)}%`))
        .println(`均价:￥${options.averagePrice}`)

      if (options.extraText)
        printerJobs.println(`均价(不含${options.extraText}):￥${options.averageExceptDeathAndLossPrice}`)

      printerJobs.lineFeed(4)

        // 切纸
        .cutPaperPartial()

      // 等待打印完成
      await handlePrintAsync(printerJobs, cachedDeviceId, cachedServiceId, cachedCharacteristicId)
    }
    catch (error) {
      console.log("打印打点单据失败", error)
      uni.showToast({
        title: "打印失败",
        icon: "none",
      })
    }
    finally {
      isPrinting.value = false
    }
  }

  function onPrintTempImg(tempImgPath: string) {
    if (isPrinting.value)
      return
    isPrinting.value = true

    // 缓存设备连接参数，避免打印过程中外部修改影响
    const cachedDeviceId = deviceId.value
    const cachedServiceId = serviceId.value
    const cachedCharacteristicId = characteristicId.value

    // 检查缓存的参数是否有效
    if (!cachedDeviceId || !cachedServiceId || !cachedCharacteristicId) {
      console.log("蓝牙连接参数无效，无法打印")
      uni.showToast({
        title: "蓝牙未连接",
        icon: "none",
      })
      isPrinting.value = false
      return
    }

    // 每个任务创建独立的 PrinterJobs 实例和状态
    const printerJobs = new PrinterJobs()
    let currentTime = 1 // 当前次数
    let looptime = 0 // 总循环次数
    let currentPrint = 1 // 当前打印张数

    const ctx = uni.createCanvasContext("imgCanvas", instance)
    uni.getImageInfo({
      src: tempImgPath,
      success(res) {
        console.log("获取图片信息成功", res)
        // 根据打印机宽度计算图片宽度
        // 80mm 宽打印机 → 可打印宽度约 64mm，打印点数：72 × 8 = 576 点
        // 58mm 宽打印机 → 可打印宽度约 48mm，打印点数：54 × 8 = 432 点
        const actualPrintWidth = printerWidth.value === 80 ? 576 : 432

        // 计算缩放比例
        const scale = actualPrintWidth / res.width
        const newImgW = Math.ceil(res.width * scale)
        const newImgH = Math.ceil(res.height * scale)

        canvasWidth.value = newImgW
        canvasHeight.value = newImgH
        console.log("---------", canvasWidth.value, canvasHeight.value)

        ctx.fillStyle = "rgba(255,255,255,1)"
        ctx.clearRect(0, 0, newImgW, newImgH)
        ctx.fillRect(0, 0, newImgW, newImgH)
        // 进行绘画图片
        ctx.drawImage(tempImgPath, 0, 0, newImgW, newImgH)
        ctx.draw(false, () => {
          setTimeout(() => {
            uni.canvasGetImageData({
              canvasId: "imgCanvas",
              x: 0,
              y: 0,
              width: canvasWidth.value,
              height: canvasHeight.value,
              async success(res) {
                console.log("获取图片数据成功", res)
                printerJobs.convertPartialToBitmap(res)
                printerJobs.println().lineFeed(2)

                // 计算需要发送的总次数
                const dataLength = printerJobs.getLength()
                looptime = Math.ceil(dataLength / singleDataSize.value)
                console.log(`数据长度: ${dataLength}, 单次发送大小: ${singleDataSize.value}, 总发送次数: ${looptime}`)
                uni.showToast({
                  title: `开始打印`,
                  icon: "none",
                })
                handleSend(printerJobs.getQueue())
              },
              fail(err) {
                console.log("获取图片数据失败", err)
                isPrinting.value = false
              },
            })
          }, 1000)
        })
      },
      fail(err) {
        console.log("获取图片信息失败", err)
        isPrinting.value = false
      },
    })

    /** 图片打印发送数据 - 使用闭包访问本地状态和缓存参数 */
    function handleSend(buffer: number[]) {
      if (!isPrinting.value) {
        // 已终止，清理定时器
        if (sendTimer.value) {
          clearTimeout(sendTimer.value)
          sendTimer.value = null
        }
        return
      }

      // console.log("currentTime", currentTime)
      // console.log("looptime", looptime)
      // console.log("currentPrint", currentPrint)

      const buf = new ArrayBuffer(singleDataSize.value)
      const dataView = new DataView(buf)

      for (let i = 0; i < singleDataSize.value; ++i) {
        dataView.setUint8(i, buffer[(currentTime - 1) * singleDataSize.value + i])
      }

      const progress = Number.parseInt(String((currentTime / looptime) * 100))
      if (progress === 25 || progress === 50 || progress === 75 || progress === 100) {
        uni.showToast({
          icon: "none",
          title: `进度${progress}%`,
          mask: true,
        })
      }
      uni.writeBLECharacteristicValue({
        deviceId: cachedDeviceId,
        serviceId: cachedServiceId,
        characteristicId: cachedCharacteristicId,
        value: Array.from(new Uint8Array(buf)),
        fail(e) {
          uni.showToast({
            title: `打印第${currentPrint}张失败`,
            icon: "none",
          })

          isPrinting.value = false
          if (sendTimer.value) {
            clearTimeout(sendTimer.value)
            sendTimer.value = null
          }
        },
        complete() {
          currentTime++
          // console.log(currentTime, looptime)

          if (currentTime <= looptime) {
            // 复用同一个定时器变量，避免创建过多定时器
            if (sendTimer.value) {
              clearTimeout(sendTimer.value)
            }
            sendTimer.value = setTimeout(() => {
              handleSend(buffer)
            }, 10)
          }
          else {
            // currentTime > looptime，说明当前打印任务已完成
            console.log(`打印数据发送完成，准备发送切纸命令 (currentTime: ${currentTime}, looptime: ${looptime})`)
            currentTime = 1
            currentPrint = 1
            uni.showToast({
              title: "打印完成",
              icon: "none",
            })

            // 创建新的 PrinterJobs 实例发送切纸命令
            const cutJobs = new PrinterJobs()
            cutJobs.cutPaperPartial() // 半切命令已包含 ESC @ 重置指令

            const cutBuffer = cutJobs.buffer()
            console.log("切纸命令缓冲区大小:", cutBuffer.byteLength)
            console.log("切纸命令数据:", Array.from(new Uint8Array(cutBuffer)))

            // 单独发送切纸命令（使用缓存的参数）
            uni.writeBLECharacteristicValue({
              deviceId: cachedDeviceId,
              serviceId: cachedServiceId,
              characteristicId: cachedCharacteristicId,
              value: Array.from(new Uint8Array(cutBuffer)),
              success() {
                console.log("切纸命令发送成功")
                isPrinting.value = false
                if (sendTimer.value) {
                  clearTimeout(sendTimer.value)
                  sendTimer.value = null
                }
              },
              fail(e) {
                console.log("切纸命令发送失败", e)
                isPrinting.value = false
                if (sendTimer.value) {
                  clearTimeout(sendTimer.value)
                  sendTimer.value = null
                }
              },
              complete() {
                console.log("切纸命令发送完成")
              },
            })
          }
        },
      })
    }
  }

  /** 异步发送打印数据（用于小票打印） */
  async function handlePrintAsync(
    printerJobs: PrinterJobs,
    cachedDeviceId: string,
    cachedServiceId: string,
    cachedCharacteristicId: string,
  ): Promise<void> {
    const buffer = printerJobs.buffer()
    const maxChunk = 20
    const delay = 20
    const length = buffer.byteLength

    console.log("打印数据数据:", buffer, printerJobs.getQueue())

    for (let i = 0, j = 0; i < length; i += maxChunk, j++) {
      const subPackage = buffer.slice(i, i + maxChunk <= length ? i + maxChunk : length)

      // 检查是否已终止
      if (!isPrinting.value) {
        console.log("打印已终止，停止发送数据")
        throw new Error("打印已终止")
      }

      // 检查蓝牙连接状态
      if (!isDeviceConnected(cachedDeviceId)) {
        console.log("蓝牙连接已断开，停止打印")
        uni.showToast({
          title: "蓝牙连接已断开",
          icon: "none",
        })
        throw new Error("蓝牙连接已断开")
      }

      // 等待延迟后发送
      await new Promise(resolve => setTimeout(resolve, delay))

      try {
        await writeBLECharacteristicValue(subPackage, cachedDeviceId, cachedServiceId, cachedCharacteristicId)
      }
      catch (error) {
        console.log("发送数据失败", error)
        throw error
      }
    }
  }

  /** 写入蓝牙特征值 */
  async function writeBLECharacteristicValue(
    buffer: any,
    cachedDeviceId: string,
    cachedServiceId: string,
    cachedCharacteristicId: string,
  ) {
    const params = {
      deviceId: cachedDeviceId,
      serviceId: cachedServiceId,
      characteristicId: cachedCharacteristicId,
      value: buffer,
    }
    console.log("writeBLECharacteristicValue", params)

    await bluetoothPrint(params)
  }

  /** 终止打印 */
  function stopPrint() {
    if (!isPrinting.value) {
      uni.showToast({
        title: "当前未在打印",
        icon: "none",
      })
      return
    }
    isPrinting.value = false

    // 清理定时器
    if (sendTimer.value) {
      clearTimeout(sendTimer.value)
      sendTimer.value = null
    }

    // 发送切纸命令
    const cachedDeviceId = deviceId.value
    const cachedServiceId = serviceId.value
    const cachedCharacteristicId = characteristicId.value

    if (cachedDeviceId && cachedServiceId && cachedCharacteristicId) {
      console.log("终止打印，延迟后发送切纸命令")

      // 增加延迟时间，确保之前的数据传输完成
      setTimeout(() => {
        console.log("发送切纸命令")

        // 创建新的 PrinterJobs 实例发送切纸命令
        const cutJobs = new PrinterJobs()
        cutJobs.cutPaperPartial() // 半切命令已包含 ESC @ 重置指令

        const cutBuffer = cutJobs.buffer()
        console.log("切纸命令缓冲区大小:", cutBuffer.byteLength)
        console.log("切纸命令数据:", Array.from(new Uint8Array(cutBuffer)))

        // 单独发送切纸命令
        uni.writeBLECharacteristicValue({
          deviceId: cachedDeviceId,
          serviceId: cachedServiceId,
          characteristicId: cachedCharacteristicId,
          value: Array.from(new Uint8Array(cutBuffer)),
          success() {
            console.log("切纸命令发送成功")
          },
          fail(e) {
            console.log("切纸命令发送失败", e)
          },
          complete() {
            console.log("切纸命令发送完成")
          },
        })
      }, 1000) // 增加延迟时间到1000ms，确保之前的数据传输完成
    }

    uni.showToast({
      title: "已终止打印",
      icon: "none",
    })
  }

  return {
    onPrintTempImg,
    onPrintPurchaseOrder,
    onPrintDistributionOrder,
    setSingleDataSize,
    canvasWidth,
    canvasHeight,
    stopPrint,
    isPrinting,
  }
}
