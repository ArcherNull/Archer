# exceljs-demo

基于 **Bun + Elysia** 的多级表头 Excel 导出演示项目。前端用 **Vue 3 + Tabulator（CDN）** 展示「新能源车辆财务报表」假数据，支持**前端导出**与**后端导出**两种方式，核心导出能力封装在 `excel/`（ExcelJS）。

---

## 功能概览

- 四级多级表头 + 约 100 叶列 + 大量明细行 + 合计行
- Tabulator 表格展示、筛选、序号列冻结
- **前端导出**：浏览器内调用 `exportExcelFile` 生成 xlsx
- **后端导出**：`GET /excel` 返回文件流
- 共用行列样式（逾期整行高亮、结算状态着色、负值标红、低额标黄、合计行样式等）

---

## 环境要求

| 项 | 说明 |
| --- | --- |
| 运行时 | [Bun](https://bun.sh/) ≥ 1.1（推荐最新） |
| 语言 | TypeScript（由 Bun 直接执行，无需先编译） |
| Node | 不强制；本项目以 Bun 为主 |
| 浏览器 | 现代浏览器；需能访问 jsDelivr CDN（Vue / Tabulator） |

主要依赖：`elysia`、`exceljs`、`file-saver`、`lodash-es`、`dayjs`。

---

## 启动方式

```bash
cd exceljs-demo
bun install
bun run dev
# 或
bun run start
# 或
bun run index.ts
```

启动后控制台会提示服务地址，默认：

- 页面：http://localhost:6984  
- 端口在 `index.ts` 的 `PORT` 中配置（当前为 `6984`）

首次启动会用 `Bun.build` 将 `frontend/main.ts` 打包到 `.cache/`；访问 `/frontend/main.js` 时也会重新打包，便于开发时改前端即生效。

---

## 接口说明

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/` | 前端页面（`index.html`） |
| `GET` | `/frontend/main.js` | 前端入口打包产物（开发时按需重建） |
| `GET` | `/frontend/:name` | 前端 chunk 等静态资源（来自 `.cache/`） |
| `GET` | `/mock` | 报表假数据：`mapping` / `columns` / `rows` / `summaryRow` 等 |
| `GET` | `/excel` | 后端导出 xlsx 文件流（`Content-Disposition` 附件下载） |

页面按钮：

- **刷新数据** → 请求 `/mock` 并渲染表格  
- **前端导出 Excel** → 浏览器端生成并下载  
- **后端导出 Excel** → 请求 `/excel` 下载  

---

## 项目架构

```
浏览器                         Bun 服务 (Elysia)
┌─────────────────────┐       ┌──────────────────────────────────┐
│ index.html          │       │ index.ts                         │
│  Vue3 + Tabulator   │◄─────►│  GET /  /mock  /excel  /frontend/*│
│  (CDN)              │       │                                  │
│                     │       │ 启动时 / 请求时 Bun.build 前端    │
│ frontend/main.ts    │       │           ↓                      │
│  · 拉 /mock 渲染表  │       │        .cache/main.js            │
│  · 前端导出(动态import exceljs)                                │
│  · 后端导出 fetch /excel                                       │
└─────────────────────┘       └──────────────────────────────────┘
         │                                    │
         └──────────────┬─────────────────────┘
                        ▼
              excel/  （ExcelJS 封装）
              · exportExcelWorkbook / exportExcelFile
              · 多级表头矩阵、行列样式、numFmt 等
                        ▲
                        │
              mock/nevFinance.ts
              · 假数据 + getNevExcelSheetStyleOptions（前后端共用样式）
```

**导出链路**

1. **前端导出**：`frontend/hooks/useExportMultipleHeaderExcel` → `excel/export.ts` → `excel/index.ts`  
2. **后端导出**：`exportNevFinanceExcelBuffer()`（`index.ts`）→ `exportExcelWorkbook` → 返回 `ArrayBuffer`  

行列样式统一由 `mock/nevFinance.ts` 的 `getNevExcelSheetStyleOptions()` 提供，前后端传入同一套 `rowStyle` / `columnStyle` / `columnNumFmts`。

---

## 目录结构

```
exceljs-demo/
├── index.ts                 # Elysia 入口：静态页、/mock、/excel、前端打包托管
├── index.html               # 页面壳：CDN 引入 Vue / Tabulator，挂载 #app
├── package.json
├── tsconfig.json
├── bun.lock
├── readMe.md                # 本说明
│
├── frontend/                # 前端业务（由 Bun.build 打进 .cache）
│   ├── main.ts              # Vue 应用：表格、样式增强、前后端导出按钮
│   └── hooks/
│       ├── constants.ts     # 序号列字段名等常量
│       └── useExportMultipleHeaderExcel.ts  # 多级表头前端导出 hook
│
├── mock/
│   └── nevFinance.ts        # 新能源财务报表假数据 + 共用导出样式配置
│
├── excel/                   # Excel 导出能力封装（勿与业务入口强耦合）
│   ├── index.ts             # Workbook 构建、多级表头、行列样式、runDemo
│   ├── export.ts            # 浏览器端 exportExcelFile（file-saver）
│   ├── headerMatrix.ts      # mapping → 表头二维矩阵 / 合并区
│   ├── comm.ts              # 默认 sheet 选项合并、日期序列等工具
│   ├── colorMap.ts          # 行底色色板
│   └── readMe.md            # Excel numFmt 格式参考
│
└── .cache/                  # Bun.build 产物（main.js / chunk-*.js），可忽略提交
```

---

## 假数据与样式约定（简要）

- 叶字段：`t_*` 文本，`n_*` 数值；另有序号列 `__serialNumber__`  
- 示意样式字段（见 `MOCK_STYLE_FIELDS`）：  
  - `t_015` 结算状态（逾期整行浅红 / 已结算单元格绿）  
  - `n_*` 负值红字；`n_021` 低于阈值黄底  
  - 合计行浅黄底 + 加粗  
- 数值列默认 `numFmt`：`"¥"#,##0.00`（详见 `excel/readMe.md`）

---

## 开发提示

- 改 `frontend/` 后刷新页面即可（`/frontend/main.js` 会触发重新打包）  
- 改 `excel/` 或 `mock/` 后需重启 `bun run index.ts`（后端进程内加载）  
- 大数据量导出（数千行 × 百列）耗时与内存占用较高，属 ExcelJS 按单元格写样式的正常表现  
- `excel/` 为可复用封装；业务组装（端口、路由、假数据接入）放在 `index.ts` / `frontend/` / `mock/`  

---

## 脚本一览

| 命令 | 作用 |
| --- | --- |
| `bun install` | 安装依赖 |
| `bun run dev` / `bun run start` | 启动 Elysia 服务 |
