# uni-app 蓝牙打印解决方案(微信小程序 + App 双端通用)

一套代码跑通**微信小程序**与 **App(Android / iOS)** 的 BLE 热敏打印方案,含票据(ESC/POS)与标签(TSPL/CPCL)两类指令集。

---

## 一、架构分层

```
业务层   print-demo.vue        组装小票内容、处理 UI 与故障兜底
  ↓
指令层   escpos.js / tspl.js   生成打印指令字节流(与蓝牙无关,可单测)
  ↓
编码层   gbk-table.js          中文 → GBK 字节(小程序端最大拦路虎)
  ↓
适配层   ble-adapter.js        扫描 / 连接 / 特征探测 / MTU 协商 / 串行分包
  ↓
运行时   uni.* 蓝牙 API        App 与微信小程序共用同一套 API
```

**为什么要分层**:指令层不碰蓝牙,意味着你可以在 Chrome 里 `toHex()` 验证指令正确性,不必每次都连真机;适配层不碰指令,意味着换打印机品牌(佳博 → 汉印)只改指令参数,不改通信代码。

---

## 二、平台差异一览

| 能力 | 微信小程序 | App(Android) | App(iOS) | H5 |
|---|---|---|---|---|
| uni 蓝牙 API | ✅ | ✅ | ✅ | ❌ |
| BLE 写入 | ✅ | ✅ | ✅ | ❌ |
| 经典蓝牙 SPP | ❌ | 需原生插件 | 需 MFi 认证 | ❌ |
| `setBLEMTU` | Android 有效,iOS 无效 | ✅ | ❌ 系统限制 | — |
| 定位权限 | Android 需要 | Android 12 前需要 | 不需要 | — |
| 后台打印 | 受限 | 可后台 Service | 受限 | — |

> **核心结论:uni 的蓝牙 API 是 BLE 中心设备能力,双端对齐。** 所以打印机必须支持 BLE 透传,这是选型的硬门槛。

---

## 三、打印机选型(决定项目成败)

| 类型 | 推荐度 | 说明 |
|---|---|---|
| BLE 双模票据机(BLE + SPP) | ⭐⭐⭐⭐⭐ | 佳博 GP-21xx 系列、芯烨、汉印 HM 系列、得力 DL 系列。BLE 通道小程序和 App 都能打 |
| 纯经典蓝牙 SPP 票据机 | ⭐ | 小程序端**无解**;App 端需买原生插件(DCloud 插件市场搜"蓝牙打印") |
| BLE 标签机 | ⭐⭐⭐⭐ | 佳博 2120TU、汉印、TSC 部分型号,走 TSPL/CPCL 指令 |
| WiFi / 网口打印机 | ⭐⭐⭐ | 另一条路:小程序连同一局域网用 `wx.createTCPSocket`,稳定性通常优于蓝牙 |

**务必向卖家确认三件事**:① 是否支持 BLE 低功耗蓝牙;② 指令集是 ESC/POS、TSPL 还是 CPCL;③ 中文编码是 GBK 还是 UTF-8。

---

## 四、快速接入

### 1. 拷贝文件

```
utils/ble-print/
├── index.js
├── ble-adapter.js
├── escpos.js
├── tspl.js
└── gbk-table.js     (151KB,GBK 全码表)
```

### 2. 打印一张小票

```javascript
import { BlePrinter, EscPosBuilder } from '@/utils/ble-print';

const printer = new BlePrinter({ debug: true, mtu: 256 });

// 扫描 → 连接
const devices = await printer.startScan(d => console.log(d.name), { duration: 8000 });
await printer.connect(devices[0].deviceId);

// 组装 → 发送
const cmd = new EscPosBuilder({ paperWidth: 58 })
  .init()
  .alignCenter().size(1, 1).bold(true).line('元宝便利店')
  .alignLeft().size(0, 0).bold(false).divider()
  .row('可乐 x2', '￥7.00')
  .row('薯片 x1', '￥8.50')
  .divider()
  .alignRight().line('合计:￥15.50')
  .alignCenter().qrcode('https://example.com/o/123', { size: 8 })
  .feed(2).cut();

await printer.print(cmd, { onProgress: p => console.log(p + '%') });
```

### 3. 打印标签(TSPL)

```javascript
import { TsplBuilder } from '@/utils/ble-print';

const cmd = new TsplBuilder({ width: 40, height: 30, dpi: 200 })
  .cls()
  .text(2, 2, '顺丰速运', { font: 'TSS24.BF2', xmul: 2, ymul: 2 })
  .barcode(2, 12, 'SF1234567890', { height: 60 })
  .qrcode(24, 12, 'https://example.com/t/123', { cell: 5 })
  .print(1);

await printer.print(cmd);
```

---

## 五、必做的平台配置

### App 端 `manifest.json`

```json
{
  "name": "your-app",
  "appid": "",
  "permissions": {
    "Bluetooth": { "request": "once", "prompt": "需要使用蓝牙连接打印机" }
  }
}
```

