/**
 * tspl.js —— TSPL 指令构建器(标签打印机)
 * ---------------------------------------------------------------------------
 * 适用:TSC / 佳博 2120TU / 汉印 等标签机。指令语法与 ESC/POS 完全不同,
 * 二者不可混用 —— 票据机发 TSPL 会吐乱码,标签机发 ESC/POS 只会走纸。
 *
 * 单位说明:TSPL 默认以 dot 为单位,200 DPI 下 1mm ≈ 8 dot,300 DPI 下 1mm ≈ 12 dot。
 * 本类提供 mm() 辅助方法,按当前 DPI 自动换算。
 *
 * 典型用法:
 *   const cmd = new TsplBuilder({ width: 40, height: 30, dpi: 200 })
 *     .cls()
 *     .text(2, 2, '顺丰速运', { font: 'TSS24.BF2', xmul: 2, ymul: 2 })
 *     .barcode(2, 12, 'SF1234567890', { height: 60 })
 *     .qrcode(2, 24, 'https://example.com')
 *     .print(1);
 *   await printer.print(cmd);
 */
import { encodeGBK } from './gbk-table.js';

export class TsplBuilder {
  /**
   * @param {Object} opts
   * @param {number} [opts.width=40] 标签宽度(mm)
   * @param {number} [opts.height=30] 标签高度(mm)
   * @param {number} [opts.gap=2] 标签间距(mm),0 表示连续纸
   * @param {number} [opts.dpi=200] 打印分辨率
   * @param {number} [opts.density=8] 打印浓度 0~15
   * @param {number} [opts.direction=0] 打印方向 0/1,打印内容倒过来时改成 1
   */
  constructor(opts = {}) {
    this.width = opts.width || 40;
    this.height = opts.height || 30;
    this.gap = opts.gap ?? 2;
    this.dpi = opts.dpi || 200;
    this.density = opts.density ?? 8;
    this.direction = opts.direction ?? 0;
    this._cmds = [];
  }

  /** mm -> dot */
  mm(v) {
    return Math.round((v * this.dpi) / 25.4);
  }

  _push(line) {
    this._cmds.push(line);
    return this;
  }

  /** 必须最先发送的设置指令,自动拼在输出最前面 */
  _header() {
    const head = [
      `SIZE ${this.width} mm,${this.height} mm`,
      `GAP ${this.gap} mm,0 mm`,
      `DENSITY ${this.density}`,
      `DIRECTION ${this.direction}`,
      `REFERENCE 0,0`,
      `OFFSET 0 mm`,
      `SET PEEL OFF`,
      `SET TEAR ON`,
      `CODEPAGE UTF-8`, // 配合下方 GBK 字节流,多数国产标签机识别正常
    ];
    if (this.gap === 0) head[1] = `GAP 0 mm,0 mm`;
    return head;
  }

  /** 清空缓冲区,每个标签开头调用 */
  cls() {
    return this._push('CLS');
  }

  /**
   * 文本
   * @param {number} x mm
   * @param {number} y mm
   * @param {string} content 支持中文(自动 GBK 编码)
   * @param {Object} o
   * @param {string} [o.font='TSS24.BF2'] TSS24.BF2 简体中文 24x24;TSS16.BF2 简体 16x16
   * @param {number} [o.rotation=0] 0/90/180/270
   * @param {number} [o.xmul=1] 横向放大 1~10
   * @param {number} [o.ymul=1] 纵向放大 1~10
   * @param {string} [o.align] 'center' 时自动按标签宽度居中(仅 rotation=0 有效)
   */
  text(x, y, content, o = {}) {
    const font = o.font || 'TSS24.BF2';
    const rot = o.rotation || 0;
    const xmul = o.xmul || 1;
    const ymul = o.ymul || 1;
    const bytes = encodeGBK(String(content));
    const escaped = escapeTsplBytes(bytes);

    if (o.align === 'center' && rot === 0) {
      const charW = font.indexOf('16') > -1 ? 16 : 24;
      const pixelW = String(content).replace(/[^\x00-\xff]/g, 'aa').length / 2 * charW;
      x = Math.max(0, (this.width * this.dpi / 25.4 - pixelW * xmul) / 2 / (this.dpi / 25.4));
    }

    return this._push(
      `TEXT ${Math.round(this.mm(x))},${Math.round(this.mm(y))},"${font}",${rot},${xmul},${ymul},"${escaped}"`
    );
  }

  /**
   * 一维码
   * @param {string} [o.type='128'] 128 / 39 / EAN13 / EAN8 / 25 / CODABAR
   * @param {number} [o.height=60] 条码高度(dot)
   * @param {number} [o.readable=1] 是否打印可读文字 0/1
   * @param {number} [o.rotation=0]
   * @param {number} [o.narrow=2] 窄条宽
   * @param {number} [o.wide=2] 宽条宽
   */
  barcode(x, y, content, o = {}) {
    const type = o.type || '128';
    const height = o.height || 60;
    const readable = o.readable ?? 1;
    const rot = o.rotation || 0;
    const narrow = o.narrow || 2;
    const wide = o.wide || 2;
    return this._push(
      `BARCODE ${Math.round(this.mm(x))},${Math.round(this.mm(y))},"${type}",${height},${readable},${rot},${narrow},${wide},"${content}"`
    );
  }

