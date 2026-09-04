# 蓝牙打印模块（print）

基于 uni-app 的 BLE 蓝牙打印能力：设备连接、任务调度、指令 SDK、业务模板、调试页与操作指引。

## 项目结构

```
pages/print/
├── index.vue                     # 蓝牙打印主页面
├── readMe.md                     # 本说明文档
│
├── ble/                          # 蓝牙核心（连接 + 任务）
│   ├── index.js                  # 入口：全局唯一适配器实例
│   ├── bleBlueTooth.js           # BLE 适配器（连接 / 订阅 / 历史 / 打印任务）
│   └── config.js                 # 错误码、模块状态、搜索状态
│
├── comm/                         # 公共工具
│   └── utils.js                  # Toast、模态框、延时等
├── components/                   # 可复用 UI 组件
│
├── debugPage/                    # 调试界面
│   ├── index.vue                 # 调试页
│   └── template/                 # 调试专用模板（结构同 template/）
│       ├── {CC3,HM}/             # 按机型
│       └── tspl/
│
├── help/                         # 帮助与教程
│   ├── index.js                  # 操作说明文案
│   └── images/                   # 机型示意图
│       ├── CC3.png
│       ├── HM-A300.png
│       ├── HM-A300L.png
│       └── K319.png
│
├── sdk/                          # 指令协议 SDK（底层能力）
│   ├── {CC3,HM}/                 # 按机型（CPCL）
│   └── tspl/                     # TSPL 协议
│
└── template/                     # 业务打印模板（版式组装）
    ├── {CC3,HM}/                 # 按机型（CPCL）
    └── tspl/
```

> **目录约定**：`sdk/`、`template/`、`debugPage/template/` 统一按「机型」组织（CPCL 机型直接落在根下；TSPL 保留 `tspl/`）。  
> 机型示例：`CC3`、`HM`。

## 页面

| 页面 | 路由 | 标题 | 职责 |
|------|------|------|------|
| 主页面 | `pages/print/index` | 蓝牙打印 | 连接设备、发起打印 |
| 调试页 | `pages/print/debugPage/index` | 蓝牙调试界面 | 通信调试、指令试打 |

## 分层职责

| 层级 | 目录 | 做什么 |
|------|------|--------|
| 页面 | `index.vue`、`debugPage/` | UI 与交互，不直接操作 BLE API |
| 核心 | `ble/` | 单例适配器、连接生命周期、打印任务队列 |
| 指令 | `sdk/` | 协议指令生成（文本/条码/图片/走纸等） |
| 版式 | `template/` | 业务数据 → 调用 SDK 拼出完整打印内容 |
| 组件 | `components/` | 设备列表、连接状态、任务进度等 UI |
| 工具 | `comm/utils.js` | `isNotEmptyArr` / `convertNumber` / `showMsg` / `showModal` / `sleep` |
| 帮助 | `help/` | 权限说明、配对教程、机型图片 |

## 核心需求（ble）

**适配器 `bleBlueTooth.js`**

- BLE 打印机适配；多设备连接与消息订阅；连接历史（快速重连）
- 打印任务：转码 → 传输 → 队列 → 重试 → 取消
- 单任务 / 全量进度监听、完成监听

**配置 `config.js`**

- `ERROR_CODE`：含微信隐私协议相关 errno
- `BLUETOOTH_MODULE_STATE`：`notStarted` | `starting` | `started`
- `BLUETOOTH_MODULE_SEARCH_STATE`：`notSearched` | `searching` | `searched`

**入口 `index.js`**

- 全局仅一个蓝牙适配器实例（单例）

## 数据流

```
业务页 / 调试页
    │  触发打印 / 连接
    ▼
ble/index.js（单例）
    └── bleBlueTooth.js     连接 · 订阅 · 历史 · 队列 · 传输 · 进度
            │
            ▼
        template/           业务模板选协议/机型
            │
            ▼
          sdk/              生成 CPCL / TSPL 指令字节
            │
            ▼
        BLE 特征值写入 → 打印机出纸
```

## 开发约定

1. 只通过 `ble/index.js` 拿适配器，禁止页面内多次 `openBluetoothAdapter`。
2. 页面只管触发与展示；连接与打印任务都写在 `bleBlueTooth.js`。
3. 错误码 / 状态常量只维护在 `config.js`。
4. 底层指令进 `sdk/`，业务版式进 `template/`，调试试打进 `debugPage/template/`，三者目录结构保持一致。
5. 新增机型：在 `sdk`、`template`（及调试模板）下按同一机型目录各加一份，并在 `help/images/` 补机型图。