- HBuilderX 可视化操作:manifest.json → App 模块配置 → 勾选 **Bluetooth(低功耗蓝牙)**。不勾选会导致 `uni.openBluetoothAdapter` 直接失败。
- **Android 12+**:需在 App 权限配置里追加 `BLUETOOTH_SCAN`、`BLUETOOTH_CONNECT`;Android 12 以下还需 `ACCESS_FINE_LOCATION`,否则扫描不到任何设备且**不报错**——这是最隐蔽的坑。
- **iOS**:`NSBluetoothAlwaysUsageDescription` 必须填写,否则审核被拒。

### 微信小程序端

1. 小程序管理后台 → 开发管理 → **隐私保护指引**,勾选"蓝牙"这一项。未声明会导致正式版调用蓝牙接口直接失败(体验版可能正常,极易漏掉)。
2. 真机调试才有效,微信开发者工具模拟器不支持蓝牙。
3. Android 微信需要定位权限,用户拒绝后 `startBluetoothDevicesDiscovery` 静默失败。

---

## 六、踩坑清单(按出现频率排序)

| 现象 | 根因 | 解决 |
|---|---|---|
| 扫描不到设备 | Android 未开定位 / iOS 未授权 / 蓝牙未开 | 按第五节检查权限;Android 6+ 需先 `authorize scope.userLocation` |
| 连上但不出纸 | 选错了可写特征值(一台机常有多个) | `ble-adapter` 已按已知 UUID 优先级排序兜底;仍不行则调用 `printer.useNextCandidate()` 换通道重试 |
| 中文乱码 | 发了 UTF-8,打印机字库是 GBK | 用 `gbk-table.js` 编码;极少数机型改 `new EscPosBuilder({ encoding: 'utf8' })` |
| 小票缺字 / 大段空白 | 分包过大或并行写入丢包 | 已做串行队列 + MTU 协商;顽固机型把 `chunkDelay` 调到 30~50ms、`chunk` 降到 20 |
| 报错 10008 | MTU 未协商,或安卓 notify 成功后立刻写入 | 已加连接后 300ms 缓冲;仍报错则 `write(data, { chunk: 20, delay: 40 })` 小包重试 |
| 图片打出一堆乱码 | 位图未按 8 像素对齐,或缓冲区溢出 | `EscPosBuilder.binarize()` 已按字节对齐;`image()` 内部按 256 行分片 |
| 二维码不出图 | 低端机不支持内建 QR 指令 | 用 qrcode 库生成 canvas → `imageFromCanvas()` 当图片打印(100% 兼容) |
| 打印几张后卡死 | 连接未释放 / 写队列被失败任务阻塞 | 页面 `onUnload` 中调用 `printer.close()`;队列已在失败时自动重置 |
| 指令对了但只走纸 | 票据机与标签机指令混用 | ESC/POS 给票据机,TSPL/CPCL 给标签机,二者不可交叉 |

---

## 七、SPP 老机型怎么办

若打印机只有经典蓝牙(SPP),方案分三档:

1. **换机**(成本最低):换支持 BLE 双模的机器,一台 200~400 元,比开发成本便宜。
2. **App 端用原生插件**:DCloud 插件市场的 Android 蓝牙打印插件,JS 侧把指令字节流转成 Base64 传给插件(`uni.arrayBufferToBase64()`),插件内调用 `BluetoothSocket`。此时小程序端需降级为"仅 App 可用"。
3. **改走 WiFi**:打印机接局域网,小程序用 `wx.createTCPSocket` 直连 9100 端口。吞吐与稳定性都优于蓝牙,适合固定门店场景。

---

## 八、性能优化建议

- **连接复用**:一台打印机不要每次打印都重连,BLE 连接建立通常要 1~3 秒。把 `deviceId` 存本地,进页面自动重连(示例页已实现)。
- **MTU 协商**:默认 23 字节时打印一张 A4 宽度图片要几百个包,协商到 247 后包数减少 90%,速度提升明显。已在 `connect()` 内自动完成。
- **指令缓存**:固定格式的小票模板预生成字节数组缓存,只替换变量部分。
- **进度反馈**:大图片打印务必接 `onProgress`,否则用户会以为卡死而反复点击。

---

## 九、文件说明

| 文件 | 作用 | 体积 |
|---|---|---|
| `ble-adapter.js` | 蓝牙通信适配层,含特征值自动探测、MTU 协商、串行分包队列 | ~13KB |
| `escpos.js` | ESC/POS 指令构建器:文本/对齐/字号/条码/二维码/图片/切纸/钱箱 | ~12KB |
| `tspl.js` | TSPL + CPCL 标签指令构建器 | ~7KB |
| `gbk-table.js` | GBK 完整编码表(21791 字符),自动生成 | 151KB |
| `index.js` | 统一导出 | — |
| `example/print-demo.vue` | 完整示例页:扫描/连接/自检/打印/日志/故障兜底 | — |
