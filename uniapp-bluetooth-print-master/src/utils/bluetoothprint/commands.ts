/**
 * Utility function that converts numbers into hex values
 *
 * @usage:
 *   numToHex(256) => '0100'
 *   numToHex(0) => '00'
 */

// 将数字转换为十六进制字符串的工具函数
// 用法示例:
// numToHexString(256) => '0100'
// numToHexString(0) => '00'
const numToHexString = function (value: number | string) {
  value = +value
  if (!Number.isNaN(value)) {
    value = value.toString(16)
    while (value.length % 2 !== 0) {
      value = `0${value}`
    }
  }
  return value
}

/** 文字转十六进制 */
export function stringToHex(str: string) {
  let hex = ""
  for (let i = 0; i < str.length; i++) {
    hex += `${str.charCodeAt(i).toString(16)}`
  }
  return hex
}

/** 十六进制转十进制 */
export function hexToDecimal(byteString: string) {
  const byteDecimalValues = []
  for (let i = 0; i < byteString.length; i++) {
    const decimalValue = byteString.charCodeAt(i)
    byteDecimalValues.push(decimalValue)
  }
  return byteDecimalValues
}

/** 十进制转十六进制 */
export function decimalsToHexStrings(decimals: number[]) {
  const decimalToHex = (decimal: number) => {
    // 使用toString(16)将十进制转换为十六进制字符串
    // 然后使用padStart来确保结果是两位的（如果需要的话）
    return decimal.toString(16).toUpperCase().padStart(2, "0")
  }
  return decimals.map(decimalToHex)
}

// 以下皆为16进制
// 特殊控制字符
// export const LF = "\x0a"; // 换行
// export const FS = "\x1c"; // 文件分隔符
// export const FF = "\x0c"; // 换页
// export const GS = "\x1d"; // 组分隔符
// export const DLE = "\x10"; // 数据链路转义符
// export const EOT = "\x04"; // 传输结束
// export const NUL = "\x00"; // 空字符
// export const ESC = "\x1b"; // 转义
// export const TAB = "\x74"; // 水平制表符
// export const EOL = "\n"; // 换行符
// export const GS_FF = "\x1d\x0c";
// export const ESC_FF = "\x1b\x0c";
// export const UNIT_INIT = "\x1d\x50\xcb\xcb";
// export const AREA = "\x1b\x57";