  /**
   * QR 码
   * @param {string} [o.ecc='M'] 纠错 L/M/Q/H
   * @param {number} [o.cell=4] 单元大小 1~10
   * @param {string} [o.mode='A'] A=自动 M=手动
   * @param {number} [o.rotation=0]
   */
  qrcode(x, y, content, o = {}) {
    const ecc = (o.ecc || 'M').toUpperCase();
    const cell = o.cell || 4;
    const mode = o.mode || 'A';
    const rot = o.rotation || 0;
    return this._push(
      `QRCODE ${Math.round(this.mm(x))},${Math.round(this.mm(y))},"${ecc}",${cell},"${mode}",${rot},"${content}"`
    );
  }

  /** 画线 x1,y1 -> x2,y2 (mm) */
  line(x1, y1, x2, y2, width = 1) {
    return this._push(
      `BAR ${Math.round(this.mm(x1))},${Math.round(this.mm(y1))},${Math.round(this.mm(x2 - x1))},${Math.round(this.mm(y2 - y1) || width)},${Math.round(width)}`
    );
  }

  /** 画框 */
  box(x, y, w, h, thickness = 1) {
    return this._push(
      `BOX ${Math.round(this.mm(x))},${Math.round(this.mm(y))},${Math.round(this.mm(x + w))},${Math.round(this.mm(y + h))},0,${thickness}`
    );
  }

  /**
   * 位图(需自行二值化,行优先,8 像素/字节,MSB 在左)
   * @param {number} mode 0=OVERWRITE 1=OR 2=XOR
   */
  bitmap(x, y, widthPx, heightPx, data, mode = 0) {
    const bytesPerRow = Math.ceil(widthPx / 8);
    const hex = Array.from(data)
      .map((b) => (b & 0xff).toString(16).padStart(2, '0'))
      .join('');
    return this._push(
      `BITMAP ${Math.round(this.mm(x))},${Math.round(this.mm(y))},${bytesPerRow},${heightPx},${mode},${hex}`
    );
  }

  /**
   * 打印
   * @param {number} copies 张数
   * @param {number} [sets=1] 每份重复次数
   */
  print(copies = 1, sets = 1) {
    return this._push(`PRINT ${copies},${sets}`);
  }

  /** 走纸一张标签高度 */
  formFeed() {
    return this._push('FORMFEED');
  }

  /** 蜂鸣 */
  sound(freq = 2000, duration = 200) {
    return this._push(`SOUND ${freq},${duration}`);
  }

  // ---------- 输出 ----------

  toBytes() {
    const all = [...this._header(), ...this._cmds, '\n'];
    const text = all.join('\r\n') + '\r\n';
    // 指令本身是 ASCII,中文以 GBK 字节流内嵌,这里按 latin1 语义逐字节还原
    const out = [];
    for (let i = 0; i < text.length; i++) {
      const cp = text.charCodeAt(i);
      out.push(cp < 0x100 ? cp : 0x3f);
    }
    return new Uint8Array(out);
  }

  toString() {
    return [...this._header(), ...this._cmds].join('\r\n');
  }
}

/**
 * 把 GBK 字节流转成 TSPL 指令串中的安全字面量:
 * 中文必须保留原始字节,但 " 和 \ 需要转义,否则指令解析错乱。
 */
function escapeTsplBytes(bytes) {
  let s = '';
  for (const b of bytes) {
    if (b === 0x22) s += '\\"';
    else if (b === 0x5c) s += '\\\\';
    else s += String.fromCharCode(b);
  }
  return s;
}

/**
 * CPCL 简版构建器(部分便携标签机只认 CPCL)
 * 语法完全不同:以 ! 开头的配置行 + 其他指令 + PRINT
 */
export class CpclBuilder {
  constructor(opts = {}) {
    this.width = opts.width || 40; // mm
    this.height = opts.height || 30;
    this.dpi = opts.dpi || 200;
    this._cmds = [];
  }

  mm(v) {
    return Math.round((v * this.dpi) / 25.4);
  }

  cls() {
    return this._push('! 0 200 200 210 1');
  }

  text(x, y, content, o = {}) {
    const size = o.size || 24;
    const rot = o.rotation || 0;
    const bytes = encodeGBK(String(content));
    let s = '';
    for (const b of bytes) s += String.fromCharCode(b);
    return this._push(`TEXT ${size} ${rot} ${Math.round(this.mm(x))} ${Math.round(this.mm(y))} ${s}`);
  }

  barcode(x, y, content, o = {}) {
    const type = o.type || '128';
    const height = o.height || 60;
    return this._push(`BARCODE ${type} 2 1 ${height} ${Math.round(this.mm(x))} ${Math.round(this.mm(y))} ${content}`);
  }

  qrcode(x, y, content) {
    return this._push(`B QR ${Math.round(this.mm(x))} ${Math.round(this.mm(y))} M 2 U 6`);
  }

  print() {
    return this._push('PRINT');
  }

  _push(line) {
    this._cmds.push(line);
    return this;
  }

  toBytes() {
    const text = this._cmds.join('\r\n') + '\r\n';
    const out = [];
    for (let i = 0; i < text.length; i++) {
      const cp = text.charCodeAt(i);
      out.push(cp < 0x100 ? cp : 0x3f);
    }
    return new Uint8Array(out);
  }
}

export default TsplBuilder;
