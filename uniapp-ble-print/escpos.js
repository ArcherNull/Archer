/**
 * escpos.js —— ESC/POS 指令构建器(热敏小票 / 票据打印机)
 * ---------------------------------------------------------------------------
 * 适用:58mm / 80mm 热敏票据机(佳博、芯烨、得力、汉印、映美等主流国产机型)
 * 不依赖任何第三方库,输出 Uint8Array,交给 ble-adapter.js 发送。
 *
 * 典型用法:
 *   const cmd = new EscPosBuilder({ paperWidth: 58 })
 *     .init()
 *     .alignCenter().size(1, 1).line('XX 便利店')
 *     .alignLeft().size(0, 0).line('--------------------------------')
 *     .row('可乐 x2', '￥6.00')
 *     .feed(1)
 *     .qrcode('https://example.com/order/123')
 *     .cut();
 *   await printer.print(cmd);
 */
import { encodeGBK } from './gbk-table.js';

const ESC = 0x1b;
const GS = 0x1d;
const FS = 0x1c;

export class EscPosBuilder {
  /**
   * @param {Object} opts
   * @param {number} [opts.paperWidth=58] 纸张宽度 58 或 80(mm),用于计算每行字符数
   * @param {string} [opts.encoding='gbk'] 编码:gbk(默认,国产机通用) / utf8(少数机型)
   * @param {number} [opts.codepage=0] ESC t 代码页,GBK 机型保持 0
   */
  constructor(opts = {}) {
    this.paperWidth = opts.paperWidth || 58;
    this.encoding = opts.encoding || 'gbk';
    this.codepage = opts.codepage ?? 0;
    this._bytes = [];
  }

  // ---------- 内部工具 ----------

  _push(...items) {
    items.forEach((it) => {
      if (Array.isArray(it)) this._bytes.push(...it);
      else if (it instanceof Uint8Array) this._bytes.push(...it);
      else this._bytes.push(it);
    });
    return this;
  }

  _encode(str) {
    if (this.encoding === 'utf8') {
      // 手工 UTF-8 编码,避免依赖 TextEncoder(部分环境不完整)
      const out = [];
      for (const ch of String(str)) {
        const cp = ch.codePointAt(0);
        if (cp < 0x80) out.push(cp);
        else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
        else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        else {
          const c = cp - 0x10000;
          out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
        }
      }
      return out;
    }
    return encodeGBK(String(str));
  }

  /** 每像素行字节数,GS v 0 需要按 8 对齐 */
  static bytesOfWidth(px) {
    return Math.ceil(px / 8);
  }

  // ---------- 基础控制 ----------

  /** 复位打印机,清掉上一次的加粗/字号等状态 —— 每张小票开头必发 */
  init() {
    return this._push(ESC, 0x40);
  }

  /** 设置代码页,GBK 机型无需调用 */
  setCodepage(n) {
    return this._push(ESC, 0x74, n & 0xff);
  }

  /** 走纸 n 行 */
  feed(n = 1) {
    return this._push(ESC, 0x64, n & 0xff);
  }

  /** 对齐:0=左 1=居中 2=右 */
  align(n) {
    return this._push(ESC, 0x61, n & 0xff);
  }
  alignLeft() { return this.align(0); }
  alignCenter() { return this.align(1); }
  alignRight() { return this.align(2); }

  /** 加粗 on/off */
  bold(on = true) {
    return this._push(ESC, 0x45, on ? 1 : 0);
  }

  /** 下划线:0=关 1=单线 2=双线 */
  underline(mode = 1) {
    return this._push(ESC, 0x2d, mode & 0xff);
  }

  /** 反白 */
  inverse(on = true) {
    return this._push(GS, 0x42, on ? 1 : 0);
  }

  /** 字体:A=标准 B=压缩 */
  font(n = 'A') {
    return this._push(ESC, 0x4d, n === 'B' ? 1 : 0);
  }

  /**
   * 字号(width/height 取 0~7,表示倍数减一对应的放大档位)
   * 常用:0x00 正常 / 0x11 双倍高宽
   */
  size(width = 0, height = 0) {
    const w = Math.max(0, Math.min(7, width));
    const h = Math.max(0, Math.min(7, height));
    return this._push(GS, 0x21, (w << 4) | h);
  }

  /** 行高,单位点(默认约 32) */
  lineHeight(n = 32) {
    return this._push(ESC, 0x33, n & 0xff);
  }

  /** 左边距 n 点 */
  marginLeft(n = 0) {
    return this._push(GS, 0x4c, (n & 0xff), ((n >> 8) & 0xff));
  }

  // ---------- 文本 ----------

  /** 输出文本(不换行) */
  text(str) {
    return this._push(this._encode(str));
  }

  /** 输出一行文本并换行 */
  line(str = '') {
    return this.text(str)._push(0x0a);
  }

