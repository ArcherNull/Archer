# Uniapp 蓝牙打印项目

基于 uni-app 开发的跨平台蓝牙打印解决方案，支持 H5、小程序多平台运行。

## 项目简介

本项目实现了一个完整的蓝牙打印功能，包括蓝牙设备连接、图片打印、采购清单打印、配送清单打印等功能。支持热敏打印机，提供丰富的打印格式控制。

## 功能特性

### 核心功能
- ✅ 蓝牙设备自动扫描和连接
- ✅ 支持手动选择图片打印
- ✅ 采购清单打印（支持表格格式化）
- ✅ 配送清单打印
- ✅ 自动重连机制
- ✅ 打印状态监控
- ✅ 信号强度显示

### 打印功能
- ✅ 文本打印（支持字体、大小、加粗、下划线）
- ✅ 图片打印（支持位图转换）
- ✅ 二维码打印
- ✅ 条形码打印（支持多种类型）
- ✅ 表格格式化打印（自动对齐）
- ✅ 切纸功能（全切/半切）

### 跨平台支持
- ✅ H5（Web Bluetooth API）
- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ 百度小程序
- ✅ App（iOS/Android）

## 技术栈

- **框架**：uni-app 3.x
- **语言**：TypeScript
- **UI 组件**：wot-design-uni
- **日期处理**：dayjs
- **数学计算**：mathjs
- **编码支持**：text-decoding（支持 GB2312）

## 环境配置

### 开发环境
- **操作系统**：Windows
- **Node.js**：v18.20.4
- **npm**：10.9.0
- **编辑器**：VS Code

### 开发工具推荐
- **编辑器**：VS Code
- **插件**：
  - Volar（Vue 3 支持）
  - TypeScript Vue Plugin
  - uni-app 插件

## 安装依赖

```bash
# 使用 npm
npm install
```

## 运行项目

### 开发模式

```bash
# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

```

### 生产构建

```bash
# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin

```

### 类型检查

```bash
npm run type-check
```

## 项目结构

```
uniapp-bluetooth-print/
├── src/
│   ├── pages/
│   │   └── blueToothPrint/
│   │       └── blueToothPrint.vue    # 蓝牙打印主页面
│   ├── utils/
│   │   ├── bluetoothprint/
│   │   │   ├── bluetooth.ts          # 蓝牙连接管理
│   │   │   ├── printerjobs.ts        # 打印机指令类
│   │   │   ├── usePrint.ts           # 打印功能 Hook
│   │   │   └── commands.ts           # 打印机指令定义
│   │   ├── mathjs.ts                 # 数学计算工具
│   └── types/
│       └── text-decoding.d.ts        # 类型声明文件
├── package.json
├── tsconfig.json
└── README.md
```

## 使用说明

### 1. 蓝牙连接

```typescript
import { connectBluetoothDevice } from '@/utils/bluetoothprint/bluetooth'

// 连接设备
const result = await connectBluetoothDevice(deviceId, (size) => {
  console.log('MTU 大小:', size)
})
```

### 2. 图片打印

```typescript
import { onPrintTempImg } from '@/utils/bluetoothprint/usePrint'

// 打印临时图片
await onPrintTempImg(tempImgPath)
```

### 3. 采购清单打印

```typescript
import { onPrintPurchaseOrder } from '@/utils/bluetoothprint/usePrint'

const orderData = {
  clientName: "测试客户",
  serialNo: "TEST001",
  createTime: new Date().toISOString(),
  content: [
    { name: "商品A", quantity: 2, price: 10.5 },
    { name: "商品B", quantity: 3, price: 20.0 },
  ],
}

const options = {
  title: "采购清单",
  isPaid: true,
  total: 78.3,
}

await onPrintPurchaseOrder({ orderData, options })
```

### 4. 使用 PrinterJobs

```typescript
import PrinterJobs from '@/utils/bluetoothprint/printerjobs'

const printer = new PrinterJobs()

printer
  .setAlign('TXT_ALIGN_CT')
  .setFontSize(2, 2)
  .setBold(true)
  .println('标题')
  .setBold(false)
  .setFontSize(1, 1)
  .println('内容')
  .addQRCode({
    text: 'https://example.com',
    size: 6,
    level: 'M'
  })
  .cutPaperPartial()
```

## 配置说明

### 打印机宽度设置

在 `blueToothPrint.vue` 中可以设置打印机宽度：

```typescript
const printerWidth = ref(58) // 58mm 或 80mm
```

### MTU 设置

MTU（Maximum Transmission Unit）影响单次发送数据的大小：

```typescript
// H5 端默认 512
// 小程序/App 端会自动设置最大值
```

## 常见问题

### 1. H5 端蓝牙连接失败

**原因**：浏览器不支持 Web Bluetooth API

**解决方案**：
- 使用 Chrome 浏览器（推荐）
- 确保在 HTTPS 环境下运行（localhost 除外）
- 检查浏览器权限设置

### 2. 小程序端蓝牙连接失败

**原因**：未开启蓝牙权限

**解决方案**：
- 在 `manifest.json` 中配置蓝牙权限
- 确保用户已授权蓝牙权限

### 3. 打印乱码

**原因**：编码格式不匹配

**解决方案**：
- 项目已使用 GB2312 编码
- 确保打印机支持 GB2312 编码
- 如有需要，可修改 `text-decoding` 的编码格式

### 4. 打印不完整

**原因**：MTU 设置过大或数据发送过快

**解决方案**：
- 减小 MTU 值
- 增加数据发送延迟
- 检查蓝牙连接稳定性

### 5. TypeScript 类型错误

**解决方案**：
```bash
# 重新安装类型定义
npm install @dcloudio/types --save-dev

# 运行类型检查
npm run type-check
```

## 开发规范

### 代码注释
- 所有文件必须包含文件级注释
- 所有公共方法必须包含方法注释
- 关键代码行需要添加行内注释

### 命名规范
- 组件文件：PascalCase（如 `blueToothPrint.vue`）
- 工具函数：camelCase（如 `connectBluetoothDevice`）
- 常量：UPPER_SNAKE_CASE（如 `MAX_RECONNECT_COUNT`）

### Git 提交规范
```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue。
