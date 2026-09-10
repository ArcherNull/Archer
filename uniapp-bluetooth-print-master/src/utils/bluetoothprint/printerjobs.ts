/**
 * 打印机指令类
 * 功能：生成打印机指令、格式化打印内容
 * 支持功能：文本打印、图片打印、条码打印、二维码打印、切纸
 */
// @ts-expect-error text-decoding 库自定义 TextEncoder 支持 gb2312 编码
import { TextEncoder } from "text-decoding"
import { commands } from "./commands"

const FONT_SIZE_MAP: { [key: string]: string } = {
  "1*1": "SIZE_NORMAL",
  "1*2": "SIZE_NORMAL_DOUBLE",
  "1*3": "SIZE_NORMAL_TRIPLE",
  "1*4": "SIZE_NORMAL_QUADRUPLE",
  "2*1": "SIZE_DOUBLE_NORMAL",
  "2*2": "SIZE_DOUBLE",
  "2*3": "SIZE_DOUBLE_TRIPLE",
  "2*4": "SIZE_DOUBLE_QUADRUPLE",
  "3*1": "SIZE_TRIPLE_NORMAL",
  "3*2": "SIZE_TRIPLE_DOUBLE",
  "3*3": "SIZE_TRIPLE",
  "3*4": "SIZE_TRIPLE_QUADRUPLE",
  "4*1": "SIZE_QUADRUPLE_NORMAL",
  "4*2": "SIZE_QUADRUPLE_DOUBLE",
  "4*3": "SIZE_QUADRUPLE_TRIPLE",
  "4*4": "SIZE_QUADRUPLE",
}

const BARCODE_TXT_MAP: { [key: number]: string } = {
  0: "BARCODE_TXT_OFF",
  1: "BARCODE_TXT_ABV",
  2: "BARCODE_TXT_BLW",
  3: "BARCODE_TXT_BTH",
}

function transformMmToLH(millimeter: number): number[] {
  const mm = Number(millimeter) || 0
  const n = Math.round(mm * 8)
  return getLHArr(n)
}

function getLHArr(n: number): number[] {
  const number = Number(n) || 0
  const nL = number % 256
  const nH = (number - nL) / 256
  return [nL, nH]
}

interface QRCodeParams {
  /** 二维码对齐方式 */
  align?: "LT" | "CT" | "RT"
  /** 二维码内容 */
  text: string
  /** 二维码模式  */
  mode?: number
  /** 二维码大小  1~16 */
  size?: number
  /** 二维码容错级别 */
  level?: "L" | "M" | "Q" | "H"
}

interface BarcodeParams {
  text: string
  width?: 2 | 3 | 4 | 5 | 6
  height?: number
  textPosition?: number
  type?: string
}

class PrinterJobs {
  private _queue: number[]
  private _encoder: TextEncoder

  /** 初始化打印机指令类 */
  constructor() {
    this._queue = []
    this._encoder = new TextEncoder("gb2312", {
      NONSTANDARD_allowLegacyEncoding: true,
    })
    this._init()
  }

  /** 将指令添加到队列 */
  private _enqueue(cmd: number[]): void {
    this._queue.push(...cmd)
  }

  /** 将文本转换为字节数组 */
  private textToBytes(text: string): number[] {
    const uint8Array = this._encoder.encode(text)
    return Array.from(uint8Array)
  }

  /** 初始化打印机 */
  private _init(): void {
    this._enqueue(commands.UNIT_INIT)
  }

  /** 设置换行 */
  public setLine() {
    this._enqueue(commands.LF)
    console.log(this._queue)
  }