  /**
   * 左右分栏(商品名 + 金额),自动按纸宽补齐空格
   * 注意:中文占 2 个字符宽度,这里按显示宽度计算
   */
  row(left, right, gap = 1) {
    const cols = this.paperWidth === 80 ? 48 : 32; // 58mm 标准字体约 32 半角字符
    const wOf = (s) => {
      let w = 0;
      for (const ch of String(s)) w += ch.charCodeAt(0) > 0xff ? 2 : 1;
      return w;
    };
    const lw = wOf(left);
    const rw = wOf(right);
    const spaces = Math.max(gap, cols - lw - rw);
    return this.line(left + ' '.repeat(spaces) + right);
  }

  /** 分隔线 */
  divider(ch = '-') {
    const cols = this.paperWidth === 80 ? 48 : 32;
    return this.line(ch.repeat(cols));
  }

  /** 三栏表头 */
  row3(a, b, c, widths = [0.5, 0.2, 0.3]) {
    const cols = this.paperWidth === 80 ? 48 : 32;
    const wOf = (s) => {
      let w = 0;
      for (const ch of String(s)) w += ch.charCodeAt(0) > 0xff ? 2 : 1;
      return w;
    };
    const seg = (s, ratio) => {
      const total = Math.floor(cols * ratio);
      const pad = Math.max(0, total - wOf(s));
      return s + ' '.repeat(pad);
    };
    return this.line(seg(a, widths[0]) + seg(b, widths[1]) + c);
  }

  // ---------- 二维码 ----------

