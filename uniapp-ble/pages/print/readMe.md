# 蓝牙打印模块（print）

基于 uni-app 的 BLE 蓝牙打印能力：设备连接、任务调度、指令 SDK、业务模板、调试页与操作指引。

**已支持机型**：汉印 `HM-A300` / `HM-A300L`，芝柯 `CC3` / `K319`（协议均为 CPCL）。

## 项目结构

```
pages/print/
├── index.vue                     # 业务主页面（标签 / 运单 / 回单）
├── readMe.md                     # 本说明文档
│
├── ble/                          # 蓝牙核心（连接 + 任务）
│   ├── index.js                  # 入口：单例 / 调试页独立实例
│   ├── bleBlueTooth.js           # BLE 适配器（连接 / 订阅 / 历史 / 打印任务）
│   └── config.js                 # 错误码、状态、机型、存储键、平台默认配置
│
├── comm/                         # 公共工具
│   └── utils.js                  # Toast、模态框、延时等
│
├── components/                   # 可复用 UI 组件
│   ├── PrintItemBox.vue          # 分区卡片容器
│   ├── LabelBox.vue              # 表单项（可带勾选）
│   ├── SelectPrinter.vue         # 打印机选择入口
│   ├── PrintListPop.vue          # 打印机搜索 / 连接弹层
│   ├── DeviceInfo.vue            # 设备搜索 / 连接 / 扫码 / 品牌绑定
│   ├── BindPrinterBrandPopup.vue # 未识别设备绑定品牌弹层
│   ├── TemplateSelect.vue        # 调试模板选择
│   ├── PrintSettings.vue         # 打印参数（超时 / MTU / 分包 / 重试）
│   └── PrintTaskStatus.vue       # 打印进度与状态
│
├── debugPage/                    # 调试界面
│   ├── index.vue                 # 调试页（完整连接 + 试打闭环）
│   └── template/                 # 调试专用模板（按品牌）
│       ├── CC3/template5.js      # 芝柯 / K319 试打
│       └── HM/template8.js       # 汉印试打
│
├── help/                         # 帮助与教程
│   └── index.js                  # 底部提示、信号常识、权限文案
│
├── sdk/                          # 指令协议 SDK（底层能力）
│   ├── CC3/                      # 芝柯 / K319：GBK 编码工具
│   └── HM/                       # 汉印：CPCL / TSPL / ZPL / ESC Helper
│
└── template/                     # 业务打印模板（版式组装）
    ├── CC3/                      # 芝柯业务模板（自 newPrint + Common 深度抽取）
    │   ├── index.js              # 导出入口
    │   ├── selectTemplate.js     # O097/O098/zoneId 模板路由
    │   ├── logo.js               # Logo EG 位图
    │   ├── labelTemplate.js      # 德坤普通标签 O098=0
    │   ├── hyLabelTemplate.js    # 浩运标签 O098=1
    │   ├── jcLabelTemplate.js    # 军城旧标签（保留）
    │   ├── zoneIdLabelTemplate.js# 深圳战区 zoneId=23
    │   ├── peiJunLabelTemplate.js# 配军标签 O098=2
    │   ├── waybillTemplate.js    # 普通运单 O097=0
    │   ├── multiWaybillTemplate.js # 多联运单
    │   ├── peiJunTemplate.js     # 配军运单/回单 O097=2
    │   └── receiptTemplate.js    # 德坤/浩运回单
    └── HM/                       # 汉印业务模板

mock/                             # 业务页接口假数据（本地联调）
├── api.js                        # getListParamValue / queryTrack / faceOrder / receipt
└── data/                         # 各接口响应样例
```

> **目录约定**：`sdk/`、`template/`、`debugPage/template/` 统一按「品牌」组织（`CC3`、`HM`）。  
> 机型示意图走远程 URL（见 `config.js` → `SUPPORTED_PRINTER_MODELS.image`），不再本地存放 `help/images/`。

## 页面

| 页面 | 路由 | 标题 | 职责 |
|------|------|------|------|
| 主页面 | `pages/print/index` | 蓝牙打印 | 展示连接态、配置标签/运单/回单打印参数 |
| 调试页 | `pages/print/debugPage/index` | 蓝牙调试界面 | 搜索连接、品牌绑定、模板试打、打印参数调优 |

