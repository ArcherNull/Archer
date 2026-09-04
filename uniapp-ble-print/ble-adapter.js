/**
 * ble-adapter.js —— uni-app 低功耗蓝牙打印统一适配层
 * ---------------------------------------------------------------------------
 * 目标:一套代码同时跑通【微信小程序】与【App(Android / iOS)】。
 *
 * 平台结论(基于 uni-app 官方平台差异表 + 微信官方文档):
 *   - uni 提供的蓝牙 API 底层走的是 BLE(低功耗蓝牙)中心设备能力,
 *     App 端与微信小程序端能力对齐,H5 不支持。
 *   - 因此打印机必须是 BLE 双模机(BLE + SPP)。纯经典蓝牙 SPP 打印机
 *     在小程序端无解,App 端需要原生插件桥接(见 README「SPP 机型处理」)。
 *
 * 本层负责:扫描 → 连接 → 探测可写特征值 → MTU 协商 → 串行分包写入 → 断连。
 * 只收发字节,不关心指令语义(指令交给 escpos.js / tspl.js)。
 */

// 常见热敏/标签打印机的打印服务 UUID(用于排序优先级,不强制依赖)
const PREFERRED_SERVICES = [
  '0000ffe0-0000-1000-8000-00805f9b34fb', // 经典 BLE 串口模块(HM-10 / 大量白牌机)
  '0000fff0-0000-1000-8000-00805f9b34fb', // 国产票据机常见
  '000018f0-0000-1000-8000-00805f9b34fb', // EPSON ESC/POS 官方服务
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC(汉印、部分佳博)
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000ffb0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // 部分 Nordic 方案
];