  /**
   * QR 码(使用打印机内建算法,GS ( k)
   * 机型支持率:中高端机基本可用;低端机可能不出图,此时改用 qrcodeAsImage
   * @param {string} content
   * @param {Object} o
   * @param {number} [o.size=8] 模块大小(点),1~16
   * @param {string} [o.ecl='M'] 纠错 L/M/Q/H
   */
  qrcode(content, o = {}) {
    const size = Math.max(1, Math.min(16, o.size || 8));
    const eclMap = { L: 48, M: 49, Q: 50, H: 51 };
    const ecl = eclMap[(o.ecl || 'M').toUpperCase()] || 49;
    const data = this._encode(content);
    const len = data.length + 3;
    const pL = len & 0xff;
    const pH = (len >> 8) & 0xff;

    return this
      ._push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, size)   // 模块大小
      ._push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, ecl)    // 纠错等级
      ._push(GS, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30, data) // 存入数据
      ._push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30);  // 打印
  }

  /**
   * 二维码兜底方案:把已生成的二值化点阵当作图片打印
   * 传入 width/height 相同的位图数据(1 位深,行优先,8 像素/字节,MSB 在前)
   */
  qrcodeAsImage(bitmap, width, height) {
    return this.image({ data: bitmap, width, height });
  }

  // ---------- 条码 ----------

  /**
   * 一维码
   * @param {string} content
   * @param {Object} o
   * @param {string} [o.type='CODE128'] CODE128 / CODE39 / EAN13 / EAN8 / ITF
   * @param {number} [o.height=80] 条码高度(点)
   * @param {number} [o.width=2] 条宽 1~6
   * @param {number} [o.hri=2] 文字位置 0=不打印 1=上 2=下 3=上下
   */
  barcode(content, o = {}) {
    const height = o.height || 80;
    const width = Math.max(1, Math.min(6, o.width || 2));
    const hri = o.hri ?? 2;
    const type = (o.type || 'CODE128').toUpperCase();
    const bytes = this._encode(content);

    if (type === 'CODE128') {
      // GS k 73 n:子集 B 自动切换,内容需以 {B 开头
      const payload = [0x7b, 0x42, ...bytes];
      return this
        ._push(GS, 0x68, height & 0xff)      // 条码高度
        ._push(GS, 0x77, width & 0xff)       // 条宽
        ._push(GS, 0x48, hri & 0xff)         // 文字位置
        ._push(GS, 0x6b, 0x49, payload.length & 0xff, payload);
    }

    const codeMap = { CODE39: 4, ITF: 5, EAN13: 67, EAN8: 68, UPCA: 65, UPCE: 66, CODABAR: 6 };
    const m = codeMap[type];
    if (m === undefined) throw new Error(`暂不支持的条码类型:${type}`);

    this._push(GS, 0x68, height & 0xff)
      ._push(GS, 0x77, width & 0xff)
      ._push(GS, 0x48, hri & 0xff);
    if (m >= 65) {
      return this._push(GS, 0x6b, m, bytes); // EAN/UPC 系列用变长写法
    }
    return this._push(GS, 0x6b, m, bytes, 0x00); // 其余以 0x00 结尾
  }

  // ---------- 图片 ----------

  /**
   * 打印位图(GS v 0)
   * @param {Object} img
   * @param {Uint8Array|number[]|ArrayBuffer} img.data 二值化点阵,行优先,8 像素/字节,MSB 在左
   * @param {number} img.width 位图宽度(像素)
   * @param {number} img.height 位图高度(像素)
   */
  image(img) {
    const data = img.data instanceof Uint8Array ? img.data : new Uint8Array(img.data);
    const height = img.height;
    const xBytes = Math.ceil(img.width / 8); // 每行字节数
    const expected = xBytes * height;
    if (data.length < expected) {
      throw new Error(`位图数据长度不足:期望 ${expected},实际 ${data.length}`);
    }

    const xL = xBytes & 0xff;
    const xH = (xBytes >> 8) & 0xff;
    const yL = height & 0xff;
    const yH = (height >> 8) & 0xff;

    // 大图必须分片发,否则打印机缓冲区溢出会打出一堆乱码
    const MAX_ROWS = 256;
    for (let y = 0; y < height; y += MAX_ROWS) {
      const rows = Math.min(MAX_ROWS, height - y);
      const slice = data.slice(y * xBytes, (y + rows) * xBytes);
      const rL = rows & 0xff;
      const rH = (rows >> 8) & 0xff;
      this._push(GS, 0x76, 0x30, 0x00, xL, xH, rL, rH, slice);
      this._push(0x0a);
    }
    return this;
  }

  /**
   * 从 canvas 取像素并二值化,直接打印
   * @param {Object} o
   * @param {string} o.canvasId uni-app canvas 组件 id
   * @param {number} o.width / o.height 画布尺寸(逻辑像素)
   * @param {number} [o.threshold=128] 灰度阈值,小于该值判为黑
   * @param {Object} [o.comp] vue 组件实例(this)
   */
  async imageFromCanvas(o) {
    const { canvasId, width, height, threshold = 128, comp } = o;
    const res = await new Promise((resolve, reject) => {
      uni.canvasGetImageData({
        canvasId,
        x: 0, y: 0, width, height,
        comp,
        success: resolve,
        fail: reject,
      });
    });
    const bitmap = EscPosBuilder.binarize(res.data, width, height, threshold);
    return this.image({ data: bitmap, width, height });
  }

  /**
   * RGBA 像素 -> 1 位深点阵
   * 透明像素按白色处理;用加权灰度更贴近人眼观感
   */
  static binarize(rgba, width, height, threshold = 128) {
    const bytesPerRow = Math.ceil(width / 8);
    const out = new Uint8Array(bytesPerRow * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const a = rgba[i + 3];
        // 背景若为透明/白色,直接跳过(默认白)
        if (a === 0) continue;
        const lum = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
        if (lum < threshold) {
          out[y * bytesPerRow + (x >> 3)] |= 0x80 >> (x & 7);
        }
      }
    }
    return out;
  }

  // ---------- 收尾 ----------

  /** 切刀:full=true 全切,false 半切;无切刀机型会被忽略 */
  cut(full = true) {
    return this._push(GS, 0x56, full ? 0x00 : 0x01);
  }

  /** 开钱箱(需打印机接了钱箱线) */
  cashbox(pin = 0) {
    return this._push(ESC, 0x70, pin & 0xff, 25, 250);
  }

  /** 蜂鸣 */
  beep(times = 1, duration = 2) {
    return this._push(ESC, 0x42, times & 0xff, duration & 0xff);
  }

  /** 查询打印机状态(需打印机支持并开启回传) */
  queryStatus() {
    return this._push(GS, 0x72, 0x01);
  }

  // ---------- 输出 ----------

  toBytes() {
    return new Uint8Array(this._bytes);
  }

  toArrayBuffer() {
    return this.toBytes().buffer;
  }

  /** 调试用,输出十六进制 */
  toHex() {
    return Array.from(this._bytes).map((b) => b.toString(16).padStart(2, '0')).join(' ');
  }

  reset() {
    this._bytes = [];
    return this;
  }
}

/** 快速生成一张标准小票模板 */
export function buildReceipt(order, opts = {}) {
  const { shopName = '', paperWidth = 58 } = opts;
  const b = new EscPosBuilder({ paperWidth });
  b.init().alignCenter().size(1, 1).bold(true).line(shopName).size(0, 0).bold(false);
  b.alignLeft().divider();
  (order.items || []).forEach((it) => b.row(`${it.name} x${it.qty || 1}`, `￥${Number(it.price || 0).toFixed(2)}`));
  b.divider();
  b.alignRight().line(`合计:￥${Number(order.total || 0).toFixed(2)}`);
  b.alignLeft().line(`订单号:${order.no || ''}`);
  b.line(`时间:${order.time || ''}`);
  if (order.qr) {
    b.feed(1).alignCenter().qrcode(order.qr, { size: 8 });
  }
  b.feed(2).cut();
  return b;
}

export default EscPosBuilder;