## 分层职责

| 层级 | 目录 | 做什么 |
|------|------|--------|
| 页面 | `index.vue`、`debugPage/` | UI 与交互，不直接操作 BLE API |
| 核心 | `ble/` | 适配器生命周期、连接、历史、打印队列与进度 |
| 指令 | `sdk/` | 协议指令生成（文本 / 条码 / 图片 / 走纸等） |
| 版式 | `template/` | 业务数据 → 调用 SDK 拼出完整打印内容 |
| 调试模板 | `debugPage/template/` | 调试试打版式，结构与品牌目录对齐 |
| 组件 | `components/` | 设备列表、连接状态、打印设置、任务进度等 UI |
| 工具 | `comm/utils.js` | `isNotEmptyArr` / `convertNumber` / `showMsg` / `showModal` / `sleep` |
| 帮助 | `help/` | 权限说明、配对提示、信号强度常识 |

## 核心需求（ble）

**适配器 `bleBlueTooth.js`**

- BLE 打印机适配；多设备连接与消息订阅；连接历史（快速重连）
- 搜索：单次搜索 / 持续扫描 / 扫码加入 / 清空结果
- 打印任务：转码 → 分包传输 → 队列 → 超时中断 → 取消 → 递归重试（可开关）
- 按平台默认配置（iOS / 安卓 / 鸿蒙）协商 MTU、分包间隔、重试策略
- 单任务 / 全量进度监听、完成监听

**配置 `config.js`**

- `ERROR_CODE`：含微信隐私协议相关 errno（如 `103` / `104` / `112`）
- `BLUETOOTH_MODULE_STATE`：`notStarted` | `starting` | `started`
- `BLUETOOTH_MODULE_SEARCH_STATE`：`notSearched` | `searching` | `searched`
- `SUPPORTED_PRINTER_MODELS`：机型 → 品牌 / 协议 / 示意图
- 设备名前缀：`CPCL_DEVICE_NAME_PREFIXES`（汉印）、`GBK_DEVICE_NAME_PREFIXES`（芝柯 / K319）
- 本地存储键：历史设备、系统打印配置、未识别设备品牌绑定
- 辅助方法：`resolvePrinterBrandInfo`、`saveDeviceBrandBinding`、`getPlatformDefaultConfigByOs`、`tipBluetoothError` 等

**入口 `index.js`**

| API | 用途 |
|-----|------|
| `getBluetoothAdapter()` | 全局唯一适配器（业务页推荐） |
| `getBluetoothPrintModule()` | 模块包装（含 `.adapter`） |
| `createBluetoothAdapter()` | 新建独立实例（调试页按生命周期创建 / 销毁） |

## 数据流

```
业务页 / 调试页
    │  触发连接 / 打印
    ▼
ble/index.js
    ├── getBluetoothAdapter()      业务页单例
    └── createBluetoothAdapter()   调试页独立实例
            │
            ▼
        bleBlueTooth.js     连接 · 订阅 · 历史 · 队列 · 传输 · 进度
            │
            ▼
        template/ 或 debugPage/template/    按品牌选版式
            │
            ▼
          sdk/CC3 | sdk/HM                 生成 CPCL（等）指令字节
            │
            ▼
        BLE 特征值写入 → 打印机出纸
```

## 开发约定

1. 业务页只通过 `getBluetoothAdapter()` 拿适配器；调试页用 `createBluetoothAdapter()` 并在卸载时销毁，禁止页面内多次 `openBluetoothAdapter`。
2. 页面只管触发与展示；连接与打印任务都写在 `bleBlueTooth.js`。
3. 错误码、机型表、存储键、平台默认配置只维护在 `config.js`。
4. 底层指令进 `sdk/`，业务版式进 `template/`，调试试打进 `debugPage/template/`，三者按品牌目录对齐。
5. 新增机型：在 `SUPPORTED_PRINTER_MODELS` 登记；必要时扩展设备名前缀；在 `sdk` / `template`（及调试模板）下按品牌补齐，并配置示意图 URL。
6. 名称无法识别的设备，通过 `BindPrinterBrandPopup` 手动绑定品牌（写入 `STORAGE_DEVICE_BRAND_BIND_KEY`），再按绑定结果选模板与编码。