// 定义常量 以下全是十进制
export const commands = {
  LF: [10], // 换行
  FS: [28], // 文件分隔符
  FF: [12], // 换页
  GS: [29], // 组分隔符
  DLE: [16], // 数据链路转义符
  EOT: [4], // 传输结束
  NUL: [0], // 空字符
  ESC: [27], // 转义
  TAB: [116], // 水平制表符
  EOL: "\n", // 换行符
  GS_FF: [29, 12],
  ESC_FF: [27, 12],
  UNIT_INIT: [27, 64], // 初始化打印机
  //   UNIT_INIT: [29, 80, 203, 203],
  AREA: [27, 87],

  // 进纸控制序列
  FEED_CONTROL_SEQUENCES: {
    CTL_LF: [10], // 打印并换行
    CTL_GLF: [74, 0], // 打印并进纸（无空行）
    CTL_FF: [12], // 换页
    CTL_CR: [13], // 回车
    CTL_HT: [9], // 水平制表符
    CTL_VT: [11], // 垂直制表符
  },

  PAGE_MODE: {
    PAGE_MODE_L: [27, 76], // ESC L 标准模式
    PAGE_MODE_W: [27, 87], // ESC W 页面模式
  },

  PAGE_WIDTH: {
    SET_WIDTH(width: number) {
      return [29, 87, width]
    },
  },

  // 字符间距
  CHARACTER_SPACING: {
    CS_DEFAULT: [27, 32, 0], // 默认字符间距
    CS_SET: [27, 32], // 设置字符间距
  },

  // 行间距
  LINE_SPACING: {
    LS_DEFAULT: [27, 50], // 默认行间距
    LS_SET: [27, 51], // 设置行间距
  },

  // 硬件控制
  HARDWARE: {
    HW_INIT: [27, 64], // 清除缓冲区并重置模式
    HW_SELECT: [27, 61, 1], // 选择打印机
    HW_RESET: [27, 63, 10, 0], // 重置打印机硬件
  },

  // 钱箱控制
  CASH_DRAWER: {
    CD_KICK_2: [27, 112, 0, 25, 120], // 向引脚2发送脉冲
    CD_KICK_5: [27, 112, 1, 25, 120], // 向引脚5发送脉冲
  },

  // 纸张边距
  MARGINS: {
    BOTTOM: [27, 79], // 设置底部边距
    LEFT: [27, 108], // 设置左边距
    RIGHT: [27, 81], // 设置右边距
  },

  // 切纸
  PAPER: {
    PAPER_FULL_CUT: [29, 86, 0], // 全切纸
    PAPER_PART_CUT: [29, 86, 1], // 部分切纸
    PAPER_CUT_A: [29, 86, 65], // 部分切纸
    PAPER_CUT_B: [29, 86, 66], // 部分切纸
    STAR_FULL_CUT: [27, 100, 2], // STAR 打印机 - 全切纸
  },

  // 文本格式
  TEXT_FORMAT: {
    TXT_NORMAL: [27, 33, 0], // 正常文本
    TXT_2HEIGHT: [27, 33, 16], // 双倍高度文本
    TXT_2WIDTH: [27, 33, 32], // 双倍宽度文本
    TXT_4SQUARE: [27, 33, 48], // 双倍宽度和高度文本
    STAR_TXT_EMPHASIZED: [27, 69], // STAR 打印机 - 选择加粗打印
    STAR_CANCEL_TXT_EMPHASIZED: [27, 70], // STAR 打印机 - 取消加粗打印

    // 字体大小设置
    SIZE_NORMAL: [29, 33, 0],
    SIZE_NORMAL_DOUBLE: [29, 33, 1],
    SIZE_NORMAL_TRIPLE: [29, 33, 2],
    SIZE_NORMAL_QUADRUPLE: [29, 33, 3],
    SIZE_DOUBLE_NORMAL: [29, 33, 16],
    SIZE_DOUBLE: [29, 33, 17],
    SIZE_DOUBLE_TRIPLE: [29, 33, 18],
    SIZE_DOUBLE_QUADRUPLE: [29, 33, 19],
    SIZE_TRIPLE_NORMAL: [29, 33, 32],
    SIZE_TRIPLE_DOUBLE: [29, 33, 33],
    SIZE_TRIPLE: [29, 33, 34],
    SIZE_TRIPLE_QUADRUPLE: [29, 33, 35],
    SIZE_QUADRUPLE_NORMAL: [29, 33, 48],
    SIZE_QUADRUPLE_DOUBLE: [29, 33, 49],
    SIZE_QUADRUPLE_TRIPLE: [29, 33, 50],
    SIZE_QUADRUPLE: [29, 33, 51],

    // 自定义文本大小
    // TXT_CUSTOM_SIZE: function (width: number, height: number) {
    //   width = width > 8 ? 8 : width;
    //   width = width < 1 ? 1 : width;
    //   height = height > 8 ? 8 : height;
    //   height = height < 1 ? 1 : height;

    //   var widthDec = (width - 1) * 16; // 范围1-8
    //   var heightDec = height - 1; // 范围1-8
    //   var sizeDec = widthDec + heightDec;
    //   return "\x1d\x21" + String.fromCharCode(sizeDec);
    // },

    // 文本高度
    TXT_HEIGHT: {
      1: [0],
      2: [1],
      3: [2],
      4: [3],
      5: [4],
      6: [5],
      7: [6],
      8: [7],
    },

    // 文本宽度
    TXT_WIDTH: {
      1: [0],
      2: [16],
      3: [32],
      4: [48],
      5: [64],
      6: [80],
      7: [96],
      8: [112],
    },

    // 下划线
    TXT_UNDERL_OFF: [27, 45, 0], // 关闭下划线
    TXT_UNDERL_ON: [27, 45, 1], // 1点下划线
    TXT_UNDERL2_ON: [27, 45, 2], // 2点下划线

    // 加粗
    TXT_BOLD_OFF: [27, 69, 0], // 关闭加粗
    TXT_BOLD_ON: [27, 69, 1], // 开启加粗

    // 斜体
    TXT_ITALIC_OFF: [27, 53], // 关闭斜体
    TXT_ITALIC_ON: [27, 52], // 开启斜体

    // 字体类型
    TXT_FONT_A: [27, 77, 0], // 字体类型 A
    TXT_FONT_B: [27, 77, 1], // 字体类型 B
    TXT_FONT_C: [27, 77, 2], // 字体类型 C

    // 对齐方式
    TXT_ALIGN_LT: [27, 97, 0], // 左对齐
    TXT_ALIGN_CT: [27, 97, 1], // 居中对齐
    TXT_ALIGN_RT: [27, 97, 2], // 右对齐

    // STAR 打印机的对齐方式
    STAR_TXT_ALIGN_LA: [27, 29, 97, 0], // 左对齐
    STAR_TXT_ALIGN_CA: [27, 29, 97, 1], // 居中对齐
    STAR_TXT_ALIGN_RA: [27, 29, 97, 2], // 右对齐
  },

  POSITION: {
    LEFT: [27, 36],
    TOP: [29, 36],
  },

  // Qsprinter 兼容性命令
  MODEL: {
    QSPRINTER: {
      BARCODE_MODE: {
        ON: [29, 69, 67, 1], // 条码模式开启
        OFF: [29, 69, 67, 0], // 条码模式关闭
      },
      BARCODE_HEIGHT_DEFAULT: [29, 104, 162], // 条码默认高度：162
      CODE2D_FORMAT: {
        PIXEL_SIZE: {
          CMD: [27, 35, 35, 81, 80, 73, 88], // 像素大小命令
          MIN: 1,
          MAX: 24,
          DEFAULT: 12,
        },
        VERSION: {
          CMD: [29, 40, 107, 3, 0, 49, 67], // 版本命令
          MIN: 1,
          MAX: 16,
          DEFAULT: 3,
        },
        LEVEL: {
          CMD: [29, 40, 107, 3, 0, 49, 69], // 容错级别命令
          OPTIONS: {
            L: 48, // 7% 容错级别
            M: 49, // 15% 容错级别
            Q: 50, // 25% 容错级别
            H: 51, // 30% 容错级别
          },
        },
        LEN_OFFSET: 3, // 长度偏移量
        SAVEBUF: {
          CMD_P1: [29, 40, 107], // 保存缓冲区命令 P1
          CMD_P2: [49, 80, 48], // 保存缓冲区命令 P2
        },
        PRINTBUF: {
          CMD_P1: [29, 40, 107], // 打印缓冲区命令 P1
          CMD_P2: [49, 81, 48], // 打印缓冲区命令 P2
        },
      },
    },
  },

  BARCODE_FORMAT: {
    BARCODE_TXT_OFF: [29, 72, 0], // HRI字符关闭
    BARCODE_TXT_ABV: [29, 72, 1], // HRI字符在条码上方
    BARCODE_TXT_BLW: [29, 72, 2], // HRI字符在条码下方
    BARCODE_TXT_BTH: [29, 72, 3], // HRI字符在条码上下方

    BARCODE_FONT_A: [29, 102, 0], // HRI字符字体A
    BARCODE_FONT_B: [29, 102, 1], // HRI字符字体B

    BARCODE_HEIGHT(height: number) {
      // 设置条码高度 [1-255]
      return [29, 104, height]
    },
    BARCODE_WIDTH(width: 2 | 3 | 4 | 5 | 6) {
      // Barcode Width  [2-6]
      return [29, 119, width]
    },
    // BARCODE_WIDTH: {
    //   1: [29, 119, 2], // 条码宽度 1
    //   2: [29, 119, 3], // 条码宽度 2
    //   3: [29, 119, 4], // 条码宽度 3
    //   4: [29, 119, 5], // 条码宽度 4
    //   5: [29, 119, 6], // 条码宽度 5
    // },
    BARCODE_HEIGHT_DEFAULT: [29, 104, 100], // 条码默认高度: 100
    BARCODE_WIDTH_DEFAULT: [29, 119, 1], // 条码默认宽度: 1

    BARCODE_UPC_A: [29, 107, 0], // 条码类型 UPC-A
    BARCODE_UPC_E: [29, 107, 1], // 条码类型 UPC-E
    BARCODE_EAN13: [29, 107, 2], // 条码类型 EAN13
    BARCODE_EAN8: [29, 107, 3], // 条码类型 EAN8
    BARCODE_CODE39: [29, 107, 4], // 条码类型 CODE39
    BARCODE_ITF: [29, 107, 5], // 条码类型 ITF
    BARCODE_NW7: [29, 107, 6], // 条码类型 NW7
    BARCODE_CODE93: [29, 107, 72], // 条码类型 CODE93
    BARCODE_CODE128: [29, 107, 73], // 条码类型 CODE128
  },

  //   CODE2D_FORMAT: {
  //     TYPE_PDF417: "\x1d" + "Z" + "\x00", // PDF417条码类型
  //     TYPE_DATAMATRIX: "\x1d" + "Z" + "\x01", // DataMatrix条码类型
  //     TYPE_QR: "\x1d" + "Z" + "\x02", // QR条码类型
  //     CODE2D: "\x1b" + "Z", // 2D条码通用命令
  //     QR_LEVEL_L: "L", // QR纠错等级L（7%）
  //     QR_LEVEL_M: "M", // QR纠错等级M（15%）
  //     QR_LEVEL_Q: "Q", // QR纠错等级Q（25%）
  //     QR_LEVEL_H: "H", // QR纠错等级H（30%）
  //   },

  IMAGE_FORMAT: {
    S_RASTER_N: [29, 118, 48, 0], // 设置光栅图像正常大小
    S_RASTER_2W: [29, 118, 48, 1], // 设置光栅图像双倍宽度
    S_RASTER_2H: [29, 118, 48, 2], // 设置光栅图像双倍高度
    S_RASTER_Q: [29, 118, 48, 3], // 设置光栅图像四倍大小
  },

  BITMAP_FORMAT: {
    BITMAP_S8: [27, 42, 0], // 选择8点单密度位图模式
    BITMAP_D8: [27, 42, 1], // 选择8点双密度位图模式
    BITMAP_S24: [27, 42, 32], // 选择24点单密度位图模式
    BITMAP_D24: [27, 42, 33], // 选择24点双密度位图模式
  },

  GSV0_FORMAT: {
    GSV0_NORMAL: [29, 118, 48, 0], // 正常大小的图像格式
    GSV0_DW: [29, 118, 48, 1], // 双倍宽度的图像格式
    GSV0_DH: [29, 118, 48, 2], // 双倍高度的图像格式
    GSV0_DWDH: [29, 118, 48, 3], // 双倍宽度和高度的图像格式
  },

  BEEP: [27, 66], // 打印机蜂鸣器命令

  COLOR: {
    0: [27, 114, 0], // 黑色
    1: [27, 114, 1], // 红色
    REVERSE: [29, 66, 49], // 反转颜色（白字黑底）
    UNREVERSE: [29, 66, 48], // 取消反转（黑字白底）
  },
}