  /** 图像像素点转换为位图 */
  public convertPartialToBitmap(res: UniApp.CanvasGetImageDataRes) {
    const w = res.width
    const h = res.height
    const bitw = Number.parseInt(String((w + 7) / 8)) * 8
    const bith = h
    const pitch = Number.parseInt(String(bitw / 8))
    const bits = new Uint8Array(bith * pitch)

    this._enqueue([29]) // 0x1D
    this._enqueue([118]) // 0x76
    this._enqueue([48]) // 0x30
    this._enqueue([0]) // 0x00
    this._enqueue([Number.parseInt(String(pitch % 256))])
    this._enqueue([Number.parseInt(String(pitch / 256))])
    this._enqueue([Number.parseInt(String(bith % 256))])
    this._enqueue([Number.parseInt(String(bith / 256))])

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const color = res.data[(y * w + x) * 4]
        if (color < 128) {
          bits[Number.parseInt(String(y * pitch + x / 8))] |= 0x80 >> x % 8
        }
      }
    }

    for (let i = 0; i < bits.length; i++) {
      this._enqueue([bits[i]])
    }

    console.log("this._queue", this._queue)
  }

  /** 获取队列长度 */
  public getLength(): number {
    return this._queue.length
  }

  /** 重复指定区间的指令 */
  public repeat(start = 0, end = 0, times = 0): PrinterJobs {
    const interval = this._queue.slice(start, end)
    for (let i = 0; i < times; i++) {
      this._enqueue(interval)
    }
    return this
  }

  /** 添加指令到队列 */
  public add(commands: number[]): PrinterJobs {
    this._enqueue(commands)
    return this
  }

  /** 添加文本内容 */
  public text(content: string): PrinterJobs {
    if (content) {
      const uint8Array = this._encoder.encode(content)
      const encoded = Array.from(uint8Array)
      this._enqueue(encoded as number[])
    }
    return this
  }

  /** 打印到末尾 */
  public printToEnd(): PrinterJobs {
    this._enqueue(commands.GS_FF)
    return this
  }

  /** 设置对齐方式 */
  public setAlign(align: "TXT_ALIGN_LT" | "TXT_ALIGN_CT" | "TXT_ALIGN_RT"): PrinterJobs {
    this._enqueue(commands.TEXT_FORMAT[align])
    return this
  }

  /** 设置字体 */
  public setFont(family: "TXT_FONT_A" | "TXT_FONT_B" | "TXT_FONT_C"): PrinterJobs {
    this._enqueue(commands.TEXT_FORMAT[family])
    return this
  }

  /** 设置页面宽度 */
  public setPageWidth(width: number) {
    this._enqueue(commands.PAGE_WIDTH.SET_WIDTH(width))
    return this
  }

  /** 设置图片 */
  public setImage(content: any): PrinterJobs {
    const cmds = ([] as number[]).concat(
      [27, 97, 1],
      [29, 118, 48, 0, 30, 0, 240, 0],
      content,
      [27, 74, 3],
      [27, 64],
    )
    this._enqueue(cmds)
    this._enqueue(commands.LF)
    return this
  }

  /** 设置字体大小 */
  public setFontSize(width = 1, height = 1): PrinterJobs {
    const sizeStr = `${width}*${height}`
    const fontSize = FONT_SIZE_MAP[sizeStr] || "SIZE_NORMAL"
    // @ts-expect-error 动态索引访问，key 为字符串
    this._enqueue(commands.TEXT_FORMAT[fontSize])
    return this
  }

  /** 设置加粗 */
  public setBold(bold: boolean): PrinterJobs {
    if (typeof bold !== "boolean") {
      bold = true
    }
    this._enqueue(bold ? commands.TEXT_FORMAT.TXT_BOLD_ON : commands.TEXT_FORMAT.TXT_BOLD_OFF)
    return this
  }

  /** 设置下划线 */
  public setUnderline(underline: boolean): PrinterJobs {
    if (typeof underline !== "boolean") {
      underline = true
    }
    this._enqueue(
      underline ? commands.TEXT_FORMAT.TXT_UNDERL_ON : commands.TEXT_FORMAT.TXT_UNDERL_OFF,
    )
    return this
  }

  /** 设置行间距 */
  public setLineSpacing(height: number): PrinterJobs {
    this._enqueue(commands.LINE_SPACING.LS_SET)
    this._enqueue([height])
    return this
  }

  /** 重置行间距 */
  public resetLineSpacing(): PrinterJobs {
    this._enqueue(commands.LINE_SPACING.LS_DEFAULT)
    return this
  }

  /** 换行 */
  public lineFeed(n = 1): PrinterJobs {
    return this.text(Array.from({ length: n }).fill(commands.EOL).join(""))
  }

  /** 清空队列 */
  public clear(): PrinterJobs {
    this._queue = Array.from(commands.HARDWARE.HW_INIT)
    return this
  }

  /** 获取 ArrayBuffer 格式的数据 */
  public buffer(): ArrayBuffer {
    return new Uint8Array(this._queue).buffer
  }

  /** 获取指令队列 */
  public getQueue(): number[] {
    return this._queue
  }

  /** 设置打印区域 */
  public setArea(x = 0, y = 0, width = 104, height = 128): PrinterJobs {
    this._enqueue(commands.AREA)
    this._enqueue(transformMmToLH(x))
    this._enqueue(transformMmToLH(y))
    this._enqueue(transformMmToLH(width))
    this._enqueue(transformMmToLH(height))
    return this
  }

  /** 设置打印位置 */
  public setPosition(left = 0, top = 0): PrinterJobs {
    this._enqueue(commands.POSITION.LEFT)
    this._enqueue(transformMmToLH(left))
    this._enqueue(commands.POSITION.TOP)
    this._enqueue(transformMmToLH(top))
    return this
  }

  /** 添加二维码 */
  public addQRCode(params: QRCodeParams): PrinterJobs {
    const { text, mode = 3, size = 6, level = "M", align = "CT" } = params
    if (text) {
      // 步骤 1: 设置对齐方式 (ESC a n)
      // 0: 左对齐, 1: 居中, 2: 右对齐
      const alignMap: { [key: string]: number } = { LT: 0, CT: 1, RT: 2 }
      this._enqueue([27, 97, alignMap[align]])

      // 步骤 2: 设置二维码类型 - GS Z n (n=2 表示 QRCODE)
      // QRCODE 类型值为 102，所以 n = 102 - 100 = 2
      this._enqueue([29, 90, 2])

      // 步骤 3: 设置二维码参数 - ESC Z n1 n2 n3
      // n1: 版本/类型 (2)
      // n2: 纠错级别 (3)
      // n3: 模块大小 (6)
      this._enqueue([27, 90, mode, level === "L" ? 1 : level === "M" ? 2 : level === "Q" ? 3 : 4, size])

      // 步骤 4: 写入数据
      // 先获取数据字节数组
      const dataBytes = this.textToBytes(text)

      // 计算数据长度
      const dataLen = dataBytes.length
      const lenLow = dataLen % 256
      const lenHigh = Math.floor(dataLen / 256)

      // 发送数据长度（低位在前，高位在后）
      this._enqueue([lenLow, lenHigh])

      // 发送实际数据
      this._enqueue(dataBytes)

      // 步骤 5: 恢复左对齐 (可选)
      this._enqueue([27, 97, 0])

      // 步骤 6: 换行 (可选)
      this._enqueue([10, 10])
    }
    return this
  }

  /** 添加图片 */
  public addImage(params: { width: number, height: number }): PrinterJobs {
    const { width, height } = params
    const xl = width % 256
    const xh = Math.floor((width - xl) / 256)
    this._enqueue([29, 118, 48, 0, xl, xh, 1, 0])
    return this
  }

  /** 添加条形码 */
  public addBarcode(params: BarcodeParams): PrinterJobs {
    const { text, width = 2, height = 15, textPosition = 0, type = "CODE39" } = params
    if (text) {
      const ht = Math.round(height * 8)
      this._enqueue(commands.BARCODE_FORMAT.BARCODE_HEIGHT(ht))
      this._enqueue(commands.BARCODE_FORMAT.BARCODE_WIDTH(width))
      const textPosKey = BARCODE_TXT_MAP[textPosition]
      // @ts-expect-error 动态索引访问，key 为字符串
      this._enqueue(commands.BARCODE_FORMAT[textPosKey])
      // @ts-expect-error 动态索引访问，key 为变量
      this._enqueue(commands.BARCODE_FORMAT[`BARCODE_${type}`])
      if (type === "CODE128") {
        const len = text.length
        const nL = len % 256
        this._enqueue([nL])
        this.text(text)
      }
      else {
        this.text(text)
        this._enqueue([0])
      }
    }
    return this
  }

  /** 打印一行文本并换行 */
  public println(content?: string): PrinterJobs {
    if (content) {
      this.text(content)
      this._enqueue(commands.LF)
    }
    else {
      this._enqueue(commands.ESC)
      this._enqueue([0])
    }
    return this
  }

  /** 打印 */
  public print(): PrinterJobs {
    this._enqueue(commands.FF)
    return this
  }

  /** 打印页面 */
  public printPage(): PrinterJobs {
    this._enqueue(commands.ESC_FF)
    return this
  }

  /** 全切（彻底切断纸张） */
  public cutPaperFull(): PrinterJobs {
    this._enqueue([29, 86, 0]) // GS V 0
    return this
  }

  /** 半切（留一点连接，方便撕纸） */
  public cutPaperPartial(): PrinterJobs {
    this._enqueue([29, 86, 1]) // GS V 1 - 半切指令
    this._enqueue([0x1B, 0x40]) // ESC @ - 清除打印机缓冲区
    return this
  }

  /** 通用切纸（走纸到切纸位置并切纸） */
  public cutPaper(): PrinterJobs {
    this._enqueue([27, 105]) // ESC i
    return this
  }
}

export default PrinterJobs
