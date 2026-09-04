/**
 * index.js —— 统一入口
 *
 * import { BlePrinter, EscPosBuilder, TsplBuilder } from '@/utils/ble-print';
 */
export { BlePrinter, toUint8Array } from './ble-adapter.js';
export { EscPosBuilder, buildReceipt } from './escpos.js';
export { TsplBuilder, CpclBuilder } from './tspl.js';
export { encodeGBK, isGBK } from './gbk-table.js';