const PREFERRED_WRITE_CHARS = [
  '0000ffe1-0000-1000-8000-00805f9b34fb',
  '0000fff1-0000-1000-8000-00805f9b34fb',
  '0000ff02-0000-1000-8000-00805f9b34fb',
  '00002af1-0000-1000-8000-00805f9b34fb',
  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
  '0000ffb2-0000-1000-8000-00805f9b34fb',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 把 uni 的回调式 API 包装成 Promise */
function promisify(apiName, args = {}) {
  return new Promise((resolve, reject) => {
    const fn = typeof uni !== 'undefined' ? uni[apiName] : null;
    if (!fn) return reject(new Error(`当前平台不支持 uni.${apiName}`));
    fn({
      ...args,
      success: (res) => resolve(res),
      fail: (err) => reject(normalizeError(apiName, err)),
    });
  });
}

/** 统一错误信息,把 errCode 翻译成人话 */
function normalizeError(api, err) {
  const code = err && (err.errCode || err.code);
  const msgMap = {
    10000: '未初始化蓝牙适配器,请先调用 open()',
    10001: '蓝牙不可用,请检查手机蓝牙是否开启',
    10002: '找不到指定设备',
    10003: '连接失败,打印机可能已关机或超出范围',
    10004: '找不到指定服务',
    10005: '找不到指定特征值',
    10006: '连接已断开',
    10007: '当前特征值不支持该操作',
    10008: '系统异常(常见于 MTU 未协商/包过大/安卓 notify 后立即写入)',
    10009: '系统版本过低,不支持 BLE',
    10012: '连接超时',
    10013: 'deviceId 非法',
  };
  const e = new Error(msgMap[code] || (err && err.errMsg) || `${api} 调用失败`);
  e.errCode = code;
  e.api = api;
  e.raw = err;
  return e;
}

/** 带超时的 Promise 竞速 */
function withTimeout(promise, ms, msg) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(msg || `操作超时(${ms}ms)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export class BlePrinter {
  /**
   * @param {Object} options
   * @param {number} [options.mtu=256]      期望协商的 MTU,取值 (22, 512]
   * @param {number} [options.chunkDelay=20] 分包之间的间隔(ms),打印机缓冲区小的机型可调到 30~50
   * @param {number} [options.connectDelay=300] 连接成功后到首次写入的等待(ms),规避安卓 10008
   * @param {boolean} [options.debug=false]
   */
  constructor(options = {}) {
    this.mtu = options.mtu || 256;
    this.chunkDelay = options.chunkDelay ?? 20;
    this.connectDelay = options.connectDelay ?? 300;
    this.debug = !!options.debug;

    this.deviceId = '';
    this.serviceId = '';
    this.characteristicId = '';
    this.writeType = 'write';
    this.actualMtu = 23; // ATT 默认值,协商成功后被覆盖
    this.canWriteNoResponse = false;
    this._connected = false;
    this._writeQueue = Promise.resolve();
    this._discovering = false;
    this._mtuHandler = null;
    this._connHandler = null;
    this.lastDevice = null;
  }

  get isConnected() {
    return this._connected;
  }

  _log(...args) {
    if (this.debug) console.log('[BlePrinter]', ...args);
  }

  // ==================== 1. 适配器 ====================

  async open() {
    try {
      await promisify('openBluetoothAdapter', {});
    } catch (e) {
      // 10001:蓝牙未开启。引导用户开启后重试属于 UI 层职责,这里直接抛出
      throw e;
    }
    this._bindAdapterEvents();
    return this;
  }

  async close() {
    try { await this.disconnect(); } catch (_) { /* 忽略 */ }
    this._unbindAdapterEvents();
    try { await promisify('closeBluetoothAdapter', {}); } catch (_) { /* 忽略 */ }
    return this;
  }

  _bindAdapterEvents() {
    if (this._adapterBound) return;
    this._adapterBound = true;
    if (uni.onBluetoothAdapterStateChange) {
      uni.onBluetoothAdapterStateChange((res) => {
        this._log('adapter state', res);
        if (!res.available) this._connected = false;
        if (typeof this.onAdapterStateChange === 'function') {
          this.onAdapterStateChange(res);
        }
      });
    }
  }

  _unbindAdapterEvents() {
    if (!this._adapterBound) return;
    this._adapterBound = false;
    // 传入空函数覆盖,达到移除监听的效果(uni 未提供 off 接口)
    if (uni.onBluetoothAdapterStateChange) uni.onBluetoothAdapterStateChange(() => {});
  }

  // ==================== 2. 扫描 ====================

  /**
   * 扫描设备
   * @param {Function} onFound (device) => void  每次发现新设备回调
   * @param {Object} opts
   * @param {number} [opts.duration=8000] 扫描时长(ms),到时自动停止
   * @param {string[]} [opts.services] 按服务 UUID 过滤,留空则扫描全部
   * @param {Function} [opts.filter] 自定义过滤 (device) => boolean
   * @returns {Promise<Array>} 去重后的设备列表
   */
  async startScan(onFound, opts = {}) {
    const { duration = 8000, services, filter } = opts;
    const devices = new Map();

    await this.open();

    return new Promise((resolve, reject) => {
      const onDevice = (res) => {
        (res.devices || []).forEach((d) => {
          if (!d.deviceId) return;
          if (!d.name && !d.localName) return;
          if (filter && !filter(d)) return;
          const item = {
            deviceId: d.deviceId,
            name: d.name || d.localName || '未知设备',
            RSSI: d.RSSI,
            services: d.advertisServiceUUIDs || [],
          };
          if (!devices.has(item.deviceId)) {
            devices.set(item.deviceId, item);
            this._log('found', item.name, item.deviceId);
            if (typeof onFound === 'function') onFound(item);
          } else {
            devices.get(item.deviceId).RSSI = d.RSSI;
          }
        });
      };

      uni.onBluetoothDeviceFound(onDevice);
      this._discovering = true;

      uni.startBluetoothDevicesDiscovery({
        services: services && services.length ? services : undefined,
        allowDuplicatesKey: false,
        success: () => {
          this._log('discovery started');
          setTimeout(async () => {
            await this.stopScan();
            const list = Array.from(devices.values()).sort((a, b) => (b.RSSI || -999) - (a.RSSI || -999));
            resolve(list);
          }, duration);
        },
        fail: (err) => {
          this._discovering = false;
          reject(normalizeError('startBluetoothDevicesDiscovery', err));
        },
      });
    });
  }

  async stopScan() {
    if (!this._discovering) return;
    this._discovering = false;
    try {
      await promisify('stopBluetoothDevicesDiscovery', {});
    } catch (_) { /* 忽略 */ }
    if (uni.offBluetoothDeviceFound) {
      uni.offBluetoothDeviceFound();
    } else if (uni.onBluetoothDeviceFound) {
      uni.onBluetoothDeviceFound(() => {});
    }
  }

  // ==================== 3. 连接 + 特征值探测 ====================

  /**
   * 连接打印机,并自动探测可写特征值、协商 MTU
   * @param {string} deviceId
   * @param {Object} opts
   * @param {number} [opts.timeout=10000]
   * @param {string} [opts.serviceId] 已知服务 UUID,跳过遍历(更快更稳)
   * @param {string} [opts.characteristicId] 已知写特征 UUID
   */
  async connect(deviceId, opts = {}) {
    const { timeout = 10000, serviceId, characteristicId } = opts;
    if (!deviceId) throw new Error('deviceId 不能为空');

    await this.open();
    this.deviceId = deviceId;

    // 监听连接状态,断连时同步内部状态
    if (uni.onBLEConnectionStateChange) {
      if (this._connHandler) uni.onBLEConnectionStateChange(this._connHandler);
      this._connHandler = (res) => {
        this._log('conn state', res);
        if (!res.connected) {
          this._connected = false;
          if (typeof this.onDisconnect === 'function') this.onDisconnect(res);
        }
      };
      uni.onBLEConnectionStateChange(this._connHandler);
    }

    await withTimeout(
      promisify('createBLEConnection', { deviceId, timeout: 6000 }),
      timeout,
      '连接打印机超时,请确认打印机已开机且在附近'
    );

    this._connected = true;

    // 已知 UUID 走捷径,否则遍历探测
    if (serviceId && characteristicId) {
      this.serviceId = serviceId;
      this.characteristicId = characteristicId;
    } else {
      await this._discoverWritableCharacteristic(serviceId);
    }

    await this._negotiateMtu();

    // 安卓部分机型在 notify 成功后立刻写入会抛 10008,这里统一缓冲一下
    await sleep(this.connectDelay);

    this._log('connected', { serviceId: this.serviceId, charId: this.characteristicId, mtu: this.actualMtu });
    return { serviceId: this.serviceId, characteristicId: this.characteristicId, mtu: this.actualMtu };
  }

  /**
   * 遍历所有服务,找到支持 write / writeNoResponse 的特征值
   * 优先匹配已知打印服务,匹配不上就全量兜底 —— 覆盖冷门白牌机
   */
  async _discoverWritableCharacteristic(onlyServiceId) {
    const svcRes = await promisify('getBLEDeviceServices', { deviceId: this.deviceId });
    let services = svcRes.services || [];
    if (!services.length) throw new Error('未发现任何蓝牙服务,设备可能不支持 BLE 透传');

    const score = (uuid) => {
      const u = String(uuid).toLowerCase();
      const i = PREFERRED_SERVICES.indexOf(u);
      return i === -1 ? 99 : i;
    };
    services = services
      .filter((s) => !onlyServiceId || String(s.uuid).toLowerCase() === String(onlyServiceId).toLowerCase())
      .sort((a, b) => score(a.uuid) - score(b.uuid));

    this._log('services', services.map((s) => s.uuid));

    const candidates = [];
    for (const svc of services) {
      let charRes;
      try {
        charRes = await promisify('getBLEDeviceCharacteristics', { deviceId: this.deviceId, serviceId: svc.uuid });
      } catch (e) {
        continue; // 某些系统服务无权限,跳过
      }
      const chars = charRes.characteristics || [];
      const writable = chars.filter((c) => c.properties && (c.properties.write || c.properties.writeNoResponse));
      if (!writable.length) continue;

      // 同一服务内优先选已知写特征,其次优先 writeNoResponse(吞吐更高)
      writable.sort((a, b) => {
        const pa = PREFERRED_WRITE_CHARS.indexOf(String(a.uuid).toLowerCase());
        const pb = PREFERRED_WRITE_CHARS.indexOf(String(b.uuid).toLowerCase());
        const sa = (pa === -1 ? 99 : pa) + (a.properties.writeNoResponse ? 0 : 0.5);
        const sb = (pb === -1 ? 99 : pb) + (b.properties.writeNoResponse ? 0 : 0.5);
        return sa - sb;
      });

      writable.forEach((c) => candidates.push({ serviceId: svc.uuid, char: c, score: score(svc.uuid) }));
      if (score(svc.uuid) < 99) break; // 命中已知打印服务,无需继续
    }

    if (!candidates.length) throw new Error('未找到可写特征值,该设备不支持 BLE 写入');

    candidates.sort((a, b) => a.score - b.score);
    const best = candidates[0];
    this.serviceId = best.serviceId;
    this.characteristicId = best.char.uuid;
    this.canWriteNoResponse = !!best.char.properties.writeNoResponse;
    this.writeType = this.canWriteNoResponse ? 'writeNoResponse' : 'write';
    this._candidates = candidates.map((c) => ({ serviceId: c.serviceId, characteristicId: c.char.uuid }));
  }

  /**
   * MTU 协商:先监听 onBLEMTUChange 拿真实值,再发起 setBLEMTU 请求。
   * 注意:iOS 平台 setBLEMTU 无效(系统限制),会静默失败并沿用默认 23。
   */
  async _negotiateMtu() {
    this.actualMtu = 23;
    let resolved = 23;

    if (uni.onBLEMTUChange) {
      this._mtuHandler = (res) => {
        if (res && res.mtu) {
          resolved = res.mtu;
          this.actualMtu = res.mtu;
          this._log('mtu changed ->', res.mtu);
        }
      };
      uni.onBLEMTUChange(this._mtuHandler);
    }

    try {
      const res = await promisify('setBLEMTU', { deviceId: this.deviceId, mtu: this.mtu });
      if (res && res.mtu) resolved = res.mtu;
    } catch (e) {
      this._log('setBLEMTU 失败,沿用默认 MTU', e.message);
    }

    // 回调是异步到达的,给一点时间
    await sleep(resolved > 23 ? 60 : 200);
    this.actualMtu = Math.max(23, resolved);
    return this.actualMtu;
  }

  /** 单包有效载荷上限:MTU 减去 3 字节 ATT 头,并对齐到安全上限 */
  get chunkSize() {
    const size = Math.max(20, this.actualMtu - 3);
    return Math.min(size, 244);
  }

  async disconnect() {
    this._unbindMtu();
    if (this.deviceId) {
      try { await promisify('closeBLEConnection', { deviceId: this.deviceId }); } catch (_) { /* 忽略 */ }
    }
    this._connected = false;
    this.deviceId = '';
    this.serviceId = '';
    this.characteristicId = '';
    return this;
  }

  _unbindMtu() {
    if (this._mtuHandler && uni.onBLEMTUChange) {
      uni.onBLEMTUChange(this._mtuHandler);
      this._mtuHandler = null;
    }
  }

  // ==================== 4. 写入(串行分包) ====================

  /**
   * 发送字节数据。内部做串行分包 —— 并行写入是丢包/乱码的头号原因。
   * @param {Uint8Array|number[]|ArrayBuffer} data
   * @param {Object} opts
   * @param {number} [opts.chunk] 覆盖默认分包大小
   * @param {number} [opts.delay] 覆盖默认包间隔
   * @param {Function} [opts.onProgress] (percent) => void
   * @param {number} [opts.retry=1] 单包失败重试次数
   */
  async write(data, opts = {}) {
    if (!this._connected) throw new Error('打印机未连接,请先调用 connect()');

    const buffer = toUint8Array(data);
    // 保留最后一包数据,供上层做"小包重试"兜底
    this._lastData = buffer;
    const chunk = opts.chunk || this.chunkSize;
    const delay = opts.delay ?? this.chunkDelay;
    const retry = opts.retry ?? 1;
    const total = Math.ceil(buffer.length / chunk);

    // 串行队列:保证任意时刻只有一个 writeBLECharacteristicValue 在飞
    this._writeQueue = this._writeQueue.then(async () => {
      for (let i = 0, offset = 0; offset < buffer.length; i++, offset += chunk) {
        const slice = buffer.slice(offset, Math.min(offset + chunk, buffer.length));
        await this._writeOnce(slice, retry);
        if (typeof opts.onProgress === 'function') {
          opts.onProgress(Math.round(((i + 1) / total) * 100));
        }
        if (delay > 0 && offset + chunk < buffer.length) await sleep(delay);
      }
    }).catch((e) => {
      this._writeQueue = Promise.resolve(); // 失败后重置队列,避免后续任务被永久阻塞
      throw e;
    });

    return this._writeQueue;
  }

  async _writeOnce(bytes, retry) {
    const value = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    let lastErr;
    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        await promisify('writeBLECharacteristicValue', {
          deviceId: this.deviceId,
          serviceId: this.serviceId,
          characteristicId: this.characteristicId,
          value,
          writeType: this.writeType,
        });
        return;
      } catch (e) {
        lastErr = e;
        // 10007:该特征不支持当前 writeType,自动切换重试
        if (e.errCode === 10007 && attempt === 0) {
          this.writeType = this.writeType === 'write' ? 'writeNoResponse' : 'write';
          this._log('切换 writeType ->', this.writeType);
          continue;
        }
        if (attempt < retry) await sleep(50 * (attempt + 1));
      }
    }
    throw lastErr;
  }

  /**
   * 换一个候选特征值重试(某些机型有多个可写特征,只有一个能真正出纸)
   * 调用前建议先打印一张测试页
   */
  useNextCandidate() {
    if (!this._candidates || this._candidates.length < 2) return false;
    const idx = this._candidates.findIndex(
      (c) => c.serviceId === this.serviceId && c.characteristicId === this.characteristicId
    );
    const next = this._candidates[(idx + 1) % this._candidates.length];
    this.serviceId = next.serviceId;
    this.characteristicId = next.characteristicId;
    return true;
  }

  // ==================== 5. 便捷方法 ====================

  /** 传入 escpos.js / tspl.js 产出的 builder,直接打印 */
  async print(builder, opts = {}) {
    const bytes = typeof builder.toBytes === 'function' ? builder.toBytes() : builder;
    return this.write(bytes, opts);
  }

  /** 已连过的设备快速重连(配合本地缓存 deviceId) */
  async reconnect(deviceId, opts = {}) {
    if (!deviceId) throw new Error('缺少缓存的 deviceId');
    try {
      return await this.connect(deviceId, opts);
    } catch (e) {
      this._connected = false;
      throw e;
    }
  }
}

/** 各种输入统一成 Uint8Array */
export function toUint8Array(data) {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (Array.isArray(data)) return new Uint8Array(data);
  throw new TypeError('write() 只接受 Uint8Array / ArrayBuffer / number[]');
}

export { PREFERRED_SERVICES, PREFERRED_WRITE_CHARS };
export default BlePrinter;
