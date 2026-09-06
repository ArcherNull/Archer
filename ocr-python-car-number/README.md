# 车牌识别（HyperLPR3 + uv）

基于 [HyperLPR3](https://github.com/szad670401/HyperLPR) 的中文车牌识别 Web 服务，使用 `uv` 管理依赖，提供简单前端上传界面。

## 环境要求

- Python 3.12（项目已通过 `.python-version` 固定）
- [uv](https://github.com/astral-sh/uv)

## 安装

```bash
uv sync
```

首次导入 HyperLPR3 时会自动下载模型到用户目录 `~/.hyperlpr3`。

## 启动

```bash
uv run python main.py
```

浏览器打开：<http://127.0.0.1:8000>

## 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 前端页面 |
| GET | `/api/health` | 健康检查 |
| POST | `/api/recognize` | 上传图片识别车牌（`multipart/form-data`，字段名 `file`） |

## 项目结构

```text
.
├── index.html      # 前端界面
├── main.py         # FastAPI 后端
├── pyproject.toml  # uv / 项目依赖
└── README.md
```


## 杀死进程
```bash
C:\Users\Administrator>netstat -ano | findstr :8000
  TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING       30656

C:\Users\Administrator>taskkill /PID 30656 /F
成功: 已终止 PID 为 30656 的进程。
```